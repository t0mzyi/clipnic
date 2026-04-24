import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .limit(1);

        if (error) {
            console.error('Error fetching users:', error.message);
            return;
        }

        if (data && data.length > 0) {
            console.log('Columns in users table:', Object.keys(data[0]));
        } else {
            console.log('Users table is empty, could not determine columns.');
        }
    } catch (e) {
        console.error('Execution error:', e);
    }
}

checkSchema();
