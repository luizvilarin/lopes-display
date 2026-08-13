// ─── Lopes Digital Signage — Placar Types ─────────────────────────────────────
// Espelha exatamente as tabelas do Supabase.
// Troque os métodos do placarService por chamadas ao supabase-js para ir ao ar.

export interface Unidade {
  id: string;
  nome: string;
  handle: string; // ex: "@lopesjdgoias"
  ativo: boolean;
}

export type Cargo = "gestor" | "corretor";

export interface Pessoa {
  id: string;
  nome: string;
  cargo: Cargo;
  unidade_id: string;
  foto_url?: string;
  ativo: boolean;
  criado_em?: string;
}

export interface ConfigMetas {
  id: number;
  meta_mensal_titulo: string;
  meta_mensal_valor: number;
  meta_mensal_realizado: number;
  meta_mensal_periodo: string;
  meta_anual_titulo?: string;
  meta_anual_valor?: number;
  meta_anual_realizado?: number;
  unidade_id: string;
  atualizado_em?: string;
}

export type TipoRanking = "mensal" | "anual";
export type CategoriaRanking = "gestores" | "corretores";

export interface RankingEntry {
  id: string;
  pessoa_id: string;
  tipo: TipoRanking;
  categoria: CategoriaRanking;
  posicao: number;
  valor: number;
  periodo: string; // ex: "MAIO DE 2026"
  ativo: boolean;
  semana?: number;
  ano?: number;
  criado_em?: string;
  atualizado_em?: string;
  // join
  pessoa?: Pessoa;
}

export interface PrimeiraVenda {
  id: string;
  pessoa_id: string;
  mensagem: string;
  detalhe: string;
  ativo: boolean;
  semana?: number;
  ano?: number;
  criado_em?: string;
  // join
  pessoa?: Pessoa;
}

export interface Pasta {
  id: string;
  titulo: string;
  meta_pastas: number;
  unidade_id?: string;
  ativo: boolean;
  criado_em?: string;
}

export interface RankingPastaEntry {
  id: string;
  pasta_id: string;
  pessoa_id: string;
  categoria: "corretor" | "gestor";
  posicao: number;
  quantidade_pastas: number;
  ativo?: boolean;
  criado_em?: string;
  // join
  pessoa?: Pessoa;
  pasta?: Pasta;
}

// Payload composto que o PlacarLopes consome
export interface PlacarData {
  unidade: Unidade;
  config: ConfigMetas;
  primeira_venda?: PrimeiraVenda & { pessoa: Pessoa };
  pastas: Pasta[];
  rankings_pastas: RankingPastaEntry[];
  rankings: {
    gestores_mensal: RankingEntry[];
    corretores_mensal: RankingEntry[];
    gestores_anual: RankingEntry[];
    corretores_anual: RankingEntry[];
  };
}
