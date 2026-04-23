import { supabase } from '../config/supabase';
import { z } from 'zod';
import { CampaignService } from './CampaignService';

const createSubmissionSchema = z.object({
  campaign_id: z.string().uuid(),
  url: z.string().url(),
  platform: z.enum(['youtube', 'instagram', 'tiktok']),
});

export class SubmissionService {
  /**
   * Fetches the live view count for a supported platform. 
   */
  static async fetchLiveViews(url: string, platform: string): Promise<{views: number, channelId: string | null}> {
    const apifyToken = process.env.APIFY_TOKEN;

    if (platform === 'youtube') {
      try {
        const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
        const videoId = match ? match[1] : null;
        console.log(`[SubmissionService] YouTube VideoID match: ${videoId}`);
        
        if (videoId && process.env.YOUTUBE_API_KEY) {
          const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`);
          const json = await res.json();
          console.log(`[SubmissionService] YouTube API Response:`, JSON.stringify(json));
          
          if (json.items && json.items.length > 0) {
            const views = parseInt(json.items[0].statistics.viewCount, 10);
            const channelId = json.items[0].snippet.channelId;
            console.log(`[SubmissionService] Fetched YouTube Views: ${views}, ChannelID: ${channelId}`);
            return { views, channelId };
          } else {
            console.warn(`[SubmissionService] YouTube video not found or no stats returned.`);
          }
        }
      } catch (err) {
        console.error('YouTube API Error:', err);
      }
    } else if (platform === 'instagram') {
      // PRO METHOD: Apify (Most reliable)
      if (apifyToken) {
          console.log(`[SubmissionService] Using Apify for Instagram Reel: ${url}`);
          try {
              const apifyRes = await fetch(`https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=${apifyToken}`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                      directUrls: [url],
                      resultsLimit: 1,
                      proxy: { useApifyProxy: true }
                  })
              });
              if (apifyRes.ok) {
                  const items = await apifyRes.json();
                  console.log(`[SubmissionService] Apify Instagram Items:`, JSON.stringify(items));
                  if (items && items.length > 0) {
                      const post = items[0];
                      const views = post.videoPlayCount || post.videoViewCount || 0;
                      const channelId = post.ownerUsername ? `@${post.ownerUsername.toLowerCase()}` : null;
                      console.log(`[SubmissionService] Fetched Instagram Views: ${views}, Owner: ${channelId}`);
                      return { views, channelId };
                  }
              }
          } catch (e) {
              console.error('[SubmissionService] Apify failed:', e);
          }
      }

      // FALLBACK: Manual Scrape (Less reliable)
      try {
        const match = url.match(/(?:\/p\/|\/reels?\/|\/tv\/)([^/?#&]+)/i);
        const shortcode = match ? match[1] : null;

        if (shortcode) {
           const proxyUrl = process.env.DISCORD_PROXY_URL;
           const targetUrl = proxyUrl 
             ? `${proxyUrl}?url=${encodeURIComponent(`https://www.instagram.com/reels/${shortcode}/`)}`
             : `https://www.instagram.com/reels/${shortcode}/`;

           const res = await fetch(targetUrl, {
             headers: {
               'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
               'Accept-Language': 'en-US,en;q=0.9',
               'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
             }
           });

            if (res.ok) {
              const html = await res.text();
              const ogDescMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i);
              const ogTitleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i);
              
              let viewsNum = 0;
              let ownerHandle = null;

              if (ogDescMatch) {
                 const desc = ogDescMatch[1];
                 const viewMatch = desc.match(/([\d,.]+[KMB]?) views/i);
                 if (viewMatch) {
                     let viewStr = viewMatch[1].replace(/,/g, '');
                     if (viewStr.endsWith('K')) viewsNum = parseFloat(viewStr) * 1000;
                     else if (viewStr.endsWith('M')) viewsNum = parseFloat(viewStr) * 1000000;
                     else if (viewStr.endsWith('B')) viewsNum = parseFloat(viewStr) * 1000000000;
                     else viewsNum = parseInt(viewStr, 10);
                 }
              }

              if (ogTitleMatch) {
                 const title = ogTitleMatch[1];
                 const ownerMatch = title.match(/^([^ ]+) on Instagram/i) || title.match(/^([^ ]+) (@[^)]+) posted on Instagram/i);
                 if (ownerMatch) {
                    ownerHandle = `@${ownerMatch[1].replace(/^@/, '')}`.toLowerCase();
                 }
              }

              return { views: viewsNum, channelId: ownerHandle };
            }
        }
      } catch (err) {
        console.error('[SubmissionService] Instagram fallback failed:', err);
      }
    } else if (platform === 'tiktok') {
      if (apifyToken) {
          console.log(`[SubmissionService] Using Apify for TikTok: ${url}`);
          try {
              const apifyRes = await fetch(`https://api.apify.com/v2/acts/clockworks~tiktok-scraper/run-sync-get-dataset-items?token=${apifyToken}`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                      sources: [{ url }],
                      resultsPerPage: 1,
                      shouldDownloadVideo: false,
                      shouldDownloadCovers: false
                  })
              });
              if (apifyRes.ok) {
                  const items = await apifyRes.json();
                  if (items && items.length > 0) {
                      const post = items[0];
                      const views = post.playCount || post.videoViewCount || 0;
                      const channelId = post.authorMeta?.name ? `@${post.authorMeta.name.toLowerCase()}` : null;
                      console.log(`[SubmissionService] Fetched TikTok Views: ${views}, Author: ${channelId}`);
                      return { views, channelId };
                  }
              }
          } catch (e) {
              console.error('[SubmissionService] Apify TikTok failed:', e);
          }
      }
    }
    return { views: 0, channelId: null };
  }

  static async create(userId: string, data: any) {
    const validated = createSubmissionSchema.parse(data);
    
    // 1. Fetch campaign and participation
    const { data: campaign, error: capErr } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', validated.campaign_id)
        .single();
    
    if (capErr || !campaign) throw new Error("Campaign not found");

    // 2. Check if user is joined
    const { data: participation } = await supabase
        .from('campaign_participants')
        .select('*')
        .eq('campaign_id', validated.campaign_id)
        .eq('user_id', userId)
        .single();
    
    if (!participation) {
        throw new Error("You must join this campaign before submitting clips.");
    }

    // 2.5 Check for duplicate URL (Global check)
    // Normalize URL to handle common variations (query params, short links)
    const normalizedUrl = validated.url.split('?')[0].split('#')[0].replace(/\/$/, '');
    
    const { data: existing } = await supabase
        .from('submissions')
        .select('id, campaign_id')
        .eq('url', normalizedUrl)
        .maybeSingle();

    if (existing) {
        throw new Error("This video has already been submitted to our platform.");
    }

    // 3. Check platform restrictions
    if (campaign.allowed_platforms && !campaign.allowed_platforms.includes(validated.platform)) {
        throw new Error(`This mission only allows: ${campaign.allowed_platforms.join(', ')}`);
    }

    // 4. Fetch live views and channel ID via external APIs
    const { views, channelId } = await this.fetchLiveViews(validated.url, validated.platform);
    
    // 5. Verify ownership
    const { data: userRaw, error: userErr } = await supabase
        .from('users')
        .select('name, email, instagram_handle, youtube_handle, youtube_channels')
        .eq('id', userId)
        .single();

    if (userErr) {
        console.error(`[SubmissionService] User fetch error:`, userErr);
        throw new Error("Failed to verify your account permissions. Please contact support.");
    }

    console.log(`[SubmissionService] Verifying submission for user: ${userRaw?.email} (${userId})`);
    console.log(`[SubmissionService] Platform: ${validated.platform}, Video ChannelID: ${channelId}`);

    if (validated.platform === 'youtube') {
        if (!channelId) throw new Error("Could not pull channel details for this video.");
        
        const existingChannels = userRaw?.youtube_channels || [];
        console.log(`[SubmissionService] User's Linked YT Channels:`, JSON.stringify(existingChannels));

        if (existingChannels.length === 0) throw new Error("Link a YouTube channel in Profile first.");
        
        const isOwner = existingChannels.some((c: any) => 
            String(c.channelId).toLowerCase() === String(channelId).toLowerCase() || 
            String(c.id).toLowerCase() === String(channelId).toLowerCase() || 
            String(c.handle).toLowerCase() === String(channelId).toLowerCase() ||
            String(c.handle).toLowerCase() === `@${String(channelId).toLowerCase()}`
        );

        if (!isOwner) {
            console.warn(`[SubmissionService] Ownership mismatch! Video: ${channelId}, Linked:`, existingChannels.map((c: any) => c.channelId || c.handle).join(', '));
            throw new Error("This video does not belong to your verified channels.");
        }
    } else if (validated.platform === 'instagram') {
        if (!channelId) throw new Error("Could not verify Instagram owner. Ensure the reel is public.");
        
        const verifiedHandle = userRaw?.instagram_handle || '';
        const cleanHandle = verifiedHandle.toLowerCase().replace(/^@/, '');
        const clipOwner = channelId.toLowerCase().replace(/^@/, '');

        console.log(`[SubmissionService] User's Linked IG Handle: ${cleanHandle}`);
        console.log(`[SubmissionService] Clip Owner: ${clipOwner}`);

        if (cleanHandle !== clipOwner) {
            console.warn(`[SubmissionService] IG Ownership mismatch! Reel: @${clipOwner}, Linked: @${cleanHandle}`);
            throw new Error(`This Reel belongs to @${clipOwner}, which is not linked to your profile.`);
        }
    }

    // 6. Calculate earnings based on current views (Only if Verified and min_views met)
    let earnings = 0;
    let contributingViews = 0;

    if (views >= (campaign.min_views || 0)) {
        earnings = (views / 1000) * campaign.cpm_rate;
        contributingViews = views;
        if (campaign.per_video_cap && earnings > campaign.per_video_cap) {
            earnings = campaign.per_video_cap;
        }
    }

    // 7. Final Insert
    const { data: submission, error } = await supabase
        .from('submissions')
        .insert({
            user_id: userId,
            campaign_id: validated.campaign_id,
            url: normalizedUrl, // Store normalized
            platform: validated.platform,
            views,
            earnings,
            status: 'Verified',
            updated_at: new Date().toISOString()
        })
        .select()
        .single();
    
    if (error) throw error;

    // 8. Update Campaign Stats
    await supabase.rpc('increment_campaign_stats', {
        camp_id: validated.campaign_id,
        earnings_add: earnings,
        views_add: contributingViews
    });

    // 8. Auto-complete mission if budget hit
    const { data: updatedCampaign } = await supabase
        .from('campaigns')
        .select('budget_used, total_budget')
        .eq('id', validated.campaign_id)
        .single();
    
    if (updatedCampaign && updatedCampaign.budget_used >= updatedCampaign.total_budget) {
        await CampaignService.updateStatus(validated.campaign_id, 'Completed');
    }

    return submission;
  }

  static async deleteSubmission(userId: string, submissionId: string) {
      // 1. Fetch submission to know what to deduct
      const { data: submission, error: subErr } = await supabase
          .from('submissions')
          .select('campaign_id, earnings, views, status')
          .eq('id', submissionId)
          .eq('user_id', userId)
          .single();
      
      if (subErr || !submission) throw new Error("Submission not found or unauthorized.");
      if (submission.status === 'Paid') throw new Error("Cannot delete a submission that has already been paid.");

      // 2. Delete from DB
      const { error: delErr } = await supabase
          .from('submissions')
          .delete()
          .eq('id', submissionId)
          .eq('user_id', userId);
      
      if (delErr) throw delErr;

      // 3. Deduct from Campaign Stats
      await supabase.rpc('increment_campaign_stats', {
          camp_id: submission.campaign_id,
          earnings_add: -Number(submission.earnings || 0),
          views_add: -Number(submission.views || 0)
      });

      return true;
  }

  static async refreshSubmission(userId: string, submissionId: string) {
      // 1. Fetch submission and its campaign details
      const { data: submission, error: subErr } = await supabase
          .from('submissions')
          .select('*, campaigns(*)')
          .eq('id', submissionId)
          .eq('user_id', userId)
          .single();
      
      if (subErr || !submission) {
          throw new Error("Submission not found or unauthorized.");
      }

      const campaign = submission.campaigns;
      if (!campaign) throw new Error("Campaign data missing.");

      // 2. Check 1-minute cooldown (for real-time feel)
      const lastUpdated = new Date(submission.updated_at).getTime();
      const now = Date.now();
      const diffMinutes = (now - lastUpdated) / (1000 * 60);

      if (diffMinutes < 1) {
          const remainingSeconds = Math.ceil((1 - diffMinutes) * 60);
          throw new Error(`Please wait ${remainingSeconds}s before refreshing again.`);
      }

      // 3. Fetch fresh views
      const { views } = await this.fetchLiveViews(submission.url, submission.platform);
      
       // 4. Recalculate earnings (Only if min_views met)
       let earnings = 0;
       let contributingViews = 0;

       if (views >= (campaign.min_views || 0)) {
           earnings = (views / 1000) * campaign.cpm_rate;
           contributingViews = views;
           if (campaign.per_video_cap && earnings > campaign.per_video_cap) {
               earnings = campaign.per_video_cap;
           }
       }

      // 5. Update DB
      const oldEarnings = Number(submission.earnings || 0);
      const oldViews = Number(submission.views || 0);

      const { data: updated, error: updateErr } = await supabase
          .from('submissions')
          .update({
              views,
              earnings,
              updated_at: new Date().toISOString()
          })
          .eq('id', submissionId)
          .select()
          .single();
      
      if (updateErr) throw updateErr;

       // 6. Sync budget delta (new - old)
       const deltaEarnings = earnings - oldEarnings;
       
       // Logic: If it previously met the requirement (oldEarnings > 0), it contributed its oldViews. 
       // If it just now hit the requirement, it contributes its total views.
       const deltaViews = contributingViews - (oldEarnings > 0 ? oldViews : 0);

       console.log(`[SubmissionService] Syncing Stats for Campaign ${submission.campaign_id}:`, {
           submissionId,
           views,
           min_views: campaign.min_views,
           oldEarnings,
           oldViews,
           contributingViews,
           deltaViews,
           deltaEarnings
       });

       await supabase.rpc('increment_campaign_stats', {
           camp_id: submission.campaign_id,
           earnings_add: deltaEarnings,
           views_add: Math.floor(deltaViews) // Ensure integer
       });

      // 7. Auto-complete mission if budget hit
      const { data: updatedCampaign } = await supabase
          .from('campaigns')
          .select('budget_used, total_budget')
          .eq('id', submission.campaign_id)
          .single();
      
      if (updatedCampaign && updatedCampaign.budget_used >= updatedCampaign.total_budget) {
          await CampaignService.updateStatus(submission.campaign_id, 'Completed');
      }

      return updated;
  }

  static async getUserSubmissions(userId: string, campaignId: string) {
    console.log(`[SubmissionService] Fetching submissions for User: ${userId}, Campaign: ${campaignId}`);
    const { data, error } = await supabase
      .from('submissions')
      .select(`
         *,
         campaigns (
            title,
            cpm_rate
         )
      `)
      .eq('user_id', userId)
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('[SubmissionService] Fetch error:', error);
      throw error;
    }
    console.log(`[SubmissionService] Found ${data?.length || 0} submissions.`);
    return data;
  }

  static async getAllUserSubmissions(userId: string) {
    const { data, error } = await supabase
      .from('submissions')
      .select(`
         *,
         campaigns (
            title,
            cpm_rate
         )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  }

  static async getCampaignLeaderboard(campaignId: string) {
    const { data, error } = await supabase
      .from('submissions')
      .select(`
         views,
         earnings,
         user_id,
         users (
            name,
            avatar_url
         )
      `)
      .eq('campaign_id', campaignId)
      
    if (error) throw error;
    
    const aggregated: Record<string, any> = {};
    for (const sub of data) {
        const uid = sub.user_id;
        if (!aggregated[uid]) {
            // @ts-ignore - Supabase join returns an object or array of objects in JS 
            const userData = Array.isArray(sub.users) ? sub.users[0] : sub.users;
            aggregated[uid] = {
               user_id: uid,
               name: userData?.name || 'Anonymous Clipper',
               avatar_url: userData?.avatar_url,
               views: 0,
               earnings: 0
            };
        }
        aggregated[uid].views += sub.views;
        aggregated[uid].earnings += Number(sub.earnings);
    }

    return Object.values(aggregated).sort((a: any, b: any) => b.views - a.views);
  }

  static async adminGetAllSubmissions() {
    const { data, error } = await supabase
      .from('submissions')
      .select(`
         *,
         campaigns (title, cpm_rate),
         users (name, avatar_url, email)
      `)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  }

  static async adminUpdateStatus(submissionId: string, status: string) {
    const { data, error } = await supabase
      .from('submissions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', submissionId)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }

  /**
   * Calculates a user's earnings breakdown:
   * - Available Balance: earnings where views < campaign min_views (still accumulating)
   * - Pending Payout: earnings where views >= min_views AND status != 'Paid' (ready to pay)
   * - Claimed: earnings where status == 'Paid'
   * - Total Earnings: sum of all
   */
  static async getUserEarningsSummary(userId: string) {
    const { data: submissions, error } = await supabase
      .from('submissions')
      .select(`
         *,
         campaigns (
            status,
            end_date,
            title,
            cpm_rate,
            min_views,
            per_video_cap
         )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Trigger background refresh for stale submissions (don't await)
    this.refreshStaleSubmissions(userId).catch(e => console.error('[SubmissionService] Background sync error:', e));

    let availableBalance = 0; // Accumulating
    let pendingPayout = 0;    // Goal Met (Active)
    let claimableBalance = 0; // Finalized / Ready
    let claimed = 0;          // Already Paid

    const breakdown: any[] = [];

    const now = new Date();

    for (const sub of (submissions || [])) {
      // @ts-ignore - Supabase join might return array or object
      const campaign = Array.isArray(sub.campaigns) ? sub.campaigns[0] : sub.campaigns;
      const minViews = campaign?.min_views || 0;
      const earnings = Number(sub.earnings || 0);
      const isPastDeadline = campaign?.end_date ? new Date(campaign.end_date) < now : false;
      const isCampaignEnded = campaign?.status === 'Completed' || isPastDeadline;

      let earningCategory = 'pending_verification'; 

      if (sub.status === 'Paid') {
        earningCategory = 'claimed';
        claimed += earnings;
      } else if (sub.status === 'Rejected') {
        earningCategory = 'rejected';
      } else if (sub.status === 'Pending') {
        earningCategory = 'pending_verification';
        // Potential earnings but not added to any balance yet
      } else if (isCampaignEnded) {
         // Mission Over - check if goal was met
         if (minViews > 0 && sub.views < minViews) {
            earningCategory = 'failed';
         } else {
            earningCategory = 'claimable';
            claimableBalance += earnings;
         }
      } else {
         // Mission Active - check if goal reached
         if (minViews > 0 && sub.views < minViews) {
            earningCategory = 'accumulating';
            availableBalance += earnings;
         } else {
            earningCategory = 'ready_to_claim_after_end'; // Goal Met but campaign active
            pendingPayout += earnings;
         }
      }

      breakdown.push({
        id: sub.id,
        url: sub.url,
        platform: sub.platform,
        views: sub.views,
        earnings: earningCategory === 'failed' ? 0 : earnings,
        status: sub.status,
        earningCategory,
        campaignTitle: campaign?.title || 'Unknown',
        campaignStatus: campaign?.status,
        minViews,
        created_at: sub.created_at,
        updated_at: sub.updated_at
      });
    }

    return {
      totalEarnings: availableBalance + pendingPayout + claimableBalance + claimed,
      availableBalance,
      pendingPayout,
      claimableBalance,
      claimed,
      breakdown
    };
  }

  static async refreshStaleSubmissions(userId: string) {
    // Platform-specific thresholds
    const THRESHOLD_IG_TT = 10; // 10 minutes for Instagram/TikTok
    const THRESHOLD_YT = 1;    // 1 minute for YouTube (it's free)

    const dateIgTt = new Date(Date.now() - THRESHOLD_IG_TT * 60 * 1000).toISOString();
    const dateYt = new Date(Date.now() - THRESHOLD_YT * 60 * 1000).toISOString();

    // Fetch stale submissions
    const { data: staleSubmissions, error } = await supabase
      .from('submissions')
      .select('id, platform, updated_at')
      .eq('user_id', userId)
      .not('status', 'in', '("Paid","Rejected")')
      .or(`and(platform.eq.youtube,updated_at.lt.${dateYt}),and(platform.in.("(instagram,tiktok)"),updated_at.lt.${dateIgTt})`)
      .limit(5); // Cap background syncs per request

    if (error || !staleSubmissions || staleSubmissions.length === 0) return;

    console.log(`[SubmissionService] Syncing ${staleSubmissions.length} stale submissions (YT: ${THRESHOLD_YT}m, Others: ${THRESHOLD_IG_TT}m) for user ${userId}`);

    // Process in background
    for (const sub of staleSubmissions) {
       this.refreshSubmission(userId, sub.id).catch(e => 
          console.error(`[SubmissionService] Background refresh failed for ${sub.id}:`, e)
       );
    }
  }

  static async checkUrlAvailability(url: string) {
    if (!url) return { available: true };
    const normalizedUrl = url.split('?')[0].split('#')[0].replace(/\/$/, '');
    
    const { data, error } = await supabase
      .from('submissions')
      .select('id, campaign_id')
      .eq('url', normalizedUrl)
      .maybeSingle();

    if (error) throw error;
    return { available: !data, existingCampaignId: data?.campaign_id };
  }
}
