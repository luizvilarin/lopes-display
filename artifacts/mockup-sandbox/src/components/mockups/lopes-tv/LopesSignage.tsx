import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Screen = "profile" | "streaming" | "player" | "timer";
type Theme = "dark" | "light";

interface Unit { id: string; name: string; initial: string; gradient: string; color: string; }
interface Property { id: number; title: string; price: string; area: string; rooms: string; garage: string; address: string; tag: string; tagColor: string; gradient: string; }
interface Goal { unitId: string; visits: number; sales: number; target: number; }
interface AppData {
  activeUnit: string;
  properties: Property[];
  goals: Goal[];
  timerLabel1: string;
  timerLabel2: string;
  timerLabel3: string;
  timerInitialSeconds: number;
  autoRotate: boolean;
  autoRotateInterval: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const UNITS: Unit[] = [
  { id: "marista",   name: "Marista",       initial: "M",  color: "#1a2744", gradient: "linear-gradient(135deg,#1a2744,#2d3f6b)" },
  { id: "bueno",     name: "Bueno",         initial: "B",  color: "#0d3524", gradient: "linear-gradient(135deg,#0d3524,#1a5c3e)" },
  { id: "jardim",    name: "Jardim Goiás",  initial: "JG", color: "#3d1a00", gradient: "linear-gradient(135deg,#3d1a00,#7a3500)" },
  { id: "oeste",     name: "Oeste",         initial: "O",  color: "#1a0030", gradient: "linear-gradient(135deg,#1a0030,#3d006b)" },
];

const DEFAULT_PROPERTIES: Property[] = [
  { id: 1, title: "Residencial Marista Prime", price: "R$ 890.000", area: "142 m²", rooms: "3 suítes + home office", garage: "3 vagas", address: "Setor Marista, Goiânia", tag: "LANÇAMENTO", tagColor: "#E30613", gradient: "linear-gradient(160deg,#0d2340,#1a3d6b)" },
  { id: 2, title: "Casa Duplex Bueno",         price: "R$ 1.200.000", area: "260 m²", rooms: "4 suítes + gourmet",    garage: "4 vagas", address: "Setor Bueno, Goiânia",   tag: "OFERTA",     tagColor: "#B8040F", gradient: "linear-gradient(160deg,#0d3524,#1a5c3e)" },
  { id: 3, title: "Cobertura Jardim Goiás",    price: "R$ 2.800.000", area: "420 m²", rooms: "5 suítes + piscina",    garage: "5 vagas", address: "Jardim Goiás, Goiânia",  tag: "EXCLUSIVO",  tagColor: "#3d1a00", gradient: "linear-gradient(160deg,#3d1a00,#7a3500)" },
  { id: 4, title: "Studio Oeste",              price: "R$ 320.000",   area: "42 m²",  rooms: "Studio compacto",        garage: "1 vaga",  address: "Setor Oeste, Goiânia",   tag: "ÚLTIMO",     tagColor: "#1a0030", gradient: "linear-gradient(160deg,#1a0030,#3d006b)" },
  { id: 5, title: "Flat Marista Sul",          price: "R$ 445.000",   area: "65 m²",  rooms: "2 quartos",               garage: "2 vagas", address: "Setor Marista Sul",      tag: "NOVO",       tagColor: "#E30613", gradient: "linear-gradient(160deg,#001a2a,#003d5c)" },
  { id: 6, title: "Penthouse Setor Sul",       price: "R$ 4.500.000", area: "680 m²", rooms: "5 suítes + lazer",        garage: "5 vagas", address: "Setor Sul, Goiânia",     tag: "EXCLUSIVO",  tagColor: "#333",    gradient: "linear-gradient(160deg,#1a1a00,#3d3d00)" },
];

const DEFAULT_GOALS: Goal[] = [
  { unitId: "marista", visits: 142, sales: 8,  target: 12 },
  { unitId: "bueno",   visits: 98,  sales: 6,  target: 10 },
  { unitId: "jardim",  visits: 76,  sales: 3,  target: 8  },
  { unitId: "oeste",   visits: 63,  sales: 5,  target: 7  },
];

const DEFAULT_DATA: AppData = {
  activeUnit: "marista",
  properties: DEFAULT_PROPERTIES,
  goals: DEFAULT_GOALS,
  timerLabel1: "Vendas",
  timerLabel2: "Meta Diária",
  timerLabel3: new Date().toLocaleDateString("pt-BR"),
  timerInitialSeconds: 600,
  autoRotate: true,
  autoRotateInterval: 8,
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
  @keyframes slideInRight  { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
  @keyframes slideInLeft   { from{opacity:0;transform:translateX(-40px)} to{opacity:1;transform:translateX(0)} }
  @keyframes scalePop      { from{opacity:0;transform:scale(0.88)} to{opacity:1;transform:scale(1)} }
  @keyframes glowPulse     { 0%,100%{box-shadow:0 0 24px rgba(227,6,19,.35),0 0 48px rgba(227,6,19,.15)} 50%{box-shadow:0 0 36px rgba(227,6,19,.55),0 0 72px rgba(227,6,19,.25)} }
  @keyframes urgentPulse   { 0%,100%{text-shadow:0 0 40px rgba(255,107,53,.20)} 50%{text-shadow:0 0 80px rgba(255,107,53,.70)} }
  @keyframes donePulse     { 0%,100%{text-shadow:0 0 40px rgba(227,6,19,.30)} 50%{text-shadow:0 0 100px rgba(227,6,19,.90)} }
  @keyframes blink         { 0%,100%{opacity:1} 50%{opacity:.5} }
  @keyframes progressFill  { from{transform:scaleX(0)} to{transform:scaleX(1)} }
  @keyframes spin          { to{transform:rotate(360deg)} }

  /* ── Screen transition ── */
  .screen-enter { animation: fadeIn 450ms cubic-bezier(0.25,0.46,0.45,0.94) both; }
  .screen-exit  { animation: fadeOut 300ms ease forwards; }
  @keyframes fadeOut { from{opacity:1} to{opacity:0} }

  /* ── Scrollbars ── */
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

  /* ── Inputs ── */
  input[type=number]::-webkit-outer-spin-button,
  input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
  input[type=number] { -moz-appearance: textfield; }

  /* ── Cards ── */
  .card-hover { transition: transform 250ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 250ms ease; cursor: pointer; }
  .card-hover:hover { transform: scale(1.05) translateY(-4px); box-shadow: 0 16px 48px rgba(0,0,0,.45); z-index: 10; }

  /* ── Btn base ── */
  .btn { border: none; cursor: pointer; font-family: 'Barlow', sans-serif; font-weight: 700; transition: all 200ms ease; }
  .btn-accent { background: var(--accent); color: #fff; border-radius: 9999px; }
  .btn-accent:hover { background: var(--accent-h); box-shadow: 0 4px 20px rgba(227,6,19,.45); }
  .btn-ghost { background: rgba(255,255,255,.08); color: var(--text2); border-radius: 14px; border: 1px solid rgba(255,255,255,.10); }
  .btn-ghost:hover { background: rgba(255,255,255,.13); color: var(--text); }

  /* ── Profile cards ── */
  .profile-card { cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:0; transition:transform 250ms cubic-bezier(0.34,1.56,0.64,1); animation:scalePop 400ms cubic-bezier(0.34,1.56,0.64,1) both; }
  .profile-card:hover { transform:scale(1.08); }
  .profile-avatar { border:3px solid transparent; border-radius:12px; overflow:hidden; transition:border-color 200ms ease, box-shadow 250ms ease; }
  .profile-card:hover .profile-avatar { border-color:#E30613; animation:glowPulse 2s ease infinite; }
  .profile-label { margin-top:14px; font-size:17px; font-weight:500; color:var(--text3); text-align:center; transition:color 200ms ease; }
  .profile-card:hover .profile-label { color:var(--text); }

  /* ── Pill ── */
  .pill { height:44px; padding:0 20px; border-radius:9999px; font-family:'Barlow',sans-serif; font-weight:600; font-size:14px; cursor:pointer; border:none; transition:all 200ms ease; white-space:nowrap; display:flex; align-items:center; gap:6px; }
  .pill.active  { background:#fff; color:#0A0A0F; }
  .ds-light .pill.active { background:#1a1a2e; color:#fff; }
  .pill.inactive { background:var(--bg3); color:var(--text2); }
  .pill.inactive:hover { background:var(--bg4); color:var(--text); }

  /* ── Info block (timer) ── */
  .info-block { background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.08); border-radius:20px; backdrop-filter:blur(12px); padding:18px 22px; flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:5px; transition:all 200ms ease; animation:fadeSlideUp 500ms cubic-bezier(0.25,0.46,0.45,0.94) both; }
  .ds-light .info-block { background:rgba(0,0,0,.06); border-color:rgba(0,0,0,.08); }

  /* ── Manager panel ── */
  .mgr-input { background:var(--bg3); border:1px solid var(--border); color:var(--text); padding:12px 14px; border-radius:12px; width:100%; font-family:'DM Sans',sans-serif; font-size:14px; outline:none; transition:border-color 200ms ease; }
  .mgr-input:focus { border-color:rgba(227,6,19,.60); }
  .mgr-input::placeholder { color:var(--text4); }
  .mgr-label { display:block; font-family:'Barlow',sans-serif; font-weight:700; font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--text3); margin-bottom:6px; }
`;

// ─── Sub-components ───────────────────────────────────────────────────────────

function Navbar({ theme, onThemeToggle, onBack, onManager, activeUnit, onNav }: {
  theme: Theme; onThemeToggle: () => void; onBack?: () => void;
  onManager: () => void; activeUnit: string; onNav: (s: Screen) => void;
}) {
  const unit = UNITS.find(u => u.id === activeUnit);
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
      <span
        onClick={() => onNav("streaming")}
        style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 26, color: "#E30613", letterSpacing: ".08em", cursor: "pointer" }}
      >LOPES</span>

      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
        {(["streaming", "player", "timer"] as Screen[]).map(s => {
          const labels: Record<string, string> = { streaming: "Imóveis", player: "Apresentação", timer: "Ofertão" };
          return (
            <button key={s} className="btn" style={{
              background: "none", padding: "4px 0",
              fontSize: 14, fontFamily: "'Barlow',sans-serif", fontWeight: 600,
              color: "var(--text3)", borderBottom: "2px solid transparent",
              borderRadius: 0,
            }}
              onClick={() => onNav(s)}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--text)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--text3)"; }}
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
        <button className="btn" style={{ background: "#E30613", color: "#fff", padding: "8px 16px", borderRadius: 10, fontSize: 12, letterSpacing: ".10em", display: "flex", alignItems: "center", gap: 6 }} onClick={onManager}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
          GESTOR
        </button>
        {/* Unit avatar */}
        {unit && (
          <div style={{ width: 34, height: 34, borderRadius: 10, background: unit.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 13, color: "rgba(255,255,255,.9)", border: "2px solid #E30613", cursor: "pointer" }} onClick={() => onNav("profile")}>
            {unit.initial}
          </div>
        )}
      </div>
    </nav>
  );
}

// ─── Screen 1: Profile Selection ──────────────────────────────────────────────

function ScreenProfile({ onSelect, theme }: { onSelect: (id: string) => void; theme: Theme }) {
  return (
    <div className="screen-enter" style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "radial-gradient(circle at 50% 0%, rgba(227,6,19,.08) 0%, transparent 60%)",
      }} />
      <div style={{ position: "absolute", top: 28, left: 36, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 26, color: "#E30613", letterSpacing: ".08em" }}>LOPES</span>
        <span style={{ fontSize: 11, color: "var(--text4)", letterSpacing: ".14em", textTransform: "uppercase", fontFamily: "'DM Sans',sans-serif" }}>Digital Signage</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 52 }}>
        <h1 style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 34, color: "var(--text)", letterSpacing: "-.02em", animation: "fadeSlideUp 500ms ease both" }}>
          Qual unidade está exibindo?
        </h1>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,160px)", gap: 28 }}>
          {UNITS.map((u, i) => (
            <div key={u.id} className="profile-card" style={{ animationDelay: `${i * 70}ms` }} onClick={() => onSelect(u.id)}>
              <div className="profile-avatar" style={{ width: 160, height: 160, background: u.gradient, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 52, color: "rgba(255,255,255,.9)", letterSpacing: "-.02em" }}>{u.initial}</span>
              </div>
              <span className="profile-label">{u.name}</span>
            </div>
          ))}
        </div>
        <button className="btn btn-accent" style={{ padding: "14px 32px", fontSize: 13, letterSpacing: ".10em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 10, animation: "fadeSlideUp 700ms ease both" }} onClick={() => document.documentElement.requestFullscreen?.()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
          Iniciar Transmissão
        </button>
      </div>
      <div style={{ position: "absolute", bottom: 28, color: "var(--text4)", fontSize: 12, fontFamily: "'DM Sans',sans-serif", letterSpacing: ".06em" }}>
        Selecione uma unidade para continuar
      </div>
    </div>
  );
}

// ─── Screen 2: Streaming Interface ───────────────────────────────────────────

const CATEGORIES = [
  { id: "all", label: "Todos", icon: "◉" },
  { id: "placares", label: "Placares", icon: "🏆" },
  { id: "ofertao", label: "Ofertão", icon: "🔥" },
  { id: "lancamentos", label: "Lançamentos", icon: "✦" },
  { id: "coberturas", label: "Coberturas", icon: "◆" },
];

function ScreenStreaming({ data, onOpen, theme }: { data: AppData; onOpen: (id: number) => void; theme: Theme }) {
  const [cat, setCat] = useState("all");
  const [heroIdx, setHeroIdx] = useState(0);
  const { properties, goals, autoRotate, autoRotateInterval } = data;

  useEffect(() => {
    if (!autoRotate) return;
    const t = setInterval(() => setHeroIdx(i => (i + 1) % Math.min(2, properties.length)), autoRotateInterval * 1000);
    return () => clearInterval(t);
  }, [autoRotate, autoRotateInterval, properties.length]);

  const featured = properties.slice(0, 2);

  return (
    <div className="screen-enter" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 68px)", overflow: "hidden" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 36px 32px" }}>

        {/* Hero banners */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 18, marginBottom: 28 }}>
          {featured.map((p, i) => (
            <div key={p.id} onClick={() => onOpen(p.id)} style={{
              borderRadius: 20, padding: "28px 32px 24px", minHeight: 200,
              background: p.gradient, cursor: "pointer", position: "relative", overflow: "hidden",
              transition: "transform 250ms ease, box-shadow 250ms ease",
              boxShadow: "0 8px 28px rgba(0,0,0,.30)",
              animation: `fadeSlideUp 400ms ease ${i * 80}ms both`,
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 60px rgba(0,0,0,.50)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(0,0,0,.30)"; }}
            >
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right,rgba(0,0,0,.65) 0%,rgba(0,0,0,.20) 60%,transparent 100%)" }} />
              <div style={{ position: "absolute", right: -50, bottom: -50, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,255,255,.08),transparent 70%)" }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 8, background: p.tagColor, color: "#fff", fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" }}>{p.tag}</span>
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
            {properties.map((p, i) => (
              <div key={p.id} className="card-hover" onClick={() => onOpen(p.id)} style={{
                width: 170, minWidth: 170, borderRadius: 16, overflow: "hidden", position: "relative",
                background: p.gradient, flexShrink: 0,
                aspectRatio: "2/3", animation: `fadeSlideUp 400ms ease ${i * 50}ms both`,
              }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,.85) 0%,rgba(0,0,0,.15) 50%,transparent 100%)" }} />
                <div style={{ position: "absolute", top: 8, left: 8 }}>
                  <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 7, background: p.tagColor, color: "#fff", fontSize: 10, fontFamily: "'Barlow',sans-serif", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" }}>{p.tag}</span>
                </div>
                <div style={{ position: "absolute", bottom: 10, left: 10, right: 10 }}>
                  <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 13, color: "#F0F2F8", lineHeight: 1.25, marginBottom: 3 }}>{p.title}</div>
                  <div style={{ color: "#E30613", fontWeight: 700, fontSize: 13 }}>{p.price}</div>
                  <div style={{ color: "rgba(240,242,248,.60)", fontSize: 11, marginTop: 2 }}>{p.area}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Goals / Scoreboard */}
        <div>
          <p style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 20, color: "var(--text)", letterSpacing: "-.01em", marginBottom: 14 }}>Placares — Hoje</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
            {goals.map((g, i) => {
              const u = UNITS.find(u => u.id === g.unitId)!;
              const pct = Math.min(100, Math.round((g.sales / g.target) * 100));
              return (
                <div key={g.unitId} style={{
                  background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 16, padding: "18px 18px 16px",
                  animation: `fadeSlideUp 400ms ease ${i * 60}ms both`,
                  transition: "all 200ms ease",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg4)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(227,6,19,.30)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg3)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
                >
                  <div style={{ height: 4, borderRadius: 3, background: u.gradient, marginBottom: 12 }} />
                  <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 10 }}>{u.name}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ color: "var(--text3)", fontSize: 12 }}>Vendas / Meta</span>
                    <span style={{ color: "#E30613", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 18 }}>{g.sales}<span style={{ color: "var(--text4)", fontSize: 13 }}>/{g.target}</span></span>
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: 5, borderRadius: 3, background: "var(--border)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: pct >= 100 ? "#22c55e" : "#E30613", borderRadius: 3, transition: "width 0.8s ease" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                    <span style={{ color: "var(--text3)", fontSize: 11 }}>{g.visits} visitas</span>
                    <span style={{ color: pct >= 100 ? "#22c55e" : "var(--text3)", fontSize: 11, fontWeight: 700 }}>{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 3: Player / Fullscreen ───────────────────────────────────────────

function ScreenPlayer({ data, onBack }: { data: AppData; onBack: () => void }) {
  const { properties, autoRotate, autoRotateInterval } = data;
  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const p = properties[idx] ?? properties[0];

  const go = useCallback((next: number) => {
    setFading(true);
    setTimeout(() => { setIdx(next); setFading(false); }, 450);
  }, []);

  useEffect(() => {
    if (!autoRotate) return;
    const t = setInterval(() => go((idx + 1) % properties.length), autoRotateInterval * 1000);
    return () => clearInterval(t);
  }, [autoRotate, autoRotateInterval, idx, properties.length, go]);

  return (
    <div style={{ width: "100%", height: "calc(100vh - 68px)", position: "relative", overflow: "hidden" }}>
      {/* BG */}
      <div style={{ position: "absolute", inset: 0, background: p.gradient, opacity: fading ? 0 : 1, transition: "opacity 450ms ease" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(0,0,0,.78) 0%,rgba(0,0,0,.28) 60%,transparent 100%)" }} />
      <div style={{ position: "absolute", right: "8%", top: "10%", width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,255,255,.06) 0%,transparent 70%)", pointerEvents: "none" }} />

      {/* Progress */}
      <div style={{ position: "absolute", top: 18, left: 60, right: 60, display: "flex", gap: 6 }}>
        {properties.map((_, i) => (
          <div key={i} style={{ height: 3, flex: 1, borderRadius: 2, background: i < idx ? "#E30613" : i === idx ? "rgba(255,255,255,.25)" : "rgba(255,255,255,.12)", overflow: "hidden", cursor: "pointer" }} onClick={() => go(i)}>
            {i === idx && autoRotate && (
              <div style={{ height: "100%", background: "#E30613", transformOrigin: "left", animation: `progressFill ${autoRotateInterval}s linear forwards` }} />
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div style={{ position: "absolute", inset: 0, padding: "60px 80px", display: "flex", flexDirection: "column", justifyContent: "center", opacity: fading ? 0 : 1, transition: "opacity 450ms ease" }}>
        <div style={{ maxWidth: 680 }}>
          <div style={{ marginBottom: 18 }}>
            <span style={{ display: "inline-block", padding: "5px 14px", borderRadius: 8, background: p.tagColor, color: "#fff", fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase" }}>{p.tag}</span>
            <span style={{ color: "rgba(240,242,248,.60)", fontSize: 14, marginLeft: 12, fontFamily: "'DM Sans',sans-serif" }}>{p.address}</span>
          </div>
          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: "clamp(40px,6vw,76px)", color: "#F0F2F8", letterSpacing: "-.03em", lineHeight: .95, marginBottom: 14 }}>{p.title}</h1>
          <div style={{ color: "#E30613", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: "clamp(28px,4vw,48px)", letterSpacing: "-.02em", marginBottom: 28 }}>{p.price}</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const }}>
            {[`⬛ ${p.area}`, `🛏 ${p.rooms}`, `🚗 ${p.garage}`].map((item, i) => (
              <div key={i} style={{ padding: "10px 16px", borderRadius: 12, background: "rgba(255,255,255,.08)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,.10)", color: "#B8BDCC", fontSize: 13 }}>{item}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Nav dots + live */}
      <div style={{ position: "absolute", bottom: 28, left: 80, right: 80, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 8 }}>
          {properties.map((_, i) => (
            <button key={i} style={{ border: "none", cursor: "pointer", borderRadius: i === idx ? 5 : "50%", width: i === idx ? 28 : 10, height: 10, background: i === idx ? "#E30613" : "rgba(255,255,255,.28)", transition: "all 300ms ease" }} onClick={() => go(i)} />
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: autoRotate ? "#22c55e" : "#F5A623", boxShadow: autoRotate ? "0 0 8px rgba(34,197,94,.80)" : "none", animation: autoRotate ? "blink 2s ease infinite" : "none" }} />
          <span style={{ color: "rgba(255,255,255,.55)", fontSize: 12, fontFamily: "'DM Sans',sans-serif", letterSpacing: ".08em" }}>{autoRotate ? "Rotação automática" : "Manual"}</span>
          <span style={{ color: "rgba(255,255,255,.35)", fontSize: 12, marginLeft: 8 }}>{idx + 1} / {properties.length}</span>
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

function ScreenTimer({ data }: { data: AppData }) {
  const { timerLabel1, timerLabel2, timerLabel3, timerInitialSeconds } = data;
  const [secs, setSecs] = useState(timerInitialSeconds);
  const [init, setInit] = useState(timerInitialSeconds);
  const [running, setRunning] = useState(false);
  const intRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync if data changes
  useEffect(() => { setSecs(timerInitialSeconds); setInit(timerInitialSeconds); }, [timerInitialSeconds]);

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
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 24 }}>
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
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", gap: 14, padding: "0 36px 24px" }}>
        {[timerLabel1, timerLabel2, timerLabel3].map((lbl, i) => (
          <div key={i} className="info-block">
            <div style={{ width: 28, height: 3, borderRadius: 2, background: i === 0 ? "#E30613" : "rgba(255,255,255,.15)", marginBottom: 2 }} />
            <span style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 800, fontSize: "clamp(12px,1.3vw,18px)", color: "var(--text)", letterSpacing: ".06em", textTransform: "uppercase", textAlign: "center" }}>{lbl}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Manager Panel ────────────────────────────────────────────────────────────

function ManagerPanel({ data, onSave, onClose }: { data: AppData; onSave: (d: AppData) => void; onClose: () => void }) {
  const [draft, setDraft] = useState<AppData>(JSON.parse(JSON.stringify(data)));
  const [tab, setTab] = useState<"imoveis" | "metas" | "timer" | "config">("imoveis");

  const up = (fn: (d: AppData) => void) => { const next = { ...draft }; fn(next); setDraft(next); };
  const upProp = (i: number, k: keyof Property, v: string) => up(d => { d.properties[i] = { ...d.properties[i], [k]: v }; });
  const upGoal = (i: number, k: keyof Goal, v: number) => up(d => { d.goals[i] = { ...d.goals[i], [k]: v }; });

  const tabs: Array<{ id: typeof tab; label: string }> = [
    { id: "imoveis", label: "Imóveis" },
    { id: "metas",   label: "Metas" },
    { id: "timer",   label: "Temporizador" },
    { id: "config",  label: "Configurações" },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,.75)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, animation: "fadeIn 250ms ease both" }}>
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 28, width: "100%", maxWidth: 680, maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 32px 80px rgba(0,0,0,.55)" }}>
        {/* Header */}
        <div style={{ padding: "24px 28px 0", borderBottom: "1px solid var(--border2)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(227,6,19,.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E30613" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
              </div>
              <div>
                <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 800, fontSize: 16, color: "var(--text)" }}>Painel do Gestor</div>
                <div style={{ fontSize: 12, color: "var(--text3)" }}>Edite os dados exibidos na TV</div>
              </div>
            </div>
            <button className="btn btn-ghost" style={{ width: 34, height: 34, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10 }} onClick={onClose}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 4 }}>
            {tabs.map(t => (
              <button key={t.id} className="btn" style={{ padding: "8px 16px", borderRadius: "10px 10px 0 0", fontSize: 13, fontFamily: "'Barlow',sans-serif", fontWeight: 700, color: tab === t.id ? "var(--text)" : "var(--text3)", background: tab === t.id ? "var(--bg3)" : "transparent", borderBottom: tab === t.id ? `2px solid #E30613` : "2px solid transparent", letterSpacing: ".04em" }} onClick={() => setTab(t.id)}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          {tab === "imoveis" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {draft.properties.map((p, i) => (
                <div key={p.id} style={{ background: "var(--bg3)", borderRadius: 16, padding: "18px 18px 14px", border: "1px solid var(--border)" }}>
                  <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 12, color: "#E30613", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 12 }}>Imóvel {i + 1}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {([["title","Título"],["price","Preço"],["area","Área"],["rooms","Quartos/Suítes"],["garage","Garagem"],["address","Endereço"],["tag","Tag (NOVO, OFERTA...)"],["tagColor","Cor da tag (hex)"]] as [keyof Property, string][]).map(([k, lbl]) => (
                      <div key={k}>
                        <label className="mgr-label">{lbl}</label>
                        <input className="mgr-input" type="text" value={String(p[k])} onChange={e => upProp(i, k, e.target.value)} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button className="btn btn-ghost" style={{ padding: "12px", borderRadius: 14, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, borderStyle: "dashed" }}
                onClick={() => up(d => { d.properties.push({ id: Date.now(), title: "Novo Imóvel", price: "R$ 0", area: "0 m²", rooms: "—", garage: "—", address: "—", tag: "NOVO", tagColor: "#E30613", gradient: "linear-gradient(160deg,#1a2744,#2d3f6b)" }); })}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                Adicionar Imóvel
              </button>
            </div>
          )}

          {tab === "metas" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {UNITS.map((u, i) => {
                const g = draft.goals.find(g => g.unitId === u.id) ?? { unitId: u.id, visits: 0, sales: 0, target: 10 };
                const idx2 = draft.goals.findIndex(g => g.unitId === u.id);
                return (
                  <div key={u.id} style={{ background: "var(--bg3)", borderRadius: 16, padding: "18px", border: "1px solid var(--border)" }}>
                    <div style={{ height: 4, borderRadius: 3, background: u.gradient, marginBottom: 12 }} />
                    <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 12 }}>{u.name}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                      {[["visits","Visitas"],["sales","Vendas"],["target","Meta"]] .map(([k, lbl]) => (
                        <div key={k}>
                          <label className="mgr-label">{lbl}</label>
                          <input className="mgr-input" type="number" value={g[k as keyof Goal]} onChange={e => upGoal(idx2 >= 0 ? idx2 : i, k as keyof Goal, parseInt(e.target.value) || 0)} />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === "timer" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "var(--bg3)", borderRadius: 16, padding: 18, border: "1px solid var(--border)" }}>
                <label className="mgr-label">Duração (segundos)</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  {[["Horas", Math.floor(draft.timerInitialSeconds/3600)], ["Minutos", Math.floor((draft.timerInitialSeconds%3600)/60)], ["Segundos", draft.timerInitialSeconds%60]].map(([lbl, val], i) => (
                    <div key={i}>
                      <label className="mgr-label" style={{ marginBottom: 4 }}>{lbl}</label>
                      <input className="mgr-input" type="number" style={{ textAlign: "center", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 22 }} value={val} min={0} max={i === 0 ? 99 : 59}
                        onChange={e => {
                          const v = parseInt(e.target.value) || 0;
                          const cur = draft.timerInitialSeconds;
                          const h = Math.floor(cur/3600), m2 = Math.floor((cur%3600)/60), s2 = cur%60;
                          const arr = [h, m2, s2]; arr[i] = v;
                          up(d => { d.timerInitialSeconds = arr[0]*3600 + arr[1]*60 + arr[2]; });
                        }} />
                    </div>
                  ))}
                </div>
              </div>
              {[["timerLabel1","Bloco Esquerdo"],["timerLabel2","Bloco Central"],["timerLabel3","Bloco Direito"]].map(([k, lbl]) => (
                <div key={k}>
                  <label className="mgr-label">{lbl}</label>
                  <input className="mgr-input" type="text" value={draft[k as keyof AppData] as string} onChange={e => up(d => { (d as any)[k] = e.target.value; })} />
                </div>
              ))}
            </div>
          )}

          {tab === "config" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "var(--bg3)", borderRadius: 16, padding: 18, border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text)" }}>Rotação Automática</div>
                    <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>Alternar slides automaticamente na interface</div>
                  </div>
                  <div
                    style={{ width: 44, height: 24, borderRadius: 9999, background: draft.autoRotate ? "#E30613" : "var(--border)", cursor: "pointer", position: "relative", transition: "background 250ms ease" }}
                    onClick={() => up(d => { d.autoRotate = !d.autoRotate; })}
                  >
                    <div style={{ position: "absolute", top: 3, left: draft.autoRotate ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 250ms ease", boxShadow: "0 2px 4px rgba(0,0,0,.20)" }} />
                  </div>
                </div>
              </div>
              <div>
                <label className="mgr-label">Intervalo de rotação (segundos)</label>
                <input className="mgr-input" type="number" min={3} max={60} value={draft.autoRotateInterval} onChange={e => up(d => { d.autoRotateInterval = parseInt(e.target.value) || 8; })} />
              </div>
              <div>
                <label className="mgr-label">Unidade ativa</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {UNITS.map(u => (
                    <div key={u.id} onClick={() => up(d => { d.activeUnit = u.id; })} style={{
                      padding: "12px 14px", borderRadius: 12, cursor: "pointer",
                      background: draft.activeUnit === u.id ? "rgba(227,6,19,.12)" : "var(--bg3)",
                      border: `1px solid ${draft.activeUnit === u.id ? "#E30613" : "var(--border)"}`,
                      display: "flex", alignItems: "center", gap: 10, transition: "all 200ms ease",
                    }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: u.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 11, color: "rgba(255,255,255,.9)" }}>{u.initial}</div>
                      <span style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 600, fontSize: 13, color: "var(--text)" }}>{u.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 28px 24px", borderTop: "1px solid var(--border2)", display: "flex", gap: 12, flexShrink: 0 }}>
          <button className="btn btn-accent" style={{ flex: 1, padding: "14px", fontSize: 13, letterSpacing: ".10em", textTransform: "uppercase" }} onClick={() => { onSave(draft); onClose(); }}>Salvar e Aplicar</button>
          <button className="btn btn-ghost" style={{ flex: 1, padding: "14px", fontSize: 13 }} onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export function LopesSignage() {
  const [screen, setScreen] = useState<Screen>("profile");
  const [theme, setTheme] = useState<Theme>("dark");
  const [data, setData] = useState<AppData>(DEFAULT_DATA);
  const [showManager, setShowManager] = useState(false);
  const [openPropId, setOpenPropId] = useState<number | null>(null);

  const nav = (s: Screen) => setScreen(s);
  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  const handleSelectProfile = (id: string) => {
    setData(d => ({ ...d, activeUnit: id }));
    setScreen("streaming");
  };

  const handleOpenProp = (id: number) => {
    setOpenPropId(id);
    setScreen("player");
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div className={`ds-root ds-${theme}`}>
        {screen === "profile" ? (
          <ScreenProfile onSelect={handleSelectProfile} theme={theme} />
        ) : (
          <>
            <Navbar
              theme={theme}
              onThemeToggle={toggleTheme}
              onBack={screen !== "streaming" ? () => setScreen("streaming") : undefined}
              onManager={() => setShowManager(true)}
              activeUnit={data.activeUnit}
              onNav={nav}
            />
            {screen === "streaming" && <ScreenStreaming data={data} onOpen={handleOpenProp} theme={theme} />}
            {screen === "player"    && <ScreenPlayer data={data} onBack={() => setScreen("streaming")} />}
            {screen === "timer"     && <ScreenTimer data={data} />}
          </>
        )}

        {showManager && (
          <ManagerPanel
            data={data}
            onSave={d => setData(d)}
            onClose={() => setShowManager(false)}
          />
        )}
      </div>
    </>
  );
}
