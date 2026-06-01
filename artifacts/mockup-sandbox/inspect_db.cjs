const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://caztotyxnrdpplmbumqi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhenRvdHl4bnJkcHBsbWJ1bXFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NjIwNTIsImV4cCI6MjA5NDQzODA1Mn0.LVwvc9n9ZJfns6v9pVnmvSNkJ_hOp_bx3FCJxBB4K6Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  try {
    console.log('=== Unidades no Banco ===');
    const { data: unidades, error: errU } = await supabase.from('unidades').select('*');
    if (errU) throw errU;
    console.log(`Total de unidades cadastradas: ${unidades.length}`);
    unidades.forEach(u => {
      console.log(`- ID: ${u.id} | Nome: ${u.nome} | Handle: ${u.handle} | Ativo: ${u.ativo}`);
    });

    console.log('=== Pessoas no Banco ===');
    const { data: pessoas, error: errP } = await supabase.from('pessoas').select('*');
    if (errP) throw errP;
    console.log(`Total de pessoas cadastradas: ${pessoas.length}`);
    pessoas.forEach(p => {
      console.log(`- ID: ${p.id} | Nome: ${p.nome} | Cargo: ${p.cargo} | Unidade: ${p.unidade_id} | Ativo: ${p.ativo}`);
    });

    console.log('\n=== Rankings no Banco ===');
    const { data: rankings, error: errR } = await supabase.from('ranking_entries').select('*, pessoa:pessoas(*)');
    if (errR) throw errR;
    console.log(`Total de entradas no ranking: ${rankings.length}`);
    rankings.forEach(r => {
      const pessoaNome = r.pessoa ? r.pessoa.nome : 'PESSOA_INEXISTENTE';
      console.log(`- ID: ${r.id} | Tipo: ${r.tipo} | Categoria: ${r.categoria} | Posicao: ${r.posicao} | Valor: ${r.valor} | Pessoa: ${pessoaNome} | Ativo: ${r.ativo}`);
    });
  } catch (err) {
    console.error('Erro na inspeção:', err);
  }
}

inspect();
