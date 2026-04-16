"use client"
import { useEffect, useState } from "react"

type Config = { id: string; signal: string; label: string; weight: number; updatedAt: string }

const SIGNAL_INFO: Record<string, { desc: string; emoji: string }> = {
  featured:     { emoji: "⭐", desc: "Boost partenaire payant" },
  rating:       { emoji: "🌟", desc: "Note moyenne (0-5)" },
  reviewCount:  { emoji: "💬", desc: "Nombre d'avis" },
  mediaCount:   { emoji: "📸", desc: "Nombre de photos" },
}

export default function AdminRankingPage() {
  const [configs, setConfigs] = useState<Config[]>([])
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/ranking")
      .then(r => r.ok ? r.json() : null)
      .then((data: Config[] | null) => { if (Array.isArray(data)) setConfigs(data) })
      .finally(() => setLoading(false))
  }, [])

  async function update(signal: string, weight: number) {
    setSaving(signal)
    setSaved(null)
    try {
      const res = await fetch("/api/admin/ranking", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signal, weight }),
      })
      if (res.ok) {
        const updated: Config = await res.json()
        setConfigs(prev => prev.map(c => c.signal === signal ? updated : c))
        setSaved(signal)
        setTimeout(() => setSaved(null), 2000)
      }
    } finally {
      setSaving(null)
    }
  }

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#121317", margin: "0 0 6px" }}>
        Smart Ranking — Poids
      </h1>
      <p style={{ fontSize: 13, color: "#6a6a71", margin: "0 0 36px" }}>
        Modifie les poids des signaux de classement. Valeurs entre 0 et 1000. Valide immédiatement.
      </p>

      {loading ? (
        <p style={{ color: "#9a9aaa", fontSize: 13 }}>Chargement…</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {configs.map(c => {
            const info = SIGNAL_INFO[c.signal] ?? { emoji: "⚙️", desc: c.signal }
            const isSaving = saving === c.signal
            const isSaved = saved === c.signal
            return (
              <div key={c.signal} style={{
                background: "#fff", borderRadius: 16, padding: "20px 24px",
                border: "1px solid rgba(183,191,217,0.2)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div>
                    <span style={{ fontSize: 18, marginRight: 8 }}>{info.emoji}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#121317" }}>{c.signal}</span>
                    <span style={{ fontSize: 12, color: "#9a9aaa", marginLeft: 10 }}>{info.desc}</span>
                  </div>
                  <span style={{
                    fontSize: 20, fontWeight: 800, color: "#E11D48", minWidth: 48, textAlign: "right",
                  }}>
                    {c.weight}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <input
                    type="range"
                    min={0} max={200} step={5}
                    value={c.weight}
                    onChange={e => setConfigs(prev => prev.map(x => x.signal === c.signal ? { ...x, weight: Number(e.target.value) } : x))}
                    style={{ flex: 1, accentColor: "#E11D48" }}
                  />
                  <input
                    type="number"
                    min={0} max={1000}
                    value={c.weight}
                    onChange={e => setConfigs(prev => prev.map(x => x.signal === c.signal ? { ...x, weight: Number(e.target.value) } : x))}
                    style={{
                      width: 72, padding: "6px 10px", borderRadius: 8, border: "1.5px solid rgba(183,191,217,0.4)",
                      fontSize: 13, fontWeight: 700, textAlign: "center", fontFamily: "inherit",
                    }}
                  />
                  <button
                    onClick={() => update(c.signal, c.weight)}
                    disabled={isSaving}
                    style={{
                      padding: "8px 18px", borderRadius: 99, border: "none",
                      background: isSaved ? "#22c55e" : "linear-gradient(135deg,#E11D48,#9333EA)",
                      color: "#fff", fontSize: 12, fontWeight: 600,
                      cursor: isSaving ? "not-allowed" : "pointer", opacity: isSaving ? 0.6 : 1,
                      fontFamily: "inherit", transition: "background 0.2s",
                    }}
                  >
                    {isSaving ? "…" : isSaved ? "✓ Sauvé" : "Valider"}
                  </button>
                </div>

                <p style={{ fontSize: 11, color: "#9a9aaa", margin: "10px 0 0" }}>
                  Mis à jour : {new Date(c.updatedAt).toLocaleString("fr-MA")}
                </p>
              </div>
            )
          })}
        </div>
      )}

      <div style={{ marginTop: 40, padding: "16px 20px", borderRadius: 12, background: "rgba(225,29,72,0.05)", border: "1px solid rgba(225,29,72,0.15)" }}>
        <p style={{ fontSize: 12, color: "#6a6a71", margin: 0 }}>
          <strong>Comment ça marche :</strong> chaque prestataire reçoit un score = featured×poids + rating×poids + log(reviewCount+1)×poids + log(mediaCount+1)×poids.
          Les prestataires partenaires (⭐ featured) bénéficient du boost le plus fort par défaut.
        </p>
      </div>
    </div>
  )
}
