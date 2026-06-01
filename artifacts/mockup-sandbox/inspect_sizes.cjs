const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://caztotyxnrdpplmbumqi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhenRvdHl4bnJkcHBsbWJ1bXFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NjIwNTIsImV4cCI6MjA5NDQzODA1Mn0.LVwvc9n9ZJfns6v9pVnmvSNkJ_hOp_bx3FCJxBB4K6Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function clean() {
  try {
    console.log('Buscando pessoas para inspecionar tamanho de fotos...');
    // Selecionamos apenas id, nome e foto_url
    const { data: pessoas, error } = await supabase.from('pessoas').select('id, nome, foto_url');
    if (error) throw error;

    console.log(`Pessoas encontradas: ${pessoas.length}`);
    let pesadas = 0;

    for (const p of pessoas) {
      const size = p.foto_url ? p.foto_url.length : 0;
      if (size > 50000) { // mais de 50KB
        console.log(`- Pessoa: ${p.nome} | Tamanho da foto: ${(size / 1024).toFixed(1)} KB (PESADA!)`);
        pesadas++;
        
        // Limpar a foto pesada para restaurar o banco
        const { error: updErr } = await supabase.from('pessoas').update({ foto_url: null }).eq('id', p.id);
        if (updErr) {
          console.error(`Erro ao limpar foto de ${p.nome}:`, updErr);
        } else {
          console.log(`  -> Foto de ${p.nome} limpa com sucesso!`);
        }
      } else if (size > 0) {
        console.log(`- Pessoa: ${p.nome} | Tamanho da foto: ${(size / 1024).toFixed(1)} KB (OK)`);
      }
    }

    console.log(`\nInspeção concluída! Fotos pesadas removidas/limpas: ${pesadas}`);
  } catch (err) {
    console.error('Erro no script:', err);
  }
}

clean();
