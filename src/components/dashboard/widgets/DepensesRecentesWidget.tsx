"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { BudgetItem } from "@/components/clone/dashboard/BudgetWidget"
import { G } from "./_shared"

/**
 * WIDGET-CONTRACT respecté :
 *   - data = budgetItems (DB via dashboard-data) UNIQUEMENT
 *   - L'ajout inline POST direct vers /api/planners/[plannerId]/budget-items
 *     puis router.refresh() pour resync dashboardData (plus de state local
 *     "extra" qui se perdait au refresh — bug fixé en Phase 4.4).
 *   - Empty state explicite + CTA vers /budget pour gestion complète.
 */
export default function DepensesRecentesWidget({
  budgetItems,
  plannerId,
}: {
  budgetItems: BudgetItem[]
  plannerId: string | null
}) {
  const router = useRouter()
  const [label, setLabel] = useState("")
  const [amount, setAmount] = useState("")
  const [busy, setBusy] = useState(false)
  const [errMsg, setErrMsg] = useState<string | null>(null)

  const sorted = budgetItems.filter((b) => b.spent > 0).sort((a, b) => b.spent - a.spent).slice(0, 6)
  const max = sorted.length > 0 ? Math.max(...sorted.map((b) => b.spent)) : 1

  async function handleAdd() {
    if (!plannerId) {
      setErrMsg("Aucun événement actif")
      return
    }
    const trimmedLabel = label.trim()
    const value = parseFloat(amount)
    if (!trimmedLabel || !isFinite(value) || value <= 0) {
      setErrMsg("Libellé et montant requis")
      return
    }
    setBusy(true)
    setErrMsg(null)
    try {
      const res = await fetch(`/api/planners/${plannerId}/budget-items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: trimmedLabel,
          category: "divers",
          estimated: value,
        }),
      })
      if (!res.ok) throw new Error()
      setLabel("")
      setAmount("")
      router.refresh() // resync dashboardData côté serveur
    } catch {
      setErrMsg("Erreur lors de l'ajout")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ padding: "12px 16px 16px", display: "flex", flexDirection: "column", gap: 8, boxSizing: "border-box" }}>
      {sorted.length === 0 && (
        <p style={{ fontSize: "var(--text-xs)", color: "var(--dash-text-3,#9a9aaa)", margin: 0 }}>
          Aucune dépense enregistrée
        </p>
      )}
      {sorted.map((b, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)" }}>
            <span style={{ color: "var(--dash-text,#121317)" }}>
              {"icon" in b ? (b as BudgetItem).icon + " " : ""}
              {b.label}
            </span>
            <span style={{ fontWeight: 600, color: "var(--g1,#E11D48)" }}>
              {b.spent.toLocaleString("fr-FR")} Dhs
            </span>
          </div>
          <div
            style={{
              height: 4,
              borderRadius: 999,
              background: "var(--dash-faint,rgba(183,191,217,0.18))",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${(b.spent / max) * 100}%`,
                height: "100%",
                background: b.color ?? "var(--g1,#E11D48)",
                transition: "width 0.4s",
              }}
            />
          </div>
        </div>
      ))}

      <div
        style={{
          display: "flex",
          gap: 4,
          marginTop: 4,
          borderTop: "1px solid var(--dash-border,rgba(183,191,217,0.2))",
          paddingTop: 8,
        }}
      >
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label"
          disabled={busy || !plannerId}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          style={{
            flex: 1,
            height: 28,
            padding: "0 8px",
            borderRadius: 8,
            border: "1px solid var(--dash-border,rgba(183,191,217,0.3))",
            background: "var(--dash-input-bg,#fafafa)",
            fontSize: "var(--text-xs)",
            color: "var(--dash-text,#121317)",
            outline: "none",
            fontFamily: "inherit",
          }}
        />
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Dhs"
          type="number"
          disabled={busy || !plannerId}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          style={{
            width: 60,
            height: 28,
            padding: "0 8px",
            borderRadius: 8,
            border: "1px solid var(--dash-border,rgba(183,191,217,0.3))",
            background: "var(--dash-input-bg,#fafafa)",
            fontSize: "var(--text-xs)",
            color: "var(--dash-text,#121317)",
            outline: "none",
            fontFamily: "inherit",
            textAlign: "right",
          }}
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={busy || !plannerId}
          aria-label="Ajouter une dépense rapide"
          style={{
            height: 28,
            width: 28,
            borderRadius: 8,
            border: "none",
            background: busy ? "var(--dash-faint-2,rgba(183,191,217,0.18))" : G,
            color: "#fff",
            fontSize: "var(--text-sm)",
            fontWeight: 700,
            cursor: busy || !plannerId ? "not-allowed" : "pointer",
            flexShrink: 0,
            opacity: busy || !plannerId ? 0.6 : 1,
          }}
        >
          +
        </button>
      </div>

      {errMsg && (
        <p style={{ fontSize: "var(--text-2xs)", color: "#ef4444", margin: "2px 0 0", fontWeight: 600 }}>
          {errMsg}
        </p>
      )}

      <Link
        href="/budget"
        style={{
          fontSize: "var(--text-2xs)",
          color: "var(--g1,#E11D48)",
          alignSelf: "flex-end",
          textDecoration: "none",
        }}
      >
        Voir le budget →
      </Link>
    </div>
  )
}
