// ─── Lopes Digital Signage — Placar Service ───────────────────────────────────
//
// MOCK AGORA → SUPABASE DEPOIS
// Cada método retorna uma Promise para que a troca por chamadas reais
// ao supabase-js seja drop-in:
//
//   import { createClient } from "@supabase/supabase-js";
//   const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
//
//   getPessoas: async () => {
//     const { data } = await sb.from("pessoas").select("*").eq("ativo", true).order("nome");
//     return data ?? [];
//   }
//
// ─────────────────────────────────────────────────────────────────────────────

import type {
  Unidade, Pessoa, ConfigMetas,
  RankingEntry, PrimeiraVenda, PlacarData,
} from "../types/placar";

// ─── Seed data (espelha as tabelas Supabase) ──────────────────────────────────

export const MOCK_UNIDADES: Unidade[] = [
  { id: "jd-goias",  nome: "Lopes Jd. Goiás",       handle: "@lopesjdgoias",     ativo: true },
  { id: "marista",   nome: "Lopes Marista",           handle: "@lopesmarista",     ativo: true },
  { id: "bueno",     nome: "Lopes Bueno",             handle: "@lopesbueno",       ativo: true },
  { id: "gestao",    nome: "Gestão Patrimonial",      handle: "@lopespatrimonial", ativo: true },
];

export const MOCK_PESSOAS: Pessoa[] = [
  { id: "1",  nome: "Ayrton",           cargo: "gestor",    unidade_id: "jd-goias", ativo: true },
  { id: "2",  nome: "Douglas",          cargo: "gestor",    unidade_id: "marista",  ativo: true },
  { id: "3",  nome: "Thiago Rodrigues", cargo: "gestor",    unidade_id: "bueno",    ativo: true },
  { id: "4",  nome: "Ingrid",           cargo: "corretor",  unidade_id: "jd-goias", ativo: true },
  { id: "5",  nome: "Dariane",          cargo: "corretor",  unidade_id: "marista",  ativo: true },
  { id: "6",  nome: "Matheus V.",       cargo: "corretor",  unidade_id: "bueno",    ativo: true },
  { id: "7",  nome: "Ludmila A.",       cargo: "corretor",  unidade_id: "jd-goias", ativo: true },
  { id: "8",  nome: "Taisa B.",         cargo: "corretor",  unidade_id: "marista",  ativo: true },
  { id: "9",  nome: "Karulyne",         cargo: "corretor",  unidade_id: "bueno",    ativo: true },
  { id: "10", nome: "Maria Osanete",    cargo: "corretor",  unidade_id: "jd-goias", ativo: true },
];

const MOCK_CONFIG: ConfigMetas = {
  id: 1,
  meta_mensal_titulo:    "Meta de Maio",
  meta_mensal_valor:     20_000_000,
  meta_mensal_realizado: 4_720_000,
  meta_mensal_periodo:   "ANO DE 2026 - JD. GOIÁS",
  meta_anual_titulo:     "Meta Anual",
  meta_anual_valor:      240_000_000,
  meta_anual_realizado:  47_300_000,
  unidade_id:            "jd-goias",
};

const MOCK_PRIMEIRA_VENDA: PrimeiraVenda & { pessoa: Pessoa } = {
  id:         "pv-1",
  pessoa_id:  "10",
  mensagem:   "Parabéns pela venda!",
  detalhe:    "Você faz parte do crescimento da nossa empresa, nosso muito obrigado!",
  ativo:      true,
  semana:     20,
  ano:        2026,
  pessoa:     MOCK_PESSOAS.find(p => p.id === "10")!,
};

const periodo = "MAIO DE 2026";

const MOCK_RANKINGS: RankingEntry[] = [
  // Gestores Mensal
  { id: "gm1", pessoa_id: "1", tipo: "mensal",  categoria: "gestores",   posicao: 1, valor: 525_000,   periodo, ativo: true },
  // Corretores Mensal
  { id: "cm1", pessoa_id: "9", tipo: "mensal",  categoria: "corretores", posicao: 1, valor: 525_000,   periodo, ativo: true },
  // Gestores Anual
  { id: "ga1", pessoa_id: "1", tipo: "anual",   categoria: "gestores",   posicao: 1, valor: 5_804_137, periodo, ativo: true },
  { id: "ga2", pessoa_id: "2", tipo: "anual",   categoria: "gestores",   posicao: 2, valor: 5_612_373, periodo, ativo: true },
  { id: "ga3", pessoa_id: "3", tipo: "anual",   categoria: "gestores",   posicao: 3, valor: 4_844_423, periodo, ativo: true },
  // Corretores Anual
  { id: "ca1", pessoa_id: "4", tipo: "anual",   categoria: "corretores", posicao: 1, valor: 4_235_597, periodo, ativo: true },
  { id: "ca2", pessoa_id: "5", tipo: "anual",   categoria: "corretores", posicao: 2, valor: 3_974_605, periodo, ativo: true },
  { id: "ca3", pessoa_id: "6", tipo: "anual",   categoria: "corretores", posicao: 3, valor: 3_261_435, periodo, ativo: true },
  { id: "ca4", pessoa_id: "7", tipo: "anual",   categoria: "corretores", posicao: 4, valor: 2_774_257, periodo, ativo: true },
  { id: "ca5", pessoa_id: "8", tipo: "anual",   categoria: "corretores", posicao: 5, valor: 2_391_797, periodo, ativo: true },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function joinPessoa(entries: RankingEntry[], pessoas: Pessoa[]) {
  return entries.map(e => ({ ...e, pessoa: pessoas.find(p => p.id === e.pessoa_id) })) as (RankingEntry & { pessoa: Pessoa })[];
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const placarService = {

  // ── Leitura ────────────────────────────────────────────────────────────────

  getUnidades: async (): Promise<Unidade[]> =>
    structuredClone(MOCK_UNIDADES),

  getPessoas: async (): Promise<Pessoa[]> =>
    structuredClone(MOCK_PESSOAS),

  getConfig: async (): Promise<ConfigMetas> =>
    structuredClone(MOCK_CONFIG),

  getPrimeiraVenda: async (): Promise<(PrimeiraVenda & { pessoa: Pessoa }) | undefined> =>
    MOCK_PRIMEIRA_VENDA.ativo ? structuredClone(MOCK_PRIMEIRA_VENDA) : undefined,

  getRankings: async (): Promise<RankingEntry[]> =>
    structuredClone(MOCK_RANKINGS),

  /** Composto — consome tudo de uma vez para o PlacarLopes */
  getPlacarData: async (): Promise<PlacarData> => {
    const [unidades, pessoas, config, rankings, pv] = await Promise.all([
      placarService.getUnidades(),
      placarService.getPessoas(),
      placarService.getConfig(),
      placarService.getRankings(),
      placarService.getPrimeiraVenda(),
    ]);

    const unidade = unidades.find(u => u.id === config.unidade_id) ?? unidades[0];
    const byTipoCat = (t: "mensal" | "anual", c: "gestores" | "corretores") =>
      joinPessoa(
        rankings.filter(r => r.tipo === t && r.categoria === c && r.ativo).sort((a, b) => a.posicao - b.posicao),
        pessoas,
      );

    return {
      unidade,
      config,
      primeira_venda: pv,
      rankings: {
        gestores_mensal:   byTipoCat("mensal", "gestores"),
        corretores_mensal: byTipoCat("mensal", "corretores"),
        gestores_anual:    byTipoCat("anual",  "gestores"),
        corretores_anual:  byTipoCat("anual",  "corretores"),
      },
    };
  },

  // ── Escrita (mock: mutam os arrays em memória) ─────────────────────────────
  // Troque por: await sb.from("pessoas").insert(data) etc.

  savePessoa: async (p: Omit<Pessoa, "id" | "criado_em">): Promise<Pessoa> => {
    const nova: Pessoa = { ...p, id: crypto.randomUUID(), criado_em: new Date().toISOString() };
    MOCK_PESSOAS.push(nova);
    return nova;
  },

  updatePessoa: async (id: string, patch: Partial<Pessoa>): Promise<Pessoa> => {
    const idx = MOCK_PESSOAS.findIndex(p => p.id === id);
    if (idx < 0) throw new Error("Pessoa não encontrada");
    MOCK_PESSOAS[idx] = { ...MOCK_PESSOAS[idx], ...patch };
    return MOCK_PESSOAS[idx];
  },

  deletePessoa: async (id: string): Promise<void> => {
    const idx = MOCK_PESSOAS.findIndex(p => p.id === id);
    if (idx >= 0) MOCK_PESSOAS.splice(idx, 1);
  },

  saveRankingEntry: async (e: Omit<RankingEntry, "id" | "criado_em" | "atualizado_em">): Promise<RankingEntry> => {
    const nova: RankingEntry = { ...e, id: crypto.randomUUID(), criado_em: new Date().toISOString(), atualizado_em: new Date().toISOString() };
    MOCK_RANKINGS.push(nova);
    return nova;
  },

  updateRankingEntry: async (id: string, patch: Partial<RankingEntry>): Promise<RankingEntry> => {
    const idx = MOCK_RANKINGS.findIndex(r => r.id === id);
    if (idx < 0) throw new Error("Entrada não encontrada");
    MOCK_RANKINGS[idx] = { ...MOCK_RANKINGS[idx], ...patch, atualizado_em: new Date().toISOString() };
    return MOCK_RANKINGS[idx];
  },

  deleteRankingEntry: async (id: string): Promise<void> => {
    const idx = MOCK_RANKINGS.findIndex(r => r.id === id);
    if (idx >= 0) MOCK_RANKINGS.splice(idx, 1);
  },

  savePrimeiraVenda: async (data: Omit<PrimeiraVenda, "id" | "criado_em">): Promise<PrimeiraVenda> => {
    Object.assign(MOCK_PRIMEIRA_VENDA, { ...data, id: MOCK_PRIMEIRA_VENDA.id, criado_em: new Date().toISOString() });
    const pessoa = MOCK_PESSOAS.find(p => p.id === data.pessoa_id);
    if (pessoa) Object.assign(MOCK_PRIMEIRA_VENDA, { pessoa });
    return structuredClone(MOCK_PRIMEIRA_VENDA);
  },

  saveConfig: async (patch: Partial<ConfigMetas>): Promise<ConfigMetas> => {
    Object.assign(MOCK_CONFIG, { ...patch, atualizado_em: new Date().toISOString() });
    return structuredClone(MOCK_CONFIG);
  },
};
