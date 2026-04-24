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
    // 1. Get current claimable to be sure of the amount
    const eligible = await this.getEligiblePayouts();
    const userPayout = eligible.find(u => u.user.id === userId);

    if (!userPayout) throw new Error("This user has no claimable balance at this time.");

    const { totalClaimable, submissionIds } = userPayout;

    // 2. Perform updates in a batch (Submissions -> Paid)
    const { error: updateError } = await supabase
        .from('submissions')
        .update({ status: 'Paid', updated_at: new Date().toISOString() })
        .in('id', submissionIds);
    
    if (updateError) throw updateError;

    // 3. Create Audit Record
    const { data: payout, error: auditError } = await supabase
        .from('payouts')
        .insert({
            user_id: userId,
            admin_id: adminId,
            amount: totalClaimable,
            submission_ids: submissionIds,
            notes
        })
        .select()
        .single();
    
    if (auditError) console.error('Audit Log Injection Failed:', auditError);

    // 4. Send Log to Discord
    try {
        const { data: adminUser } = await supabase.from('users').select('name').eq('id', adminId).single();
        const adminName = adminUser?.name || 'Admin';
        const userName = userPayout.user.name || 'User';

        await LoggerService.info(
            '💸 Payout Sent',
            `**Admin**: ${adminName}\n**Recipient**: ${userName}\n**Amount**: $${totalClaimable.toFixed(2)} USD\n**Submissions**: ${submissionIds.length} clips`
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
