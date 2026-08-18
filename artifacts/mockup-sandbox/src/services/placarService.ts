import { supabase } from "../lib/supabase";
import type { Unidade, Pessoa, ConfigMetas, RankingEntry, PrimeiraVenda, Pasta, RankingPastaEntry } from "../types/placar";
import type { ParsedMonthData, ParsedPersonRanking } from "./excelImportService";

export function generateQRCodeUrl(link: string): string {
  if (!link || !link.trim()) return "";
  const cleanLink = link.trim();
  return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(cleanLink)}&margin=10`;
}

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
  banner_url?: string;
  materials_url?: string;
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
  if (i.banner_url) {
    desc = desc ? `${desc}\n__BANNER__:${i.banner_url}` : `__BANNER__:${i.banner_url}`;
  }
  if (i.materials_url) {
    desc = desc ? `${desc}\n__MATERIALS__:${i.materials_url}` : `__MATERIALS__:${i.materials_url}`;
  }
  if (i.gallery && Array.isArray(i.gallery) && i.gallery.length > 0) {
    desc = desc ? `${desc}\n__GALLERY__:${JSON.stringify(i.gallery)}` : `__GALLERY__:${JSON.stringify(i.gallery)}`;
  }
  
  const payload: Record<string, any> = {};
  if (i.unidade_id !== undefined) {
    payload.unidade_id = (i.unidade_id === "Todas" || !i.unidade_id) ? null : i.unidade_id;
  }
  if (i.title !== undefined) payload.title = i.title;
  if (i.tag !== undefined) payload.tag = i.tag;
  if (i.tag_color !== undefined) payload.tag_color = i.tag_color;
  if (i.gradient !== undefined) payload.gradient = i.gradient;
  
  if (i.category !== undefined) {
    payload.category = i.category;
    payload.address = i.category;
  } else if (i.address !== undefined) {
    payload.address = i.address;
    payload.category = i.address;
  }

  if (i.image_url !== undefined) payload.image_url = i.image_url;
  if (i.video_url !== undefined) payload.video_url = i.video_url;
  if (i.ativo !== undefined) payload.ativo = i.ativo;
  
  if (i.materials_url) {
    payload.qr_code_url = generateQRCodeUrl(i.materials_url);
  } else if (i.qr_code_url !== undefined) {
    payload.qr_code_url = i.qr_code_url;
  }
  
  if (i.description !== undefined || i.banner_url !== undefined || i.materials_url !== undefined || i.gallery !== undefined) {
    payload.description = desc;
  }

  if (i.price !== undefined) payload.price = i.price;
  if (i.area !== undefined) payload.area = i.area;
  if (i.rooms !== undefined) payload.rooms = i.rooms;
  if (i.garage !== undefined) payload.garage = i.garage;

  return payload;
};

const deserializeImovelRow = (row: any): Imovel => {
  let cleanDesc = row.description || "";
  let gallery: string[] = row.gallery || [];
  let bannerUrl: string | undefined = row.banner_url || undefined;
  let materialsUrl: string | undefined = undefined;

  if (cleanDesc.includes("__MATERIALS__:")) {
    const parts = cleanDesc.split("__MATERIALS__:");
    const subParts = (parts[1] || "").split("\n__GALLERY__:");
    const bannerParts = subParts[0].split("\n__BANNER__:");
    materialsUrl = bannerParts[0].trim();
    if (bannerParts[1]) bannerUrl = bannerParts[1].trim();
    cleanDesc = parts[0].trim();
    if (subParts[1]) {
      try {
        gallery = JSON.parse(subParts[1]);
      } catch (e) {}
    }
  } else if (cleanDesc.includes("__BANNER__:")) {
    const parts = cleanDesc.split("__BANNER__:");
    const subParts = (parts[1] || "").split("\n__GALLERY__:");
    bannerUrl = subParts[0].trim();
    cleanDesc = parts[0].trim();
    if (subParts[1]) {
      try {
        gallery = JSON.parse(subParts[1]);
      } catch (e) {}
    }
  } else if (cleanDesc.includes("__GALLERY__:")) {
    const parts = cleanDesc.split("__GALLERY__:");
    cleanDesc = parts[0].trim();
    try {
      gallery = JSON.parse(parts[1]);
    } catch (e) {}
  }
  
  // Tenta extrair o link original dos materiais do qr_code_url se não houver tag
  if (!materialsUrl && row.qr_code_url && row.qr_code_url.includes("data=")) {
    try {
      const match = row.qr_code_url.match(/data=([^&]+)/);
      if (match && match[1]) {
        materialsUrl = decodeURIComponent(match[1]);
      }
    } catch (e) {}
  }

  const calculatedQrCode = row.qr_code_url || (materialsUrl ? generateQRCodeUrl(materialsUrl) : "");

  return {
    id: row.id,
    unidade_id: row.unidade_id || "Todas",
    title: row.title || "",
    price: row.price ?? "—",
    area: row.area ?? "—",
    rooms: row.rooms ?? "—",
    garage: row.garage ?? "—",
    address: row.address ?? row.category ?? "Geral",
    tag: row.tag || "NOVO",
    tag_color: row.tag_color || "#E30613",
    gradient: row.gradient || "linear-gradient(160deg,#1a2744,#2d3f6b)",
    category: row.category || row.address || "Geral",
    image_url: row.image_url || "",
    banner_url: bannerUrl,
    materials_url: materialsUrl,
    gallery: gallery,
    qr_code_url: calculatedQrCode,
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

  // ─── Importação de Planilha Excel ─────────────────────────────────────────
  batchApplySpreadsheetImport: async (monthData: ParsedMonthData): Promise<void> => {
    // 1. Garante que todas as pessoas (existentes ou novas) existam no banco
    const processPerson = async (item: ParsedPersonRanking): Promise<string> => {
      if (item.matchedPessoa && !item.isNewPerson) {
        return item.matchedPessoa.id;
      }
      // Cria nova pessoa
      try {
        const newP = await placarService.savePessoa({
          nome: item.nameInExcel,
          cargo: item.suggestedCargo,
          unidade_id: item.suggestedUnidadeId,
          ativo: true
        });
        return newP.id;
      } catch (err) {
        console.error("Erro ao criar nova pessoa da planilha:", item.nameInExcel, err);
        // Fallback: pega a primeira pessoa cadastrada
        const existing = await placarService.getPessoas();
        return existing[0]?.id || "";
      }
    };

    // 2. Processa Corretores (Top 10)
    for (let idx = 0; idx < monthData.topCorretores.length; idx++) {
      const item = monthData.topCorretores[idx];
      const pessoaId = await processPerson(item);
      if (!pessoaId) continue;

      const pos = idx + 1;
      // Procura se já existe entrada nessa posição/categoria/período
      const existing = await supabase
        .from("ranking_entries")
        .select("id")
        .eq("periodo", monthData.periodo)
        .eq("categoria", "corretores")
        .eq("tipo", "mensal")
        .eq("posicao", pos)
        .maybeSingle();

      if (existing.data) {
        await placarService.updateRankingEntry(existing.data.id, {
          pessoa_id: pessoaId,
          valor: item.totalValor,
          instagram: item.matchedPessoa?.instagram || undefined
        });
      } else {
        await placarService.saveRankingEntry({
          pessoa_id: pessoaId,
          tipo: "mensal",
          categoria: "corretores",
          posicao: pos,
          valor: item.totalValor,
          periodo: monthData.periodo,
          instagram: item.matchedPessoa?.instagram || undefined,
          ativo: true
        });
      }
    }

    // 3. Processa Gestores (Top 5)
    for (let idx = 0; idx < monthData.topGestores.length; idx++) {
      const item = monthData.topGestores[idx];
      const pessoaId = await processPerson(item);
      if (!pessoaId) continue;

      const pos = idx + 1;
      const existing = await supabase
        .from("ranking_entries")
        .select("id")
        .eq("periodo", monthData.periodo)
        .eq("categoria", "gestores")
        .eq("tipo", "mensal")
        .eq("posicao", pos)
        .maybeSingle();

      if (existing.data) {
        await placarService.updateRankingEntry(existing.data.id, {
          pessoa_id: pessoaId,
          valor: item.totalValor,
          instagram: item.matchedPessoa?.instagram || undefined
        });
      } else {
        await placarService.saveRankingEntry({
          pessoa_id: pessoaId,
          tipo: "mensal",
          categoria: "gestores",
          posicao: pos,
          valor: item.totalValor,
          periodo: monthData.periodo,
          instagram: item.matchedPessoa?.instagram || undefined,
          ativo: true
        });
      }
    }
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

  // ─── Pastas (Ranking de Pastas Unificado) ─────────────────────────────────
  getPastas: async (): Promise<Pasta[]> => {
    try {
      const { data, error } = await supabase.from("pastas").select("*").order("criado_em", { ascending: false });
      if (!error && data && data.length > 0) return data;
    } catch (e) {}
    // Fallback LocalStorage
    const raw = localStorage.getItem("lopes_pastas");
    if (raw) {
      try { return JSON.parse(raw); } catch (e) {}
    }
    const defaultPastas: Pasta[] = [
      { id: "pasta-1", titulo: "Lançamento Residencial Park Lopes", meta_pastas: 50, ativo: true }
    ];
    localStorage.setItem("lopes_pastas", JSON.stringify(defaultPastas));
    return defaultPastas;
  },

  savePasta: async (p: Partial<Pasta>): Promise<Pasta> => {
    const newPasta: Pasta = {
      id: p.id || `pasta_${Date.now()}`,
      titulo: p.titulo || "Novo Lançamento",
      meta_pastas: Number(p.meta_pastas) || 30,
      ativo: p.ativo !== undefined ? p.ativo : true,
      criado_em: p.criado_em || new Date().toISOString()
    };
    try {
      const { data, error } = await supabase.from("pastas").upsert(newPasta).select().single();
      if (!error && data) return data;
    } catch (e) {}
    // LocalStorage Fallback
    const existing = await placarService.getPastas();
    const idx = existing.findIndex(x => x.id === newPasta.id);
    if (idx >= 0) existing[idx] = newPasta;
    else existing.push(newPasta);
    localStorage.setItem("lopes_pastas", JSON.stringify(existing));
    return newPasta;
  },

  deletePasta: async (id: string): Promise<void> => {
    try {
      await supabase.from("pastas").delete().eq("id", id);
    } catch (e) {}
    const existing = await placarService.getPastas();
    const filtered = existing.filter(x => x.id !== id);
    localStorage.setItem("lopes_pastas", JSON.stringify(filtered));
  },

  // ─── Ranking de Pastas ────────────────────────────────────────────────────
  getRankingPastas: async (pastaId?: string): Promise<(RankingPastaEntry & { pessoa?: Pessoa })[]> => {
    try {
      let query = supabase.from("ranking_pastas").select(`*, pessoa:pessoas(*)`);
      if (pastaId) query = query.eq("pasta_id", pastaId);
      const { data, error } = await query.order("posicao", { ascending: true });
      if (!error && data && data.length > 0) return data;
    } catch (e) {}
    // Fallback LocalStorage
    const raw = localStorage.getItem("lopes_ranking_pastas");
    if (raw) {
      try {
        let entries: RankingPastaEntry[] = JSON.parse(raw);
        if (pastaId) entries = entries.filter(e => e.pasta_id === pastaId);
        const pessoas = await placarService.getPessoas();
        return entries.map(e => ({
          ...e,
          pessoa: pessoas.find(p => p.id === e.pessoa_id)
        }));
      } catch (e) {}
    }
    return [];
  },

  saveRankingPastaEntry: async (entry: Partial<RankingPastaEntry>): Promise<RankingPastaEntry> => {
    const newEntry: RankingPastaEntry = {
      id: entry.id || `rpe_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      pasta_id: entry.pasta_id || "",
      pessoa_id: entry.pessoa_id || "",
      categoria: entry.categoria || "corretor",
      posicao: Number(entry.posicao) || 1,
      quantidade_pastas: Number(entry.quantidade_pastas) || 1,
      ativo: true
    };
    try {
      const { data, error } = await supabase.from("ranking_pastas").upsert({
        id: newEntry.id,
        pasta_id: newEntry.pasta_id,
        pessoa_id: newEntry.pessoa_id,
        categoria: newEntry.categoria,
        posicao: newEntry.posicao,
        quantidade_pastas: newEntry.quantidade_pastas
      }).select().single();
      if (!error && data) return data;
    } catch (e) {}
    // LocalStorage Fallback
    const raw = localStorage.getItem("lopes_ranking_pastas");
    let list: RankingPastaEntry[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex(x => x.id === newEntry.id || (x.pasta_id === newEntry.pasta_id && x.pessoa_id === newEntry.pessoa_id && x.categoria === newEntry.categoria));
    if (idx >= 0) list[idx] = { ...list[idx], ...newEntry };
    else list.push(newEntry);
    localStorage.setItem("lopes_ranking_pastas", JSON.stringify(list));
    return newEntry;
  },

  deleteRankingPastaEntry: async (id: string): Promise<void> => {
    try {
      await supabase.from("ranking_pastas").delete().eq("id", id);
    } catch (e) {}
    const raw = localStorage.getItem("lopes_ranking_pastas");
    if (raw) {
      let list: RankingPastaEntry[] = JSON.parse(raw);
      list = list.filter(x => x.id !== id);
      localStorage.setItem("lopes_ranking_pastas", JSON.stringify(list));
    }
  },

  // ─── Imóveis ──────────────────────────────────────────────────────────────
  getImoveis: async (unidade_id: string, onlyActive = false): Promise<Imovel[]> => {
    let query = supabase.from("imoveis").select("*").order("id");
    if (onlyActive) {
      query = query.eq("ativo", true);
    }
    if (unidade_id !== "Todas") {
      query = query.or(`unidade_id.eq.${unidade_id},unidade_id.is.null,unidade_id.eq.Todas`);
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
    if (error) {
      if (error.message?.includes("foreign key") || error.code === "23503") {
        payload.unidade_id = null;
        const { data: retryData, error: retryErr } = await supabase.from("imoveis").insert(payload).select().single();
        if (retryErr) throw retryErr;
        return deserializeImovelRow(retryData);
      }
      throw error;
    }
    return deserializeImovelRow(data);
  },
  updateImovel: async (id: number, patch: Partial<Imovel>): Promise<Imovel> => {
    const payload = serializeImovelPayload(patch);
    const { data, error } = await supabase.from("imoveis").update(payload).eq("id", id).select().single();
    if (error) {
      if (error.message?.includes("foreign key") || error.code === "23503") {
        payload.unidade_id = null;
        const { data: retryData, error: retryErr } = await supabase.from("imoveis").update(payload).eq("id", id).select().single();
        if (retryErr) throw retryErr;
        return deserializeImovelRow(retryData);
      }
      throw error;
    }
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
