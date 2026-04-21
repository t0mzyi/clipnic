import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('submissions')
    .select(`
       *,
       campaigns (
          title,
          cpm_rate
       )
    `)
    .eq('user_id', '87273ec2-61d1-4230-923f-f1c9950f96e5')
    .order('created_at', { ascending: false });

  console.log("Submissions with Campaign:");
  console.dir(data, { depth: null });
  if (error) console.error("Error:", error);
}

run();
