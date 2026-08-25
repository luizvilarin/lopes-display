const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('pessoas').insert({
    nome: "Teste API",
    cargo: "corretor",
    unidade_id: "jd-goias",
    ativo: true,
    foto_url: "",
    instagram: ""
  });
  console.log("Error:", error);
}
run();
