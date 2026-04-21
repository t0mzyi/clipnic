import { supabase } from '../config/supabase';

export class SettingsService {
  static async getSetting(key: string, defaultValue: any = null) {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', key)
      .single();

    if (error || !data) return defaultValue;
    return data.value;
  }

  static async updateSetting(key: string, value: any) {
    const { error } = await supabase
      .from('settings')
      .upsert({ key, value }, { onConflict: 'key' });

    if (error) throw error;
    return true;
  }

  /**
   * Fetches all settings at once for the frontend sync
   */
  static async getAllSettings() {
      const { data, error } = await supabase.from('settings').select('*');
      if (error) return {};
      
      return data.reduce((acc: any, curr: any) => {
          acc[curr.key] = curr.value;
          return acc;
      }, {});
  }
}
