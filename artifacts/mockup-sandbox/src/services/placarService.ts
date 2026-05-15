import { supabase } from "../lib/supabase";
import type { Unidade, Pessoa, ConfigMetas, RankingEntry, PrimeiraVenda } from "../types/placar";

export interface Imovel {
  id: number;
  unidade_id: string;
  title: string;
  price: string;
  area: string;
  rooms: string;
  garage: string;
  address: string;
  tag: string;
  tag_color: string;
  gradient: string;
  image_url: string;
  qr_code_url?: string;
  video_url: string;
  ativo: boolean;
  description: string;
  criado_em?: string;
}

export interface SignageSettings {
  id: number;
  unidade_id: string;
  theme: "dark" | "light";
  auto_rotate: boolean;
  rot_interval: number;
  timer_label1: string;
  timer_label2: string;
  timer_label3: string;
  timer_seconds: number;
  atualizado_em?: string;
}

export const MOCK_UNIDADES: Unidade[] = [
  { id: "jd-goias", nome: "Lopes Jardim Goiás", handle: "@lopesjdgoias", ativo: true },
  { id: "marista",  nome: "Lopes Marista",       handle: "@lopesmarista",  ativo: true },
  { id: "bueno",    nome: "Lopes Bueno",         handle: "@lopesbueno",    ativo: true },
  { id: "oeste",    nome: "Lopes Oeste",         handle: "@lopesoeste",    ativo: true }
];

export const placarService = {
  // ─── Unidades ─────────────────────────────────────────────────────────────
  getUnidades: async (): Promise<Unidade[]> => {
    const { data, error } = await supabase.from("unidades").select("*").eq("ativo", true).order("nome");
    if (error) throw error;
    return data && data.length > 0 ? data : MOCK_UNIDADES;
  },

  // ─── Pessoas ──────────────────────────────────────────────────────────────
  getPessoas: async (unidade_id?: string): Promise<Pessoa[]> => {
    let query = supabase.from("pessoas").select("*").eq("ativo", true).order("nome");
    if (unidade_id) query = query.eq("unidade_id", unidade_id);
    
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  },
  savePessoa: async (p: Omit<Pessoa, "id" | "criado_em">): Promise<Pessoa> => {
    const { data, error } = await supabase.from("pessoas").insert(p).select().single();
    if (error) throw error;
    return data;
  },
  updatePessoa: async (id: string, patch: Partial<Pessoa>): Promise<Pessoa> => {
    const { data, error } = await supabase.from("pessoas").update(patch).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },
  deletePessoa: async (id: string): Promise<void> => {
    const { error } = await supabase.from("pessoas").update({ ativo: false }).eq("id", id);
    if (error) throw error;
  },

  // ─── Config Metas ─────────────────────────────────────────────────────────
  getConfig: async (unidade_id?: string): Promise<ConfigMetas | null> => {
    let query = supabase.from("config_metas").select("*");
    if (unidade_id) {
      query = query.eq("unidade_id", unidade_id);
    }
    const { data, error } = await query.limit(1);
    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  },
  saveConfig: async (patch: Partial<ConfigMetas>): Promise<ConfigMetas> => {
    // Se tiver ID, atualiza. Caso contrário tenta pegar o primeiro ou inserir.
    if (patch.id) {
      const { data, error } = await supabase.from("config_metas").update(patch).eq("id", patch.id).select().single();
      if (error) throw error;
      return data;
    }
    
    const existing = await placarService.getConfig(patch.unidade_id || undefined);
    if (existing) {
      const { data, error } = await supabase.from("config_metas").update(patch).eq("id", existing.id).select().single();
      if (error) throw error;
      return data;
    } else {
      const payload = { 
        ...patch, 
        unidade_id: patch.unidade_id || "jd-goias"
      };
      const { data, error } = await supabase.from("config_metas").insert(payload).select().single();
      if (error) throw error;
      return data;
    }
  },

  // ─── Rankings ─────────────────────────────────────────────────────────────
  getRankings: async (): Promise<(RankingEntry & { pessoa?: Pessoa })[]> => {
    const { data, error } = await supabase.from("ranking_entries").select(`*, pessoa:pessoas(*)`).eq("ativo", true);
    if (error) throw error;
    return data ?? [];
  },
  saveRankingEntry: async (e: Omit<RankingEntry, "id" | "criado_em" | "atualizado_em">): Promise<RankingEntry> => {
    const { data, error } = await supabase.from("ranking_entries").insert(e).select().single();
    if (error) throw error;
    return data;
  },
  updateRankingEntry: async (id: string, patch: Partial<RankingEntry>): Promise<RankingEntry> => {
    const { data, error } = await supabase.from("ranking_entries").update(patch).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },
  deleteRankingEntry: async (id: string): Promise<void> => {
    const { error } = await supabase.from("ranking_entries").update({ ativo: false }).eq("id", id);
    if (error) throw error;
  },

  // ─── Primeira Venda ───────────────────────────────────────────────────────
  getPrimeiraVenda: async (): Promise<(PrimeiraVenda & { pessoa: Pessoa }) | null> => {
    const { data, error } = await supabase
      .from("primeira_venda")
      .select(`*, pessoa:pessoas(*)`)
      .eq("ativo", true)
      .order("criado_em", { ascending: false })
      .limit(1);
    
    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  },
  savePrimeiraVenda: async (pv: Omit<PrimeiraVenda, "id" | "criado_em">): Promise<PrimeiraVenda> => {
    // Inativa os anteriores
    await supabase.from("primeira_venda").update({ ativo: false }).eq("ativo", true);
    const { data, error } = await supabase.from("primeira_venda").insert(pv).select().single();
    if (error) throw error;
    return data;
  },

  // ─── Imóveis ──────────────────────────────────────────────────────────────
  getImoveis: async (unidade_id: string): Promise<Imovel[]> => {
    const { data, error } = await supabase
      .from("imoveis")
      .select("*")
      .eq("unidade_id", unidade_id)
      .eq("ativo", true)
      .order("id");
    
    if (error) throw error;
    return data ?? [];
  },
  getAllImoveis: async (): Promise<Imovel[]> => {
    const { data, error } = await supabase
      .from("imoveis")
      .select("*")
      .eq("ativo", true)
      .order("id");
    
    if (error) throw error;
    return data ?? [];
  },
  saveImovel: async (i: Omit<Imovel, "id" | "criado_em">): Promise<Imovel> => {
    const { data, error } = await supabase.from("imoveis").insert(i).select().single();
    if (error) throw error;
    return data;
  },
  updateImovel: async (id: number, patch: Partial<Imovel>): Promise<Imovel> => {
    const { data, error } = await supabase.from("imoveis").update(patch).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },
  deleteImovel: async (id: number): Promise<void> => {
    const { error } = await supabase.from("imoveis").update({ ativo: false }).eq("id", id);
    if (error) throw error;
  },

  // ─── Configurações de Signage (TV) ────────────────────────────────────────
  getSignageConfig: async (unidade_id: string): Promise<SignageSettings | null> => {
    const { data, error } = await supabase
      .from("signage_settings")
      .select("*")
      .eq("unidade_id", unidade_id)
      .limit(1);
    
    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  },
  saveSignageConfig: async (patch: Partial<SignageSettings> & { unidade_id: string }): Promise<SignageSettings> => {
    const existing = await placarService.getSignageConfig(patch.unidade_id);
    if (existing) {
      const { data, error } = await supabase
        .from("signage_settings")
        .update(patch)
        .eq("id", existing.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from("signage_settings")
        .insert(patch)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  // ─── Admin Auth PIN ───────────────────────────────────────────────────────
  getAdminPin: async (): Promise<string> => {
    const { data, error } = await supabase.from("admin_auth").select("pin").limit(1);
    if (error) throw error;
    return data && data.length > 0 ? data[0].pin : "2025";
  },
  saveAdminPin: async (newPin: string): Promise<void> => {
    const { error } = await supabase.from("admin_auth").update({ pin: newPin }).eq("id", 1);
    if (error) throw error;
  }
};

// Manter export dbService temporariamente caso haja alguma outra referência antiga
export const dbService = placarService;
