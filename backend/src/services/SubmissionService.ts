import { supabase } from '../config/supabase';
import { z } from 'zod';

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
    if (platform === 'youtube') {
      try {
        const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
        const videoId = match ? match[1] : null;
        
        if (videoId && process.env.YOUTUBE_API_KEY) {
          const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`);
          const json = await res.json();
          if (json.items && json.items.length > 0) {
            return {
                views: parseInt(json.items[0].statistics.viewCount, 10),
                channelId: json.items[0].snippet.channelId
            };
          }
        }
      } catch (err) {
        console.error('YouTube API Error:', err);
      }
    } else if (platform === 'instagram') {
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
             if (ogDescMatch) {
                const desc = ogDescMatch[1];
                const viewMatch = desc.match(/([\d,.]+[KMB]?) views/i);
                if (viewMatch) {
                    let viewStr = viewMatch[1].replace(/,/g, '');
                    let viewsNum = 0;
                    if (viewStr.endsWith('K')) viewsNum = parseFloat(viewStr) * 1000;
                    else if (viewStr.endsWith('M')) viewsNum = parseFloat(viewStr) * 1000000;
                    else if (viewStr.endsWith('B')) viewsNum = parseFloat(viewStr) * 1000000000;
                    else viewsNum = parseInt(viewStr, 10);

                    return { views: viewsNum, channelId: 'ig_post' };
                }
             }
           }
        }
      } catch (err) {
        console.error('Instagram Scrape Error:', err);
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

    // 3. Check platform restrictions
    if (campaign.allowed_platforms && !campaign.allowed_platforms.includes(validated.platform)) {
        throw new Error(`This mission only allows: ${campaign.allowed_platforms.join(', ')}`);
    }

    // 4. Fetch live views and channel ID via external APIs
    const { views, channelId } = await this.fetchLiveViews(validated.url, validated.platform);
    
    if (validated.platform === 'youtube') {
        if (!channelId) throw new Error("Could not pull channel details for this video.");
        
        const { data: userRaw } = await supabase.from('users').select('youtube_channels').eq('id', userId).single();
        const existingChannels = userRaw?.youtube_channels || [];
        
        if (existingChannels.length === 0) throw new Error("Link a YouTube channel in Profile first.");
        
        const isOwner = existingChannels.some((c: any) => c.channelId === channelId);
        if (!isOwner) throw new Error("This video does not belong to your verified channels.");
    }

    // 5. Calculate potential earnings
    let earnings = 0;
    if (campaign.min_views) {
        if (views >= campaign.min_views) {
             earnings = (views / 1000) * campaign.cpm_rate;
        }
    } else {
         earnings = (views / 1000) * campaign.cpm_rate;
    }

    if (campaign.per_video_cap && earnings > campaign.per_video_cap) {
        earnings = campaign.per_video_cap;
    }

    // 6. Final Insert
    const { data: submission, error } = await supabase
      .from('submissions')
      .insert({
        campaign_id: validated.campaign_id,
        user_id: userId,
        url: validated.url,
        platform: validated.platform,
        views,
        earnings,
        status: 'Pending'
      })
      .select()
      .single();
      
    if (error) {
       if (error.code === '23505') throw new Error("You have already submitted this specific video link.");
       throw error;
    }
    return submission;
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

      // 2. Check 10-minute cooldown
      const lastUpdated = new Date(submission.updated_at).getTime();
      const now = Date.now();
      const diffMinutes = (now - lastUpdated) / (1000 * 60);

      if (diffMinutes < 10) {
          const remainingSeconds = Math.ceil((10 - diffMinutes) * 60);
          const remMin = Math.floor(remainingSeconds / 60);
          const remSec = remainingSeconds % 60;
          throw new Error(`Please wait ${remMin}m ${remSec}s before refreshing again.`);
      }

      // 3. Fetch fresh views
      const { views } = await this.fetchLiveViews(submission.url, submission.platform);
      
      // 4. Recalculate earnings
      const campaign = submission.campaigns;
      let earnings = 0;
      if (campaign.min_views) {
          if (views >= campaign.min_views) {
               earnings = (views / 1000) * campaign.cpm_rate;
          }
      } else {
           earnings = (views / 1000) * campaign.cpm_rate;
      }

      if (campaign.per_video_cap && earnings > campaign.per_video_cap) {
          earnings = campaign.per_video_cap;
      }

      // 5. Update DB
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
      return updated;
  }

  static async getUserSubmissions(userId: string, campaignId: string) {
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
      
    if (error) throw error;
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
            title,
            cpm_rate,
            min_views,
            per_video_cap
         )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    let availableBalance = 0;
    let pendingPayout = 0;
    let claimed = 0;
    const breakdown: any[] = [];

    for (const sub of (submissions || [])) {
      const campaign = sub.campaigns;
      const minViews = campaign?.min_views || 0;
      const earnings = Number(sub.earnings || 0);

      let earningCategory = 'available'; // default: still accumulating

      if (sub.status === 'Paid') {
        earningCategory = 'claimed';
        claimed += earnings;
      } else if (sub.status === 'Rejected') {
        earningCategory = 'rejected';
      } else if (minViews > 0 && sub.views < minViews) {
        earningCategory = 'available';
        availableBalance += earnings;
      } else {
        earningCategory = 'pending';
        pendingPayout += earnings;
      }

      breakdown.push({
        id: sub.id,
        url: sub.url,
        platform: sub.platform,
        views: sub.views,
        earnings,
        status: sub.status,
        earningCategory,
        campaignTitle: campaign?.title || 'Unknown',
        minViews,
        created_at: sub.created_at,
        updated_at: sub.updated_at
      });
    }

    const totalEarnings = availableBalance + pendingPayout + claimed;

    return {
      totalEarnings,
      availableBalance,
      pendingPayout,
      claimed,
      breakdown
    };
  }
}
