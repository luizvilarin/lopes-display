const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://caztotyxnrdpplmbumqi.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhenRvdHl4bnJkcHBsbWJ1bXFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NjIwNTIsImV4cCI6MjA5NDQzODA1Mn0.LVwvc9n9ZJfns6v9pVnmvSNkJ_hOp_bx3FCJxBB4K6Q');
async function test() {
  console.log("Limpando fotos gigantes...");
  // Não podemos limpar TODAS as fotos de uma vez se a tabela for grande e der timeout.
  // Vamos buscar os IDs das pessoas primeiro, sem trazer a foto!
  const { data: pessoas, error: e1 } = await supabase.from('pessoas').select('id');
  if (e1) {
    console.error("Erro ao buscar ids:", e1);
    return;
  }
  
  console.log("Pessoas encontradas:", pessoas.length);
  
  let batch = [];
  for (const p of pessoas) {
    batch.push(p.id);
    if (batch.length === 50) {
      console.log("Limpando lote de 50...");
      await supabase.from('pessoas').update({ foto_url: null }).in('id', batch);
      batch = [];
    }
  }
  if (batch.length > 0) {
    console.log("Limpando lote restante de", batch.length);
    await supabase.from('pessoas').update({ foto_url: null }).in('id', batch);
  }
  console.log("Fotos limpas com sucesso.");
}
test();
