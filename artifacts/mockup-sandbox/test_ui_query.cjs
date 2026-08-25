const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://caztotyxnrdpplmbumqi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhenRvdHl4bnJkcHBsbWJ1bXFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NjIwNTIsImV4cCI6MjA5NDQzODA1Mn0.LVwvc9n9ZJfns6v9pVnmvSNkJ_hOp_bx3FCJxBB4K6Q';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing insert Pessoas...");
  const p = {
            nome: "ZTest API",
            cargo: "corretor",
            unidade_id: "jd-goias",
            ativo: true,
            foto_url: "",
            instagram: ""
  };
  const { data, error } = await supabase.from("pessoas").insert(p).select().single();
  console.log("Error:", error);
  console.log("Data:", data);
}
test();
