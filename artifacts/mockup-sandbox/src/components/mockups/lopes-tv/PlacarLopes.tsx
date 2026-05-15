import { useState, useEffect, useCallback } from "react";
import faviconLopes from "@/assets/favicon-lopes.png";
import logoBranca from "@/assets/logo-branca.png";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UnitInfo {
  name: string;
  handle: string;
  gradient: string;
  ringStart: string;
  ringEnd: string;
  navUnits: string[];
}

interface RankingPerson {
  name: string;
  value: number;
  photoUrl?: string;
  initials: string;
}

interface SlideBase { id: string; type: string; category: "Metas Lopes" | "História Lopes"; title: string; }
interface SlideMeta      extends SlideBase { type: "meta"; valor: string; realizadoNum: number; metaNum: number; periodo: string; showBox?: boolean; }
interface SlidePVenda    extends SlideBase { type: "pvenda"; nome: string; cargo: string; photoUrl?: string; mensagem: string; detalhe: string; updateFreq: string; }
interface SlideRanking   extends SlideBase { type: "ranking"; pessoas: RankingPerson[]; updateFreq: string; }

type Slide = SlideMeta | SlidePVenda | SlideRanking;

// ─── Default Data ─────────────────────────────────────────────────────────────

const UNIT: UnitInfo = {
  name: "Lopes Jd. Goiás",
  handle: "@lopesjdgoias",
  gradient: "radial-gradient(circle at 40% 40%, #1a0a2e, #0a0a14)",
  ringStart: "#FF0080",
  ringEnd: "#E30613",
  navUnits: ["Und. Jd. Goiás", "Und. Marista", "Und. Bueno", "Gestão Patri."],
};

const DEFAULT_SLIDES: Slide[] = [
  {
    id: "meta-mensal",
    type: "meta",
    category: "Metas Lopes",
    title: "Meta de Maio",
    valor: "R$ 20.000.000,00",
    realizadoNum: 4720000,
    metaNum: 20000000,
    periodo: "ANO DE 2026 - JD. GOIÁS",
    showBox: false,
  },
  {
    id: "meta-anual",
    type: "meta",
    category: "Metas Lopes",
    title: "Meta Anual",
    valor: "R$ 240.000.000,00",
    realizadoNum: 47300000,
    metaNum: 240000000,
    periodo: "JD. GOIÁS · 2026",
    showBox: true,
  },
  {
    id: "pvenda",
    type: "pvenda",
    category: "História Lopes",
    title: "Primeira venda",
    nome: "Maria Osanete",
    cargo: "Corretora",
    photoUrl: "",
    mensagem: "Parabéns pela venda!",
    detalhe: "Você faz parte do crescimento da nossa empresa, nosso muito obrigado!",
    updateFreq: "RANKING ATUALIZADO MENSALMENTE.",
  },
  {
    id: "top-gestores-mensal",
    type: "ranking",
    category: "História Lopes",
    title: "Top 3 Gestores Mensal",
    updateFreq: "RANKING ATUALIZADO MENSALMENTE.",
    pessoas: [
      { name: "Ayrton",  value: 525000, initials: "AY", photoUrl: "" },
    ],
  },
  {
    id: "top-corretores-mensal",
    type: "ranking",
    category: "História Lopes",
    title: "Top 3 Corretores Mensal",
    updateFreq: "RANKING ATUALIZADO SEMANALMENTE.",
    pessoas: [
      { name: "Karulyne",  value: 525000, initials: "KA", photoUrl: "" },
    ],
  },
  {
    id: "top-gestores-anual",
    type: "ranking",
    category: "História Lopes",
    title: "Top 3 Gestores Anual",
    updateFreq: "RANKING ATUALIZADO MENSALMENTE.",
    pessoas: [
      { name: "Ayrton",          value: 5804137, initials: "AY", photoUrl: "" },
      { name: "Douglas",         value: 5612373, initials: "DO", photoUrl: "" },
      { name: "Thiago Rodrigues",value: 4844423, initials: "TR", photoUrl: "" },
    ],
  },
  {
    id: "top-corretores-anual",
    type: "ranking",
    category: "História Lopes",
    title: "Top 5 Corretores Anual",
    updateFreq: "RANKING ATUALIZADO SEMANALMENTE.",
    pessoas: [
      { name: "Ingrid",    value: 4235597, initials: "IN", photoUrl: "" },
      { name: "Dariane",   value: 3974605, initials: "DA", photoUrl: "" },
      { name: "Matheus V.",value: 3261435, initials: "MV", photoUrl: "" },
      { name: "Ludmila A.",value: 2774257, initials: "LA", photoUrl: "" },
      { name: "Taisa B.",  value: 2391797, initials: "TB", photoUrl: "" },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtBRL = (n: number) =>
  "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

const now = new Date();
const MES_ANO = now.toLocaleString("pt-BR", { month: "long", year: "numeric" })
  .replace(/^\w/, c => c.toUpperCase());

// ─── CSS ──────────────────────────────────────────────────────────────────────

const STARS_CSS = Array.from({ length: 120 }, (_, i) => {
  const x = (Math.sin(i * 137.5) * 0.5 + 0.5) * 100;
  const y = (Math.cos(i * 97.3) * 0.5 + 0.5) * 100;
  const s = 1 + (i % 3) * 0.6;
  const op = 0.3 + (i % 4) * 0.17;
  return `.star-${i}{position:absolute;left:${x.toFixed(1)}%;top:${y.toFixed(1)}%;width:${s}px;height:${s}px;border-radius:50%;background:rgba(255,255,255,${op.toFixed(2)});}`;
}).join("");

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800;900&family=Barlow+Condensed:ital,wght@0,700;0,800;0,900;1,900&family=DM+Sans:wght@400;500;600&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes slideUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
  @keyframes rocketEntry{from{opacity:0;transform:translateX(-40px)}to{opacity:1;transform:translateX(0)}}
  @keyframes barFill{from{width:0}to{width:var(--w)}}
  @keyframes flamePulse{0%,100%{opacity:.85;transform:scaleY(1)}50%{opacity:1;transform:scaleY(1.18)}}
  @keyframes twinkle{0%,100%{opacity:.4}50%{opacity:1}}
  @keyframes glowRing{0%,100%{filter:drop-shadow(0 0 6px rgba(255,0,128,.5))}50%{filter:drop-shadow(0 0 14px rgba(255,0,128,.9))}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes pct{from{width:0}to{width:var(--pw)}}

  .placar-root{width:100vw;height:100vh;display:flex;background:#000;overflow:hidden;font-family:'DM Sans',sans-serif;color:#fff;}
  .fade-in{animation:fadeIn 500ms ease both;}
  .slide-up{animation:slideUp 550ms cubic-bezier(.22,.68,0,1.2) both;}
  ${STARS_CSS}
  .starfield{position:absolute;inset:0;overflow:hidden;pointer-events:none;}
  .tw{animation:twinkle 3s ease infinite;}
`;

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ unit, activeIdx }: { unit: UnitInfo; activeIdx: number }) {
  return (
    <aside style={{ width: 176, flexShrink: 0, display: "flex", flexDirection: "column", padding: "20px 14px 16px", gap: 16, background: "rgba(255,255,255,.04)", borderRight: "1px solid rgba(255,255,255,.06)" }}>
      {/* Logo */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <div style={{ position: "relative", animation: "glowRing 3s ease infinite" }}>
          <svg width="100" height="100" viewBox="0 0 100 100" style={{ position: "absolute", inset: 0 }}>
            <defs>
              <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={unit.ringStart} />
                <stop offset="100%" stopColor={unit.ringEnd} />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="47" fill="none" stroke="url(#ringGrad)" strokeWidth="4.5" />
          </svg>
          <div style={{ width: 100, height: 100, borderRadius: "50%", background: "#1a1a1a", border: "3px solid transparent", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: 14 }}>
            <img src={faviconLopes} alt="Lopes" style={{ width: "100%", height: "100%", objectFit: "contain", filter: "brightness(0) invert(1)" }} />
          </div>
        </div>
        <img src={logoBranca} alt="Lopes" style={{ width: 110, objectFit: "contain", filter: "brightness(0) invert(1)", opacity: .9 }} />
        <div style={{ textAlign: "center", fontFamily: "'Barlow',sans-serif", fontWeight: 600, fontSize: 12, color: "rgba(255,255,255,.55)", marginTop: -4, lineHeight: 1.3 }}>{unit.name}</div>
      </div>

      {/* Nav */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {unit.navUnits.map((u, i) => (
          <div key={u} style={{ padding: "7px 12px", borderRadius: 9999, background: i === 0 ? "rgba(255,255,255,.18)" : "transparent", cursor: "pointer", fontSize: 12, fontFamily: "'Barlow',sans-serif", fontWeight: i === 0 ? 700 : 500, color: i === 0 ? "#fff" : "rgba(255,255,255,.50)", transition: "all 200ms ease" }}>
            {u}
          </div>
        ))}
      </div>

      {/* Dots */}
      <div style={{ display: "flex", gap: 8, paddingLeft: 12 }}>
        {[0,1,2].map(i => <div key={i} style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,.14)" }} />)}
      </div>

      {/* Handle */}
      <div style={{ marginTop: "auto", padding: "10px 12px", background: "rgba(255,255,255,.07)", borderRadius: 10, fontSize: 12, color: "rgba(255,255,255,.55)", fontFamily: "'Barlow',sans-serif" }}>
        {unit.handle}
      </div>
    </aside>
  );
}

// ─── Category Pill ────────────────────────────────────────────────────────────

function CategoryPill({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
      <div style={{ padding: "5px 14px", borderRadius: 9999, background: "rgba(255,255,255,.12)", backdropFilter: "blur(8px)", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, color: "#fff", border: "1px solid rgba(255,255,255,.15)" }}>{label}</div>
      {/* Blue badge */}
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#1D9BF0"><path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91-1.01-1-2.52-1.27-3.91-.81C14.67 2.88 13.43 2 12 2s-2.67.88-3.34 2.19c-1.39-.46-2.9-.2-3.91.81-1 1.01-1.27 2.52-.81 3.91C2.88 9.33 2 10.57 2 12s.88 2.67 2.19 3.34c-.46 1.39-.2 2.9.81 3.91 1.01 1 2.52 1.27 3.91.81C9.33 21.12 10.57 22 12 22s2.67-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81 1-1.01 1.27-2.52.81-3.91C21.12 14.67 22 13.43 22 12zm-6.16-1.4l-3.75 5.02a1 1 0 0 1-1.39.19L8.5 14.06a1 1 0 0 1 1.22-1.59l1.73 1.33 3.12-4.18a1 1 0 1 1 1.61 1.17l-.34-.19z"/></svg>
    </div>
  );
}

// ─── Slide: Meta ──────────────────────────────────────────────────────────────

function SlideMeta({ slide }: { slide: SlideMeta }) {
  const pct = Math.min(100, (slide.realizadoNum / slide.metaNum) * 100);
  const pctStr = pct.toLocaleString("pt-BR", { maximumFractionDigits: 2 });

  return (
    <div className="slide-up" style={{ flex: 1, display: "flex", flexDirection: "column", padding: "28px 52px 32px" }}>
      <CategoryPill label={slide.category} />
      <h1 style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 800, fontSize: 42, color: "rgba(255,255,255,.88)", letterSpacing: "-.01em", marginBottom: 52 }}>{slide.title}</h1>

      {/* Value */}
      {slide.showBox ? (
        <div style={{ background: "rgba(255,255,255,.10)", borderRadius: 12, padding: "22px 36px", marginBottom: 20, display: "inline-block" }}>
          <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 64, color: "#fff", letterSpacing: "-.04em" }}>{slide.valor}</span>
        </div>
      ) : (
        <div style={{ marginBottom: 32 }}>
          <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 84, color: "#fff", letterSpacing: "-.05em", lineHeight: 1 }}>{slide.valor}</span>
        </div>
      )}

      {/* Progress bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ height: 12, borderRadius: 9999, background: "rgba(255,255,255,.12)", overflow: "hidden", maxWidth: 520 }}>
          <div style={{
            height: "100%",
            background: "linear-gradient(90deg,#FF0080,#FF6B35,#FF8C00)",
            borderRadius: 9999,
            width: `${pct}%`,
            animation: "pct 1.4s cubic-bezier(.22,.68,0,1.2) both",
            "--pw": `${pct}%`,
          } as React.CSSProperties} />
        </div>
      </div>

      {slide.showBox && (
        <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 22, color: "rgba(255,255,255,.88)", marginBottom: 12 }}>
          {pctStr}% da meta batida
        </div>
      )}

      <div style={{ fontSize: 13, color: "rgba(255,255,255,.35)", letterSpacing: ".14em", textTransform: "uppercase", fontFamily: "'Barlow',sans-serif", fontWeight: 600 }}>{slide.periodo}</div>
    </div>
  );
}

// ─── Slide: Primeira Venda ────────────────────────────────────────────────────

function SlidePVenda({ slide }: { slide: SlidePVenda }) {
  return (
    <div className="slide-up" style={{ flex: 1, display: "flex", flexDirection: "column", padding: "28px 52px 0" }}>
      <CategoryPill label={slide.category} />
      <h1 style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 800, fontSize: 52, color: "#fff", letterSpacing: "-.02em", marginBottom: 40 }}>{slide.title}</h1>

      {/* Card */}
      <div style={{ display: "flex", gap: 0, maxWidth: 320 }}>
        <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,.70)" }}>
          {/* Photo */}
          <div style={{ width: 220, height: 180, background: slide.photoUrl ? `url(${slide.photoUrl}) center/cover` : "linear-gradient(135deg,#2a2a3e,#3d3d5c)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            {!slide.photoUrl && (
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 28, color: "#fff" }}>
                {slide.nome.split(" ").map(w => w[0]).slice(0,2).join("")}
              </div>
            )}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px 12px", background: "rgba(0,0,0,.65)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 12, color: "#fff", letterSpacing: ".08em", textTransform: "uppercase" }}>{slide.nome}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "rgba(255,255,255,.75)", fontFamily: "'DM Sans',sans-serif" }}>🤍 Lopes</div>
            </div>
          </div>
          {/* Congrats card */}
          <div style={{ background: "#fff", padding: "12px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <span style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 14, color: "#111" }}>{slide.mensagem}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#22c55e"/><path d="M8 12l3 3 5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div style={{ width: 32, height: 12, borderRadius: 9999, background: "rgba(0,0,0,.15)", marginBottom: 8 }} />
            <div style={{ fontSize: 11, color: "#555", lineHeight: 1.5, textTransform: "uppercase", letterSpacing: ".06em", fontFamily: "'DM Sans',sans-serif" }}>{slide.detalhe}</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 20, paddingTop: 24 }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,.30)", letterSpacing: ".16em", textTransform: "uppercase", fontFamily: "'Barlow',sans-serif", fontWeight: 600 }}>{slide.updateFreq}</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,.30)", letterSpacing: ".16em", textTransform: "uppercase", fontFamily: "'Barlow',sans-serif", fontWeight: 600 }}>{MES_ANO.toUpperCase()}</span>
      </div>
    </div>
  );
}

// ─── Rocket ───────────────────────────────────────────────────────────────────

function Rocket({ photoUrl, initials, delay = 0 }: { photoUrl?: string; initials: string; delay?: number }) {
  return (
    <div style={{ position: "relative", width: 64, height: 52, flexShrink: 0, animation: `rocketEntry 700ms ${delay}ms cubic-bezier(.34,1.56,.64,1) both` }}>
      {/* Flames */}
      <div style={{ position: "absolute", left: -14, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 2, animation: "flamePulse 400ms ease infinite" }}>
        {[18,12,8].map((h, i) => (
          <div key={i} style={{ width: h, height: 7, borderRadius: "0 9999px 9999px 0", background: `linear-gradient(90deg,transparent,${["#FF6B00","#FF9500","#FFD000"][i]})`, opacity: .9 }} />
        ))}
      </div>
      {/* Body */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#D8D8D8 0%,#B0B0B0 40%,#888 100%)", borderRadius: "50% 36% 36% 50%", border: "1.5px solid rgba(255,255,255,.25)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Red stripe */}
        <div style={{ position: "absolute", top: 0, bottom: 0, right: 8, width: 8, background: "#E30613", opacity: .8 }} />
        {/* Cockpit window */}
        <div style={{ width: 30, height: 30, borderRadius: "50%", border: "2px solid rgba(255,255,255,.6)", background: photoUrl ? `url(${photoUrl}) center/cover` : "linear-gradient(135deg,#3a3a5c,#1a1a2e)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, zIndex: 1 }}>
          {!photoUrl && <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 10, color: "#fff" }}>{initials}</span>}
          {photoUrl && <img src={photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
        </div>
      </div>
      {/* Nose cone */}
      <div style={{ position: "absolute", right: -16, top: "50%", transform: "translateY(-50%)", width: 0, height: 0, borderTop: "14px solid transparent", borderBottom: "14px solid transparent", borderLeft: "18px solid #B0B0B0" }} />
      {/* Top fin */}
      <div style={{ position: "absolute", top: -8, left: 14, width: 0, height: 0, borderBottom: "10px solid #E30613", borderRight: "10px solid transparent" }} />
      {/* Bottom fin */}
      <div style={{ position: "absolute", bottom: -8, left: 14, width: 0, height: 0, borderTop: "10px solid #E30613", borderRight: "10px solid transparent" }} />
    </div>
  );
}

// ─── Rocket Bar ───────────────────────────────────────────────────────────────

function RocketBar({ person, maxValue, rank, delay }: { person: RankingPerson; maxValue: number; rank: number; delay: number }) {
  const pct = Math.max(8, (person.value / maxValue) * 82); // 8..82% of bar

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 28, animation: `slideUp 600ms ${delay}ms cubic-bezier(.22,.68,0,1.2) both` }}>
      {/* Name */}
      <div style={{ width: 140, flexShrink: 0, textAlign: "right", fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 16, color: "rgba(255,255,255,.90)" }}>{person.name}</div>

      {/* Track + bar + rocket */}
      <div style={{ flex: 1, position: "relative", height: 52 }}>
        {/* Track line */}
        <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 2, background: "rgba(255,255,255,.14)", transform: "translateY(-50%)", borderRadius: 2 }} />
        {/* Filled bar */}
        <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", height: 20, borderRadius: "0 9999px 9999px 0", background: `linear-gradient(90deg,${["#8B7355","#9E8364","#B0956E"][rank % 3] || "#8B7355"},${["#C4A67A","#D4B888","#E0C896"][rank % 3] || "#C4A67A"})`, animation: `barFill 1.4s ${delay + 200}ms cubic-bezier(.22,.68,0,1.2) both`, "--w": `${pct}%`, width: `${pct}%` } as React.CSSProperties} />
        {/* Rocket at end of bar */}
        <div style={{ position: "absolute", left: `${pct}%`, top: "50%", transform: "translate(-20px, -50%)" }}>
          <Rocket photoUrl={person.photoUrl} initials={person.initials} delay={delay + 400} />
        </div>
        {/* End dot */}
        <div style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,.30)", border: "1.5px solid rgba(255,255,255,.20)" }} />
      </div>

      {/* Value */}
      <div style={{ width: 150, flexShrink: 0, fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 14, color: "rgba(255,255,255,.85)", whiteSpace: "nowrap" as const }}>{fmtBRL(person.value)}</div>
    </div>
  );
}

// ─── Starfield ────────────────────────────────────────────────────────────────

function Starfield() {
  return (
    <div className="starfield">
      {Array.from({ length: 120 }, (_, i) => {
        const x = (Math.sin(i * 137.5) * 0.5 + 0.5) * 100;
        const y = (Math.cos(i * 97.3) * 0.5 + 0.5) * 100;
        const s = 1 + (i % 3) * 0.6;
        const op = 0.2 + (i % 4) * 0.15;
        const tw = i % 5 === 0;
        return (
          <div key={i} style={{ position: "absolute", left: `${x.toFixed(1)}%`, top: `${y.toFixed(1)}%`, width: s, height: s, borderRadius: "50%", background: `rgba(255,255,255,${op.toFixed(2)})`, animation: tw ? `twinkle ${2 + (i % 3)}s ease ${i * 0.3}s infinite` : "none" }} />
        );
      })}
    </div>
  );
}

// ─── Slide: Ranking ───────────────────────────────────────────────────────────

function SlideRanking({ slide }: { slide: SlideRanking }) {
  const maxVal = slide.pessoas[0]?.value ?? 1;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "28px 52px 0", position: "relative", overflow: "hidden" }}>
      <Starfield />
      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column" }}>
        <CategoryPill label={slide.category} />
        <h1 className="slide-up" style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 900, fontSize: 52, color: "#fff", letterSpacing: "-.03em", marginBottom: 40, textShadow: "0 2px 24px rgba(0,0,0,.60)" }}>{slide.title}</h1>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {slide.pessoas.map((p, i) => (
            <RocketBar key={p.name} person={p} maxValue={maxVal} rank={i} delay={i * 150} />
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 20, paddingTop: 8 }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,.30)", letterSpacing: ".16em", textTransform: "uppercase", fontFamily: "'Barlow',sans-serif", fontWeight: 600 }}>{slide.updateFreq}</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,.30)", letterSpacing: ".16em", textTransform: "uppercase", fontFamily: "'Barlow',sans-serif", fontWeight: 600 }}>{MES_ANO.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Progress Dots ────────────────────────────────────────────────────────────

function ProgressDots({ total, current, onChange }: { total: number; current: number; onChange: (i: number) => void }) {
  return (
    <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8, zIndex: 20 }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} onClick={() => onChange(i)} style={{ width: i === current ? 24 : 8, height: 8, borderRadius: 9999, background: i === current ? "#E30613" : "rgba(255,255,255,.25)", cursor: "pointer", transition: "all 300ms ease" }} />
      ))}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export function PlacarLopes() {
  const [slideIdx, setSlideIdx] = useState(0);
  const [key, setKey] = useState(0);
  const INTERVAL = 8000;

  const goTo = useCallback((i: number) => {
    setSlideIdx(i);
    setKey(k => k + 1);
  }, []);

  useEffect(() => {
    const t = setInterval(() => goTo((slideIdx + 1) % DEFAULT_SLIDES.length), INTERVAL);
    return () => clearInterval(t);
  }, [slideIdx, goTo]);

  const slide = DEFAULT_SLIDES[slideIdx];

  return (
    <>
      <style>{CSS}</style>
      <div className="placar-root" style={{ background: slide.type === "ranking" ? "radial-gradient(ellipse at 30% 50%,#080818 0%,#000 70%)" : "#0a0a0a" }}>
        <Sidebar unit={UNIT} activeIdx={0} />

        {/* Main */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
          <div key={key} style={{ flex: 1, display: "flex" }}>
            {slide.type === "meta"    && <SlideMeta   slide={slide as SlideMeta}   />}
            {slide.type === "pvenda"  && <SlidePVenda  slide={slide as SlidePVenda}  />}
            {slide.type === "ranking" && <SlideRanking slide={slide as SlideRanking} />}
          </div>

          <ProgressDots total={DEFAULT_SLIDES.length} current={slideIdx} onChange={goTo} />

          {/* Nav arrows */}
          {[[-1,"←"],[1,"→"]].map(([dir, lbl]) => (
            <button key={String(lbl)} onClick={() => goTo((slideIdx + DEFAULT_SLIDES.length + (dir as number)) % DEFAULT_SLIDES.length)} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [dir === -1 ? "left" : "right"]: 12, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.6)", borderRadius: 10, width: 36, height: 36, cursor: "pointer", fontSize: 16, fontFamily: "monospace", zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)", transition: "all 200ms ease" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.15)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.08)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.6)"; }}>
              {lbl}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
