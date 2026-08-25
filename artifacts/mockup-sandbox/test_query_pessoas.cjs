const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const s = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await s.from('pessoas').select('*').limit(1);
  console.log("Error:", error);
  console.log("Data:", data);
}
run();
