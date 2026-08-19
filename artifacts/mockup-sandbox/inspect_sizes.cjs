const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://caztotyxnrdpplmbumqi.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhenRvdHl4bnJkcHBsbWJ1bXFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NjIwNTIsImV4cCI6MjA5NDQzODA1Mn0.LVwvc9n9ZJfns6v9pVnmvSNkJ_hOp_bx3FCJxBB4K6Q');
async function test() {
  const { data, error } = await supabase.from('pessoas').select('id, nome, foto_url');
  if (error) { console.error(error); return; }
  let totalSize = 0;
  let hugePhotos = [];
  for (const d of data) {
    if (d.foto_url) {
      const size = d.foto_url.length;
      totalSize += size;
      if (size > 100000) { // > 100KB
        hugePhotos.push({ nome: d.nome, size: size });
      }
    }
  }
  console.log('Total base64 bytes in foto_url:', totalSize);
  console.log('Huge photos:', hugePhotos.length);
}
test();
