import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { SubmissionService } from '../services/SubmissionService';
import { PayoutService } from '../services/PayoutService';
import { AuditService } from '../services/AuditService';
import { paginationSchema, updateRoleSchema, toggleBlockSchema, updateSubmissionStatusSchema, processPayoutSchema } from '../utils/validation';

export class AdminController {
  /**
   * GET /admin/users
   * Returns a list of all users with optional search query.
   */
  static async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, q } = paginationSchema.parse(req.query);
      const offset = (page - 1) * limit;

      let query = supabase
        .from('users')
        .select('id, email, name, avatar_url, role, discord_id, discord_verified, youtube_verified, instagram_verified, is_blocked, created_at', { count: 'exact' });
      
      if (q) {
        query = query.ilike('email', `%${q}%`).or(`name.ilike.%${q}%`);
      }

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      
      res.json({ 
        success: true, 
        data,
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /admin/users/:id
   * Returns detailed info for a single user.
   */
  static async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const campaignId = req.query.campaignId as string;

      const { data: user, error: userErr } = await supabase
        .from('users')
        .select('id, email, name, avatar_url, role, discord_id, discord_verified, youtube_verified, instagram_verified, instagram_handle, is_blocked')
        .eq('id', id)
        .single();
      
      if (userErr) throw userErr;

      let linkedHandle = null;
      if (campaignId) {
          const { data: participant } = await supabase
              .from('campaign_participants')
              .select('linked_handle')
              .eq('user_id', id)
              .eq('campaign_id', campaignId)
              .maybeSingle();
          linkedHandle = participant?.linked_handle;
      }

      res.json({ success: true, data: { ...user, linked_handle: linkedHandle } });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /admin/users/:id/block
   * Toggles the is_blocked flag for a user.
   */
  static async toggleBlock(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { block } = toggleBlockSchema.parse(req.body);
      const { error } = await supabase
        .from('users')
        .update({ is_blocked: block })
        .eq('id', id);
      if (error) throw error;

      // Log action
      await AuditService.log({
        actorId: (req as any).user?.id || 'system',
        actorRole: 'admin',
        action: block ? 'USER_BLOCKED' : 'USER_UNBLOCKED',
        targetId: id as string,
        targetType: 'user',
        metadata: { block },
        ip: req.ip
      });

      res.json({ success: true, message: `User ${block ? 'blocked' : 'unblocked'}` });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /admin/users/:id/role
   * Updates a user's role in both the database and auth metadata.
   */
  static async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { role } = updateRoleSchema.parse(req.body);

      // 1. Update public.users table
      const { error: dbError } = await supabase
        .from('users')
        .update({ role })
        .eq('id', id);
      
      if (dbError) throw dbError;

      // 2. Update Supabase Auth Metadata (Requires service role)
      const { error: authError } = await supabase.auth.admin.updateUserById(id as string, {
        user_metadata: { role }
      });

      if (authError) {
          console.warn('Auth metadata update failed (Missing Service Role Key?):', authError.message);
      }

      // Log action
      await AuditService.log({
        actorId: (req as any).user?.id || 'system',
        actorRole: 'admin',
        action: 'USER_ROLE_UPDATED',
        targetId: id as string,
        targetType: 'user',
        metadata: { newRole: role },
        ip: req.ip
      });

      res.json({ success: true, message: `User role updated to ${role}` });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /admin/submissions
   */
  static async getAllSubmissions(req: Request, res: Response, next: NextFunction) {
      try {
          const { page, limit } = paginationSchema.parse(req.query);
          const { data, total } = await SubmissionService.adminGetAllSubmissions(page, limit);
          res.json({ 
            success: true, 
            data,
            pagination: {
              page,
              limit,
              total,
              pages: Math.ceil(total / limit)
            }
          });
      } catch (error) {
          next(error);
      }
  }

  /**
   * PATCH /admin/submissions/:id/status
   */
  static async updateSubmissionStatus(req: Request, res: Response, next: NextFunction) {
      try {
          const { id } = req.params;
          const { status, rejectionReason } = updateSubmissionStatusSchema.parse(req.body);
          const data = await SubmissionService.adminUpdateStatus(id as string, status, rejectionReason);
          
          // Log action
          await AuditService.log({
            actorId: (req as any).user?.id || 'system',
            actorRole: 'admin',
            action: 'SUBMISSION_STATUS_UPDATED',
            targetId: id as string,
            targetType: 'submission',
            metadata: { status, rejectionReason },
            ip: req.ip
          });

          res.json({ success: true, data });
      } catch (error) {
          next(error);
      }
  }

  static async getDashboardStats(req: Request, res: Response, next: NextFunction) {
      try {
          // 1. Basic Counts
          const { count: activeCampaigns } = await supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('status', 'Active');
          const { data: campaignFinancials } = await supabase.from('campaigns').select('total_budget, budget_used');
          
          const totalBudget = (campaignFinancials || []).reduce((acc, c) => acc + Number(c.total_budget), 0);
          const totalSpent = (campaignFinancials || []).reduce((acc, c) => acc + Number(c.budget_used), 0);

          // 2. Pending & Verified
          const { data: verifiedSubmissions } = await supabase.from('submissions').select('earnings').eq('status', 'Verified');
          const pendingPayout = (verifiedSubmissions || []).reduce((acc, s) => acc + Number(s.earnings), 0);

          // 3. Burn Rate (Last 7 Days)
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          
          const { data: burnRaw } = await supabase
              .from('submissions')
              .select('earnings, created_at')
              .gte('created_at', sevenDaysAgo.toISOString())
              .not('status', 'eq', 'Rejected');

          const burnData: Record<string, number> = {};
          for (let i = 0; i < 7; i++) {
              const d = new Date();
              d.setDate(d.getDate() - i);
              burnData[d.toISOString().split('T')[0]] = 0;
          }

          (burnRaw || []).forEach(s => {
              const day = s.created_at.split('T')[0];
              if (burnData[day] !== undefined) {
                  burnData[day] += Number(s.earnings || 0);
              }
          });

          const burnChart = Object.entries(burnData)
              .map(([name, burn]) => ({ name: new Date(name).toLocaleDateString('en-US', { weekday: 'short' }), burn: Number(burn.toFixed(2)) }))
              .reverse();

          // 4. Top Clippers
          const { data: topRaw } = await supabase
              .from('submissions')
              .select('earnings, views, user_id, users!inner(name, avatar_url)')
              .not('status', 'eq', 'Rejected');

          const usersMap: Record<string, any> = {};
          (topRaw || []).forEach(s => {
              const uid = s.user_id;
              if (!usersMap[uid]) {
                  const userData = Array.isArray(s.users) ? s.users[0] : s.users;
                  usersMap[uid] = { 
                      name: userData?.name || 'Anonymous', 
                      avatar_url: userData?.avatar_url,
                      views: 0, 
                      earnings: 0 
                  };
              }
              usersMap[uid].views += s.views;
              usersMap[uid].earnings += Number(s.earnings);
          });

          const topClippers = Object.values(usersMap)
              .map((u: any) => ({ ...u, earnings: Number(u.earnings.toFixed(2)) }))
              .sort((a: any, b: any) => b.earnings - a.earnings)
              .slice(0, 5);

          res.json({
              success: true,
              data: {
                  kpis: [
                      { label: 'Active Campaigns', value: activeCampaigns?.toString() || '0', change: '+1', icon: 'Target' },
                      { label: 'Total Budget', value: `$${totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: '+$2k', icon: 'Landmark' },
                      { label: 'Pending Payouts', value: `$${pendingPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: '+$400', icon: 'Users' },
                      { label: 'Platform Throughput', value: `${totalBudget > 0 ? ((totalSpent / totalBudget)*100).toFixed(2) : 0}%`, change: '0%', icon: 'TrendingUp' }
                  ],
                  burnChart,
                  topClippers
              }
          });
      } catch (error) {
          next(error);
      }
  }
  
  static async getUserEarnings(req: Request, res: Response, next: NextFunction) {
      try {
          const { id } = req.params;
          const data = await SubmissionService.getUserEarningsSummary(id as string);
          res.json({ success: true, data });
      } catch (error) {
          next(error);
      }
  }

  /**
   * Payout Management Endpoints
   */
  static async getEligiblePayouts(req: Request, res: Response, next: NextFunction) {
      try {
          const data = await PayoutService.getEligiblePayouts();
          res.json({ success: true, data });
      } catch (error) {
          next(error);
      }
  }

  static async processPayout(req: Request, res: Response, next: NextFunction) {
      try {
          const { userId, notes } = processPayoutSchema.parse(req.body);
          const adminId = (req as any).user?.id; // From authMiddleware
          const data = await PayoutService.processPayout(userId, adminId, notes);
          
          // Log action
          await AuditService.log({
            actorId: adminId,
            actorRole: 'admin',
            action: 'PAYOUT_PROCESSED',
            targetId: userId,
            targetType: 'user',
            metadata: { amount: data?.amount, submissionIds: data?.submission_ids, notes },
            ip: req.ip
          });

          res.json({ success: true, data });
      } catch (error) {
          next(error);
      }
  }

  static async getPayoutHistory(req: Request, res: Response, next: NextFunction) {
      try {
          const { page, limit } = paginationSchema.parse(req.query);
          const { data, total } = await PayoutService.getPayoutHistory(page, limit);
          res.json({ 
            success: true, 
            data,
            pagination: {
              page,
              limit,
              total,
              pages: Math.ceil(total / limit)
            }
          });
      } catch (error) {
          next(error);
      }
  }

  /**
   * DELETE /admin/users/:id
   * Permanently deletes a user from the database and auth.
   */
  static async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // 1. Delete from public.users table (cascades should handle linked data)
      const { error: dbError } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      
      if (dbError) throw dbError;

      // 2. Delete from Supabase Auth (Requires service role)
      const { error: authError } = await supabase.auth.admin.deleteUser(id as string);

      if (authError) {
          console.warn('Auth deletion failed (Missing Service Role Key?):', authError.message);
      }

      // Log action
      await AuditService.log({
        actorId: (req as any).user?.id || 'system',
        actorRole: 'admin',
        action: 'USER_DELETED',
        targetId: id as string,
        targetType: 'user',
        metadata: { deletedAt: new Date().toISOString() },
        ip: req.ip
      });

      res.json({ success: true, message: 'User permanently deleted' });
    } catch (error) {
      next(error);
    }
  }
}
