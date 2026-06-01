const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://caztotyxnrdpplmbumqi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhenRvdHl4bnJkcHBsbWJ1bXFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NjIwNTIsImV4cCI6MjA5NDQzODA1Mn0.LVwvc9n9ZJfns6v9pVnmvSNkJ_hOp_bx3FCJxBB4K6Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanAll() {
  try {
    console.log('Iniciando limpeza em massa de fotos pesadas para restaurar o sistema...');
    // Realiza o update definindo foto_url como null para todas as pessoas ativas
    const { data, error } = await supabase
      .from('pessoas')
      .update({ foto_url: null })
      .eq('ativo', true); // atualiza apenas os ativos ou todos
    
    if (error) throw error;
    
    console.log('Limpeza em massa concluída com sucesso! O banco foi restabelecido.');
  } catch (err) {
    console.error('Erro na limpeza:', err);
  }
}

cleanAll();
