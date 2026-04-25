import { supabase } from '../config/supabase';
import { SubmissionService } from './SubmissionService';
import { LoggerService } from './LoggerService';

export class PayoutService {
  /**
   * Aggregates payouts across all users to see who is eligible.
   * "Eligible" means Verified submissions that reach min_views.
   */
  static async getEligiblePayouts() {
    // We can fetch all unpaid submissions and run them through the summary logic
    const { data: submissions, error } = await supabase
      .from('submissions')
      .select(`
         *,
         campaigns (
            status,
            end_date,
            title,
            cpm_rate,
            min_views
         ),
         users (
            id,
            name,
            email,
            avatar_url
         )
      `)
      .neq('status', 'Paid')
      .neq('status', 'Rejected')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const userBuckets: Record<string, any> = {};

    const now = new Date();

    for (const sub of (submissions || [])) {
      const campaign = sub.campaigns;
      const user = Array.isArray(sub.users) ? sub.users[0] : sub.users;
      if (!user) continue;

      const minViews = campaign?.min_views || 0;
      const earnings = Number(sub.earnings || 0);
      const isPastDeadline = campaign?.end_date ? new Date(campaign.end_date) < now : false;
      const isCampaignEnded = campaign?.status === 'Completed' || isPastDeadline;

      // Logic: ONLY claimable if the campaign has ended or passed its deadline
      let isClaimable = false;
      if (isCampaignEnded && sub.status === 'Verified') {
          if (minViews > 0) {
              if (sub.views >= minViews) isClaimable = true;
          } else {
              isClaimable = true;
          }
      }

      if (isClaimable) {
          if (!userBuckets[user.id]) {
              userBuckets[user.id] = {
                  user,
                  totalClaimable: 0,
                  submissionIds: [],
                  campaigns: []
              };
          }
          userBuckets[user.id].totalClaimable += earnings;
          userBuckets[user.id].submissionIds.push(sub.id);
          if (campaign?.title && !userBuckets[user.id].campaigns.includes(campaign.title)) {
              userBuckets[user.id].campaigns.push(campaign.title);
          }
      }
    }

    return Object.values(userBuckets).filter(u => u.totalClaimable > 0);
  }

  /**
   * Processes a payout:
   * 1. Updates submissions status to 'Paid'
   * 2. Creates Audit Log in 'payouts' table
   */
  static async processPayout(userId: string, adminId: string, notes?: string) {
    // We use a Supabase RPC to handle the payout atomically (in a transaction)
    // This prevents race conditions where submissions could be updated but payout log fails,
    // or two admins trigger the same payout at the exact same time.
    const { data, error } = await supabase.rpc('process_user_payout', {
        p_user_id: userId,
        p_admin_id: adminId,
        p_notes: notes || ''
    });

    if (error) {
        console.error('[PayoutService] RPC Error:', error);
        throw new Error(error.message || "Failed to process payout via transaction.");
    }

    const payout = data;

    // Send Log to Discord (Background)
    try {
        const { data: adminUser } = await supabase.from('users').select('name').eq('id', adminId).single();
        const { data: targetUser } = await supabase.from('users').select('name').eq('id', userId).single();
        
        const adminName = adminUser?.name || 'Admin';
        const userName = targetUser?.name || 'User';

        await LoggerService.info(
            '💸 Payout Sent (Atomic)',
            `**Admin**: ${adminName}\n**Recipient**: ${userName}\n**Amount**: $${Number(payout.amount).toFixed(2)} USD\n**Submissions**: ${payout.submission_ids.length} clips`
        );
    } catch (e) {
        console.error('[PayoutService] Discord Log Failed:', e);
    }

    return payout;
  }

  static async getPayoutHistory(page: number = 1, limit: number = 20) {
      const offset = (page - 1) * limit;

      const { data, count, error } = await supabase
        .from('payouts')
        .select(`
            *,
            users:user_id (name, email, avatar_url),
            admin:admin_id (name)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) throw error;
      return { data: data || [], total: count || 0 };
  }
}
