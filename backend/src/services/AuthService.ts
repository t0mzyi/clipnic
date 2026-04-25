import { supabase } from '../config/supabase';
import { LoggerService } from './LoggerService';

export class AuthService {
  /**
   * Syncs a Supabase Auth user with our public.users table.
   * This ensures we have a record to link submissions, campaigns, etc.
   */
  static async syncUser(supabaseId: string, email: string, name?: string, avatarUrl?: string, role: string = 'user') {
    // Check if this is a new registration
    const { data: existing } = await supabase.from('users').select('id').eq('id', supabaseId).maybeSingle();

    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: supabaseId,
        email,
        name,
        avatar_url: avatarUrl,
        role,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
      .select('id, email, name, avatar_url, role, discord_id, discord_verified, youtube_verified, youtube_handle, youtube_channels, instagram_verified, instagram_handle, is_blocked, onboarding_completed')
      .single();

    if (error) {
      console.error('Error syncing user:', error.message);
      throw error;
    }

    if (!existing) {
        LoggerService.info('User Registered', `New user registered: **${email}** (${name || 'No Name'})\nID: ${supabaseId}`);
    }

    return data;
  }
}
