"use client"
import { useState } from "react"
import { G, type Guest } from "./_shared"

// WIDGET-CONTRACT VIOLATION (assignments) :
// Guest.tableNumber existe en DB mais l'ajout/modification depuis ce widget
// reste local (state). Refresh = perte des nouvelles assignations.
// TODO future : POST /api/guests/{id} PATCH tableNumber pour persister.
// Hydration initiale = bonne (lit g.tableNumber).
export default function PlanTableWidget({ guests }: { guests: Guest[] }) {
  const [assignments, setAssignments] = useState<Record<string, number>>(() =>
    Object.fromEntries(guests.filter(g => g.tableNumber).map(g => [g.id, g.tableNumber!]))
  )
  const [showPopup, setShowPopup] = useState(false)
  const [tableNum, setTableNum] = useState("")
  const [selected, setSelected] = useState<string[]>([])

  const byTable: Record<number, Guest[]> = {}
  guests.forEach(g => {
    const t = assignments[g.id]
    if (t) { if (!byTable[t]) byTable[t] = []; byTable[t].push(g) }
  })
  const unassigned = guests.filter(g => !assignments[g.id])
  const tables = Object.entries(byTable).sort((a, b) => Number(a[0]) - Number(b[0]))

  function handleCreate() {
    const n = parseInt(tableNum)
    if (!n || selected.length === 0) return
    setAssignments(p => { const next = { ...p }; selected.forEach(id => { next[id] = n }); return next })
    setTableNum(""); setSelected([]); setShowPopup(false)
  }

  return (
    <div style={{ padding: "12px 16px 16px", display: "flex", flexDirection: "column", gap: 8, boxSizing: "border-box", position: "relative" }}>
      {guests.length === 0 ? (
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <div style={{ fontSize: "var(--text-xl)" }}>🪑</div>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--dash-text-3,#9a9aaa)", margin: "8px 0 0" }}>Aucun invité</p>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {tables.map(([n, gs]) => (
              <div key={n} style={{ background: "var(--dash-faint,rgba(183,191,217,0.1))", border: "1px solid var(--dash-border,rgba(183,191,217,0.3))", borderRadius: 10, padding: "6px 10px", textAlign: "center", minWidth: 46 }}>
                <div style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3,#9a9aaa)", fontWeight: 600, textTransform: "uppercase" }}>T{n}</div>
                <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--dash-text,#121317)" }}>{gs.length}</div>
              </div>
            ))}
            <button onClick={() => setShowPopup(v => !v)} style={{ minWidth: 46, padding: "6px 10px", borderRadius: 10, border: "1.5px dashed var(--dash-border,rgba(183,191,217,0.4))", background: "transparent", cursor: "pointer", fontSize: "var(--text-md)", color: "var(--g1,#E11D48)", fontWeight: 700 }}>+</button>
          </div>
          {unassigned.length > 0 && <p style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3,#9a9aaa)", margin: 0 }}>{unassigned.length} sans table</p>}
        </>
      )}
      {showPopup && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 30, background: "var(--dash-surface,#fff)", border: "1px solid var(--dash-border,rgba(183,191,217,0.4))", borderRadius: 14, padding: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--dash-text,#121317)" }}>Nouvelle table</span>
            <button onClick={() => setShowPopup(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "var(--text-xs)", color: "var(--dash-text-3,#9a9aaa)" }}>✕</button>
          </div>
          <input value={tableNum} onChange={e => setTableNum(e.target.value)} placeholder="Numéro de table" type="number"
            style={{ width: "100%", height: 28, padding: "0 8px", borderRadius: 8, border: "1px solid var(--dash-border,rgba(183,191,217,0.3))", background: "var(--dash-input-bg,#fafafa)", fontSize: "var(--text-xs)", outline: "none", fontFamily: "inherit", boxSizing: "border-box", marginBottom: 8 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 120, overflowY: "auto", marginBottom: 8 }}>
            {unassigned.slice(0, 10).map(g => (
              <label key={g.id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--text-xs)", cursor: "pointer" }}>
                <input type="checkbox" checked={selected.includes(g.id)} onChange={e => setSelected(p => e.target.checked ? [...p, g.id] : p.filter(x => x !== g.id))} />
                <span style={{ color: "var(--dash-text,#121317)" }}>{g.name}</span>
              </label>
            ))}
            {unassigned.length === 0 && <p style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3,#9a9aaa)", margin: 0 }}>Tous les invités sont assignés</p>}
          </div>
          <button onClick={handleCreate} style={{ width: "100%", height: 30, borderRadius: 8, border: "none", background: G, color: "#fff", fontSize: "var(--text-xs)", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Créer</button>
        </div>
      )}
    </div>
  )
}
