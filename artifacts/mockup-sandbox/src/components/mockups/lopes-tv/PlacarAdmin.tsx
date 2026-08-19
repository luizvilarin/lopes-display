import React, { useState, useEffect, useRef, useCallback } from "react";
import logoBranca from "@/assets/logo-branca.png";
import faviconLopes from "@/assets/favicon-lopes.svg";
import {
  placarService,
  MOCK_UNIDADES,
} from "@/services/placarService";
import type {
  Pessoa, Unidade, RankingEntry, PrimeiraVenda, ConfigMetas,
  Cargo, TipoRanking, CategoriaRanking, Pasta, RankingPastaEntry,
  ProgressaoCarreira
} from "@/types/placar";
import { Icons } from "@/components/common/Icons";
import { Slide, DEFAULT_SLIDES } from "@/services/onboardingData";
import { parseSalesSpreadsheet, type SpreadsheetParseResult, type ParsedMonthData } from "@/services/excelImportService";

// ─── CSS ──────────────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes scalePop{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}

  .pa-root{width:100%;height:100%;display:flex;flex-direction:column;color:#fff;font-family:'DM Sans',sans-serif;}

  /* Header */
  .pa-header{height:56px;background:#111118;border-bottom:1px solid rgba(255,255,255,.08);display:flex;align-items:center;padding:0 20px;gap:14px;flex-shrink:0;}

  /* Layout */
  .pa-body{flex:1;display:flex;overflow:hidden;}
  .pa-sidebar{width:200px;flex-shrink:0;background:#0d0d14;border-right:1px solid rgba(255,255,255,.07);display:flex;flex-direction:column;padding:16px 10px;gap:4px;overflow-y:auto;}
  .pa-main{flex:1;overflow:auto;padding:28px 32px;overflow-x:hidden;}

  /* Nav items */
  .pa-nav{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:500;color:rgba(255,255,255,.55);transition:all 180ms;}
  .pa-nav:hover{background:rgba(255,255,255,.06);color:rgba(255,255,255,.85);}
  .pa-nav.active{background:rgba(227,6,19,.14);color:#fff;font-weight:700;}
  .pa-nav-icon{font-size:16px;width:20px;text-align:center;}

  /* Section label */
  .pa-section-label{font-size:10px;font-weight:700;color:rgba(255,255,255,.22);letter-spacing:.12em;text-transform:uppercase;padding:14px 12px 6px;}

  /* Cards / panels */
  .pa-card{background:#111118;border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:20px 22px;animation:fadeIn 300ms ease both;}
  .pa-title{font-family:'Barlow',sans-serif;font-weight:800;font-size:22px;margin-bottom:4px;}
  .pa-subtitle{font-size:13px;color:rgba(255,255,255,.40);margin-bottom:22px;}

  /* Table */
  .pa-table-wrap{width:100%;overflow-x:auto;}
  .pa-table{width:100%;border-collapse:collapse;min-width:600px;}
  .pa-table th{font-size:11px;font-weight:700;color:rgba(255,255,255,.30);letter-spacing:.10em;text-transform:uppercase;padding:8px 12px;text-align:left;border-bottom:1px solid rgba(255,255,255,.07);}
  .pa-table td{padding:11px 12px;border-bottom:1px solid rgba(255,255,255,.05);font-size:13px;vertical-align:middle;}
  .pa-table tr:last-child td{border-bottom:none;}
  .pa-table tr:hover td{background:rgba(255,255,255,.03);}

  /* Badges */
  .badge-gestor{background:rgba(99,102,241,.18);color:#818cf8;border:1px solid rgba(99,102,241,.25);padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:700;}
  .badge-corretor{background:rgba(227,6,19,.14);color:#f87171;border:1px solid rgba(227,6,19,.25);padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:700;}
  .badge-ativo{background:rgba(34,197,94,.14);color:#4ade80;border:1px solid rgba(34,197,94,.20);padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:700;}
  .badge-inativo{background:rgba(255,255,255,.06);color:rgba(255,255,255,.40);border:1px solid rgba(255,255,255,.10);padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:700;}

  /* Forms */
  .pa-label{font-size:12px;font-weight:600;color:rgba(255,255,255,.50);letter-spacing:.06em;text-transform:uppercase;display:block;margin-bottom:6px;}
  .pa-input{width:100%;background:#1a1a24;border:1px solid rgba(255,255,255,.12);border-radius:9px;padding:9px 13px;color:#fff;font-size:14px;font-family:'DM Sans',sans-serif;outline:none;transition:border 200ms;}
  .pa-input:focus{border-color:rgba(227,6,19,.55);}
  .pa-input::placeholder{color:rgba(255,255,255,.25);}
  .pa-select{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,.4)' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;}

  /* Buttons */
  .pa-btn-primary{background:#E30613;color:#fff;border:none;padding:9px 20px;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;transition:opacity 180ms;font-family:'DM Sans',sans-serif;}
  .pa-btn-primary:hover{opacity:.85;}
  .pa-btn-ghost{background:transparent;color:rgba(255,255,255,.55);border:1px solid rgba(255,255,255,.12);padding:7px 14px;border-radius:9px;font-size:12px;font-weight:600;cursor:pointer;transition:all 180ms;font-family:'DM Sans',sans-serif;}
  .pa-btn-ghost:hover{background:rgba(255,255,255,.08);color:#fff;}
  .pa-btn-danger{background:transparent;color:#f87171;border:1px solid rgba(248,113,113,.25);padding:5px 10px;border-radius:7px;font-size:12px;font-weight:600;cursor:pointer;transition:all 180ms;font-family:'DM Sans',sans-serif;}
  .pa-btn-danger:hover{background:rgba(248,113,113,.10);}

  /* Tabs */
  .pa-tabs{display:flex;gap:4px;background:#1a1a24;border-radius:10px;padding:4px;margin-bottom:20px;width:fit-content;}
  .pa-tab{padding:7px 16px;border-radius:7px;font-size:13px;font-weight:600;cursor:pointer;color:rgba(255,255,255,.45);transition:all 180ms;}
  .pa-tab.active{background:#E30613;color:#fff;}

  /* Avatar circle */
  .pa-avatar{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Barlow',sans-serif;font-weight:900;font-size:12px;flex-shrink:0;overflow:hidden;}

  /* Modal overlay */
  .pa-overlay{position:fixed;inset:0;background:rgba(0,0,0,.70);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:100;overflow-y:auto;padding:20px 10px;}
  .pa-modal{background:#111118;border:1px solid rgba(255,255,255,.12);border-radius:18px;padding:28px;width:100%;max-width:460px;animation:scalePop 280ms cubic-bezier(.34,1.56,.64,1) both;margin:auto;}
  .pa-modal-title{font-family:'Barlow',sans-serif;font-weight:800;font-size:20px;margin-bottom:20px;}

  /* Grid */
  .pa-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
  .pa-form-row{display:flex;flex-direction:column;gap:6px;margin-bottom:14px;}

  /* Login */
  .pa-login-wrap{flex:1;display:flex;align-items:center;justify-content:center;background:#0a0a0f;}
  .pa-login-card{background:#111118;border:1px solid rgba(255,255,255,.10);border-radius:20px;padding:36px;width:360px;animation:scalePop 350ms cubic-bezier(.34,1.56,.64,1) both;}

  /* Rank row */
  .rank-row{display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:10px;background:#1a1a24;border:1px solid rgba(255,255,255,.07);margin-bottom:8px;}
  .rank-pos{width:28px;height:28px;border-radius:50%;background:rgba(227,6,19,.18);border:1px solid rgba(227,6,19,.30);color:#f87171;font-family:'Barlow',sans-serif;font-weight:900;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}

  /* Toast */
  .pa-toast{position:fixed;bottom:24px;right:24px;background:#22c55e;color:#fff;font-weight:700;font-size:13px;padding:10px 18px;border-radius:10px;animation:fadeIn 300ms ease;z-index:200;}

  /* Photo preview */
  .photo-preview{width:48px;height:48px;border-radius:10px;object-fit:cover;border:1px solid rgba(255,255,255,.12);}

  /* Image Cropper */
  .crop-modal{background:#0d0d14;border:1px solid rgba(255,255,255,.14);border-radius:20px;padding:24px;width:100%;max-width:420px;animation:scalePop 280ms cubic-bezier(.34,1.56,.64,1) both;margin:auto;}
  .crop-canvas-wrap{position:relative;width:320px;height:320px;border-radius:50%;overflow:hidden;margin:0 auto;background:#1a1a24;cursor:grab;user-select:none;border:2px solid rgba(255,255,255,.15);}
  .crop-canvas-wrap:active{cursor:grabbing;}
  .crop-canvas-wrap canvas{display:block;width:100%;height:100%;}
  .crop-hint{text-align:center;font-size:11px;color:rgba(255,255,255,.35);margin-top:10px;}
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtBRL = (n: number) =>
  "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

const initials = (nome: string) =>
  nome.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

const GRADIENT_MAP: Record<string, string> = {
  gestor:   "linear-gradient(135deg,#6366f1,#818cf8)",
  corretor: "linear-gradient(135deg,#E30613,#ff6b6b)",
};

const getPeriodoAtual = (tipo: TipoRanking) => {
  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const data = new Date();
  const mes = meses[data.getMonth()].toUpperCase();
  const ano = data.getFullYear();
  
  if (tipo === "anual") {
    return `ACUMULADO ${ano}`;
  }
  return `${mes} DE ${ano}`;
};

const parseBrazilianNumber = (valStr: string): number => {
  const clean = valStr.trim();
  if (!clean) return 0;
  
  if (clean.includes(",")) {
    const normalized = clean.replace(/\./g, "").replace(/,/g, ".");
    const num = Number(normalized);
    return isNaN(num) ? 0 : num;
  }
  
  const parts = clean.split(".");
  if (parts.length > 2) {
    const normalized = clean.replace(/\./g, "");
    const num = Number(normalized);
    return isNaN(num) ? 0 : num;
  } else if (parts.length === 2) {
    const decimalPart = parts[1];
    if (decimalPart.length === 3) {
      const normalized = clean.replace(/\./g, "");
      const num = Number(normalized);
      return isNaN(num) ? 0 : num;
    } else {
      const num = Number(clean);
      return isNaN(num) ? 0 : num;
    }
  }
  
  const num = Number(clean);
  return isNaN(num) ? 0 : num;
};

const formatBrazilianNumber = (v: number | string): string => {
  if (v === undefined || v === null || v === "") return "";
  const num = Number(v);
  if (isNaN(num)) return String(v);
  
  const hasDecimal = num % 1 !== 0;
  return num.toLocaleString("pt-BR", {
    minimumFractionDigits: hasDecimal ? 2 : 0,
    maximumFractionDigits: 2
  });
};

const Field = ({
  label,
  value,
  onChange,
  disabled,
  type = "text"
}: {
  label: string;
  value: string | number;
  onChange: (val: string) => void;
  disabled: boolean;
  type?: string;
}) => {
  const isNumeric = type === "number";
  const [localVal, setLocalVal] = useState("");
  const isFocused = useRef(false);

  // If value prop changes externally, update localVal
  useEffect(() => {
    if (!isFocused.current) {
      setLocalVal(isNumeric ? formatBrazilianNumber(value) : (value === undefined || value === null ? "" : String(value)));
    }
  }, [value, isNumeric]);

  return (
    <div className="pa-form-row">
      <label className="pa-label">{label}</label>
      <input
        className="pa-input"
        type="text"
        value={localVal}
        onFocus={() => {
          isFocused.current = true;
        }}
        onBlur={() => {
          isFocused.current = false;
          setLocalVal(isNumeric ? formatBrazilianNumber(value) : (value === undefined || value === null ? "" : String(value)));
        }}
        onChange={e => {
          let val = e.target.value;
          if (isNumeric) {
            val = val.replace(/[^0-9.,-]/g, "");
            setLocalVal(val);
            onChange(val);
          } else {
            setLocalVal(val);
            onChange(val);
          }
        }}
        disabled={disabled}
        placeholder={isNumeric ? "0" : ""}
        style={{ overflowX: "hidden" }}
      />
    </div>
  );
};


// ─── Types ────────────────────────────────────────────────────────────────────

type Section = "pessoas" | "rankings" | "pvenda" | "metas";

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ pessoa, size = 32 }: { pessoa: Pessoa; size?: number }) {
  if (pessoa.foto_url) {
    return <img src={pessoa.foto_url} alt={pessoa.nome} className="photo-preview" style={{ width: size, height: size }} />;
  }
  return (
    <div className="pa-avatar" style={{ width: size, height: size, background: GRADIENT_MAP[pessoa.cargo] }}>
      {initials(pessoa.nome)}
    </div>
  );
}

// ─── Image Cropper ────────────────────────────────────────────────────────────

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = e => res(e.target?.result as string);
    r.onerror = () => rej(new Error("Erro ao ler arquivo"));
    r.readAsDataURL(file);
  });

function ImageCropper({
  src,
  onConfirm,
  onCancel,
}: {
  src: string;
  onConfirm: (dataUrl: string) => void;
  onCancel: () => void;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const imgRef = React.useRef<HTMLImageElement | null>(null);
  const stateRef = React.useRef({ x: 0, y: 0, scale: 1, dragging: false, lastX: 0, lastY: 0 });
  const SIZE = 320; // canvas logical size

  const draw = React.useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y, scale } = stateRef.current;
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.drawImage(img, x, y, w, h);
  }, []);

  React.useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      // center the image filling the circle by default
      const s = Math.max(SIZE / img.naturalWidth, SIZE / img.naturalHeight);
      stateRef.current.scale = s;
      stateRef.current.x = (SIZE - img.naturalWidth * s) / 2;
      stateRef.current.y = (SIZE - img.naturalHeight * s) / 2;
      draw();
    };
    img.src = src;
  }, [src, draw]);

  // Drag handlers
  const onMouseDown = (e: React.MouseEvent) => {
    stateRef.current.dragging = true;
    stateRef.current.lastX = e.clientX;
    stateRef.current.lastY = e.clientY;
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!stateRef.current.dragging) return;
    stateRef.current.x += e.clientX - stateRef.current.lastX;
    stateRef.current.y += e.clientY - stateRef.current.lastY;
    stateRef.current.lastX = e.clientX;
    stateRef.current.lastY = e.clientY;
    draw();
  };
  const onMouseUp = () => { stateRef.current.dragging = false; };

  // Touch handlers
  const touchStart = React.useRef<{ x: number; y: number; dist?: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStart.current = { x: 0, y: 0, dist: Math.sqrt(dx * dx + dy * dy) };
    }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!touchStart.current) return;
    if (e.touches.length === 1) {
      const dx = e.touches[0].clientX - touchStart.current.x;
      const dy = e.touches[0].clientY - touchStart.current.y;
      stateRef.current.x += dx;
      stateRef.current.y += dy;
      touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      draw();
    } else if (e.touches.length === 2 && touchStart.current.dist) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDist = Math.sqrt(dx * dx + dy * dy);
      const ratio = newDist / touchStart.current.dist;
      stateRef.current.scale = Math.max(0.1, Math.min(5, stateRef.current.scale * ratio));
      touchStart.current.dist = newDist;
      draw();
    }
  };

  // Scroll zoom
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 1.1 : 0.9;
    stateRef.current.scale = Math.max(0.1, Math.min(5, stateRef.current.scale * delta));
    draw();
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Export at 1024x1024 as image/png preserving high clarity and alpha transparency
    const out = document.createElement("canvas");
    out.width = 1024; out.height = 1024;
    const ctx = out.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(canvas, 0, 0, 1024, 1024);
    onConfirm(out.toDataURL("image/png"));
  };

  return (
    <div className="pa-overlay" style={{ zIndex: 200 }}>
      <div className="crop-modal">
        <div className="pa-modal-title" style={{ marginBottom: 16 }}>✂️ Recortar Foto</div>
        <div
          className="crop-canvas-wrap"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={() => { touchStart.current = null; }}
          onWheel={onWheel}
        >
          <canvas ref={canvasRef} width={SIZE} height={SIZE} />
        </div>
        <p className="crop-hint">Arraste para mover • Scroll do mouse ou pinça para ampliar</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
          <button className="pa-btn-ghost" onClick={onCancel}>Cancelar</button>
          <button className="pa-btn-primary" onClick={handleConfirm}>✓ Confirmar Recorte</button>
        </div>
      </div>
    </div>
  );
}

// ─── Section: Pessoas ─────────────────────────────────────────────────────────

function SecaoPessoas({ pessoas, unidades, activeUnitId, onChange }: {
  pessoas: Pessoa[]; unidades: Unidade[]; activeUnitId: string; onChange: () => void;
}) {
  const [modal, setModal] = useState<Partial<Pessoa> | null>(null);
  const [saving, setSaving] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [subTab, setSubTab] = useState<"ativos" | "arquivados">("ativos");
  const [cargoFilter, setCargoFilter] = useState<string>("todos");
  const [unidadeFilter, setUnidadeFilter] = useState<string>("todas");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    setUnidadeFilter(activeUnitId === "Todas" ? "todas" : activeUnitId);
  }, [activeUnitId]);

  const filteredList = pessoas
    .filter(p => {
      const isAtivo = p.ativo !== false;
      return subTab === "ativos" ? isAtivo : !isAtivo;
    })
    .filter(p => (cargoFilter === "todos" ? true : p.cargo === cargoFilter))
    .filter(p => (unidadeFilter === "todas" ? true : p.unidade_id === unidadeFilter))
    .sort((a, b) => {
      const nameA = (a.nome || "").toLowerCase();
      const nameB = (b.nome || "").toLowerCase();
      return sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });

  // Keep listToShow for the subtab badge counts (filtered by unit only)
  const listToShow = activeUnitId === "Todas" ? pessoas : pessoas.filter(p => p.unidade_id === activeUnitId);

  const openAdd = () => setModal({ 
    cargo: "corretor", 
    ativo: true, 
    unidade_id: activeUnitId === "Todas" ? (unidades[0]?.id || "jd-goias") : activeUnitId 
  });
  const openEdit = (p: Pessoa) => setModal({ ...p });
  const close = () => setModal(null);

  const save = async () => {
    if (!modal) return;
    setSaving(true);
    try {
      if (modal.id) {
        await placarService.updatePessoa(modal.id, modal);
      } else {
        await placarService.savePessoa(modal as Omit<Pessoa, "id" | "criado_em">);
      }
      onChange();
      close();
    } finally {
      setSaving(false);
    }
  };

  const archive = async (id: string) => {
    if (!confirm("Arquivar este colaborador? Ele deixará de aparecer no painel da TV e nos rankings ativos.")) return;
    await placarService.updatePessoa(id, { ativo: false });
    onChange();
  };

  const restore = async (id: string) => {
    await placarService.updatePessoa(id, { ativo: true });
    onChange();
  };

  const del = async (id: string) => {
    if (!confirm("Excluir permanentemente este colaborador? Esta ação removerá definitivamente o cadastro dele e todo o seu histórico no placar e primeira venda.")) return;
    await placarService.deletePessoa(id);
    onChange();
  };

  return (
    <>
      <div className="pa-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div className="pa-title">Pessoas</div>
            <div className="pa-subtitle">Corretores e gestores cadastrados — {filteredList.length} exibidos</div>
          </div>
          <button className="pa-btn-primary" onClick={openAdd}>+ Novo</button>
        </div>

        {/* Sub-tabs switcher */}
        <div style={{ display: "flex", gap: 16, borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: 16 }}>
          <button 
            type="button"
            onClick={() => setSubTab("ativos")} 
            style={{
              background: "none", border: "none", color: subTab === "ativos" ? "#fff" : "rgba(255,255,255,0.4)",
              fontWeight: 700, paddingBottom: 10, borderBottom: subTab === "ativos" ? "2px solid #E30613" : "2px solid transparent",
              cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", gap: 6
            }}
          >
            Ativos <span style={{ fontSize: 11, background: "rgba(255,255,255,0.08)", padding: "2px 6px", borderRadius: 10, color: "rgba(255,255,255,0.6)" }}>{listToShow.filter(p => p.ativo).length}</span>
          </button>
          <button 
            type="button"
            onClick={() => setSubTab("arquivados")} 
            style={{
              background: "none", border: "none", color: subTab === "arquivados" ? "#fff" : "rgba(255,255,255,0.4)",
              fontWeight: 700, paddingBottom: 10, borderBottom: subTab === "arquivados" ? "2px solid #E30613" : "2px solid transparent",
              cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", gap: 6
            }}
          >
            Arquivados <span style={{ fontSize: 11, background: "rgba(255,255,255,0.08)", padding: "2px 6px", borderRadius: 10, color: "rgba(255,255,255,0.6)" }}>{listToShow.filter(p => !p.ativo).length}</span>
          </button>
        </div>

        {/* Filters and Sorting Bar */}
        <div style={{ 
          display: "flex", 
          gap: 12, 
          flexWrap: "wrap", 
          marginBottom: 16, 
          background: "rgba(255,255,255,0.03)", 
          padding: 12, 
          borderRadius: 8, 
          border: "1px solid rgba(255,255,255,0.05)" 
        }}>
          {/* Cargo */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 150 }}>
            <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase" }}>Cargo</label>
            <select 
              value={cargoFilter} 
              onChange={e => setCargoFilter(e.target.value)}
              className="pa-input pa-select" 
              style={{ padding: "6px 10px", fontSize: 13, height: 34 }}
            >
              <option value="todos">Todos os cargos</option>
              <option value="corretor">Corretores</option>
              <option value="gestor">Gestores</option>
            </select>
          </div>

          {/* Unidade */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 160 }}>
            <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase" }}>Unidade</label>
            <select 
              value={unidadeFilter} 
              onChange={e => setUnidadeFilter(e.target.value)}
              className="pa-input pa-select" 
              style={{ padding: "6px 10px", fontSize: 13, height: 34 }}
            >
              <option value="todas">Todas as unidades</option>
              {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
            </select>
          </div>

          {/* Sorting */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 180, marginLeft: "auto" }}>
            <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase" }}>Ordem Alfabética</label>
            <select 
              value={sortOrder} 
              onChange={e => setSortOrder(e.target.value as "asc" | "desc")}
              className="pa-input pa-select" 
              style={{ padding: "6px 10px", fontSize: 13, height: 34 }}
            >
              <option value="asc">Nome (A - Z)</option>
              <option value="desc">Nome (Z - A)</option>
            </select>
          </div>
        </div>

        <div className="pa-table-wrap">
          <table className="pa-table">
            <thead>
              <tr>
                <th>Pessoa</th>
                <th>Cargo</th>
                <th>Unidade</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", padding: "32px 0" }}>
                    Nenhum colaborador {subTab === "ativos" ? "ativo" : "arquivado"} encontrado.
                  </td>
                </tr>
              ) : (
                filteredList.map(p => {
                  const un = unidades.find(u => u.id === p.unidade_id);
                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Avatar pessoa={p} size={32} />
                          <span style={{ fontWeight: 600 }}>{p.nome}</span>
                        </div>
                      </td>
                      <td><span className={p.cargo === "gestor" ? "badge-gestor" : "badge-corretor"}>{p.cargo}</span></td>
                      <td style={{ color: "rgba(255,255,255,.55)", fontSize: 12 }}>{un?.nome ?? "—"}</td>
                      <td>
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                          {subTab === "ativos" ? (
                            <>
                              <button className="pa-btn-ghost" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px" }} onClick={() => openEdit(p)}>
                                <Icons.Edit size={14} />
                                Editar
                              </button>
                              <button className="pa-btn-ghost" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)" }} onClick={() => archive(p.id)}>
                                <Icons.Archive size={14} />
                                Arquivar
                              </button>
                              <button className="pa-btn-danger" style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }} onClick={() => del(p.id)} title="Excluir Permanentemente">
                                <Icons.Trash size={14} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button className="pa-btn-ghost" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderColor: "rgba(34,197,94,0.3)", color: "#4ade80" }} onClick={() => restore(p.id)}>
                                <Icons.Refresh size={14} />
                                Restaurar
                              </button>
                              <button className="pa-btn-danger" style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }} onClick={() => del(p.id)} title="Excluir Permanentemente">
                                <Icons.Trash size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal !== null && (
        <div className="pa-overlay" onClick={e => e.target === e.currentTarget && close()}>
          <div className="pa-modal">
            <div className="pa-modal-title">{modal.id ? "Editar Pessoa" : "Nova Pessoa"}</div>

            <div className="pa-grid-2">
              <div className="pa-form-row" style={{ gridColumn: "1 / -1" }}>
                <label className="pa-label">Nome completo</label>
                <input className="pa-input" value={modal.nome ?? ""} onChange={e => setModal(m => ({ ...m!, nome: e.target.value }))} placeholder="Ex: Maria Osanete" />
              </div>
              <div className="pa-form-row">
                <label className="pa-label">Cargo</label>
                <select className="pa-input pa-select" value={modal.cargo ?? "corretor"} onChange={e => setModal(m => ({ ...m!, cargo: e.target.value as Cargo }))}>
                  <option value="corretor">Corretor</option>
                  <option value="gestor">Gestor</option>
                </select>
              </div>
              <div className="pa-form-row">
                <label className="pa-label">Unidade</label>
                <select className="pa-input pa-select" value={modal.unidade_id ?? ""} onChange={e => setModal(m => ({ ...m!, unidade_id: e.target.value }))} disabled={activeUnitId !== "Todas"}>
                  {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                </select>
              </div>
              <div className="pa-form-row" style={{ gridColumn: "1 / -1" }}>
                <label className="pa-label">Instagram Handle (ex: @ricardolobo_lopes)</label>
                <input className="pa-input" value={modal.instagram ?? ""} onChange={e => setModal(m => ({ ...m!, instagram: e.target.value }))} placeholder="Ex: @ricardolobo_lopes" />
              </div>
              <div className="pa-form-row" style={{ gridColumn: "1 / -1" }}>
                <label className="pa-label">Foto do Perfil (Suporta PNG sem fundo transparente HD)</label>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 4 }}>
                  {/* Preview circular */}
                  <div style={{
                    width: 64, height: 64, borderRadius: "50%", overflow: "hidden",
                    border: "2px solid rgba(255,255,255,0.15)",
                    background: modal.foto_url ? `url(${modal.foto_url}) center/cover no-repeat` : "rgba(255,255,255,0.05)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "rgba(255,255,255,0.4)", flexShrink: 0
                  }}>
                    {!modal.foto_url && (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    )}
                  </div>
                  {/* Botões */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="pa-btn-ghost"
                        style={{ padding: "6px 12px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                        </svg>
                        {modal.foto_url ? "Trocar Foto" : "Carregar Foto"}
                      </button>
                      {modal.foto_url && (
                        <>
                          <button
                            type="button"
                            className="pa-btn-ghost"
                            style={{ padding: "6px 12px", fontSize: 13, display: "flex", alignItems: "center", gap: 6, borderColor: "rgba(99,102,241,.35)", color: "#818cf8" }}
                            onClick={() => setCropSrc(modal.foto_url!)}
                          >
                            ✂️ Recortar
                          </button>
                          <button
                            type="button"
                            className="pa-btn-danger"
                            style={{ padding: "6px 12px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
                            onClick={() => setModal(m => ({ ...m!, foto_url: "" }))}
                          >
                            <Icons.Trash size={14} />
                            Remover
                          </button>
                        </>
                      )}
                    </div>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Recomendado: PNG Transparente HD (Manterá fundo transparente)</span>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={async e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    e.target.value = "";
                    if (file.size > 10 * 1024 * 1024) {
                      alert("Por favor, selecione uma imagem de até 10MB.");
                      return;
                    }
                    try {
                      const dataUrl = await readFileAsDataUrl(file);
                      setModal(m => ({ ...m!, foto_url: dataUrl }));
                    } catch {
                      alert("Erro ao ler o arquivo de imagem.");
                    }
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
              <button className="pa-btn-ghost" onClick={close}>Cancelar</button>
              <button className="pa-btn-primary" onClick={save} disabled={saving}>{saving ? "Salvando…" : "Salvar"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Cropper Modal */}
      {cropSrc && (
        <ImageCropper
          src={cropSrc}
          onConfirm={(dataUrl) => {
            setModal(m => ({ ...m!, foto_url: dataUrl }));
            setCropSrc(null);
          }}
          onCancel={() => setCropSrc(null)}
        />
      )}
    </>
  );
}

// ─── Section: Ranking de Pastas (Unificado) ───────────────────────────────────

function SecaoRankingsPastas({ pessoas, onChange }: { pessoas: Pessoa[]; onChange: () => void; }) {
  const [pastas, setPastas] = useState<Pasta[]>([]);
  const [selectedPastaId, setSelectedPastaId] = useState<string>("");
  const [rankingEntries, setRankingEntries] = useState<(RankingPastaEntry & { pessoa?: Pessoa })[]>([]);
  const [cat, setCat] = useState<"corretor" | "gestor">("corretor");

  // Modals state
  const [showPastaModal, setShowPastaModal] = useState(false);
  const [pastaForm, setPastaForm] = useState<Partial<Pasta>>({ titulo: "", meta_pastas: 30 });
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [entryForm, setEntryForm] = useState<Partial<RankingPastaEntry>>({ pessoa_id: "", posicao: 1, quantidade_pastas: 1 });
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const pList = await placarService.getPastas();
      setPastas(pList);
      const activeId = selectedPastaId || pList[0]?.id || "";
      if (activeId && !selectedPastaId) setSelectedPastaId(activeId);
      if (activeId) {
        const rList = await placarService.getRankingPastas(activeId);
        setRankingEntries(rList);
      }
    } catch (e) {
      console.error(e);
    }
  }, [selectedPastaId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activePasta = pastas.find(p => p.id === selectedPastaId);

  const categoryEntries = rankingEntries
    .filter(e => e.categoria === cat)
    .sort((a, b) => a.posicao - b.posicao);

  const maxPositions = cat === "corretor" ? 30 : 10;
  const topLimit = cat === "corretor" ? 10 : 5;

  const handleSavePasta = async () => {
    if (!pastaForm.titulo) return;
    setSaving(true);
    try {
      const saved = await placarService.savePasta(pastaForm);
      setShowPastaModal(false);
      setPastaForm({ titulo: "", meta_pastas: 30 });
      setSelectedPastaId(saved.id);
      loadData();
      onChange();
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar Pasta");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePasta = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este Lançamento / Pasta?")) return;
    await placarService.deletePasta(id);
    setSelectedPastaId("");
    loadData();
    onChange();
  };

  const handleSaveEntry = async () => {
    if (!entryForm.pessoa_id || !selectedPastaId) return;
    setSaving(true);
    try {
      await placarService.saveRankingPastaEntry({
        ...entryForm,
        pasta_id: selectedPastaId,
        categoria: cat,
      });
      setShowEntryModal(false);
      setEntryForm({ pessoa_id: "", posicao: 1, quantidade_pastas: 1 });
      loadData();
      onChange();
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar posição no ranking");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm("Remover esta pessoa do ranking de pastas?")) return;
    await placarService.deleteRankingPastaEntry(id);
    loadData();
    onChange();
  };

  const availablePessoas = pessoas.filter(p => p.ativo && p.cargo === (cat === "gestor" ? "gestor" : "corretor"));

  return (
    <>
      <div className="pa-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div className="pa-title">Ranking de Pastas Unificado</div>
            <div className="pa-subtitle">Gerencie o ranking de captação de pastas por lançamento (Unificada Lopes)</div>
          </div>
          <button className="pa-btn-primary" onClick={() => { setPastaForm({ titulo: "", meta_pastas: 30 }); setShowPastaModal(true); }}>
            + Novo Lançamento / Pasta
          </button>
        </div>

        {pastas.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(255,255,255,.25)", fontSize: 14 }}>
            Nenhum lançamento de pasta cadastrado. Clique em "+ Novo Lançamento / Pasta".
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.40)", textTransform: "uppercase", letterSpacing: ".06em" }}>Lançamento:</span>
              {pastas.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPastaId(p.id)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    border: selectedPastaId === p.id ? "1px solid #FF0080" : "1px solid rgba(255,255,255,.12)",
                    background: selectedPastaId === p.id ? "linear-gradient(135deg, rgba(255,0,128,.25), rgba(227,6,19,.15))" : "rgba(255,255,255,.04)",
                    color: selectedPastaId === p.id ? "#fff" : "rgba(255,255,255,.60)"
                  }}
                >
                  📁 {p.titulo} ({p.meta_pastas} pastas)
                </button>
              ))}
            </div>

            {activePasta && (
              <div style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 16, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,.06)" }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{activePasta.titulo}</div>
                    <div style={{ fontSize: 13, color: "#FF0080", fontWeight: 600, marginTop: 2 }}>Meta Total de Pastas: {activePasta.meta_pastas}</div>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button className="pa-btn-ghost" onClick={() => { setPastaForm(activePasta); setShowPastaModal(true); }}>✏️ Editar Pasta</button>
                    <button className="pa-btn-danger" onClick={() => handleDeletePasta(activePasta.id)}>🗑️ Excluir</button>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div className="pa-tabs">
                    <button className={`pa-tab ${cat === "corretor" ? "active" : ""}`} onClick={() => setCat("corretor")}>
                      🏅 Corretores (Top 30 · Destaque Top 10)
                    </button>
                    <button className={`pa-tab ${cat === "gestor" ? "active" : ""}`} onClick={() => setCat("gestor")}>
                      👔 Gestores (Top 10 · Destaque Top 5)
                    </button>
                  </div>
                  <button className="pa-btn-primary" onClick={() => {
                    setEntryForm({ pessoa_id: "", posicao: categoryEntries.length + 1, quantidade_pastas: 1 });
                    setShowEntryModal(true);
                  }}>
                    + Adicionar no Ranking
                  </button>
                </div>

                {categoryEntries.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "30px 0", color: "rgba(255,255,255,.3)", fontSize: 13 }}>
                    Nenhum {cat === "corretor" ? "corretor" : "gestor"} vinculado a este ranking de pastas ainda.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {categoryEntries.map(e => {
                      const isTopLeader = e.posicao <= topLimit;
                      return (
                        <div
                          key={e.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 14,
                            padding: "12px 18px",
                            borderRadius: 12,
                            background: isTopLeader ? "linear-gradient(90deg, rgba(255,0,128,.12), rgba(255,255,255,.03))" : "rgba(255,255,255,.02)",
                            border: isTopLeader ? "1px solid rgba(255,0,128,.30)" : "1px solid rgba(255,255,255,.05)",
                          }}
                        >
                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: e.posicao === 1 ? "linear-gradient(135deg,#f59e0b,#b45309)" : e.posicao <= 3 ? "linear-gradient(135deg,#94a3b8,#475569)" : "rgba(255,255,255,.10)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 900,
                            fontSize: 14,
                            color: "#fff"
                          }}>
                            {e.posicao}º
                          </div>

                          <div style={{ width: 36, height: 36, borderRadius: "50%", overflow: "hidden", background: "rgba(255,255,255,.1)", flexShrink: 0, border: "1.5px solid rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {e.pessoa?.foto_url ? (
                              <img src={e.pessoa.foto_url} alt={e.pessoa.nome} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              <span style={{ fontWeight: 800, fontSize: 12, color: "#fff" }}>{e.pessoa?.nome ? e.pessoa.nome.substring(0, 2).toUpperCase() : "??"}</span>
                            )}
                          </div>

                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>{e.pessoa?.nome || "Pessoa não encontrada"}</span>
                              {isTopLeader && (
                                <span style={{ background: "linear-gradient(90deg,#FF0080,#E30613)", padding: "2px 8px", borderRadius: 10, fontSize: 10, fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: ".06em" }}>
                                  TOP {topLimit} LEADER
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,.45)", marginTop: 2 }}>
                              {e.pessoa?.unidade_id ? `Lopes ${e.pessoa.unidade_id.toUpperCase()}` : "Unificada"}
                            </div>
                          </div>

                          <div style={{ textAlign: "right", marginRight: 10 }}>
                            <div style={{ fontSize: 16, fontWeight: 900, color: "#4ade80" }}>{e.quantidade_pastas} {e.quantidade_pastas === 1 ? "Pasta" : "Pastas"}</div>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>Entregues</div>
                          </div>

                          <div style={{ display: "flex", gap: 6 }}>
                            <button className="pa-btn-ghost" style={{ padding: "4px 8px", fontSize: 12 }} onClick={() => {
                              setEntryForm(e);
                              setShowEntryModal(true);
                            }}>✏️ Edit</button>
                            <button className="pa-btn-danger" style={{ padding: "4px 8px", fontSize: 12 }} onClick={() => handleDeleteEntry(e.id)}>✕</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {showPastaModal && (
        <div className="pa-overlay" onClick={e => e.target === e.currentTarget && setShowPastaModal(false)}>
          <div className="pa-modal" style={{ maxWidth: 440 }}>
            <div className="pa-modal-title">{pastaForm.id ? "Editar Lançamento / Pasta" : "Novo Lançamento / Pasta"}</div>
            <div className="pa-form-row" style={{ marginTop: 14 }}>
              <label className="pa-label">Título do Produto / Lançamento</label>
              <input className="pa-input" value={pastaForm.titulo || ""} onChange={e => setPastaForm((f: Partial<Pasta>) => ({ ...f, titulo: e.target.value }))} placeholder="Ex: Residencial Park Lopes" />
            </div>
            <div className="pa-form-row">
              <label className="pa-label">Meta Total de Pastas</label>
              <input className="pa-input" type="number" value={pastaForm.meta_pastas || ""} onChange={e => setPastaForm((f: Partial<Pasta>) => ({ ...f, meta_pastas: Number(e.target.value) }))} placeholder="Ex: 50" />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
              <button className="pa-btn-ghost" onClick={() => setShowPastaModal(false)}>Cancelar</button>
              <button className="pa-btn-primary" onClick={handleSavePasta} disabled={saving || !pastaForm.titulo}>{saving ? "Salvando…" : "Salvar Pasta"}</button>
            </div>
          </div>
        </div>
      )}

      {showEntryModal && (
        <div className="pa-overlay" onClick={e => e.target === e.currentTarget && setShowEntryModal(false)}>
          <div className="pa-modal" style={{ maxWidth: 440 }}>
            <div className="pa-modal-title">{entryForm.id ? "Editar Posição no Ranking" : `Adicionar ${cat === "corretor" ? "Corretor" : "Gestor"} no Ranking`}</div>
            <div className="pa-form-row" style={{ marginTop: 14 }}>
              <label className="pa-label">Selecione a Pessoa (Unificada Lopes)</label>
              <select className="pa-input pa-select" value={entryForm.pessoa_id || ""} onChange={e => setEntryForm((f: Partial<RankingPastaEntry>) => ({ ...f, pessoa_id: e.target.value }))}>
                <option value="">— Selecionar —</option>
                {availablePessoas.map(p => (
                  <option key={p.id} value={p.id}>{p.nome} ({p.unidade_id ? `Lopes ${p.unidade_id}` : "Unificada"})</option>
                ))}
              </select>
            </div>
            <div className="pa-form-row">
              <label className="pa-label">Posição no Ranking (1 a {maxPositions})</label>
              <input className="pa-input" type="number" min={1} max={maxPositions} value={entryForm.posicao || 1} onChange={e => setEntryForm((f: Partial<RankingPastaEntry>) => ({ ...f, posicao: Number(e.target.value) }))} />
            </div>
            <div className="pa-form-row">
              <label className="pa-label">Quantidade de Pastas</label>
              <input className="pa-input" type="number" min={1} value={entryForm.quantidade_pastas || 1} onChange={e => setEntryForm((f: Partial<RankingPastaEntry>) => ({ ...f, quantidade_pastas: Number(e.target.value) }))} />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
              <button className="pa-btn-ghost" onClick={() => setShowEntryModal(false)}>Cancelar</button>
              <button className="pa-btn-primary" onClick={handleSaveEntry} disabled={saving || !entryForm.pessoa_id}>{saving ? "Salvando…" : "Salvar no Ranking"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Section: Rankings ────────────────────────────────────────────────────────

function SecaoRankings({ rankings, pessoas, activeUnitId, onChange }: {
  rankings: RankingEntry[]; pessoas: Pessoa[]; activeUnitId: string; onChange: () => void;
}) {
  const [tipo, setTipo] = useState<TipoRanking>("anual");
  const [cat, setCat] = useState<CategoriaRanking>("gestores");
  const [modal, setModal] = useState<Partial<RankingEntry> | null>(null);
  const [saving, setSaving] = useState(false);

  const filtered = rankings.filter(r => {
    const p = pessoas.find(x => x.id === r.pessoa_id);
    const matchUnit = activeUnitId === "Todas" || !p || p.unidade_id === activeUnitId;
    return r.tipo === tipo && r.categoria === cat && r.ativo && matchUnit;
  }).sort((a, b) => a.posicao - b.posicao);

  const pessoasDoCargo = pessoas.filter(p => 
    p.cargo === (cat === "gestores" ? "gestor" : "corretor") && 
    p.ativo && 
    (activeUnitId === "Todas" || p.unidade_id === activeUnitId)
  );

  const openAdd = () => setModal({ tipo, categoria: cat, ativo: true, posicao: filtered.length + 1, periodo: getPeriodoAtual(tipo) });
  const openEdit = (r: RankingEntry) => setModal({ ...r });
  const close = () => setModal(null);

  const save = async () => {
    if (!modal) return;
    setSaving(true);
    try {
      const payload = {
        ...modal,
        periodo: getPeriodoAtual(modal.tipo || tipo)
      };
      if (payload.id) {
        await placarService.updateRankingEntry(payload.id, payload);
      } else {
        await placarService.saveRankingEntry(payload as Omit<RankingEntry, "id" | "criado_em" | "atualizado_em">);
      }
      onChange();
      close();
    } catch (err) {
      console.error("Erro ao salvar posição:", err);
      alert("Não foi possível salvar esta posição. Certifique-se de que a posição informada não esteja em conflito com outra já cadastrada.");
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Remover esta entrada?")) return;
    await placarService.deleteRankingEntry(id);
    onChange();
  };

  return (
    <>
      <div className="pa-card" style={{ overflowX: "auto" }}>
        <div className="pa-title">Placar Envolvente</div>
        <div className="pa-subtitle">Configure as posições exibidas no placar de cada semana</div>

        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <div className="pa-tabs">
            {(["mensal", "anual"] as TipoRanking[]).map(t => (
              <div key={t} className={`pa-tab${tipo === t ? " active" : ""}`} onClick={() => setTipo(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </div>
            ))}
          </div>
          <div className="pa-tabs">
            {(["gestores", "corretores"] as CategoriaRanking[]).map(c => (
              <div key={c} className={`pa-tab${cat === c ? " active" : ""}`} onClick={() => setCat(c)}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </div>
            ))}
          </div>
        </div>

        {activeUnitId === "Todas" ? (
          <div style={{ background: "rgba(227,6,19,.10)", border: "1px dashed rgba(227,6,19,.30)", borderRadius: 12, padding: "16px 20px", marginBottom: 20, color: "#f87171", fontSize: 13, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <div>
              <strong>Visualização Consolidada Ativa:</strong> Para gerenciar as posições do Placar Envolvente, selecione uma unidade específica (ex: Marista, Jardim Goiás) no cabeçalho do painel administrativo.
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: 14, display: "flex", justifyContent: "flex-end" }}>
            <button className="pa-btn-primary" onClick={openAdd}>+ Adicionar posição</button>
          </div>
        )}

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(255,255,255,.25)", fontSize: 14 }}>
            Nenhuma entrada para {tipo} · {cat}.
            {activeUnitId !== "Todas" && " Clique em \"+ Adicionar posição\"."}
          </div>
        )}

        {filtered.map(r => {
          const p = pessoas.find(p => p.id === r.pessoa_id);
          return (
            <div key={r.id} className="rank-row">
              <div className="rank-pos">{r.posicao}º</div>
              {p ? <Avatar pessoa={p} size={36} /> : <div className="pa-avatar" style={{ background: "#333" }}>?</div>}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{p?.nome ?? "—"}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.40)" }}>{r.periodo}</div>
              </div>
              <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 800, fontSize: 15, color: "#fff" }}>{fmtBRL(r.valor)}</div>
              <div style={{ display: "flex", gap: 6 }}>
                {activeUnitId !== "Todas" && <button className="pa-btn-ghost" onClick={() => openEdit(r)}>Editar</button>}
                {activeUnitId !== "Todas" && <button className="pa-btn-danger" onClick={() => del(r.id)}>✕</button>}
              </div>
            </div>
          );
        })}
      </div>

      {modal !== null && (
        <div className="pa-overlay" onClick={e => e.target === e.currentTarget && close()}>
          <div className="pa-modal">
            <div className="pa-modal-title">{modal.id ? "Editar Posição" : "Nova Posição"}</div>

            <div className="pa-form-row">
              <label className="pa-label">Pessoa</label>
              <select className="pa-input pa-select" value={modal.pessoa_id ?? ""} onChange={e => setModal(m => ({ ...m!, pessoa_id: e.target.value }))}>
                <option value="">— selecione —</option>
                {pessoasDoCargo.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </div>
            <div className="pa-grid-2">
              <div className="pa-form-row">
                <label className="pa-label">Posição</label>
                <input className="pa-input" type="number" min={1} value={modal.posicao ?? 1} onChange={e => setModal(m => ({ ...m!, posicao: Number(e.target.value) }))} />
              </div>
              <div style={{ gridColumn: "span 1" }}>
                <Field
                  label="Valor (R$)"
                  value={modal.valor ?? ""}
                  onChange={val => setModal(m => ({ ...m!, valor: parseBrazilianNumber(val) }))}
                  disabled={saving}
                  type="number"
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14 }}>
              <button className="pa-btn-ghost" onClick={close}>Cancelar</button>
              <button className="pa-btn-primary" onClick={save} disabled={saving || !modal.pessoa_id}>{saving ? "Salvando…" : "Salvar"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Section: Primeira Venda ──────────────────────────────────────────────────

function SecaoPVenda({ pvs = [], pessoas, activeUnitId, onChange }: {
  pvs?: (PrimeiraVenda & { pessoa: Pessoa })[]; pessoas: Pessoa[]; activeUnitId: string; onChange: () => void;
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    pessoa_id: "",
    mensagem: "Parabéns pela venda!",
    detalhe: "Você faz parte do crescimento da nossa empresa, nosso muito obrigado!",
    ativo: true,
  });
  const [saving, setSaving] = useState(false);

  const previewPessoa = pessoas.find(p => p.id === form.pessoa_id);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover esta pessoa da Primeira Venda?")) return;
    try {
      await placarService.deletePrimeiraVenda(id);
      onChange();
    } catch (err) {
      console.error(err);
      alert("Erro ao remover da Primeira Venda");
    }
  };

  const handleAdd = async () => {
    if (!form.pessoa_id) return;
    setSaving(true);
    try {
      await placarService.savePrimeiraVenda({
        pessoa_id: form.pessoa_id,
        mensagem: form.mensagem,
        detalhe: form.detalhe,
        ativo: true,
      });
      setShowAddModal(false);
      setForm({
        pessoa_id: "",
        mensagem: "Parabéns pela venda!",
        detalhe: "Você faz parte do crescimento da nossa empresa, nosso muito obrigado!",
        ativo: true,
      });
      onChange();
    } catch (err) {
      console.error(err);
      alert("Erro ao adicionar Primeira Venda");
    } finally {
      setSaving(false);
    }
  };

  const filteredPVs = pvs.filter(item => {
    if (!item.pessoa) return false;
    if (activeUnitId && activeUnitId !== "Todas") {
      return item.pessoa.unidade_id === activeUnitId;
    }
    return true;
  });

  return (
    <>
      <div className="pa-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div className="pa-title">Primeira Venda</div>
            <div className="pa-subtitle">Destaque as pessoas com as primeiras vendas do período</div>
          </div>
          <button className="pa-btn-primary" onClick={() => setShowAddModal(true)}>+ Adicionar primeira venda</button>
        </div>

        {filteredPVs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(255,255,255,.25)", fontSize: 14 }}>
            Nenhuma primeira venda cadastrada no momento. Clique em "+ Adicionar primeira venda".
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filteredPVs.map(item => (
              <div key={item.id} className="rank-row" style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px" }}>
                <Avatar pessoa={item.pessoa} size={36} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{item.pessoa.nome}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,.50)", marginTop: 2 }}>{item.mensagem}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginTop: 1 }}>{item.detalhe}</div>
                </div>
                <button className="pa-btn-danger" onClick={() => handleDelete(item.id)} title="Remover da primeira venda">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="pa-overlay" onClick={e => e.target === e.currentTarget && setShowAddModal(false)}>
          <div className="pa-modal" style={{ maxWidth: previewPessoa ? 640 : 440 }}>
            <div className="pa-modal-title">Adicionar Primeira Venda</div>

            <div style={{ display: "grid", gridTemplateColumns: previewPessoa ? "1fr 220px" : "1fr", gap: 24, marginTop: 14 }}>
              <div>
                <div className="pa-form-row">
                  <label className="pa-label">Corretor / Gestor</label>
                  <select className="pa-input pa-select" value={form.pessoa_id} onChange={e => setForm(f => ({ ...f, pessoa_id: e.target.value }))}>
                    <option value="">— selecione —</option>
                    {pessoas.filter(p => p.ativo && (activeUnitId === "Todas" || p.unidade_id === activeUnitId)).map(p => (
                      <option key={p.id} value={p.id}>{p.nome} ({p.cargo})</option>
                    ))}
                  </select>
                </div>
                <div className="pa-form-row">
                  <label className="pa-label">Mensagem principal</label>
                  <input className="pa-input" value={form.mensagem} onChange={e => setForm(f => ({ ...f, mensagem: e.target.value }))} />
                </div>
                <div className="pa-form-row">
                  <label className="pa-label">Texto complementar</label>
                  <textarea className="pa-input" rows={3} style={{ resize: "none" }} value={form.detalhe} onChange={e => setForm(f => ({ ...f, detalhe: e.target.value }))} />
                </div>
              </div>

              {previewPessoa && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.30)", letterSpacing: ".10em", textTransform: "uppercase", marginBottom: 8 }}>Preview</div>
                  <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,.10)", width: 220, boxShadow: "0 12px 40px rgba(0,0,0,.6)", background: "#000" }}>
                    <div style={{ height: 160, background: previewPessoa.foto_url ? `url(${previewPessoa.foto_url}) center/cover` : "linear-gradient(145deg,#1e1e38,#2e2e50)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                      {!previewPessoa.foto_url && (
                        <div style={{ width: 64, height: 64, borderRadius: "50%", background: GRADIENT_MAP[previewPessoa.cargo], display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow',sans-serif", fontWeight: 900, fontSize: 24, color: "#fff" }}>
                          {initials(previewPessoa.nome)}
                        </div>
                      )}
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px 12px", background: "linear-gradient(to top,rgba(0,0,0,.80),transparent)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 11, color: "#fff", letterSpacing: ".06em", textTransform: "uppercase" }}>{previewPessoa.nome}</span>
                        <img src={logoBranca} alt="Lopes" style={{ height: 11, width: "auto", filter: "brightness(0) invert(1)", opacity: 0.85 }} />
                      </div>
                    </div>
                    <div style={{ background: "#fff", padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                        <span style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 12, color: "#111" }}>{form.mensagem}</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#22c55e"/><path d="M8 12l3 3 5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <div style={{ fontSize: 10, color: "#555", lineHeight: 1.5, textTransform: "uppercase", letterSpacing: ".05em" }}>{form.detalhe}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14 }}>
              <button className="pa-btn-ghost" onClick={() => setShowAddModal(false)}>Cancelar</button>
              <button className="pa-btn-primary" onClick={handleAdd} disabled={saving || !form.pessoa_id}>{saving ? "Salvando…" : "Adicionar"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Helper para reconhecer o mês atual automaticamente
const getDetectedMonthString = () => {
  const date = new Date();
  const monthNames = [
    "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO",
    "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"
  ];
  return `${monthNames[date.getMonth()]} DE ${date.getFullYear()}`;
};

function SecaoMetas({ unidades, activeUnitId }: { unidades: Unidade[]; activeUnitId: string; }) {
  const [selectedUnidade, setSelectedUnidade] = useState("");
  const [form, setForm] = useState<Partial<ConfigMetas>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const detectedMonth = getDetectedMonthString();

  useEffect(() => {
    if (activeUnitId !== "Todas") {
      setSelectedUnidade(activeUnitId);
    } else if (!selectedUnidade && unidades.length > 0) {
      setSelectedUnidade(unidades[0]?.id || "");
    }
  }, [activeUnitId, unidades]);

  useEffect(() => {
    if (!selectedUnidade) return;
    setLoading(true);
    placarService.getConfig(selectedUnidade).then(c => {
      if (c) {
        setForm({
          ...c,
          meta_mensal_periodo: c.meta_mensal_periodo || detectedMonth,
        });
      } else {
        setForm({
          unidade_id: selectedUnidade,
          meta_mensal_titulo: `Meta Mensal - ${detectedMonth}`,
          meta_mensal_valor: 0,
          meta_mensal_realizado: 0,
          meta_mensal_periodo: detectedMonth,
        });
      }
      setLoading(false);
    });
  }, [selectedUnidade, detectedMonth]);

  const pctMensal = Math.min(100, ((form.meta_mensal_realizado || 0) / (form.meta_mensal_valor || 1)) * 100);

  const save = async () => {
    setSaving(true);
    try {
      await placarService.saveConfig({ ...form, unidade_id: selectedUnidade });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar a configuração. Verifique o console.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pa-card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div className="pa-title">Meta Mensal</div>
          <div className="pa-subtitle">Gerencie o objetivo financeiro mensal. A plataforma reconhece automaticamente o mês corrente.</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {saved && <span style={{ color: "#4ade80", fontSize: 13, fontWeight: 600 }}>✓ Salvo!</span>}
          <button className="pa-btn-primary" onClick={save} disabled={saving || loading}>{saving ? "Salvando…" : "Salvar Meta Mensal"}</button>
        </div>
      </div>

      {/* Monthly Auto-Detection Badge */}
      <div style={{
        background: "linear-gradient(90deg, rgba(255,0,128,.15), rgba(227,6,19,.10))",
        border: "1px solid rgba(255,0,128,.30)",
        borderRadius: 12,
        padding: "12px 18px",
        marginBottom: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>🗓️</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,.50)", textTransform: "uppercase", letterSpacing: ".08em" }}>Reconhecimento Automático de Data</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>Mês Atual Detectado: <span style={{ color: "#FF0080" }}>{detectedMonth}</span></div>
          </div>
        </div>
        <button
          className="pa-btn-ghost"
          style={{ padding: "4px 10px", fontSize: 12 }}
          onClick={() => setForm(f => ({ ...f, meta_mensal_periodo: detectedMonth }))}
        >
          Usar Mês Detectado
        </button>
      </div>

      {activeUnitId === "Todas" ? (
        <div style={{ marginBottom: 14 }}>
          <div className="pa-form-row">
            <label className="pa-label">Selecione a Unidade para Configurar</label>
            <select className="pa-input pa-select" value={selectedUnidade} onChange={e => setSelectedUnidade(e.target.value)}>
              {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
            </select>
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: 14, background: "rgba(255, 255, 255, 0.03)", borderRadius: 6, padding: "8px 12px", border: "1px dashed rgba(255, 255, 255, 0.08)", fontSize: 13, color: "rgba(255, 255, 255, 0.60)" }}>
          Configurando metas da unidade ativa: <strong>{unidades.find(u => u.id === activeUnitId)?.nome ?? activeUnitId}</strong>
        </div>
      )}

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "rgba(255,255,255,.30)", fontSize: 14 }}>Carregando dados da unidade...</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
          <div>
            <Field
              label="Título do Slide de Meta"
              value={form.meta_mensal_titulo ?? ""}
              onChange={val => setForm(f => ({ ...f, meta_mensal_titulo: val }))}
              disabled={loading}
            />
            <Field
              label="Mês / Período de Exibição"
              value={form.meta_mensal_periodo ?? ""}
              onChange={val => setForm(f => ({ ...f, meta_mensal_periodo: val }))}
              disabled={loading}
            />
            <Field
              label="Meta Total do Mês (R$)"
              value={form.meta_mensal_valor ?? ""}
              onChange={val => setForm(f => ({ ...f, meta_mensal_valor: parseBrazilianNumber(val) }))}
              disabled={loading}
              type="number"
            />
            <Field
              label="Realizado até o Momento (R$)"
              value={form.meta_mensal_realizado ?? ""}
              onChange={val => setForm(f => ({ ...f, meta_mensal_realizado: parseBrazilianNumber(val) }))}
              disabled={loading}
              type="number"
            />
          </div>

          {/* Card de Visualização do Progresso */}
          <div style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,.40)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 12 }}>
              Resumo do Desempenho Mensal
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.50)" }}>Objetivo do Mês</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>
                R$ {(form.meta_mensal_valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.50)" }}>Realizado no Mês</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#4ade80" }}>
                R$ {(form.meta_mensal_realizado || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.60)", marginBottom: 6 }}>
                <span>Progresso Atingido</span>
                <span style={{ color: "#FF0080" }}>{pctMensal.toFixed(1)}%</span>
              </div>
              <div style={{ height: 10, borderRadius: 9999, background: "rgba(255,255,255,.10)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pctMensal}%`, background: "linear-gradient(90deg,#FF0080,#FF6B35)", borderRadius: 9999, transition: "width 600ms" }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Section: Cultura ───────────────────────────────────────────────────────────

function SecaoCultura({ unidades, activeUnitId }: { unidades: Unidade[]; activeUnitId: string }) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [selectedSlideId, setSelectedSlideId] = useState<string>("slide-1");
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carrega slides do localStorage ou DEFAULT_SLIDES
  useEffect(() => {
    const saved = localStorage.getItem("lopes_cultura_slides");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Slide[];
        setSlides(parsed.sort((a, b) => a.ordem - b.ordem));
        if (parsed.length > 0) {
          setSelectedSlideId(parsed[0].id);
        }
      } catch {
        setSlides([...DEFAULT_SLIDES]);
      }
    } else {
      setSlides([...DEFAULT_SLIDES]);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = (updatedSlides: Slide[]) => {
    localStorage.setItem("lopes_cultura_slides", JSON.stringify(updatedSlides));
    setSlides(updatedSlides);
    // Dispara evento customizado para atualizar as telas da TV instantaneamente
    window.dispatchEvent(new Event("lopes_slides_updated"));
    showToast("Slides atualizados com sucesso! 🚀");
  };

  const handleReset = () => {
    if (confirm("Restaurar todos os slides para o padrão original da Cultura Lopes? Suas edições atuais serão perdidas.")) {
      const reset = DEFAULT_SLIDES.map((s, idx) => ({ ...s, ordem: idx + 1 }));
      handleSave(reset);
      if (reset.length > 0) {
        setSelectedSlideId(reset[0].id);
      }
    }
  };

  const moveSlide = (index: number, direction: "up" | "down") => {
    const newSlides = [...slides];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newSlides.length) return;

    // Troca os slides de posição
    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIdx];
    newSlides[targetIdx] = temp;

    // Reordena sequencialmente
    newSlides.forEach((s, idx) => {
      s.ordem = idx + 1;
    });

    handleSave(newSlides);
  };

  const toggleAtivo = (index: number) => {
    const newSlides = [...slides];
    newSlides[index].ativo = !newSlides[index].ativo;
    handleSave(newSlides);
  };

  const openEdit = (slide: Slide) => {
    setEditingSlide(JSON.parse(JSON.stringify(slide))); // Clone profundo para edição limpa
  };

  const saveEditedSlide = () => {
    if (!editingSlide) return;
    const newSlides = slides.map(s => s.id === editingSlide.id ? editingSlide : s);
    handleSave(newSlides);
    setEditingSlide(null);
  };

  const selectedSlide = slides.find(s => s.id === selectedSlideId) || slides[0];
  const activeUnitName = unidades.find(u => u.id === activeUnitId)?.nome || "Marista";

  const renderBulletListTextarea = (subtexts: string[] | undefined) => {
    return subtexts ? subtexts.join("\n") : "";
  };

  return (
    <>
      <div className="pa-card" style={{ maxWidth: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div className="pa-title">Cultura Lopes Onboarding</div>
            <div className="pa-subtitle">Gerencie e ordene os slides de apresentação digital de forma flexível e modular</div>
          </div>
          <button className="pa-btn-ghost" onClick={handleReset} style={{ display: "flex", alignItems: "center", gap: 6, borderColor: "rgba(227,6,19,.4)" }}>
            <Icons.Refresh size={14} color="#ff6b6b" />
            Restaurar Padrão
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 24, alignItems: "start" }}>
          
          {/* Coluna Esquerda: Lista de Slides */}
          <div className="pa-table-wrap" style={{ border: "1px solid rgba(255,255,255,.06)", borderRadius: 10, background: "rgba(0,0,0,.15)" }}>
            <table className="pa-table">
              <thead>
                <tr>
                  <th style={{ width: 60, textAlign: "center" }}>Ordem</th>
                  <th>Template</th>
                  <th>Título do Slide</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {slides.map((s, idx) => {
                  const isHighlighted = s.id === selectedSlideId;
                  return (
                    <tr 
                      key={s.id} 
                      onClick={() => setSelectedSlideId(s.id)}
                      style={{ 
                        cursor: "pointer", 
                        background: isHighlighted ? "rgba(227,6,19,.08)" : "transparent",
                        borderLeft: isHighlighted ? "3px solid #E30613" : "none"
                      }}
                    >
                      <td style={{ textAlign: "center", fontWeight: 700, color: "rgba(255,255,255,.6)" }}>
                        {s.ordem}
                      </td>
                      <td>
                        <span className="badge-gestor" style={{ textTransform: "uppercase", fontSize: 10, padding: "2px 6px" }}>
                          {s.template}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        <div style={{ maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {s.title.replace(/\\n/g, " ").replace(/\n/g, " ")}
                        </div>
                      </td>
                      <td>
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleAtivo(idx); }}
                          style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
                        >
                          <span className={s.ativo ? "badge-ativo" : "badge-inativo"}>
                            {s.ativo ? "ativo" : "inativo"}
                          </span>
                        </button>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }} onClick={e => e.stopPropagation()}>
                          <button 
                            className="pa-btn-ghost" 
                            style={{ padding: "6px 8px" }} 
                            disabled={idx === 0} 
                            onClick={() => moveSlide(idx, "up")}
                          >
                            ▲
                          </button>
                          <button 
                            className="pa-btn-ghost" 
                            style={{ padding: "6px 8px" }} 
                            disabled={idx === slides.length - 1} 
                            onClick={() => moveSlide(idx, "down")}
                          >
                            ▼
                          </button>
                          <button 
                            className="pa-btn-ghost" 
                            style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px" }}
                            onClick={() => openEdit(s)}
                          >
                            <Icons.Edit size={12} />
                            Editar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Coluna Direita: Live Mockup Preview */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: 13, color: "rgba(255,255,255,.50)", textTransform: "uppercase", letterSpacing: ".08em" }}>
              📺 Mockup de Visualização (Mini)
            </div>

            {selectedSlide ? (
              <div 
                style={{ 
                  aspectRatio: "16/9", 
                  width: "100%", 
                  background: "radial-gradient(circle at center, #1b090b 0%, #0d0405 100%)", 
                  borderRadius: 14, 
                  border: "2px solid rgba(227,6,19,.25)", 
                  boxShadow: "0 12px 32px rgba(0,0,0,.6)",
                  position: "relative",
                  overflow: "hidden",
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "#fff",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "8px"
                }}
              >
                {/* Logo da Lopes Superior */}
                <div style={{ position: "absolute", top: 10, right: 10, opacity: 0.75 }}>
                  <img src={logoBranca} alt="Logo" style={{ height: 6, width: "auto" }} />
                </div>

                {/* TEMPLATE 1: COVER */}
                {selectedSlide.template === "cover" && (
                  <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    {selectedSlide.year && (
                      <span style={{ fontSize: 5, fontWeight: 900, background: "rgba(227,6,19,.15)", border: "1px solid rgba(227,6,19,.3)", padding: "1px 4px", borderRadius: 4, color: "#fca5a5" }}>
                        {selectedSlide.year}
                      </span>
                    )}
                    <h1 style={{ fontSize: 13, fontWeight: 900, fontFamily: "'Barlow', sans-serif", lineHeight: 1.1, color: "#fff", textTransform: "uppercase", whiteSpace: "pre-line" }}>
                      {selectedSlide.title.replace(/{unidade}/g, activeUnitName)}
                    </h1>
                    <div style={{ width: 14, height: 1.5, background: "linear-gradient(90deg,#E30613,#ff6b6b)", borderRadius: 999 }}></div>
                    {selectedSlide.subtitle && (
                      <p style={{ fontSize: 6, color: "rgba(255,255,255,.7)", maxWidth: "80%" }}>
                        {selectedSlide.subtitle.replace(/{unidade}/g, activeUnitName)}
                      </p>
                    )}
                    {selectedSlide.unitLabel && (
                      <div style={{ background: "linear-gradient(90deg, #9E0018, #60000E)", border: "1px solid rgba(255,255,255,.1)", padding: "2px 6px", borderRadius: 4, marginTop: 4 }}>
                        <span style={{ fontSize: 5, fontWeight: 900, letterSpacing: ".1em" }}>
                          {selectedSlide.unitLabel.replace(/{unidade}/g, activeUnitName)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* TEMPLATE 2: WELCOME */}
                {selectedSlide.template === "welcome" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 10, width: "100%", textAlign: "left" }}>
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 3 }}>
                      <span style={{ fontSize: 5, fontWeight: 900, color: "#fca5a5", letterSpacing: ".05em" }}>
                        {selectedSlide.subtitle?.replace(/{unidade}/g, activeUnitName)}
                      </span>
                      <h2 style={{ fontSize: 9, fontWeight: 900, lineHeight: 1.1, color: "#fff" }}>
                        {selectedSlide.title.replace(/{unidade}/g, activeUnitName)}
                      </h2>
                      <p style={{ fontSize: 5, color: "rgba(255,255,255,.6)", lineHeight: 1.3 }}>
                        {selectedSlide.body?.replace(/{unidade}/g, activeUnitName).slice(0, 180)}...
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                      <div style={{ padding: 2, borderRadius: "50%", background: "#190303" }}>
                        <div style={{ width: 48, height: 48, borderRadius: "50%", overflow: "hidden", border: "2px solid #E30613" }}>
                          {selectedSlide.image_url ? (
                            <img src={selectedSlide.image_url} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <div style={{ width: "100%", height: "100%", background: "rgba(255,255,255,.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,.2)" }}>👤</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TEMPLATE 3: BULLETS */}
                {selectedSlide.template === "bullets" && (
                  <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 4, textAlign: "left" }}>
                    <div>
                      <span style={{ fontSize: 5, fontWeight: 900, color: "#fca5a5", letterSpacing: ".05em" }}>
                        {selectedSlide.subtitle?.replace(/{unidade}/g, activeUnitName)}
                      </span>
                      <h2 style={{ fontSize: 8, fontWeight: 900, color: "#fff", textTransform: "uppercase" }}>
                        {selectedSlide.title.replace(/{unidade}/g, activeUnitName)}
                      </h2>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 2 }}>
                      {selectedSlide.bullets?.slice(0, 3).map((item, bIdx) => (
                        <div key={bIdx} style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.05)", padding: 4, borderRadius: 6 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 2 }}>
                            <span style={{ fontSize: 5, fontWeight: 900, color: "#ef4444" }}>{bIdx + 1}</span>
                            <span style={{ fontSize: 5.5, fontWeight: 700, color: "#fff" }}>{item.title.replace(/{unidade}/g, activeUnitName)}</span>
                          </div>
                          <ul style={{ paddingLeft: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                            {item.subtexts?.slice(0, 3).map((sub, sIdx) => (
                              <li key={sIdx} style={{ fontSize: 4.5, color: "rgba(255,255,255,.5)", listStyle: "none" }}>
                                • {sub.replace(/{unidade}/g, activeUnitName).slice(0, 35)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TEMPLATE 4: GRID, TOOLS, MARKETING */}
                {(selectedSlide.template === "grid" || selectedSlide.template === "tools" || selectedSlide.template === "marketing") && (
                  <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 4, textAlign: "center" }}>
                    <div>
                      <h2 style={{ fontSize: 9, fontWeight: 900, color: "#fff", textTransform: "uppercase" }}>
                        {selectedSlide.title.replace(/{unidade}/g, activeUnitName)}
                      </h2>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 2, textAlign: "left" }}>
                      {selectedSlide.cards?.slice(0, 3).map((card, cIdx) => {
                        const borderCol = card.variant === "primary" ? "#3b82f6" : card.variant === "accent" ? "#ef4444" : "#00c6ff";
                        return (
                          <div key={cIdx} style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.05)", borderTop: `2px solid ${borderCol}`, padding: 5, borderRadius: 6, display: "flex", flexDirection: "column", gap: 2 }}>
                            <span style={{ fontSize: 5, fontWeight: 900, color: borderCol, textTransform: "uppercase" }}>{card.title}</span>
                            <p style={{ fontSize: 4.5, color: "rgba(255,255,255,.7)", lineHeight: 1.2 }}>{card.content.replace(/{unidade}/g, activeUnitName).slice(0, 75)}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TEMPLATE 5: SPLIT-METRICS, MERITOCRACIA */}
                {(selectedSlide.template === "split-metrics" || selectedSlide.template === "meritocracia") && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%", textAlign: "left" }}>
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 3 }}>
                      <h2 style={{ fontSize: 9, fontWeight: 900, color: "#fff", textTransform: "uppercase" }}>
                        {selectedSlide.title.replace(/{unidade}/g, activeUnitName)}
                      </h2>
                      <p style={{ fontSize: 5, color: "rgba(255,255,255,.6)", lineHeight: 1.2 }}>
                        {selectedSlide.body?.replace(/{unidade}/g, activeUnitName).slice(0, 100)}...
                      </p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, justifyContent: "center" }}>
                      {selectedSlide.metrics?.slice(0, 3).map((m, mIdx) => (
                        <div key={mIdx} style={{ background: "rgba(255,255,255,.04)", borderLeft: "2px solid #ef4444", padding: "3px 6px", borderRadius: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 4.5, color: "rgba(255,255,255,.8)" }}>{m.label.replace(/{unidade}/g, activeUnitName)}</span>
                          <span style={{ fontSize: 8, fontWeight: 900, color: "#ef4444", fontFamily: "monospace" }}>{m.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TEMPLATE 6: MAP */}
                {selectedSlide.template === "map" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 8, width: "100%", textAlign: "left" }}>
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 3 }}>
                      <span style={{ fontSize: 5, fontWeight: 900, color: "#fca5a5" }}>{selectedSlide.subtitle}</span>
                      <h2 style={{ fontSize: 8.5, fontWeight: 900, color: "#fff", textTransform: "uppercase" }}>
                        {selectedSlide.title.replace(/{unidade}/g, activeUnitName)}
                      </h2>
                      <p style={{ fontSize: 4.8, color: "rgba(255,255,255,.6)", lineHeight: 1.2 }}>
                        {selectedSlide.body?.replace(/{unidade}/g, activeUnitName)}
                      </p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, justifyContent: "center" }}>
                      <div style={{ background: "rgba(227,6,19,.1)", border: "1px solid rgba(227,6,19,.3)", padding: 4, borderRadius: 6, textAlign: "center" }}>
                        <div style={{ fontSize: 9, fontWeight: 900, color: "#fff" }}>{selectedSlide.mapData?.regionCount}</div>
                        <div style={{ fontSize: 4.5, color: "rgba(255,255,255,.6)" }}>Estados de Presença Ativa</div>
                      </div>
                      <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.05)", padding: 4, borderRadius: 6, fontSize: 4.5, color: "rgba(255,255,255,.7)", textAlign: "center" }}>
                        {selectedSlide.mapData?.centerHighlight}
                      </div>
                    </div>
                  </div>
                )}

                {/* TEMPLATE: TEAM-GRID */}
                {selectedSlide.template === "team-grid" && (
                  <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 3, textAlign: "center" }}>
                    <h2 style={{ fontSize: 8, fontWeight: 900, color: "#fff", textTransform: "uppercase" }}>
                      {selectedSlide.title.replace(/{unidade}/g, activeUnitName)}
                    </h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 3, marginTop: 2 }}>
                      {selectedSlide.teamMembers?.slice(0, 6).map((member, mIdx) => (
                        <div key={mIdx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                          <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#E30613", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {member.image_url ? (
                              <img src={member.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              <span style={{ fontSize: 4 }}>👤</span>
                            )}
                          </div>
                          <span style={{ fontSize: 3.5, color: "#fff", fontWeight: 700, whiteSpace: "nowrap" }}>{member.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TEMPLATE: TIMELINE */}
                {selectedSlide.template === "timeline" && (
                  <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 3, textAlign: "left" }}>
                    <h2 style={{ fontSize: 8, fontWeight: 900, color: "#fff", textTransform: "uppercase" }}>
                      {selectedSlide.title.replace(/{unidade}/g, activeUnitName)}
                    </h2>
                    <div style={{ display: "flex", gap: 4, marginTop: 2, overflowX: "hidden" }}>
                      {selectedSlide.timelineItems?.slice(0, 3).map((item, tIdx) => (
                        <div key={tIdx} style={{ background: "rgba(255,255,255,.04)", padding: 4, borderRadius: 4, flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: 4, color: "#ef4444", fontWeight: 800 }}>Etapa {tIdx + 1}</span>
                          <div style={{ fontSize: 4.5, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</div>
                          <p style={{ fontSize: 3.5, color: "rgba(255,255,255,.5)", lineHeight: 1.1 }}>{item.description.slice(0, 40)}...</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TEMPLATE: CAMPAIGN */}
                {selectedSlide.template === "campaign" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 8, width: "100%", textAlign: "left" }}>
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 2 }}>
                      <span style={{ fontSize: 4, fontWeight: 900, color: "#fca5a5" }}>{selectedSlide.subtitle}</span>
                      <h2 style={{ fontSize: 8.5, fontWeight: 900, color: "#fff", textTransform: "uppercase" }}>
                        {selectedSlide.title.replace(/{unidade}/g, activeUnitName)}
                      </h2>
                      <p style={{ fontSize: 4.5, color: "rgba(255,255,255,.6)", lineHeight: 1.2 }}>
                        {selectedSlide.body?.slice(0, 80)}...
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: "100%", height: 36, borderRadius: 6, background: "rgba(255,255,255,0.05)", border: "1px dashed rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {selectedSlide.image_url ? (
                          <img src={selectedSlide.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6 }} />
                        ) : (
                          <span style={{ fontSize: 5 }}>📢</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TEMPLATE: SPIN */}
                {selectedSlide.template === "spin" && (
                  <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 3, textAlign: "center" }}>
                    <h2 style={{ fontSize: 8, fontWeight: 900, color: "#fff", textTransform: "uppercase" }}>
                      {selectedSlide.title.replace(/{unidade}/g, activeUnitName)}
                    </h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4, marginTop: 2 }}>
                      {selectedSlide.spinData?.slice(0, 4).map((item, idx) => (
                        <div key={idx} style={{ background: "rgba(255,255,255,.04)", padding: 4, borderRadius: 6, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#E30613", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 5, fontWeight: 900 }}>
                            {item.letter}
                          </div>
                          <span style={{ fontSize: 4, color: "#fff", fontWeight: 700 }}>{item.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TEMPLATE: CAREER */}
                {selectedSlide.template === "career" && (
                  <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 3, textAlign: "center" }}>
                    <h2 style={{ fontSize: 8, fontWeight: 900, color: "#fff", textTransform: "uppercase" }}>
                      {selectedSlide.title.replace(/{unidade}/g, activeUnitName)}
                    </h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: 1.5, marginTop: 1, maxWidth: 160, margin: "0 auto", width: "100%" }}>
                      {selectedSlide.careerTiers?.slice(0, 5).map((tier, idx) => (
                        <div key={idx} style={{ background: idx === 0 ? "rgba(227,6,19,.15)" : "rgba(255,255,255,.03)", padding: "1.5px 4px", borderRadius: 3, display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid rgba(255,255,255,.05)" }}>
                          <span style={{ fontSize: 4, color: "#fff", fontWeight: 700 }}>{tier.name}</span>
                          <span style={{ fontSize: 5, color: "#E30613", fontWeight: 900 }}>{tier.percentage}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TEMPLATE: BENEFITS */}
                {selectedSlide.template === "benefits" && (
                  <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 3, textAlign: "center" }}>
                    <h2 style={{ fontSize: 8, fontWeight: 900, color: "#fff", textTransform: "uppercase" }}>
                      {selectedSlide.title.replace(/{unidade}/g, activeUnitName)}
                    </h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4, marginTop: 2 }}>
                      {selectedSlide.images?.slice(0, 8).map((url, idx) => (
                        <div key={idx} style={{ background: "rgba(255,255,255,.05)", borderRadius: 4, height: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <img src={url} alt="" style={{ maxHeight: "80%", maxWidth: "80%", objectFit: "contain" }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TEMPLATE: DRESS-CODE */}
                {selectedSlide.template === "dress-code" && (
                  <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 3, textAlign: "center" }}>
                    <h2 style={{ fontSize: 8, fontWeight: 900, color: "#fff", textTransform: "uppercase" }}>
                      {selectedSlide.title.replace(/{unidade}/g, activeUnitName)}
                    </h2>
                    <div style={{ display: "flex", gap: 3, marginTop: 2, justifyContent: "center" }}>
                      {selectedSlide.images?.slice(0, 5).map((url, idx) => (
                        <div key={idx} style={{ width: 14, height: 22, borderRadius: 3, overflow: "hidden", background: "rgba(255,255,255,.05)" }}>
                          <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div style={{ aspectRatio: "16/9", background: "rgba(255,255,255,.02)", border: "1px dashed rgba(255,255,255,.1)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,.3)" }}>
                Selecione um slide para pré-visualizar
              </div>
            )}
            
            <p style={{ fontSize: 11, color: "rgba(255,255,255,.35)", textAlign: "center", lineHeight: 1.4 }}>
              As edições salvas aqui são propagadas via WebSocket/Storage Event em tempo real para os displays ativos nas TVs de recepção.
            </p>
          </div>

        </div>
      </div>

      {/* Editor Modal Overlay */}
      {editingSlide !== null && (
        <div className="pa-overlay" onClick={e => e.target === e.currentTarget && setEditingSlide(null)}>
          <div className="pa-modal" style={{ maxWidth: 640 }}>
            <div className="pa-modal-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,.1)", paddingBottom: 12 }}>
              <span>📝 Editar Slide {editingSlide.ordem}</span>
              <span className="badge-gestor" style={{ textTransform: "uppercase" }}>{editingSlide.template}</span>
            </div>

            <div style={{ maxHeight: "64vh", overflowY: "auto", paddingRight: 8, marginTop: 16 }}>
              
              {/* Campos Globais baseados no layout do Template */}
              
              {/* EDITANDO: COVER */}
              {editingSlide.template === "cover" && (
                <div className="pa-grid-2">
                  <div className="pa-form-row" style={{ gridColumn: "1 / -1" }}>
                    <label className="pa-label">Título Principal (Use \n para pular linha)</label>
                    <textarea 
                      className="pa-input" 
                      rows={3} 
                      value={editingSlide.title} 
                      onChange={e => setEditingSlide({ ...editingSlide, title: e.target.value })} 
                      placeholder="Ex: NOVOS\nCORRETORES\nONBOARDING"
                    />
                  </div>
                  <div className="pa-form-row" style={{ gridColumn: "1 / -1" }}>
                    <label className="pa-label">Subtítulo</label>
                    <input 
                      className="pa-input" 
                      value={editingSlide.subtitle || ""} 
                      onChange={e => setEditingSlide({ ...editingSlide, subtitle: e.target.value })} 
                      placeholder="Ex: Guia para te auxiliar..."
                    />
                  </div>
                  <div className="pa-form-row">
                    <label className="pa-label">Ano de Referência</label>
                    <input 
                      className="pa-input" 
                      value={editingSlide.year || ""} 
                      onChange={e => setEditingSlide({ ...editingSlide, year: e.target.value })} 
                      placeholder="Ex: 2026"
                    />
                  </div>
                  <div className="pa-form-row">
                    <label className="pa-label">Rótulo de Unidade</label>
                    <input 
                      className="pa-input" 
                      value={editingSlide.unitLabel || ""} 
                      onChange={e => setEditingSlide({ ...editingSlide, unitLabel: e.target.value })} 
                      placeholder="Ex: LOPES {unidade}"
                    />
                  </div>
                </div>
              )}

              {/* EDITANDO: WELCOME */}
              {editingSlide.template === "welcome" && (
                <div className="pa-grid-2">
                  <div className="pa-form-row" style={{ gridColumn: "1 / -1" }}>
                    <label className="pa-label">Subtítulo / Introdução</label>
                    <input 
                      className="pa-input" 
                      value={editingSlide.subtitle || ""} 
                      onChange={e => setEditingSlide({ ...editingSlide, subtitle: e.target.value })} 
                      placeholder="Ex: BEM-VINDO À FAMÍLIA LOPES"
                    />
                  </div>
                  <div className="pa-form-row" style={{ gridColumn: "1 / -1" }}>
                    <label className="pa-label">Título da Mensagem</label>
                    <textarea 
                      className="pa-input" 
                      rows={2} 
                      value={editingSlide.title} 
                      onChange={e => setEditingSlide({ ...editingSlide, title: e.target.value })} 
                      placeholder="Ex: Palavra da Diretoria"
                    />
                  </div>
                  <div className="pa-form-row" style={{ gridColumn: "1 / -1" }}>
                    <label className="pa-label">Texto Principal da Mensagem</label>
                    <textarea 
                      className="pa-input" 
                      rows={4} 
                      value={editingSlide.body || ""} 
                      onChange={e => setEditingSlide({ ...editingSlide, body: e.target.value })} 
                      placeholder="Digite o texto de boas-vindas..."
                    />
                  </div>

                  {/* Foto de Perfil do Diretor */}
                  <div className="pa-form-row" style={{ gridColumn: "1 / -1" }}>
                    <label className="pa-label">Foto Boas-vindas (Diretor / Equipe)</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 4 }}>
                      <div style={{
                        width: 72, height: 72, borderRadius: "50%", overflow: "hidden",
                        border: "2px solid #E30613",
                        background: editingSlide.image_url ? `url(${editingSlide.image_url}) center/cover no-repeat` : "rgba(255,255,255,0.05)",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                      }}>
                        {!editingSlide.image_url && <span>👤</span>}
                      </div>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            type="button"
                            className="pa-btn-ghost"
                            style={{ padding: "6px 12px", fontSize: 13 }}
                            onClick={() => fileInputRef.current?.click()}
                          >
                            Carregar Nova Imagem
                          </button>
                          {editingSlide.image_url && (
                            <button
                              type="button"
                              className="pa-btn-ghost"
                              style={{ padding: "6px 12px", fontSize: 13, borderColor: "rgba(99,102,241,.35)", color: "#818cf8" }}
                              onClick={() => setCropSrc(editingSlide.image_url!)}
                            >
                              ✂️ Recortar
                            </button>
                          )}
                        </div>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>JPEG/PNG recomendado, corte circular automático</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* EDITANDO: BULLETS */}
              {editingSlide.template === "bullets" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div className="pa-grid-2">
                    <div className="pa-form-row">
                      <label className="pa-label">Subtítulo do Slide</label>
                      <input 
                        className="pa-input" 
                        value={editingSlide.subtitle || ""} 
                        onChange={e => setEditingSlide({ ...editingSlide, subtitle: e.target.value })} 
                        placeholder="Ex: NOSSOS DIFERENCIAIS"
                      />
                    </div>
                    <div className="pa-form-row">
                      <label className="pa-label">Título Geral</label>
                      <input 
                        className="pa-input" 
                        value={editingSlide.title} 
                        onChange={e => setEditingSlide({ ...editingSlide, title: e.target.value })} 
                        placeholder="Ex: POR QUE TRABALHAR CONOSCO?"
                      />
                    </div>
                  </div>

                  {/* Edição dos Bullets (Máximo 3 Colunas) */}
                  <div style={{ borderTop: "1px dashed rgba(255,255,255,.1)", paddingTop: 14 }}>
                    <span className="pa-label" style={{ marginBottom: 10 }}>Colunas de Conteúdo (Máx 3)</span>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {(editingSlide.bullets || []).map((bullet, idx) => (
                        <div key={idx} style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.05)", borderRadius: 10, padding: 12 }}>
                          <div style={{ fontWeight: 700, fontSize: 12, color: "#ef4444", marginBottom: 8, textTransform: "uppercase" }}>
                            Coluna {idx + 1}
                          </div>
                          <div className="pa-form-row" style={{ marginBottom: 8 }}>
                            <label className="pa-label" style={{ fontSize: 10 }}>Título da Coluna</label>
                            <input 
                              className="pa-input" 
                              value={bullet.title} 
                              onChange={e => {
                                const newBullets = [...(editingSlide.bullets || [])];
                                newBullets[idx].title = e.target.value;
                                setEditingSlide({ ...editingSlide, bullets: newBullets });
                              }}
                            />
                          </div>
                          <div className="pa-form-row">
                            <label className="pa-label" style={{ fontSize: 10 }}>Itens da Lista (Um por linha)</label>
                            <textarea 
                              className="pa-input" 
                              rows={3} 
                              value={renderBulletListTextarea(bullet.subtexts)} 
                              onChange={e => {
                                const newBullets = [...(editingSlide.bullets || [])];
                                newBullets[idx].subtexts = e.target.value.split("\n").filter(line => line.trim() !== "");
                                setEditingSlide({ ...editingSlide, bullets: newBullets });
                              }}
                              placeholder="Marcador 1&#10;Marcador 2&#10;Marcador 3"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* EDITANDO: GRID */}
              {editingSlide.template === "grid" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div className="pa-grid-2">
                    <div className="pa-form-row">
                      <label className="pa-label">Subtítulo do Slide</label>
                      <input 
                        className="pa-input" 
                        value={editingSlide.subtitle || ""} 
                        onChange={e => setEditingSlide({ ...editingSlide, subtitle: e.target.value })} 
                        placeholder="Ex: CULTURA LOPES"
                      />
                    </div>
                    <div className="pa-form-row">
                      <label className="pa-label">Título Geral</label>
                      <input 
                        className="pa-input" 
                        value={editingSlide.title} 
                        onChange={e => setEditingSlide({ ...editingSlide, title: e.target.value })} 
                        placeholder="Ex: MISSÃO, VISÃO E VALORES"
                      />
                    </div>
                  </div>

                  {/* Edição dos Cards MVV */}
                  <div style={{ borderTop: "1px dashed rgba(255,255,255,.1)", paddingTop: 14 }}>
                    <span className="pa-label" style={{ marginBottom: 10 }}>Configuração dos 3 Pilares</span>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {(editingSlide.cards || []).map((card, idx) => (
                        <div key={idx} style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.05)", borderRadius: 10, padding: 12 }}>
                          <div style={{ fontWeight: 700, fontSize: 12, color: card.variant === "primary" ? "#818cf8" : card.variant === "accent" ? "#f87171" : "#22d3ee", marginBottom: 8, textTransform: "uppercase" }}>
                            Pilar {idx + 1}
                          </div>
                          <div className="pa-grid-2">
                            <div className="pa-form-row">
                              <label className="pa-label" style={{ fontSize: 10 }}>Nome do Pilar</label>
                              <input 
                                className="pa-input" 
                                value={card.title} 
                                onChange={e => {
                                  const newCards = [...(editingSlide.cards || [])];
                                  newCards[idx].title = e.target.value;
                                  setEditingSlide({ ...editingSlide, cards: newCards });
                                }}
                              />
                            </div>
                            <div className="pa-form-row">
                              <label className="pa-label" style={{ fontSize: 10 }}>Estilo Visual</label>
                              <select 
                                className="pa-input pa-select" 
                                value={card.variant || "primary"} 
                                onChange={e => {
                                  const newCards = [...(editingSlide.cards || [])];
                                  newCards[idx].variant = e.target.value as "primary" | "secondary" | "accent";
                                  setEditingSlide({ ...editingSlide, cards: newCards });
                                }}
                              >
                                <option value="primary">Indigo / Primary</option>
                                <option value="secondary">Cyan / Secondary</option>
                                <option value="accent">Red / Accent</option>
                              </select>
                            </div>
                          </div>
                          <div className="pa-form-row" style={{ marginTop: 8 }}>
                            <label className="pa-label" style={{ fontSize: 10 }}>Conteúdo Principal</label>
                            <textarea 
                              className="pa-input" 
                              rows={3} 
                              value={card.content} 
                              onChange={e => {
                                const newCards = [...(editingSlide.cards || [])];
                                newCards[idx].content = e.target.value;
                                setEditingSlide({ ...editingSlide, cards: newCards });
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* EDITANDO: SPLIT-METRICS */}
              {editingSlide.template === "split-metrics" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div className="pa-grid-2">
                    <div className="pa-form-row" style={{ gridColumn: "1 / -1" }}>
                      <label className="pa-label">Título Geral do Painel</label>
                      <input 
                        className="pa-input" 
                        value={editingSlide.title} 
                        onChange={e => setEditingSlide({ ...editingSlide, title: e.target.value })} 
                        placeholder="Ex: A MAIOR REDE DO BRASIL"
                      />
                    </div>
                    <div className="pa-form-row" style={{ gridColumn: "1 / -1" }}>
                      <label className="pa-label">Descrição Geral</label>
                      <textarea 
                        className="pa-input" 
                        rows={2} 
                        value={editingSlide.body || ""} 
                        onChange={e => setEditingSlide({ ...editingSlide, body: e.target.value })} 
                        placeholder="Digite o texto explicativo sobre as métricas..."
                      />
                    </div>
                  </div>

                  {/* Edição das Métricas (Máximo 3) */}
                  <div style={{ borderTop: "1px dashed rgba(255,255,255,.1)", paddingTop: 14 }}>
                    <span className="pa-label" style={{ marginBottom: 10 }}>Metas e Indicadores Chave</span>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {(editingSlide.metrics || []).map((metric, idx) => (
                        <div key={idx} style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.05)", borderRadius: 10, padding: 12 }}>
                          <div className="pa-grid-2">
                            <div className="pa-form-row" style={{ marginBottom: 0 }}>
                              <label className="pa-label" style={{ fontSize: 10 }}>Nome do Indicador</label>
                              <input 
                                className="pa-input" 
                                value={metric.label} 
                                onChange={e => {
                                  const newMetrics = [...(editingSlide.metrics || [])];
                                  newMetrics[idx].label = e.target.value;
                                  setEditingSlide({ ...editingSlide, metrics: newMetrics });
                                }}
                                placeholder="Ex: Lojas abertas"
                              />
                            </div>
                            <div className="pa-form-row" style={{ marginBottom: 0 }}>
                              <label className="pa-label" style={{ fontSize: 10 }}>Valor Numérico (Ex: +178)</label>
                              <input 
                                className="pa-input" 
                                value={metric.value} 
                                onChange={e => {
                                  const newMetrics = [...(editingSlide.metrics || [])];
                                  newMetrics[idx].value = e.target.value;
                                  setEditingSlide({ ...editingSlide, metrics: newMetrics });
                                }}
                                placeholder="Ex: +178"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Imagem do Split */}
                  <div className="pa-form-row" style={{ borderTop: "1px dashed rgba(255,255,255,.1)", paddingTop: 14 }}>
                    <label className="pa-label">Imagem Informativa Lateral</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 4 }}>
                      <div style={{
                        width: 90, height: 50, borderRadius: 8, overflow: "hidden",
                        border: "1px solid rgba(255,255,255,.1)",
                        background: editingSlide.image_url ? `url(${editingSlide.image_url}) center/cover no-repeat` : "rgba(255,255,255,0.05)",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                      }}>
                        {!editingSlide.image_url && <span style={{ fontSize: 10 }}>Visual</span>}
                      </div>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            type="button"
                            className="pa-btn-ghost"
                            style={{ padding: "6px 12px", fontSize: 13 }}
                            onClick={() => fileInputRef.current?.click()}
                          >
                            Upload Foto
                          </button>
                        </div>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>JPEG/PNG de proporção retangular recomendado</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* EDITANDO: MAPA */}
              {editingSlide.template === "map" && (
                <div className="pa-grid-2">
                  <div className="pa-form-row" style={{ gridColumn: "1 / -1" }}>
                    <label className="pa-label">Subtítulo Superior</label>
                    <input 
                      className="pa-input" 
                      value={editingSlide.subtitle || ""} 
                      onChange={e => setEditingSlide({ ...editingSlide, subtitle: e.target.value })} 
                      placeholder="Ex: NOSSA PRESENÇA NACIONAL"
                    />
                  </div>
                  <div className="pa-form-row" style={{ gridColumn: "1 / -1" }}>
                    <label className="pa-label">Título Principal</label>
                    <input 
                      className="pa-input" 
                      value={editingSlide.title} 
                      onChange={e => setEditingSlide({ ...editingSlide, title: e.target.value })} 
                      placeholder="Ex: DO SUL AO NORTE"
                    />
                  </div>
                  <div className="pa-form-row" style={{ gridColumn: "1 / -1" }}>
                    <label className="pa-label">Corpo de Texto Informativo</label>
                    <textarea 
                      className="pa-input" 
                      rows={3} 
                      value={editingSlide.body || ""} 
                      onChange={e => setEditingSlide({ ...editingSlide, body: e.target.value })} 
                      placeholder="Explique a capilaridade da rede..."
                    />
                  </div>
                  <div className="pa-form-row">
                    <label className="pa-label">Contagem de Regiões / Estados</label>
                    <input 
                      className="pa-input" 
                      value={editingSlide.mapData?.regionCount || ""} 
                      onChange={e => {
                        const newMap = { ...(editingSlide.mapData || { regionCount: "", centerHighlight: "" }), regionCount: e.target.value };
                        setEditingSlide({ ...editingSlide, mapData: newMap });
                      }}
                      placeholder="Ex: 26 Estados + DF"
                    />
                  </div>
                  <div className="pa-form-row">
                    <label className="pa-label">Destaque Regional</label>
                    <input 
                      className="pa-input" 
                      value={editingSlide.mapData?.centerHighlight || ""} 
                      onChange={e => {
                        const newMap = { ...(editingSlide.mapData || { regionCount: "", centerHighlight: "" }), centerHighlight: e.target.value };
                        setEditingSlide({ ...editingSlide, mapData: newMap });
                      }}
                      placeholder="Ex: Presença Forte no Centro-Oeste"
                    />
                  </div>
                </div>
              )}

              {/* EDITANDO: OUTROS TEMPLATES (team-grid, timeline, campaign, spin, career, benefits, dress-code, tools, marketing, meritocracia) */}
              {(editingSlide.template === "team-grid" || 
                editingSlide.template === "timeline" || 
                editingSlide.template === "campaign" || 
                editingSlide.template === "spin" || 
                editingSlide.template === "career" || 
                editingSlide.template === "benefits" || 
                editingSlide.template === "dress-code" ||
                editingSlide.template === "tools" ||
                editingSlide.template === "marketing" ||
                editingSlide.template === "meritocracia") && (
                <div className="pa-grid-2">
                  <div className="pa-form-row" style={{ gridColumn: "1 / -1" }}>
                    <label className="pa-label">Subtítulo Superior</label>
                    <input 
                      className="pa-input" 
                      value={editingSlide.subtitle || ""} 
                      onChange={e => setEditingSlide({ ...editingSlide, subtitle: e.target.value })} 
                      placeholder="Subtítulo do slide..."
                    />
                  </div>
                  <div className="pa-form-row" style={{ gridColumn: "1 / -1" }}>
                    <label className="pa-label">Título Principal (Use \n para pular linha)</label>
                    <textarea 
                      className="pa-input" 
                      rows={2}
                      value={editingSlide.title} 
                      onChange={e => setEditingSlide({ ...editingSlide, title: e.target.value })} 
                      placeholder="Título do slide..."
                    />
                  </div>
                  {(editingSlide.template === "campaign" || 
                    editingSlide.template === "spin" || 
                    editingSlide.template === "career" || 
                    editingSlide.template === "dress-code" ||
                    editingSlide.template === "meritocracia") && (
                    <div className="pa-form-row" style={{ gridColumn: "1 / -1" }}>
                      <label className="pa-label">Corpo de Texto / Descrição</label>
                      <textarea 
                        className="pa-input" 
                        rows={4} 
                        value={editingSlide.body || ""} 
                        onChange={e => setEditingSlide({ ...editingSlide, body: e.target.value })} 
                        placeholder="Texto descritivo..."
                      />
                    </div>
                  )}
                  {editingSlide.image_url !== undefined && (
                    <div className="pa-form-row" style={{ gridColumn: "1 / -1", borderTop: "1px dashed rgba(255,255,255,.1)", paddingTop: 14 }}>
                      <label className="pa-label">Imagem do Slide</label>
                      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 4 }}>
                        <div style={{
                          width: 90, height: 50, borderRadius: 8, overflow: "hidden",
                          border: "1px solid rgba(255,255,255,.1)",
                          background: editingSlide.image_url ? `url(${editingSlide.image_url}) center/cover no-repeat` : "rgba(255,255,255,0.05)",
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                        }}>
                          {!editingSlide.image_url && <span style={{ fontSize: 10 }}>Visual</span>}
                        </div>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          <button
                            type="button"
                            className="pa-btn-ghost"
                            style={{ padding: "6px 12px", fontSize: 13 }}
                            onClick={() => fileInputRef.current?.click()}
                          >
                            Upload Foto
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Ações do Modal de Edição */}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24, borderTop: "1px solid rgba(255,255,255,.08)", paddingTop: 16 }}>
              <button className="pa-btn-ghost" onClick={() => setEditingSlide(null)}>Cancelar</button>
              <button className="pa-btn-primary" onClick={saveEditedSlide}>Salvar Edição</button>
            </div>
          </div>
        </div>
      )}

      {/* Input de File Invisível reutilizado para carregar fotos dos slides */}
      <input 
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={async e => {
          const file = e.target.files?.[0];
          if (!file) return;
          e.target.value = "";
          if (file.size > 5 * 1024 * 1024) {
            alert("Por favor, selecione uma imagem de até 5MB.");
            return;
          }
          try {
            const dataUrl = await readFileAsDataUrl(file);
            if (editingSlide?.template === "welcome") {
              setCropSrc(dataUrl);
            } else if (editingSlide) {
              // Outros templates não exigem cropping circular perfeito, podem ir direto
              setEditingSlide({ ...editingSlide, image_url: dataUrl });
            }
          } catch {
            alert("Erro ao ler o arquivo de imagem.");
          }
        }}
      />

      {/* Cropper Modal reutilizado para Boas-vindas circular */}
      {cropSrc && editingSlide && (
        <ImageCropper
          src={cropSrc}
          onConfirm={(dataUrl) => {
            setEditingSlide({ ...editingSlide, image_url: dataUrl });
            setCropSrc(null);
          }}
          onCancel={() => setCropSrc(null)}
        />
      )}

      {/* Toast flutuante */}
      {toastMessage && (
        <div className="pa-toast" style={{ bottom: 24, right: 24 }}>
          {toastMessage}
        </div>
      )}
    </>
  );
}

function SecaoReconhecimentoRankings({ pessoas, onChange }: { pessoas: Pessoa[]; onChange: () => void; }) {
  const [rankings, setRankings] = useState<(RankingEntry & { pessoa?: Pessoa })[]>([]);
  const [cat, setCat] = useState<"corretores" | "gestores">("corretores");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<RankingEntry>>({
    tipo: "mensal",
    categoria: "corretores",
    posicao: 1,
    valor: 0,
    pessoa_id: "",
    periodo: getDetectedMonthString(),
    ativo: true,
  });

  // Estados para Importação de Planilha Excel
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [excelResult, setExcelResult] = useState<SpreadsheetParseResult | null>(null);
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>("");
  const [applyingImport, setApplyingImport] = useState(false);
  const excelFileInputRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await placarService.getRankings();
      setRankings(data);
    } catch (err) {
      console.error("Erro ao carregar rankings de reconhecimento:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const maxPositions = cat === "corretores" ? 10 : 5;

  const currentRankings = rankings
    .filter(r => r.tipo === "mensal" && r.categoria === cat)
    .sort((a, b) => a.posicao - b.posicao);

  const handleExcelFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    try {
      const buffer = await file.arrayBuffer();
      const result = parseSalesSpreadsheet(buffer, file.name, pessoas);
      setExcelResult(result);
      if (result.availableMonths.length > 0) {
        setSelectedMonthKey(result.availableMonths[0]);
      }
      setShowExcelModal(true);
    } catch (err: any) {
      console.error("Erro no parse do Excel:", err);
      alert(err.message || "Erro ao processar planilha de vendas.");
    }
  };

  const handleApplyImport = async () => {
    if (!excelResult || !selectedMonthKey) return;
    const monthData = excelResult.monthsData[selectedMonthKey];
    if (!monthData) return;

    setApplyingImport(true);
    try {
      await placarService.batchApplySpreadsheetImport(monthData, activeUnitId);
      alert(`✨ Rankings de ${selectedMonthKey} atualizados com sucesso a partir da planilha!`);
      setShowExcelModal(false);
      setExcelResult(null);
      loadData();
      onChange();
    } catch (err) {
      console.error("Erro ao aplicar importação:", err);
      alert("Falha ao salvar importação no banco de dados.");
    } finally {
      setApplyingImport(false);
    }
  };

  const handleOpenAdd = (posicao?: number) => {
    setForm({
      tipo: "mensal",
      categoria: cat,
      posicao: posicao || (currentRankings.length + 1 <= maxPositions ? currentRankings.length + 1 : 1),
      valor: 0,
      pessoa_id: pessoas.length > 0 ? pessoas[0].id : "",
      periodo: getDetectedMonthString(),
      ativo: true,
    });
    setShowModal(true);
  };

  const handleEdit = (entry: RankingEntry) => {
    setForm({ ...entry });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover esta pessoa do ranking?")) return;
    try {
      await placarService.deleteRankingEntry(id);
      loadData();
      onChange();
    } catch (err) {
      console.error("Erro ao remover:", err);
    }
  };

  const handleSave = async () => {
    if (!form.pessoa_id) {
      alert("Selecione uma pessoa para a posição!");
      return;
    }
    setSaving(true);
    try {
      if (form.id) {
        await placarService.updateRankingEntry(form.id, form);
      } else {
        await placarService.saveRankingEntry({
          pessoa_id: form.pessoa_id,
          tipo: "mensal",
          categoria: cat,
          posicao: Number(form.posicao) || 1,
          valor: Number(form.valor) || 0,
          instagram: form.instagram || undefined,
          periodo: form.periodo || getDetectedMonthString(),
          ativo: true,
        });
      }
      setShowModal(false);
      loadData();
      onChange();
    } catch (err) {
      console.error("Erro ao salvar destaque de reconhecimento:", err);
      alert("Falha ao salvar no banco de dados.");
    } finally {
      setSaving(false);
    }
  };

  const currentMonthData = excelResult && selectedMonthKey ? excelResult.monthsData[selectedMonthKey] : null;

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: "#fff", fontFamily: "'Barlow', sans-serif", margin: 0 }}>
            Reconhecimento — Ranking Mensal
          </h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "4px 0 0 0" }}>
            Gerencie o Top 10 Corretores e Top 5 Gerentes exibidos no slide luxo estilo Netflix.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => excelFileInputRef.current?.click()}
            className="pa-btn pa-btn-secondary"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              fontWeight: 800,
              border: "1px solid rgba(255, 215, 0, 0.4)",
              background: "rgba(255, 215, 0, 0.08)",
              color: "#FFD700"
            }}
          >
            <span>📥 Importar Planilha (Excel)</span>
          </button>
          <input
            type="file"
            ref={excelFileInputRef}
            accept=".xlsx, .xls"
            style={{ display: "none" }}
            onChange={handleExcelFileSelected}
          />
          <button
            onClick={() => handleOpenAdd()}
            className="pa-btn pa-btn-primary"
            style={{ background: "linear-gradient(135deg, #C5A059 0%, #8A6D3B 100%)", color: "#fff", border: "none", display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", fontWeight: 800 }}
          >
            <span>+ Adicionar Destaque</span>
          </button>
        </div>
      </div>

      {/* Tabs corretores / gestores */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, background: "rgba(255,255,255,0.03)", padding: 6, borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", width: "fit-content" }}>
        <button
          onClick={() => setCat("corretores")}
          style={{
            padding: "8px 20px",
            borderRadius: 8,
            background: cat === "corretores" ? "linear-gradient(135deg, #C5A059 0%, #8A6D3B 100%)" : "transparent",
            color: cat === "corretores" ? "#FFFFFF" : "rgba(255,255,255,0.6)",
            fontWeight: 800,
            fontSize: 13,
            border: "none",
            cursor: "pointer",
            transition: "all 200ms ease"
          }}
        >
          🏆 Top 10 Corretores do Mês
        </button>
        <button
          onClick={() => setCat("gestores")}
          style={{
            padding: "8px 20px",
            borderRadius: 8,
            background: cat === "gestores" ? "linear-gradient(135deg, #C5A059 0%, #8A6D3B 100%)" : "transparent",
            color: cat === "gestores" ? "#FFFFFF" : "rgba(255,255,255,0.6)",
            fontWeight: 800,
            fontSize: 13,
            border: "none",
            cursor: "pointer",
            transition: "all 200ms ease"
          }}
        >
          👔 Top 5 Gerentes do Mês
        </button>
      </div>

      {/* Cards de Posições (1 ao Max) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {Array.from({ length: maxPositions }, (_, i) => {
          const pos = i + 1;
          const entry = currentRankings.find(r => r.posicao === pos);
          const pessoa = entry?.pessoa || pessoas.find(p => p.id === entry?.pessoa_id);

          return (
            <div
              key={pos}
              style={{
                background: entry ? "rgba(197,160,89,0.06)" : "rgba(255,255,255,0.02)",
                border: entry ? "1px solid rgba(197,160,89,0.35)" : "1px dashed rgba(255,255,255,0.12)",
                borderRadius: 14,
                padding: 16,
                position: "relative",
                display: "flex",
                flexDirection: "column",
                gap: 12
              }}
            >
              {/* Badge da posição */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: pos === 1 ? "linear-gradient(135deg, #FFD700, #B8860B)" : pos === 2 ? "linear-gradient(135deg, #E0E0E0, #9E9E9E)" : pos === 3 ? "linear-gradient(135deg, #CD7F32, #8B4513)" : "rgba(255,255,255,0.08)",
                  color: pos <= 3 ? "#000" : "#C5A059",
                  fontWeight: 900,
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Barlow', sans-serif"
                }}>
                  {pos}º
                </div>
                {entry ? (
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => handleEdit(entry)}
                      style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 12 }}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 12 }}
                    >
                      🗑️
                    </button>
                  </div>
                ) : (
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Vazio</span>
                )}
              </div>

              {/* Informações da Pessoa */}
              {entry && pessoa ? (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", overflow: "hidden", border: "2px solid #C5A059", flexShrink: 0 }}>
                    {pessoa.foto_url ? (
                      <img src={pessoa.foto_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "#111", color: "#C5A059", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
                        {pessoa.nome.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {pessoa.nome}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>
                      Lopes {pessoa.unidade_id?.toUpperCase() || "Digital"}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#4ade80", marginTop: 2 }}>
                      {entry.valor ? `R$ ${Number(entry.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "Sem valor salvo"}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => handleOpenAdd(pos)}
                  style={{
                    height: 60,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(255,255,255,0.4)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  + Vincular {cat === "corretores" ? "Corretor" : "Gerente"} ao {pos}º Lugar
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Adicionar / Editar */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#111118", border: "1px solid rgba(197,160,89,0.4)", borderRadius: 16, padding: 28, width: 440, maxWidth: "90vw" }}>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: "#fff", margin: "0 0 20px 0" }}>
              {form.id ? "Editar Posição no Ranking" : `Definir ${form.posicao}º Lugar (${cat === "corretores" ? "Corretor" : "Gerente"})`}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="pa-label">Posição do Pódio</label>
                <select
                  className="pa-input"
                  value={form.posicao || 1}
                  onChange={e => setForm({ ...form, posicao: Number(e.target.value) })}
                >
                  {Array.from({ length: maxPositions }, (_, idx) => (
                    <option key={idx + 1} value={idx + 1}>{idx + 1}º Lugar</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="pa-label">Selecione a Pessoa</label>
                <select
                  className="pa-input"
                  value={form.pessoa_id || ""}
                  onChange={e => setForm({ ...form, pessoa_id: e.target.value })}
                >
                  <option value="">-- Escolha uma pessoa da equipe --</option>
                  {pessoas.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nome} ({p.cargo === "gestor" ? "Gerente" : "Corretor"} - Lopes {p.unidade_id?.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="pa-label">Valor Realizado de Vendas (R$)</label>
                <input
                  type="number"
                  className="pa-input"
                  placeholder="Ex: 1500000"
                  value={form.valor || ""}
                  onChange={e => setForm({ ...form, valor: Number(e.target.value) })}
                />
              </div>

              <div>
                <label className="pa-label">Instagram Handle Real (ex: @ricardolobo_lopes)</label>
                <input
                  type="text"
                  className="pa-input"
                  placeholder="Ex: @ricardolobo_lopes"
                  value={form.instagram || ""}
                  onChange={e => setForm({ ...form, instagram: e.target.value })}
                />
              </div>

              <div>
                <label className="pa-label">Mês / Período</label>
                <input
                  type="text"
                  className="pa-input"
                  placeholder="Ex: AGOSTO DE 2026"
                  value={form.periodo || getDetectedMonthString()}
                  onChange={e => setForm({ ...form, periodo: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowModal(false)}
                className="pa-btn pa-btn-secondary"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="pa-btn pa-btn-primary"
                style={{ background: "linear-gradient(135deg, #C5A059 0%, #8A6D3B 100%)", color: "#fff", fontWeight: 800 }}
                disabled={saving}
              >
                {saving ? "Salvando..." : "Salvar Posição"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Revisão da Importação da Planilha Excel */}
      {showExcelModal && excelResult && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: 20
        }}>
          <div style={{
            background: "#14141F",
            border: "1px solid rgba(255, 215, 0, 0.3)",
            borderRadius: 16,
            width: "100%",
            maxWidth: 960,
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 24px 48px rgba(0,0,0,0.6)",
            overflow: "hidden",
            animation: "scalePop 200ms ease-out"
          }}>
            {/* Header Modal */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255, 215, 0, 0.04)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: "#FFD700", margin: 0, fontFamily: "'Barlow', sans-serif" }}>
                  📥 Importação Automatizada de Vendas
                </h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", margin: "4px 0 0 0" }}>
                  Arquivo: <strong>{excelResult.fileName}</strong> ({excelResult.validSalesCount} vendas processadas)
                </p>
              </div>

              {/* Seletor de Mês */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>Período:</span>
                <select
                  className="pa-input"
                  style={{ width: "auto", padding: "8px 14px", fontWeight: 800, background: "#1F1F2E", color: "#FFD700", border: "1px solid rgba(255,215,0,0.4)" }}
                  value={selectedMonthKey}
                  onChange={e => setSelectedMonthKey(e.target.value)}
                >
                  {excelResult.availableMonths.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Conteúdo com Scroll */}
            <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>
              {currentMonthData ? (
                <>
                  {/* Metric Card */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: 14, borderRadius: 10 }}>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontWeight: 700 }}>Volume Total Vendido</div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: "#4ADE80", marginTop: 4 }}>
                        R$ {currentMonthData.totalVolume.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: 14, borderRadius: 10 }}>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontWeight: 700 }}>Top 10 Corretores</div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginTop: 4 }}>
                        {currentMonthData.topCorretores.length} pessoas
                      </div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: 14, borderRadius: 10 }}>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontWeight: 700 }}>Top 5 Gerentes</div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginTop: 4 }}>
                        {currentMonthData.topGestores.length} pessoas
                      </div>
                    </div>
                  </div>

                  {/* Tabela Top 10 Corretores */}
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 800, color: "#FFD700", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                      <span>🏆 Top 10 Corretores Calculados ({selectedMonthKey})</span>
                    </h4>
                    <div style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, overflow: "hidden" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textIndent: 0 }}>
                        <thead>
                          <tr style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)", textAlign: "left", color: "rgba(255,255,255,0.6)" }}>
                            <th style={{ padding: "10px 14px", width: 50 }}>#</th>
                            <th style={{ padding: "10px 14px" }}>Nome na Planilha</th>
                            <th style={{ padding: "10px 14px" }}>Reconhecimento (Fuzzy Match)</th>
                            <th style={{ padding: "10px 14px", textAlign: "right" }}>Valor Realizado (R$)</th>
                            <th style={{ padding: "10px 14px", textAlign: "center" }}>Status Cadastro</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentMonthData.topCorretores.map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                              <td style={{ padding: "10px 14px", fontWeight: 900, color: "#C5A059" }}>{idx + 1}º</td>
                              <td style={{ padding: "10px 14px", fontWeight: 700, color: "#fff" }}>{item.nameInExcel}</td>
                              <td style={{ padding: "10px 14px", color: "rgba(255,255,255,0.8)" }}>
                                {item.matchedPessoa ? (
                                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <span>👤 {item.matchedPessoa.nome}</span>
                                    <span style={{ fontSize: 11, background: "rgba(74, 222, 128, 0.15)", color: "#4ADE80", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>
                                      {Math.round(item.similarityScore * 100)}% match
                                    </span>
                                  </span>
                                ) : (
                                  <span style={{ color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>Nenhum pré-existente</span>
                                )}
                              </td>
                              <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 800, color: "#4ADE80" }}>
                                R$ {item.totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </td>
                              <td style={{ padding: "10px 14px", textAlign: "center" }}>
                                {item.isNewPerson ? (
                                  <span style={{ background: "rgba(234, 179, 8, 0.2)", color: "#FACC15", border: "1px solid rgba(234, 179, 8, 0.4)", padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 800 }}>
                                    🆕 Auto-Criar ({item.suggestedUnidadeId.toUpperCase()})
                                  </span>
                                ) : (
                                  <span style={{ background: "rgba(74, 222, 128, 0.15)", color: "#4ADE80", padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 800 }}>
                                    ✅ Vinculado
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Tabela Top 5 Gestores */}
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 800, color: "#FFD700", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                      <span>👔 Top 5 Gerentes Calculados ({selectedMonthKey})</span>
                    </h4>
                    <div style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, overflow: "hidden" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textIndent: 0 }}>
                        <thead>
                          <tr style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)", textAlign: "left", color: "rgba(255,255,255,0.6)" }}>
                            <th style={{ padding: "10px 14px", width: 50 }}>#</th>
                            <th style={{ padding: "10px 14px" }}>Nome na Planilha</th>
                            <th style={{ padding: "10px 14px" }}>Reconhecimento (Fuzzy Match)</th>
                            <th style={{ padding: "10px 14px", textAlign: "right" }}>Valor Realizado (R$)</th>
                            <th style={{ padding: "10px 14px", textAlign: "center" }}>Status Cadastro</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentMonthData.topGestores.map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                              <td style={{ padding: "10px 14px", fontWeight: 900, color: "#C5A059" }}>{idx + 1}º</td>
                              <td style={{ padding: "10px 14px", fontWeight: 700, color: "#fff" }}>{item.nameInExcel}</td>
                              <td style={{ padding: "10px 14px", color: "rgba(255,255,255,0.8)" }}>
                                {item.matchedPessoa ? (
                                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <span>👤 {item.matchedPessoa.nome}</span>
                                    <span style={{ fontSize: 11, background: "rgba(74, 222, 128, 0.15)", color: "#4ADE80", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>
                                      {Math.round(item.similarityScore * 100)}% match
                                    </span>
                                  </span>
                                ) : (
                                  <span style={{ color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>Nenhum pré-existente</span>
                                )}
                              </td>
                              <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 800, color: "#4ADE80" }}>
                                R$ {item.totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </td>
                              <td style={{ padding: "10px 14px", textAlign: "center" }}>
                                {item.isNewPerson ? (
                                  <span style={{ background: "rgba(234, 179, 8, 0.2)", color: "#FACC15", border: "1px solid rgba(234, 179, 8, 0.4)", padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 800 }}>
                                    🆕 Auto-Criar ({item.suggestedUnidadeId.toUpperCase()})
                                  </span>
                                ) : (
                                  <span style={{ background: "rgba(74, 222, 128, 0.15)", color: "#4ADE80", padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 800 }}>
                                    ✅ Vinculado
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.5)" }}>
                  Nenhum dado encontrado para o mês selecionado.
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.08)", background: "#0D0D14", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                onClick={() => {
                  setShowExcelModal(false);
                  setExcelResult(null);
                }}
                className="pa-btn pa-btn-secondary"
                disabled={applyingImport}
              >
                Cancelar
              </button>
              <button
                onClick={handleApplyImport}
                className="pa-btn pa-btn-primary"
                style={{ background: "linear-gradient(135deg, #C5A059 0%, #8A6D3B 100%)", color: "#fff", fontWeight: 800, padding: "10px 24px" }}
                disabled={applyingImport}
              >
                {applyingImport ? "⏳ Atualizando Rankings..." : "🚀 Confirmar e Importar no Ranking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Section: Progressão de Carreira ──────────────────────────────────────────

function SecaoProgressao({ pessoas, onChange }: { pessoas: Pessoa[]; onChange: () => void }) {
  const [progressoes, setProgressoes] = useState<(ProgressaoCarreira & { pessoa?: Pessoa })[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [tipo, setTipo] = useState<"signature" | "promocao">("signature");
  const [pessoaId, setPessoaId] = useState("");
  const [cargoAnterior, setCargoAnterior] = useState("");
  const [cargoNovo, setCargoNovo] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await placarService.getProgressoes();
      setProgressoes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pessoaId) return alert("Selecione uma pessoa.");
    setSaving(true);
    try {
      await placarService.createProgressao({
        pessoa_id: pessoaId,
        tipo,
        cargo_anterior: tipo === "promocao" ? cargoAnterior : null,
        cargo_novo: tipo === "promocao" ? cargoNovo : null,
        mensagem: null,
        foto_especifica: fotoUrl || null,
        ativo: true
      });
      setPessoaId("");
      setCargoAnterior("");
      setCargoNovo("");
      setFotoUrl("");
      load();
      onChange();
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar progressão.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (p: ProgressaoCarreira) => {
    try {
      await placarService.updateProgressao(p.id, { ativo: !p.ativo });
      load();
      onChange();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover esta progressão?")) return;
    try {
      await placarService.deleteProgressao(id);
      load();
      onChange();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="pa-grid-2">
      {/* Form Card */}
      <div className="pa-card" style={{ alignSelf: "start" }}>
        <div className="pa-title">Nova Progressão</div>
        <div className="pa-subtitle">Adicione uma progressão de carreira para aparecer na TV.</div>
        
        <form onSubmit={handleAdd}>
          <div className="pa-form-row">
            <label className="pa-label">Pessoa</label>
            <select className="pa-input pa-select" value={pessoaId} onChange={e => setPessoaId(e.target.value)} required>
              <option value="">Selecione...</option>
              {pessoas.filter(p => p.ativo).map(p => (
                <option key={p.id} value={p.id}>{p.nome} ({p.unidade_id})</option>
              ))}
            </select>
          </div>

          <div className="pa-form-row">
            <label className="pa-label">Categoria de Progressão</label>
            <select className="pa-input pa-select" value={tipo} onChange={e => setTipo(e.target.value as any)}>
              <option value="signature">Ingresso LOPES Signature (Alto Padrão)</option>
              <option value="promocao">Promoção (Gerência, Diretoria, Coordenação)</option>
            </select>
          </div>

          {tipo === "promocao" && (
            <>
              <div className="pa-form-row">
                <label className="pa-label">Cargo Anterior (Ex: Corretora)</label>
                <input className="pa-input" value={cargoAnterior} onChange={e => setCargoAnterior(e.target.value)} required placeholder="Ex: Corretora" />
              </div>
              <div className="pa-form-row">
                <label className="pa-label">Cargo Novo (Ex: Coord. de Incorporações)</label>
                <input className="pa-input" value={cargoNovo} onChange={e => setCargoNovo(e.target.value)} required placeholder="Ex: Coord. de Incorporações" />
              </div>
            </>
          )}

          <div className="pa-form-row">
            <label className="pa-label">Foto Específica para TV (URL - Opcional)</label>
            <input className="pa-input" value={fotoUrl} onChange={e => setFotoUrl(e.target.value)} placeholder="Deixe em branco para usar a foto do perfil" />
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Dica: No Signature fica melhor foto com fundo escuro.</div>
          </div>

          <button className="pa-btn-primary" style={{ marginTop: 10 }} disabled={saving}>{saving ? "Salvando..." : "Adicionar Progressão"}</button>
        </form>
      </div>

      {/* List Card */}
      <div className="pa-card">
        <div className="pa-title">Progressões Ativas e Histórico</div>
        <div className="pa-subtitle">Gerencie quem está sendo exibido na tela de Progressão.</div>
        
        {loading ? (
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, padding: 20 }}>Carregando...</div>
        ) : (
          <div className="pa-table-wrap">
            <table className="pa-table">
              <thead>
                <tr>
                  <th>Pessoa</th>
                  <th>Tipo</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {progressoes.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="pa-avatar" style={{ background: "rgba(255,255,255,0.1)" }}>
                          {p.foto_especifica || (p.pessoa?.foto_url) ? (
                            <img src={p.foto_especifica || p.pessoa?.foto_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : p.pessoa?.nome?.substring(0,2).toUpperCase()}
                        </div>
                        <div style={{ fontWeight: 600 }}>{p.pessoa?.nome || "Desconhecido"}</div>
                      </div>
                    </td>
                    <td>
                      <span className={p.tipo === "signature" ? "badge-gestor" : "badge-corretor"} style={{ background: p.tipo === "signature" ? "rgba(212,175,55,0.15)" : undefined, color: p.tipo === "signature" ? "#d4af37" : undefined, borderColor: p.tipo === "signature" ? "rgba(212,175,55,0.3)" : undefined }}>
                        {p.tipo === "signature" ? "Signature" : "Promoção"}
                      </span>
                    </td>
                    <td>
                      <button className={`badge-${p.ativo ? "ativo" : "inativo"}`} onClick={() => handleToggleActive(p)} style={{ cursor: "pointer" }}>
                        {p.ativo ? "Exibindo" : "Oculto"}
                      </button>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button className="pa-btn-danger" onClick={() => handleDelete(p.id)} title="Excluir">
                        <Icons.Trash size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {progressoes.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: "center", padding: 20, color: "rgba(255,255,255,0.3)" }}>Nenhuma progressão cadastrada.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export function PlacarAdmin({ activeSection, activeUnitId }: { activeSection: string; activeUnitId: string }) {
  const [pessoas, setPessoas]   = useState<Pessoa[]>([]);
  const [unidades]              = useState<Unidade[]>(MOCK_UNIDADES);
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [pvs, setPVs]           = useState<(PrimeiraVenda & { pessoa: Pessoa })[]>([]);
  const [config, setConfig]     = useState<ConfigMetas | null>(null);
  const [tick, setTick]         = useState(0);

  const reload = () => setTick(t => t + 1);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, r, loadedPVs, cfg] = await Promise.all([
          placarService.getPessoas(undefined, false).catch(err => {
            console.error("Falha ao carregar pessoas:", err);
            return [];
          }),
          placarService.getRankings().catch(err => {
            console.error("Falha ao carregar rankings:", err);
            return [];
          }),
          placarService.getPrimeiraVenda().catch(err => {
            console.error("Falha ao carregar primeira venda:", err);
            return [];
          }),
          placarService.getConfig().catch(err => {
            console.error("Falha ao carregar config:", err);
            return null;
          }),
        ]);
        setPessoas(p);
        setRankings(r);
        setPVs(loadedPVs);
        
        // Garante que config tenha valores padrão se vier nulo para não travar em "Carregando..."
        setConfig(cfg || {
          id: 0,
          unidade_id: "jd-goias",
          meta_mensal_titulo: `Meta Mensal - ${getDetectedMonthString()}`,
          meta_mensal_valor: 0,
          meta_mensal_realizado: 0,
          meta_mensal_periodo: getDetectedMonthString(),
        });
      } catch (err) {
        console.error("Erro geral no PlacarAdmin:", err);
      }
    };
    load();
  }, [tick]);

  return (
    <>
      <style>{CSS}</style>
      <div className="pa-root" style={{ background: "transparent", minHeight: "100%" }}>
        <div style={{ flex: 1, overflow: "auto", padding: "28px 32px", overflowX: "hidden" }}>
          {activeSection === "pessoas" && config && (
            <SecaoPessoas pessoas={pessoas} unidades={unidades} activeUnitId={activeUnitId} onChange={reload} />
          )}
          {activeSection === "rankings" && (
            <SecaoRankingsPastas pessoas={pessoas} onChange={reload} />
          )}
          {activeSection === "reconhecimento" && (
            <SecaoReconhecimentoRankings pessoas={pessoas} onChange={reload} />
          )}
          {activeSection === "progressao" && (
            <SecaoProgressao pessoas={pessoas} onChange={reload} />
          )}
          {activeSection === "pvenda" && config && (
            <SecaoPVenda pvs={pvs} pessoas={pessoas} activeUnitId={activeUnitId} onChange={reload} />
          )}
          {activeSection === "metas" && (
            <SecaoMetas unidades={unidades} activeUnitId={activeUnitId} />
          )}
          {activeSection === "cultura" && (
            <SecaoCultura unidades={unidades} activeUnitId={activeUnitId} />
          )}
          {!config && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: "rgba(255,255,255,.30)", fontSize: 14 }}>
              Carregando…
            </div>
          )}
        </div>
      </div>
    </>
  );
}
