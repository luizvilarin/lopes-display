import { useState, useEffect } from "react";

const IMOVEIS_SLIDE = [
  {
    id: 1,
    title: "Residencial Marista Prime",
    subtitle: "Apartamentos de 3 e 4 suítes",
    price: "A partir de R$ 890.000",
    area: "142 m²",
    rooms: "3 suítes + home office",
    garage: "3 vagas cobertas",
    address: "Setor Marista, Goiânia — GO",
    tag: "LANÇAMENTO",
    gradient: "linear-gradient(135deg, #060e1a 0%, #0d2340 40%, #1a3d6b 100%)",
    accent: "#2952a3",
  },
  {
    id: 2,
    title: "Ofertão Bueno — Cobertura",
    subtitle: "Oportunidade única no setor mais nobre",
    price: "R$ 2.200.000",
    area: "320 m²",
    rooms: "4 suítes + terraço gourmet",
    garage: "4 vagas",
    address: "Setor Bueno, Goiânia — GO",
    tag: "OFERTÃO",
    gradient: "linear-gradient(135deg, #100500 0%, #3d1a00 40%, #7a3500 100%)",
    accent: "#a33800",
  },
  {
    id: 3,
    title: "Jardim Goiás — Penthouse",
    subtitle: "Exclusividade e sofisticação no melhor setor",
    price: "R$ 4.500.000",
    area: "680 m²",
    rooms: "5 suítes + piscina privativa",
    garage: "5 vagas",
    address: "Jardim Goiás, Goiânia — GO",
    tag: "EXCLUSIVO",
    gradient: "linear-gradient(135deg, #0a0a00 0%, #1a1a00 40%, #3d3d00 100%)",
    accent: "#6b6b00",
  },
];

function ProgressBar({ current, total, duration }: { current: number; total: number; duration: number }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          height: 3, flex: 1, borderRadius: 2,
          background: i < current ? "#E30613" : i === current ? "rgba(255,255,255,0.30)" : "rgba(255,255,255,0.15)",
          overflow: "hidden", position: "relative",
        }}>
          {i === current && (
            <div style={{
              position: "absolute", inset: 0,
              background: "#E30613",
              transformOrigin: "left",
              animation: `progressFill ${duration}ms linear forwards`,
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

export function PlayerFullscreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showUI, setShowUI] = useState(true);
  const SLIDE_DURATION = 6000;

  const slide = IMOVEIS_SLIDE[currentSlide];

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % IMOVEIS_SLIDE.length);
        setIsTransitioning(false);
      }, 500);
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [currentSlide]);

  useEffect(() => {
    const hideTimer = setTimeout(() => setShowUI(false), 4000);
    const handleMove = () => {
      setShowUI(true);
      clearTimeout(hideTimer);
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("click", handleMove);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("click", handleMove);
    };
  }, []);

  return (
    <div
      className="dark"
      style={{
        width: "100vw", height: "100vh",
        overflow: "hidden", position: "relative",
        background: "#000",
        fontFamily: "'DM Sans', sans-serif",
        cursor: showUI ? "auto" : "none",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700;800&family=Barlow+Condensed:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(32px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes progressFill {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes tvSlideIn {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .slide-content {
          animation: fadeSlideUp 600ms cubic-bezier(0.25,0.46,0.45,0.94) both;
        }
        .info-row {
          display: flex;
          align-items: center;
          gap: 12px;
          animation: tvSlideIn 500ms cubic-bezier(0.25,0.46,0.45,0.94) both;
        }
        .tag-badge {
          display: inline-block;
          padding: 5px 14px;
          border-radius: 8px;
          font-family: 'Barlow', sans-serif;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          border-radius: 12px;
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.10);
        }
        .fullscreen-trigger-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          border-radius: 9999px;
          background: rgba(255,255,255,0.15);
          color: white;
          font-family: 'Barlow', sans-serif;
          font-weight: 700;
          font-size: 15px;
          border: 1px solid rgba(255,255,255,0.25);
          cursor: pointer;
          backdrop-filter: blur(16px);
          transition: all 200ms ease;
          letter-spacing: 0.04em;
        }
        .fullscreen-trigger-btn:hover {
          background: #E30613;
          border-color: #E30613;
        }
        .nav-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          transition: all 300ms ease;
        }
      `}</style>

      {/* Full background */}
      <div style={{
        position: "absolute", inset: 0,
        background: slide.gradient,
        opacity: isTransitioning ? 0 : 1,
        transition: "opacity 500ms ease",
      }} />

      {/* Grid texture overlay */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `radial-gradient(circle at 80% 50%, ${slide.accent}40 0%, transparent 60%)`,
        pointerEvents: "none",
      }} />

      {/* Gradient overlay for text legibility */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(135deg, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.30) 60%, transparent 100%)",
        pointerEvents: "none",
      }} />

      {/* Decorative accent blob */}
      <div style={{
        position: "absolute", right: "10%", top: "15%",
        width: 500, height: 500, borderRadius: "50%",
        background: `radial-gradient(circle, ${slide.accent}30 0%, transparent 70%)`,
        pointerEvents: "none",
        transition: "all 500ms ease",
      }} />

      {/* Main content area */}
      <div style={{
        position: "absolute", inset: 0,
        padding: "80px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        opacity: isTransitioning ? 0 : 1,
        transition: "opacity 500ms ease",
      }}>

        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <div>
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900, fontSize: 36,
              color: "#E30613", letterSpacing: "0.08em",
            }}>LOPES</span>
          </div>

          {/* Progress bar */}
          <div style={{ flex: 1, maxWidth: 400, margin: "0 48px" }}>
            <ProgressBar current={currentSlide} total={IMOVEIS_SLIDE.length} duration={SLIDE_DURATION} />
          </div>

          {/* Live dot */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "#E30613",
              animation: "pulse 2s ease infinite",
              boxShadow: "0 0 8px rgba(227,6,19,0.80)",
            }} />
            <span style={{ color: "rgba(240,242,248,0.75)", fontSize: 13, fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.08em" }}>AO VIVO</span>
          </div>
        </div>

        {/* Center content */}
        <div className="slide-content" key={currentSlide} style={{ maxWidth: 720 }}>
          <div className="info-row" style={{ marginBottom: 20, animationDelay: "0ms" }}>
            <span className="tag-badge" style={{ background: "#E30613", color: "#fff" }}>{slide.tag}</span>
            <span style={{ color: "rgba(240,242,248,0.65)", fontSize: 15, fontFamily: "'DM Sans', sans-serif" }}>{slide.address}</span>
          </div>

          <h1 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900,
            fontSize: "clamp(48px, 5vw, 80px)",
            color: "#F0F2F8",
            letterSpacing: "-0.03em",
            lineHeight: 0.95,
            margin: "0 0 12px",
          }}>{slide.title}</h1>

          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 20, color: "rgba(240,242,248,0.70)",
            margin: "0 0 32px",
            fontWeight: 400,
          }}>{slide.subtitle}</p>

          <div style={{ color: "#E30613", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "clamp(32px, 3.5vw, 48px)", letterSpacing: "-0.02em", marginBottom: 32 }}>
            {slide.price}
          </div>

          {/* Meta info */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const, animationDelay: "200ms" }}>
            {[
              { icon: "⬛", label: slide.area },
              { icon: "🛏", label: slide.rooms },
              { icon: "🚗", label: slide.garage },
            ].map((item, i) => (
              <div key={i} className="meta-item" style={{ animationDelay: `${i * 80 + 200}ms` }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span style={{ color: "#B8BDCC", fontSize: 14, fontWeight: 500 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Slide indicators */}
          <div style={{ display: "flex", gap: 8 }}>
            {IMOVEIS_SLIDE.map((_, i) => (
              <button
                key={i}
                className="nav-dot"
                style={{
                  background: i === currentSlide ? "#E30613" : "rgba(255,255,255,0.30)",
                  width: i === currentSlide ? 28 : 10,
                  borderRadius: i === currentSlide ? 5 : "50%",
                }}
                onClick={() => { setIsTransitioning(true); setTimeout(() => { setCurrentSlide(i); setIsTransitioning(false); }, 400); }}
              />
            ))}
          </div>

          {/* Fullscreen button */}
          <button
            className="fullscreen-trigger-btn"
            onClick={() => document.documentElement.requestFullscreen?.()}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
            </svg>
            Tela Cheia
          </button>

          {/* Slide counter */}
          <div style={{ color: "rgba(240,242,248,0.45)", fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>
            {currentSlide + 1} / {IMOVEIS_SLIDE.length}
          </div>
        </div>

      </div>
    </div>
  );
}
