import React from "react";
import logoBranca from "@/assets/logo-branca.png";

interface Props {
  nome: string;
  unidadeText: string;
  fotoUrl?: string;
}

export function SlideProgressaoSignature({ nome, unidadeText, fotoUrl }: Props) {
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Pinyon+Script&display=swap');
    .gold-text {
      background: linear-gradient(90deg, #d4af37, #f3e5ab, #d4af37);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  `;

  return (
    <div style={{ width: "100%", height: "100%", background: "#050505", display: "flex", color: "#fff", position: "relative", overflow: "hidden", fontFamily: "'Barlow', sans-serif" }}>
      <style>{css}</style>
      
      {/* Left Content (~45%) */}
      <div style={{ flex: "0 0 45%", padding: "8% 6% 8% 8%", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", zIndex: 5 }}>
        
        {/* Header Logo */}
        <div className="slide-up" style={{ marginBottom: 60, animationDelay: "0.2s", opacity: 0, animationFillMode: "forwards" }}>
          <div style={{ fontSize: 24, letterSpacing: "0.5em", color: "#d4af37", marginBottom: -15, marginLeft: 8, fontWeight: 300 }}>LOPES</div>
          <div className="gold-text" style={{ fontFamily: "'Pinyon Script', cursive", fontSize: 130, lineHeight: 1, paddingRight: 20 }}>Signature</div>
        </div>

        {/* Labels */}
        <div className="slide-up" style={{ animationDelay: "0.4s", opacity: 0, animationFillMode: "forwards", marginBottom: 35 }}>
          <div style={{ fontSize: 18, letterSpacing: "0.2em", color: "rgba(255,255,255,0.6)", fontWeight: 300 }}>NOVO MEMBRO</div>
          <div style={{ fontSize: 18, letterSpacing: "0.2em", color: "rgba(255,255,255,0.6)", fontWeight: 300, marginTop: 6 }}>BEM-VINDO AO TIME</div>
        </div>

        <div className="slide-up" style={{ animationDelay: "0.5s", opacity: 0, animationFillMode: "forwards", width: 60, height: 2, background: "#d4af37", marginBottom: 35 }} />

        {/* Name */}
        <div className="slide-up" style={{ animationDelay: "0.6s", opacity: 0, animationFillMode: "forwards", marginBottom: 50 }}>
          <h1 className="gold-text" style={{ fontSize: 90, fontWeight: 300, letterSpacing: "0.15em", textTransform: "uppercase", margin: 0 }}>
            {nome}
          </h1>
        </div>

        {/* Unit */}
        <div className="slide-up" style={{ animationDelay: "0.7s", opacity: 0, animationFillMode: "forwards", marginBottom: 50 }}>
          <div style={{ fontSize: 14, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", marginBottom: 8, fontWeight: 400 }}>UNIDADE</div>
          <div className="gold-text" style={{ fontSize: 26, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 400 }}>
            {unidadeText}
          </div>
        </div>

        {/* Message */}
        <div className="slide-up" style={{ animationDelay: "0.8s", opacity: 0, animationFillMode: "forwards", marginBottom: "auto" }}>
          <p style={{ fontSize: 20, color: "rgba(255,255,255,0.6)", maxWidth: 450, lineHeight: 1.6, fontWeight: 300 }}>
            Parabéns por fazer parte do time<br/>
            de especialistas em imóveis de alto padrão.
          </p>
        </div>

        {/* Bottom Logo */}
        <div className="fade-in" style={{ animationDelay: "1s", opacity: 0, animationFillMode: "forwards" }}>
          <img src={logoBranca} alt="Lopes" style={{ height: 40, opacity: 0.9 }} />
        </div>
      </div>

      {/* Right Photo (~55%) */}
      <div className="fade-in" style={{ flex: 1, position: "relative", animationDelay: "0.3s", opacity: 0, animationFillMode: "forwards", overflow: "hidden" }}>
        
        {/* Extreme gradient mask for the image edge blending perfectly to black */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, #050505 0%, transparent 40%, transparent 100%)", zIndex: 2 }} />
        
        {fotoUrl ? (
          <img src={fotoUrl} alt={nome} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 80, color: "#333", fontWeight: 300 }}>{nome.substring(0, 2).toUpperCase()}</span>
          </div>
        )}
      </div>

      {/* Golden curve element on the absolute right edge overlapping everything */}
      <svg width="150" height="100%" viewBox="0 0 100 800" preserveAspectRatio="none" style={{ position: "absolute", right: 0, top: 0, zIndex: 10, pointerEvents: "none", opacity: 0, animation: "fadeIn 1s forwards 0.5s" }}>
        <path d="M100,-50 C-10,150 -50,400 10,650 C40,750 100,850 100,850" fill="none" stroke="url(#goldGrad)" strokeWidth="4" />
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d4af37" />
            <stop offset="50%" stopColor="#f3e5ab" />
            <stop offset="100%" stopColor="#d4af37" />
          </linearGradient>
        </defs>
      </svg>

    </div>
  );
}
