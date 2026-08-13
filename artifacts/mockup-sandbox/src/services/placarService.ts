import { supabase } from "../lib/supabase";
import type { Unidade, Pessoa, ConfigMetas, RankingEntry, PrimeiraVenda } from "../types/placar";

export interface Imovel {
  id: number;
  unidade_id: string;
  title: string;
  price?: string;
  area?: string;
  rooms?: string;
  garage?: string;
  address?: string;
  tag: string;
  tag_color: string;
  gradient: string;
  category: string;
  image_url: string;
  gallery: string[];
  qr_code_url?: string;
  video_url: string;
  ativo: boolean;
  description: string;
  criado_em?: string;
}

export interface SignageSettings {
  id?: number;
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

// ─── Imóvel Payload Serializer & Deserializer ─────────────────────────────────

const serializeImovelPayload = (i: Partial<Imovel>) => {
  let desc = i.description || "";
  if (i.gallery && Array.isArray(i.gallery) && i.gallery.length > 0) {
    desc = desc ? `${desc}\n__GALLERY__:${JSON.stringify(i.gallery)}` : `__GALLERY__:${JSON.stringify(i.gallery)}`;
  }
  
  const payload: Record<string, any> = {};
  if (i.unidade_id !== undefined) payload.unidade_id = i.unidade_id;
  if (i.title !== undefined) payload.title = i.title;
  if (i.tag !== undefined) payload.tag = i.tag;
  if (i.tag_color !== undefined) payload.tag_color = i.tag_color;
  if (i.gradient !== undefined) payload.gradient = i.gradient;
  if (i.image_url !== undefined) payload.image_url = i.image_url;
  if (i.video_url !== undefined) payload.video_url = i.video_url;
  if (i.ativo !== undefined) payload.ativo = i.ativo;
  if (i.qr_code_url !== undefined) payload.qr_code_url = i.qr_code_url;
  
  payload.description = desc;
  payload.address = i.category || i.address || "Geral";
  payload.price = i.price ?? "—";
  payload.area = i.area ?? "—";
  payload.rooms = i.rooms ?? "—";
  payload.garage = i.garage ?? "—";

  return payload;
};

const deserializeImovelRow = (row: any): Imovel => {
  let cleanDesc = row.description || "";
  let gallery: string[] = row.gallery || [];
  
  if (cleanDesc.includes("__GALLERY__:")) {
    const parts = cleanDesc.split("__GALLERY__:");
    cleanDesc = parts[0].trim();
    try {
      gallery = JSON.parse(parts[1]);
    } catch (e) {}
  }
  
  return {
    id: row.id,
    unidade_id: row.unidade_id || "jd-goias",
    title: row.title || "",
    price: row.price ?? "—",
    area: row.area ?? "—",
    rooms: row.rooms ?? "—",
    garage: row.garage ?? "—",
    address: row.address ?? "—",
    tag: row.tag || "NOVO",
    tag_color: row.tag_color || "#E30613",
    gradient: row.gradient || "linear-gradient(160deg,#1a2744,#2d3f6b)",
    category: row.category || row.address || "Geral",
    image_url: row.image_url || "",
    gallery: gallery,
    qr_code_url: row.qr_code_url || "",
    video_url: row.video_url || "",
    ativo: row.ativo !== undefined ? row.ativo : true,
    description: cleanDesc,
    criado_em: row.criado_em
  };
};

export const placarService = {
  // ─── Unidades ─────────────────────────────────────────────────────────────
  getUnidades: async (): Promise<Unidade[]> => {
    const { data, error } = await supabase.from("unidades").select("*").eq("ativo", true).order("nome");
    if (error) throw error;
    return data && data.length > 0 ? data : MOCK_UNIDADES;
  },

  // ─── Pessoas ──────────────────────────────────────────────────────────────
  getPessoas: async (unidade_id?: string, onlyAtivo = true): Promise<Pessoa[]> => {
    let query = supabase.from("pessoas").select("id, nome, cargo, unidade_id, foto_url, ativo").order("nome");
    if (onlyAtivo) query = query.eq("ativo", true);
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
    const { error } = await supabase.from("pessoas").delete().eq("id", id);
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
    const { data, error } = await supabase.from("ranking_entries").select(`*, pessoa:pessoas(id, nome, cargo, unidade_id, foto_url, ativo)`).eq("ativo", true);
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
    const { error } = await supabase.from("ranking_entries").delete().eq("id", id);
    if (error) throw error;
  },

  // ─── Primeira Venda ───────────────────────────────────────────────────────
  getPrimeiraVenda: async (unidadeId?: string): Promise<(PrimeiraVenda & { pessoa: Pessoa })[]> => {
    let query = supabase
      .from("primeira_venda")
      .select(`*, pessoa:pessoas(id, nome, cargo, unidade_id, foto_url, ativo)`)
      .eq("ativo", true);

    if (unidadeId && unidadeId !== "Todas") {
      const { data: pessoas } = await supabase
        .from("pessoas")
        .select("id")
        .eq("unidade_id", unidadeId)
        .eq("ativo", true);
      const ids = (pessoas || []).map(p => p.id);
      if (ids.length > 0) {
        query = query.in("pessoa_id", ids);
      } else {
        return [];
      }
    }

    const { data, error } = await query.order("criado_em", { ascending: false });
    
    if (error) throw error;
    return data ?? [];
  },
  savePrimeiraVenda: async (pv: Omit<PrimeiraVenda, "id" | "criado_em">): Promise<PrimeiraVenda> => {
    const { data, error } = await supabase.from("primeira_venda").insert(pv).select().single();
    if (error) throw error;
    return data;
  },
  deletePrimeiraVenda: async (id: string): Promise<void> => {
    const { error } = await supabase.from("primeira_venda").delete().eq("id", id);
    if (error) throw error;
  },

  // ─── Imóveis ──────────────────────────────────────────────────────────────
  getImoveis: async (unidade_id: string, onlyActive = false): Promise<Imovel[]> => {
    let query = supabase.from("imoveis").select("*").order("id");
    if (onlyActive) {
      query = query.eq("ativo", true);
    }
    if (unidade_id !== "Todas") {
      query = query.or(`unidade_id.eq.${unidade_id},unidade_id.eq.Todas`);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(deserializeImovelRow);
  },
  getAllImoveis: async (onlyActive = false): Promise<Imovel[]> => {
    let query = supabase.from("imoveis").select("*").order("id");
    if (onlyActive) {
      query = query.eq("ativo", true);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(deserializeImovelRow);
  },
  saveImovel: async (i: Omit<Imovel, "id" | "criado_em">): Promise<Imovel> => {
    const payload = serializeImovelPayload(i);
    const { data, error } = await supabase.from("imoveis").insert(payload).select().single();
    if (error) throw error;
    return deserializeImovelRow(data);
  },
  updateImovel: async (id: number, patch: Partial<Imovel>): Promise<Imovel> => {
    const payload = serializeImovelPayload(patch);
    const { data, error } = await supabase.from("imoveis").update(payload).eq("id", id).select().single();
    if (error) throw error;
    return deserializeImovelRow(data);
  },
  deleteImovel: async (id: number): Promise<void> => {
    const { error } = await supabase.from("imoveis").delete().eq("id", id);
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
