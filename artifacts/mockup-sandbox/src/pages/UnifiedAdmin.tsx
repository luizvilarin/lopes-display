import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminPanel } from "@/components/mockups/lopes-tv/AdminPanel";
import { PlacarAdmin } from "@/components/mockups/lopes-tv/PlacarAdmin";
import { placarService } from "@/services/placarService";
import logoBranca from "@/assets/logo-branca.png";
import faviconLopes from "@/assets/favicon-lopes.png";
import { Icons } from "@/components/common/Icons";

type UnifiedSection = 
  // Placar Sections
  | "metas" | "pvenda" | "rankings" | "pessoas"
  // Signage Sections
  | "imoveis" | "ofertao" | "display"
  // System
  | "senha";

export function UnifiedAdmin() {
  const navigate = useNavigate();
  const [section, setSection] = useState<UnifiedSection>("metas");

  const NAV_GROUPS = [
    {
      title: "Placar Envolvente",
      items: [
        { id: "metas",    label: "Metas",         icon: <Icons.Target /> },
        { id: "pvenda",   label: "Primeira Venda", icon: <Icons.Trophy /> },
        { id: "rankings", label: "Rankings",       icon: <Icons.Rocket /> },
        { id: "pessoas",  label: "Equipe",         icon: <Icons.Users /> },
      ]
    },
    {
      title: "Conteúdo Digital",
      items: [
        { id: "imoveis",  label: "Produtos",       icon: <Icons.Home /> },
        { id: "ofertao",  label: "Ofertão",        icon: <Icons.Timer /> },
        { id: "display",  label: "Config. TV",     icon: <Icons.TV /> },
      ]
    },
    {
      title: "Acesso",
      items: [
        { id: "senha",    label: "Alterar PIN",    icon: <Icons.Key /> },
      ]
    }
  ];

  const renderSection = () => {
    if (["metas", "pvenda", "rankings", "pessoas"].includes(section)) {
      return <PlacarAdmin activeSection={section} />;
    }
    if (["imoveis", "ofertao", "display"].includes(section)) {
      return <AdminPanel activeSection={section} />;
    }
    if (section === "senha") {
      return <SecuritySection />;
    }
    return null;
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#0A0A0F", color: "#F0F2F8", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <header style={{ height: 60, background: "#111118", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", padding: "0 24px", gap: 16, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "#E30613", display: "flex", alignItems: "center", justifyContent: "center", padding: 5 }}>
            <img src={faviconLopes} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", filter: "brightness(0) invert(1)" }} />
          </div>
          <img src={logoBranca} alt="Lopes" style={{ height: 20, objectFit: "contain", opacity: .9 }} />
        </div>
        <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.15)" }} />
        <span style={{ fontSize: 13, color: "#B8BDCC", letterSpacing: ".12em", textTransform: "uppercase", fontFamily: "'Barlow',sans-serif", fontWeight: 700 }}>
          Painel Unificado
        </span>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 12px", background: "#1C1C24", borderRadius: 8, border: "1px solid #2A2A36" }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: "linear-gradient(135deg,#E30613,#B8040F)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, color: "#fff" }}>A</div>
            <span style={{ fontSize: 13, fontFamily: "'Barlow',sans-serif", fontWeight: 600, color: "#fff" }}>admin</span>
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem("lopes_admin_logged");
              navigate("/");
            }} 
            style={{ background: "transparent", color: "#E30613", border: "1px solid rgba(227,6,19,0.3)", padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Barlow',sans-serif", textTransform: "uppercase" }}
          >
            Sair
          </button>
        </div>
      </header>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Unified Sidebar */}
        <aside style={{ width: 240, background: "#0D0D14", borderRight: "1px solid rgba(255,255,255,0.08)", padding: "20px 12px", display: "flex", flexDirection: "column", gap: 24, overflowY: "auto" }}>
          
          {NAV_GROUPS.map((group, idx) => (
            <div key={idx}>
              <div style={{ fontSize: 11, color: "#72788A", letterSpacing: ".16em", textTransform: "uppercase", fontFamily: "'Barlow',sans-serif", fontWeight: 700, padding: "0 12px 12px" }}>
                {group.title}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {group.items.map(item => {
                  const isActive = section === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSection(item.id as UnifiedSection)}
                      style={{
                        display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                        background: isActive ? "rgba(227,6,19,0.14)" : "transparent",
                        color: isActive ? "#fff" : "#B8BDCC",
                        border: "none", borderRadius: 10, cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: isActive ? 600 : 500,
                        transition: "all 150ms ease", textAlign: "left"
                      }}
                      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                    >
                      <span style={{ fontSize: 16 }}>{item.icon}</span>
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

        </aside>

        {/* Main Content Area */}
        <main style={{ flex: 1, background: "#0a0a0f", overflowY: "auto", position: "relative" }}>
          {renderSection()}
        </main>
      </div>
    </div>
  );
}

function SecuritySection() {
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; err: boolean } | null>(null);

  useEffect(() => {
    const fetchPin = async () => {
      try {
        const pin = await placarService.getAdminPin();
        setCurrentPin(pin);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPin();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin.trim()) return;
    setSaving(true);
    setMsg(null);
    try {
      await placarService.saveAdminPin(newPin.trim());
      setCurrentPin(newPin.trim());
      setNewPin("");
      setMsg({ text: "PIN alterado com sucesso!", err: false });
    } catch (err) {
      setMsg({ text: "Erro ao atualizar PIN no banco.", err: true });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, color: "#72788A" }}>Carregando informações de segurança...</div>
    );
  }

  return (
    <div style={{ padding: 40, maxWidth: 500 }}>
      <h1 style={{ fontSize: 28, fontFamily: "'Barlow', sans-serif", fontWeight: 800, marginBottom: 8 }}>Alterar PIN de Acesso</h1>
      <p style={{ color: "#72788A", fontSize: 14, marginBottom: 32 }}>A senha de administração protege a área de configurações e dados do painel.</p>

      <form onSubmit={handleSave} style={{ background: "#111118", padding: 24, borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 12, textTransform: "uppercase", color: "#72788A", fontWeight: 700, marginBottom: 8, letterSpacing: "0.05em" }}>PIN Atual</label>
          <div style={{ fontFamily: "monospace", fontSize: 16, background: "#1C1C24", padding: "12px 16px", borderRadius: 10, color: "#FFF", border: "1px solid rgba(255,255,255,0.05)", cursor: "not-allowed" }}>
            {currentPin}
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 12, textTransform: "uppercase", color: "#72788A", fontWeight: 700, marginBottom: 8, letterSpacing: "0.05em" }}>Novo PIN</label>
          <input
            type="text"
            placeholder="Digite o novo PIN"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            style={{ width: "100%", background: "#1C1C24", border: "1px solid rgba(255,255,255,0.15)", padding: "12px 16px", borderRadius: 10, color: "#fff", fontSize: 16, fontFamily: "inherit" }}
            required
          />
        </div>

        {msg && (
          <div style={{ marginBottom: 20, fontSize: 14, color: msg.err ? "#ef4444" : "#10b981", background: msg.err ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)", padding: "10px 16px", borderRadius: 8, border: `1px solid ${msg.err ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)"}` }}>
            {msg.text}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          style={{ width: "100%", padding: 14, background: "#E30613", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, cursor: saving ? "wait" : "pointer", opacity: saving ? 0.8 : 1, transition: "transform 150ms ease" }}
        >
          {saving ? "Salvando..." : "Salvar Novo PIN"}
        </button>
      </form>
    </div>
  );
}
