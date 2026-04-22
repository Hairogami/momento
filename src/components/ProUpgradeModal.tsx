"use client"
import { useState } from "react"

const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"

type Props = {
  open: boolean
  onClose: () => void
  /** Trigger that opened the paywall — used in copy + analytics */
  reason?: "vendor-contact" | "messages" | "guests" | "checklist" | "favorites" | "theme" | "events-multiple"
  onUpgraded?: () => void
}

const REASON_COPY: Record<NonNullable<Props["reason"]>, { title: string; subtitle: string }> = {
  "vendor-contact":   { title: "Contactez les prestataires directement", subtitle: "Passez Pro pour envoyer des messages et demander des devis sans quitter Momento." },
  "messages":         { title: "Messagerie prestas illimitée",            subtitle: "Échangez en direct avec tous vos prestataires, une seule inbox." },
  "guests":           { title: "Gestion des invités complète",            subtitle: "Liste, RSVP, plans de table — tout en un." },
  "checklist":        { title: "Checklist temporelle personnalisée",      subtitle: "Les bonnes tâches au bon moment, selon votre date." },
  "favorites":        { title: "Favoris + comparaison",                   subtitle: "Mettez de côté vos prestataires préférés et comparez-les." },
  "theme":            { title: "Thème visuel personnalisé",               subtitle: "Palette + ambiance selon votre événement." },
  "events-multiple":  { title: "Plusieurs événements en même temps",      subtitle: "Mariage + soirée du henné + EVJG — gérez-les tous." },
}

export default function ProUpgradeModal({ open, onClose, reason = "vendor-contact", onUpgraded }: Props) {
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")

  if (!open) return null
  const copy = REASON_COPY[reason]

  async function upgrade() {
    setLoading(true); setErr("")
    try {
      const r = await fetch("/api/user/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro" }),
      })
      if (!r.ok) {
        const d = await r.json().catch(() => ({}))
        setErr(d.error || "Erreur. Réessayez.")
        return
      }
      onUpgraded?.()
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(5,5,10,0.72)", backdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, fontFamily: "'Geist', sans-serif",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--dash-surface, #16171e)",
          border: "1px solid var(--dash-border, rgba(255,255,255,0.07))",
          borderRadius: 24, width: "100%", maxWidth: 440,
          color: "var(--dash-text, #eeeef5)",
          padding: "28px 30px",
          boxShadow: "0 40px 90px rgba(0,0,0,0.6)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: -80, right: -80, width: 220, height: 220, background: "radial-gradient(circle, rgba(225,29,72,0.18), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 160, height: 160, background: "radial-gradient(circle, rgba(147,51,234,0.15), transparent 70%)", pointerEvents: "none" }} />

        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ display: "inline-block", padding: "4px 12px", fontSize: 10, background: G, color: "#fff", borderRadius: 99, fontWeight: 800, letterSpacing: "1.2px", textTransform: "uppercase" }}>✨ Momento Pro</span>
            <button onClick={onClose} style={{ background: "transparent", border: "none", color: "var(--dash-text-3, #8888aa)", fontSize: 22, cursor: "pointer" }}>✕</button>
          </div>

          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 6 }}>
            {copy.title}
          </h2>
          <p style={{ fontSize: 13, color: "var(--dash-text-2, #b0b0cc)", lineHeight: 1.5, marginBottom: 18 }}>{copy.subtitle}</p>

          <div style={{ background: "var(--dash-faint, rgba(255,255,255,0.04))", border: "1px solid var(--dash-border, rgba(255,255,255,0.07))", borderRadius: 14, padding: "16px 18px", marginBottom: 16 }}>
            {[
              "Messagerie directe avec tous les prestataires",
              "Checklist temporelle personnalisée",
              "Gestion invités + RSVP",
              "Favoris + comparaison",
              "Budget détaillé + verdict IA",
              "Thème visuel personnalisé",
            ].map(item => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, padding: "5px 0" }}>
                <span style={{ color: "#22c55e" }}>✓</span>
                <span style={{ color: "var(--dash-text, #eeeef5)" }}>{item}</span>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginBottom: 14 }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontWeight: 600, letterSpacing: "-0.02em", backgroundImage: G, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>200 MAD</span>
            <span style={{ fontSize: 13, color: "var(--dash-text-3, #8888aa)", marginLeft: 6 }}>/ mois</span>
          </div>

          {err && <div style={{ padding: "8px 10px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", fontSize: 12, borderRadius: 10, marginBottom: 10 }}>{err}</div>}

          <button
            onClick={upgrade}
            disabled={loading}
            style={{
              width: "100%", padding: "14px", background: G, color: "#fff",
              border: "none", borderRadius: 14, fontSize: 14, fontWeight: 800,
              cursor: loading ? "default" : "pointer", opacity: loading ? 0.65 : 1,
              boxShadow: "0 8px 24px rgba(225,29,72,0.3)", fontFamily: "inherit",
            }}
          >
            {loading ? "Activation…" : "Passer Pro maintenant"}
          </button>
          <button
            onClick={onClose}
            style={{
              width: "100%", marginTop: 8, padding: "10px", background: "transparent",
              border: "none", color: "var(--dash-text-3, #8888aa)", fontSize: 12, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Plus tard
          </button>
        </div>
      </div>
    </div>
  )
}
