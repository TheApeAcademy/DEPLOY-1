import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SERVICE_ROLE_KEY; // use service role key
const supabase = createClient(supabaseUrl, supabaseKey);

const testInsert = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([
      {
        name: 'Test User',
        email: 'testuser@example.com',
        role: 'user',
        region: 'Kuwait',
        country: 'Kuwait',
        school_level: 'undergraduate'
      }
    ]);

  if (error) console.error('Insert error:', error);
  else console.log('Insert success:', data);
};

testInsert();
