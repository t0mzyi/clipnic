import { supabase } from './config/supabase';

async function testConnection() {
  console.log('Testing Supabase connection...');
  console.log('URL:', process.env.SUPABASE_URL);
  
  try {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('✅ Connection successful, but "users" table is empty or does not exist yet.');
      } else if (error.message.includes('relation "users" does not exist')) {
        console.log('✅ Connection successful! The project is reached, but the "users" table has not been created in Supabase yet.');
      } else {
        console.error('❌ Connection error:', error.message);
      }
    } else {
      console.log('✅ Connection successful! Data fetched:', data);
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

testConnection();
