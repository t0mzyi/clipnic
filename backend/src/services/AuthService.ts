import { supabase } from '../config/supabase';

export class AuthService {
  /**
   * Syncs a Supabase Auth user with our public.users table.
   * This ensures we have a record to link submissions, campaigns, etc.
   */
  static async syncUser(supabaseId: string, email: string, name?: string, avatarUrl?: string, role: string = 'user') {
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
      .select()
      .single();

    if (error) {
      console.error('Error syncing user:', error.message);
      throw error;
    }

    return data;
  }
}
