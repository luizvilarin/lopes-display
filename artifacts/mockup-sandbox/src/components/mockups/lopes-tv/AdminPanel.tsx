import { useState, useEffect, useRef } from "react";
import { placarService, type Imovel, type SignageSettings } from "@/services/placarService";
import type { Unidade } from "@/types/placar";
import { Icons } from "@/components/common/Icons";

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminSection = "imoveis" | "ofertao" | "display";

// Fallback gradients para a sidebar de unidades
const FALLBACK_GRADIENTS: Record<string, string> = {
  "marista": "linear-gradient(135deg,#1a2744,#2d3f6b)",
  "bueno": "linear-gradient(135deg,#0d3524,#1a5c3e)",
  "jd-goias": "linear-gradient(135deg,#3d1a00,#7a3500)",
  "oeste": "linear-gradient(135deg,#1a0030,#3d006b)",
};

// ─── CSS ──────────────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700;800;900&family=Barlow+Condensed:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --accent: #E30613; --accent-h: #FF1A27; --accent-m: #B8040F;
    --bg: #0A0A0F; --bg2: #141418; --bg3: #1C1C24; --bg4: #242430;
    --text: #F0F2F8; --text2: #B8BDCC; --text3: #72788A; --text4: #4A4F60;
    --border: #2A2A36; --border2: #1E1E28;
  }
  .adm-light {
    --bg: #F2F4F7; --bg2: #FFFFFF; --bg3: #E8ECF1; --bg4: #F0F3F8;
    --text: #0A0A0F; --text2: #3A3D4A; --text3: #6B7080; --text4: #9BA3B2;
    --border: #D8DDE8; --border2: #E8ECF1;
  }

  .adm-root { width:100%; height:100%; overflow:hidden; background:transparent; color:var(--text); font-family:'DM Sans',sans-serif; display:flex; flex-direction:column; transition:background 350ms ease, color 350ms ease; }

  @keyframes fadeIn      { from{opacity:0} to{opacity:1} }
  @keyframes fadeSlideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes scalePop    { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
  @keyframes spin        { to{transform:rotate(360deg)} }

  .fade-in { animation: fadeIn 300ms ease both; }
  .slide-up { animation: fadeSlideUp 350ms ease both; }

  input[type=number]::-webkit-outer-spin-button,
  input[type=number]::-webkit-inner-spin-button { -webkit-appearance:none; }
  input[type=number] { -moz-appearance:textfield; }

  ::-webkit-scrollbar { width:6px; height:6px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:var(--border); border-radius:4px; }

  .adm-input {
    background:var(--bg3); border:1px solid var(--border); color:var(--text);
    padding:10px 14px; border-radius:10px; width:100%;
    font-family:'DM Sans',sans-serif; font-size:14px; outline:none;
    transition:border-color 200ms ease, background 200ms ease;
  }
  .adm-input:focus { border-color:rgba(227,6,19,.55); background:var(--bg4); }
  .adm-input::placeholder { color:var(--text4); }

  .adm-label {
    display:block; font-family:'Barlow',sans-serif; font-weight:700;
    font-size:10px; letter-spacing:.14em; text-transform:uppercase;
    color:var(--text3); margin-bottom:6px;
  }
  .adm-btn {
    border:none; cursor:pointer; font-family:'Barlow',sans-serif;
    font-weight:700; transition:all 200ms ease;
  }
  .adm-btn-accent { background:var(--accent); color:#fff; border-radius:10px; }
  .adm-btn-accent:hover { background:var(--accent-h); box-shadow:0 4px 16px rgba(227,6,19,.40); }
  .adm-btn-accent:disabled { opacity: 0.5; cursor: not-allowed; }
  .adm-btn-ghost { background:var(--bg3); color:var(--text2); border-radius:10px; border:1px solid var(--border); }
  .adm-btn-ghost:hover { background:var(--bg4); color:var(--text); }
  .adm-btn-danger { background:rgba(227,6,19,.12); color:#E30613; border-radius:10px; border:1px solid rgba(227,6,19,.25); }
  .adm-btn-danger:hover { background:rgba(227,6,19,.22); }

  .prop-card {
    background:var(--bg3); border:1px solid var(--border); border-radius:16px;
    overflow:hidden; transition:border-color 200ms ease;
  }
  .prop-card:hover { border-color:rgba(227,6,19,.25); }

  .toggle-switch {
    width:44px; height:24px; border-radius:9999px; cursor:pointer;
    position:relative; transition:background 250ms ease; flex-shrink:0;
  }
  .toggle-knob {
    position:absolute; top:3px; width:18px; height:18px; border-radius:50%;
    background:#fff; transition:left 250ms ease; box-shadow:0 2px 4px rgba(0,0,0,.20);
  }

  .image-dropzone {
    border:2px dashed var(--border); border-radius:12px;
    background:var(--bg4); cursor:pointer; transition:all 200ms ease;
    display:flex; align-items:center; justify-content:center;
    flex-direction:column; gap:8px;
    min-height:100px; text-align:center; padding:16px;
    position:relative; overflow:hidden;
  }
  .image-dropzone:hover { border-color:rgba(227,6,19,.45); background:rgba(227,6,19,.04); }
  .image-dropzone.has-image { border-style:solid; border-color:rgba(227,6,19,.30); }

  .stat-card {
    background:var(--bg3); border:1px solid var(--border); border-radius:14px;
    padding:18px 20px;
  }

  .tag-badge {
    display:inline-block; padding:3px 10px; border-radius:7px;
    font-family:'Barlow',sans-serif; font-weight:700; font-size:11px;
    letter-spacing:.12em; text-transform:uppercase; color:#fff;
  }

  .modal-overlay {
    position:fixed; inset:0; z-index:500;
    background:rgba(0,0,0,.75); backdrop-filter:blur(18px);
    display:flex; align-items:center; justify-content:center; padding:20px;
    animation:fadeIn 200ms ease both;
  }
  .modal-box {
    background:var(--bg2); border:1px solid var(--border); border-radius:24px;
    width:100%; max-width:600px; max-height:92vh;
    display:flex; flex-direction:column;
    box-shadow:0 32px 80px rgba(0,0,0,.55);
    animation:scalePop 280ms cubic-bezier(0.34,1.56,0.64,1) both;
  }
`;

// ─── Image Dropzone ───────────────────────────────────────────────────────────

const compressImage = (file: File, maxWidth: number, maxHeight: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Erro ao carregar imagem"));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
    reader.readAsDataURL(file);
  });
};

function ImageDropzone({ value, onChange, label, maxWidth = 1024, maxHeight = 576 }: { value: string; onChange: (url: string) => void; label: string; maxWidth?: number; maxHeight?: number }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(value);
  const [urlInput, setUrlInput] = useState(value);

  useEffect(() => {
    setPreview(value);
    setUrlInput(value);
  }, [value]);

  const handleFile = async (file: File) => {
    try {
      const url = await compressImage(file, maxWidth, maxHeight);
      setPreview(url);
      onChange(url);
    } catch (err) {
      console.error("Erro ao compactar imagem:", err);
      alert("Erro ao ler e processar a imagem.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label className="adm-label">{label}</label>
      <div
        className={`image-dropzone ${preview ? "has-image" : ""}`}
        onDragOver={e => { e.preventDefault(); (e.currentTarget as HTMLElement).style.borderColor = "#E30613"; }}
        onDragLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = ""; }}
        onDrop={e => { e.preventDefault(); (e.currentTarget as HTMLElement).style.borderColor = ""; const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onClick={() => inputRef.current?.click()}
        style={{ minHeight: preview ? 130 : 100 }}
      >
        {preview ? (
          <img src={preview} alt="" style={{ width: "100%", height: 130, objectFit: "cover", borderRadius: 8 }} onError={() => setPreview("")} />
        ) : (
          <>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span style={{ fontSize: 12, color: "var(--text4)" }}>Arraste uma imagem ou clique para selecionar</span>
          </>
        )}
        <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      </div>
      
      <div style={{ display: "flex", gap: 8 }}>
        <input className="adm-input" type="url" placeholder="Ou cole uma URL de imagem..." value={urlInput} onChange={e => setUrlInput(e.target.value)} style={{ fontSize: 13 }} />
        <button className="adm-btn adm-btn-ghost" style={{ padding: "10px 14px", fontSize: 12, whiteSpace: "nowrap" }} onClick={() => { setPreview(urlInput); onChange(urlInput); }}>Aplicar</button>
      </div>
      
      {preview && (
        <button className="adm-btn adm-btn-danger" style={{ padding: "8px", fontSize: 12, alignSelf: "flex-start" }} onClick={() => { setPreview(""); setUrlInput(""); onChange(""); }}>Remover imagem</button>
      )}
    </div>
  );
}

// ─── Property Modal ───────────────────────────────────────────────────────────

function PropertyModal({ prop, categories, unidades, activeUnitId, onSave, onClose }: { prop: Imovel; categories: string[]; unidades: Unidade[]; activeUnitId: string; onSave: (p: Imovel) => Promise<void>; onClose: () => void }) {
  const [draft, setDraft] = useState<Imovel>({
    ...prop,
    unidade_id: prop.unidade_id || activeUnitId,
    category: prop.category || "Geral",
    gallery: prop.gallery || []
  });
  const [saving, setSaving] = useState(false);
  const [newGalUrl, setNewGalUrl] = useState("");

  const addGal = () => {
    if (newGalUrl) {
      up("gallery", [...(draft.gallery || []), newGalUrl]);
      setNewGalUrl("");
    }
  };
  const rmGal = (i: number) => {
    const g = [...(draft.gallery || [])];
    g.splice(i, 1);
    up("gallery", g);
  };

  const up = (k: keyof Imovel, v: any) => setDraft(d => ({ ...d, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(draft);
      onClose();
    } catch (err) {
      console.error("Erro ao salvar imóvel:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div style={{ padding: "24px 28px 0", borderBottom: "1px solid var(--border2)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 800, fontSize: 17, color: "var(--text)" }}>{prop.id ? "Editar Produto" : "Novo Produto"}</div>
              <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>Preencha os dados e a mídia do produto digital</div>
            </div>
            <button className="adm-btn adm-btn-ghost" style={{ width: 34, height: 34, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10 }} onClick={onClose}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "22px 28px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "var(--bg3)", borderRadius: 12, border: "1px solid var(--border)" }}>
              <div>
                <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text)" }}>Ativo na TV</div>
                <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>Exibir este imóvel nas telas rotativas</div>
              </div>
              <div className="toggle-switch" style={{ background: draft.ativo ? "#E30613" : "var(--border)" }} onClick={() => up("ativo", !draft.ativo)}>
                <div className="toggle-knob" style={{ left: draft.ativo ? 23 : 3 }} />
              </div>
            </div>

            <div className="pa-form-row" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label className="adm-label">Unidade Associada</label>
              <select className="adm-input" value={draft.unidade_id} onChange={e => up("unidade_id", e.target.value)} style={{ background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--text)", padding: "10px 14px", borderRadius: 10, fontSize: 14 }}>
                <option value="Todas">Todas as Unidades (Global)</option>
                {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label className="adm-label">Nome do Produto</label>
                <input className="adm-input" type="text" value={String(draft.title ?? "")} onChange={e => up("title", e.target.value)} />
              </div>
              <div>
                <label className="adm-label">Categoria</label>
                <input className="adm-input" list="cat-list" type="text" value={draft.category || ""} onChange={e => up("category", e.target.value)} placeholder="Ex: Loteamentos" />
                <datalist id="cat-list">
                  {categories.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
            </div>

            <div>
              <label className="adm-label">Descrição curta (exibida na TV)</label>
              <textarea className="adm-input" value={draft.description || ""} onChange={e => up("description", e.target.value)} rows={2} style={{ resize: "none", lineHeight: 1.5 }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "end" }}>
              <div>
                <label className="adm-label">Tag (ex: NOVO, OFERTA, EXCLUSIVO)</label>
                <input className="adm-input" type="text" value={draft.tag || ""} onChange={e => up("tag", e.target.value)} />
              </div>
              <div>
                <label className="adm-label">Cor da Tag</label>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input type="color" value={draft.tag_color || "#E30613"} onChange={e => up("tag_color", e.target.value)} style={{ width: 42, height: 42, borderRadius: 10, border: "1px solid var(--border)", cursor: "pointer", background: "none", padding: 2 }} />
                  <span className="tag-badge" style={{ background: draft.tag_color }}>{draft.tag || "TAG"}</span>
                </div>
              </div>
            </div>

            <ImageDropzone value={draft.image_url || ""} onChange={url => up("image_url", url)} label="Imagem de Capa (Empreendimento)" />

            <div style={{ padding: "20px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: 16 }}>
              <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 4 }}>Galeria de Imagens Adicionais</div>
              <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 16 }}>Adicione imagens extras para complementar a apresentação deste produto na TV</div>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10, marginBottom: 16 }}>
                {(draft.gallery || []).map((g, i) => (
                  <div key={i} style={{ position: "relative", height: 80, borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)" }}>
                    <img src={g} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button className="adm-btn-danger" style={{ position: "absolute", top: 4, right: 4, width: 24, height: 24, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", background: "rgba(227,6,19,0.9)" }} onClick={() => rmGal(i)}>
                      <Icons.Trash size={12} color="#fff" />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <input className="adm-input" type="url" placeholder="Cole a URL da nova imagem..." value={newGalUrl} onChange={e => setNewGalUrl(e.target.value)} style={{ fontSize: 13 }} />
                <button className="adm-btn adm-btn-ghost" style={{ padding: "10px 14px", fontSize: 12, whiteSpace: "nowrap", border: "1px solid var(--border)" }} onClick={addGal}>Adicionar à Galeria</button>
              </div>
            </div>

            <div style={{ padding: "20px", background: "rgba(227,6,19,0.03)", border: "1px dashed rgba(227,6,19,0.2)", borderRadius: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(227,6,19,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icons.QRCode size={18} color="#E30613" />
                </div>
                <div>
                  <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 13, color: "var(--text)" }}>Material QR Code (Linktree)</div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>Arte com o QR Code para o corretor escanear</div>
                </div>
              </div>
              <ImageDropzone value={draft.qr_code_url || ""} onChange={url => up("qr_code_url", url)} label="Upload da Arte do QR Code" maxWidth={256} maxHeight={256} />
            </div>

            <div>
              <label className="adm-label">URL do Vídeo (YouTube, MP4 direto ou similar)</label>
              <input className="adm-input" type="url" placeholder="https://youtube.com/embed/..." value={draft.video_url || ""} onChange={e => up("video_url", e.target.value)} />
              {draft.video_url && (
                <div style={{ marginTop: 8, padding: "10px 14px", background: "var(--bg3)", borderRadius: 10, border: "1px solid var(--border)", fontSize: 12, color: "var(--text3)", display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
                  Vídeo configurado — será reproduzido em loop na TV
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ padding: "16px 28px 24px", borderTop: "1px solid var(--border2)", display: "flex", gap: 10, flexShrink: 0 }}>
          <button className="adm-btn adm-btn-accent" style={{ flex: 1, padding: "13px", fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} disabled={saving} onClick={handleSave}>
            <Icons.Check size={16} />
            {saving ? "Gravando..." : "Salvar Produto"}
          </button>
          <button className="adm-btn adm-btn-ghost" style={{ flex: 1, padding: "13px", fontSize: 13 }} onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

// ─── Sections ─────────────────────────────────────────────────────────────────

function SectionImoveis({ imoveis, onSave, onDelete, activeUnit, unidades, activeUnitId }: { imoveis: Imovel[]; onSave: (p: Imovel) => Promise<void>; onDelete: (id: number) => Promise<void>; activeUnit: string; unidades: Unidade[]; activeUnitId: string }) {
  const [editing, setEditing] = useState<Imovel | null>(null);
  const categories = Array.from(new Set(imoveis.map(p => p.category).filter(Boolean)));

  const openAdd = () => {
    const novo: Imovel = {
      id: 0,
      unidade_id: activeUnitId === "Todas" ? (unidades[0]?.id || "jd-goias") : activeUnit,
      title: "Novo Produto",
      tag: "NOVO",
      tag_color: "#E30613",
      gradient: "linear-gradient(160deg,#1a2744,#2d3f6b)",
      category: "Geral",
      image_url: "",
      gallery: [],
      video_url: "",
      ativo: true,
      description: ""
    };
    setEditing(novo);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 800, fontSize: 20, color: "var(--text)" }}>Produtos Digitais</h2>
          <p style={{ fontSize: 13, color: "var(--text3)", marginTop: 3 }}>
            {activeUnitId === "Todas"
              ? `${imoveis.filter(p => p.ativo).length} ativos · ${imoveis.length} total para todas as unidades`
              : `${imoveis.filter(p => p.ativo).length} ativos · ${imoveis.length} total para esta unidade`
            }
          </p>
        </div>
        <button className="adm-btn adm-btn-accent" style={{ padding: "10px 18px", fontSize: 13, display: "flex", alignItems: "center", gap: 7 }} onClick={openAdd}>
          <Icons.Plus size={14} />
          Novo Produto
        </button>
      </div>

      {imoveis.length === 0 ? (
        <div style={{ padding: "48px 24px", background: "var(--bg3)", border: "1px dashed var(--border)", borderRadius: 16, textAlign: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--bg4)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Icons.Home size={24} color="var(--text4)" />
          </div>
          <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text)", marginTop: 12 }}>Nenhum produto cadastrado</div>
          <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 4, marginBottom: 16 }}>Cadastre os produtos que serão exibidos nas TVs</div>
          <button className="adm-btn adm-btn-ghost" style={{ padding: "8px 16px", fontSize: 13 }} onClick={openAdd}>Criar Primeiro Produto</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
          {imoveis.map((p, i) => (
            <div key={p.id} className="prop-card slide-up" style={{ animationDelay: `${i * 40}ms` }}>
              
              <div style={{ height: 120, background: p.image_url ? `url(${p.image_url}) center/cover` : p.gradient || "linear-gradient(135deg,#242430,#141418)", position: "relative", overflow: "hidden" }}>
                {!p.image_url && (
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  </div>
                )}
                
                <div style={{ position: "absolute", top: 10, right: 10 }}>
                  <div style={{ padding: "3px 10px", borderRadius: 7, background: p.ativo ? "rgba(34,197,94,.90)" : "rgba(0,0,0,.60)", color: "#fff", fontSize: 11, fontFamily: "'Barlow',sans-serif", fontWeight: 700, letterSpacing: ".10em", backdropFilter: "blur(8px)" }}>
                    {p.ativo ? "ATIVO" : "INATIVO"}
                  </div>
                </div>
                
                <div style={{ position: "absolute", top: 10, left: 10 }}>
                  <span className="tag-badge" style={{ background: p.tag_color || "#E30613" }}>{p.tag}</span>
                </div>
                
                {p.video_url && (
                  <div style={{ position: "absolute", bottom: 10, right: 10, width: 26, height: 26, borderRadius: "50%", background: "rgba(0,0,0,.60)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M5 3l14 9-14 9V3z"/></svg>
                  </div>
                )}
              </div>

              <div style={{ padding: 16 }}>
                <h3 style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 4 }}>{p.title}</h3>
                <p style={{ fontSize: 11, color: "var(--text3)", marginBottom: 12, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span style={{
                    padding: "2px 6px",
                    borderRadius: 4,
                    fontSize: 9,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    background: p.unidade_id === "Todas" ? "rgba(227,6,19,.15)" : "rgba(255,255,255,.06)",
                    color: p.unidade_id === "Todas" ? "#ff6b6b" : "rgba(255,255,255,.6)",
                    border: p.unidade_id === "Todas" ? "1px solid rgba(227,6,19,.3)" : "1px solid rgba(255,255,255,.1)"
                  }}>
                    {p.unidade_id === "Todas" ? "Todas as Unidades" : (unidades.find(u => u.id === p.unidade_id)?.nome.replace("Lopes ", "") || p.unidade_id)}
                  </span>
                  <span>· {p.category}</span>
                </p>

                <div style={{ display: "flex", gap: 8 }}>
                  <button className="adm-btn adm-btn-ghost" style={{ flex: 1, padding: "9px", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }} onClick={() => setEditing(p)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Editar
                  </button>
                  <button className="adm-btn adm-btn-danger" style={{ padding: "9px 14px", fontSize: 13 }} onClick={() => window.confirm("Excluir este imóvel?") && onDelete(p.id)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && <PropertyModal prop={editing} categories={categories} unidades={unidades} activeUnitId={activeUnitId} onSave={onSave} onClose={() => setEditing(null)} />}
    </div>
  );
}

function SectionOfertao({ label1, label2, label3, seconds, onUpdate }: { label1: string; label2: string; label3: string; seconds: number; onUpdate: (l1: string, l2: string, l3: string, s: number) => void }) {
  const [l1, setL1] = useState(label1);
  const [l2, setL2] = useState(label2);
  const [l3, setL3] = useState(label3);
  const [sec, setSec] = useState(seconds);

  // Sincronizar ao mudar de unidade
  useEffect(() => {
    setL1(label1);
    setL2(label2);
    setL3(label3);
    setSec(seconds);
  }, [label1, label2, label3, seconds]);

  const save = () => onUpdate(l1, l2, l3, sec);

  const hv = Math.floor(sec / 3600);
  const mv = Math.floor((sec % 3600) / 60);
  const sv = Math.floor(sec % 60);

  const adjust = (h: number, m: number, s: number) => {
    const res = (h * 3600) + (m * 60) + s;
    setSec(Math.max(0, res));
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 800, fontSize: 20, color: "var(--text)" }}>Temporizador (Contagem Regressiva)</h2>
        <p style={{ fontSize: 13, color: "var(--text3)", marginTop: 3 }}>Controle o timer e os informativos na tela principal da TV</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 520 }}>
        
        <div className="stat-card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 4 }}>Configuração do Tempo</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <label className="adm-label">Horas</label>
              <input className="adm-input" type="number" min={0} max={23} value={hv} onChange={e => adjust(parseInt(e.target.value)||0, mv, sv)} style={{ textAlign: "center", fontSize: 18, fontWeight: 700 }} />
            </div>
            <div>
              <label className="adm-label">Minutos</label>
              <input className="adm-input" type="number" min={0} max={59} value={mv} onChange={e => adjust(hv, parseInt(e.target.value)||0, sv)} style={{ textAlign: "center", fontSize: 18, fontWeight: 700 }} />
            </div>
            <div>
              <label className="adm-label">Segundos</label>
              <input className="adm-input" type="number" min={0} max={59} value={sv} onChange={e => adjust(hv, mv, parseInt(e.target.value)||0)} style={{ textAlign: "center", fontSize: 18, fontWeight: 700 }} />
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: 16, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 48, color: "#E30613", letterSpacing: "-.03em" }}>
            {String(hv).padStart(2,"0")}:{String(mv).padStart(2,"0")}:{String(sv).padStart(2,"0")}
          </div>
        </div>

        <div className="stat-card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 4 }}>Blocos de Informação</div>
          {([["Bloco Esquerdo (ex: Vendas)", l1, setL1], ["Bloco Central (ex: Meta Diária)", l2, setL2], ["Bloco Direito (ex: Evento)", l3, setL3]] as [string, string, (v: string) => void][]).map(([lbl, val, set]) => (
            <div key={lbl}>
              <label className="adm-label">{lbl}</label>
              <input className="adm-input" type="text" value={val} onChange={e => set(e.target.value)} />
            </div>
          ))}
        </div>

        <button className="adm-btn adm-btn-accent" style={{ padding: "14px", fontSize: 14, letterSpacing: ".08em", textTransform: "uppercase" }} onClick={save}>Salvar Temporizador</button>
      </div>
    </div>
  );
}

function SectionDisplay({ theme, onThemeToggle, autoRotate, interval, onAutoRotate, onInterval, activeUnit, unidades }: {
  theme: "dark" | "light"; onThemeToggle: () => void;
  autoRotate: boolean; interval: number; onAutoRotate: (v: boolean) => void; onInterval: (v: number) => void;
  activeUnit: string; unidades: Unidade[];
}) {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 800, fontSize: 20, color: "var(--text)" }}>Configurações de Display</h2>
        <p style={{ fontSize: 13, color: "var(--text3)", marginTop: 3 }}>Controle o comportamento global das TVs</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 520 }}>

        <div className="stat-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
              {theme === "dark" ? "🌙 Modo Escuro" : "☀️ Modo Claro"}
            </div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>Esquema visual das telas de sinalização</div>
          </div>
          <div className="toggle-switch" style={{ background: theme === "dark" ? "#E30613" : "var(--border)" }} onClick={onThemeToggle}>
            <div className="toggle-knob" style={{ left: theme === "dark" ? 23 : 3 }} />
          </div>
        </div>

        <div className="stat-card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text)" }}>Rotação Automática</div>
              <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>Transições automáticas sem cliques</div>
            </div>
            <div className="toggle-switch" style={{ background: autoRotate ? "#E30613" : "var(--border)" }} onClick={() => onAutoRotate(!autoRotate)}>
              <div className="toggle-knob" style={{ left: autoRotate ? 23 : 3 }} />
            </div>
          </div>
          {autoRotate && (
            <div>
              <label className="adm-label">Intervalo entre slides (segundos)</label>
              <input className="adm-input" type="number" min={3} max={60} value={interval} onChange={e => onInterval(parseInt(e.target.value) || 8)} />
            </div>
          )}
        </div>

        <div style={{ padding: "14px 16px", background: "rgba(227,6,19,.06)", border: "1px solid rgba(227,6,19,.20)", borderRadius: 14, display: "flex", alignItems: "center", gap: 12 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E30613" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 13, color: "var(--text)" }}>Visualizar na TV</div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>Abra o link do display dessa unidade ({unidades.find(u => u.id === activeUnit)?.nome || ""})</div>
          </div>
          <button className="adm-btn adm-btn-accent" style={{ padding: "8px 14px", fontSize: 12 }} onClick={() => window.open(`/tv/${activeUnit}`, "_blank")}>Abrir TV</button>
        </div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export function AdminPanel({ activeSection, activeUnitId }: { activeSection: string; activeUnitId: string }) {
  const [loading, setLoading] = useState(true);
  const [theme, setTheme]         = useState<"dark" | "light">("dark");
  const [unidades, setUnidades]   = useState<Unidade[]>([]);
  const [activeUnit, setActiveUnit] = useState("jd-goias");

  const [imoveis, setImoveis]     = useState<Imovel[]>([]);
  
  const [tl1, setTl1]             = useState("Vendas");
  const [tl2, setTl2]             = useState("Meta Diária");
  const [tl3, setTl3]             = useState("");
  const [timerSecs, setTimerSecs] = useState(600);

  const [autoRotate, setAutoRotate] = useState(true);
  const [rotInterval, setRotInterval] = useState(8);
  
  const [saved, setSaved] = useState(false);
  const showSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  // 1. Load initial system units
  useEffect(() => {
    const init = async () => {
      try {
        const list = await placarService.getUnidades();
        setUnidades(list);
      } catch (e) {
        console.error(e);
      }
    };
    init();
  }, []);

  // Sync with global unit id
  useEffect(() => {
    if (activeUnitId !== "Todas") {
      setActiveUnit(activeUnitId);
    } else if (unidades.length > 0) {
      setActiveUnit(unidades[0].id);
    }
  }, [activeUnitId, unidades]);

  // 2. Load content for specific activeUnit or all units for products
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        let listImov: Imovel[] = [];
        if (activeUnitId === "Todas") {
          listImov = await placarService.getAllImoveis();
        } else if (activeUnit) {
          listImov = await placarService.getImoveis(activeUnit);
        }

        setImoveis(listImov);

        if (activeUnit) {
          const config = await placarService.getSignageConfig(activeUnit);
          if (config) {
            setTheme(config.theme || "dark");
            setAutoRotate(config.auto_rotate);
            setRotInterval(config.rot_interval);
            setTl1(config.timer_label1 || "Vendas");
            setTl2(config.timer_label2 || "Meta Diária");
            setTl3(config.timer_label3 || "");
            setTimerSecs(config.timer_seconds || 600);
          } else {
            // Defaults
            setTheme("dark");
            setAutoRotate(true);
            setRotInterval(8);
            setTl1("Vendas");
            setTl2("Meta Diária");
            setTl3("");
            setTimerSecs(600);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar dados da unidade no Admin:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeUnit, activeUnitId]);

  const updateSignage = async (patch: Partial<SignageSettings>) => {
    if (activeUnitId === "Todas") return;
    try {
      await placarService.saveSignageConfig({
        unidade_id: activeUnit,
        theme,
        auto_rotate: autoRotate,
        rot_interval: rotInterval,
        timer_label1: tl1,
        timer_label2: tl2,
        timer_label3: tl3,
        timer_seconds: timerSecs,
        ...patch
      });
      showSaved();
    } catch (err) {
      console.error("Erro ao salvar configurações de signage:", err);
    }
  };

  const handleSaveImovel = async (draft: Imovel) => {
    try {
      if (draft.id) {
        await placarService.updateImovel(draft.id, draft);
      } else {
        // Remove id para inserção
        const { id, ...payload } = draft;
        await placarService.saveImovel(payload);
      }
      // Refresh local imoveis list
      if (activeUnitId === "Todas") {
        const list = await placarService.getAllImoveis();
        setImoveis(list);
      } else {
        const list = await placarService.getImoveis(activeUnit);
        setImoveis(list);
      }
      showSaved();
    } catch (err) {
      console.error("Erro:", err);
      throw err;
    }
  };

  const handleDeleteImovel = async (id: number) => {
    try {
      await placarService.deleteImovel(id);
      setImoveis(prev => prev.filter(x => x.id !== id));
      showSaved();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className={`adm-root adm-${theme}`}>
        {loading ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid rgba(255,255,255,.1)", borderTopColor: "#E30613", animation: "spin 1s linear infinite" }} />
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
            <div key={activeSection} className="fade-in">
              {activeSection === "imoveis" && (
                <SectionImoveis 
                  imoveis={imoveis} 
                  onSave={handleSaveImovel} 
                  onDelete={handleDeleteImovel} 
                  activeUnit={activeUnit} 
                  unidades={unidades}
                  activeUnitId={activeUnitId}
                />
              )}
              
              {activeSection === "ofertao" && (
                activeUnitId === "Todas" ? (
                  <div style={{ padding: "48px 24px", background: "var(--bg3)", border: "1px dashed var(--border)", borderRadius: 16, textAlign: "center", maxWidth: 520 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(227,6,19,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                      <Icons.Timer size={24} color="#E30613" />
                    </div>
                    <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text)", marginTop: 12 }}>Unidade não selecionada</div>
                    <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 4 }}>Selecione uma unidade específica no cabeçalho para gerenciar o temporizador.</div>
                  </div>
                ) : (
                  <SectionOfertao 
                    label1={tl1} 
                    label2={tl2} 
                    label3={tl3} 
                    seconds={timerSecs} 
                    onUpdate={(l1, l2, l3, s) => {
                      setTl1(l1); setTl2(l2); setTl3(l3); setTimerSecs(s);
                      updateSignage({ timer_label1: l1, timer_label2: l2, timer_label3: l3, timer_seconds: s });
                    }} 
                  />
                )
              )}

              {activeSection === "display" && (
                activeUnitId === "Todas" ? (
                  <div style={{ padding: "48px 24px", background: "var(--bg3)", border: "1px dashed var(--border)", borderRadius: 16, textAlign: "center", maxWidth: 520 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(227,6,19,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E30613" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                    </div>
                    <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text)", marginTop: 12 }}>Unidade não selecionada</div>
                    <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 4 }}>Selecione uma unidade específica no cabeçalho para configurar a TV de exibição.</div>
                  </div>
                ) : (
                  <SectionDisplay 
                    theme={theme} 
                    unidades={unidades}
                    onThemeToggle={() => {
                      const next = theme === "dark" ? "light" : "dark";
                      setTheme(next);
                      updateSignage({ theme: next });
                    }} 
                    autoRotate={autoRotate} 
                    interval={rotInterval} 
                    onAutoRotate={v => { setAutoRotate(v); updateSignage({ auto_rotate: v }); }} 
                    onInterval={v => { setRotInterval(v); updateSignage({ rot_interval: v }); }} 
                    activeUnit={activeUnit} 
                  />
                )
              )}
            </div>
          </div>
        )}

        {saved && (
          <div style={{ position: "fixed", bottom: 24, right: 24, padding: "6px 14px", background: "rgba(34,197,94,.15)", border: "1px solid rgba(34,197,94,.30)", borderRadius: 9999, color: "#22c55e", fontSize: 12, fontFamily: "'Barlow',sans-serif", fontWeight: 700, letterSpacing: ".08em", display: "flex", alignItems: "center", gap: 6, animation: "fadeSlideUp 300ms ease both", zIndex: 100 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Salvo no Supabase!
          </div>
        )}
      </div>
    </>
  );
}
