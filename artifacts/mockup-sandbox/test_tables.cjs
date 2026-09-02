const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://caztotyxnrdpplmbumqi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhenRvdHl4bnJkcHBsbWJ1bXFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NjIwNTIsImV4cCI6MjA5NDQzODA1Mn0.LVwvc9n9ZJfns6v9pVnmvSNkJ_hOp_bx3FCJxBB4K6Q';
const s = createClient(supabaseUrl, supabaseKey);
async function run() {
  const { data, error } = await s.from('pastas').select('id').limit(1);
  console.log("Pastas Error:", error?.message || 'OK');
  const { data: r, error: re } = await s.from('ranking_pastas').select('id').limit(1);
  console.log("Ranking Pastas Error:", re?.message || 'OK');
}
run();
