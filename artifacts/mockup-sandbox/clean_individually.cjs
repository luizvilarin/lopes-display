const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://caztotyxnrdpplmbumqi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhenRvdHl4bnJkcHBsbWJ1bXFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NjIwNTIsImV4cCI6MjA5NDQzODA1Mn0.LVwvc9n9ZJfns6v9pVnmvSNkJ_hOp_bx3FCJxBB4K6Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function clean() {
  try {
    console.log('Buscando IDs de pessoas (select leve)...');
    const { data: pessoas, error: getErr } = await supabase.from('pessoas').select('id, nome');
    if (getErr) throw getErr;

    console.log(`Encontradas ${pessoas.length} pessoas. Iniciando limpeza individual...`);
    let limpas = 0;

    for (const p of pessoas) {
      // Faz o update limpando a foto_url especificamente para este ID
      const { error: updErr } = await supabase
        .from('pessoas')
        .update({ foto_url: null })
        .eq('id', p.id);
      
      if (updErr) {
        console.error(`Erro ao limpar foto de ${p.nome}:`, updErr.message);
      } else {
        console.log(`- Foto de ${p.nome} limpa com sucesso!`);
        limpas++;
      }
    }

    console.log(`\nLimpeza concluída! ${limpas} registros limpos.`);
  } catch (err) {
    console.error('Erro geral no script:', err);
  }
}

clean();
