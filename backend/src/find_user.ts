import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://fybgijgrnmpsdshamnhb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5Ymdpamdybm1wc2RzaGFtbmhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2OTY1MzksImV4cCI6MjA5MjI3MjUzOX0.yr1NQhToeZUFs-91Gxii4mgQLQx_4xCgZvx0r840axE";
const supabase = createClient(supabaseUrl, supabaseKey);

async function findUser() {
    const email = 'divyajoshy1981@gmail.com';
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    if (userError) {
        console.error('Error finding user in public.users:', userError.message);
    } else if (user) {
        console.log('User found in public.users:', JSON.stringify(user, null, 2));

        // Check associated data
        const { count: submissionCount } = await supabase
            .from('submissions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
        
        console.log(`Associated submissions: ${submissionCount}`);

        const { count: participantCount } = await supabase
            .from('campaign_participants')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
        
        console.log(`Associated campaign participations: ${participantCount}`);
    } else {
        console.log('User not found in public.users.');
    }
}

findUser();
