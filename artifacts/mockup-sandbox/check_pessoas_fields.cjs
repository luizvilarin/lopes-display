const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://caztotyxnrdpplmbumqi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhenRvdHl4bnJkcHBsbWJ1bXFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NjIwNTIsImV4cCI6MjA5NDQzODA1Mn0.LVwvc9n9ZJfns6v9pVnmvSNkJ_hOp_bx3FCJxBB4K6Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  try {
    const { data: pessoas, error } = await supabase.from('pessoas').select('*').limit(1);
    if (error) throw error;
    if (pessoas && pessoas.length > 0) {
      console.log('KEYS OF PESSOAS ROW:', Object.keys(pessoas[0]));
      console.log('SAMPLE VALUES:', pessoas[0]);
    } else {
      console.log('Nenhuma pessoa cadastrada no banco!');
    }
  } catch (err) {
    console.error('Erro:', err);
  }
}

check();
