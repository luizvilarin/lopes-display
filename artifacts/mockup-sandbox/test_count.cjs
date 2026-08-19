const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://caztotyxnrdpplmbumqi.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhenRvdHl4bnJkcHBsbWJ1bXFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NjIwNTIsImV4cCI6MjA5NDQzODA1Mn0.LVwvc9n9ZJfns6v9pVnmvSNkJ_hOp_bx3FCJxBB4K6Q');
async function test() {
  const { count, error } = await supabase.from('ranking_entries').select('*', { count: 'exact', head: true });
  console.log("Count ranking_entries:", count, error);

  const { count: c2, error: e2 } = await supabase.from('pessoas').select('*', { count: 'exact', head: true });
  console.log("Count pessoas:", c2, e2);
}
test();
