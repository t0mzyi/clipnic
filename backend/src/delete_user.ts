import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://fybgijgrnmpsdshamnhb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5Ymdpamdybm1wc2RzaGFtbmhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2OTY1MzksImV4cCI6MjA5MjI3MjUzOX0.yr1NQhToeZUFs-91Gxii4mgQLQx_4xCgZvx0r840axE";
const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteUser() {
    const email = 'divyajoshy1981@gmail.com';
    const userId = '50eb250e-c33a-489a-a963-1f405f6ff4a4';

    console.log(`Starting deletion for ${email} (${userId})...`);

    const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

    if (error) {
        console.error('Error deleting user:', error.message);
    } else {
        console.log('User successfully deleted from public.users.');
    }
}

deleteUser();
