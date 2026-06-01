import React, { useState } from "react";

export function PinPad({
  onPinSubmit,
  onCancel,
  validating,
  error
}: {
  onPinSubmit: (pin: string) => void;
  onCancel: () => void;
  validating: boolean;
  error: string;
}) {
  const [pin, setPin] = useState("");

  const handleDigit = (d: string) => {
    if (pin.length < 6) setPin(pin + d);
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pin.length > 0 && !validating) {
      onPinSubmit(pin);
      setPin("");
    }
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "100%",
      maxWidth: 320
    }}>
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
        marginBottom: 32,
        height: 24
      }}>
        {pin.length === 0 ? (
          <span style={{ color: "#4A4F60", fontSize: 24, letterSpacing: 8 }}>••••</span>
        ) : (
          pin.split("").map((_, i) => (
            <div key={i} style={{
              width: 16, height: 16, borderRadius: "50%", background: "#E30613",
              boxShadow: "0 0 12px rgba(227,6,19,0.5)",
              animation: "scalePop 200ms cubic-bezier(0.34,1.56,0.64,1) both"
            }} />
          ))
        )}
      </div>

      {error && <div style={{ color: "#f87171", fontSize: 13, textAlign: "center", marginBottom: 16 }}>{error}</div>}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 16,
        width: "100%",
        marginBottom: 24
      }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={num}
            onClick={() => handleDigit(String(num))}
            disabled={validating}
            style={{
              height: 64,
              borderRadius: 32,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff",
              fontSize: 28,
              fontFamily: "'DM Sans', sans-serif",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
            onMouseDown={e => e.currentTarget.style.transform = "scale(0.95)"}
            onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
          >
            {num}
          </button>
        ))}
        
        <div />
        
        <button
          onClick={() => handleDigit("0")}
          disabled={validating}
          style={{
            height: 64,
            borderRadius: 32,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#fff",
            fontSize: 28,
            fontFamily: "'DM Sans', sans-serif",
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
          onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
          onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
          onMouseDown={e => e.currentTarget.style.transform = "scale(0.95)"}
          onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
        >
          0
        </button>

        <button
          onClick={handleBackspace}
          disabled={validating || pin.length === 0}
          style={{
            height: 64,
            borderRadius: 32,
            background: "transparent",
            border: "none",
            color: "rgba(255,255,255,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: pin.length === 0 ? "default" : "pointer",
            transition: "all 0.2s ease"
          }}
          onMouseOver={e => pin.length > 0 && (e.currentTarget.style.color = "#fff")}
          onMouseOut={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}
          onMouseDown={e => pin.length > 0 && (e.currentTarget.style.transform = "scale(0.95)")}
          onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
            <line x1="18" y1="9" x2="12" y2="15"></line>
            <line x1="12" y1="9" x2="18" y2="15"></line>
          </svg>
        </button>
      </div>

      <div style={{ display: "flex", gap: 10, width: "100%" }}>
        <button type="button" disabled={validating} onClick={onCancel} style={{ flex: 1, padding: "16px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: 32, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 16, opacity: validating ? 0.5 : 1, transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>Cancelar</button>
        <button type="button" disabled={validating || pin.length === 0} onClick={() => handleSubmit()} style={{ flex: 1, padding: "16px", background: "#E30613", border: "none", color: "#fff", borderRadius: 32, cursor: validating || pin.length === 0 ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 16, opacity: validating || pin.length === 0 ? 0.5 : 1, transition: "filter 0.2s" }} onMouseOver={e => !validating && pin.length > 0 && (e.currentTarget.style.filter = "brightness(1.1)")} onMouseOut={e => e.currentTarget.style.filter = "none"}>{validating ? "Validando..." : "Acessar"}</button>
      </div>
    </div>
  );
}
