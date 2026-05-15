import { useState, useEffect, useRef, useCallback } from "react";
import logoBranca from "@/assets/logo-branca.png";
import logoPreta from "@/assets/logo-preta.png";
import faviconLopes from "@/assets/favicon-lopes.png";
import { PlacarLopes } from "./PlacarLopes";
import { placarService, type Imovel, type SignageSettings } from "@/services/placarService";
import type { Unidade } from "@/types/placar";

// ─── Types ────────────────────────────────────────────────────────────────────

type Screen = "streaming" | "player" | "timer" | "placar";
type Theme = "dark" | "light";

const FALLBACK_GRADIENTS: Record<string, string> = {
  "marista": "linear-gradient(135deg,#1a2744,#2d3f6b)",
  "bueno": "linear-gradient(135deg,#0d3524,#1a5c3e)",
  "jd-goias": "linear-gradient(135deg,#3d1a00,#7a3500)",
  "oeste": "linear-gradient(135deg,#1a0030,#3d006b)",
};

// ─── Utils ────────────────────────────────────────────────────────────────────

const pad = (n: number) => String(n).padStart(2, "0");
function formatTime(t: number) {
  return `${pad(Math.floor(t / 3600))}:${pad(Math.floor((t % 3600) / 60))}:${pad(t % 60)}`;
}

// ─── CSS ──────────────────────────────────────────────────────────────────────

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700;800;900&family=Barlow+Condensed:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root { --accent: #E30613; --accent-h: #FF1A27; --accent-m: #B8040F; }

  /* Dark tokens */
  .ds-dark  { --bg:     #0A0A0F; --bg2: #141418; --bg3: #1C1C24; --bg4: #242430; --text: #F0F2F8; --text2: #B8BDCC; --text3: #72788A; --text4: #4A4F60; --border: #2A2A36; --border2: #1E1E28; }
  /* Light tokens */
  .ds-light { --bg:     #F2F4F7; --bg2: #FFFFFF;  --bg3: #E8ECF1; --bg4: #F0F3F8; --text: #0A0A0F; --text2: #3A3D4A; --text3: #6B7080; --text4: #9BA3B2; --border: #D8DDE8; --border2: #E8ECF1; }

  .ds-root {
    width: 100vw; height: 100vh; overflow: hidden; position: relative;
    background: var(--bg); color: var(--text);
    font-family: 'DM Sans', sans-serif;
    transition: background 400ms ease, color 400ms ease;
  }

  /* ── Animations ── */
  @keyframes fadeIn        { from{opacity:0}  to{opacity:1} }
  @keyframes fadeSlideUp   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes scalePop      { from{opacity:0;transform:scale(0.88)} to{opacity:1;transform:scale(1)} }
  @keyframes glowPulse     { 0%,100%{box-shadow:0 0 24px rgba(227,6,19,.35),0 0 48px rgba(227,6,19,.15)} 50%{box-shadow:0 0 36px rgba(227,6,19,.55),0 0 72px rgba(227,6,19,.25)} }
  @keyframes urgentPulse   { 0%,100%{text-shadow:0 0 40px rgba(255,107,53,.20)} 50%{text-shadow:0 0 80px rgba(255,107,53,.70)} }
  @keyframes donePulse     { 0%,100%{text-shadow:0 0 40px rgba(227,6,19,.30)} 50%{text-shadow:0 0 100px rgba(227,6,19,.90)} }
  @keyframes blink         { 0%,100%{opacity:1} 50%{opacity:.5} }
  @keyframes progressFill  { from{transform:scaleX(0)} to{transform:scaleX(1)} }
  @keyframes spin          { to{transform:rotate(360deg)} }

  /* ── Screen transition ── */
  .screen-enter { animation: fadeIn 450ms cubic-bezier(0.25,0.46,0.45,0.94) both; }

  /* ── Scrollbars ── */
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

  /* ── Cards ── */
  .card-hover { transition: transform 250ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 250ms ease; cursor: pointer; }
  .card-hover:hover { transform: scale(1.05) translateY(-4px); box-shadow: 0 16px 48px rgba(0,0,0,.45); z-index: 10; }

  /* ── Btn base ── */
  .btn { border: none; cursor: pointer; font-family: 'Barlow', sans-serif; font-weight: 700; transition: all 200ms ease; }
  .btn-accent { background: var(--accent); color: #fff; border-radius: 9999px; }
  .btn-accent:hover { background: var(--accent-h); box-shadow: 0 4px 20px rgba(227,6,19,.45); }
  .btn-ghost { background: rgba(255,255,255,.08); color: var(--text2); border-radius: 14px; border: 1px solid rgba(255,255,255,.10); }
  .ds-light .btn-ghost { background: rgba(0,0,0,.05); color: var(--text2); border: 1px solid rgba(0,0,0,.08); }
  .btn-ghost:hover { background: rgba(255,255,255,.13); color: var(--text); }
  .ds-light .btn-ghost:hover { background: rgba(0,0,0,.08); color: var(--text); }

  /* ── Pill ── */
  .pill { height:44px; padding:0 20px; border-radius:9999px; font-family:'Barlow',sans-serif; font-weight:600; font-size:14px; cursor:pointer; border:none; transition:all 200ms ease; white-space:nowrap; display:flex; align-items:center; gap:6px; }
  .pill.active  { background:#fff; color:#0A0A0F; }
  .ds-light .pill.active { background:#1a1a2e; color:#fff; }
  .pill.inactive { background:var(--bg3); color:var(--text2); }
  .pill.inactive:hover { background:var(--bg4); color:var(--text); }

  /* ── Info block (timer) ── */
  .info-block { background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.08); border-radius:20px; backdrop-filter:blur(12px); padding:18px 22px; flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:5px; transition:all 200ms ease; animation:fadeSlideUp 500ms cubic-bezier(0.25,0.46,0.45,0.94) both; }
  .ds-light .info-block { background:rgba(0,0,0,.06); border-color:rgba(0,0,0,.08); }
`;

// ─── Sub-components ───────────────────────────────────────────────────────────

function Navbar({ theme, onThemeToggle, onBack, activeUnit, unidades, onNav, currentScreen }: {
  theme: Theme; onThemeToggle: () => void; onBack?: () => void;
  activeUnit: string; unidades: Unidade[]; onNav: (s: Screen) => void; currentScreen: Screen;
}) {
  const unit = unidades.find(u => u.id === activeUnit);
  const grad = unit ? (FALLBACK_GRADIENTS[unit.id] || "linear-gradient(135deg,#333,#111)") : "";
  const initial = unit ? unit.nome.substring(0,2).toUpperCase() : "LP";

  const handleAdminBtn = async () => {
    const isLogged = localStorage.getItem("lopes_admin_logged") === "true";
    if (isLogged) {
      window.location.href = "/admin";
    } else {
      const pin = window.prompt("Insira o PIN de administrador:");
      if (!pin) return;
      try {
        const dbPin = await placarService.getAdminPin();
        if (pin === dbPin) {
          localStorage.setItem("lopes_admin_logged", "true");
          window.location.href = "/admin";
        } else {
          alert("PIN Incorreto");
        }
      } catch (e) {
        alert("Erro ao validar o PIN. Verifique a rede.");
      }
    }
  };

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      backdropFilter: "blur(24px)",
      background: theme === "dark" ? "rgba(10,10,15,.97)" : "rgba(242,244,247,.97)",
      borderBottom: `1px solid var(--border2)`,
      height: 68, display: "flex", alignItems: "center",
      padding: "0 36px", gap: 24,
    }}>
      {onBack && (
        <button className="btn btn-ghost" style={{ padding: "8px 14px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }} onClick={onBack}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5m7-7-7 7 7 7"/></svg>
          Voltar
        </button>
      )}
      <img
        src={theme === "dark" ? logoBranca : logoPreta}
        alt="Lopes"
        onClick={() => onNav("streaming")}
        style={{ height: 28, objectFit: "contain", cursor: "pointer", transition: "opacity 200ms ease" }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = ".8"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
      />

      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
        {(["streaming", "player", "timer", "placar"] as Screen[]).map(s => {
          const labels: Record<string, string> = { streaming: "Carrossel de Imóveis", player: "Apresentação", timer: "Ofertão", placar: "Placar Envolvente" };
          const isAct = currentScreen === s;
          return (
            <button key={s} className="btn" style={{
              background: "none", padding: "20px 0",
              fontSize: 14, fontFamily: "'Barlow',sans-serif", fontWeight: 700,
              color: isAct ? "var(--text)" : "var(--text3)", 
              borderBottom: `3px solid ${isAct ? "#E30613" : "transparent"}`,
              borderRadius: 0,
            }}
              onClick={() => onNav(s)}
              onMouseEnter={e => { if(!isAct) (e.currentTarget as HTMLElement).style.color = "var(--text)"; }}
              onMouseLeave={e => { if(!isAct) (e.currentTarget as HTMLElement).style.color = "var(--text3)"; }}
            >{labels[s]}</button>
          );
        })}
      </div>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        {/* Theme toggle */}
        <button className="btn btn-ghost" style={{ width: 40, height: 40, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12 }} onClick={onThemeToggle} title="Alternar tema">
          {theme === "dark" ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          )}
        </button>
        {/* Fullscreen */}
        <button className="btn btn-ghost" style={{ width: 40, height: 40, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12 }} onClick={() => document.documentElement.requestFullscreen?.()} title="Tela cheia">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
        </button>
        {/* Manager */}
        <button className="btn" style={{ background: "#E30613", color: "#fff", padding: "8px 16px", borderRadius: 10, fontSize: 12, letterSpacing: ".10em", display: "flex", alignItems: "center", gap: 6 }} onClick={handleAdminBtn}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
          ADMIN
        </button>
        {/* Unit avatar */}
        {unit && (
          <div style={{ width: 34, height: 34, borderRadius: 10, background: grad, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 13, color: "rgba(255,255,255,.9)", border: "2px solid #E30613", cursor: "pointer" }} 
               onClick={() => {
                 localStorage.removeItem("lopes_selected_unit");
                 localStorage.removeItem("lopes_active_unit");
                 window.location.href = "/";
               }}
               title="Trocar Unidade"
          >
            {initial}
          </div>
        )}
      </div>
    </nav>
  );
}

// ─── Screen 2: Streaming Interface ───────────────────────────────────────────

const CATEGORIES = [
  { id: "all", label: "Todos", icon: "◉" },
  { id: "lancamentos", label: "Lançamentos", icon: "✦" },
  { id: "coberturas", label: "Coberturas", icon: "◆" },
];

function ScreenStreaming({ imoveis, onOpen, config }: { imoveis: Imovel[]; onOpen: (id: number) => void; config: SignageSettings }) {
  const [cat, setCat] = useState("all");
  const [heroIdx, setHeroIdx] = useState(0);

  const interval = config?.rot_interval || 8;
  const autoRot = config?.auto_rotate ?? true;

  useEffect(() => {
    if (!autoRot || imoveis.length === 0) return;
    const t = setInterval(() => setHeroIdx(i => (i + 1) % Math.min(2, imoveis.length)), interval * 1000);
    return () => clearInterval(t);
  }, [autoRot, interval, imoveis.length]);

  if (imoveis.length === 0) {
    return (
      <div className="screen-enter" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 40, marginBottom: 16 }}>🏡</span>
        <h2 style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, color: "var(--text3)" }}>Nenhum imóvel ativo cadastrado</h2>
        <p style={{ fontSize: 13, color: "var(--text4)", marginTop: 4 }}>Acesse o Admin para inserir novas ofertas nesta unidade</p>
      </div>
    );
  }

  const featured = imoveis.slice(0, 2);

  return (
    <div className="screen-enter" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 68px)", overflow: "hidden" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 36px 32px" }}>

        {/* Hero banners */}
        <div style={{ display: "grid", gridTemplateColumns: imoveis.length === 1 ? "1fr" : "1fr 1fr", gap: 18, marginBottom: 28 }}>
          {featured.map((p, i) => (
            <div key={p.id} onClick={() => onOpen(p.id)} style={{
              borderRadius: 20, padding: "28px 32px 24px", minHeight: 200,
              background: p.image_url ? `url(${p.image_url}) center/cover` : p.gradient || "linear-gradient(135deg,#242430,#1c1c24)", 
              cursor: "pointer", position: "relative", overflow: "hidden",
              transition: "transform 250ms ease, box-shadow 250ms ease",
              boxShadow: "0 8px 28px rgba(0,0,0,.30)",
              animation: `fadeSlideUp 400ms ease ${i * 80}ms both`,
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 60px rgba(0,0,0,.50)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(0,0,0,.30)"; }}
            >
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right,rgba(0,0,0,.75) 0%,rgba(0,0,0,.30) 60%,transparent 100%)" }} />
              <div style={{ position: "absolute", right: -50, bottom: -50, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,255,255,.08),transparent 70%)" }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 8, background: p.tag_color || "#E30613", color: "#fff", fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" }}>{p.tag || "DESTAQUE"}</span>
                <h2 style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 800, fontSize: 24, color: "#F0F2F8", letterSpacing: "-.02em", margin: "10px 0 4px", lineHeight: 1.2 }}>{p.title}</h2>
                <p style={{ color: "rgba(240,242,248,.75)", fontSize: 14, margin: "0 0 16px" }}>{p.price} · {p.area}</p>
                <button className="btn" style={{ background: "rgba(255,255,255,.18)", color: "#fff", padding: "9px 18px", borderRadius: 9999, fontSize: 13, display: "flex", alignItems: "center", gap: 7, backdropFilter: "blur(8px)", border: "none" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#E30613"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.18)"; }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z"/></svg>Ver Imóvel
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Category pills */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24, overflowX: "auto", paddingBottom: 4 }}>
          {CATEGORIES.map(c => (
            <button key={c.id} className={`pill ${cat === c.id ? "active" : "inactive"}`} onClick={() => setCat(c.id)}>
              <span style={{ fontSize: 12 }}>{c.icon}</span>{c.label}
            </button>
          ))}
        </div>

        {/* Property cards */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 20, color: "var(--text)", letterSpacing: "-.01em", marginBottom: 14 }}>Imóveis em Destaque</p>
          <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 8 }}>
            {imoveis.map((p, i) => (
              <div key={p.id} className="card-hover" onClick={() => onOpen(p.id)} style={{
                width: 170, minWidth: 170, borderRadius: 16, overflow: "hidden", position: "relative",
                background: p.image_url ? `url(${p.image_url}) center/cover` : p.gradient || "linear-gradient(135deg,#242430,#1c1c24)", flexShrink: 0,
                aspectRatio: "2/3", animation: `fadeSlideUp 400ms ease ${i * 50}ms both`,
              }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,.85) 0%,rgba(0,0,0,.15) 50%,transparent 100%)" }} />
                <div style={{ position: "absolute", top: 8, left: 8 }}>
                  <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 7, background: p.tag_color || "#E30613", color: "#fff", fontSize: 10, fontFamily: "'Barlow',sans-serif", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" }}>{p.tag}</span>
                </div>
                <div style={{ position: "absolute", bottom: 10, left: 10, right: 10 }}>
                  <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 13, color: "#F0F2F8", lineHeight: 1.25, marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.title}</div>
                  <div style={{ color: "#E30613", fontWeight: 700, fontSize: 13 }}>{p.price}</div>
                  <div style={{ color: "rgba(240,242,248,.60)", fontSize: 11, marginTop: 2 }}>{p.area}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 3: Player / Fullscreen ───────────────────────────────────────────

function ScreenPlayer({ imoveis, config, initialPropId, onBack }: { imoveis: Imovel[]; config: SignageSettings; initialPropId: number | null; onBack: () => void }) {
  const startIndex = initialPropId ? imoveis.findIndex(p => p.id === initialPropId) : 0;
  const [idx, setIdx] = useState(startIndex >= 0 ? startIndex : 0);
  const [fading, setFading] = useState(false);
  const p = imoveis[idx] ?? imoveis[0];

  const interval = config?.rot_interval || 8;
  const autoRot = config?.auto_rotate ?? true;

  const go = useCallback((next: number) => {
    setFading(true);
    setTimeout(() => { setIdx(next); setFading(false); }, 450);
  }, []);

  useEffect(() => {
    if (!autoRot || imoveis.length <= 1) return;
    const t = setInterval(() => go((idx + 1) % imoveis.length), interval * 1000);
    return () => clearInterval(t);
  }, [autoRot, interval, idx, imoveis.length, go]);

  if (!p) return null;

  const renderMedia = () => {
    if (p.video_url) {
      // Suporte a embeds de youtube e links diretos mp4
      let embedSrc = p.video_url;
      const ytMatch = p.video_url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/);
      if (ytMatch) {
        embedSrc = `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytMatch[1]}`;
        return (
          <iframe src={embedSrc} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none", pointerEvents: "none", scale: "1.15" }} allow="autoplay" />
        );
      }
      // Caso seja um arquivo mp4 direto
      return (
        <video src={embedSrc} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} autoPlay muted loop playsInline />
      );
    }

    // Caso seja imagem
    if (p.image_url) {
      return (
        <div style={{ position: "absolute", inset: 0, background: `url(${p.image_url}) center/cover`, opacity: fading ? 0 : 1, transition: "opacity 450ms ease" }} />
      );
    }

    // Fallback Gradiente
    return (
      <div style={{ position: "absolute", inset: 0, background: p.gradient || "linear-gradient(135deg,#242430,#141418)", opacity: fading ? 0 : 1, transition: "opacity 450ms ease" }} />
    );
  };

  return (
    <div style={{ width: "100%", height: "calc(100vh - 68px)", position: "relative", overflow: "hidden" }}>
      {/* Media Container */}
      <div style={{ position: "absolute", inset: 0, opacity: fading ? 0 : 1, transition: "opacity 450ms ease" }}>
        {renderMedia()}
      </div>

      {/* Vignet Overlay */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(0,0,0,.88) 0%,rgba(0,0,0,.40) 60%,rgba(0,0,0,.10) 100%)" }} />
      <div style={{ position: "absolute", right: "8%", top: "10%", width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,255,255,.06) 0%,transparent 70%)", pointerEvents: "none" }} />

      {/* Progress Bar */}
      {imoveis.length > 1 && (
        <div style={{ position: "absolute", top: 18, left: 60, right: 60, display: "flex", gap: 6, zIndex: 10 }}>
          {imoveis.map((_, i) => (
            <div key={i} style={{ height: 3, flex: 1, borderRadius: 2, background: i < idx ? "#E30613" : i === idx ? "rgba(255,255,255,.25)" : "rgba(255,255,255,.12)", overflow: "hidden", cursor: "pointer" }} onClick={() => go(i)}>
              {i === idx && autoRot && (
                <div style={{ height: "100%", background: "#E30613", transformOrigin: "left", animation: `progressFill ${interval}s linear forwards` }} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Content Overlay */}
      <div style={{ position: "absolute", inset: 0, padding: "60px 80px", display: "flex", flexDirection: "column", justifyContent: "center", opacity: fading ? 0 : 1, transition: "opacity 450ms ease", zIndex: 5 }}>
        <div style={{ maxWidth: 750 }}>
          <div style={{ marginBottom: 18 }}>
            <span style={{ display: "inline-block", padding: "5px 14px", borderRadius: 8, background: p.tag_color || "#E30613", color: "#fff", fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase" }}>{p.tag}</span>
            <span style={{ color: "rgba(240,242,248,.70)", fontSize: 14, marginLeft: 12, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, textShadow: "0 2px 4px rgba(0,0,0,.5)" }}>{p.address}</span>
          </div>
          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: "clamp(42px,6vw,78px)", color: "#F0F2F8", letterSpacing: "-.03em", lineHeight: .95, marginBottom: 14, textShadow: "0 4px 12px rgba(0,0,0,.4)" }}>{p.title}</h1>
          <div style={{ color: "#E30613", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: "clamp(28px,4vw,52px)", letterSpacing: "-.02em", marginBottom: 18, textShadow: "0 2px 6px rgba(0,0,0,.3)" }}>{p.price}</div>
          
          {p.description && (
            <p style={{ color: "rgba(240,242,248,.80)", fontSize: "clamp(14px,1.5vw,18px)", lineHeight: 1.5, maxWidth: 600, marginBottom: 24, textShadow: "0 2px 4px rgba(0,0,0,.5)" }}>{p.description}</p>
          )}

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[`⬛ ${p.area}`, `🛏 ${p.rooms}`, `🚗 ${p.garage}`].map((item, i) => (
              <div key={i} style={{ padding: "12px 20px", borderRadius: 14, background: "rgba(0,0,0,.60)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,.15)", color: "#fff", fontSize: 14, fontWeight: 600 }}>{item}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Status Row */}
      <div style={{ position: "absolute", bottom: 28, left: 80, right: 80, display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 10 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {imoveis.map((_, i) => (
            <button key={i} style={{ border: "none", cursor: "pointer", borderRadius: i === idx ? 5 : "50%", width: i === idx ? 28 : 10, height: 10, background: i === idx ? "#E30613" : "rgba(255,255,255,.28)", transition: "all 300ms ease" }} onClick={() => go(i)} />
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: autoRot ? "#22c55e" : "#F5A623", boxShadow: autoRot ? "0 0 8px rgba(34,197,94,.80)" : "none", animation: autoRot ? "blink 2s ease infinite" : "none" }} />
          <span style={{ color: "rgba(255,255,255,.60)", fontSize: 12, fontFamily: "'DM Sans',sans-serif", letterSpacing: ".08em", textShadow: "0 1px 2px rgba(0,0,0,.8)" }}>{autoRot ? "ROTAÇÃO AUTOMÁTICA" : "MANUAL"}</span>
          <span style={{ color: "rgba(255,255,255,.45)", fontSize: 12, marginLeft: 8 }}>{idx + 1} / {imoveis.length}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 4: Timer ──────────────────────────────────────────────────────────

function CircleRing({ value, max, size, color, label, children }: { value: number; max: number; size: number; color: string; label: string; children: React.ReactNode }) {
  const stroke = 5;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * Math.max(0, Math.min(1, value / Math.max(max, 1)));
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)", position: "absolute" }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth={stroke} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${dash} ${circ}`} style={{ transition: "stroke-dasharray .9s cubic-bezier(0.25,0.46,0.45,0.94)" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{children}</div>
      </div>
      <span style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 10, color: "var(--text4)", letterSpacing: ".16em", textTransform: "uppercase" }}>{label}</span>
    </div>
  );
}

function ScreenTimer({ config }: { config: SignageSettings }) {
  const { timer_label1, timer_label2, timer_label3, timer_seconds } = config;
  const initSecs = timer_seconds || 600;
  const [secs, setSecs] = useState(initSecs);
  const [init, setInit] = useState(initSecs);
  const [running, setRunning] = useState(false);
  const intRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { setSecs(initSecs); setInit(initSecs); }, [initSecs]);

  const stop = useCallback(() => { if (intRef.current) clearInterval(intRef.current); intRef.current = null; setRunning(false); }, []);
  const start = useCallback(() => {
    if (secs <= 0) return;
    setRunning(true);
    intRef.current = setInterval(() => setSecs(p => { if (p <= 1) { stop(); return 0; } return p - 1; }), 1000);
  }, [secs, stop]);

  useEffect(() => () => stop(), [stop]);

  const isDone = secs <= 0;
  const isUrgent = secs > 0 && secs <= 60;
  const timeColor = isDone ? "#E30613" : isUrgent ? "#FF6B35" : "#F0F2F8";
  const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60;
  const ringColor = isDone ? "#E30613" : isUrgent ? "#FF6B35" : "#E30613";

  return (
    <div className="screen-enter" style={{ height: "calc(100vh - 68px)", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: isDone ? "radial-gradient(ellipse at 50% 50%,rgba(227,6,19,.20) 0%,transparent 60%)" : isUrgent ? "radial-gradient(ellipse at 50% 50%,rgba(255,107,53,.15) 0%,transparent 60%)" : "radial-gradient(ellipse at 50% 20%,rgba(227,6,19,.08) 0%,transparent 55%)", transition: "background 1s ease", pointerEvents: "none" }} />

      {/* Ring row */}
      <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 12 }}>
        <CircleRing value={h} max={Math.max(Math.floor(init/3600), 1)} size={110} color={ringColor} label="Horas">
          <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 32, color: timeColor, letterSpacing: "-.02em" }}>{pad(h)}</span>
        </CircleRing>
        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 48, color: "rgba(255,255,255,.20)", marginBottom: 24, animation: running ? "blink 1s ease infinite" : "none" }}>:</span>
        <CircleRing value={m} max={59} size={110} color={ringColor} label="Minutos">
          <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 32, color: timeColor, letterSpacing: "-.02em" }}>{pad(m)}</span>
        </CircleRing>
        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 48, color: "rgba(255,255,255,.20)", marginBottom: 24, animation: running ? "blink 1s ease infinite" : "none" }}>:</span>
        <CircleRing value={s} max={59} size={110} color={ringColor} label="Segundos">
          <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 32, color: timeColor, letterSpacing: "-.02em" }}>{pad(s)}</span>
        </CircleRing>
      </div>

      {/* Big display */}
      <div style={{
        fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900,
        fontSize: "clamp(72px,15vw,180px)", color: timeColor, letterSpacing: "-.04em", lineHeight: 1,
        animation: isDone ? "donePulse .8s ease infinite" : isUrgent ? "urgentPulse 1s ease infinite" : "none",
        userSelect: "none",
      }}>{formatTime(secs)}</div>

      {/* Status */}
      <div style={{ height: 28, display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
        {isDone
          ? <span style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 800, fontSize: 14, color: "#E30613", letterSpacing: ".16em", textTransform: "uppercase" }}>— Tempo Encerrado —</span>
          : running
          ? <><div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", animation: "blink 1s ease infinite", boxShadow: "0 0 8px rgba(34,197,94,.80)" }} /><span style={{ color: "var(--text3)", fontSize: 13, letterSpacing: ".06em" }}>Em execução</span></>
          : secs === init
          ? <span style={{ color: "var(--text4)", fontSize: 13, letterSpacing: ".06em" }}>Pressione ▶ para iniciar</span>
          : <><div style={{ width: 7, height: 7, borderRadius: "50%", background: "#F5A623" }} /><span style={{ color: "var(--text3)", fontSize: 13 }}>Pausado</span></>
        }
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 24, zIndex: 10 }}>
        <button className="btn btn-ghost" style={{ width: 44, height: 44, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => { stop(); setSecs(init); }} title="Reiniciar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
        </button>
        <button className="btn btn-accent" style={{ width: 56, height: 56, borderRadius: "50%", padding: 0, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(227,6,19,.40)", opacity: isDone ? .5 : 1 }} onClick={running ? stop : start} disabled={isDone}>
          {running
            ? <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
            : <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z"/></svg>
          }
        </button>
        <button className="btn btn-ghost" style={{ width: 44, height: 44, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => document.documentElement.requestFullscreen?.()} title="Tela cheia">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
        </button>
      </div>

      {/* Info blocks */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", gap: 14, padding: "0 36px 24px", zIndex: 5 }}>
        {[timer_label1 || "EVENTO", timer_label2 || "META DIÁRIA", timer_label3 || new Date().toLocaleDateString("pt-BR")].map((lbl, i) => (
          <div key={i} className="info-block">
            <div style={{ width: 28, height: 3, borderRadius: 2, background: i === 0 ? "#E30613" : "rgba(255,255,255,.15)", marginBottom: 2 }} />
            <span style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 800, fontSize: "clamp(12px,1.3vw,18px)", color: "var(--text)", letterSpacing: ".06em", textTransform: "uppercase", textAlign: "center" }}>{lbl}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export function LopesSignage() {
  const [screen, setScreen] = useState<Screen>("streaming");
  const [theme, setTheme] = useState<Theme>("dark");
  
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [activeUnit, setActiveUnit] = useState("");
  
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [config, setConfig] = useState<SignageSettings | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [openPropId, setOpenPropId] = useState<number | null>(null);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  // Load initial dependencies
  useEffect(() => {
    const init = async () => {
      try {
        const unitList = await placarService.getUnidades();
        setUnidades(unitList);
        
        const stored = localStorage.getItem("lopes_selected_unit") || localStorage.getItem("lopes_active_unit") || unitList[0]?.id;
        if (stored) {
          setActiveUnit(stored);
        }
      } catch (e) {
        console.error("Erro ao carregar unidades:", e);
      }
    };
    init();
  }, []);

  // Refresh dynamic states for activeUnit
  useEffect(() => {
    if (!activeUnit) return;
    const loadContent = async () => {
      setLoading(true);
      try {
        const [imovList, cfg] = await Promise.all([
          placarService.getImoveis(activeUnit),
          placarService.getSignageConfig(activeUnit)
        ]);

        // Apenas imóveis marcados como ativos
        setImoveis(imovList.filter(x => x.ativo));
        
        if (cfg) {
          setConfig(cfg);
          setTheme(cfg.theme || "dark");
        } else {
          // Fallback de config vazio
          setConfig({
            unidade_id: activeUnit,
            theme: "dark",
            auto_rotate: true,
            rot_interval: 8,
            timer_label1: "Vendas",
            timer_label2: "Meta Diária",
            timer_label3: "",
            timer_seconds: 600
          });
          setTheme("dark");
        }
      } catch (e) {
        console.error("Erro ao carregar dados do Signage:", e);
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, [activeUnit]);

  const handleOpenProp = (id: number) => {
    setOpenPropId(id);
    setScreen("player");
  };

  const loadingSpinner = (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#0A0A0F", height: "100vh" }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid rgba(255,255,255,.1)", borderTopColor: "#E30613", animation: "spin 1s linear infinite" }} />
    </div>
  );

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      {loading ? (
        loadingSpinner
      ) : (
        <div className={`ds-root ds-${theme}`}>
          <Navbar
            theme={theme}
            onThemeToggle={toggleTheme}
            onBack={screen !== "streaming" && screen !== "placar" ? () => setScreen("streaming") : undefined}
            activeUnit={activeUnit}
            unidades={unidades}
            onNav={s => setScreen(s)}
            currentScreen={screen}
          />
          
          {screen === "streaming" && config && <ScreenStreaming imoveis={imoveis} onOpen={handleOpenProp} config={config} />}
          {screen === "player"    && config && <ScreenPlayer imoveis={imoveis} config={config} initialPropId={openPropId} onBack={() => setScreen("streaming")} />}
          {screen === "timer"     && config && <ScreenTimer config={config} />}
          {screen === "placar"    && <div className="screen-enter" style={{ height: "calc(100vh - 68px)", overflow: "hidden" }}><PlacarLopes /></div>}
        </div>
      )}
    </>
  );
}
