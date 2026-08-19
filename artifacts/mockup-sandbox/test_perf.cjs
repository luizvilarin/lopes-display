const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://caztotyxnrdpplmbumqi.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhenRvdHl4bnJkcHBsbWJ1bXFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NjIwNTIsImV4cCI6MjA5NDQzODA1Mn0.LVwvc9n9ZJfns6v9pVnmvSNkJ_hOp_bx3FCJxBB4K6Q');

async function test() {
  console.time('getPessoas');
  await supabase.from("pessoas").select("id, nome, cargo, unidade_id, foto_url, ativo").order("nome");
  console.timeEnd('getPessoas');

  console.time('getRankings (sem .eq)');
  await supabase.from("ranking_entries").select("*, pessoa:pessoas(id, nome, cargo, unidade_id, foto_url, ativo)");
  console.timeEnd('getRankings (sem .eq)');
  
  console.time('getRankings (com .eq)');
  const res = await supabase.from("ranking_entries").select("*, pessoa:pessoas(id, nome, cargo, unidade_id, foto_url, ativo)").eq("ativo", true);
  console.timeEnd('getRankings (com .eq)');
  console.log("Error se houver no com .eq:", res.error);
}
test();
