import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { SubmissionService } from '../services/SubmissionService';

export class AdminController {
  /**
   * GET /admin/users
   * Returns a list of all users with optional search query.
   */
  static async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.query as { q?: string };
      let query = supabase.from('users').select('id, email, name, avatar_url, role, discord_id, discord_verified, youtube_verified, instagram_verified, is_blocked');
      if (q) {
        query = query.ilike('email', `%${q}%`).or(`name.ilike.%${q}%`);
      }
      const { data, error } = await query;
      if (error) throw error;
      res.json({ success: true, data });
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
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      res.json({ success: true, data });
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
      const { block } = req.body as { block: boolean };
      const { error } = await supabase
        .from('users')
        .update({ is_blocked: block })
        .eq('id', id);
      if (error) throw error;
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
      const { role } = req.body as { role: 'admin' | 'user' };

      if (!['admin', 'user'].includes(role)) {
        return res.status(400).json({ success: false, error: 'Invalid role' });
      }

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
          const data = await SubmissionService.adminGetAllSubmissions();
          res.json({ success: true, data });
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
          const { status } = req.body as { status: string };
          const data = await SubmissionService.adminUpdateStatus(id as string, status);
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
              .map(([name, burn]) => ({ name: new Date(name).toLocaleDateString('en-US', { weekday: 'short' }), burn }))
              .reverse();

          // 4. Top Clippers
          const { data: topRaw } = await supabase
              .from('submissions')
              .select('earnings, views, user_id, users(name, avatar_url)')
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
              .sort((a: any, b: any) => b.earnings - a.earnings)
              .slice(0, 5);

          res.json({
              success: true,
              data: {
                  kpis: [
                      { label: 'Active Campaigns', value: activeCampaigns?.toString() || '0', change: '+1', icon: 'Target' },
                      { label: 'Total Budget', value: `$${(totalBudget/1000).toFixed(1)}k`, change: '+$2k', icon: 'Landmark' },
                      { label: 'Pending Payouts', value: `$${pendingPayout.toLocaleString()}`, change: '+$400', icon: 'Users' },
                      { label: 'Platform Throughput', value: `${totalBudget > 0 ? ((totalSpent / totalBudget)*100).toFixed(1) : 0}%`, change: '0%', icon: 'TrendingUp' }
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
}
