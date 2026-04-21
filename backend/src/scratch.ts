import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugTime() {
  const { data: sub, error } = await supabase
    .from('submissions')
    .select('id, updated_at')
    .eq('url', 'https://youtu.be/l6ieo7xPvuI')
    .single();

  if (error) {
      console.error("Error fetching sub:", error);
      return;
  }

  const lastUpdatedStr = sub.updated_at;
  const lastUpdatedDate = new Date(lastUpdatedStr);
  const lastUpdatedTime = lastUpdatedDate.getTime();
  const now = Date.now();
  const diffMs = now - lastUpdatedTime;
  const diffMinutes = diffMs / (1000 * 60);

  console.log("Current System Time (UTC):", new Date().toISOString());
  console.log("Submission updated_at (DB):", lastUpdatedStr);
  console.log("Difference (Minutes):", diffMinutes);
  console.log("Is Rate Limited (diff < 10):", diffMinutes < 10);
}

debugTime();
