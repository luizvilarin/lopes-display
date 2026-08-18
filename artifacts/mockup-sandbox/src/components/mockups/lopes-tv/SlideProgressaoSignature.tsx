import React from "react";
import logoBranca from "@/assets/logo-branca.png";

interface Props {
  nome: string;
  unidadeText: string;
  fotoUrl?: string;
}

export function SlideProgressaoSignature({ nome, unidadeText, fotoUrl }: Props) {
  // We can use an inline font import for the cursive Signature text if it's standalone,
  // but it's better if it's loaded in the parent CSS. We'll use a standard cursive fallback just in case.
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
      
      {/* Golden curve element on the right edge */}
      <svg width="120" height="100%" viewBox="0 0 100 800" preserveAspectRatio="none" style={{ position: "absolute", right: 0, top: 0, zIndex: 10 }}>
        <path d="M100,0 C-50,200 -50,600 100,800" fill="none" stroke="url(#goldGrad)" strokeWidth="3" />
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d4af37" />
            <stop offset="50%" stopColor="#f3e5ab" />
            <stop offset="100%" stopColor="#d4af37" />
          </linearGradient>
        </defs>
      </svg>

      {/* Left Content */}
      <div style={{ flex: 1, padding: "80px 100px", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", zIndex: 5 }}>
        
        {/* Header Logo */}
        <div className="slide-up" style={{ marginBottom: 60, animationDelay: "0.2s", opacity: 0, animationFillMode: "forwards" }}>
          <div style={{ fontSize: 16, letterSpacing: "0.4em", color: "#d4af37", marginBottom: -10, marginLeft: 5 }}>LOPES</div>
          <div style={{ fontFamily: "'Pinyon Script', cursive", fontSize: 80, color: "#d4af37", lineHeight: 1, className: "gold-text" }}>Signature</div>
        </div>

        {/* Labels */}
        <div className="slide-up" style={{ animationDelay: "0.4s", opacity: 0, animationFillMode: "forwards", marginBottom: 30 }}>
          <div style={{ fontSize: 14, letterSpacing: "0.2em", color: "rgba(255,255,255,0.7)" }}>NOVO MEMBRO</div>
          <div style={{ fontSize: 14, letterSpacing: "0.2em", color: "rgba(255,255,255,0.7)", marginTop: 4 }}>BEM-VINDO AO TIME</div>
        </div>

        <div className="slide-up" style={{ animationDelay: "0.5s", opacity: 0, animationFillMode: "forwards", width: 40, height: 2, background: "#d4af37", marginBottom: 30 }} />

        {/* Name */}
        <div className="slide-up" style={{ animationDelay: "0.6s", opacity: 0, animationFillMode: "forwards", marginBottom: 40 }}>
          <h1 className="gold-text" style={{ fontSize: 72, fontWeight: 300, letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>
            {nome}
          </h1>
        </div>

        {/* Unit */}
        <div className="slide-up" style={{ animationDelay: "0.7s", opacity: 0, animationFillMode: "forwards", marginBottom: 40 }}>
          <div style={{ fontSize: 12, letterSpacing: "0.15em", color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>UNIDADE</div>
          <div className="gold-text" style={{ fontSize: 20, letterSpacing: "0.15em", textTransform: "uppercase" }}>
            {unidadeText}
          </div>
        </div>

        {/* Message */}
        <div className="slide-up" style={{ animationDelay: "0.8s", opacity: 0, animationFillMode: "forwards", marginBottom: "auto" }}>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", maxWidth: 400, lineHeight: 1.6, fontWeight: 300 }}>
            Parabéns por fazer parte do time<br/>
            de especialistas em imóveis de alto padrão.
          </p>
        </div>

        {/* Bottom Logo */}
        <div className="fade-in" style={{ animationDelay: "1s", opacity: 0, animationFillMode: "forwards" }}>
          <img src={logoBranca} alt="Lopes" style={{ height: 32, opacity: 0.8 }} />
        </div>
      </div>

      {/* Right Photo */}
      <div className="fade-in" style={{ flex: 1, position: "relative", animationDelay: "0.3s", opacity: 0, animationFillMode: "forwards" }}>
        {/* Soft gradient mask for the image edge */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, #050505 0%, transparent 20%, transparent 100%)", zIndex: 2 }} />
        
        {fotoUrl ? (
          <img src={fotoUrl} alt={nome} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 64, color: "#333" }}>{nome.substring(0, 2).toUpperCase()}</span>
          </div>
        )}
      </div>
    </div>
  );
}
