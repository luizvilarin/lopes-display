import { useState, useEffect, useRef, useCallback } from "react";

const DEFAULT_SECONDS = 600;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatTime(total: number) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return { h, m, s, str: `${pad(h)}:${pad(m)}:${pad(s)}` };
}

function CircleProgress({
  value,
  max,
  size,
  stroke,
  color,
  children,
}: {
  value: number;
  max: number;
  size: number;
  stroke: number;
  color: string;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const progress = max > 0 ? Math.max(0, value / max) : 0;
  const dash = circ * progress;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", position: "absolute", inset: 0 }}>
        {/* Track */}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        {/* Progress */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: "stroke-dasharray 0.9s cubic-bezier(0.25,0.46,0.45,0.94), stroke 0.5s ease" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        {children}
      </div>
    </div>
  );
}

function ConfigPanel({
  onApply,
  onClose,
  initialH, initialM, initialS,
  label1, label2, label3,
}: {
  onApply: (h: number, m: number, s: number, l1: string, l2: string, l3: string) => void;
  onClose: () => void;
  initialH: number; initialM: number; initialS: number;
  label1: string; label2: string; label3: string;
}) {
  const [h, setH] = useState(String(initialH));
  const [m, setM] = useState(String(initialM));
  const [s, setS] = useState(String(initialS));
  const [l1, setL1] = useState(label1);
  const [l2, setL2] = useState(label2);
  const [l3, setL3] = useState(label3);

  const today = new Date();
  const defaultDate = `${pad(today.getDate())}/${pad(today.getMonth() + 1)}/${today.getFullYear()}`;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.80)",
      backdropFilter: "blur(20px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <style>{`
        .cfg-input {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          color: #F0F2F8;
          padding: 14px 16px;
          border-radius: 14px;
          width: 100%;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          outline: none;
          transition: border-color 200ms ease;
        }
        .cfg-input:focus {
          border-color: rgba(227,6,19,0.60);
          background: rgba(255,255,255,0.08);
        }
        .cfg-input::placeholder { color: rgba(240,242,248,0.30); }
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
        .cfg-label {
          display: block;
          font-family: 'Barlow', sans-serif;
          font-weight: 700;
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(184,189,204,0.60);
          margin-bottom: 8px;
        }
        .save-btn {
          flex: 1; padding: 16px;
          border-radius: 14px;
          border: none; cursor: pointer;
          font-family: 'Barlow', sans-serif;
          font-weight: 800; font-size: 13px;
          letter-spacing: 0.10em; text-transform: uppercase;
          transition: all 200ms ease;
        }
        .save-btn.primary {
          background: #E30613; color: white;
        }
        .save-btn.primary:hover { background: #FF1A27; box-shadow: 0 4px 16px rgba(227,6,19,0.40); }
        .save-btn.secondary {
          background: rgba(255,255,255,0.08); color: #B8BDCC;
        }
        .save-btn.secondary:hover { background: rgba(255,255,255,0.12); }
      `}</style>

      <div style={{
        background: "#141418",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 28,
        padding: "36px 36px 32px",
        width: "100%", maxWidth: 440,
        boxShadow: "0 32px 80px rgba(0,0,0,0.55)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "rgba(227,6,19,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E30613" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 800, fontSize: 17, color: "#F0F2F8" }}>Ajustes do Painel</div>
            <div style={{ fontSize: 12, color: "#72788A", fontFamily: "'DM Sans', sans-serif" }}>Configure o temporizador e os blocos</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Timer */}
          <div>
            <label className="cfg-label">Duração do Temporizador</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <input className="cfg-input" type="number" placeholder="HH" value={h} min={0}
                onChange={e => setH(e.target.value)} style={{ textAlign: "center", fontSize: 20, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }} />
              <input className="cfg-input" type="number" placeholder="MM" value={m} min={0} max={59}
                onChange={e => setM(e.target.value)} style={{ textAlign: "center", fontSize: 20, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }} />
              <input className="cfg-input" type="number" placeholder="SS" value={s} min={0} max={59}
                onChange={e => setS(e.target.value)} style={{ textAlign: "center", fontSize: 20, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-around", marginTop: 4 }}>
              {["Horas", "Minutos", "Segundos"].map(t => (
                <span key={t} style={{ fontSize: 10, color: "#4A4F60", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.06em" }}>{t}</span>
              ))}
            </div>
          </div>

          <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.06)" }} />

          {/* Labels */}
          <div>
            <label className="cfg-label">Bloco 1 — Esquerdo</label>
            <input className="cfg-input" type="text" value={l1} onChange={e => setL1(e.target.value)} placeholder="Ex: Vendas" />
          </div>
          <div>
            <label className="cfg-label">Bloco 2 — Centro</label>
            <input className="cfg-input" type="text" value={l2} onChange={e => setL2(e.target.value)} placeholder="Ex: Meta Diária" />
          </div>
          <div>
            <label className="cfg-label">Bloco 3 — Direito (Data/Info)</label>
            <input className="cfg-input" type="text" value={l3} onChange={e => setL3(e.target.value)} placeholder={defaultDate} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
          <button className="save-btn primary" onClick={() => {
            onApply(parseInt(h) || 0, parseInt(m) || 0, parseInt(s) || 0, l1, l2, l3);
          }}>
            Salvar e Aplicar
          </button>
          <button className="save-btn secondary" onClick={onClose}>Voltar</button>
        </div>
      </div>
    </div>
  );
}

export function TimerOfertao() {
  const [totalSeconds, setTotalSeconds] = useState(DEFAULT_SECONDS);
  const [initialSeconds, setInitialSeconds] = useState(DEFAULT_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [label1, setLabel1] = useState("Vendas");
  const [label2, setLabel2] = useState("Meta Diária");
  const [label3, setLabel3] = useState(() => {
    const d = new Date();
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { h, m, s, str } = formatTime(totalSeconds);
  const isDone = totalSeconds <= 0;
  const isUrgent = totalSeconds > 0 && totalSeconds <= 60;
  const timeColor = isDone ? "#E30613" : isUrgent ? "#FF6B35" : "#F0F2F8";

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsRunning(false);
  }, []);

  const start = useCallback(() => {
    if (totalSeconds <= 0) return;
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setTotalSeconds(prev => {
        if (prev <= 1) { stop(); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, [totalSeconds, stop]);

  const toggle = () => { isRunning ? stop() : start(); };

  const reset = () => {
    stop();
    setTotalSeconds(initialSeconds);
  };

  const applyConfig = (h: number, m: number, s: number, l1: string, l2: string, l3: string) => {
    const sec = h * 3600 + m * 60 + s;
    stop();
    setInitialSeconds(sec);
    setTotalSeconds(sec);
    setLabel1(l1);
    setLabel2(l2);
    setLabel3(l3);
    setShowConfig(false);
  };

  useEffect(() => () => stop(), [stop]);

  // Hide menu after 3s inactivity
  useEffect(() => {
    if (!showMenu) return;
    const t = setTimeout(() => setShowMenu(false), 4000);
    return () => clearTimeout(t);
  }, [showMenu]);

  const initH = Math.floor(initialSeconds / 3600);
  const initM = Math.floor((initialSeconds % 3600) / 60);
  const initS = initialSeconds % 60;

  return (
    <div
      className="dark"
      style={{
        width: "100vw", height: "100vh",
        overflow: "hidden", position: "relative",
        background: "#000",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@700;800;900&family=Barlow+Condensed:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');

        @keyframes pulse-ring {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes urgentPulse {
          0%, 100% { text-shadow: 0 0 40px rgba(255,107,53,0.20); }
          50% { text-shadow: 0 0 80px rgba(255,107,53,0.60); }
        }
        @keyframes donePulse {
          0%, 100% { text-shadow: 0 0 40px rgba(227,6,19,0.30); }
          50% { text-shadow: 0 0 100px rgba(227,6,19,0.80); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(227,6,19,0); }
          50% { box-shadow: 0 0 0 8px rgba(227,6,19,0.15); }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes menuIn {
          from { opacity: 0; transform: scale(0.85) translateY(-8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .time-display {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 900;
          letter-spacing: -0.04em;
          line-height: 1;
          user-select: none;
          transition: color 500ms ease;
        }
        .time-display.urgent {
          animation: urgentPulse 1s ease infinite;
        }
        .time-display.done {
          animation: donePulse 0.8s ease infinite;
        }

        .info-block {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          backdrop-filter: blur(12px);
          padding: 20px 24px;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: background 300ms ease, border-color 300ms ease;
          animation: fadeSlideUp 500ms cubic-bezier(0.25,0.46,0.45,0.94) both;
        }
        .info-block:hover {
          background: rgba(255,255,255,0.09);
          border-color: rgba(255,255,255,0.14);
        }

        .ctrl-btn {
          width: 48px; height: 48px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.08);
          color: white;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 200ms ease;
          backdrop-filter: blur(8px);
        }
        .ctrl-btn:hover { background: rgba(255,255,255,0.15); }
        .ctrl-btn.primary {
          background: #E30613; border-color: #E30613;
          width: 56px; height: 56px;
          box-shadow: 0 4px 20px rgba(227,6,19,0.40);
        }
        .ctrl-btn.primary:hover { background: #FF1A27; box-shadow: 0 8px 28px rgba(227,6,19,0.55); }
        .ctrl-btn.primary:disabled { background: #333; border-color: #444; box-shadow: none; cursor: not-allowed; }

        .menu-popup {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          background: rgba(20,20,24,0.96);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 18px;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 180px;
          backdrop-filter: blur(24px);
          box-shadow: 0 16px 48px rgba(0,0,0,0.50);
          animation: menuIn 200ms cubic-bezier(0.34,1.56,0.64,1) both;
          z-index: 50;
        }
        .menu-popup-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 12px;
          cursor: pointer;
          color: #B8BDCC;
          font-family: 'Barlow', sans-serif;
          font-weight: 600;
          font-size: 14px;
          transition: all 150ms ease;
          border: none;
          background: none;
          width: 100%;
        }
        .menu-popup-item:hover {
          background: rgba(255,255,255,0.08);
          color: #F0F2F8;
        }
      `}</style>

      {/* Background — dramatic gradient */}
      <div style={{
        position: "absolute", inset: 0,
        background: isDone
          ? "radial-gradient(ellipse at 50% 50%, rgba(227,6,19,0.25) 0%, #000 60%)"
          : isUrgent
          ? "radial-gradient(ellipse at 50% 50%, rgba(255,107,53,0.20) 0%, #000 60%)"
          : "radial-gradient(ellipse at 50% 20%, rgba(227,6,19,0.10) 0%, rgba(10,10,15,1) 55%)",
        transition: "background 1s ease",
      }} />

      {/* Subtle scanline texture */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)",
      }} />

      {/* Top bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: 72,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900, fontSize: 28, color: "#E30613", letterSpacing: "0.06em",
          }}>LOPES</span>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.15)" }} />
          <span style={{
            fontFamily: "'Barlow', sans-serif", fontWeight: 700,
            fontSize: 13, color: "#72788A", letterSpacing: "0.14em", textTransform: "uppercase",
          }}>Ofertão</span>
        </div>
      </div>

      {/* Floating vertical control menu on the right side */}
      <div style={{
        position: "absolute",
        right: 24,
        top: "50%",
        transform: "translateY(-50%)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        alignItems: "center",
        zIndex: 100,
        background: "rgba(20,20,24,0.60)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        padding: "16px 12px",
        boxShadow: "0 24px 50px rgba(0,0,0,0.55)",
      }}>
        {/* Play/Pause */}
        <button
          className="ctrl-btn primary"
          onClick={toggle}
          disabled={isDone}
          title={isRunning ? "Pausar" : "Iniciar"}
          style={{ width: 48, height: 48, borderRadius: 14 }}
        >
          {isRunning ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 3l14 9-14 9V3z"/>
            </svg>
          )}
        </button>

        {/* Reset */}
        <button className="ctrl-btn" onClick={reset} title="Reiniciar" style={{ width: 42, height: 42, borderRadius: 12 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
          </svg>
        </button>

        {/* Settings */}
        <button className="ctrl-btn" onClick={() => { setShowConfig(true); setShowMenu(false); setIsRunning(false); stop(); }} title="Ajustes" style={{ width: 42, height: 42, borderRadius: 12 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>

        {/* Fullscreen */}
        <button className="ctrl-btn" onClick={() => document.documentElement.requestFullscreen?.()} title="Tela Cheia" style={{ width: 42, height: 42, borderRadius: 12 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
          </svg>
        </button>
      </div>

      {/* Center — main timer */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "80px 80px 120px",
        gap: 0,
      }}>

        {/* Ring clocks row */}
        <div style={{ display: "flex", alignItems: "center", gap: 32, marginBottom: 20 }}>
          {/* Hours */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <CircleProgress value={h} max={Math.max(initH, 1)} size={120} stroke={6} color={isDone ? "#E30613" : "#E30613"}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 36, color: timeColor, letterSpacing: "-0.03em", lineHeight: 1 }}>{pad(h)}</span>
            </CircleProgress>
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: 10, color: "#4A4F60", letterSpacing: "0.16em", textTransform: "uppercase" }}>Horas</span>
          </div>

          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 56, color: "rgba(255,255,255,0.20)", marginBottom: 28, animation: isRunning ? "pulse-ring 1s ease infinite" : "none" }}>:</span>

          {/* Minutes */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <CircleProgress value={m} max={59} size={120} stroke={6} color={isUrgent ? "#FF6B35" : "#E30613"}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 36, color: timeColor, letterSpacing: "-0.03em", lineHeight: 1 }}>{pad(m)}</span>
            </CircleProgress>
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: 10, color: "#4A4F60", letterSpacing: "0.16em", textTransform: "uppercase" }}>Minutos</span>
          </div>

          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 56, color: "rgba(255,255,255,0.20)", marginBottom: 28, animation: isRunning ? "pulse-ring 1s ease infinite" : "none" }}>:</span>

          {/* Seconds */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <CircleProgress value={s} max={59} size={120} stroke={6} color={isUrgent ? "#FF6B35" : "#E30613"}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 36, color: timeColor, letterSpacing: "-0.03em", lineHeight: 1 }}>{pad(s)}</span>
            </CircleProgress>
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: 10, color: "#4A4F60", letterSpacing: "0.16em", textTransform: "uppercase" }}>Segundos</span>
          </div>
        </div>

        {/* BIG time display */}
        <div
          className={`time-display ${isDone ? "done" : isUrgent ? "urgent" : ""}`}
          style={{
            fontSize: "clamp(80px, 16vw, 200px)",
            color: timeColor,
            marginTop: -8,
          }}
        >
          {str}
        </div>

        {/* Status label */}
        <div style={{
          marginTop: 16,
          height: 28,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          {isDone ? (
            <span style={{
              fontFamily: "'Barlow', sans-serif", fontWeight: 800,
              fontSize: 15, color: "#E30613", letterSpacing: "0.16em", textTransform: "uppercase",
            }}>— Tempo Encerrado —</span>
          ) : isRunning ? (
            <>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", animation: "pulse-ring 1s ease infinite", boxShadow: "0 0 8px rgba(34,197,94,0.80)" }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#72788A", letterSpacing: "0.06em" }}>Em execução</span>
            </>
          ) : totalSeconds === initialSeconds ? (
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#4A4F60", letterSpacing: "0.06em" }}>Pressione ▶ para iniciar</span>
          ) : (
            <>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#F5A623" }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#72788A", letterSpacing: "0.06em" }}>Pausado</span>
            </>
          )}
        </div>
      </div>

      {/* Info blocks — bottom */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        display: "flex", gap: 16,
        padding: "0 40px 32px",
      }}>
        {[label1, label2, label3].map((label, i) => (
          <div
            key={i}
            className="info-block"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {/* Accent line top */}
            <div style={{
              width: 32, height: 3, borderRadius: 2,
              background: i === 0 ? "#E30613" : i === 1 ? "rgba(255,255,255,0.20)" : "rgba(255,255,255,0.10)",
              marginBottom: 2,
            }} />
            <span style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(14px, 1.4vw, 20px)",
              color: "#F0F2F8",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              textAlign: "center",
            }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Config panel */}
      {showConfig && (
        <ConfigPanel
          onApply={applyConfig}
          onClose={() => setShowConfig(false)}
          initialH={initH} initialM={initM} initialS={initS}
          label1={label1} label2={label2} label3={label3}
        />
      )}
    </div>
  );
}
