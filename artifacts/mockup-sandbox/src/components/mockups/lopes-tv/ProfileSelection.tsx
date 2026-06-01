import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logoBranca from "@/assets/logo-branca.png";
import faviconLopes from "@/assets/favicon-lopes.png";
import { placarService } from "@/services/placarService";
import type { Unidade } from "@/types/placar";
import { PinPad } from "@/components/common/PinPad";

const FALLBACK_GRADIENTS: Record<string, string> = {
  "marista": "linear-gradient(135deg,#1a2744,#2d3f6b)",
  "bueno": "linear-gradient(135deg,#0d3524,#1a5c3e)",
  "jd-goias": "linear-gradient(135deg,#3d1a00,#7a3500)",
  "oeste": "linear-gradient(135deg,#1a0030,#3d006b)",
};

export function ProfileSelection() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [loading, setLoading] = useState(true);

  // Admin PIN State
  const [showPin, setShowPin] = useState(false);
  const [pinErr, setPinErr] = useState("");
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await placarService.getUnidades();
        setUnidades(list);
      } catch (e) {
        console.error("Erro ao buscar unidades no ProfileSelection:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSelect = (id: string) => {
    setSelected(id);
    if (id === "admin") {
      setTimeout(() => {
        setShowPin(true);
        setSelected(null);
      }, 300);
      return;
    }

    setTimeout(() => {
      // Salvamos o ID da unidade em ambas as chaves para unificação
      localStorage.setItem("lopes_selected_unit", id);
      localStorage.setItem("lopes_active_unit", id);
      navigate("/hub");
    }, 600);
  };

  const handlePinSubmit = async (submittedPin: string) => {
    if (validating) return;
    
    setValidating(true);
    setPinErr("");
    try {
      const dbPin = await placarService.getAdminPin();
      if (submittedPin === dbPin) {
        localStorage.setItem("lopes_admin_logged", "true");
        navigate("/admin");
      } else {
        setPinErr("PIN Incorreto");
      }
    } catch (err) {
      console.error("Erro ao validar PIN:", err);
      setPinErr("Erro na rede. Tente de novo.");
    } finally {
      setValidating(false);
    }
  };

  const allProfiles = [
    ...unidades.map(u => ({
      id: u.id,
      name: u.nome,
      initial: u.nome.substring(0, 2).toUpperCase(),
      gradient: FALLBACK_GRADIENTS[u.id] || "linear-gradient(135deg, #333 0%, #000 100%)"
    })),
    {
      id: "admin",
      name: "Administrativo",
      initial: "ADM",
      gradient: "linear-gradient(135deg, #E30613 0%, #8A0008 100%)",
    }
  ];

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
      {/* Google Fonts & CSS */}
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
          width: 140px;
          height: 140px;
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
        }
        .profile-avatar.selected {
          border-color: #E30613;
          box-shadow: 0 0 24px rgba(227,6,19,0.35), 0 0 48px rgba(227,6,19,0.15);
          animation: glowPulse 2s ease infinite;
        }
        .profile-label {
          margin-top: 16px;
          font-size: 16px;
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
          font-size: 48px;
          color: rgba(255,255,255,0.90);
          letter-spacing: -0.02em;
          user-select: none;
        }
        .headline {
          font-family: 'Barlow', 'Helvetica Neue', sans-serif;
          font-weight: 700;
          font-size: 32px;
          color: #F0F2F8;
          letter-spacing: -0.02em;
          animation: fadeSlideUp 500ms cubic-bezier(0.25,0.46,0.45,0.94) both;
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
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#72788A", letterSpacing: "0.16em", textTransform: "uppercase" }}>Plataforma Digital</span>
      </div>

      {/* Main content */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 48 }}>
        <h1 className="headline">Quem está acessando?</h1>

        {/* Profiles grid */}
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 140 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid rgba(255,255,255,.1)", borderTopColor: "#E30613", animation: "glowPulse 1s linear infinite" }} />
          </div>
        ) : (
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "28px",
            maxWidth: 900,
          }}>
            {allProfiles.map((profile, i) => (
              <div
                key={profile.id}
                className="profile-card"
                style={{ animationDelay: `${i * 80}ms` }}
                onMouseEnter={() => setHovered(profile.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => handleSelect(profile.id)}
              >
                <div
                  className={`profile-avatar ${selected === profile.id ? "selected" : ""}`}
                  style={{
                    background: profile.gradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 140,
                    height: 140,
                    filter: selected === profile.id ? "brightness(1.3)" : "brightness(1)",
                    border: profile.id === "admin" && hovered === "admin" ? "3px solid #E30613" : undefined,
                  }}
                >
                  {profile.id === "admin" ? (
                    <div style={{ width: 44, height: 44, background: "#fff", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <img src={faviconLopes} alt="Admin" style={{ height: 24, filter: "brightness(0)" }} />
                    </div>
                  ) : (
                    <img src={faviconLopes} alt={profile.name} style={{ height: 60, filter: "brightness(0) invert(1)" }} />
                  )}
                </div>
                <span className="profile-label" style={{ color: profile.id === "admin" ? "#E30613" : undefined, fontWeight: profile.id === "admin" ? 700 : undefined }}>{profile.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin PIN Modal */}
      {showPin && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: 40, width: "100%", maxWidth: 360, animation: "scalePop 300ms cubic-bezier(0.34,1.56,0.64,1) both", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "#E30613", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <img src={faviconLopes} alt="Admin" style={{ height: 26, filter: "brightness(0) invert(1)" }} />
            </div>
            <h2 style={{ fontFamily: "'Barlow', sans-serif", fontSize: 24, fontWeight: 800, marginBottom: 8, color: "#FFF" }}>Acesso Restrito</h2>
            <p style={{ color: "#72788A", fontSize: 14, marginBottom: 24, textAlign: "center" }}>Insira o PIN de administrador</p>
            
            <PinPad
              onPinSubmit={handlePinSubmit}
              onCancel={() => setShowPin(false)}
              validating={validating}
              error={pinErr}
            />
          </div>
        </div>
      )}

      {/* Bottom hint */}
      <div style={{
        position: "absolute", bottom: 32,
        color: "#4A4F60", fontSize: 13, fontFamily: "'DM Sans', sans-serif",
        letterSpacing: "0.04em",
      }}>
        Selecione um perfil para continuar
      </div>
    </div>
  );
}
