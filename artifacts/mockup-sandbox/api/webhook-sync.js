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

    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ error: 'Payload inválido. Esperado um objeto JSON.' });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("ERRO: Credenciais do Supabase não configuradas no ambiente (Service Role Key).");
      return res.status(500).json({ error: 'Configuração do banco de dados ausente.' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    let resultLog = { processed: [] };
    
    // Utilitários de Normalização
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

    // ─────────────────────────────────────────────────────────────────
    // 1. PROCESSAMENTO DE VENDAS
    // ─────────────────────────────────────────────────────────────────
    if (payload.vendas && Array.isArray(payload.vendas)) {
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

      // Recalcular Placar do Mês Atual
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth(); 
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

      const groupedCorretores = {};
      const groupedGestores = {};

      for (const venda of (salesThisMonth || [])) {
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

      const { data: dbPessoas } = await supabase.from('pessoas').select('*').eq('ativo', true);
      const getPessoaId = (nome) => {
        if (!dbPessoas) return null;
        const match = dbPessoas.find(p => p.nome && normalize(p.nome) === normalize(nome));
        return match ? match.id : null;
      };

      const monthNames = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
      const periodoStr = `${monthNames[currentMonth]} DE ${currentYear}`;

      await supabase.from("ranking_entries")
        .delete()
        .eq("periodo", periodoStr)
        .eq("tipo", "mensal");

      const newEntries = [];

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
      
      resultLog.processed.push('vendas');
      resultLog.vendas = { upserted: vendas.length, ranking_entries: newEntries.length };
    }

    // ─────────────────────────────────────────────────────────────────
    // 2. PROCESSAMENTO DE PASTAS
    // ─────────────────────────────────────────────────────────────────
    if (payload.pastas && Array.isArray(payload.pastas)) {
      const pastas = payload.pastas.map(p => ({
        id_origem: p.id_pasta,
        lancamento: p.lancamento,
        corretor: p.corretor,
        gestor: p.gestor,
        status_escolha: p.status_escolha || 'escolha',
        data_pasta: p.data_pasta,
        updated_at: new Date().toISOString()
      }));

      if (pastas.length > 0) {
        const { error: upsertPastasError } = await supabase
          .from('pastas_cultura')
          .upsert(pastas, { onConflict: 'id_origem' });
        if (upsertPastasError) throw upsertPastasError;
      }
      
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth(); 
      const firstDay = new Date(currentYear, currentMonth, 1).toISOString();
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const lastDay = new Date(nextMonthYear, nextMonth, 1).toISOString();

      const { data: pastasThisMonth, error: pastasError } = await supabase
        .from('pastas_cultura')
        .select('*')
        .gte('data_pasta', firstDay)
        .lt('data_pasta', lastDay)
        .eq('status_escolha', 'escolha');

      if (pastasError) throw pastasError;

      const grouped = {};
      for (const p of (pastasThisMonth || [])) {
        if (!p.lancamento) continue;
        const lanc = p.lancamento.trim();
        if (!grouped[lanc]) grouped[lanc] = { corretores: {}, gestores: {} };
        
        if (p.corretor && !isIgnoredName(p.corretor)) {
          const cName = p.corretor.trim();
          grouped[lanc].corretores[cName] = (grouped[lanc].corretores[cName] || 0) + 1;
        }
        if (p.gestor && !isIgnoredName(p.gestor)) {
          const gName = p.gestor.trim();
          grouped[lanc].gestores[gName] = (grouped[lanc].gestores[gName] || 0) + 1;
        }
      }

      const { data: dbPessoas } = await supabase.from('pessoas').select('*').eq('ativo', true);
      const getPessoaId = (nome) => {
        if (!dbPessoas) return null;
        const match = dbPessoas.find(p => p.nome && normalize(p.nome) === normalize(nome));
        return match ? match.id : null;
      };

      const { data: dbPastas } = await supabase.from('pastas').select('*');
      
      let rankingPastasCount = 0;

      for (const lancamento of Object.keys(grouped)) {
        let pasta = dbPastas.find(p => String(p.titulo).toLowerCase() === lancamento.toLowerCase());
        if (!pasta) {
          const { data: newPasta, error: newPastaErr } = await supabase.from('pastas').insert({
            titulo: lancamento,
            meta_pastas: 100,
            ativo: true
          }).select().single();
          if (newPastaErr) continue;
          pasta = newPasta;
          dbPastas.push(newPasta);
        }

        // Deleta as antigas desta pasta
        await supabase.from("ranking_pastas").delete().eq("pasta_id", pasta.id);

        const newEntries = [];

        // Corretores
        const cSorted = Object.entries(grouped[lancamento].corretores).sort((a, b) => b[1] - a[1]);
        let currentPos = 1; let lastCount = -1;
        for (let i = 0; i < cSorted.length; i++) {
          const [nome, count] = cSorted[i];
          const pId = getPessoaId(nome);
          if (!pId) continue;
          if (count !== lastCount) { currentPos = i + 1; lastCount = count; }
          newEntries.push({ pasta_id: pasta.id, pessoa_id: pId, categoria: "corretor", posicao: currentPos, quantidade_pastas: count, ativo: true });
        }

        // Gestores
        const gSorted = Object.entries(grouped[lancamento].gestores).sort((a, b) => b[1] - a[1]);
        currentPos = 1; lastCount = -1;
        for (let i = 0; i < gSorted.length; i++) {
          const [nome, count] = gSorted[i];
          const pId = getPessoaId(nome);
          if (!pId) continue;
          if (count !== lastCount) { currentPos = i + 1; lastCount = count; }
          newEntries.push({ pasta_id: pasta.id, pessoa_id: pId, categoria: "gestor", posicao: currentPos, quantidade_pastas: count, ativo: true });
        }

        if (newEntries.length > 0) {
          await supabase.from("ranking_pastas").insert(newEntries);
          rankingPastasCount += newEntries.length;
        }
      }

      resultLog.processed.push('pastas');
      resultLog.pastas = { upserted: pastas.length, ranking_pastas: rankingPastasCount };
    }

    // ─────────────────────────────────────────────────────────────────
    // 3. PROCESSAMENTO DE METAS
    // ─────────────────────────────────────────────────────────────────
    if (payload.metas && typeof payload.metas === 'object') {
      const vgvGlobal = parseFloat(payload.metas.vgv_global);
      
      if (!isNaN(vgvGlobal)) {
        const now = new Date();
        const monthNames = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
        const periodoStr = `${monthNames[now.getMonth()]} DE ${now.getFullYear()}`;

        // Obter configuração atual do mês
        const { data: currentMetas, error: getErr } = await supabase
          .from('config_metas')
          .select('*')
          .eq('meta_mensal_periodo', periodoStr)
          .limit(1);
          
        if (getErr) throw getErr;

        if (currentMetas && currentMetas.length > 0) {
          const metaToUpdate = currentMetas[0];
          const { error: updErr } = await supabase.from('config_metas').update({ meta_mensal_realizado: vgvGlobal }).eq('id', metaToUpdate.id);
          if (updErr) throw updErr;
        } else {
          // Se não houver, pega a última para copiar a meta_mensal_valor, ou usa default
          const { data: lastMeta } = await supabase.from('config_metas').select('meta_mensal_valor').order('id', { ascending: false }).limit(1);
          const metaValor = (lastMeta && lastMeta.length > 0) ? lastMeta[0].meta_mensal_valor : 60000000;
          
          // Inserir nova se não houver
          const { error: insErr } = await supabase.from('config_metas').insert({ 
            meta_mensal_titulo: `Meta Mensal - ${periodoStr}`,
            meta_mensal_valor: metaValor,
            meta_mensal_realizado: vgvGlobal,
            meta_mensal_periodo: periodoStr
          });
          if (insErr) throw insErr;
        }
        
        resultLog.processed.push('metas');
        resultLog.metas = { vgv_global_set: vgvGlobal, periodo: periodoStr };
      }
    }

    if (resultLog.processed.length === 0) {
      return res.status(400).json({ error: 'Nenhum payload válido identificado (buscando "vendas", "pastas" ou "metas").' });
    }

    return res.status(200).json({
      success: true,
      message: 'Webhook processado com sucesso!',
      log: resultLog
    });

  } catch (error) {
    console.error("Erro interno no Webhook:", error);
    return res.status(500).json({ error: 'Erro interno no servidor.', detail: error.message });
  }
}
