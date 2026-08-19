const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://caztotyxnrdpplmbumqi.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhenRvdHl4bnJkcHBsbWJ1bXFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NjIwNTIsImV4cCI6MjA5NDQzODA1Mn0.LVwvc9n9ZJfns6v9pVnmvSNkJ_hOp_bx3FCJxBB4K6Q');
async function test() {
  const { error } = await supabase.from('config_metas').update({ meta_mensal_realizado: 0 }).neq('id', 0);
  console.log("Meta resetada:", error ? error : "OK");
}
test();
