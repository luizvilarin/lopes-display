const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://caztotyxnrdpplmbumqi.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhenRvdHl4bnJkcHBsbWJ1bXFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NjIwNTIsImV4cCI6MjA5NDQzODA1Mn0.LVwvc9n9ZJfns6v9pVnmvSNkJ_hOp_bx3FCJxBB4K6Q');
async function test() {
  console.log("query without .eq");
  const { error: e1 } = await supabase.from("ranking_entries").select("*, pessoa:pessoas(id, nome, cargo, unidade_id, foto_url, ativo)");
  console.log("e1", e1);

  console.log("query with .eq");
  const { error: e2 } = await supabase.from("ranking_entries").select("*, pessoa:pessoas(id, nome, cargo, unidade_id, foto_url, ativo)").eq("ativo", true);
  console.log("e2", e2);
}
test();
