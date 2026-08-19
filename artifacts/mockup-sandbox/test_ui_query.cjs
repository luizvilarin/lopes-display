const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://caztotyxnrdpplmbumqi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhenRvdHl4bnJkcHBsbWJ1bXFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NjIwNTIsImV4cCI6MjA5NDQzODA1Mn0.LVwvc9n9ZJfns6v9pVnmvSNkJ_hOp_bx3FCJxBB4K6Q';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing getPessoas...");
  const { data: p, error: pe } = await supabase.from("pessoas").select("id, nome, cargo, unidade_id, foto_url, ativo").order("nome");
  if (pe) console.error("Error getPessoas:", pe);
  else console.log("getPessoas OK", p.length);

  console.log("Testing getRankings...");
  const { data: r, error: re } = await supabase.from("ranking_entries").select("*, pessoa:pessoas(id, nome, cargo, unidade_id, foto_url, ativo)").eq("ativo", true);
  if (re) console.error("Error getRankings:", re);
  else console.log("getRankings OK", r.length);
}
test();
