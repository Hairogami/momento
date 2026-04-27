"use client"
import { useState } from "react"
import Link from "next/link"
import type { BudgetItem } from "@/components/clone/dashboard/BudgetWidget"
import { G } from "./_shared"

// WIDGET-CONTRACT : data = budgetItems (DB via dashboard-data) + extra
// (in-memory, perdu au refresh). Délibéré pour ajout rapide non-engageant.
export default function DepensesRecentesWidget({ budgetItems }: { budgetItems: BudgetItem[] }) {
  const [extra, setExtra] = useState<{ label: string; spent: number; color: string }[]>([])
  const [label, setLabel] = useState("")
  const [amount, setAmount] = useState("")
  const all = [...budgetItems.filter(b => b.spent > 0), ...extra].sort((a, b) => b.spent - a.spent).slice(0, 6)
  const max = all.length > 0 ? Math.max(...all.map(b => b.spent)) : 1

  function handleAdd() {
    if (!label.trim()) return
    setExtra(p => [...p, { label: label.trim(), spent: parseFloat(amount) || 0, color: "var(--g1,#E11D48)" }])
    setLabel(""); setAmount("")
  }

  return (
    <div style={{ padding: "12px 16px 16px", display: "flex", flexDirection: "column", gap: 8, boxSizing: "border-box" }}>
      {all.length === 0 && <p style={{ fontSize: "var(--text-xs)", color: "var(--dash-text-3,#9a9aaa)", margin: 0 }}>Aucune dépense enregistrée</p>}
      {all.map((b, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)" }}>
            <span style={{ color: "var(--dash-text,#121317)" }}>{"icon" in b ? (b as BudgetItem).icon + " " : ""}{b.label}</span>
            <span style={{ fontWeight: 600, color: "var(--g1,#E11D48)" }}>{b.spent.toLocaleString("fr-FR")} Dhs</span>
          </div>
          <div style={{ height: 4, borderRadius: 99, background: "var(--dash-faint,rgba(183,191,217,0.18))", overflow: "hidden" }}>
            <div style={{ width: `${(b.spent / max) * 100}%`, height: "100%", background: b.color ?? "var(--g1,#E11D48)", transition: "width 0.4s" }} />
          </div>
        </div>
      ))}
      <div style={{ display: "flex", gap: 4, marginTop: 4, borderTop: "1px solid var(--dash-border,rgba(183,191,217,0.2))", paddingTop: 8 }}>
        <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Label" onKeyDown={e => e.key === "Enter" && handleAdd()}
          style={{ flex: 1, height: 28, padding: "0 8px", borderRadius: 8, border: "1px solid var(--dash-border,rgba(183,191,217,0.3))", background: "var(--dash-input-bg,#fafafa)", fontSize: "var(--text-xs)", color: "var(--dash-text,#121317)", outline: "none", fontFamily: "inherit" }} />
        <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Dhs" type="number" onKeyDown={e => e.key === "Enter" && handleAdd()}
          style={{ width: 60, height: 28, padding: "0 8px", borderRadius: 8, border: "1px solid var(--dash-border,rgba(183,191,217,0.3))", background: "var(--dash-input-bg,#fafafa)", fontSize: "var(--text-xs)", color: "var(--dash-text,#121317)", outline: "none", fontFamily: "inherit", textAlign: "right" }} />
        <button onClick={handleAdd} style={{ height: 28, width: 28, borderRadius: 8, border: "none", background: G, color: "#fff", fontSize: "var(--text-sm)", fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>+</button>
      </div>
      <Link href="/budget" style={{ fontSize: "var(--text-2xs)", color: "var(--g1,#E11D48)", alignSelf: "flex-end", textDecoration: "none" }}>Voir le budget →</Link>
    </div>
  )
}
