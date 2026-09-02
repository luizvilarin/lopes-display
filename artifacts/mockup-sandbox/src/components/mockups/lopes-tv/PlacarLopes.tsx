import { useState, useEffect, useCallback } from "react";
import faviconLopes from "@/assets/favicon-lopes.png";
import logoBranca from "@/assets/logo-branca.png";
import logoPreta from "@/assets/logo-preta.png";
import fogueteImg from "@/assets/foguete-lopes.png";
import capaPrimeiraVenda from "@/assets/capas/capa-primeira-venda.png";
import capaProgressao from "@/assets/capas/capa-progressao.png";
import capaRankingPastas from "@/assets/capas/capa-ranking-pastas.png";
import capaPodio from "@/assets/capas/capa-podio.png";
import capaDigital from "@/assets/capas/capa-digital.png";
import capaSignature from "@/assets/capas/capa-signature.png";
import { placarService } from "@/services/placarService";
import type { Pasta, RankingPastaEntry, Pessoa, RankingEntry, ProgressaoCarreira } from "@/types/placar";
import { SlideReconhecimento } from "./SlideReconhecimento";
import { SlideProgressaoSignature } from "./SlideProgressaoSignature";
import { SlideProgressaoPromocao } from "./SlideProgressaoPromocao";

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
interface SlideRankingPastas extends SlideBase {
  type: "ranking_pasta";
  pastaTitle: string;
  metaPastas: number;
  totalPastasEntregues: number;
  subType: "corretores" | "gestores";
  entries: (RankingPastaEntry & { pessoa: Pessoa })[];
  updateFreq: string;
}
interface SlideReconhecimentoType extends SlideBase {
  type: "reconhecimento";
  corretores: (RankingEntry & { pessoa?: Pessoa })[];
  gestores: (RankingEntry & { pessoa?: Pessoa })[];
}
interface SlideProgressao extends SlideBase {
  type: "progressao";
  subType: "signature" | "promocao";
  progressao: ProgressaoCarreira;
}
interface SlideCapa extends SlideBase {
  type: "capa";
  imageUrl: string;
}

type Slide = SlideMeta | SlidePVenda | SlideRanking | SlideRankingPastas | SlideReconhecimentoType | SlideProgressao | SlideCapa;

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
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em", marginBottom: 6 }}>Objetivo do Mês</div>
          <span style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 500, fontSize: 76, color: "#fff", letterSpacing: "0.08em", lineHeight: 1 }}>{slide.valor}</span>
        </div>
      )}

      <div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-end", maxWidth: 520 }}>
        <div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em", marginBottom: 6 }}>Valor Já Realizado</div>
          <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 800, fontSize: 36, color: "#4ade80", lineHeight: 1 }}>
            R$ {slide.realizadoNum.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em", marginBottom: 6 }}>Progresso</div>
          <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 800, fontSize: 32, color: "#fff", lineHeight: 1 }}>
            {pctStr}%
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <div style={{ height: 16, borderRadius: 9999, background: "rgba(255,255,255,.12)", overflow: "hidden", maxWidth: 520 }}>
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

      <div style={{ fontSize: 13, color: "rgba(255,255,255,.35)", letterSpacing: ".14em", textTransform: "uppercase", fontFamily: "'Barlow',sans-serif", fontWeight: 600 }}>{slide.periodo}</div>
    </div>
  );
}

// ─── Slide: Primeira Venda ────────────────────────────────────────────────────

function SlidePVenda({ slide }: { slide: SlidePVenda }) {
  const firstName = slide.nome.split(" ")[0];
  const initials = firstName.substring(0, 2).toUpperCase();

  return (
    <div className="slide-up" style={{
      width: "100%", height: "100%",
      background: "#FFFFFF",
      display: "flex",
      fontFamily: "'Montserrat', sans-serif",
      padding: "80px",
      color: "#000000",
      position: "relative",
      boxSizing: "border-box"
    }}>
      {/* Coluna Esquerda */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        paddingRight: "60px",
        position: "relative",
        zIndex: 10
      }}>
        {/* Top title area */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "24px", marginBottom: "80px" }}>
          {/* Check Icon */}
          <div style={{
            width: "80px", height: "80px",
            background: "#000000",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <path d="M5 13l4 4L19 7" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{
            fontSize: "56px",
            fontWeight: 500,
            lineHeight: 1.1,
            color: "#000000"
          }}>
            Primeira<br />venda.
          </div>
        </div>

        {/* Nome Principal & Elementos Decorativos */}
        <div style={{ position: "relative", marginBottom: "40px", width: "fit-content" }}>
          <h1 style={{
            fontSize: "120px",
            fontWeight: 800,
            color: "#000000",
            margin: 0,
            lineHeight: 1,
            letterSpacing: "-0.02em"
          }}>
            {firstName}
          </h1>
          {/* Quadrados pretos à direita do nome */}
          <div style={{
            position: "absolute",
            right: "-120px",
            top: "10%",
            display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px"
          }}>
             {/* Small square */}
             <div style={{ width: "30px", height: "30px", background: "#000000", marginRight: "30px" }} />
             {/* Medium square */}
             <div style={{ width: "60px", height: "60px", background: "#000000" }} />
          </div>
        </div>

        {/* Quadrado Vermelho e Legenda */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "120px" }}>
          <div style={{ width: "50px", height: "50px", background: "#FF0000" }} />
          <div style={{ fontSize: "36px", fontWeight: 400, color: "#000000" }}>
            Primeira venda
          </div>
        </div>

        {/* Legenda Inferior & Logo */}
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "40px",
          marginTop: "auto"
        }}>
          <img src={logoPreta} alt="Lopes" style={{ height: "40px", width: "auto" }} />
          <div style={{
            fontSize: "20px",
            fontWeight: 400,
            color: "#555555",
            lineHeight: 1.5,
            maxWidth: "400px"
          }}>
            O início de uma jornada de sucesso com o pé direito. Parabéns, essa é a primeira de muitas!
          </div>
        </div>
      </div>

      {/* Coluna Direita */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative"
      }}>
        {/* Contêiner da Foto */}
        <div style={{
          width: "550px",
          height: "550px",
          borderRadius: "80px",
          border: "24px solid #0B192C",
          boxShadow: "inset 0 0 40px rgba(0,0,0,0.5), 0 20px 50px rgba(0,0,0,0.15)",
          overflow: "hidden",
          position: "relative",
          background: slide.photoUrl ? `url(${slide.photoUrl}) center/cover` : "#e0e0e0",
          zIndex: 2
        }}>
          {!slide.photoUrl && (
             <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "64px", fontWeight: 800, color: "#777" }}>
               {initials}
             </div>
          )}
        </div>

        {/* Terceiro quadrado preto borda inferior direita da moldura */}
        <div style={{
          position: "absolute",
          width: "45px", height: "45px",
          background: "#000000",
          bottom: "15%",
          right: "10%",
          zIndex: 1
        }} />
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

// ─── Slide: Ranking de Pastas ──────────────────────────────────────────────────

function SlideRankingPastas({ slide }: { slide: SlideRankingPastas }) {
  const pctMeta = Math.min(100, (slide.totalPastasEntregues / Math.max(1, slide.metaPastas)) * 100);
  const topEntries = slide.entries.slice(0, slide.subType === "corretores" ? 10 : 5);
  const title = slide.subType === "corretores" ? "Top 10 Corretores" : "Top 5 Gestores";
  const icon = slide.subType === "corretores" ? "🏅" : "👔";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "28px 48px", position: "relative", overflow: "hidden" }}>
      <Starfield />
      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <CategoryPill label={`Ranking de Pastas Unificado — ${title}`} />
            <h1 className="slide-up" style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 900, fontSize: 44, color: "#fff", letterSpacing: "-.02em", lineHeight: 1.1 }}>
              {slide.pastaTitle}
            </h1>
          </div>

          {/* Meta Progress Card */}
          <div style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,0,128,.3)", borderRadius: 16, padding: "16px 28px", minWidth: 280, backdropFilter: "blur(12px)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,.7)", marginBottom: 8 }}>
              <span>META DO LANÇAMENTO</span>
              <span style={{ color: "#FF0080" }}>{slide.totalPastasEntregues} / {slide.metaPastas} Pastas</span>
            </div>
            <div style={{ height: 12, borderRadius: 9999, background: "rgba(255,255,255,.10)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pctMeta}%`, background: "linear-gradient(90deg, #FF0080, #E30613)", borderRadius: 9999, transition: "width 800ms" }} />
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)", textAlign: "right", marginTop: 6 }}>
              {pctMeta.toFixed(0)}% Atingido
            </div>
          </div>
        </div>

        {/* Content Box */}
        <div style={{ flex: 1, background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 24, padding: 28, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,.08)" }}>
            <span style={{ fontSize: 24 }}>{icon}</span>
            <span style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 800, fontSize: 24, color: "#fff", textTransform: "uppercase", letterSpacing: ".04em" }}>
              {title}
            </span>
            <span style={{ marginLeft: "auto", background: "linear-gradient(90deg,#FF0080,#E30613)", padding: "6px 14px", borderRadius: 16, fontSize: 14, fontWeight: 800, color: "#fff" }}>
              UNIFICADO LOPES
            </span>
          </div>

          {topEntries.length === 0 ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,.3)", fontSize: 18 }}>
              Nenhum participante pontuou neste lançamento ainda.
            </div>
          ) : (
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: slide.subType === "corretores" ? "1fr 1fr" : "1fr", gap: 16, alignContent: "start" }}>
              {topEntries.map((item) => {
                const rankColor = item.posicao === 1 ? "#f59e0b" : item.posicao === 2 ? "#94a3b8" : item.posicao === 3 ? "#cd7f32" : (slide.subType === "corretores" ? "#818cf8" : "#38bdf8");
                return (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: "12px 18px",
                      borderRadius: 16,
                      background: item.posicao <= 3 ? "linear-gradient(135deg, rgba(255,255,255,.08), rgba(255,255,255,.02))" : "rgba(255,255,255,.03)",
                      border: `1px solid ${item.posicao <= 3 ? rankColor + "66" : "rgba(255,255,255,.06)"}`,
                    }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: rankColor, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 16, color: "#fff", flexShrink: 0 }}>
                      {item.posicao}º
                    </div>
                    <div style={{ width: 56, height: 56, borderRadius: "50%", overflow: "hidden", background: "rgba(255,255,255,.1)", flexShrink: 0, border: `2px solid ${rankColor}` }}>
                      {item.pessoa?.foto_url ? (
                        <img src={item.pessoa.foto_url} alt={item.pessoa.nome} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18, color: "#fff" }}>
                          {item.pessoa?.nome.substring(0, 2).toUpperCase() || "??"}
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 22, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.pessoa?.nome || "Participante"}
                      </div>
                      <div style={{ fontSize: 14, color: "rgba(255,255,255,.5)", marginTop: 2, fontWeight: 600 }}>
                        {item.pessoa?.unidade_id ? `Lopes ${item.pessoa.unidade_id.toUpperCase()}` : "Lopes"}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontWeight: 900, fontSize: 28, color: "#4ade80" }}>{item.quantidade_pastas}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", textTransform: "uppercase", fontWeight: 700 }}>Pastas</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Footer info */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 16 }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,.30)", letterSpacing: ".16em", textTransform: "uppercase", fontFamily: "'Barlow',sans-serif", fontWeight: 600 }}>
            {slide.updateFreq}
          </span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,.30)", letterSpacing: ".16em", textTransform: "uppercase", fontFamily: "'Barlow',sans-serif", fontWeight: 600 }}>
            {MES_ANO.toUpperCase()}
          </span>
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

// ─── Module Level Cache to prevent loading delays ─────────────────────────────
let cachedSlides: Slide[] | null = null;
let cachedUnitInfo: UnitInfo | null = null;

// ─── Root ─────────────────────────────────────────────────────────────────────

export function PlacarLopes({ activeUnitId: propActiveUnitId, onFinishedCycle, standalone = true }: { activeUnitId?: string; onFinishedCycle?: () => void; standalone?: boolean; }) {
  const [slides, setSlides] = useState<Slide[]>(cachedSlides || []);
  const [unitInfo, setUnitInfo] = useState<UnitInfo>(cachedUnitInfo || FALLBACK_UNIT);
  const [slideIdx, setSlideIdx] = useState(0);
  const [key, setKey] = useState(0);
  const [loading, setLoading] = useState(!cachedSlides);
  const INTERVAL = 8000;

  const goTo = useCallback((i: number) => {
    setSlideIdx(i);
    setKey(k => k + 1);
  }, []);

  // Carregar Dados Assíncronos do Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        const [config, pv, pastas, progressoes] = await Promise.all([
          placarService.getConfig("lopes").catch(err => {
            console.error("Falha ao carregar config na TV:", err);
            return null;
          }),
          placarService.getPrimeiraVenda().catch(err => {
            console.error("Falha ao carregar primeira venda na TV:", err);
            return null;
          }),
          placarService.getPastas().catch(err => {
            console.error("Falha ao carregar pastas na TV:", err);
            return [];
          }),
          placarService.getProgressoes().catch(err => {
            console.error("Falha ao carregar progressões na TV:", err);
            return [];
          })
        ]);

        // 1. Sidebar fixa como Grupo Lopes
        const newUnitInfo = {
          name: "Grupo Lopes",
          handle: "@lopes_digital",
          gradient: "#FFFFFF",
          ringStart: "#E30613",
          ringEnd: "#E30613",
          navUnits: ["Lopes"]
        };
        cachedUnitInfo = newUnitInfo;
        setUnitInfo(newUnitInfo);

        // 2. Gerar os slides dinamicamente
        const generated: Slide[] = [];

        // Slide de Meta Mensal
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
        }

        // Slide de Primeira Venda
        if (Array.isArray(pv) && pv.some(p => p && p.pessoa && p.pessoa.ativo)) {
          // Placeholder para Capa Primeira Venda
          generated.push({
            id: "capa-pv",
            type: "capa",
            category: "História Lopes",
            title: "Primeira Venda",
            imageUrl: capaPrimeiraVenda
          });
          pv.forEach((item) => {
            if (item && item.pessoa && item.pessoa.ativo) {
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

        // Slides de Progressão de Carreira
        if (Array.isArray(progressoes) && progressoes.some(p => p && p.ativo && p.pessoa && p.pessoa.ativo)) {
          // Placeholder para Capa Progressão
          generated.push({
            id: "capa-progressao",
            type: "capa",
            category: "História Lopes",
            title: "Progressão de Carreira",
            imageUrl: capaProgressao
          });
          progressoes.forEach((p) => {
            if (p && p.ativo && p.pessoa && p.pessoa.ativo) {
              generated.push({
                id: `progressao-${p.id}`,
                type: "progressao",
                category: "História Lopes",
                title: p.tipo === "signature" ? "Novo Membro Signature" : "Progressão de Carreira",
                subType: p.tipo,
                progressao: p
              });
            }
          });
        }

        // Slides de Ranking de Pastas (Foco Principal do Placar Unificado)
        if (pastas.length > 0 && pastas.some(p => p.ativo)) {
          // Placeholder para Capa Ranking de Pastas
          generated.push({
            id: "capa-pastas",
            type: "capa",
            category: "Metas Lopes",
            title: "Corrida de Pastas",
            imageUrl: capaRankingPastas
          });
        }
        for (const p of pastas) {
          if (!p.ativo) continue;
          const rankingEntries = await placarService.getRankingPastas(p.id).catch(() => [] as (RankingPastaEntry & { pessoa?: Pessoa })[]);
          const corretores = rankingEntries.filter(e => e.categoria === "corretor").sort((a, b) => a.posicao - b.posicao);
          const gestores = rankingEntries.filter(e => e.categoria === "gestor").sort((a, b) => a.posicao - b.posicao);
          const totalPastasEntregues = [...corretores, ...gestores].reduce((acc, curr) => acc + (curr.quantidade_pastas || 0), 0);

          if (corretores.length > 0 || gestores.length === 0) {
            generated.push({
              id: `ranking-pasta-corretores-${p.id}`,
              type: "ranking_pasta",
              category: "Metas Lopes",
              title: "Ranking de Pastas Unificado",
              pastaTitle: p.titulo,
              metaPastas: p.meta_pastas,
              totalPastasEntregues,
              subType: "corretores",
              entries: corretores as (RankingPastaEntry & { pessoa: Pessoa })[],
              updateFreq: "RANKING DE PASTAS ATUALIZADO DIARIAMENTE."
            });
          }

          if (gestores.length > 0) {
            generated.push({
              id: `ranking-pasta-gestores-${p.id}`,
              type: "ranking_pasta",
              category: "Metas Lopes",
              title: "Ranking de Pastas Unificado",
              pastaTitle: p.titulo,
              metaPastas: p.meta_pastas,
              totalPastasEntregues,
              subType: "gestores",
              entries: gestores as (RankingPastaEntry & { pessoa: Pessoa })[],
              updateFreq: "RANKING DE PASTAS ATUALIZADO DIARIAMENTE."
            });
          }
        }

        // Slide de Reconhecimento (Destaque do Mês - Padrão Ouro 100% Réplica) - ÚLTIMO SLIDE
        const allRankings: RankingEntry[] = await placarService.getRankings().catch(() => []);
        const corretoresMensais = allRankings.filter(r => r.tipo === "mensal" && r.categoria === "corretores");
        const gestoresMensais = allRankings.filter(r => r.tipo === "mensal" && r.categoria === "gestores");

        if (corretoresMensais.length > 0 || gestoresMensais.length > 0) {
          // Placeholder para Capa Ranking
          generated.push({
            id: "capa-ranking-mensal",
            type: "capa",
            category: "Metas Lopes",
            title: "Ranking do Mês",
            imageUrl: capaPodio
          });
          generated.push({
            id: "reconhecimento-mensal",
            type: "reconhecimento",
            category: "Metas Lopes",
            title: "Destaques do Mês",
            corretores: corretoresMensais,
            gestores: gestoresMensais,
          });
        }

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

        cachedSlides = generated;
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
    const currentType = slides[slideIdx]?.type;
    // Se for o slide de reconhecimento, o tempo de permanência é gerido dentro do próprio componente de cada indivíduo
    if (currentType === "reconhecimento") return;

    const t = setInterval(() => {
      const nextIdx = slideIdx + 1;
      if (nextIdx >= slides.length) {
        if (onFinishedCycle) onFinishedCycle();
        goTo(0);
      } else {
        goTo(nextIdx);
      }
    }, INTERVAL);
    return () => clearInterval(t);
  }, [slideIdx, goTo, slides, onFinishedCycle]);

  // Suporte para Setinhas (Manual Override)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (slides.length <= 1) return;
      if (e.key === "ArrowRight") {
        goTo((slideIdx + 1) % slides.length);
      } else if (e.key === "ArrowLeft") {
        goTo((slideIdx + slides.length - 1) % slides.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slideIdx, slides.length, goTo]);

  if (loading) {
    return (
      <div style={{ width: "100vw", height: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(255,255,255,.1)", borderTopColor: "#E30613", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  const slide = slides[slideIdx] || slides[0];
  if (!slide) return null;

  // Se o slide ativo for o de Reconhecimento de Top Corretores / Gerentes, renderiza 100% Fullscreen sem sidebar
  if (slide.type === "reconhecimento") {
    return (
      <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
        <style>{CSS}</style>
        <SlideReconhecimento
          corretores={(slide as SlideReconhecimentoType).corretores}
          gestores={(slide as SlideReconhecimentoType).gestores}
          standalone={standalone}
          onFinishedCycle={() => {
            const nextIdx = slideIdx + 1;
            if (nextIdx >= slides.length) {
              if (onFinishedCycle) onFinishedCycle();
              goTo(0);
            } else {
              goTo(nextIdx);
            }
          }}
        />
        {slides.length > 1 && (
          <>
            {[[-1, "←"], [1, "→"]].map(([dir, lbl]) => (
              <button
                key={String(lbl)}
                onClick={() => goTo((slideIdx + slides.length + (dir as number)) % slides.length)}
                style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [dir === -1 ? "left" : "right"]: 12, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.6)", borderRadius: 10, width: 36, height: 36, cursor: "pointer", fontSize: 16, fontFamily: "monospace", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)", transition: "all 200ms ease" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.15)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.08)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.6)"; }}
              >
                {lbl}
              </button>
            ))}
          </>
        )}
      </div>
    );
  }

  // Slide de Capa (Fullscreen Image)
  if (slide.type === "capa") {
    const s = slide as SlideCapa;
    return (
      <div key={`capa-${s.id}-${key}`} style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden" }}>
        <style>{CSS}</style>
        <img
          src={s.imageUrl}
          alt={s.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
        />
        {/* ProgressBar overlay na base */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 6, background: "rgba(0,0,0,0.5)" }}>
          <div style={{
            height: "100%", background: "#E30613",
            transformOrigin: "left", animation: `barFill ${INTERVAL}ms linear forwards`
          }} />
        </div>
      </div>
    );
  }

  // Slide de Progressão de Carreira (Fullscreen)
  if (slide.type === "progressao") {
    const p = (slide as SlideProgressao).progressao;
    const nome = p.pessoa?.nome?.split(" ")[0] || "Lopes";
    const foto = p.foto_especifica || p.pessoa?.foto_url;

    return (
      <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
        <style>{CSS}</style>
        {slide.subType === "signature" ? (
          <SlideProgressaoSignature
            nome={nome}
            unidadeText={`LOPES ${p.pessoa?.unidade_id || "DIGITAL"}`}
            fotoUrl={foto}
          />
        ) : (
          <SlideProgressaoPromocao
            nome={nome}
            cargoAnterior={p.cargo_anterior || "CORRETOR(A)"}
            cargoAtual={p.cargo_novo || "LIDERANÇA"}
            mensagem={p.mensagem || "Novos desafios, mais conquistas. Parabéns por mais essa evolução!"}
            fotoUrl={foto}
          />
        )}
        
        {/* Navigation buttons for admin/manual override */}
        {slides.length > 1 && (
          <>
            {[[-1, "←"], [1, "→"]].map(([dir, lbl]) => {
              const isDark = slide.subType !== "signature";
              const bg = isDark ? "rgba(0,0,0,.08)" : "rgba(255,255,255,.08)";
              const bgHover = isDark ? "rgba(0,0,0,.15)" : "rgba(255,255,255,.15)";
              const border = isDark ? "rgba(0,0,0,.12)" : "rgba(255,255,255,.12)";
              const color = isDark ? "rgba(0,0,0,.6)" : "rgba(255,255,255,.6)";
              const colorHover = isDark ? "#000" : "#fff";

              return (
                <button
                  key={String(lbl)}
                  onClick={() => goTo((slideIdx + slides.length + (dir as number)) % slides.length)}
                  style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [dir === -1 ? "left" : "right"]: 12, background: bg, border: `1px solid ${border}`, color: color, borderRadius: 10, width: 36, height: 36, cursor: "pointer", fontSize: 16, fontFamily: "monospace", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)", transition: "all 200ms ease" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = bgHover; (e.currentTarget as HTMLElement).style.color = colorHover; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = bg; (e.currentTarget as HTMLElement).style.color = color; }}
                >
                  {lbl}
                </button>
              );
            })}
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="placar-root" style={{ background: slide.type.includes("ranking") ? "radial-gradient(ellipse at 30% 50%,#080818 0%,#000 70%)" : "#0a0a0a" }}>
        <Sidebar unit={unitInfo} />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
          <div key={key} style={{ flex: 1, display: "flex" }}>
            {slide.type === "meta" && <SlideMeta slide={slide as SlideMeta} />}
            {slide.type === "pvenda" && <SlidePVenda slide={slide as SlidePVenda} />}
            {slide.type === "ranking" && <SlideRanking slide={slide as SlideRanking} />}
            {slide.type === "ranking_pasta" && <SlideRankingPastas slide={slide as SlideRankingPastas} />}
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
