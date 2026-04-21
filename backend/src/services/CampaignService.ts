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
}).refine(
  (data) => {
    if (typeof data.per_clipper_cap === 'number' && typeof data.per_video_cap === 'number') {
      // Both caps are set, clipper cap must be >= video cap
      return data.per_clipper_cap >= data.per_video_cap;
    }
    return true;
  },
  {
    message: "Per Clipper Cap cannot be less than Per Video Cap",
    path: ["per_clipper_cap"], // Attach the error to this field
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

  static async delete(id: string) {
    const { error } = await supabase.from('campaigns').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
}
