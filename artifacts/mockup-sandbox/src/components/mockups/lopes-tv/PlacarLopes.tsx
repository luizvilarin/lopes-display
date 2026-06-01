import { useState, useEffect, useCallback } from "react";
import faviconLopes from "@/assets/favicon-lopes.png";
import logoBranca from "@/assets/logo-branca.png";
import fogueteImg from "@/assets/foguete-lopes.png";
import { placarService } from "@/services/placarService";

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
interface SlideMeta extends SlideBase { type: "meta"; valor: string; realizadoNum: number; metaNum: number; periodo: string; showBox?: boolean; }
interface SlidePVenda extends SlideBase { type: "pvenda"; nome: string; cargo: string; photoUrl?: string; mensagem: string; detalhe: string; updateFreq: string; }
interface SlideRanking extends SlideBase { type: "ranking"; pessoas: RankingPerson[]; updateFreq: string; }

type Slide = SlideMeta | SlidePVenda | SlideRanking;

// ─── Default Setup ────────────────────────────────────────────────────────────

const FALLBACK_UNIT: UnitInfo = {
  name: "Lopes Digital",
  handle: "@lopesdigital",
  gradient: "radial-gradient(circle at 40% 40%, #1a0a2e, #0a0a14)",
  ringStart: "#FF0080",
  ringEnd: "#E30613",
  navUnits: ["Lopes"],
};

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
  @keyframes rocketFloat{0%,100%{transform:translateY(0px)}50%{transform:translateY(-5px)}}
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

function Sidebar({ unit }: { unit: UnitInfo }) {
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
        {unit.navUnits.slice(0, 4).map((u) => {
          const isSelected = u === unit.name;
          return (
            <div key={u} style={{ padding: "7px 12px", borderRadius: 9999, background: isSelected ? "rgba(255,255,255,.18)" : "transparent", cursor: "pointer", fontSize: 12, fontFamily: "'Barlow',sans-serif", fontWeight: isSelected ? 700 : 500, color: isSelected ? "#fff" : "rgba(255,255,255,.50)", transition: "all 200ms ease" }}>
              {u}
            </div>
          );
        })}
      </div>

      {/* Dots */}
      <div style={{ display: "flex", gap: 8, paddingLeft: 12 }}>
        {[0, 1, 2].map(i => <div key={i} style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,.14)" }} />)}
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
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#1D9BF0"><path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91-1.01-1-2.52-1.27-3.91-.81C14.67 2.88 13.43 2 12 2s-2.67.88-3.34 2.19c-1.39-.46-2.9-.2-3.91.81-1 1.01-1.27 2.52-.81 3.91C2.88 9.33 2 10.57 2 12s.88 2.67 2.19 3.34c-.46 1.39-.2 2.9.81 3.91 1.01 1 2.52 1.27 3.91.81C9.33 21.12 10.57 22 12 22s2.67-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81 1-1.01 1.27-2.52.81-3.91C21.12 14.67 22 13.43 22 12zm-6.16-1.4l-3.75 5.02a1 1 0 0 1-1.39.19L8.5 14.06a1 1 0 0 1 1.22-1.59l1.73 1.33 3.12-4.18a1 1 0 1 1 1.61 1.17l-.34-.19z" /></svg>
    </div>
  );
}

// ─── Slide: Meta ──────────────────────────────────────────────────────────────

function SlideMeta({ slide }: { slide: SlideMeta }) {
  const pct = Math.min(100, (slide.realizadoNum / Math.max(1, slide.metaNum)) * 100);
  const pctStr = pct.toLocaleString("pt-BR", { maximumFractionDigits: 2 });

  return (
    <div className="slide-up" style={{ flex: 1, display: "flex", flexDirection: "column", padding: "28px 52px 32px" }}>
      <CategoryPill label={slide.category} />
      <h1 style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 800, fontSize: 42, color: "rgba(255,255,255,.88)", letterSpacing: "-.01em", marginBottom: 52 }}>{slide.title}</h1>

      {slide.showBox ? (
        <div style={{ background: "rgba(255,255,255,.10)", borderRadius: 12, padding: "22px 36px", marginBottom: 20, display: "inline-block" }}>
          <span style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 500, fontSize: 58, color: "#fff", letterSpacing: "0.08em" }}>{slide.valor}</span>
        </div>
      ) : (
        <div style={{ marginBottom: 32 }}>
          <span style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 500, fontSize: 76, color: "#fff", letterSpacing: "0.08em", lineHeight: 1 }}>{slide.valor}</span>
        </div>
      )}

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
  const initials = slide.nome.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="slide-up" style={{ flex: 1, display: "flex", flexDirection: "column", padding: "24px 52px 0", overflow: "hidden" }}>
      <CategoryPill label={slide.category} />
      <h1 style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 800, fontSize: 52, color: "#fff", letterSpacing: "-.02em", marginBottom: 20, flexShrink: 0 }}>{slide.title}</h1>

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 0, flex: 1 }}>
        <div style={{ width: 280, borderRadius: 20, overflow: "hidden", boxShadow: "0 24px 72px rgba(0,0,0,.75)", border: "1px solid rgba(255,255,255,.10)" }}>
          <div style={{
            width: "100%", height: 260,
            background: slide.photoUrl ? `url(${slide.photoUrl}) center/cover` : "linear-gradient(145deg,#1e1e38,#2e2e50)",
            display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
          }}>
            {!slide.photoUrl && (
              <div style={{ width: 90, height: 90, borderRadius: "50%", background: "rgba(255,255,255,.14)", border: "2px solid rgba(255,255,255,.22)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 36, color: "#fff" }}>
                {initials}
              </div>
            )}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 16px", background: "linear-gradient(to top, rgba(0,0,0,.82), transparent)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 14, color: "#fff", letterSpacing: ".06em", textTransform: "uppercase" }}>{slide.nome}</span>
              <img src={logoBranca} alt="Lopes" style={{ height: 13, width: "auto", filter: "brightness(0) invert(1)", opacity: 0.85 }} />
            </div>
          </div>
          <div style={{ background: "#fff", padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <span style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 16, color: "#111", lineHeight: 1.2 }}>{slide.mensagem}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10" fill="#22c55e" /><path d="M8 12l3 3 5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <div style={{ width: 40, height: 2, background: "rgba(0,0,0,.12)", marginBottom: 12 }} />
            <div style={{ fontSize: 12, color: "#555", lineHeight: 1.55, textTransform: "uppercase", letterSpacing: ".05em", fontFamily: "'DM Sans',sans-serif" }}>{slide.detalhe}</div>
          </div>
        </div>
      </div>

      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 18, paddingTop: 14 }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,.30)", letterSpacing: ".16em", textTransform: "uppercase", fontFamily: "'Barlow',sans-serif", fontWeight: 600 }}>{slide.updateFreq}</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,.30)", letterSpacing: ".16em", textTransform: "uppercase", fontFamily: "'Barlow',sans-serif", fontWeight: 600 }}>{MES_ANO.toUpperCase()}</span>
      </div>
    </div>
  );
}

// ─── Rocket ───────────────────────────────────────────────────────────────────

function Rocket({ photoUrl, initials, delay = 0 }: { photoUrl?: string; initials: string; delay?: number }) {
  const floatStart = delay + 750;
  return (
    <div style={{
      position: "relative", width: 110, height: 56, flexShrink: 0,
      animation: `rocketEntry 700ms ${delay}ms cubic-bezier(.34,1.56,.64,1) both, rocketFloat 2.2s ${floatStart}ms ease-in-out infinite`,
    }}>
      <div style={{ position: "absolute", left: -10, top: "24%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 2, animation: "flamePulse 350ms ease infinite" }}>
        {[14, 25, 14].map((h, i) => (
          <div key={i} style={{ width: h, height: 6, borderRadius: "0 9999px 9999px 0", background: `linear-gradient(90deg,transparent,${["#FF4500", "#FFD700", "#FF8C00"][i]})`, opacity: .95 }} />
        ))}
      </div>
      <img src={fogueteImg} alt="foguete" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
      <div style={{
        position: "absolute",
        left: "61%", top: "50%",
        transform: "translate(-50%, -50%)",
        width: 26, height: 26,
        borderRadius: "50%",
        overflow: "hidden",
        background: photoUrl ? `url(${photoUrl}) center/cover` : "linear-gradient(135deg,#3a3a5c,#1a1a2e)",
        border: "1.5px solid #190303",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, fontWeight: 800, color: "#fff"
      }}>
        {!photoUrl && initials}
      </div>
    </div>
  );
}

// ─── Rocket Bar ───────────────────────────────────────────────────────────────

function RocketBar({ person, maxValue, rank, delay }: { person: RankingPerson; maxValue: number; rank: number; delay: number }) {
  const baseWidth = Math.max(10, (person.value / Math.max(1, maxValue)) * 70);
  const colors = [
    ["#FFE81F", "rgba(255,232,31,.20)", "🏆 1º"],
    ["#B8B8B8", "rgba(184,184,184,.15)", "🥈 2º"],
    ["#CD7F32", "rgba(205,127,50,.15)", "🥉 3º"],
  ][rank] || ["#E30613", "rgba(227,6,19,.15)", `${rank + 1}º`];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, height: 76, minHeight: 0 }}>
      <div style={{ width: 44, fontFamily: "'Barlow',sans-serif", fontWeight: 800, fontSize: 14, color: colors[0], letterSpacing: ".04em" }}>{colors[2]}</div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", position: "relative", height: "100%" }}>
        <div style={{
          height: 16, borderRadius: 9999,
          background: `linear-gradient(90deg, ${colors[1]}, ${colors[0]})`,
          boxShadow: `0 0 24px ${colors[1]}`,
          width: `${baseWidth}%`,
          animation: `barFill 1.2s ${delay}ms cubic-bezier(.25, 1, .5, 1) both`,
          "--w": `${baseWidth}%`,
          position: "relative",
        } as React.CSSProperties} />

        <div style={{
          marginLeft: -8,
          zIndex: 2,
          position: "relative",
          animation: `fadeIn 500ms ${delay + 200}ms both`
        }}>
          <Rocket photoUrl={person.photoUrl} initials={person.initials} delay={delay} />
        </div>

        <div style={{ marginLeft: 16, display: "flex", flexDirection: "column", animation: `fadeIn 600ms ${delay + 400}ms both`, flexShrink: 0 }}>
          <span style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 15, color: "#fff", lineHeight: 1.2 }}>{person.name}</span>
          <span style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 15, color: colors[0], letterSpacing: "0.02em" }}>{fmtBRL(person.value)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Starfield ────────────────────────────────────────────────────────────────

function Starfield() {
  return (
    <div className="starfield">
      {Array.from({ length: 120 }, (_, i) => (
        <div key={i} className={`star-${i} ${i % 5 === 0 ? "tw" : ""}`} style={{ animationDelay: `${(i * 83) % 3000}ms` }} />
      ))}
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

export function PlacarLopes({ activeUnitId: propActiveUnitId }: { activeUnitId?: string }) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [unitInfo, setUnitInfo] = useState<UnitInfo>(FALLBACK_UNIT);
  const [slideIdx, setSlideIdx] = useState(0);
  const [key, setKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const INTERVAL = 8000;

  const goTo = useCallback((i: number) => {
    setSlideIdx(i);
    setKey(k => k + 1);
  }, []);

  // Carregar Dados Assíncronos do Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        // IDs de unidades válidas (nunca incluem 'Todas' ou vazio)
        const VALID_UNIT_IDS = ["jd-goias", "marista", "bueno", "oeste"];
        const resolveUnitId = (raw?: string | null): string | null => {
          if (!raw || raw === "Todas" || raw.trim() === "") return null;
          return raw;
        };

        const rawUnit = propActiveUnitId || localStorage.getItem("lopes_active_unit") || localStorage.getItem("lopes_selected_unit");
        const activeUnitId: string | null = resolveUnitId(rawUnit);
        // Para queries que requerem um ID concreto, usa o primeiro unidade válida como fallback
        const concreteUnitId = activeUnitId || VALID_UNIT_IDS[0];

        const [config, pv, allRankings, unidades] = await Promise.all([
          placarService.getConfig(concreteUnitId).catch(err => {
            console.error("Falha ao carregar config na TV:", err);
            return null;
          }),
          placarService.getPrimeiraVenda(activeUnitId || undefined).catch(err => {
            console.error("Falha ao carregar primeira venda na TV:", err);
            return null;
          }),
          placarService.getRankings().catch(err => {
            console.error("Falha ao carregar rankings na TV:", err);
            return [];
          }),
          placarService.getUnidades().catch(err => {
            console.error("Falha ao carregar unidades na TV:", err);
            return [];
          })
        ]);

        // 1. Mapear Unidade Ativa para o Sidebar
        const activeUnit = unidades.find(u => u.id === concreteUnitId) || unidades[0];
        if (activeUnit) {
          setUnitInfo({
            name: activeUnit.nome,
            handle: activeUnit.handle,
            gradient: "radial-gradient(circle at 40% 40%, #1a0a2e, #0a0a14)",
            ringStart: "#FF0080",
            ringEnd: "#E30613",
            navUnits: unidades.map(u => u.nome)
          });
        }

        // 2. Gerar os slides dinamicamente
        const generated: Slide[] = [];

        // Slide de Metas (Mensal / Anual)
        if (config) {
          generated.push({
            id: "meta-mensal",
            type: "meta",
            category: "Metas Lopes",
            title: config.meta_mensal_titulo || "Meta Mensal",
            valor: fmtBRL(Number(config.meta_mensal_valor)),
            realizadoNum: Number(config.meta_mensal_realizado),
            metaNum: Number(config.meta_mensal_valor),
            periodo: config.meta_mensal_periodo || "MÊS ATUAL",
            showBox: false,
          });

          generated.push({
            id: "meta-anual",
            type: "meta",
            category: "Metas Lopes",
            title: config.meta_anual_titulo || "Meta Anual",
            valor: fmtBRL(Number(config.meta_anual_valor)),
            realizadoNum: Number(config.meta_anual_realizado),
            metaNum: Number(config.meta_anual_valor),
            periodo: `ANO DE ${new Date().getFullYear()}`,
            showBox: true,
          });
        }

        // Slide de Primeira Venda
        if (Array.isArray(pv)) {
          pv.forEach((item) => {
            if (item && item.pessoa) {
              generated.push({
                id: `pvenda-${item.id}`,
                type: "pvenda",
                category: "História Lopes",
                title: "Primeira Venda",
                nome: item.pessoa.nome,
                cargo: item.pessoa.cargo === "gestor" ? "Gestor" : "Corretora",
                photoUrl: item.pessoa.foto_url || "",
                mensagem: item.mensagem,
                detalhe: item.detalhe || "Você faz parte do crescimento da nossa empresa, nosso muito obrigado!",
                updateFreq: "RANKING ATUALIZADO SEMANALMENTE.",
              });
            }
          });
        }

        // Slides de Rankings
        const addRankSlide = (tipo: "mensal" | "anual", categoria: "gestores" | "corretores", title: string) => {
          const entries = allRankings
            .filter(r => {
              if (r.tipo !== tipo || r.categoria !== categoria || !r.pessoa) return false;
              // Só filtra por unidade se tiver um ID concreto (nunca filtra por 'Todas' ou vazio)
              if (activeUnitId) return r.pessoa.unidade_id === activeUnitId;
              return true; // sem filtro de unidade → mostra todos
            })
            .sort((a, b) => a.posicao - b.posicao)
            .slice(0, 3)
            .map(r => ({
              name: r.pessoa!.nome.split(" ")[0],
              value: Number(r.valor),
              initials: r.pessoa!.nome.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase(),
              photoUrl: r.pessoa!.foto_url || ""
            }));

          if (entries.length > 0) {
            generated.push({
              id: `top-${categoria}-${tipo}`,
              type: "ranking",
              category: "História Lopes",
              title,
              pessoas: entries,
              updateFreq: tipo === "mensal" ? "RANKING ATUALIZADO MENSALMENTE." : "RANKING ATUALIZADO ANUALMENTE."
            });
          }
        };

        addRankSlide("mensal", "gestores", "Top 3 Gestores Mensal");
        addRankSlide("mensal", "corretores", "Top 3 Corretores Mensal");
        addRankSlide("anual", "gestores", "Top 3 Gestores Anual");
        addRankSlide("anual", "corretores", "Top 3 Corretores Anual");

        // Fallback em caso de base vazia
        if (generated.length === 0) {
          generated.push({
            id: "fallback",
            type: "meta",
            category: "Metas Lopes",
            title: "Lopes Display Digital",
            valor: "R$ 0,00",
            realizadoNum: 0,
            metaNum: 1,
            periodo: "Aguardando configurações de Metas no Painel",
            showBox: false,
          });
        }

        setSlides(generated);
      } catch (err) {
        console.error("Erro ao carregar placar:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [propActiveUnitId]);

  // Loop de Autoplay
  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => goTo((slideIdx + 1) % slides.length), INTERVAL);
    return () => clearInterval(t);
  }, [slideIdx, goTo, slides.length]);

  if (loading) {
    return (
      <div style={{ width: "100vw", height: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(255,255,255,.1)", borderTopColor: "#E30613", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  const slide = slides[slideIdx] || slides[0];
  if (!slide) return null;

  return (
    <>
      <style>{CSS}</style>
      <div className="placar-root" style={{ background: slide.type === "ranking" ? "radial-gradient(ellipse at 30% 50%,#080818 0%,#000 70%)" : "#0a0a0a" }}>
        <Sidebar unit={unitInfo} />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
          <div key={key} style={{ flex: 1, display: "flex" }}>
            {slide.type === "meta" && <SlideMeta slide={slide as SlideMeta} />}
            {slide.type === "pvenda" && <SlidePVenda slide={slide as SlidePVenda} />}
            {slide.type === "ranking" && <SlideRanking slide={slide as SlideRanking} />}
          </div>

          {slides.length > 1 && (
            <>
              <ProgressDots total={slides.length} current={slideIdx} onChange={goTo} />
              {[[-1, "←"], [1, "→"]].map(([dir, lbl]) => (
                <button
                  key={String(lbl)}
                  onClick={() => goTo((slideIdx + slides.length + (dir as number)) % slides.length)}
                  style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [dir === -1 ? "left" : "right"]: 12, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.6)", borderRadius: 10, width: 36, height: 36, cursor: "pointer", fontSize: 16, fontFamily: "monospace", zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)", transition: "all 200ms ease" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.15)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.08)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.6)"; }}
                >
                  {lbl}
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
}
