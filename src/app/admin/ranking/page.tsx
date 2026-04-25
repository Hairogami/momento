"use client"
import { useEffect, useState } from "react"

const C = {
  bg:        "#0b0b10",
  panel:     "#15161d",
  panel2:    "#1c1d27",
  border:    "#252633",
  text:      "#f0f0f5",
  textMuted: "#9a9aaa",
  textDim:   "#6a6a78",
  accent:    "#9333EA",
  accent2:   "#E11D48",
  ok:        "#22c55e",
  star:      "#facc15",
}

type Config = { id: string; signal: string; label: string; weight: number; updatedAt: string }

const SIGNAL_INFO: Record<string, { desc: string; emoji: string }> = {
  featured:    { emoji: "⭐", desc: "Boost partenaire payant" },
  rating:      { emoji: "🌟", desc: "Note moyenne (0-5)" },
  reviewCount: { emoji: "💬", desc: "Nombre d'avis" },
  mediaCount:  { emoji: "📸", desc: "Nombre de photos" },
}

export default function AdminRankingPage() {
  const [configs, setConfigs] = useState<Config[]>([])
  const [saving, setSaving]   = useState<string | null>(null)
  const [saved, setSaved]     = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/ranking")
      .then(r => r.ok ? r.json() : null)
      .then((data: Config[] | null) => { if (Array.isArray(data)) setConfigs(data) })
      .finally(() => setLoading(false))
  }, [])

  async function update(signal: string, weight: number) {
    setSaving(signal); setSaved(null)
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
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      padding: "32px 24px",
    }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
          Smart Ranking — Poids
        </h1>
        <p style={{ fontSize: 13, color: C.textMuted, margin: "0 0 28px" }}>
          Modifie les poids des signaux de classement (0–1000). Validation immédiate.
        </p>

        {loading ? (
          <div style={{ padding: 60, textAlign: "center", color: C.textMuted, fontSize: 14 }}>Chargement…</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {configs.map(c => {
              const info = SIGNAL_INFO[c.signal] ?? { emoji: "⚙️", desc: c.signal }
              const isSaving = saving === c.signal
              const isSaved  = saved  === c.signal
              return (
                <div key={c.signal} style={{
                  background: C.panel, borderRadius: 14, padding: "20px 22px",
                  border: `1px solid ${C.border}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 20 }}>{info.emoji}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{c.signal}</span>
                      <span style={{ fontSize: 12, color: C.textMuted }}>{info.desc}</span>
                    </div>
                    <span style={{
                      fontSize: 22, fontWeight: 800, color: C.accent2,
                      minWidth: 56, textAlign: "right",
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
                      style={{ flex: 1, accentColor: C.accent2 }}
                    />
                    <input
                      type="number"
                      min={0} max={1000}
                      value={c.weight}
                      onChange={e => setConfigs(prev => prev.map(x => x.signal === c.signal ? { ...x, weight: Number(e.target.value) } : x))}
                      style={{
                        width: 80, padding: "7px 10px", borderRadius: 8,
                        border: `1px solid ${C.border}`, background: C.bg,
                        color: C.text, fontSize: 13, fontWeight: 700,
                        textAlign: "center", fontFamily: "inherit", outline: "none",
                      }}
                    />
                    <button
                      onClick={() => update(c.signal, c.weight)}
                      disabled={isSaving}
                      style={{
                        padding: "8px 18px", borderRadius: 99, border: "none",
                        background: isSaved ? C.ok : `linear-gradient(135deg, ${C.accent2}, ${C.accent})`,
                        color: "#fff", fontSize: 12, fontWeight: 700,
                        cursor: isSaving ? "not-allowed" : "pointer", opacity: isSaving ? 0.6 : 1,
                        fontFamily: "inherit", transition: "background 0.2s",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {isSaving ? "…" : isSaved ? "✓ Sauvé" : "Valider"}
                    </button>
                  </div>

                  <p style={{ fontSize: 11, color: C.textDim, margin: "10px 0 0" }}>
                    MAJ : {new Date(c.updatedAt).toLocaleString("fr-MA")}
                  </p>
                </div>
              )
            })}
          </div>
        )}

        <div style={{
          marginTop: 28, padding: "16px 20px", borderRadius: 12,
          background: C.panel2, border: `1px solid ${C.border}`,
        }}>
          <p style={{ fontSize: 12, color: C.textMuted, margin: 0, lineHeight: 1.6 }}>
            <strong style={{ color: C.text }}>Comment ça marche :</strong> chaque prestataire reçoit un score
            = <code style={codeStyle}>featured×poids</code> + <code style={codeStyle}>rating×poids</code>
            + <code style={codeStyle}>log(reviewCount+1)×poids</code> + <code style={codeStyle}>log(mediaCount+1)×poids</code>.
            Les partenaires (⭐ featured) bénéficient du boost le plus fort par défaut.
          </p>
        </div>
      </div>
    </div>
  )
}

const codeStyle: React.CSSProperties = {
  fontFamily: "ui-monospace, monospace",
  background: "rgba(147,51,234,0.12)", color: "#cbb3ff",
  padding: "1px 5px", borderRadius: 4, fontSize: 11,
}
