import { createClient } from '@supabase/supabase-js';

// Vercel Serverless Function
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Utilize POST.' });
  }

  const authHeader = req.headers.authorization;
  const SECRET_KEY = process.env.API_SECRET_KEY;

  if (!SECRET_KEY) {
    console.error("ERRO: API_SECRET_KEY não configurada na Vercel.");
    return res.status(500).json({ error: 'Configuração do servidor ausente.' });
  }

  if (!authHeader || authHeader !== `Bearer ${SECRET_KEY}`) {
    return res.status(401).json({ error: 'Não autorizado. Token inválido.' });
  }

  try {
    const payload = req.body;
    console.log("Recebendo payload do Webhook...");

    if (!payload || !Array.isArray(payload.vendas)) {
      return res.status(400).json({ error: 'Payload inválido. Esperado { "vendas": [...] }' });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("ERRO: Credenciais do Supabase não configuradas no ambiente (Service Role Key).");
      return res.status(500).json({ error: 'Configuração do banco de dados ausente.' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Processar Upsert na tabela vendas_cultura
    const vendas = payload.vendas.map(v => ({
      id_origem: v.id_venda,
      corretor: v.corretor,
      gestor: v.gestor,
      vgv: parseFloat(v.vgv) || 0,
      data_venda: v.data_venda,
      status: v.status || 'Vendido',
      updated_at: new Date().toISOString()
    }));

    if (vendas.length > 0) {
      const { error: upsertError } = await supabase
        .from('vendas_cultura')
        .upsert(vendas, { onConflict: 'id_origem' });
        
      if (upsertError) throw upsertError;
    }

    // 2. Recalcular Placar do Mês Atual
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); 
    
    // Datas do mês atual (UTC)
    const firstDay = new Date(currentYear, currentMonth, 1).toISOString();
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const lastDay = new Date(nextMonthYear, nextMonth, 1).toISOString();

    const { data: salesThisMonth, error: salesError } = await supabase
      .from('vendas_cultura')
      .select('*')
      .gte('data_venda', firstDay)
      .lt('data_venda', lastDay);

    if (salesError) throw salesError;

    const normalize = (str) => str ? String(str).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";
    const isIgnoredName = (name) => {
      const norm = normalize(name);
      if (!norm) return true;
      const ignored = [
        "socios", "socio", "socias", "socia", "gerentes", "diretor",
        "sereno leao", "rafael badra", "deyvid rhussel", "jann costa", 
        "luziano", "jose soares", "murilo feitosa"
      ];
      return ignored.some(ignoredName => norm.includes(ignoredName));
    };

    const groupedCorretores = {};
    const groupedGestores = {};

    for (const venda of (salesThisMonth || [])) {
      // Ignora status de distrato/cancelado (simulando filtro da plataforma)
      const st = normalize(venda.status);
      if (st.includes("distratado") || st.includes("cancelad")) continue;

      const val = Number(venda.vgv) || 0;
      if (val <= 0) continue;

      if (venda.corretor && !isIgnoredName(venda.corretor)) {
        const cName = String(venda.corretor).trim();
        groupedCorretores[cName] = (groupedCorretores[cName] || 0) + val;
      }
      if (venda.gestor && !isIgnoredName(venda.gestor)) {
        const gName = String(venda.gestor).trim();
        groupedGestores[gName] = (groupedGestores[gName] || 0) + val;
      }
    }

    // Busca tabela de pessoas
    const { data: dbPessoas } = await supabase.from('pessoas').select('*').eq('ativo', true);
    
    // Função para achar ID
    const getPessoaId = (nome) => {
      if (!dbPessoas) return null;
      const match = dbPessoas.find(p => p.nome && normalize(p.nome) === normalize(nome));
      return match ? match.id : null;
    };

    const monthNames = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
    const periodoStr = `${monthNames[currentMonth]} DE ${currentYear}`;

    // Deleta os antigos do mês
    await supabase.from("ranking_entries")
      .delete()
      .eq("periodo", periodoStr)
      .eq("tipo", "mensal");

    const newEntries = [];

    // Top 10 Corretores
    const corretoresSorted = Object.entries(groupedCorretores).sort((a, b) => b[1] - a[1]).slice(0, 10);
    for (let i = 0; i < corretoresSorted.length; i++) {
      const [nome, val] = corretoresSorted[i];
      const pId = getPessoaId(nome);
      if (pId) {
        newEntries.push({
          pessoa_id: pId,
          tipo: "mensal",
          categoria: "corretores",
          posicao: i + 1,
          valor: val,
          periodo: periodoStr,
          ativo: true
        });
      }
    }

    // Top 5 Gestores
    const gestoresSorted = Object.entries(groupedGestores).sort((a, b) => b[1] - a[1]).slice(0, 5);
    for (let i = 0; i < gestoresSorted.length; i++) {
      const [nome, val] = gestoresSorted[i];
      const pId = getPessoaId(nome);
      if (pId) {
        newEntries.push({
          pessoa_id: pId,
          tipo: "mensal",
          categoria: "gestores",
          posicao: i + 1,
          valor: val,
          periodo: periodoStr,
          ativo: true
        });
      }
    }

    if (newEntries.length > 0) {
      await supabase.from("ranking_entries").insert(newEntries);
    }

    return res.status(200).json({
      success: true,
      message: 'Vendas sincronizadas e Ranking atualizado com sucesso!',
      upserted_count: vendas.length,
      new_ranking_entries: newEntries.length
    });

  } catch (error) {
    console.error("Erro interno no Webhook:", error);
    return res.status(500).json({ error: 'Erro interno no servidor.', detail: error.message });
  }
}
