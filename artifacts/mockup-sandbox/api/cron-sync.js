import { createClient } from '@supabase/supabase-js';

const CULTURA_API_URL = "https://culturalopes.base44.app/api";
const CULTURA_API_KEY = "0f46b3a315864bfea3f7077ebec66320";

async function fetchCultura(endpoint) {
  const res = await fetch(`${CULTURA_API_URL}${endpoint}`, {
    headers: {
      "api_key": CULTURA_API_KEY,
      "Content-Type": "application/json"
    }
  });
  if (!res.ok) {
    throw new Error(`Cultura API Error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export default async function handler(req, res) {
  try {
    console.log("[Cron Sync] Iniciando sincronização automática com Cultura Lopes...");

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Configuração do Supabase ausente.' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthNumStr = String(currentMonth + 1).padStart(2, "0");
    const currentMonthPrefix = `${currentYear}-${monthNumStr}`; // "2026-09"

    const monthNames = [
      "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO",
      "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"
    ];
    const periodoStr = `${monthNames[currentMonth]} DE ${currentYear}`;

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
    // 1. SINCRONIZAÇÃO DE VENDAS E RANKING MENSAL
    // ─────────────────────────────────────────────────────────────────
    const vendas = await fetchCultura("/entities/VendaRegistrada?limit=5000");
    const groupedCorretores = {};
    const groupedGestores = {};
    let totalVgvMes = 0;

    for (const v of vendas) {
      if (!v.data_venda) continue;

      let isCurrentMonth = false;
      if (v.data_venda.startsWith(currentMonthPrefix)) {
        isCurrentMonth = true;
      } else {
        const parts = v.data_venda.split(/[/.-]/);
        if (parts.length >= 3) {
          const m = parseInt(parts[1], 10) - 1;
          const y = parseInt(parts[2].length === 2 ? `20${parts[2]}` : parts[2], 10);
          if (m === currentMonth && y === currentYear) isCurrentMonth = true;
        }
      }

      if (!isCurrentMonth || v.venda_oculta) continue;

      const st = normalize(v.status || "");
      if (st.includes("distrat") || st.includes("cancel")) continue;

      const val = Number(v.valor_venda) || 0;
      if (val <= 0) continue;

      totalVgvMes += val;

      if (v.corretor && !isIgnoredName(v.corretor)) {
        const cName = v.corretor.trim();
        groupedCorretores[cName] = (groupedCorretores[cName] || 0) + val;
      }
      if (v.gestor && !isIgnoredName(v.gestor)) {
        const gName = v.gestor.trim();
        groupedGestores[gName] = (groupedGestores[gName] || 0) + val;
      }
    }

    const { data: dbPessoas } = await supabase.from('pessoas').select('*').eq('ativo', true);
    const getPessoaId = (nome) => {
      if (!dbPessoas) return null;
      const match = dbPessoas.find(p => p.nome && normalize(p.nome) === normalize(nome));
      return match ? match.id : null;
    };

    // Limpa rankings antigos do mês
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

    // ─────────────────────────────────────────────────────────────────
    // 2. SINCRONIZAÇÃO DE METAS
    // ─────────────────────────────────────────────────────────────────
    let metaValorAlvo = null;
    try {
      const metas = await fetchCultura("/entities/MetaVendas?limit=1000");
      const metasMes = metas.filter(m => String(m.ano) === String(currentYear) && String(m.mes) === String(currentMonth + 1));
      if (metasMes.length > 0) {
        metaValorAlvo = metasMes.reduce((acc, m) => acc + (Number(m.valor_meta) || 0), 0);
      }
    } catch (e) {
      console.warn("Aviso ao buscar MetaVendas:", e);
    }

    // Atualiza config_metas
    const { data: currentMetas } = await supabase.from('config_metas').select('*').order('id', { ascending: true }).limit(1);
    const metaPayload = {
      meta_mensal_realizado: totalVgvMes,
      meta_mensal_periodo: periodoStr,
      meta_mensal_titulo: `Meta Mensal - ${periodoStr}`
    };
    if (metaValorAlvo && metaValorAlvo > 0) {
      metaPayload.meta_mensal_valor = metaValorAlvo;
    }

    if (currentMetas && currentMetas.length > 0) {
      await supabase.from('config_metas').update(metaPayload).eq('id', currentMetas[0].id);
    } else {
      await supabase.from('config_metas').insert({ ...metaPayload, meta_mensal_valor: metaValorAlvo || 60000000 });
    }

    // ─────────────────────────────────────────────────────────────────
    // 3. SINCRONIZAÇÃO DE PASTAS ATIVAS
    // ─────────────────────────────────────────────────────────────────
    let rankingsPastasCount = 0;
    const { data: dbPastas } = await supabase.from('pastas').select('*').eq('ativo', true);

    if (dbPastas && dbPastas.length > 0) {
      const filaPastas = await fetchCultura("/entities/FilaPasta?limit=2000");
      const groupedPastas = {};

      for (const p of filaPastas) {
        if (!p.lancamento) continue;
        const lanc = p.lancamento.trim();
        if (!groupedPastas[lanc]) groupedPastas[lanc] = { corretores: {}, gestores: {} };

        if (p.corretor && !isIgnoredName(p.corretor)) {
          const cName = p.corretor.trim();
          groupedPastas[lanc].corretores[cName] = (groupedPastas[lanc].corretores[cName] || 0) + 1;
        }
        if (p.gestor && !isIgnoredName(p.gestor)) {
          const gName = p.gestor.trim();
          groupedPastas[lanc].gestores[gName] = (groupedPastas[lanc].gestores[gName] || 0) + 1;
        }
      }

      for (const pasta of dbPastas) {
        const matchingLancamento = Object.keys(groupedPastas).find(
          l => l.toLowerCase() === pasta.titulo.toLowerCase() || normalize(l) === normalize(pasta.titulo)
        );

        await supabase.from("ranking_pastas").delete().eq("pasta_id", pasta.id);

        if (!matchingLancamento || !groupedPastas[matchingLancamento]) continue;

        const newPastaEntries = [];

        const cSorted = Object.entries(groupedPastas[matchingLancamento].corretores).sort((a, b) => b[1] - a[1]);
        let currentPos = 1; let lastCount = -1;
        for (let i = 0; i < cSorted.length; i++) {
          const [nome, count] = cSorted[i];
          const pId = getPessoaId(nome);
          if (!pId) continue;
          if (count !== lastCount) { currentPos = i + 1; lastCount = count; }
          newPastaEntries.push({ pasta_id: pasta.id, pessoa_id: pId, categoria: "corretor", posicao: currentPos, quantidade_pastas: count, ativo: true });
        }

        const gSorted = Object.entries(groupedPastas[matchingLancamento].gestores).sort((a, b) => b[1] - a[1]);
        currentPos = 1; lastCount = -1;
        for (let i = 0; i < gSorted.length; i++) {
          const [nome, count] = gSorted[i];
          const pId = getPessoaId(nome);
          if (!pId) continue;
          if (count !== lastCount) { currentPos = i + 1; lastCount = count; }
          newPastaEntries.push({ pasta_id: pasta.id, pessoa_id: pId, categoria: "gestor", posicao: currentPos, quantidade_pastas: count, ativo: true });
        }

        if (newPastaEntries.length > 0) {
          await supabase.from("ranking_pastas").insert(newPastaEntries);
          rankingsPastasCount += newPastaEntries.length;
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Sincronização Cron executada com sucesso!',
      timestamp: new Date().toISOString(),
      summary: {
        vendas_processadas: vendas.length,
        vgv_total_mes: totalVgvMes,
        ranking_vendas_inseridos: newEntries.length,
        pastas_ativas_atualizadas: dbPastas ? dbPastas.length : 0,
        ranking_pastas_inseridos: rankingsPastasCount
      }
    });

  } catch (error) {
    console.error("[Cron Sync] Erro interno:", error);
    return res.status(500).json({ error: 'Erro interno ao executar Cron Sync.', detail: error.message });
  }
}
