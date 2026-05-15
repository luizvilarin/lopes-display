import { useState } from "react";
import logoBranca from "@/assets/logo-branca.png";

const PROFILES = [
  {
    id: "marista",
    name: "Marista",
    color: "#1a2744",
    initial: "M",
    gradient: "linear-gradient(135deg, #1a2744 0%, #2d3f6b 100%)",
  },
  {
    id: "bueno",
    name: "Bueno",
    color: "#0d3524",
    initial: "B",
    gradient: "linear-gradient(135deg, #0d3524 0%, #1a5c3e 100%)",
  },
  {
    id: "jardim",
    name: "Jardim Goiás",
    color: "#3d1a00",
    initial: "JG",
    gradient: "linear-gradient(135deg, #3d1a00 0%, #7a3500 100%)",
  },
  {
    id: "oeste",
    name: "Oeste",
    color: "#1a0030",
    initial: "O",
    gradient: "linear-gradient(135deg, #1a0030 0%, #3d006b 100%)",
  },
];

export function ProfileSelection() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelected(id);
    setTimeout(() => setSelected(null), 600);
  };

  return (
    <div
      className="dark"
      style={{
        minHeight: "100vh",
        background: "#0A0A0F",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700;800&family=Barlow+Condensed:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scalePop {
          from { opacity: 0; transform: scale(0.88); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 24px rgba(227,6,19,0.35), 0 0 48px rgba(227,6,19,0.15); }
          50% { box-shadow: 0 0 36px rgba(227,6,19,0.55), 0 0 72px rgba(227,6,19,0.25); }
        }

        .profile-card {
          animation: scalePop 400ms cubic-bezier(0.34,1.56,0.64,1) both;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          transition: transform 250ms cubic-bezier(0.34,1.56,0.64,1);
        }
        .profile-card:hover {
          transform: scale(1.08);
        }
        .profile-avatar {
          width: 160px;
          height: 160px;
          border-radius: 12px;
          border: 3px solid transparent;
          transition: border-color 200ms ease, box-shadow 250ms ease;
          overflow: hidden;
          position: relative;
          flex-shrink: 0;
        }
        .profile-card:hover .profile-avatar {
          border-color: #E30613;
          box-shadow: 0 0 24px rgba(227,6,19,0.35), 0 0 48px rgba(227,6,19,0.15);
          animation: glowPulse 2s ease infinite;
        }
        .profile-label {
          margin-top: 16px;
          font-size: 18px;
          font-weight: 500;
          color: #72788A;
          font-family: 'DM Sans', sans-serif;
          text-align: center;
          transition: color 200ms ease;
          white-space: nowrap;
        }
        .profile-card:hover .profile-label {
          color: #F0F2F8;
        }
        .initial-text {
          font-family: 'Barlow Condensed', 'Arial Narrow', sans-serif;
          font-weight: 800;
          font-size: 56px;
          color: rgba(255,255,255,0.90);
          letter-spacing: -0.02em;
          user-select: none;
        }
        .headline {
          font-family: 'Barlow', 'Helvetica Neue', sans-serif;
          font-weight: 700;
          font-size: 36px;
          color: #F0F2F8;
          letter-spacing: -0.02em;
          animation: fadeSlideUp 500ms cubic-bezier(0.25,0.46,0.45,0.94) both;
        }
        .lopes-logo {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 800;
          font-size: 28px;
          letter-spacing: 0.08em;
          color: #E30613;
        }
        .fullscreen-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 32px;
          border-radius: 9999px;
          background: #E30613;
          color: white;
          font-family: 'Barlow', sans-serif;
          font-weight: 700;
          font-size: 15px;
          letter-spacing: 0.04em;
          border: none;
          cursor: pointer;
          transition: background 200ms ease, transform 150ms ease, box-shadow 200ms ease;
          box-shadow: 0 4px 16px rgba(227,6,19,0.40);
          text-transform: uppercase;
          animation: fadeSlideUp 700ms cubic-bezier(0.25,0.46,0.45,0.94) both;
        }
        .fullscreen-btn:hover {
          background: #FF1A27;
          transform: scale(1.04);
          box-shadow: 0 8px 28px rgba(227,6,19,0.55);
        }
      `}</style>

      {/* Subtle grid background */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "radial-gradient(circle at 50% 0%, rgba(227,6,19,0.07) 0%, transparent 60%)",
      }} />

      {/* Top logo */}
      <div style={{ position: "absolute", top: 32, left: 40, display: "flex", alignItems: "center", gap: 10 }}>
        <img src={logoBranca} alt="Lopes" style={{ height: 24, objectFit: "contain" }} />
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#72788A", letterSpacing: "0.16em", textTransform: "uppercase" }}>Digital Signage</span>
      </div>

      {/* Main content */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 56 }}>
        <h1 className="headline">Qual unidade está exibindo?</h1>

        {/* Profiles grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 160px)",
          gap: "32px",
          maxWidth: 800,
        }}>
          {PROFILES.map((profile, i) => (
            <div
              key={profile.id}
              className="profile-card"
              style={{ animationDelay: `${i * 80}ms` }}
              onMouseEnter={() => setHovered(profile.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handleSelect(profile.id)}
            >
              <div
                className="profile-avatar"
                style={{
                  background: profile.gradient,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  filter: selected === profile.id ? "brightness(1.3)" : "brightness(1)",
                }}
              >
                <span className="initial-text">{profile.initial}</span>
              </div>
              <span className="profile-label">{profile.name}</span>
            </div>
          ))}
        </div>

        {/* Fullscreen button */}
        <button
          className="fullscreen-btn"
          onClick={() => document.documentElement.requestFullscreen?.()}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
          </svg>
          Iniciar Transmissão
        </button>
      </div>

      {/* Bottom hint */}
      <div style={{
        position: "absolute", bottom: 32,
        color: "#4A4F60", fontSize: 13, fontFamily: "'DM Sans', sans-serif",
        letterSpacing: "0.04em",
      }}>
        Selecione uma unidade para continuar
      </div>
    </div>
  );
}
