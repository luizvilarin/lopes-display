import { supabase } from "../lib/supabase";
import type { Unidade, Pessoa, ConfigMetas, RankingEntry, PrimeiraVenda, Pasta, RankingPastaEntry } from "../types/placar";
import { n8nService } from "./n8nService";

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
  let rawDesc = i.description || "";
  // Limpa quaisquer tags pré-existentes para não duplicar nem poluir a descrição humana
  let cleanUserDesc = rawDesc.replace(/__(BANNER|MATERIALS|GALLERY)__:[\s\S]*?(?=(\n__(BANNER|MATERIALS|GALLERY)__:|$))/g, "").trim();

  let desc = cleanUserDesc;
  if (i.banner_url && i.banner_url.trim()) {
    desc = desc ? `${desc}\n__BANNER__:${i.banner_url.trim()}` : `__BANNER__:${i.banner_url.trim()}`;
  }
  if (i.materials_url && i.materials_url.trim()) {
    desc = desc ? `${desc}\n__MATERIALS__:${i.materials_url.trim()}` : `__MATERIALS__:${i.materials_url.trim()}`;
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
    payload.address = i.category;
  } else if (i.address !== undefined) {
    payload.address = i.address;
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

  if (i.price !== undefined) {
    payload.price = (i.price && String(i.price).trim()) ? String(i.price).trim() : "—";
  }
  if (i.area !== undefined) {
    payload.area = (i.area && String(i.area).trim()) ? String(i.area).trim() : "—";
  }
  if (i.rooms !== undefined) {
    payload.rooms = (i.rooms && String(i.rooms).trim()) ? String(i.rooms).trim() : "—";
  }
  if (i.garage !== undefined) {
    payload.garage = (i.garage && String(i.garage).trim()) ? String(i.garage).trim() : "—";
  }

  return payload;
};

const deserializeImovelRow = (row: any): Imovel => {
  const fullDesc = row.description || "";
  let gallery: string[] = row.gallery || [];
  let bannerUrl: string | undefined = row.banner_url || undefined;
  let materialsUrl: string | undefined = undefined;

  // 1. Extrai __BANNER__:
  const bannerMatch = fullDesc.match(/__BANNER__:([\s\S]*?)(?=(\n__(BANNER|MATERIALS|GALLERY)__:|$))/);
  if (bannerMatch && bannerMatch[1]) {
    bannerUrl = bannerMatch[1].trim();
  }

  // 2. Extrai __MATERIALS__:
  const materialsMatch = fullDesc.match(/__MATERIALS__:([\s\S]*?)(?=(\n__(BANNER|MATERIALS|GALLERY)__:|$))/);
  if (materialsMatch && materialsMatch[1]) {
    materialsUrl = materialsMatch[1].trim();
  }

  // 3. Extrai __GALLERY__:
  const galleryMatch = fullDesc.match(/__GALLERY__:([\s\S]*?)(?=(\n__(BANNER|MATERIALS|GALLERY)__:|$))/);
  if (galleryMatch && galleryMatch[1]) {
    try {
      gallery = JSON.parse(galleryMatch[1].trim());
    } catch (e) {
      console.warn("Erro ao fazer parse da galeria:", e);
    }
  }

  // 4. Limpa todas as tags para obter a descrição humana pura
  const cleanDesc = fullDesc
    .replace(/__(BANNER|MATERIALS|GALLERY)__:[\s\S]*?(?=(\n__(BANNER|MATERIALS|GALLERY)__:|$))/g, "")
    .trim();
  
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

// ─── Inteligência de Correspondência de Nomes e Desduplicação ─────────────────

export const normalizeName = (str: string) => 
  str ? String(str).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";

export const NAME_STOP_WORDS = new Set(["de", "da", "do", "dos", "das", "e", "filho", "junior", "jr", "neto", "sobrinho"]);

export const KNOWN_PERSON_ALIASES: Record<string, string> = {
  "jannerson": "jann",
  "jannerson silva costa": "jann costa",
  "jakelline fernanda dos santos": "jakelline fernanda",
  "sulamita saron dos santos silva costa": "sulamita saron alves cabral de oliveira",
  "sulamita cabral": "sulamita saron alves cabral de oliveira",
  "eduardo bueno pereira": "eduardo bueno",
  "eurico dardeau de albuquerqur filho": "eurico dardeau",
  "eurico dardeau de albuquerque filho": "eurico dardeau",
  "iasmin bezerra de oliveira": "yasmin bezerra",
};

export const getPersonTokens = (nome: string): string[] => {
  return normalizeName(nome)
    .split(/\s+/)
    .filter(t => t.length > 1 && !NAME_STOP_WORDS.has(t));
};

export const areDirectCompatiblePersons = (nameA: string, nameB: string, allPeople: Pessoa[]): boolean => {
  const normA = normalizeName(nameA);
  const normB = normalizeName(nameB);

  if (!normA || !normB) return false;
  if (normA === normB) return true;

  if (KNOWN_PERSON_ALIASES[normA] === normB || KNOWN_PERSON_ALIASES[normB] === normA) return true;
  if (KNOWN_PERSON_ALIASES[normA] && normalizeName(KNOWN_PERSON_ALIASES[normA]) === normB) return true;
  if (KNOWN_PERSON_ALIASES[normB] && normalizeName(KNOWN_PERSON_ALIASES[normB]) === normA) return true;

  const tA = getPersonTokens(normA);
  const tB = getPersonTokens(normB);
  if (tA.length === 0 || tB.length === 0) return false;

  // Primeiro nome deve ser idêntico ou prefixo claro (>= 4 letras)
  if (tA[0] !== tB[0] && !tA[0].startsWith(tB[0]) && !tB[0].startsWith(tA[0])) return false;

  const [shorter, longer, nameShort] = tA.length <= tB.length ? [tA, tB, nameA] : [tB, tA, nameB];
  
  if (!shorter.every(t => longer.includes(t))) {
    return false;
  }

  // Se o menor possui apenas 1 token, valida se há ambiguidade na empresa
  if (shorter.length === 1) {
    const singleToken = shorter[0];
    const multiTokenPeople = allPeople.filter(p => {
      const pTokens = getPersonTokens(p.nome);
      return pTokens.length > 1 && (pTokens[0] === singleToken || pTokens[0].startsWith(singleToken) || singleToken.startsWith(pTokens[0]));
    });

    const distinctFamilies = new Set(multiTokenPeople.map(p => {
      const pToks = getPersonTokens(p.nome);
      return pToks.slice(0, 2).join(" ");
    }));

    if (distinctFamilies.size > 1) {
      return false; // Ambíguo
    }
  }

  // Se o menor possui 2 tokens (ex: "Ana Clara"), verifica se há conflito de sobrenomes distintos
  if (shorter.length === 2) {
    const prefix = shorter.slice(0, 2).join(" ");
    const candidates = allPeople.filter(p => {
      const pToks = getPersonTokens(p.nome);
      return pToks.length >= 2 && pToks.slice(0, 2).join(" ") === prefix;
    });

    const candidateSurnames = new Set<string>();
    candidates.forEach(c => {
      const cToks = getPersonTokens(c.nome);
      if (cToks.length > 2) {
        candidateSurnames.add(cToks.slice(2).join(" "));
      }
    });

    if (candidateSurnames.size > 1 && getPersonTokens(nameShort).length === 2) {
      return false; // Ambíguo
    }
  }

  return true;
};

export const findPessoaMatch = (nomeCultura: string, dbPessoas: Pessoa[], onlyActive: boolean = true): Pessoa | null => {
  const normCultura = normalizeName(nomeCultura);
  if (!normCultura) return null;

  const pool = onlyActive ? dbPessoas.filter(p => p.ativo) : dbPessoas;

  // 1. Match exato normalizado
  const exact = pool.find(p => normalizeName(p.nome) === normCultura);
  if (exact) return exact;

  // 2. Apelido / Mapeamento conhecido
  const aliasTarget = KNOWN_PERSON_ALIASES[normCultura];
  if (aliasTarget) {
    const aliasMatch = pool.find(p => normalizeName(p.nome).includes(aliasTarget));
    if (aliasMatch) return aliasMatch;
  }

  // 3. Comparação inteligente por tokens
  const tokensCultura = getPersonTokens(nomeCultura);
  if (tokensCultura.length === 0) return null;

  const firstTokenCultura = tokensCultura[0];
  const secondTokenCultura = tokensCultura.length > 1 ? tokensCultura[1] : "";

  let bestMatch: Pessoa | null = null;
  let highestScore = 0;

  for (const p of pool) {
    const pTokens = getPersonTokens(p.nome);
    if (pTokens.length === 0) continue;

    const firstTokenP = pTokens[0];
    const firstMatches = firstTokenCultura === firstTokenP || 
      (firstTokenCultura.startsWith(firstTokenP) && firstTokenP.length >= 4) ||
      (firstTokenP.startsWith(firstTokenCultura) && firstTokenCultura.length >= 4);

    if (!firstMatches) continue;

    if (secondTokenCultura && pTokens.length > 1 && secondTokenCultura === pTokens[1]) {
      return p;
    }

    let matchesCount = 0;
    for (const tc of tokensCultura) {
      if (pTokens.includes(tc)) matchesCount++;
    }

    const score = matchesCount / Math.max(tokensCultura.length, pTokens.length);
    if (matchesCount >= 2 && score > highestScore) {
      highestScore = score;
      bestMatch = p;
    }
  }

  if (bestMatch && highestScore >= 0.3) {
    return bestMatch;
  }

  return null;
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
    // Previne inserção acidental se já existir pessoa equivalente
    const all = await placarService.getPessoas(undefined, false);
    const existing = findPessoaMatch(p.nome, all, false);
    if (existing) {
      return await placarService.updatePessoa(existing.id, {
        ...p,
        ativo: p.ativo !== undefined ? p.ativo : true
      });
    }
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
  syncPessoasFromCultura: async (): Promise<{ added: number, updated: number }> => {
    try {
      const { culturaService } = await import('./culturaService');
      const corretores = await culturaService.getCorretores();
      const dbPessoas = await placarService.getPessoas(undefined, false);
      const unidades = await placarService.getUnidades();
      
      let added = 0;
      let updated = 0;

      for (const c of corretores) {
        if (!c.nome_completo) continue;
        
        let unitId = "jd-goias"; // fallback
        if (c.loja) {
          const matchUnit = unidades.find(u => normalizeName(u.nome).includes(normalizeName(c.loja)));
          if (matchUnit) unitId = matchUnit.id;
        }

        const isActive = c.status_ativo === "Ativo";
        const cargo = (c.cargo && c.cargo.toLowerCase().includes("gestor")) ? "gestor" : "corretor";

        // Busca inteligente anti-duplicidade
        const existing = findPessoaMatch(c.nome_completo, dbPessoas, false);
        if (existing) {
          const patch: Partial<Pessoa> = {};
          if (existing.ativo !== isActive) patch.ativo = isActive;
          if (existing.cargo !== cargo) patch.cargo = cargo;
          if (existing.unidade_id !== unitId) patch.unidade_id = unitId;
          // Se o nome do Cultura for mais completo que o cadastrado
          if (c.nome_completo.length > existing.nome.length && !existing.nome.includes(" ")) {
            patch.nome = c.nome_completo;
          }

          if (Object.keys(patch).length > 0) {
            await placarService.updatePessoa(existing.id, patch);
            updated++;
          }
        } else if (isActive) {
          // Insere novo apenas se for ativo e não existir match
          const novo = await placarService.savePessoa({
            nome: c.nome_completo,
            cargo: cargo,
            unidade_id: unitId,
            ativo: true,
            foto_url: ""
          });
          dbPessoas.push(novo);
          added++;
        }
      }
      return { added, updated };
    } catch (err) {
      console.error("Erro na sincronização:", err);
      throw err;
    }
  },

  deduplicatePessoas: async (): Promise<{ mergedCount: number, clustersCount: number }> => {
    try {
      const dbPessoas = await placarService.getPessoas(undefined, false);
      const { data: rankingEntries } = await supabase.from("ranking_entries").select("*");
      const { data: primeiraVenda } = await supabase.from("primeira_venda").select("*");
      const { data: rankingPastas } = await supabase.from("ranking_pastas").select("*");
      const { data: progressoes } = await supabase.from("progressoes_carreira").select("*");

      const adj = new Map<string, Pessoa[]>();
      dbPessoas.forEach(p => adj.set(p.id, []));

      for (let i = 0; i < dbPessoas.length; i++) {
        for (let j = i + 1; j < dbPessoas.length; j++) {
          const p1 = dbPessoas[i];
          const p2 = dbPessoas[j];
          if (areDirectCompatiblePersons(p1.nome, p2.nome, dbPessoas)) {
            adj.get(p1.id)?.push(p2);
            adj.get(p2.id)?.push(p1);
          }
        }
      }

      const visited = new Set<string>();
      const clusters: Pessoa[][] = [];

      dbPessoas.forEach(p => {
        if (visited.has(p.id)) return;
        const queue = [p];
        visited.add(p.id);
        const component: Pessoa[] = [];
        while (queue.length > 0) {
          const curr = queue.shift()!;
          component.push(curr);
          const neighbors = adj.get(curr.id) || [];
          for (const n of neighbors) {
            if (!visited.has(n.id)) {
              visited.add(n.id);
              queue.push(n);
            }
          }
        }
        if (component.length > 1) {
          clusters.push(component);
        }
      });

      let mergedCount = 0;
      let clustersProcessed = 0;

      for (const cluster of clusters) {
        const longestNameMember = [...cluster].sort((a, b) => 
          getPersonTokens(b.nome).length - getPersonTokens(a.nome).length || b.nome.length - a.nome.length
        )[0];

        const memberWithPhoto = cluster.find(m => m.foto_url && m.foto_url.trim());
        const memberWithInsta = cluster.find(m => m.instagram && m.instagram.trim());

        const survivor = memberWithPhoto || longestNameMember;

        const survivorPatch: Partial<Pessoa> = {};
        if (!survivor.foto_url && memberWithPhoto) {
          survivorPatch.foto_url = memberWithPhoto.foto_url;
        }
        if (!survivor.instagram && memberWithInsta) {
          survivorPatch.instagram = memberWithInsta.instagram;
        }
        if (survivor.nome.length < longestNameMember.nome.length) {
          survivorPatch.nome = longestNameMember.nome;
        }
        if (survivor.ativo === false && cluster.some(m => m.ativo !== false)) {
          survivorPatch.ativo = true;
        }

        if (Object.keys(survivorPatch).length > 0) {
          await placarService.updatePessoa(survivor.id, survivorPatch);
        }

        const duplicates = cluster.filter(m => m.id !== survivor.id);

        for (const d of duplicates) {
          // Reatribuição de FKs
          const dRanking = (rankingEntries || []).filter(r => r.pessoa_id === d.id);
          for (const r of dRanking) {
            const existingSurvivorRanking = (rankingEntries || []).find(x => 
              x.pessoa_id === survivor.id && x.categoria === r.categoria && x.cargo === r.cargo && x.posicao === r.posicao
            );
            if (existingSurvivorRanking) {
              await supabase.from("ranking_entries").delete().eq("id", r.id);
            } else {
              await supabase.from("ranking_entries").update({ pessoa_id: survivor.id }).eq("id", r.id);
            }
          }

          const dPV = (primeiraVenda || []).filter(pv => pv.pessoa_id === d.id);
          for (const pv of dPV) {
            const survivorPV = (primeiraVenda || []).find(x => x.pessoa_id === survivor.id);
            if (survivorPV) {
              await supabase.from("primeira_venda").delete().eq("id", pv.id);
            } else {
              await supabase.from("primeira_venda").update({ pessoa_id: survivor.id }).eq("id", pv.id);
            }
          }

          const dRP = (rankingPastas || []).filter(rp => rp.pessoa_id === d.id);
          for (const rp of dRP) {
            const survivorRP = (rankingPastas || []).find(x => x.pessoa_id === survivor.id && x.mes === rp.mes && x.ano === rp.ano);
            if (survivorRP) {
              await supabase.from("ranking_pastas").delete().eq("id", rp.id);
            } else {
              await supabase.from("ranking_pastas").update({ pessoa_id: survivor.id }).eq("id", rp.id);
            }
          }

          const dPC = (progressoes || []).filter(pc => pc.pessoa_id === d.id);
          for (const pc of dPC) {
            await supabase.from("progressoes_carreira").update({ pessoa_id: survivor.id }).eq("id", pc.id);
          }

          await placarService.deletePessoa(d.id);
          mergedCount++;
        }

        clustersProcessed++;
      }

      return { mergedCount, clustersCount: clustersProcessed };
    } catch (err) {
      console.error("Erro na desduplicação de pessoas:", err);
      throw err;
    }
  },

  // ─── Config Metas ─────────────────────────────────────────────────────────
  getConfig: async (unidade_id?: string): Promise<ConfigMetas | null> => {
    // Meta unificada: busca sempre a primeira configuração (ID mais baixo)
    const { data, error } = await supabase.from("config_metas").select("*").order("id", { ascending: true }).limit(1);
    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  },
  saveConfig: async (patch: Partial<ConfigMetas>): Promise<ConfigMetas> => {
    // Meta unificada: atualiza sempre a configuração global existente
    const existing = await placarService.getConfig();
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

  getRankings: async (): Promise<(RankingEntry & { pessoa?: Pessoa })[]> => {
    // Busca sem .eq("ativo", true) para evitar timeout do planner do Supabase
    const { data, error } = await supabase.from("ranking_entries").select(`*, pessoa:pessoas(id, nome, cargo, unidade_id, foto_url, ativo)`);
    if (error) throw error;
    const all = data ?? [];
    return all.filter(r => r.ativo === true);
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
  isWeek4: (): boolean => {
    return new Date().getDate() >= 22;
  },

  syncVendasFromCultura: async (): Promise<{ updated_corretores: number, updated_gestores: number, total_vgv: number }> => {
    if (placarService.isWeek4()) {
      throw new Error("Sincronização bloqueada: o resultado final está congelado para a surpresa do pódio (4ª Semana).");
    }

    try {
      const { culturaService } = await import('./culturaService');
      const vendas = await culturaService.getVendasRegistradas();
      
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const monthNumStr = String(currentMonth + 1).padStart(2, "0");
      const currentMonthPrefix = `${currentYear}-${monthNumStr}`; // ex: "2026-09"

      const isIgnoredName = (name: string): boolean => {
        const norm = normalizeName(name);
        if (!norm) return true;
        const ignored = [
          "socios", "socio", "socias", "socia", "gerentes", "diretor",
          "sereno leao", "rafael badra", "deyvid rhussel", 
          "luziano", "jose soares", "murilo feitosa"
        ];
        return ignored.some(ignoredName => norm.includes(ignoredName));
      };


      const groupedCorretores: Record<string, number> = {};
      const groupedGestores: Record<string, number> = {};
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
            if (m === currentMonth && y === currentYear) {
              isCurrentMonth = true;
            }
          }
        }

        if (!isCurrentMonth) continue;

        if (v.venda_oculta) continue;
        const st = normalizeName(v.status || "");
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

      const dbPessoas = await placarService.getPessoas(undefined, false);

      const getOrRegisterPessoa = async (nome: string, cargo: "corretor" | "gestor"): Promise<Pessoa | null> => {
        let match = findPessoaMatch(nome, dbPessoas);
        if (match) {
          if (!match.ativo) return null;
          return match;
        }
        // Auto-criação obrigatória: se não encontrou correspondência, cadastra a pessoa no banco!
        try {
          const novaPessoa = await placarService.savePessoa({
            nome,
            cargo,
            unidade_id: "jd-goias",
            ativo: true
          });
          dbPessoas.push(novaPessoa);
          return novaPessoa;
        } catch (e) {
          console.error("Erro ao auto-cadastrar pessoa:", nome, e);
          return null;
        }
      };

      const monthNames = [
        "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO",
        "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"
      ];
      const periodoStr = `${monthNames[currentMonth]} DE ${currentYear}`;

      // Limpa rankings do mês antes de reinserir
      await supabase.from("ranking_entries")
        .delete()
        .eq("periodo", periodoStr)
        .eq("tipo", "mensal");

      let updated_corretores = 0;
      let updated_gestores = 0;

      // Top 10 Corretores
      const corretoresSorted = Object.entries(groupedCorretores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      for (let i = 0; i < corretoresSorted.length; i++) {
        const [nome, val] = corretoresSorted[i];
        const matchPessoa = await getOrRegisterPessoa(nome, "corretor");
        if (!matchPessoa) continue;

        await placarService.saveRankingEntry({
          pessoa_id: matchPessoa.id,
          tipo: "mensal",
          categoria: "corretores",
          posicao: i + 1,
          valor: val,
          periodo: periodoStr,
          ativo: true
        });
        updated_corretores++;
      }

      // Top 5 Gestores
      const gestoresSorted = Object.entries(groupedGestores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      for (let i = 0; i < gestoresSorted.length; i++) {
        const [nome, val] = gestoresSorted[i];
        const matchPessoa = await getOrRegisterPessoa(nome, "gestor");
        if (!matchPessoa) continue;

        await placarService.saveRankingEntry({
          pessoa_id: matchPessoa.id,
          tipo: "mensal",
          categoria: "gestores",
          posicao: i + 1,
          valor: val,
          periodo: periodoStr,
          ativo: true
        });
        updated_gestores++;
      }

      // Atualiza automaticamente o VGV Realizado do Mês na tabela config_metas
      try {
        const existingConfig = await placarService.getConfig();
        if (existingConfig) {
          await placarService.saveConfig({
            meta_mensal_realizado: totalVgvMes,
            meta_mensal_periodo: periodoStr,
            meta_mensal_titulo: `Meta Mensal - ${periodoStr}`
          });
        }
      } catch (cfgErr) {
        console.warn("Aviso ao atualizar meta realizada:", cfgErr);
      }

      // Verificação automática de pessoas sem foto no ranking para alerta n8n
      try {
        const webhookUrl = n8nService.getWebhookUrl();
        if (webhookUrl) {
          const freshRankings = await placarService.getRankings();
          const rankingMensal = freshRankings.filter(r => r.tipo === "mensal" && r.periodo === periodoStr);
          const pessoasSemFoto = rankingMensal
            .filter(r => r.pessoa && (!r.pessoa.foto_url || !r.pessoa.foto_url.trim()))
            .map(r => ({
              id: r.pessoa_id,
              nome: r.pessoa!.nome,
              cargo: (r.pessoa!.cargo as "corretor" | "gestor") || "corretor",
              posicao: r.posicao,
              tipo_ranking: `Top ${r.categoria === "corretores" ? 10 : 5} ${r.categoria}`,
              valor_vgv: r.valor
            }));

          if (pessoasSemFoto.length > 0) {
            console.log(`[Placar] Disparando alerta n8n para ${pessoasSemFoto.length} pessoas sem foto...`);
            await n8nService.sendPhotoAlert(pessoasSemFoto, webhookUrl);
          }
        }
      } catch (alertErr) {
        console.warn("Aviso ao disparar webhook n8n pós-sync:", alertErr);
      }

      return { updated_corretores, updated_gestores, total_vgv: totalVgvMes };
    } catch (err) {
      console.error("Erro na sincronização de vendas do Cultura:", err);
      throw err;
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
      if (!error && data) return data;
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

  // ─── Busca de Lançamentos do Cultura para Seleção ────────────────────────
  getCulturaLancamentosDisponiveis: async (): Promise<Array<{ titulo: string; total_pastas: number }>> => {
    try {
      const { culturaService } = await import('./culturaService');
      const filaPastas = await culturaService.getFilaPastas();
      const counts: Record<string, number> = {};

      for (const p of filaPastas) {
        if (!p.lancamento) continue;
        const lanc = p.lancamento.trim();
        if (!lanc) continue;
        counts[lanc] = (counts[lanc] || 0) + 1;
      }

      return Object.entries(counts)
        .map(([titulo, total_pastas]) => ({ titulo, total_pastas }))
        .sort((a, b) => b.total_pastas - a.total_pastas);
    } catch (err) {
      console.error("Erro ao buscar lançamentos disponíveis do Cultura:", err);
      return [];
    }
  },

  // ─── Sincronização da Meta do Mês do Cultura ──────────────────────────────
  syncMetaFromCultura: async (): Promise<{ meta_valor: number; atualizado: boolean }> => {
    try {
      const { culturaService } = await import('./culturaService');
      const metas = await culturaService.getMetasVendas();
      const now = new Date();
      const currentMonthStr = String(now.getMonth() + 1); // ex: "9"
      const currentYearStr = String(now.getFullYear()); // ex: "2026"

      // Filtra metas do mês e ano atual
      const metasMes = metas.filter(m => String(m.ano) === currentYearStr && String(m.mes) === currentMonthStr);
      let totalMeta = 0;

      if (metasMes.length > 0) {
        totalMeta = metasMes.reduce((acc, m) => acc + (Number(m.valor_meta) || 0), 0);
      } else {
        // Fallback: se ainda não houver meta mensal específica, busca a meta anual e divide por 12
        const metasAnuais = metas.filter(m => String(m.ano) === currentYearStr && m.tipo === "ANUAL");
        if (metasAnuais.length > 0) {
          const totalAnual = metasAnuais.reduce((acc, m) => acc + (Number(m.valor_meta) || 0), 0);
          totalMeta = Math.round(totalAnual / 12);
        }
      }

      if (totalMeta > 0) {
        const monthNames = [
          "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO",
          "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"
        ];
        const periodoStr = `${monthNames[now.getMonth()]} DE ${currentYearStr}`;

        await placarService.saveConfig({
          meta_mensal_valor: totalMeta,
          meta_mensal_periodo: periodoStr,
          meta_mensal_titulo: `Meta Mensal - ${periodoStr}`
        });
        return { meta_valor: totalMeta, atualizado: true };
      }

      return { meta_valor: 0, atualizado: false };
    } catch (err) {
      console.error("Erro ao sincronizar metas do Cultura:", err);
      return { meta_valor: 0, atualizado: false };
    }
  },

  syncPastasFromCultura: async (onlyActive: boolean = true): Promise<{ updated_pastas: number, updated_rankings: number }> => {
    try {
      const { culturaService } = await import('./culturaService');
      const filaPastas = await culturaService.getFilaPastas();
      
      const normalize = (str: string) => str ? str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";

      const isIgnoredName = (name: string): boolean => {
        const norm = normalize(name);
        if (!norm) return true;
        const ignored = [
          "socios", "socio", "socias", "socia", "gerentes", "diretor",
          "sereno leao", "rafael badra", "deyvid rhussel", "jann costa", 
          "luziano", "jose soares", "murilo feitosa"
        ];
        return ignored.some(ignoredName => norm.includes(ignoredName));
      };

      // Pastas atualmente cadastradas no sistema
      const dbPastas = await placarService.getPastas();
      const activePastas = onlyActive ? dbPastas.filter(p => p.ativo) : dbPastas;

      if (activePastas.length === 0) {
        return { updated_pastas: 0, updated_rankings: 0 };
      }

      // Group pastas by lancamento
      const grouped: Record<string, {
        corretores: Record<string, number>,
        gestores: Record<string, number>
      }> = {};

      for (const p of filaPastas) {
        if (!p.lancamento) continue;
        const lanc = p.lancamento.trim();
        if (!grouped[lanc]) {
          grouped[lanc] = { corretores: {}, gestores: {} };
        }
        
        // Count for corretor
        if (p.corretor && !isIgnoredName(p.corretor)) {
          const cName = p.corretor.trim();
          grouped[lanc].corretores[cName] = (grouped[lanc].corretores[cName] || 0) + 1;
        }
        
        // Count for gestor
        if (p.gestor && !isIgnoredName(p.gestor)) {
          const gName = p.gestor.trim();
          grouped[lanc].gestores[gName] = (grouped[lanc].gestores[gName] || 0) + 1;
        }
      }

      const dbPessoas = await placarService.getPessoas(undefined, false);
      
      let updated_pastas = 0;
      let updated_rankings = 0;

      const getOrRegisterPessoa = async (nome: string, cargo: "corretor" | "gestor"): Promise<Pessoa | null> => {
        let match = dbPessoas.find(p => p.nome && normalize(p.nome) === normalize(nome));
        if (match) {
          if (!match.ativo) return null;
          return match;
        }
        try {
          const novaPessoa = await placarService.savePessoa({
            nome,
            cargo,
            unidade_id: "jd-goias",
            ativo: true
          });
          dbPessoas.push(novaPessoa);
          return novaPessoa;
        } catch (e) {
          console.error("Erro ao auto-cadastrar pessoa:", nome, e);
          return null;
        }
      };

      // Itera APENAS sobre as pastas que o usuário escolheu acompanhar
      for (const pasta of activePastas) {
        // Encontra o grupo no Cultura com matching exato ou normalizado
        const matchingLancamento = Object.keys(grouped).find(
          l => l.toLowerCase() === pasta.titulo.toLowerCase() || normalize(l) === normalize(pasta.titulo)
        );

        // Deleta rankings anteriores desta pasta específica
        try {
          await supabase.from("ranking_pastas").delete().eq("pasta_id", pasta.id);
        } catch (e) {}

        if (!matchingLancamento || !grouped[matchingLancamento]) {
          continue;
        }

        updated_pastas++;
        
        // Insert new rankings - Corretores
        const corretoresSorted = Object.entries(grouped[matchingLancamento].corretores)
          .sort((a, b) => b[1] - a[1]);

        let currentPos = 1;
        let lastCount = -1;
        for (let i = 0; i < corretoresSorted.length; i++) {
          const [nome, count] = corretoresSorted[i];
          const matchPessoa = await getOrRegisterPessoa(nome, "corretor");
          if (!matchPessoa) continue; 

          if (count !== lastCount) {
            currentPos = i + 1;
            lastCount = count;
          }

          await placarService.saveRankingPastaEntry({
            pasta_id: pasta.id,
            pessoa_id: matchPessoa.id,
            categoria: "corretor",
            posicao: currentPos,
            quantidade_pastas: count,
            ativo: true
          });
          updated_rankings++;
        }

        // Insert new rankings - Gestores
        const gestoresSorted = Object.entries(grouped[matchingLancamento].gestores)
          .sort((a, b) => b[1] - a[1]);

        currentPos = 1;
        lastCount = -1;
        for (let i = 0; i < gestoresSorted.length; i++) {
          const [nome, count] = gestoresSorted[i];
          const matchPessoa = await getOrRegisterPessoa(nome, "gestor");
          if (!matchPessoa) continue; 

          if (count !== lastCount) {
            currentPos = i + 1;
            lastCount = count;
          }

          await placarService.saveRankingPastaEntry({
            pasta_id: pasta.id,
            pessoa_id: matchPessoa.id,
            categoria: "gestor",
            posicao: currentPos,
            quantidade_pastas: count,
            ativo: true
          });
          updated_rankings++;
        }
      }

      return { updated_pastas, updated_rankings };
    } catch (err) {
      console.error("Erro na sincronização de pastas:", err);
      throw err;
    }
  },

  // ─── Sincronização Unificada Completa (Automação Total) ───────────────────
  syncAllFromCultura: async (): Promise<{
    vendas: { updated_corretores: number; updated_gestores: number; total_vgv: number };
    metas: { meta_valor: number; atualizado: boolean };
    pastas: { updated_pastas: number; updated_rankings: number };
    timestamp: number;
  }> => {
    const vendasRes = await placarService.syncVendasFromCultura().catch(err => {
      console.warn("Aviso ao auto-sincronizar vendas:", err);
      return { updated_corretores: 0, updated_gestores: 0, total_vgv: 0 };
    });

    const metasRes = await placarService.syncMetaFromCultura().catch(err => {
      console.warn("Aviso ao auto-sincronizar metas:", err);
      return { meta_valor: 0, atualizado: false };
    });

    const pastasRes = await placarService.syncPastasFromCultura(true).catch(err => {
      console.warn("Aviso ao auto-sincronizar pastas:", err);
      return { updated_pastas: 0, updated_rankings: 0 };
    });

    const nowTs = Date.now();
    try {
      localStorage.setItem("lopes_last_auto_sync", String(nowTs));
    } catch (e) {}

    return {
      vendas: vendasRes,
      metas: metasRes,
      pastas: pastasRes,
      timestamp: nowTs
    };
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
    const payload = serializeImovelPayload({
      price: "—",
      area: "—",
      rooms: "—",
      garage: "—",
      address: "Geral",
      ...i
    });

    // Garantia absoluta contra violação de constraint NOT NULL no Postgres
    if (!payload.price || !String(payload.price).trim()) payload.price = "—";
    if (!payload.area || !String(payload.area).trim()) payload.area = "—";
    if (!payload.rooms || !String(payload.rooms).trim()) payload.rooms = "—";
    if (!payload.garage || !String(payload.garage).trim()) payload.garage = "—";
    if (!payload.address || !String(payload.address).trim()) payload.address = i.category || "Geral";

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
    if ("price" in patch && (!payload.price || !String(payload.price).trim())) {
      payload.price = "—";
    }
    if ("area" in patch && (!payload.area || !String(payload.area).trim())) {
      payload.area = "—";
    }
    if ("rooms" in patch && (!payload.rooms || !String(payload.rooms).trim())) {
      payload.rooms = "—";
    }
    if ("garage" in patch && (!payload.garage || !String(payload.garage).trim())) {
      payload.garage = "—";
    }
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
  },

  // ─── Progressão de Carreira ───────────────────────────────────────────────
  getProgressoes: async () => {
    const { data, error } = await supabase
      .from("progressoes_carreira")
      .select(`*, pessoa:pessoas(id, nome, cargo, unidade_id, foto_url, ativo)`)
      .order("criado_em", { ascending: false });
    if (error) throw error;
    return data;
  },
  createProgressao: async (patch: any) => {
    const { data, error } = await supabase.from("progressoes_carreira").insert(patch).select().single();
    if (error) throw error;
    return data;
  },
  updateProgressao: async (id: string, patch: any) => {
    const { data, error } = await supabase.from("progressoes_carreira").update(patch).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },
  deleteProgressao: async (id: string) => {
    const { error } = await supabase.from("progressoes_carreira").delete().eq("id", id);
    if (error) throw error;
  }
};

// Manter export dbService temporariamente caso haja alguma outra referência antiga
export const dbService = placarService;
