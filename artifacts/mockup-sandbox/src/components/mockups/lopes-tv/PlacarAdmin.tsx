import { useState, useEffect } from "react";
import logoBranca from "@/assets/logo-branca.png";
import faviconLopes from "@/assets/favicon-lopes.png";
import {
  placarService,
  MOCK_UNIDADES,
} from "@/services/placarService";
import type {
  Pessoa, Unidade, RankingEntry, PrimeiraVenda, ConfigMetas,
  Cargo, TipoRanking, CategoriaRanking,
} from "@/types/placar";
import { Icons } from "@/components/common/Icons";

// ─── CSS ──────────────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes scalePop{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}

  .pa-root{width:100vw;height:100vh;display:flex;flex-direction:column;background:#0a0a0f;color:#fff;font-family:'DM Sans',sans-serif;overflow:hidden;}

  /* Header */
  .pa-header{height:56px;background:#111118;border-bottom:1px solid rgba(255,255,255,.08);display:flex;align-items:center;padding:0 20px;gap:14px;flex-shrink:0;}

  /* Layout */
  .pa-body{flex:1;display:flex;overflow:hidden;}
  .pa-sidebar{width:200px;flex-shrink:0;background:#0d0d14;border-right:1px solid rgba(255,255,255,.07);display:flex;flex-direction:column;padding:16px 10px;gap:4px;overflow-y:auto;}
  .pa-main{flex:1;overflow-y:auto;padding:28px 32px;}

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
  .pa-table{width:100%;border-collapse:collapse;}
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
  .pa-overlay{position:fixed;inset:0;background:rgba(0,0,0,.70);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:100;}
  .pa-modal{background:#111118;border:1px solid rgba(255,255,255,.12);border-radius:18px;padding:28px;width:100%;max-width:460px;animation:scalePop 280ms cubic-bezier(.34,1.56,.64,1) both;}
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

// ─── Section: Pessoas ─────────────────────────────────────────────────────────

function SecaoPessoas({ pessoas, unidades, onChange }: {
  pessoas: Pessoa[]; unidades: Unidade[]; onChange: () => void;
}) {
  const [modal, setModal] = useState<Partial<Pessoa> | null>(null);
  const [saving, setSaving] = useState(false);

  const openAdd = () => setModal({ cargo: "corretor", ativo: true, unidade_id: unidades[0]?.id });
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

  const del = async (id: string) => {
    if (!confirm("Remover esta pessoa?")) return;
    await placarService.deletePessoa(id);
    onChange();
  };

  return (
    <>
      <div className="pa-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div className="pa-title">Pessoas</div>
            <div className="pa-subtitle">Corretores e gestores cadastrados — {pessoas.length} no total</div>
          </div>
          <button className="pa-btn-primary" onClick={openAdd}>+ Novo</button>
        </div>

        <table className="pa-table">
          <thead>
            <tr>
              <th>Pessoa</th>
              <th>Cargo</th>
              <th>Unidade</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pessoas.map(p => {
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
                  <td><span className={p.ativo ? "badge-ativo" : "badge-inativo"}>{p.ativo ? "ativo" : "inativo"}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      <button className="pa-btn-ghost" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px" }} onClick={() => openEdit(p)}>
                        <Icons.Edit size={14} />
                        Editar
                      </button>
                      <button className="pa-btn-danger" style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }} onClick={() => del(p.id)}>
                        <Icons.Trash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
                <select className="pa-input pa-select" value={modal.unidade_id ?? ""} onChange={e => setModal(m => ({ ...m!, unidade_id: e.target.value }))}>
                  {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                </select>
              </div>
              <div className="pa-form-row" style={{ gridColumn: "1 / -1" }}>
                <label className="pa-label">URL da Foto (opcional)</label>
                <input className="pa-input" value={modal.foto_url ?? ""} onChange={e => setModal(m => ({ ...m!, foto_url: e.target.value }))} placeholder="https://..." />
                {modal.foto_url && <img src={modal.foto_url} alt="" className="photo-preview" style={{ marginTop: 8 }} onError={e => (e.currentTarget.style.display = "none")} />}
              </div>
              <div className="pa-form-row">
                <label className="pa-label">Status</label>
                <select className="pa-input pa-select" value={modal.ativo ? "1" : "0"} onChange={e => setModal(m => ({ ...m!, ativo: e.target.value === "1" }))}>
                  <option value="1">Ativo</option>
                  <option value="0">Inativo</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
              <button className="pa-btn-ghost" onClick={close}>Cancelar</button>
              <button className="pa-btn-primary" onClick={save} disabled={saving}>{saving ? "Salvando…" : "Salvar"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Section: Rankings ────────────────────────────────────────────────────────

function SecaoRankings({ rankings, pessoas, onChange }: {
  rankings: RankingEntry[]; pessoas: Pessoa[]; onChange: () => void;
}) {
  const [tipo, setTipo] = useState<TipoRanking>("anual");
  const [cat, setCat] = useState<CategoriaRanking>("gestores");
  const [modal, setModal] = useState<Partial<RankingEntry> | null>(null);
  const [saving, setSaving] = useState(false);

  const filtered = rankings.filter(r => r.tipo === tipo && r.categoria === cat && r.ativo)
    .sort((a, b) => a.posicao - b.posicao);

  const pessoasDoCargo = pessoas.filter(p => p.cargo === (cat === "gestores" ? "gestor" : "corretor") && p.ativo);

  const openAdd = () => setModal({ tipo, categoria: cat, ativo: true, posicao: filtered.length + 1, periodo: "MAIO DE 2026" });
  const openEdit = (r: RankingEntry) => setModal({ ...r });
  const close = () => setModal(null);

  const save = async () => {
    if (!modal) return;
    setSaving(true);
    try {
      if (modal.id) {
        await placarService.updateRankingEntry(modal.id, modal);
      } else {
        await placarService.saveRankingEntry(modal as Omit<RankingEntry, "id" | "criado_em" | "atualizado_em">);
      }
      onChange();
      close();
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
      <div className="pa-card">
        <div className="pa-title">Rankings</div>
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

        <div style={{ marginBottom: 14, display: "flex", justifyContent: "flex-end" }}>
          <button className="pa-btn-primary" onClick={openAdd}>+ Adicionar posição</button>
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(255,255,255,.25)", fontSize: 14 }}>
            Nenhuma entrada para {tipo} · {cat}. Clique em "+ Adicionar posição".
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
                <button className="pa-btn-ghost" onClick={() => openEdit(r)}>Editar</button>
                <button className="pa-btn-danger" onClick={() => del(r.id)}>✕</button>
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
              <div className="pa-form-row">
                <label className="pa-label">Valor (R$)</label>
                <input className="pa-input" type="number" min={0} step={1000} value={modal.valor ?? 0} onChange={e => setModal(m => ({ ...m!, valor: Number(e.target.value) }))} />
              </div>
              <div className="pa-form-row" style={{ gridColumn: "1 / -1" }}>
                <label className="pa-label">Período (ex: MAIO DE 2026)</label>
                <input className="pa-input" value={modal.periodo ?? ""} onChange={e => setModal(m => ({ ...m!, periodo: e.target.value }))} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
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

function SecaoPVenda({ pv: pvInicial, pessoas, onChange }: {
  pv?: PrimeiraVenda & { pessoa: Pessoa }; pessoas: Pessoa[]; onChange: () => void;
}) {
  const [form, setForm] = useState({
    pessoa_id: pvInicial?.pessoa_id ?? "",
    mensagem:  pvInicial?.mensagem ?? "Parabéns pela venda!",
    detalhe:   pvInicial?.detalhe ?? "Você faz parte do crescimento da nossa empresa, nosso muito obrigado!",
    ativo:     pvInicial?.ativo ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const pessoa = pessoas.find(p => p.id === form.pessoa_id);

  const save = async () => {
    setSaving(true);
    try {
      await placarService.savePrimeiraVenda({ ...form });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      onChange();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pa-card">
      <div className="pa-title">Primeira Venda</div>
      <div className="pa-subtitle">Destaque a pessoa com a primeira venda do período</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Form */}
        <div>
          <div className="pa-form-row">
            <label className="pa-label">Corretor / Gestor</label>
            <select className="pa-input pa-select" value={form.pessoa_id} onChange={e => setForm(f => ({ ...f, pessoa_id: e.target.value }))}>
              <option value="">— selecione —</option>
              {pessoas.filter(p => p.ativo).map(p => (
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
          <div className="pa-form-row">
            <label className="pa-label">Status</label>
            <select className="pa-input pa-select" value={form.ativo ? "1" : "0"} onChange={e => setForm(f => ({ ...f, ativo: e.target.value === "1" }))}>
              <option value="1">Ativo (exibindo no placar)</option>
              <option value="0">Inativo (oculto)</option>
            </select>
          </div>
          <button className="pa-btn-primary" onClick={save} disabled={saving || !form.pessoa_id} style={{ marginTop: 4 }}>
            {saving ? "Salvando…" : "Salvar"}
          </button>
          {saved && <span style={{ marginLeft: 12, color: "#4ade80", fontSize: 13, fontWeight: 600 }}>✓ Salvo!</span>}
        </div>

        {/* Preview */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.30)", letterSpacing: ".10em", textTransform: "uppercase", marginBottom: 12 }}>Preview</div>
          <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,.10)", width: 220, boxShadow: "0 12px 40px rgba(0,0,0,.6)" }}>
            <div style={{ height: 160, background: pessoa?.foto_url ? `url(${pessoa.foto_url}) center/cover` : "linear-gradient(145deg,#1e1e38,#2e2e50)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              {!pessoa?.foto_url && (
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: pessoa ? GRADIENT_MAP[pessoa.cargo] : "rgba(255,255,255,.10)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow',sans-serif", fontWeight: 900, fontSize: 24, color: "#fff" }}>
                  {pessoa ? initials(pessoa.nome) : "?"}
                </div>
              )}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px 12px", background: "linear-gradient(to top,rgba(0,0,0,.80),transparent)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: 11, color: "#fff", letterSpacing: ".06em", textTransform: "uppercase" }}>{pessoa?.nome ?? "Selecione uma pessoa"}</span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,.65)" }}>🤍 Lopes</span>
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
      </div>
    </div>
  );
}

// ─── Section: Metas ───────────────────────────────────────────────────────────

function SecaoMetas({ config: cfgInicial, unidades, onChange }: {
  config: ConfigMetas; unidades: Unidade[]; onChange: () => void;
}) {
  const [form, setForm] = useState({ ...cfgInicial });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const pctMensal = Math.min(100, (form.meta_mensal_realizado / form.meta_mensal_valor) * 100);
  const pctAnual  = Math.min(100, (form.meta_anual_realizado  / form.meta_anual_valor)  * 100);

  const save = async () => {
    setSaving(true);
    try {
      await placarService.saveConfig(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      onChange();
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, field, type = "text" }: { label: string; field: keyof ConfigMetas; type?: string }) => (
    <div className="pa-form-row">
      <label className="pa-label">{label}</label>
      <input className="pa-input" type={type} value={String(form[field] ?? "")}
        onChange={e => setForm(f => ({ ...f, [field]: type === "number" ? Number(e.target.value) : e.target.value }))} />
    </div>
  );

  return (
    <div className="pa-card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <div>
          <div className="pa-title">Metas</div>
          <div className="pa-subtitle">Valores exibidos nos slides de Meta Mensal e Meta Anual</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {saved && <span style={{ color: "#4ade80", fontSize: 13, fontWeight: 600 }}>✓ Salvo!</span>}
          <button className="pa-btn-primary" onClick={save} disabled={saving}>{saving ? "Salvando…" : "Salvar tudo"}</button>
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div className="pa-form-row">
          <label className="pa-label">Unidade exibida no placar</label>
          <select className="pa-input pa-select" value={form.unidade_id} onChange={e => setForm(f => ({ ...f, unidade_id: e.target.value }))}>
            {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Meta Mensal */}
        <div>
          <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 800, fontSize: 16, marginBottom: 14, color: "rgba(255,255,255,.70)", borderBottom: "1px solid rgba(255,255,255,.07)", paddingBottom: 10 }}>
            📅 Meta Mensal
          </div>
          <Field label="Título" field="meta_mensal_titulo" />
          <Field label="Meta total (R$)" field="meta_mensal_valor" type="number" />
          <Field label="Realizado até hoje (R$)" field="meta_mensal_realizado" type="number" />
          <Field label="Período (ex: ANO DE 2026 - JD. GOIÁS)" field="meta_mensal_periodo" />
          <div style={{ height: 8, borderRadius: 9999, background: "rgba(255,255,255,.10)", overflow: "hidden", marginTop: 6 }}>
            <div style={{ height: "100%", width: `${pctMensal}%`, background: "linear-gradient(90deg,#FF0080,#FF6B35)", borderRadius: 9999, transition: "width 600ms" }} />
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.40)", marginTop: 6 }}>{pctMensal.toFixed(1)}% atingido</div>
        </div>

        {/* Meta Anual */}
        <div>
          <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 800, fontSize: 16, marginBottom: 14, color: "rgba(255,255,255,.70)", borderBottom: "1px solid rgba(255,255,255,.07)", paddingBottom: 10 }}>
            📆 Meta Anual
          </div>
          <Field label="Título" field="meta_anual_titulo" />
          <Field label="Meta total (R$)" field="meta_anual_valor" type="number" />
          <Field label="Realizado até hoje (R$)" field="meta_anual_realizado" type="number" />
          <div style={{ height: 8, borderRadius: 9999, background: "rgba(255,255,255,.10)", overflow: "hidden", marginTop: 28 }}>
            <div style={{ height: "100%", width: `${pctAnual}%`, background: "linear-gradient(90deg,#7C3AED,#E30613)", borderRadius: 9999, transition: "width 600ms" }} />
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.40)", marginTop: 6 }}>{pctAnual.toFixed(1)}% atingido</div>
        </div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export function PlacarAdmin({ activeSection }: { activeSection: string }) {
  const [pessoas, setPessoas]   = useState<Pessoa[]>([]);
  const [unidades]              = useState<Unidade[]>(MOCK_UNIDADES);
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [pv, setPV]             = useState<(PrimeiraVenda & { pessoa: Pessoa }) | undefined>();
  const [config, setConfig]     = useState<ConfigMetas | null>(null);
  const [tick, setTick]         = useState(0);

  const reload = () => setTick(t => t + 1);

  useEffect(() => {
    Promise.all([
      placarService.getPessoas(),
      placarService.getRankings(),
      placarService.getPrimeiraVenda(),
      placarService.getConfig(),
    ]).then(([p, r, pv, cfg]) => {
      setPessoas(p);
      setRankings(r);
      setPV(pv);
      setConfig(cfg);
    });
  }, [tick]);

  return (
    <>
      <style>{CSS}</style>
      <div className="pa-root" style={{ background: "transparent", minHeight: "100%" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
          {activeSection === "pessoas" && config && (
            <SecaoPessoas pessoas={pessoas} unidades={unidades} onChange={reload} />
          )}
          {activeSection === "rankings" && (
            <SecaoRankings rankings={rankings} pessoas={pessoas} onChange={reload} />
          )}
          {activeSection === "pvenda" && config && (
            <SecaoPVenda pv={pv} pessoas={pessoas} onChange={reload} />
          )}
          {activeSection === "metas" && config && (
            <SecaoMetas config={config} unidades={unidades} onChange={reload} />
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
