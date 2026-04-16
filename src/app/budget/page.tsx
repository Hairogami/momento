"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import DashSidebar from "@/components/clone/dashboard/DashSidebar"
import AntNav from "@/components/clone/AntNav"
import { usePlanners } from "@/hooks/usePlanners"

const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"
// EVENTS migré vers usePlanners

type Expense = { id: string; label: string; category: string; amount: number; date: string; paid: boolean }

const CAT_COLORS: Record<string, string> = {
  "Lieu":         "#818cf8",
  "Traiteur":     "#f59e0b",
  "Photographe":  "#f472b6",
  "Musique":      "#a855f7",
  "Décoration":   "#22c55e",
  "Transport":    "#60a5fa",
  "Tenue":        "#fb923c",
  "Divers":       "#9a9aaa",
}


function DonutChart({ segments, size = 120 }: { segments: { pct: number; color: string }[]; size?: number }) {
  const r = 44; const cx = 60; const cy = 60; const circ = 2 * Math.PI * r
  let offset = -90
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--dash-faint-2,rgba(183,191,217,0.12))" strokeWidth={14} />
      {segments.map((s, i) => {
        const dash = (s.pct / 100) * circ
        const gap  = circ - dash
        const rot  = offset
        offset += (s.pct / 100) * 360
        return (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={s.color} strokeWidth={14}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-(rot / 360) * circ}
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transform: `rotate(${rot}deg)`, transformOrigin: `${cx}px ${cy}px` }}
          />
        )
      })}
    </svg>
  )
}

export default function CloneBudgetPage() {
  const { events, activeEventId, setActiveEventId } = usePlanners()
  const [dataByEvent, setDataByEvent] = useState<Record<string, { total: number; expenses: Expense[] }>>({})
  const [showAdd, setShowAdd] = useState(false)
  const [newLabel, setNewLabel]     = useState("")
  const [newCat, setNewCat]         = useState("Divers")
  const [newAmount, setNewAmount]   = useState("")

  function handleEventChange(id: string) {
    setActiveEventId(id)
    try { localStorage.setItem("momento_active_event", id) } catch {}
  }

  const activeEvent = events.find(e => e.id === activeEventId) ?? events[0] ?? { id: "", name: "", date: "", color: "#E11D48" }
  const data = dataByEvent[activeEventId] ?? { total: 0, expenses: [] }
  const expenses = data.expenses
  const spent    = expenses.reduce((s, e) => s + e.amount, 0)
  const paid     = expenses.filter(e => e.paid).reduce((s, e) => s + e.amount, 0)
  const pct      = data.total > 0 ? Math.min(100, Math.round((spent / data.total) * 100)) : 0

  // Category breakdown
  const catMap: Record<string, number> = {}
  expenses.forEach(e => { catMap[e.category] = (catMap[e.category] ?? 0) + e.amount })
  const categories = Object.entries(catMap).sort((a, b) => b[1] - a[1])

  const segments = categories.map(([cat, amt]) => ({
    pct: data.total > 0 ? (amt / data.total) * 100 : 0,
    color: CAT_COLORS[cat] ?? "#9a9aaa",
  }))

  function togglePaid(id: string) {
    setDataByEvent(prev => ({
      ...prev,
      [activeEventId]: {
        ...prev[activeEventId],
        expenses: (prev[activeEventId]?.expenses ?? []).map(e => e.id === id ? { ...e, paid: !e.paid } : e),
      },
    }))
  }

  function addExpense() {
    const label  = newLabel.trim()
    const amount = parseFloat(newAmount)
    if (!label || isNaN(amount) || amount <= 0) return
    const exp: Expense = { id: `e${Date.now()}`, label, category: newCat, amount, date: new Date().toISOString().slice(0, 10), paid: false }
    setDataByEvent(prev => ({
      ...prev,
      [activeEventId]: { total: prev[activeEventId]?.total ?? 0, expenses: [...(prev[activeEventId]?.expenses ?? []), exp] },
    }))
    setNewLabel(""); setNewCat("Divers"); setNewAmount(""); setShowAdd(false)
  }

  const fmt = (n: number) => n.toLocaleString("fr-MA") + " MAD"

  return (
    <div className="ant-root" style={{ display: "flex", minHeight: "100vh", background: "var(--dash-bg,#f7f7fb)" }}>
      <div className="hidden lg:flex">
        <DashSidebar events={events} activeEventId={activeEventId} onEventChange={handleEventChange} />
      </div>
      <div className="lg:hidden"><AntNav /></div>

      <main className="pb-20 md:pb-0" style={{ flex: 1, padding: "clamp(16px, 4vw, 32px) clamp(16px, 4vw, 32px) 64px", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: "clamp(1.3rem,2vw,1.7rem)", fontWeight: 800, color: "var(--dash-text,#121317)", letterSpacing: "-0.03em", margin: "0 0 4px" }}>Budget</h1>
            <p style={{ fontSize: 13, color: "var(--dash-text-2,#6a6a71)", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: activeEvent.color, display: "inline-block" }} />
              {activeEvent.name}
            </p>
          </div>
          <button
            onClick={() => setShowAdd(v => !v)}
            style={{ padding: "10px 20px", borderRadius: 99, background: G, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
          >+ Ajouter une dépense</button>
        </div>

        {/* Add form */}
        {showAdd && (
          <div style={{ marginBottom: 24, padding: "20px 24px", background: "var(--dash-surface,#fff)", borderRadius: 16, border: "1px solid var(--dash-border,rgba(183,191,217,0.15))", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--dash-text,#121317)", margin: "0 0 16px" }}>Nouvelle dépense</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
              <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Libellé…" style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid var(--dash-border,rgba(183,191,217,0.25))", background: "var(--dash-bg,#f7f7fb)", color: "var(--dash-text,#121317)", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
              <select value={newCat} onChange={e => setNewCat(e.target.value)} style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid var(--dash-border,rgba(183,191,217,0.25))", background: "var(--dash-bg,#f7f7fb)", color: "var(--dash-text,#121317)", fontSize: 13, fontFamily: "inherit", outline: "none" }}>
                {Object.keys(CAT_COLORS).map(c => <option key={c}>{c}</option>)}
              </select>
              <input type="number" value={newAmount} onChange={e => setNewAmount(e.target.value)} placeholder="Montant MAD" style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid var(--dash-border,rgba(183,191,217,0.25))", background: "var(--dash-bg,#f7f7fb)", color: "var(--dash-text,#121317)", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button onClick={addExpense} style={{ padding: "9px 20px", borderRadius: 10, background: G, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Ajouter</button>
              <button onClick={() => setShowAdd(false)} style={{ padding: "9px 16px", borderRadius: 10, background: "var(--dash-faint,rgba(183,191,217,0.07))", color: "var(--dash-text-2,#6a6a71)", border: "none", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Annuler</button>
            </div>
          </div>
        )}

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Budget total",  value: fmt(data.total), accent: "#6a6a71" },
            { label: "Dépensé",       value: fmt(spent),      accent: "#E11D48"  },
            { label: "Payé",          value: fmt(paid),        accent: "#22c55e"  },
            { label: "Restant",       value: fmt(data.total - spent), accent: "#818cf8" },
          ].map(c => (
            <div key={c.label} style={{ background: "var(--dash-surface,#fff)", borderRadius: 16, border: "1px solid var(--dash-border,rgba(183,191,217,0.15))", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", padding: "18px 20px" }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--dash-text-3,#9a9aaa)", margin: "0 0 6px" }}>{c.label}</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: c.accent, margin: 0, letterSpacing: "-0.03em" }}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Budget bar */}
        <div style={{ marginBottom: 32, background: "var(--dash-surface,#fff)", borderRadius: 16, border: "1px solid var(--dash-border,rgba(183,191,217,0.15))", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--dash-text,#121317)" }}>Consommation budgétaire</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: pct > 80 ? "#E11D48" : "var(--dash-text,#121317)" }}>{pct}%</span>
          </div>
          <div style={{ height: 8, background: "var(--dash-faint-2,rgba(183,191,217,0.12))", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: pct > 80 ? "linear-gradient(90deg,#f59e0b,#E11D48)" : G, borderRadius: 99, transition: "width 0.5s" }} />
          </div>
          {pct > 80 && <p style={{ fontSize: 11, color: "#f59e0b", margin: "8px 0 0", fontWeight: 600 }}>⚠ Attention — budget presque épuisé</p>}
        </div>

        {/* Two columns: donut + expense list */}
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
          {/* Donut */}
          <div style={{ background: "var(--dash-surface,#fff)", borderRadius: 18, border: "1px solid var(--dash-border,rgba(183,191,217,0.15))", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", padding: "20px 24px", minWidth: 240 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--dash-text,#121317)", margin: "0 0 16px" }}>Répartition</p>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <DonutChart segments={segments} size={120} />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {categories.map(([cat, amt]) => (
                  <div key={cat} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 9, height: 9, borderRadius: "50%", background: CAT_COLORS[cat] ?? "#9a9aaa", flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: "var(--dash-text-2,#6a6a71)" }}>{cat}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--dash-text,#121317)", marginLeft: "auto" }}>{Math.round((amt / data.total) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Expense list */}
          <div style={{ flex: 1, minWidth: 0, background: "var(--dash-surface,#fff)", borderRadius: 18, border: "1px solid var(--dash-border,rgba(183,191,217,0.15))", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--dash-divider,rgba(183,191,217,0.10))" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--dash-text,#121317)", margin: 0 }}>Détail des dépenses</p>
            </div>
            {expenses.length === 0 && (
              <p style={{ fontSize: 13, color: "var(--dash-text-3,#9a9aaa)", textAlign: "center", padding: "32px 0" }}>Aucune dépense enregistrée</p>
            )}
            {expenses.map((exp, i) => (
              <div key={exp.id} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "14px 20px",
                borderBottom: i < expenses.length - 1 ? "1px solid var(--dash-divider,rgba(183,191,217,0.10))" : "none",
              }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: `${CAT_COLORS[exp.category] ?? "#9a9aaa"}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: CAT_COLORS[exp.category] ?? "#9a9aaa" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--dash-text,#121317)", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{exp.label}</p>
                  <p style={{ fontSize: 10, color: "var(--dash-text-3,#9a9aaa)", margin: 0 }}>{exp.category} · {exp.date}</p>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--dash-text,#121317)", flexShrink: 0 }}>{exp.amount.toLocaleString("fr-MA")} MAD</span>
                <button
                  onClick={() => togglePaid(exp.id)}
                  style={{
                    padding: "4px 10px", borderRadius: 99, border: "none", cursor: "pointer", fontSize: 10, fontWeight: 600, fontFamily: "inherit",
                    background: exp.paid ? "rgba(34,197,94,0.12)" : "var(--dash-faint,rgba(183,191,217,0.07))",
                    color: exp.paid ? "#22c55e" : "var(--dash-text-3,#9a9aaa)",
                    flexShrink: 0,
                  }}
                >{exp.paid ? "✓ Payé" : "En attente"}</button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
