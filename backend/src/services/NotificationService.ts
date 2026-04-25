import { supabase } from '../config/supabase';
import { DiscordBotService } from './DiscordBotService';
import { SubmissionService } from './SubmissionService';

export class NotificationService {
  /**
   * Notifies all participants of a campaign that it has concluded.
   */
  static async notifyCampaignCompletion(campaignId: string) {
    const guildId = process.env.DISCORD_GUILD_ID;

    try {
      // 1. Fetch campaign details
      const { data: campaign, error: campErr } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();
      
      if (campErr || !campaign) throw new Error("Campaign not found for notification");

      // 2. Create the Claim Category on Discord if Guild ID exists
      let categoryId: string | null = null;
      if (guildId) {
          try {
              const category = await DiscordBotService.createCategory(guildId, `Completed: ${campaign.title}`);
              categoryId = category.id;
          } catch (e) {
              console.error('[NotificationService] Failed to create category:', e);
          }
      }

      // 3. Fetch all participants and their discord IDs
      const { data: participants, error: partErr } = await supabase
        .from('campaign_participants')
        .select(`
          user_id,
          users (
            discord_id,
            name
          )
        `)
        .eq('campaign_id', campaignId);
      
      if (partErr || !participants) throw partErr;

      console.info(`[NotificationService] Processing completion for "${campaign.title}" (${participants.length} users).`);
      
      // 4. Batch processing to optimize speed while respecting rate limits
      const batchSize = 10;
      for (let i = 0; i < participants.length; i += batchSize) {
          const batch = participants.slice(i, i + batchSize);
          await Promise.all(batch.map(async (p) => {
              // @ts-ignore
              const userData = Array.isArray(p.users) ? p.users[0] : p.users;
              const discordId = userData?.discord_id;
              const userId = p.user_id;

              if (!discordId) return;

              try {
                  // 5. Get fresh summary for the user
                  const summary = await SubmissionService.getUserEarningsSummary(userId);
                  const mySub = summary.breakdown.find(s => s.campaignTitle === campaign.title);
                  
                  const hasMetGoal = mySub ? (mySub.earningCategory === 'claimable' || mySub.earningCategory === 'claimed') : false;
                  const clipEarning = mySub ? Number(mySub.earnings).toFixed(2) : '0.00';
                  const totalClaimable = Number(summary.claimableBalance).toFixed(2);

                  // 6. Send Direct Message (Original Flow)
                  let message = '';
                  let embed = null;

                  if (hasMetGoal) {
                      message = `Campaign Complete: **${campaign.title}**\n\nGreat work! The campaign has successfully concluded and we've verified your participation. \n\nYour final earnings for this clip come to **$${clipEarning}**. We've updated your total claimable balance to **$${totalClaimable}**.\n\nEverything is finalized and ready for withdrawal whenever you're set. Catch you in the next one! 🚀`;
                      embed = {
                          title: "Goal Achieved! 🎯",
                          description: `You've earned **$${clipEarning}** from the **${campaign.title}** campaign.`,
                          color: 0x10b981, // Emerald
                          fields: [
                              { name: "Total Claimable", value: `$${totalClaimable}`, inline: true }
                          ],
                          url: `${process.env.FRONTEND_URL}/submissions`
                      };

                      // 7. Create Private Claim Channel in Guild (New Flow)
                      if (guildId && categoryId) {
                          try {
                              const channelName = `${userData?.name || 'payout'}-${userId.slice(0, 4)}`.toLowerCase().replace(/\s+/g, '-');
                              const privateChannel = await DiscordBotService.createPrivateChannel(guildId, categoryId, discordId, channelName);
                              
                              const claimMsg = `Hello <@${discordId}>, you have a claimable balance of **$${clipEarning}** from participating in **${campaign.title}**.\n\nPlease provide your account details (Bank/Wallet) here so we can process your payout. 🏦`;
                              await DiscordBotService.sendMessage(privateChannel.id, claimMsg);
                          } catch (channelErr) {
                              console.error(`[NotificationService] Failed to create private channel for ${userId}:`, channelErr);
                          }
                      }
                  } else {
                      message = `Campaign Concluded: **${campaign.title}**\n\nJust a quick update that the campaign has ended. Unfortunately, this submission didn't quite reach the view target this time around. \n\nNo sweat though—we've got new campaigns dropping soon. Keep an eye on the dashboard for the next opportunity. 📈`;
                      embed = {
                          title: "Campaign Concluded",
                          description: `The campaign **${campaign.title}** has ended. You didn't hit the minimum view requirement this time.`,
                          color: 0xef4444, // Red
                          url: `${process.env.FRONTEND_URL}/submissions`
                      };
                  }

                  await DiscordBotService.sendDM(discordId, message, embed);
              } catch (e) {
                  console.error(`[NotificationService] Failed to notify user ${userId}:`, e);
              }
          }));
      }

    } catch (err) {
      console.error('[NotificationService] Global notification error:', err);
    }
  }
}
