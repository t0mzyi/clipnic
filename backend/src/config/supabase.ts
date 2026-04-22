import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn("Missing SUPABASE_URL or SUPABASE_KEY in environment variables.");
} else {
  const isServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  console.log(`[Supabase] Initialized with ${isServiceKey ? 'SERVICE_ROLE' : 'ANON'} key`);
}

// Ensure you export the instantiated client
export const supabase = createClient(supabaseUrl, supabaseKey);
