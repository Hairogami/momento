"use client"
import { G } from "./_shared"

// WIDGET-CONTRACT : data = budget/spent/eventDate via props ; pas de state.
export default function ObjectifEpargneWidget({ budget, budgetSpent, eventDate }: { budget: number; budgetSpent: number; eventDate: string }) {
  const remaining = Math.max(0, budget - budgetSpent)
  const pct = budget > 0 ? Math.min(100, Math.round((budgetSpent / budget) * 100)) : 0
  const days = Math.max(0, Math.ceil((new Date(eventDate).getTime() - Date.now()) / 86400000))
  return (
    <div style={{ padding: "12px 16px 16px", display: "flex", flexDirection: "column", gap: 10, boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <p style={{ fontSize: "var(--text-md)", fontWeight: 700, color: "var(--g1,#E11D48)", margin: 0 }}>{remaining.toLocaleString("fr-FR")} Dhs</p>
          <p style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3,#9a9aaa)", margin: 0 }}>non engagé sur {budget.toLocaleString("fr-FR")} Dhs</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "var(--text-md)", fontWeight: 700, color: "var(--dash-text,#121317)", margin: 0 }}>J-{days}</p>
          <p style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3,#9a9aaa)", margin: 0 }}>avant l&apos;événement</p>
        </div>
      </div>
      <div style={{ height: 10, borderRadius: 99, background: "var(--dash-faint,rgba(183,191,217,0.18))", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: pct > 90 ? "var(--g1,#E11D48)" : G, transition: "width 0.4s" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)" }}>
        <span style={{ color: pct > 90 ? "var(--g1,#E11D48)" : "var(--dash-text-2,#45474D)", fontWeight: 600 }}>{pct}% engagé</span>
        <span style={{ color: "var(--dash-text-3,#9a9aaa)" }}>{100 - pct}% libre</span>
      </div>
    </div>
  )
}
