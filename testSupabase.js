import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Use the variable names exactly as they are in your .env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SERVICE_ROLE_KEY; // matches your current .env

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  // Replace 'assignments' with an actual table in your Supabase project
  const { data, error } = await supabase.from('assignments').select('*');

  if (error) console.error('Supabase error:', error);
  else console.log('Supabase test data:', data);
}

testConnection();
