"use client"
import { useEffect, useState } from "react"

const G = "linear-gradient(135deg, #E11D48, #9333EA)"

type UserPlan = "free" | "pro"

export default function DevPanelClient() {
  const [plan, setPlan] = useState<UserPlan | null>(null)
  const [saving, setSaving] = useState(false)
  const [flash, setFlash] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/user/plan")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.plan) setPlan(d.plan as UserPlan) })
  }, [])

  async function setPlanTo(next: UserPlan) {
    setSaving(true)
    try {
      const r = await fetch("/api/user/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: next }),
      })
      if (r.ok) {
        const d = await r.json()
        setPlan(d.plan)
        setFlash(`✓ Plan basculé sur ${d.plan.toUpperCase()}`)
        setTimeout(() => setFlash(null), 2200)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--dash-bg, #0d0e14)", color: "var(--dash-text, #eeeef5)", fontFamily: "'Geist', sans-serif", padding: "48px 24px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <h1 style={{ fontSize: "var(--text-lg)", fontWeight: 800, margin: "0 0 6px" }}>Dev Panel</h1>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--dash-text-2, #b0b0cc)", margin: "0 0 36px" }}>
          Outils de développement — accessible uniquement à moumene486@gmail.com. Bascule rapide entre plans pour tester le gating.
        </p>

        <div style={{ background: "var(--dash-surface, #16171e)", borderRadius: 16, padding: "24px 28px", border: "1px solid var(--dash-border, rgba(255,255,255,0.07))" }}>
          <div style={{ fontSize: "var(--text-xs)", letterSpacing: 1.4, textTransform: "uppercase", color: "var(--dash-text-3, #8888aa)", fontWeight: 700, marginBottom: 8 }}>Plan utilisateur courant</div>
          <div style={{ fontSize: "var(--text-xl)", fontWeight: 800, backgroundImage: G, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            {plan ? plan.toUpperCase() : "…"}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button
              onClick={() => setPlanTo("free")}
              disabled={saving || plan === "free"}
              style={{ flex: 1, padding: "13px", borderRadius: 12, border: plan === "free" ? "2px solid #22c55e" : "1.5px solid rgba(255,255,255,0.14)", background: plan === "free" ? "rgba(34,197,94,0.08)" : "transparent", color: "var(--dash-text, #eeeef5)", fontSize: "var(--text-sm)", fontWeight: 700, cursor: saving || plan === "free" ? "default" : "pointer", fontFamily: "inherit" }}>
              {plan === "free" ? "✓ Free" : "Basculer Free"}
            </button>
            <button
              onClick={() => setPlanTo("pro")}
              disabled={saving || plan === "pro"}
              style={{ flex: 1, padding: "13px", borderRadius: 12, border: "none", background: plan === "pro" ? "rgba(34,197,94,0.12)" : G, color: "#fff", fontSize: "var(--text-sm)", fontWeight: 800, cursor: saving || plan === "pro" ? "default" : "pointer", fontFamily: "inherit", boxShadow: plan === "pro" ? "none" : "0 6px 18px color-mix(in srgb, var(--g1,#E11D48) 30%, transparent)" }}>
              {plan === "pro" ? "✓ Pro" : "Basculer Pro"}
            </button>
          </div>
          {flash && (
            <div style={{ marginTop: 14, fontSize: "var(--text-xs)", color: "#22c55e", fontWeight: 600 }}>{flash}</div>
          )}
        </div>

        <div style={{ marginTop: 24, fontSize: "var(--text-xs)", color: "var(--dash-text-3, #8888aa)", lineHeight: 1.6 }}>
          Raccourcis : <a href="/dashboard" style={{ color: "var(--dash-text-2, #b0b0cc)" }}>/dashboard</a> · <a href="/mes-prestataires" style={{ color: "var(--dash-text-2, #b0b0cc)" }}>/mes-prestataires</a> · <a href="/admin/vendors" style={{ color: "var(--dash-text-2, #b0b0cc)" }}>/admin/vendors</a> · <a href="/admin/ranking" style={{ color: "var(--dash-text-2, #b0b0cc)" }}>/admin/ranking</a>
        </div>
      </div>
    </div>
  )
}
