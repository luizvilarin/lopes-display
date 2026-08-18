import React from "react";
import logoBranca from "@/assets/logo-branca.png";

interface Props {
  nome: string;
  cargoAnterior: string;
  cargoAtual: string;
  mensagem: string;
  fotoUrl?: string;
}

export function SlideProgressaoPromocao({ nome, cargoAnterior, cargoAtual, mensagem, fotoUrl }: Props) {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", color: "#111", position: "relative", overflow: "hidden", fontFamily: "'DM Sans', sans-serif" }}>
      
      {/* Main Card Wrapper */}
      <div style={{ width: "100%", maxWidth: 1200, aspectRatio: "16/9", display: "flex", gap: 60, position: "relative", zIndex: 5, padding: "40px" }}>
        
        {/* Left Side: Photo Frame (~40%) */}
        <div className="slide-up" style={{ width: "40%", height: "100%", borderRadius: 40, overflow: "hidden", position: "relative", background: "#f0f0f0", boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}>
          {fotoUrl ? (
            <img src={fotoUrl} alt={nome} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 100, color: "#ccc", fontWeight: 700 }}>
              {nome.substring(0, 2).toUpperCase()}
            </div>
          )}
          
          {/* Black floating heart logo badge */}
          <div style={{ position: "absolute", bottom: 20, left: 20, width: 80, height: 80, background: "#0a0a0a", borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="#fff"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </div>
        </div>

        {/* Right Side: Content (~60%) */}
        <div style={{ width: "60%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 50 }}>
            <div>
              <div className="slide-up" style={{ fontSize: 16, fontWeight: 800, color: "#E30613", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10 }}>
                PROGRESSÃO DE CARREIRA
              </div>
              <div className="slide-up" style={{ width: 40, height: 4, background: "#E30613", borderRadius: 2 }} />
            </div>
            
            <div className="fade-in" style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.2em", color: "#333", paddingTop: 4 }}>
              GRUPO LOPES
            </div>
          </div>

          {/* Name & Subtitle */}
          <div className="slide-up" style={{ animationDelay: "0.2s", marginBottom: 40 }}>
            <h1 style={{ fontSize: 72, fontWeight: 800, margin: 0, lineHeight: 1, color: "#111", letterSpacing: "-0.02em" }}>
              {nome}
            </h1>
            <div style={{ fontSize: 20, fontWeight: 500, color: "#666", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 12 }}>
              {cargoAnterior}
            </div>
          </div>

          {/* Progress Arrow section */}
          <div className="slide-up" style={{ animationDelay: "0.3s", marginBottom: 40 }}>
            <div style={{ width: "100%", height: 1, background: "#e5e5e5", marginBottom: 20 }} />
            
            <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#999", marginBottom: 6 }}>ANTES</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#111", textTransform: "uppercase" }}>{cargoAnterior}</div>
              </div>
              
              <div style={{ color: "#E30613", fontSize: 24, fontWeight: 300 }}>→</div>
              
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#E30613", marginBottom: 6 }}>AGORA</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#111", textTransform: "uppercase" }}>{cargoAtual}</div>
              </div>
            </div>

            <div style={{ width: "100%", height: 1, background: "#e5e5e5", marginTop: 20 }} />
          </div>

          {/* Message */}
          <div className="slide-up" style={{ animationDelay: "0.4s", marginBottom: 50 }}>
            <p style={{ fontSize: 18, fontWeight: 600, color: "#111", lineHeight: 1.4, margin: 0, maxWidth: "90%" }}>
              Novos desafios, mais conquistas.<br/>
              Parabéns por mais essa evolução!
            </p>
          </div>

          {/* Footer Badge inside the card */}
          <div className="slide-up" style={{ animationDelay: "0.5s", marginTop: "auto", display: "inline-flex", alignItems: "center", background: "#0a0a0a", borderRadius: 999, padding: "14px 28px", alignSelf: "flex-start", gap: 20 }}>
            <img src={logoBranca} alt="Lopes" style={{ height: 22 }} />
            <div style={{ width: 1, height: 26, background: "rgba(255,255,255,0.2)" }} />
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.9)", fontWeight: 500, lineHeight: 1.4 }}>
              Certificada como uma das<br/>melhores empresas para se trabalhar.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
