import { supabase } from '../config/supabase';
import { z } from 'zod';

const createCampaignSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  discord_channel: z.string().url(),
  cpm_rate: z.number().positive(),
  total_budget: z.number().positive(),
  end_date: z.string().refine(
    (val) => !isNaN(Date.parse(val)) && new Date(val) > new Date(),
    { message: 'end_date must be a future date' }
  ),
  banner_url: z.string().url().optional().or(z.literal('')),
  min_views: z.number().int().min(0).optional().nullable(),
  per_clipper_cap: z.number().positive().optional().nullable(),
  per_video_cap: z.number().positive().optional().nullable(),
  requires_verification: z.boolean().optional().default(false),
  is_featured: z.boolean().optional().default(false),
  allowed_platforms: z.array(z.string()).optional().default(['youtube', 'instagram', 'tiktok']),
  requires_dedicated_social: z.boolean().optional().default(false),
  requires_discord: z.boolean().optional().default(false),
  rules: z.array(z.string()).optional().default([]),
}).refine(
  (data) => {
    if (typeof data.per_clipper_cap === 'number' && typeof data.per_video_cap === 'number') {
      return data.per_clipper_cap >= data.per_video_cap;
    }
    return true;
  },
  {
    message: "Per Clipper Cap cannot be less than Per Video Cap",
    path: ["per_clipper_cap"],
  }
);

export class CampaignService {
  static async getAll() {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  static async getById(id: string) {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  static async getParticipations(userId: string) {
    const { data, error } = await supabase
      .from('campaign_participants')
      .select('campaign_id')
      .eq('user_id', userId);
    if (error) throw error;
    return data.map(p => p.campaign_id);
  }

  static async getJoinedCampaigns(userId: string) {
      const { data, error } = await supabase
          .from('campaign_participants')
          .select('*, campaigns(*)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data.map(p => ({
          ...p.campaigns,
          joined_at: p.created_at,
          linked_handle: p.linked_handle
      }));
  }

  static async joinCampaign(userId: string, campaignId: string, linkedHandle?: string) {
      const campaign = await this.getById(campaignId);
      if (!campaign) throw new Error("Campaign not found.");
      if (campaign.status !== 'Active') {
          throw new Error(`This campaign is currently ${campaign.status.toLowerCase()} and not accepting new participants.`);
      }

      const { data, error } = await supabase
          .from('campaign_participants')
          .insert({
              user_id: userId,
              campaign_id: campaignId,
              linked_handle: linkedHandle || null
          })
          .select()
          .single();
      
      if (error) {
          if (error.code === '23505') throw new Error("You have already joined this campaign.");
          throw error;
      }

      // Sync handle to global user profile for better UX persistence
      if (linkedHandle) {
          try {
              const handle = linkedHandle.startsWith('@') ? linkedHandle : `@${linkedHandle}`;
              const isInstagram = linkedHandle.includes('instagram') || campaign.allowed_platforms?.includes('instagram');
              const isYouTube = linkedHandle.includes('youtube') || campaign.allowed_platforms?.includes('youtube');

              const updateData: any = {};
              if (isInstagram) {
                  updateData.instagram_handle = handle;
                  updateData.instagram_verified = true;
              } else if (isYouTube) {
                  updateData.youtube_handle = handle;
                  updateData.youtube_verified = true;
              }

              if (Object.keys(updateData).length > 0) {
                  await supabase.from('users').update(updateData).eq('id', userId);
              }
          } catch (e) {
              console.error('Failed to sync handle to profile:', e);
          }
      }

      return data;
  }

  static async create(data: any) {
    const validated = createCampaignSchema.parse(data);
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert({
        title: validated.title,
        description: validated.description,
        discord_channel: validated.discord_channel,
        cpm_rate: validated.cpm_rate,
        total_budget: validated.total_budget,
        budget_used: 0,
        end_date: validated.end_date,
        banner_url: validated.banner_url || null,
        min_views: validated.min_views ?? null,
        per_clipper_cap: validated.per_clipper_cap ?? null,
        per_video_cap: validated.per_video_cap ?? null,
        requires_verification: validated.requires_verification,
        is_featured: validated.is_featured,
        allowed_platforms: validated.allowed_platforms,
        requires_dedicated_social: validated.requires_dedicated_social,
        requires_discord: validated.requires_discord,
        rules: validated.rules,
        status: 'Active',
        view_progress: 0,
        target_views: Math.floor(validated.total_budget / (validated.cpm_rate / 1000)),
      })
      .select()
      .single();
    if (error) throw error;
    return campaign;
  }

  static async update(id: string, data: any) {
    const validated = createCampaignSchema.parse(data);
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .update({
        title: validated.title,
        description: validated.description,
        discord_channel: validated.discord_channel,
        cpm_rate: validated.cpm_rate,
        total_budget: validated.total_budget,
        end_date: validated.end_date,
        banner_url: validated.banner_url || null,
        min_views: validated.min_views ?? null,
        per_clipper_cap: validated.per_clipper_cap ?? null,
        per_video_cap: validated.per_video_cap ?? null,
        requires_verification: validated.requires_verification,
        is_featured: validated.is_featured,
        allowed_platforms: validated.allowed_platforms,
        requires_dedicated_social: validated.requires_dedicated_social,
        requires_discord: validated.requires_discord,
        rules: validated.rules,
        target_views: Math.floor(validated.total_budget / (validated.cpm_rate / 1000)),
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return campaign;
  }

  static async updateStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('campaigns')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async updateFeatured(id: string, isFeatured: boolean) {
    const { data, error } = await supabase
      .from('campaigns')
      .update({ is_featured: isFeatured })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async delete(id: string) {
    const { error } = await supabase.from('campaigns').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
}
