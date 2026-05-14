import { useState } from "react";

const CATEGORIES = [
  { id: "all", label: "Todos", icon: "◉" },
  { id: "placares", label: "Placares", icon: "🏆" },
  { id: "ofertao", label: "Ofertão", icon: "🔥" },
  { id: "lancamentos", label: "Lançamentos", icon: "✦" },
  { id: "cobertura", label: "Coberturas", icon: "◆" },
  { id: "comercial", label: "Comercial", icon: "◈" },
];

const HERO_BANNERS = [
  {
    id: "b1",
    title: "Residencial Marista Prime",
    subtitle: "A partir de R$ 890.000",
    tag: "LANÇAMENTO",
    tagColor: "#E30613",
    gradient: "linear-gradient(135deg, #0d2340 0%, #1a3d6b 60%, #2952a3 100%)",
    accent: "#2952a3",
  },
  {
    id: "b2",
    title: "Ofertão Bueno — Até 30% OFF",
    subtitle: "Oportunidades selecionadas",
    tag: "OFERTÃO",
    tagColor: "#B8040F",
    gradient: "linear-gradient(135deg, #1a0a00 0%, #5c2000 60%, #a33800 100%)",
    accent: "#a33800",
  },
];

const IMOVEIS = [
  { id: 1, title: "Apto 3Q — Marista", price: "R$ 580k", area: "98m²", type: "Apartamento", tag: "NOVO", gradient: "linear-gradient(160deg,#1a2744,#2d3f6b)" },
  { id: 2, title: "Casa Duplex — Bueno", price: "R$ 1,2M", area: "260m²", type: "Casa", tag: "OFERTA", gradient: "linear-gradient(160deg,#0d3524,#1a5c3e)" },
  { id: 3, title: "Cobertura — J. Goiás", price: "R$ 2,8M", area: "420m²", type: "Cobertura", tag: "EXCLUSIVO", gradient: "linear-gradient(160deg,#3d1a00,#7a3500)" },
  { id: 4, title: "Studio — Oeste", price: "R$ 320k", area: "42m²", type: "Studio", tag: "ÚLTIMO", gradient: "linear-gradient(160deg,#1a0030,#3d006b)" },
  { id: 5, title: "Flat — Marista Sul", price: "R$ 445k", area: "65m²", type: "Flat", tag: "NOVO", gradient: "linear-gradient(160deg,#001a2a,#003d5c)" },
  { id: 6, title: "Penthouse — Setor Sul", price: "R$ 4,5M", area: "680m²", type: "Penthouse", tag: "EXCLUSIVO", gradient: "linear-gradient(160deg,#1a1a00,#3d3d00)" },
];

const PLACARES = [
  { id: 1, unit: "Marista", visits: 142, sales: 8, conversion: "5.6%", trend: "up", gradient: "linear-gradient(135deg,#1a2744,#2d3f6b)" },
  { id: 2, unit: "Bueno", visits: 98, sales: 6, conversion: "6.1%", trend: "up", gradient: "linear-gradient(135deg,#0d3524,#1a5c3e)" },
  { id: 3, unit: "Jardim Goiás", visits: 76, sales: 3, conversion: "3.9%", trend: "down", gradient: "linear-gradient(135deg,#3d1a00,#7a3500)" },
  { id: 4, unit: "Oeste", visits: 63, sales: 5, conversion: "7.9%", trend: "up", gradient: "linear-gradient(135deg,#1a0030,#3d006b)" },
];

function TagBadge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: 8,
      background: color,
      color: "#fff",
      fontFamily: "'Barlow', sans-serif",
      fontWeight: 700,
      fontSize: 11,
      letterSpacing: "0.12em",
      textTransform: "uppercase" as const,
    }}>{label}</span>
  );
}

export function StreamingInterface() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeHero, setActiveHero] = useState(0);

  return (
    <div
      className="dark"
      style={{
        minHeight: "100vh",
        background: "#0A0A0F",
        color: "#F0F2F8",
        fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
        overflowX: "hidden",
        overflowY: "auto",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700;800&family=Barlow+Condensed:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

        @keyframes fadeSlideUp {
          from { opacity:0; transform:translateY(20px); }
          to { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity:0; }
          to { opacity:1; }
        }

        .content-card {
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 250ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 250ms ease;
          position: relative;
          flex-shrink: 0;
        }
        .content-card:hover {
          transform: scale(1.05) translateY(-4px);
          box-shadow: 0 16px 48px rgba(0,0,0,0.45), 0 6px 16px rgba(0,0,0,0.25);
          z-index: 10;
        }
        .content-card:hover .card-overlay {
          opacity: 1 !important;
        }
        .category-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          height: 44px;
          padding: 0 20px;
          border-radius: 9999px;
          font-family: 'Barlow', sans-serif;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          border: none;
          transition: all 200ms ease;
          white-space: nowrap;
        }
        .category-pill.active {
          background: #FFFFFF;
          color: #0A0A0F;
        }
        .category-pill.inactive {
          background: #1C1C24;
          color: #B8BDCC;
        }
        .category-pill.inactive:hover {
          background: #242430;
          color: #F0F2F8;
        }
        .hero-banner {
          border-radius: 20px;
          padding: 32px 36px 28px;
          min-height: 220px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: box-shadow 300ms ease, transform 250ms ease;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }
        .hero-banner:hover {
          box-shadow: 0 24px 64px rgba(0,0,0,0.50);
          transform: translateY(-2px);
        }
        .placar-card {
          background: #1C1C24;
          border-radius: 16px;
          padding: 20px;
          border: 1px solid #2A2A36;
          transition: all 200ms ease;
          cursor: pointer;
          flex-shrink: 0;
        }
        .placar-card:hover {
          background: #242430;
          border-color: rgba(227,6,19,0.30);
          transform: translateY(-2px);
        }
        .play-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 9999px;
          background: rgba(255,255,255,0.20);
          color: white;
          font-family: 'Barlow', sans-serif;
          font-weight: 600;
          font-size: 14px;
          border: none;
          cursor: pointer;
          backdrop-filter: blur(8px);
          transition: background 200ms ease;
          margin-top: 16px;
        }
        .play-btn:hover {
          background: #E30613;
        }
        .lopes-logo {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 800;
          font-size: 24px;
          letter-spacing: 0.08em;
          color: #E30613;
        }
        .navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(24px);
          background: rgba(10,10,15,0.97);
          border-bottom: 1px solid #1E1E28;
          height: 72px;
          display: flex;
          align-items: center;
          padding: 0 40px;
          gap: 32px;
        }
        .section-title {
          font-family: 'Barlow', sans-serif;
          font-weight: 700;
          font-size: 22px;
          color: #F0F2F8;
          letter-spacing: -0.01em;
          margin: 0 0 16px 0;
          animation: fadeSlideUp 400ms cubic-bezier(0.25,0.46,0.45,0.94) both;
        }
        .fullscreen-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 9999px;
          background: #E30613;
          color: white;
          font-family: 'Barlow', sans-serif;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.06em;
          border: none;
          cursor: pointer;
          transition: all 200ms ease;
          text-transform: uppercase;
          margin-left: auto;
        }
        .fullscreen-btn:hover {
          background: #FF1A27;
          box-shadow: 0 4px 16px rgba(227,6,19,0.40);
        }
        .nav-item {
          font-family: 'Barlow', sans-serif;
          font-weight: 600;
          font-size: 15px;
          color: #72788A;
          cursor: pointer;
          padding: 6px 2px;
          border-bottom: 2px solid transparent;
          transition: color 200ms ease, border-color 200ms ease;
        }
        .nav-item.active {
          color: #F0F2F8;
          border-bottom-color: #E30613;
        }
        .nav-item:hover {
          color: #B8BDCC;
        }
      `}</style>

      {/* Navbar */}
      <nav className="navbar">
        <span className="lopes-logo">LOPES</span>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <span className="nav-item active">Imóveis</span>
          <span className="nav-item">Lançamentos</span>
          <span className="nav-item">Placares</span>
        </div>

        <button
          className="fullscreen-btn"
          onClick={() => document.documentElement.requestFullscreen?.()}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
          </svg>
          Iniciar Transmissão
        </button>

        {/* Profile dot */}
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: "linear-gradient(135deg,#1a2744,#2d3f6b)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 15, color: "rgba(255,255,255,0.9)",
          border: "2px solid #E30613", cursor: "pointer",
        }}>M</div>
      </nav>

      {/* Main content */}
      <div style={{ padding: "28px 40px 40px", maxWidth: 1400, margin: "0 auto" }}>

        {/* Hero banners */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20, marginBottom: 32, animation: "fadeIn 600ms ease both" }}>
          {HERO_BANNERS.map((banner) => (
            <div
              key={banner.id}
              className="hero-banner"
              style={{ background: banner.gradient }}
            >
              {/* Noise overlay */}
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: "linear-gradient(to right, rgba(0,0,0,0.60) 0%, rgba(0,0,0,0.20) 60%, transparent 100%)",
              }} />
              {/* Decorative circle */}
              <div style={{
                position: "absolute", right: -40, bottom: -40,
                width: 240, height: 240, borderRadius: "50%",
                background: `radial-gradient(circle, ${banner.accent}80 0%, transparent 70%)`,
                pointerEvents: "none",
              }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <TagBadge label={banner.tag} color={banner.tagColor} />
                <h2 style={{
                  fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: 26,
                  color: "#F0F2F8", letterSpacing: "-0.02em", margin: "10px 0 4px",
                  lineHeight: 1.2,
                }}>{banner.title}</h2>
                <p style={{ color: "rgba(240,242,248,0.75)", fontSize: 15, margin: 0 }}>{banner.subtitle}</p>
                <button className="play-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5 3l14 9-14 9V3z"/>
                  </svg>
                  Ver Imóvel
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Category pills */}
        <div style={{ display: "flex", gap: 10, marginBottom: 28, overflowX: "auto", paddingBottom: 4 }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`category-pill ${activeCategory === cat.id ? "active" : "inactive"}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span style={{ fontSize: 13 }}>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Imóveis em Destaque */}
        <div style={{ marginBottom: 36 }}>
          <p className="section-title">Imóveis em Destaque</p>
          <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8 }}>
            {IMOVEIS.map((imovel, i) => (
              <div
                key={imovel.id}
                className="content-card"
                style={{
                  width: 180, minWidth: 180,
                  aspectRatio: "2/3",
                  background: imovel.gradient,
                  animationDelay: `${i * 60}ms`,
                }}
              >
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.20) 50%, transparent 100%)",
                  zIndex: 1,
                }} />
                <div className="card-overlay" style={{
                  position: "absolute", inset: 0,
                  background: "rgba(227,6,19,0.08)",
                  opacity: 0, zIndex: 2,
                  transition: "opacity 200ms ease",
                }} />
                {/* Tag */}
                <div style={{ position: "absolute", top: 10, left: 10, zIndex: 3 }}>
                  <TagBadge label={imovel.tag} color={imovel.tag === "NOVO" ? "#E30613" : imovel.tag === "OFERTA" ? "#B8040F" : "#0d3524"} />
                </div>
                {/* Info */}
                <div style={{ position: "absolute", bottom: 10, left: 10, right: 10, zIndex: 3 }}>
                  <div style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: 14, color: "#F0F2F8", lineHeight: 1.25, marginBottom: 4 }}>{imovel.title}</div>
                  <div style={{ color: "#E30613", fontWeight: 700, fontSize: 14, fontFamily: "'Barlow', sans-serif" }}>{imovel.price}</div>
                  <div style={{ color: "#72788A", fontSize: 12, marginTop: 2 }}>{imovel.area} · {imovel.type}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Placares */}
        <div>
          <p className="section-title">Placares de Vendas — Hoje</p>
          <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 4 }}>
            {PLACARES.map((p, i) => (
              <div key={p.id} className="placar-card" style={{ minWidth: 200 }}>
                {/* Header with gradient */}
                <div style={{
                  height: 6, borderRadius: 4,
                  background: p.gradient, marginBottom: 14,
                }} />
                <div style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: 16, color: "#F0F2F8", marginBottom: 12 }}>{p.unit}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#72788A", fontSize: 13 }}>Visitas</span>
                    <span style={{ color: "#F0F2F8", fontWeight: 700, fontSize: 18, fontFamily: "'Barlow', sans-serif" }}>{p.visits}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#72788A", fontSize: 13 }}>Vendas</span>
                    <span style={{ color: "#E30613", fontWeight: 800, fontSize: 20, fontFamily: "'Barlow Condensed', sans-serif" }}>{p.sales}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#72788A", fontSize: 13 }}>Conversão</span>
                    <span style={{ color: p.trend === "up" ? "#22c55e" : "#ef4444", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 4 }}>
                      {p.trend === "up" ? "▲" : "▼"} {p.conversion}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
