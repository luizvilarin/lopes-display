import { useState, useRef } from "react";
import logoBranca from "@/assets/logo-branca.png";
import logoPreta from "@/assets/logo-preta.png";
import faviconLopes from "@/assets/favicon-lopes.png";

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminSection = "imoveis" | "placares" | "ofertao" | "display";

interface Property {
  id: number; title: string; price: string; area: string;
  rooms: string; garage: string; address: string;
  tag: string; tagColor: string; gradient: string;
  imageUrl: string; videoUrl: string; enabled: boolean;
  description: string;
}
interface Goal { unitId: string; visits: number; sales: number; target: number; }
interface Unit  { id: string; name: string; initial: string; gradient: string; }

const UNITS: Unit[] = [
  { id: "marista", name: "Marista",      initial: "M",  gradient: "linear-gradient(135deg,#1a2744,#2d3f6b)" },
  { id: "bueno",   name: "Bueno",        initial: "B",  gradient: "linear-gradient(135deg,#0d3524,#1a5c3e)" },
  { id: "jardim",  name: "Jardim Goiás", initial: "JG", gradient: "linear-gradient(135deg,#3d1a00,#7a3500)" },
  { id: "oeste",   name: "Oeste",        initial: "O",  gradient: "linear-gradient(135deg,#1a0030,#3d006b)" },
];

const DEFAULT_PROPS: Property[] = [
  { id: 1, title: "Residencial Marista Prime", price: "R$ 890.000", area: "142 m²", rooms: "3 suítes + home office", garage: "3 vagas cobertas", address: "Setor Marista, Goiânia — GO", tag: "LANÇAMENTO", tagColor: "#E30613", gradient: "linear-gradient(160deg,#0d2340,#1a3d6b)", imageUrl: "", videoUrl: "", enabled: true, description: "Sofisticado residencial no coração do Setor Marista." },
  { id: 2, title: "Casa Duplex Bueno",         price: "R$ 1.200.000", area: "260 m²", rooms: "4 suítes + gourmet", garage: "4 vagas", address: "Setor Bueno, Goiânia — GO", tag: "OFERTA", tagColor: "#B8040F", gradient: "linear-gradient(160deg,#0d3524,#1a5c3e)", imageUrl: "", videoUrl: "", enabled: true, description: "Casa duplex de alto padrão no Setor Bueno." },
  { id: 3, title: "Cobertura Jardim Goiás",    price: "R$ 2.800.000", area: "420 m²", rooms: "5 suítes + piscina", garage: "5 vagas", address: "Jardim Goiás, Goiânia — GO", tag: "EXCLUSIVO", tagColor: "#333", gradient: "linear-gradient(160deg,#3d1a00,#7a3500)", imageUrl: "", videoUrl: "", enabled: true, description: "Cobertura exclusiva com vista panorâmica." },
  { id: 4, title: "Studio Oeste",              price: "R$ 320.000", area: "42 m²", rooms: "Studio compacto", garage: "1 vaga", address: "Setor Oeste, Goiânia — GO", tag: "ÚLTIMO", tagColor: "#1a0030", gradient: "linear-gradient(160deg,#1a0030,#3d006b)", imageUrl: "", videoUrl: "", enabled: true, description: "Último studio disponível no Setor Oeste." },
];
const DEFAULT_GOALS: Goal[] = [
  { unitId: "marista", visits: 142, sales: 8,  target: 12 },
  { unitId: "bueno",   visits: 98,  sales: 6,  target: 10 },
  { unitId: "jardim",  visits: 76,  sales: 3,  target: 8  },
  { unitId: "oeste",   visits: 63,  sales: 5,  target: 7  },
];

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

  .adm-root { width:100vw; height:100vh; overflow:hidden; background:var(--bg); color:var(--text); font-family:'DM Sans',sans-serif; display:flex; flex-direction:column; transition:background 350ms ease, color 350ms ease; }

  @keyframes fadeIn      { from{opacity:0} to{opacity:1} }
  @keyframes fadeSlideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes scalePop    { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
  @keyframes spin        { to{transform:rotate(360deg)} }

  .fade-in { animation: fadeIn 300ms ease both; }
  .slide-up { animation: fadeSlideUp 350ms ease both; }

  input[type=number]::-webkit-outer-spin-button,
  input[type=number]::-webkit-inner-spin-button { -webkit-appearance:none; }
  input[type=number] { -moz-appearance:textfield; }

  ::-webkit-scrollbar { width:4px; height:4px; }
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
  .adm-btn-ghost { background:var(--bg3); color:var(--text2); border-radius:10px; border:1px solid var(--border); }
  .adm-btn-ghost:hover { background:var(--bg4); color:var(--text); }
  .adm-btn-danger { background:rgba(227,6,19,.12); color:#E30613; border-radius:10px; border:1px solid rgba(227,6,19,.25); }
  .adm-btn-danger:hover { background:rgba(227,6,19,.22); }

  .sidebar-item {
    display:flex; align-items:center; gap:12px; padding:11px 16px;
    border-radius:12px; cursor:pointer; border:none; background:none;
    color:var(--text3); font-family:'Barlow',sans-serif; font-weight:700;
    font-size:13px; letter-spacing:.04em; transition:all 180ms ease; width:100%; text-align:left;
  }
  .sidebar-item:hover { background:var(--bg3); color:var(--text); }
  .sidebar-item.active { background:rgba(227,6,19,.12); color:var(--accent); border:1px solid rgba(227,6,19,.20); }

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

// ─── Login ────────────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [user, setUser]  = useState("");
  const [pass, setPass]  = useState("");
  const [err,  setErr]   = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    setTimeout(() => {
      if (user === "admin" && pass === "lopes2025") { onLogin(); }
      else { setErr("Usuário ou senha incorretos."); setLoading(false); }
    }, 800);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(227,6,19,.12) 0%, transparent 55%)", pointerEvents: "none" }} />
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 24, padding: "40px 40px 36px", width: "100%", maxWidth: 400, boxShadow: "0 24px 64px rgba(0,0,0,.45)", animation: "scalePop 350ms cubic-bezier(0.34,1.56,0.64,1) both" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#E30613", display: "flex", alignItems: "center", justifyContent: "center", padding: 8, boxShadow: "0 6px 20px rgba(227,6,19,.35)" }}>
              <img src={faviconLopes} alt="Lopes" style={{ width: "100%", height: "100%", objectFit: "contain", filter: "brightness(0) invert(1)" }} />
            </div>
            <img src={logoBranca} alt="Lopes" style={{ height: 28, objectFit: "contain", opacity: .92 }} />
          </div>
          <div style={{ fontSize: 13, color: "var(--text3)", letterSpacing: ".10em", textTransform: "uppercase", fontFamily: "'Barlow',sans-serif", fontWeight: 700 }}>Painel de Controle</div>
          <div style={{ width: 40, height: 2, background: "#E30613", margin: "12px auto 0", borderRadius: 2 }} />
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label className="adm-label">Usuário</label>
            <input className="adm-input" type="text" placeholder="admin" value={user} onChange={e => setUser(e.target.value)} autoComplete="username" />
          </div>
          <div>
            <label className="adm-label">Senha</label>
            <div style={{ position: "relative" }}>
              <input className="adm-input" type={showPass ? "text" : "password"} placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)} style={{ paddingRight: 44 }} autoComplete="current-password" />
              <button type="button" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text3)", padding: 4 }} onClick={() => setShowPass(v => !v)}>
                {showPass
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
          </div>

          {err && (
            <div style={{ padding: "10px 14px", background: "rgba(227,6,19,.10)", border: "1px solid rgba(227,6,19,.25)", borderRadius: 10, color: "#E30613", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {err}
            </div>
          )}

          <button className="adm-btn adm-btn-accent" type="submit" style={{ padding: "14px", fontSize: 14, letterSpacing: ".10em", textTransform: "uppercase", marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} disabled={loading}>
            {loading ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> : null}
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div style={{ marginTop: 24, padding: "14px 16px", background: "var(--bg3)", borderRadius: 12, border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 11, color: "var(--text4)", letterSpacing: ".10em", textTransform: "uppercase", fontFamily: "'Barlow',sans-serif", fontWeight: 700, marginBottom: 6 }}>Credenciais de demonstração</div>
          <div style={{ display: "flex", gap: 16, fontSize: 13 }}>
            <span style={{ color: "var(--text3)" }}>Usuário: <strong style={{ color: "var(--text2)" }}>admin</strong></span>
            <span style={{ color: "var(--text3)" }}>Senha: <strong style={{ color: "var(--text2)" }}>lopes2025</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Image Dropzone ───────────────────────────────────────────────────────────

function ImageDropzone({ value, onChange, label }: { value: string; onChange: (url: string) => void; label: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(value);
  const [urlInput, setUrlInput] = useState(value);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => { const url = e.target?.result as string; setPreview(url); onChange(url); };
    reader.readAsDataURL(file);
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
      {/* URL input fallback */}
      <div style={{ display: "flex", gap: 8 }}>
        <input className="adm-input" type="url" placeholder="Ou cole uma URL de imagem..." value={urlInput} onChange={e => setUrlInput(e.target.value)} style={{ fontSize: 13 }} />
        <button className="adm-btn adm-btn-ghost" style={{ padding: "10px 14px", fontSize: 12, whiteSpace: "nowrap" }} onClick={() => { setPreview(urlInput); onChange(urlInput); }}>Aplicar</button>
      </div>
      {preview && (
        <button className="adm-btn adm-btn-danger" style={{ padding: "8px", fontSize: 12 }} onClick={() => { setPreview(""); setUrlInput(""); onChange(""); }}>Remover imagem</button>
      )}
    </div>
  );
}

// ─── Property Modal ───────────────────────────────────────────────────────────

function PropertyModal({ prop, onSave, onClose }: { prop: Property; onSave: (p: Property) => void; onClose: () => void }) {
  const [draft, setDraft] = useState<Property>({ ...prop });
  const up = (k: keyof Property, v: string | boolean) => setDraft(d => ({ ...d, [k]: v }));

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div style={{ padding: "24px 28px 0", borderBottom: "1px solid var(--border2)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 800, fontSize: 17, color: "var(--text)" }}>Editar Imóvel</div>
              <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>Preencha os dados e a mídia do imóvel</div>
            </div>
            <button className="adm-btn adm-btn-ghost" style={{ width: 34, height: 34, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10 }} onClick={onClose}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "22px 28px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Enable toggle */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "var(--bg3)", borderRadius: 12, border: "1px solid var(--border)" }}>
              <div>
                <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text)" }}>Ativo na TV</div>
                <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>Exibir este imóvel nas telas</div>
              </div>
              <div className="toggle-switch" style={{ background: draft.enabled ? "#E30613" : "var(--border)" }} onClick={() => up("enabled", !draft.enabled)}>
                <div className="toggle-knob" style={{ left: draft.enabled ? 23 : 3 }} />
              </div>
            </div>

            {/* Basic info */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {([["title","Título do Imóvel"],["price","Preço"],["area","Área"],["rooms","Quartos/Suítes"],["garage","Garagem"],["address","Endereço completo"]] as [keyof Property, string][]).map(([k, lbl]) => (
                <div key={k} style={{ gridColumn: k === "title" || k === "address" ? "1 / -1" : "auto" }}>
                  <label className="adm-label">{lbl}</label>
                  <input className="adm-input" type="text" value={String(draft[k])} onChange={e => up(k, e.target.value)} />
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <label className="adm-label">Descrição curta (exibida na TV)</label>
              <textarea className="adm-input" value={draft.description} onChange={e => setDraft(d => ({ ...d, description: e.target.value }))} rows={2} style={{ resize: "none", lineHeight: 1.5 }} />
            </div>

            {/* Tag */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "end" }}>
              <div>
                <label className="adm-label">Tag (ex: NOVO, OFERTA, EXCLUSIVO)</label>
                <input className="adm-input" type="text" value={draft.tag} onChange={e => up("tag", e.target.value)} />
              </div>
              <div>
                <label className="adm-label">Cor da Tag</label>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input type="color" value={draft.tagColor} onChange={e => up("tagColor", e.target.value)} style={{ width: 42, height: 42, borderRadius: 10, border: "1px solid var(--border)", cursor: "pointer", background: "none", padding: 2 }} />
                  <span className="tag-badge" style={{ background: draft.tagColor }}>{draft.tag || "TAG"}</span>
                </div>
              </div>
            </div>

            {/* Image */}
            <ImageDropzone value={draft.imageUrl} onChange={url => up("imageUrl", url)} label="Imagem de capa" />

            {/* Video URL */}
            <div>
              <label className="adm-label">URL do Vídeo (YouTube, MP4 direto ou similar)</label>
              <input className="adm-input" type="url" placeholder="https://youtube.com/embed/..." value={draft.videoUrl} onChange={e => up("videoUrl", e.target.value)} />
              {draft.videoUrl && (
                <div style={{ marginTop: 8, padding: "10px 14px", background: "var(--bg3)", borderRadius: 10, border: "1px solid var(--border)", fontSize: 12, color: "var(--text3)", display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
                  Vídeo configurado — será reproduzido em loop na TV
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ padding: "16px 28px 24px", borderTop: "1px solid var(--border2)", display: "flex", gap: 10, flexShrink: 0 }}>
          <button className="adm-btn adm-btn-accent" style={{ flex: 1, padding: "13px", fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase" }} onClick={() => { onSave(draft); onClose(); }}>Salvar Imóvel</button>
          <button className="adm-btn adm-btn-ghost" style={{ flex: 1, padding: "13px", fontSize: 13 }} onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

// ─── Sections ─────────────────────────────────────────────────────────────────

function SectionImoveis({ props, onUpdate }: { props: Property[]; onUpdate: (p: Property[]) => void }) {
  const [editing, setEditing] = useState<Property | null>(null);

  const save = (p: Property) => onUpdate(props.map(x => x.id === p.id ? p : x));
  const add  = () => {
    const novo: Property = { id: Date.now(), title: "Novo Imóvel", price: "R$ 0", area: "0 m²", rooms: "—", garage: "—", address: "—", tag: "NOVO", tagColor: "#E30613", gradient: "linear-gradient(160deg,#1a2744,#2d3f6b)", imageUrl: "", videoUrl: "", enabled: true, description: "" };
    onUpdate([...props, novo]);
    setEditing(novo);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 800, fontSize: 20, color: "var(--text)" }}>Imóveis</h2>
          <p style={{ fontSize: 13, color: "var(--text3)", marginTop: 3 }}>{props.filter(p => p.enabled).length} ativos · {props.length} total</p>
        </div>
        <button className="adm-btn adm-btn-accent" style={{ padding: "10px 18px", fontSize: 13, display: "flex", alignItems: "center", gap: 7 }} onClick={add}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          Novo Imóvel
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
        {props.map((p, i) => (
          <div key={p.id} className="prop-card slide-up" style={{ animationDelay: `${i * 40}ms` }}>
            {/* Thumbnail */}
            <div style={{ height: 120, background: p.imageUrl ? `url(${p.imageUrl}) center/cover` : p.gradient, position: "relative", overflow: "hidden" }}>
              {!p.imageUrl && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
              )}
              {/* Status badge */}
              <div style={{ position: "absolute", top: 10, right: 10 }}>
                <div style={{ padding: "3px 10px", borderRadius: 7, background: p.enabled ? "rgba(34,197,94,.90)" : "rgba(0,0,0,.60)", color: "#fff", fontSize: 11, fontFamily: "'Barlow',sans-serif", fontWeight: 700, letterSpacing: ".10em", backdropFilter: "blur(8px)" }}>
                  {p.enabled ? "ATIVO" : "INATIVO"}
                </div>
              </div>
              {/* Tag */}
              <div style={{ position: "absolute", top: 10, left: 10 }}>
                <span className="tag-badge" style={{ background: p.tagColor }}>{p.tag}</span>
              </div>
              {/* Video indicator */}
              {p.videoUrl && (
                <div style={{ position: "absolute", bottom: 10, right: 10, width: 26, height: 26, borderRadius: "50%", background: "rgba(0,0,0,.60)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M5 3l14 9-14 9V3z"/></svg>
                </div>
              )}
            </div>
            {/* Info */}
            <div style={{ padding: "14px 16px" }}>
              <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 4, lineHeight: 1.25 }}>{p.title}</div>
              <div style={{ color: "#E30613", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 18, marginBottom: 6 }}>{p.price}</div>
              <div style={{ display: "flex", gap: 8, fontSize: 12, color: "var(--text3)", marginBottom: 12, flexWrap: "wrap" as const }}>
                <span>📐 {p.area}</span>
                <span>🛏 {p.rooms}</span>
                <span>🚗 {p.garage}</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="adm-btn adm-btn-ghost" style={{ flex: 1, padding: "9px", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }} onClick={() => setEditing(p)}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Editar
                </button>
                <button className="adm-btn adm-btn-danger" style={{ padding: "9px 14px", fontSize: 13 }} onClick={() => onUpdate(props.filter(x => x.id !== p.id))}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && <PropertyModal prop={editing} onSave={save} onClose={() => setEditing(null)} />}
    </div>
  );
}

function SectionPlacares({ goals, onUpdate }: { goals: Goal[]; onUpdate: (g: Goal[]) => void }) {
  const upGoal = (unitId: string, k: keyof Goal, v: number) => onUpdate(goals.map(g => g.unitId === unitId ? { ...g, [k]: v } : g));

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 800, fontSize: 20, color: "var(--text)" }}>Placares de Vendas</h2>
        <p style={{ fontSize: 13, color: "var(--text3)", marginTop: 3 }}>Atualize os números exibidos na TV em tempo real</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {UNITS.map((u, i) => {
          const g = goals.find(x => x.unitId === u.id) ?? { unitId: u.id, visits: 0, sales: 0, target: 10 };
          const pct = Math.min(100, Math.round((g.sales / g.target) * 100));
          return (
            <div key={u.id} className="stat-card slide-up" style={{ animationDelay: `${i * 50}ms` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: u.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 16, color: "rgba(255,255,255,.9)", flexShrink: 0 }}>{u.initial}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text)" }}>{u.name}</div>
                  {/* Progress bar */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
                    <div style={{ flex: 1, height: 5, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: pct >= 100 ? "#22c55e" : "#E30613", borderRadius: 3, transition: "width 0.6s ease" }} />
                    </div>
                    <span style={{ fontSize: 12, color: pct >= 100 ? "#22c55e" : "var(--text3)", fontWeight: 700, minWidth: 36 }}>{pct}%</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {([["visits","Visitas"],["sales","Vendas"],["target","Meta"]] as [keyof Goal, string][]).map(([k, lbl]) => (
                  <div key={k}>
                    <label className="adm-label">{lbl}</label>
                    <input className="adm-input" type="number" min={0} value={g[k]} onChange={e => upGoal(u.id, k, parseInt(e.target.value) || 0)} style={{ textAlign: "center", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 22, color: k === "sales" ? "#E30613" : "var(--text)" }} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SectionOfertao({ label1, label2, label3, seconds, onUpdate }: {
  label1: string; label2: string; label3: string; seconds: number;
  onUpdate: (l1: string, l2: string, l3: string, s: number) => void;
}) {
  const h = Math.floor(seconds / 3600), m = Math.floor((seconds % 3600) / 60), s = seconds % 60;
  const [l1, setL1] = useState(label1); const [l2, setL2] = useState(label2); const [l3, setL3] = useState(label3);
  const [hv, setHv] = useState(String(h)); const [mv, setMv] = useState(String(m)); const [sv, setSv] = useState(String(s));

  const save = () => onUpdate(l1, l2, l3, (parseInt(hv)||0)*3600 + (parseInt(mv)||0)*60 + (parseInt(sv)||0));

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 800, fontSize: 20, color: "var(--text)" }}>Temporizador Ofertão</h2>
        <p style={{ fontSize: 13, color: "var(--text3)", marginTop: 3 }}>Configure a duração e as informações do painel</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 520 }}>
        {/* Timer */}
        <div className="stat-card">
          <label className="adm-label" style={{ marginBottom: 12 }}>Duração do Contador</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[["Horas", hv, setHv], ["Minutos", mv, setMv], ["Segundos", sv, setSv]].map(([lbl, val, set]) => (
              <div key={String(lbl)}>
                <label className="adm-label" style={{ textAlign: "center", display: "block", marginBottom: 6 }}>{lbl}</label>
                <input className="adm-input" type="number" value={String(val)} min={0} max={String(lbl) === "Horas" ? 99 : 59} onChange={e => (set as (v: string) => void)(e.target.value)} style={{ textAlign: "center", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 32, padding: "12px 8px" }} />
              </div>
            ))}
          </div>
          {/* Preview */}
          <div style={{ textAlign: "center", marginTop: 16, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 48, color: "#E30613", letterSpacing: "-.03em" }}>
            {String(parseInt(hv)||0).padStart(2,"0")}:{String(parseInt(mv)||0).padStart(2,"0")}:{String(parseInt(sv)||0).padStart(2,"0")}
          </div>
        </div>

        {/* Labels */}
        <div className="stat-card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 4 }}>Blocos de Informação</div>
          {([["Bloco Esquerdo (ex: Vendas)", l1, setL1], ["Bloco Central (ex: Meta Diária)", l2, setL2], ["Bloco Direito (ex: Data/Evento)", l3, setL3]] as [string, string, (v: string) => void][]).map(([lbl, val, set]) => (
            <div key={lbl}>
              <label className="adm-label">{lbl}</label>
              <input className="adm-input" type="text" value={val} onChange={e => set(e.target.value)} />
            </div>
          ))}
        </div>

        <button className="adm-btn adm-btn-accent" style={{ padding: "14px", fontSize: 14, letterSpacing: ".08em", textTransform: "uppercase" }} onClick={save}>Salvar Configurações</button>
      </div>
    </div>
  );
}

function SectionDisplay({ theme, onThemeToggle, autoRotate, interval, onAutoRotate, onInterval, activeUnit, onUnit }: {
  theme: "dark" | "light"; onThemeToggle: () => void;
  autoRotate: boolean; interval: number; onAutoRotate: (v: boolean) => void; onInterval: (v: number) => void;
  activeUnit: string; onUnit: (id: string) => void;
}) {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 800, fontSize: 20, color: "var(--text)" }}>Configurações de Display</h2>
        <p style={{ fontSize: 13, color: "var(--text3)", marginTop: 3 }}>Controle a aparência e o comportamento das TVs</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 520 }}>

        {/* Theme */}
        <div className="stat-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
              {theme === "dark" ? "🌙 Modo Escuro" : "☀️ Modo Claro"}
            </div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>Modo escuro recomendado para TVs em ambientes de showroom</div>
          </div>
          <div className="toggle-switch" style={{ background: theme === "dark" ? "#E30613" : "var(--border)" }} onClick={onThemeToggle}>
            <div className="toggle-knob" style={{ left: theme === "dark" ? 23 : 3 }} />
          </div>
        </div>

        {/* Auto-rotate */}
        <div className="stat-card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text)" }}>Rotação Automática</div>
              <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>Alterna os slides sem interação manual</div>
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

        {/* Active unit */}
        <div className="stat-card">
          <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 14 }}>Unidade Ativa</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {UNITS.map(u => (
              <div key={u.id} onClick={() => onUnit(u.id)} style={{
                padding: "12px 14px", borderRadius: 12, cursor: "pointer",
                background: activeUnit === u.id ? "rgba(227,6,19,.10)" : "var(--bg4)",
                border: `1px solid ${activeUnit === u.id ? "#E30613" : "var(--border)"}`,
                display: "flex", alignItems: "center", gap: 10, transition: "all 200ms ease",
              }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: u.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 11, color: "rgba(255,255,255,.9)" }}>{u.initial}</div>
                <span style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{u.name}</span>
                {activeUnit === u.id && <svg style={{ marginLeft: "auto" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E30613" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
            ))}
          </div>
        </div>

        {/* Preview link */}
        <div style={{ padding: "14px 16px", background: "rgba(227,6,19,.06)", border: "1px solid rgba(227,6,19,.20)", borderRadius: 14, display: "flex", alignItems: "center", gap: 12 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E30613" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 13, color: "var(--text)" }}>Visualizar na TV</div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>Abra o app principal em tela cheia</div>
          </div>
          <button className="adm-btn adm-btn-accent" style={{ padding: "8px 14px", fontSize: 12 }} onClick={() => window.open("/__mockup/preview/lopes-tv/LopesSignage", "_blank")}>Abrir TV</button>
        </div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export function AdminPanel() {
  const [loggedIn, setLoggedIn]   = useState(false);
  const [section, setSection]     = useState<AdminSection>("imoveis");
  const [theme, setTheme]         = useState<"dark" | "light">("dark");
  const [props, setProps]         = useState<Property[]>(DEFAULT_PROPS);
  const [goals, setGoals]         = useState<Goal[]>(DEFAULT_GOALS);
  const [tl1, setTl1]             = useState("Vendas");
  const [tl2, setTl2]             = useState("Meta Diária");
  const [tl3, setTl3]             = useState(new Date().toLocaleDateString("pt-BR"));
  const [timerSecs, setTimerSecs] = useState(600);
  const [autoRotate, setAutoRotate] = useState(true);
  const [rotInterval, setRotInterval] = useState(8);
  const [activeUnit, setActiveUnit] = useState("marista");
  const [saved, setSaved] = useState(false);

  const showSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const NAV_ITEMS = [
    { id: "imoveis"  as AdminSection, label: "Imóveis",    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { id: "placares" as AdminSection, label: "Placares",   icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
    { id: "ofertao"  as AdminSection, label: "Ofertão",    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
    { id: "display"  as AdminSection, label: "Display",    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> },
  ];

  if (!loggedIn) {
    return (
      <>
        <style>{CSS}</style>
        <div className={`adm-root adm-${theme}`}><LoginScreen onLogin={() => setLoggedIn(true)} /></div>
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div className={`adm-root adm-${theme}`}>
        {/* Top header */}
        <header style={{ height: 60, background: "var(--bg2)", borderBottom: "1px solid var(--border2)", display: "flex", alignItems: "center", padding: "0 24px", gap: 16, flexShrink: 0, zIndex: 50 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "#E30613", display: "flex", alignItems: "center", justifyContent: "center", padding: 5 }}>
              <img src={faviconLopes} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", filter: "brightness(0) invert(1)" }} />
            </div>
            <img src={logoBranca} alt="Lopes" style={{ height: 20, objectFit: "contain", opacity: .9 }} />
          </div>
          <div style={{ width: 1, height: 16, background: "var(--border)" }} />
          <span style={{ fontSize: 12, color: "var(--text3)", letterSpacing: ".12em", textTransform: "uppercase", fontFamily: "'Barlow',sans-serif", fontWeight: 700 }}>Painel de Controle</span>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            {/* Saved toast */}
            {saved && (
              <div style={{ padding: "6px 14px", background: "rgba(34,197,94,.15)", border: "1px solid rgba(34,197,94,.30)", borderRadius: 9999, color: "#22c55e", fontSize: 12, fontFamily: "'Barlow',sans-serif", fontWeight: 700, letterSpacing: ".08em", display: "flex", alignItems: "center", gap: 6, animation: "fadeSlideUp 300ms ease both" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Salvo!
              </div>
            )}
            {/* Theme toggle */}
            <button className="adm-btn adm-btn-ghost" style={{ width: 36, height: 36, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, fontSize: 16 }} onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}>
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            {/* User */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "var(--bg3)", borderRadius: 10, border: "1px solid var(--border)" }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: "linear-gradient(135deg,#E30613,#B8040F)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, color: "#fff" }}>A</div>
              <span style={{ fontSize: 13, fontFamily: "'Barlow',sans-serif", fontWeight: 600, color: "var(--text2)" }}>admin</span>
            </div>
            {/* Logout */}
            <button className="adm-btn adm-btn-ghost" style={{ padding: "8px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }} onClick={() => setLoggedIn(false)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sair
            </button>
          </div>
        </header>

        {/* Body */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Sidebar */}
          <aside style={{ width: 220, background: "var(--bg2)", borderRight: "1px solid var(--border2)", padding: "20px 12px", display: "flex", flexDirection: "column", gap: 4, flexShrink: 0, overflowY: "auto" }}>
            <div style={{ fontSize: 10, color: "var(--text4)", letterSpacing: ".16em", textTransform: "uppercase", fontFamily: "'Barlow',sans-serif", fontWeight: 700, padding: "4px 16px 12px" }}>Menu</div>
            {NAV_ITEMS.map(item => (
              <button key={item.id} className={`sidebar-item ${section === item.id ? "active" : ""}`} onClick={() => setSection(item.id)}>
                {item.icon}{item.label}
                {item.id === "imoveis" && <span style={{ marginLeft: "auto", fontSize: 11, background: "var(--bg4)", color: "var(--text3)", padding: "2px 7px", borderRadius: 9999 }}>{props.length}</span>}
              </button>
            ))}

            {/* Stats summary */}
            <div style={{ marginTop: "auto", padding: "16px 14px 4px", borderTop: "1px solid var(--border2)" }}>
              <div style={{ fontSize: 11, color: "var(--text4)", letterSpacing: ".12em", textTransform: "uppercase", fontFamily: "'Barlow',sans-serif", fontWeight: 700, marginBottom: 10 }}>Resumo</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  ["Imóveis ativos", props.filter(p => p.enabled).length],
                  ["Total vendas", goals.reduce((a, g) => a + g.sales, 0)],
                  ["Total visitas", goals.reduce((a, g) => a + g.visits, 0)],
                ].map(([label, val]) => (
                  <div key={String(label)} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span style={{ color: "var(--text3)" }}>{label}</span>
                    <span style={{ color: "var(--text)", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 14 }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
            <div key={section} className="fade-in">
              {section === "imoveis" && <SectionImoveis props={props} onUpdate={p => { setProps(p); showSaved(); }} />}
              {section === "placares" && <SectionPlacares goals={goals} onUpdate={g => { setGoals(g); showSaved(); }} />}
              {section === "ofertao"  && <SectionOfertao label1={tl1} label2={tl2} label3={tl3} seconds={timerSecs} onUpdate={(l1, l2, l3, s) => { setTl1(l1); setTl2(l2); setTl3(l3); setTimerSecs(s); showSaved(); }} />}
              {section === "display"  && <SectionDisplay theme={theme} onThemeToggle={() => setTheme(t => t === "dark" ? "light" : "dark")} autoRotate={autoRotate} interval={rotInterval} onAutoRotate={v => { setAutoRotate(v); showSaved(); }} onInterval={v => { setRotInterval(v); showSaved(); }} activeUnit={activeUnit} onUnit={id => { setActiveUnit(id); showSaved(); }} />}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
