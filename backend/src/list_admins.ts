import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

async function findAdmins() {
    const { data: users, error } = await supabase
        .from('users')
        .select('id, name, email, discord_id, role');

    if (error) {
        console.error('Error fetching users:', error.message);
        return;
    }

    console.log('--- List of Users ---');
    users.forEach(u => {
        console.log(`[${u.role}] ${u.name} (${u.email}) - Discord ID: ${u.discord_id}`);
    });
}

findAdmins();
