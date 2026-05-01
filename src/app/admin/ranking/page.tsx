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
type PriceRange = { id: string; category: string; tier1Max: number; tier2Max: number; tier3Max: number }

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
  const [priceRanges, setPriceRanges] = useState<PriceRange[]>([])
  const [editingPR, setEditingPR] = useState<Record<string, PriceRange>>({})
  const [savingPR, setSavingPR] = useState<string | null>(null)
  const [savedPR, setSavedPR] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/admin/ranking")
      .then(r => r.ok ? r.json() : null)
      .then((data: Config[] | null) => { if (Array.isArray(data)) setConfigs(data) })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetch("/api/admin/price-ranges")
      .then(r => r.ok ? r.json() : [])
      .then((data: PriceRange[]) => {
        setPriceRanges(data)
        const map: Record<string, PriceRange> = {}
        for (const r of data) map[r.category] = { ...r }
        setEditingPR(map)
      })
  }, [])

  async function savePriceRange(category: string) {
    const r = editingPR[category]
    if (!r) return
    setSavingPR(category); setSavedPR(null)
    try {
      const res = await fetch("/api/admin/price-ranges", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, tier1Max: r.tier1Max, tier2Max: r.tier2Max, tier3Max: r.tier3Max }),
      })
      if (res.ok) {
        const updated: PriceRange = await res.json()
        setPriceRanges(prev => prev.map(p => p.category === category ? updated : p))
        setSavedPR(category)
        setTimeout(() => setSavedPR(null), 2000)
      }
    } finally {
      setSavingPR(null)
    }
  }

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
      minHeight: "100dvh", background: C.bg, color: C.text,
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      padding: "32px 24px",
    }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <h1 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: C.text, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
          Smart Ranking — Poids
        </h1>
        <p style={{ fontSize: "var(--text-sm)", color: C.textMuted, margin: "0 0 28px" }}>
          Modifie les poids des signaux de classement (0–1000). Validation immédiate.
        </p>

        {loading ? (
          <div style={{ padding: 60, textAlign: "center", color: C.textMuted, fontSize: "var(--text-sm)" }}>Chargement…</div>
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
                      <span style={{ fontSize: "var(--text-md)" }}>{info.emoji}</span>
                      <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: C.text }}>{c.signal}</span>
                      <span style={{ fontSize: "var(--text-xs)", color: C.textMuted }}>{info.desc}</span>
                    </div>
                    <span style={{
                      fontSize: "var(--text-lg)", fontWeight: 800, color: C.accent2,
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
                        color: C.text, fontSize: "var(--text-sm)", fontWeight: 700,
                        textAlign: "center", fontFamily: "inherit", outline: "none",
                      }}
                    />
                    <button
                      onClick={() => update(c.signal, c.weight)}
                      disabled={isSaving}
                      style={{
                        padding: "8px 18px", borderRadius: 99, border: "none",
                        background: isSaved ? C.ok : `linear-gradient(135deg, ${C.accent2}, ${C.accent})`,
                        color: "#fff", fontSize: "var(--text-xs)", fontWeight: 700,
                        cursor: isSaving ? "not-allowed" : "pointer", opacity: isSaving ? 0.6 : 1,
                        fontFamily: "inherit", transition: "background 0.2s",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {isSaving ? "…" : isSaved ? "✓ Sauvé" : "Valider"}
                    </button>
                  </div>

                  <p style={{ fontSize: "var(--text-xs)", color: C.textDim, margin: "10px 0 0" }}>
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
          <p style={{ fontSize: "var(--text-xs)", color: C.textMuted, margin: 0, lineHeight: 1.6 }}>
            <strong style={{ color: C.text }}>Comment ça marche :</strong> chaque prestataire reçoit un score
            = <code style={codeStyle}>featured×poids</code> + <code style={codeStyle}>rating×poids</code>
            + <code style={codeStyle}>log(reviewCount+1)×poids</code> + <code style={codeStyle}>log(mediaCount+1)×poids</code>.
            Les partenaires (⭐ featured) bénéficient du boost le plus fort par défaut.
          </p>
        </div>

        {/* ─── Price Tiers ─────────────────────────────────────────── */}
        <div style={{ marginTop: 48 }}>
          <h2 style={{ fontSize: "var(--text-md)", fontWeight: 700, color: C.text, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            Tranches de prix — $ $$ $$$ $$$$
          </h2>
          <p style={{ fontSize: "var(--text-sm)", color: C.textMuted, margin: "0 0 20px" }}>
            Seuils en MAD par catégorie. $&nbsp;= en dessous de tier1, $$&nbsp;= entre tier1 et tier2, $$$&nbsp;= entre tier2 et tier3, $$$$&nbsp;= au-dessus de tier3.
          </p>

          {priceRanges.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: C.textMuted, fontSize: "var(--text-sm)" }}>Chargement…</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {priceRanges.map(r => {
                const ed = editingPR[r.category] ?? r
                const isSaving = savingPR === r.category
                const isSaved  = savedPR  === r.category
                return (
                  <div key={r.category} style={{
                    background: C.panel, borderRadius: 12, padding: "16px 20px",
                    border: `1px solid ${C.border}`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                      <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: C.text, minWidth: 180 }}>{r.category}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        {(["tier1Max", "tier2Max", "tier3Max"] as const).map((key, i) => (
                          <label key={key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ fontSize: "var(--text-xs)", color: C.textMuted, whiteSpace: "nowrap" }}>
                              {["$ max", "$$ max", "$$$ max"][i]}
                            </span>
                            <input
                              type="number"
                              min={0}
                              value={ed[key]}
                              onChange={e => setEditingPR(prev => ({
                                ...prev,
                                [r.category]: { ...prev[r.category]!, [key]: Number(e.target.value) },
                              }))}
                              style={{
                                width: 90, padding: "5px 8px", borderRadius: 8,
                                border: `1px solid ${C.border}`, background: C.bg,
                                color: C.text, fontSize: "var(--text-xs)", fontWeight: 700,
                                textAlign: "center", fontFamily: "inherit", outline: "none",
                              }}
                            />
                          </label>
                        ))}
                        <button
                          onClick={() => savePriceRange(r.category)}
                          disabled={isSaving}
                          style={{
                            padding: "6px 16px", borderRadius: 99, border: "none",
                            background: isSaved ? C.ok : `linear-gradient(135deg, ${C.accent2}, ${C.accent})`,
                            color: "#fff", fontSize: "var(--text-xs)", fontWeight: 700,
                            cursor: isSaving ? "not-allowed" : "pointer", opacity: isSaving ? 0.6 : 1,
                            fontFamily: "inherit", whiteSpace: "nowrap", transition: "background 0.2s",
                          }}
                        >
                          {isSaving ? "…" : isSaved ? "✓" : "Valider"}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const codeStyle: React.CSSProperties = {
  fontFamily: "ui-monospace, monospace",
  background: "rgba(147,51,234,0.12)", color: "#cbb3ff",
  padding: "1px 5px", borderRadius: 4, fontSize: "var(--text-xs)",
}
