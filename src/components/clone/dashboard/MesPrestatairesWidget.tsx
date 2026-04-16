"use client"
import { useEffect, useState } from "react"
import Link from "next/link"

const G = "linear-gradient(135deg, #E11D48, #9333EA)"

type PlannerVendor = { vendorSlug: string; status: string; vendor: { category: string } }
type PlannerDetail = { categories: string[] }

export default function MesPrestatairesWidget({ plannerId }: { plannerId: string }) {
  const [planner, setPlanner] = useState<PlannerDetail | null>(null)
  const [vendors, setVendors] = useState<PlannerVendor[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!plannerId) return
    setLoading(true)
    Promise.all([
      fetch(`/api/planners/${plannerId}`),
      fetch(`/api/planners/${plannerId}/vendors`),
    ])
      .then(async ([pRes, vRes]) => {
        if (pRes.ok) setPlanner(await pRes.json())
        if (vRes.ok) setVendors(await vRes.json())
      })
      .finally(() => setLoading(false))
  }, [plannerId])

  const categories = planner?.categories ?? []
  const covered    = categories.filter(cat => vendors.some(v => v.vendor.category === cat))
  const pct        = categories.length > 0 ? Math.round((covered.length / categories.length) * 100) : 0

  if (!plannerId || (!loading && categories.length === 0)) {
    return (
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 10 }}>
        <span style={{ fontSize: 28 }}>🤝</span>
        <p style={{ fontSize: 12, color: "var(--dash-text-2,#6a6a71)", textAlign: "center", margin: 0 }}>
          Créez un événement pour gérer vos prestataires
        </p>
        <Link href="/mes-prestataires" style={{ fontSize: 11, fontWeight: 600, color: "#E11D48", textDecoration: "none" }}>
          Commencer →
        </Link>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "14px 16px 16px" }}>
      {/* Progress header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--dash-text,#121317)" }}>
          {covered.length}/{categories.length} catégories
        </span>
        <span style={{
          fontSize: 12, fontWeight: 700,
          backgroundImage: G, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>{pct}%</span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 5, background: "var(--dash-faint-2,rgba(183,191,217,0.15))", borderRadius: 99, marginBottom: 14 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: G, borderRadius: 99, transition: "width 0.4s ease" }} />
      </div>

      {/* Category chips */}
      <div style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: 7, alignContent: "flex-start", overflowY: "auto" }}>
        {loading ? (
          <p style={{ fontSize: 12, color: "var(--dash-text-3,#9a9aaa)" }}>Chargement…</p>
        ) : (
          categories.map(cat => {
            const hasCoverage = vendors.some(v => v.vendor.category === cat)
            const count = vendors.filter(v => v.vendor.category === cat).length
            return (
              <div key={cat} style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "5px 11px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                background: hasCoverage ? "rgba(34,197,94,0.1)" : "var(--dash-faint-2,rgba(183,191,217,0.1))",
                color: hasCoverage ? "#22c55e" : "var(--dash-text-3,#9a9aaa)",
                border: `1px solid ${hasCoverage ? "rgba(34,197,94,0.2)" : "rgba(183,191,217,0.2)"}`,
              }}>
                <span>{hasCoverage ? "✓" : "○"}</span>
                <span>{cat}{hasCoverage && count > 1 ? ` ×${count}` : ""}</span>
              </div>
            )
          })
        )}
      </div>

      {/* CTA */}
      <Link href="/mes-prestataires" style={{
        marginTop: 14,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "9px 16px", borderRadius: 12, textDecoration: "none",
        background: pct === 100 ? "rgba(34,197,94,0.1)" : "rgba(225,29,72,0.06)",
        color: pct === 100 ? "#22c55e" : "#E11D48",
        fontSize: 11, fontWeight: 700, gap: 5,
      }}>
        {pct === 100 ? "✓ Tous vos prestataires" : `+ Gérer vos prestataires`}
      </Link>
    </div>
  )
}
