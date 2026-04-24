import { supabase } from './src/config/supabase';

async function checkSubmissionsColumns() {
    const { data, error } = await supabase.from('submissions').select('*').limit(1);
    if (error) {
        console.error('Error fetching submissions:', error);
        return;
    }
    if (data && data.length > 0) {
        console.log('Columns in submissions table:', Object.keys(data[0]));
    } else {
        console.log('No submissions found to check columns.');
    }
}

checkSubmissionsColumns();
