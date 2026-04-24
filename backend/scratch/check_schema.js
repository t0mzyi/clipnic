const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSchema() {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    if (error) {
        console.error('Error fetching users:', error);
        return;
    }
    if (data && data.length > 0) {
        console.log('User columns:', Object.keys(data[0]));
    } else {
        console.log('No users found to check columns.');
    }
}

checkSchema();
