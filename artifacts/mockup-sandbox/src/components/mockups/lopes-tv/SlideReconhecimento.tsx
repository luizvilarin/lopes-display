import React, { useState, useEffect, useCallback, useMemo } from "react";
import logoBranca from "@/assets/logo-branca.png";
import type { RankingEntry, Pessoa } from "@/types/placar";

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ReconhecimentoItem {
  id: string;
  posicao: number;
  nome: string;
  cargoText: string;     // ex: "EQUIPE", "CORRETOR", "GERENTE"
  equipeText: string;    // ex: "EQUIPE LOBO", "LOPES JARDIM GOIÁS"
  foto_url?: string;
  instagram?: string;    // ex: "@equipelobo"
  valor?: string;        // ex: "R$ 1.850.000,00"
}

interface SlideReconhecimentoProps {
  corretores?: (RankingEntry & { pessoa?: Pessoa })[];
  gestores?: (RankingEntry & { pessoa?: Pessoa })[];
  activeTab?: "corretores" | "gestores";
  onTabChange?: (tab: "corretores" | "gestores") => void;
  onFinishedCycle?: () => void;
  standalone?: boolean;
}

// ─── Fallback Data (Matching Visual Reference 100%) ───────────────────────────

const DEFAULT_CORRETORES: ReconhecimentoItem[] = [
  {
    id: "c1",
    posicao: 1,
    nome: "LOBO",
    cargoText: "EQUIPE",
    equipeText: "EQUIPE LOBO",
    foto_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop",
    instagram: "@equipelobo",
    valor: "R$ 2.850.000,00"
  },
  {
    id: "c2",
    posicao: 2,
    nome: "FÊ N I X",
    cargoText: "EQUIPE",
    equipeText: "EQUIPE FÊNIX",
    foto_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1000&auto=format&fit=crop",
    instagram: "@equipefenix",
    valor: "R$ 2.410.000,00"
  },
  {
    id: "c3",
    posicao: 3,
    nome: "TITÃS",
    cargoText: "EQUIPE",
    equipeText: "EQUIPE TITÃS",
    foto_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1000&auto=format&fit=crop",
    instagram: "@equipetitas",
    valor: "R$ 1.980.000,00"
  },
  {
    id: "c4",
    posicao: 4,
    nome: "VALENTINA",
    cargoText: "CORRETORA",
    equipeText: "EQUIPE LOBO",
    foto_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1000&auto=format&fit=crop",
    instagram: "@valentina.lopes",
    valor: "R$ 1.720.000,00"
  },
  {
    id: "c5",
    posicao: 5,
    nome: "GUSTAVO",
    cargoText: "CORRETOR",
    equipeText: "EQUIPE ALPHA",
    foto_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop",
    instagram: "@gustavo.lopes",
    valor: "R$ 1.540.000,00"
  },
  {
    id: "c6",
    posicao: 6,
    nome: "CAMILA",
    cargoText: "CORRETORA",
    equipeText: "EQUIPE FÊNIX",
    foto_url: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1000&auto=format&fit=crop",
    instagram: "@camila.lopes",
    valor: "R$ 1.390.000,00"
  },
  {
    id: "c7",
    posicao: 7,
    nome: "RODRIGO",
    cargoText: "CORRETOR",
    equipeText: "EQUIPE TITÃS",
    foto_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop",
    instagram: "@rodrigo.lopes",
    valor: "R$ 1.280.000,00"
  },
  {
    id: "c8",
    posicao: 8,
    nome: "BEATRIZ",
    cargoText: "CORRETORA",
    equipeText: "EQUIPE LOBO",
    foto_url: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=1000&auto=format&fit=crop",
    instagram: "@beatriz.lopes",
    valor: "R$ 1.150.000,00"
  },
  {
    id: "c9",
    posicao: 9,
    nome: "MATHEUS",
    cargoText: "CORRETOR",
    equipeText: "EQUIPE ALPHA",
    foto_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1000&auto=format&fit=crop",
    instagram: "@matheus.lopes",
    valor: "R$ 1.020.000,00"
  },
  {
    id: "c10",
    posicao: 10,
    nome: "FERNANDA",
    cargoText: "CORRETORA",
    equipeText: "EQUIPE FÊNIX",
    foto_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop",
    instagram: "@fernanda.lopes",
    valor: "R$ 950.000,00"
  }
];

const DEFAULT_GESTORES: ReconhecimentoItem[] = [
  {
    id: "g1",
    posicao: 1,
    nome: "CARLOS",
    cargoText: "GERENTE",
    equipeText: "GESTOR - EQU. LOBO",
    foto_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop",
    instagram: "@carlos.gestor",
    valor: "R$ 5.400.000,00"
  },
  {
    id: "g2",
    posicao: 2,
    nome: "MARIANA",
    cargoText: "GERENTE",
    equipeText: "GESTORA - EQU. FÊNIX",
    foto_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop",
    instagram: "@mariana.gestora",
    valor: "R$ 4.850.000,00"
  },
  {
    id: "g3",
    posicao: 3,
    nome: "HENRIQUE",
    cargoText: "GERENTE",
    equipeText: "GESTOR - EQU. TITÃS",
    foto_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1000&auto=format&fit=crop",
    instagram: "@henrique.gestor",
    valor: "R$ 4.100.000,00"
  },
  {
    id: "g4",
    posicao: 4,
    nome: "PATRÍCIA",
    cargoText: "GERENTE",
    equipeText: "GESTORA - EQU. ALPHA",
    foto_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1000&auto=format&fit=crop",
    instagram: "@patricia.gestora",
    valor: "R$ 3.650.000,00"
  },
  {
    id: "g5",
    posicao: 5,
    nome: "EDUARDO",
    cargoText: "GERENTE",
    equipeText: "GESTOR - EQU. IMPÉRIO",
    foto_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop",
    instagram: "@eduardo.gestor",
    valor: "R$ 3.200.000,00"
  }
];

// Helper data format (DD • MM)
const getFormattedDateStr = () => {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day} • ${month}`;
};

// ─── Component Implementation ─────────────────────────────────────────────────

export function SlideReconhecimento({
  corretores: dbCorretores,
  gestores: dbGestores,
  activeTab: externalTab,
  onTabChange: externalOnTabChange,
  onFinishedCycle,
  standalone = true,
}: SlideReconhecimentoProps) {
  const [tab, setTab] = useState<"corretores" | "gestores">(externalTab || "corretores");
  const [itemIdx, setItemIdx] = useState(0);

  // Sync external tab if provided
  useEffect(() => {
    if (externalTab && externalTab !== tab) {
      setTab(externalTab);
      setItemIdx(0);
    }
  }, [externalTab]);

  const handleTabClick = (newTab: "corretores" | "gestores") => {
    setTab(newTab);
    setItemIdx(0);
    if (externalOnTabChange) externalOnTabChange(newTab);
  };

  // Convert DB entries to ReconhecimentoItem list or fallback
  const items = useMemo<ReconhecimentoItem[]>(() => {
    const rawList = tab === "corretores" ? dbCorretores : dbGestores;
    if (rawList && rawList.length > 0) {
      const mapped = rawList
        .filter(r => r.ativo !== false && r.pessoa)
        .sort((a, b) => a.posicao - b.posicao)
        .map(r => {
          const p = r.pessoa!;
          const nomeUpper = p.nome.toUpperCase();
          const firstWord = nomeUpper.split(" ")[0];
          return {
            id: r.id,
            posicao: r.posicao,
            nome: firstWord,
            cargoText: p.cargo === "gestor" ? "GERENTE" : "CORRETOR",
            equipeText: `LOPES ${p.unidade_id ? p.unidade_id.toUpperCase() : "DIGITAL"}`,
            foto_url: p.foto_url || "",
            instagram: `@${firstWord.toLowerCase()}.lopes`,
            valor: r.valor ? `R$ ${Number(r.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : undefined
          };
        });
      if (mapped.length > 0) return mapped;
    }
    return tab === "corretores" ? DEFAULT_CORRETORES : DEFAULT_GESTORES;
  }, [tab, dbCorretores, dbGestores]);

  const currentItem = items[itemIdx] || items[0];

  // Animation Step States: 1 (BG/Wireframe), 2 (Halo), 3 (Photo Emerge), 4 (Text Glide), 5 (Sheen)
  const [animStep, setAnimStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [fadingOut, setFadingOut] = useState(false);

  // Timing configuration
  // 1º lugar: 8 segundos; Outros (2º ao 10º/5º): 4 segundos
  const displayDuration = currentItem?.posicao === 1 ? 8000 : 4000;

  // Intro Sequence Orchestration
  useEffect(() => {
    setAnimStep(1);
    setFadingOut(false);

    const t2 = setTimeout(() => setAnimStep(2), 350);  // Halo grows
    const t3 = setTimeout(() => setAnimStep(3), 750);  // Photo emerges
    const t4 = setTimeout(() => setAnimStep(4), 1150); // Text slides up
    const t5 = setTimeout(() => setAnimStep(5), 1850); // Gold sheen pass

    // Start 1s Fade-Out before advancing to next slide
    const fadeOutTimer = setTimeout(() => {
      setFadingOut(true);
    }, Math.max(1000, displayDuration - 1000));

    // Next item transition
    const nextTimer = setTimeout(() => {
      setItemIdx(prev => {
        const next = prev + 1;
        if (next >= items.length) {
          if (onFinishedCycle) onFinishedCycle();
          return 0; // loop back to 1st
        }
        return next;
      });
    }, displayDuration);

    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(fadeOutTimer);
      clearTimeout(nextTimer);
    };
  }, [itemIdx, items.length, displayDuration, onFinishedCycle]);

  // Wireframe Rank Number string (ex: "01", "02" ... "10" or "1º")
  const rankNumStr = String(currentItem.posicao).padStart(2, "0");

  return (
    <div style={{
      width: "100%",
      height: standalone ? "100vh" : "100%",
      position: "relative",
      background: "#070709",
      overflow: "hidden",
      color: "#fff",
      fontFamily: "'Barlow', sans-serif",
      opacity: fadingOut ? 0 : 1,
      transition: "opacity 1000ms ease-in-out",
      userSelect: "none"
    }}>
      {/* ─── STYLES & KEYFRAMES ─── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800;900&family=DM+Sans:wght@400;500;700&display=swap');

        @keyframes haloPulse {
          0% { transform: translate(-50%, -50%) scale(0.4); opacity: 0; }
          60% { opacity: 0.95; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0.85; }
        }

        @keyframes photoEmerge {
          0% { transform: scale(0.91) translateY(24px); opacity: 0; filter: blur(14px); }
          100% { transform: scale(1) translateY(0); opacity: 1; filter: blur(0px); }
        }

        @keyframes textSlideUp {
          0% { transform: translateY(28px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }

        @keyframes goldSheenPass {
          0% { transform: translateX(-120%) skewX(-25deg); opacity: 0; }
          20% { opacity: 0.85; }
          80% { opacity: 0.85; }
          100% { transform: translateX(250%) skewX(-25deg); opacity: 0; }
        }

        @keyframes wireframeGlow {
          0%, 100% { opacity: 0.75; filter: drop-shadow(0 0 4px rgba(212,175,55,0.2)); }
          50% { opacity: 1; filter: drop-shadow(0 0 18px rgba(212,175,55,0.65)); }
        }
      `}</style>

      {/* ─── PASSO 1: FUNDO TEXTURIZADO E FIXOS ─── */}

      {/* Dark Luxury Vignette Noise */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse at 50% 40%, rgba(18,18,24,0.7) 0%, rgba(5,5,8,0.98) 80%, #050508 100%)",
        zIndex: 0
      }} />

      {/* Fine Dark Texture Grid/Grain */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: "radial-gradient(rgba(212, 175, 55, 0.08) 1px, transparent 0)",
        backgroundSize: "36px 36px",
        opacity: 0.35,
        zIndex: 0
      }} />

      {/* Giant Wireframe Rank Number (Top-Left Background) */}
      <div style={{
        position: "absolute",
        top: "2%",
        left: "3%",
        zIndex: 1,
        animation: "wireframeGlow 4s ease-in-out infinite",
        pointerEvents: "none"
      }}>
        <svg width="340" height="280" viewBox="0 0 340 280">
          <defs>
            <linearGradient id="goldWireframeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F3E5AB" />
              <stop offset="35%" stopColor="#D4AF37" />
              <stop offset="75%" stopColor="#AA7C11" />
              <stop offset="100%" stopColor="#4B3B10" />
            </linearGradient>
          </defs>
          <text
            x="10"
            y="220"
            fill="none"
            stroke="url(#goldWireframeGrad)"
            strokeWidth="2.2"
            fontFamily="'Barlow', sans-serif"
            fontWeight="900"
            fontSize="230"
            letterSpacing="-8"
            opacity="0.8"
          >
            {rankNumStr}
          </text>
        </svg>
      </div>

      {/* Top Right Header Date */}
      <div style={{
        position: "absolute",
        top: "42px",
        right: "52px",
        zIndex: 10,
        fontFamily: "'Barlow', sans-serif",
        fontWeight: 600,
        fontSize: "16px",
        letterSpacing: "0.25em",
        color: "#C5A059"
      }}>
        {getFormattedDateStr()}
      </div>

      {/* Top Tab Switcher (CORRETORES / GERENTES) */}
      <div style={{
        position: "absolute",
        top: "36px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 20,
        display: "flex",
        gap: 12,
        background: "rgba(10,10,14,0.75)",
        border: "1px solid rgba(197,160,89,0.30)",
        padding: "5px 6px",
        borderRadius: 9999,
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)"
      }}>
        <button
          onClick={() => handleTabClick("corretores")}
          style={{
            padding: "7px 20px",
            borderRadius: 9999,
            background: tab === "corretores" ? "linear-gradient(135deg, #C5A059 0%, #8A6D3B 100%)" : "transparent",
            color: tab === "corretores" ? "#FFFFFF" : "rgba(255,255,255,0.6)",
            border: "none",
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 800,
            fontSize: "12px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "all 300ms ease"
          }}
        >
          🏆 Top 10 Corretores
        </button>
        <button
          onClick={() => handleTabClick("gestores")}
          style={{
            padding: "7px 20px",
            borderRadius: 9999,
            background: tab === "gestores" ? "linear-gradient(135deg, #C5A059 0%, #8A6D3B 100%)" : "transparent",
            color: tab === "gestores" ? "#FFFFFF" : "rgba(255,255,255,0.6)",
            border: "none",
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 800,
            fontSize: "12px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "all 300ms ease"
          }}
        >
          👔 Top 5 Gerentes
        </button>
      </div>

      {/* ─── PASSO 2: HALO DE LUZ DOURADA (Cresce de trás/centro) ─── */}
      {animStep >= 2 && (
        <div style={{
          position: "absolute",
          left: "27%",
          top: "52%",
          width: "560px",
          height: "560px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(230, 190, 80, 0.42) 0%, rgba(184, 134, 11, 0.22) 35%, rgba(138, 95, 20, 0.08) 60%, transparent 75%)",
          filter: "blur(20px)",
          zIndex: 2,
          animation: "haloPulse 1200ms ease-out both"
        }} />
      )}

      {/* ─── PASSO 3: FOTO DO INDIVÍDUO (Emerging from Halo) ─── */}
      {animStep >= 3 && (
        <div style={{
          position: "absolute",
          left: "8%",
          bottom: 0,
          width: "42vw",
          height: "86vh",
          zIndex: 3,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          animation: "photoEmerge 900ms cubic-bezier(0.16, 1, 0.3, 1) both"
        }}>
          <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
            {currentItem.foto_url ? (
              <img
                src={currentItem.foto_url}
                alt={currentItem.nome}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center top",
                  filter: "drop-shadow(0 0 35px rgba(212,175,55,0.45))"
                }}
              />
            ) : (
              <div style={{
                width: "100%",
                height: "100%",
                background: "linear-gradient(180deg, rgba(30,30,40,0.8) 0%, rgba(10,10,15,0.95) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "120px",
                fontWeight: 900,
                color: "#C5A059"
              }}>
                {currentItem.nome.substring(0, 2)}
              </div>
            )}

            {/* Dark Vignette Bottom Blending for Photo */}
            <div style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, #070709 0%, transparent 25%)"
            }} />

            {/* ─── PASSO 5: BRILHO FINAL (Golden Sheen Pass over photo) ─── */}
            {animStep >= 5 && (
              <div style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: "-50%",
                width: "60%",
                background: "linear-gradient(90deg, transparent 0%, rgba(255, 235, 150, 0.45) 50%, transparent 100%)",
                zIndex: 4,
                animation: "goldSheenPass 1100ms ease-in-out both"
              }} />
            )}
          </div>
        </div>
      )}

      {/* ─── PASSO 4: BLOCO DE TEXTO À DIREITA (Slide Up & Fade In) ─── */}
      {animStep >= 4 && (
        <div style={{
          position: "absolute",
          left: "52%",
          top: "30%",
          zIndex: 10,
          animation: "textSlideUp 800ms cubic-bezier(0.16, 1, 0.3, 1) both"
        }}>
          {/* Label Superior ex: "EQUIPE" / "CORRETOR" */}
          <div style={{
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 700,
            fontSize: "15px",
            letterSpacing: "0.45em",
            color: "#C5A059",
            textTransform: "uppercase",
            marginBottom: "6px"
          }}>
            {currentItem.cargoText}
          </div>

          {/* Nome Gigante em Branco ex: "LOBO" */}
          <h1 style={{
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 900,
            fontSize: currentItem.nome.length > 10 ? "54px" : "78px",
            lineHeight: 1.0,
            color: "#FFFFFF",
            letterSpacing: "-0.02em",
            margin: "0 0 10px 0",
            textShadow: "0 4px 24px rgba(0, 0, 0, 0.85)"
          }}>
            {currentItem.nome}
          </h1>

          {/* Subtítulo / Equipe ex: "EQUIPE LOBO" */}
          <div style={{
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 600,
            fontSize: "15px",
            letterSpacing: "0.32em",
            color: "rgba(197, 160, 89, 0.85)",
            textTransform: "uppercase",
            marginBottom: "22px"
          }}>
            {currentItem.equipeText}
          </div>

          {/* Linha Divisora Dourada */}
          <div style={{
            width: "240px",
            height: "1px",
            background: "linear-gradient(90deg, #C5A059 0%, rgba(197, 160, 89, 0.25) 70%, transparent 100%)",
            marginBottom: "24px"
          }} />

          {/* Valor de Vendas / Destque Adicional (Se Houver) */}
          {currentItem.valor && (
            <div style={{
              marginBottom: "20px",
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 800,
              fontSize: "22px",
              color: "#FFF",
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}>
              <span style={{
                background: "rgba(197,160,89,0.18)",
                border: "1px solid #C5A059",
                color: "#C5A059",
                padding: "3px 10px",
                borderRadius: "6px",
                fontSize: "12px",
                letterSpacing: "0.1em"
              }}>VENDAS</span>
              <span>{currentItem.valor}</span>
            </div>
          )}

          {/* Instagram Handle ex: "@equipelobo" */}
          {currentItem.instagram && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              color: "rgba(255, 255, 255, 0.9)",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
              fontSize: "16px"
            }}>
              {/* Instagram Icon in Gold */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C5A059" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
              <span>{currentItem.instagram}</span>
            </div>
          )}
        </div>
      )}

      {/* ─── RODAPÉ FIXO DOURADO ─── */}
      <div style={{
        position: "absolute",
        bottom: "44px",
        left: "52%",
        right: "52px",
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderTop: "1px solid rgba(197, 160, 89, 0.35)",
        paddingTop: "14px"
      }}>
        <div style={{
          fontFamily: "'Barlow', sans-serif",
          fontWeight: 700,
          fontSize: "12px",
          letterSpacing: "0.32em",
          color: "rgba(255, 255, 255, 0.8)",
          textTransform: "uppercase"
        }}>
          R U M O &nbsp; A O &nbsp; T O P O
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ color: "rgba(197, 160, 89, 0.6)", fontSize: "14px" }}>|</span>
          <img
            src={logoBranca}
            alt="Lopes"
            style={{ height: "15px", objectFit: "contain", filter: "brightness(0) invert(1)", opacity: 0.9 }}
          />
        </div>
      </div>
    </div>
  );
}
