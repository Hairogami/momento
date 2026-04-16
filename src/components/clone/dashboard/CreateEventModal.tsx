"use client"
import { useState } from "react"

const G = "linear-gradient(135deg, #E11D48, #9333EA)"

const EVENT_TYPES = [
  { value: "mariage",      label: "Mariage",       emoji: "💍" },
  { value: "anniversaire", label: "Anniversaire",  emoji: "🎂" },
  { value: "corporate",    label: "Corporate",     emoji: "💼" },
  { value: "fiançailles",  label: "Fiançailles",   emoji: "💐" },
  { value: "autre",        label: "Autre",         emoji: "✨" },
]

const ALL_CATEGORIES = [
  { value: "Photographe",             emoji: "📸" },
  { value: "Vidéaste",                emoji: "🎬" },
  { value: "DJ",                      emoji: "🎧" },
  { value: "Orchestre",               emoji: "🎻" },
  { value: "Chanteur / chanteuse",    emoji: "🎤" },
  { value: "Traiteur",                emoji: "🍽️" },
  { value: "Pâtissier / Cake designer", emoji: "🎂" },
  { value: "Service de bar / mixologue", emoji: "🍹" },
  { value: "Lieu de réception",       emoji: "🏛️" },
  { value: "Décorateur",              emoji: "✨" },
  { value: "Fleuriste événementiel",  emoji: "🌸" },
  { value: "Hairstylist",             emoji: "💇" },
  { value: "Makeup Artist",           emoji: "💄" },
  { value: "Neggafa",                 emoji: "👘" },
  { value: "Robes de mariés",         emoji: "👗" },
  { value: "Wedding planner",         emoji: "📋" },
  { value: "Event planner",           emoji: "🗓️" },
  { value: "Animateur enfants",       emoji: "🎪" },
  { value: "Magicien",                emoji: "🎩" },
  { value: "Violoniste",              emoji: "🎵" },
]

type Props = {
  open: boolean
  onClose: () => void
  onCreated: (planner: { id: string; title: string; categories: string[] }) => void
}

export default function CreateEventModal({ open, onClose, onCreated }: Props) {
  const [step, setStep] = useState<1 | 2>(1)
  const [title, setTitle] = useState("")
  const [eventType, setEventType] = useState("mariage")
  const [weddingDate, setWeddingDate] = useState("")
  const [budget, setBudget] = useState("")
  const [selectedCats, setSelectedCats] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  if (!open) return null

  function reset() {
    setStep(1); setTitle(""); setEventType("mariage")
    setWeddingDate(""); setBudget(""); setSelectedCats([])
    setError(""); setLoading(false)
  }

  function handleClose() { reset(); onClose() }

  function toggleCat(cat: string) {
    setSelectedCats(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  async function handleSubmit() {
    if (selectedCats.length < 3) {
      setError("Sélectionnez au moins 3 catégories.")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/planners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || `Mon ${EVENT_TYPES.find(e => e.value === eventType)?.label ?? "événement"}`,
          coupleNames: "",
          weddingDate: weddingDate || null,
          budget: budget ? parseFloat(budget) : null,
          categories: selectedCats,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Erreur lors de la création."); return }
      reset()
      onCreated(data)
    } catch {
      setError("Erreur réseau. Réessayez.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 24, width: "100%", maxWidth: 520,
          boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ padding: "24px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#9a9aaa", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px" }}>
              Étape {step}/2
            </p>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#121317", margin: 0 }}>
              {step === 1 ? "Votre événement" : "Catégories de prestataires"}
            </h2>
          </div>
          <button onClick={handleClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#9a9aaa", padding: 4 }}>✕</button>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: "#f0f0f5", margin: "16px 24px 0" }}>
          <div style={{ height: "100%", width: step === 1 ? "50%" : "100%", background: G, borderRadius: 99, transition: "width 0.3s ease" }} />
        </div>

        <div style={{ padding: "20px 24px 24px" }}>
          {step === 1 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Event type */}
              <div>
                <label style={labelStyle}>Type d&apos;événement</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                  {EVENT_TYPES.map(t => (
                    <button
                      key={t.value}
                      onClick={() => setEventType(t.value)}
                      style={{
                        padding: "7px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600,
                        border: "1.5px solid",
                        borderColor: eventType === t.value ? "#E11D48" : "rgba(183,191,217,0.4)",
                        background: eventType === t.value ? "rgba(225,29,72,0.06)" : "transparent",
                        color: eventType === t.value ? "#E11D48" : "#6a6a71",
                        cursor: "pointer", transition: "all 0.15s",
                      }}
                    >{t.emoji} {t.label}</button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label style={labelStyle}>Nom de l&apos;événement <span style={{ color: "#9a9aaa" }}>(optionnel)</span></label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder={`Mon ${EVENT_TYPES.find(e => e.value === eventType)?.label ?? "événement"}`}
                  style={inputStyle}
                />
              </div>

              {/* Date + budget */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Date <span style={{ color: "#9a9aaa" }}>(optionnel)</span></label>
                  <input type="date" value={weddingDate} onChange={e => setWeddingDate(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Budget MAD <span style={{ color: "#9a9aaa" }}>(optionnel)</span></label>
                  <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="ex: 80000" min={0} style={inputStyle} />
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                style={{ ...btnPrimary, marginTop: 4 }}
              >
                Continuer →
              </button>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 13, color: "#6a6a71", margin: "0 0 16px" }}>
                Sélectionnez les prestataires dont vous aurez besoin.{" "}
                <strong style={{ color: selectedCats.length >= 3 ? "#22c55e" : "#E11D48" }}>
                  {selectedCats.length}/3 minimum
                </strong>
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 8, maxHeight: 320, overflowY: "auto", paddingRight: 4 }}>
                {ALL_CATEGORIES.map(cat => {
                  const selected = selectedCats.includes(cat.value)
                  return (
                    <button
                      key={cat.value}
                      onClick={() => toggleCat(cat.value)}
                      style={{
                        padding: "10px 12px", borderRadius: 12, fontSize: 12, fontWeight: 600,
                        border: "1.5px solid",
                        borderColor: selected ? "#E11D48" : "rgba(183,191,217,0.3)",
                        background: selected ? "rgba(225,29,72,0.06)" : "rgba(248,248,252,0.8)",
                        color: selected ? "#E11D48" : "#6a6a71",
                        cursor: "pointer", textAlign: "left",
                        display: "flex", alignItems: "center", gap: 7,
                        transition: "all 0.12s",
                      }}
                    >
                      <span style={{ fontSize: 16 }}>{cat.emoji}</span>
                      <span style={{ lineHeight: 1.3 }}>{cat.value}</span>
                    </button>
                  )
                })}
              </div>

              {error && <p style={{ fontSize: 12, color: "#ef4444", marginTop: 10, marginBottom: 0 }}>{error}</p>}

              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button onClick={() => setStep(1)} style={btnSecondary}>← Retour</button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || selectedCats.length < 3}
                  style={{ ...btnPrimary, flex: 1, opacity: selectedCats.length < 3 ? 0.5 : 1 }}
                >
                  {loading ? "Création…" : "Créer l'événement 🎉"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: "#6a6a71", display: "block", marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", borderRadius: 10, fontSize: 13,
  border: "1.5px solid rgba(183,191,217,0.4)", outline: "none",
  fontFamily: "inherit", color: "#121317", background: "#fafafa",
  boxSizing: "border-box",
}

const btnPrimary: React.CSSProperties = {
  padding: "12px 20px", borderRadius: 99, border: "none",
  background: G, color: "#fff", fontSize: 13, fontWeight: 600,
  cursor: "pointer", fontFamily: "inherit", transition: "opacity 0.15s",
}

const btnSecondary: React.CSSProperties = {
  padding: "12px 20px", borderRadius: 99,
  border: "1.5px solid rgba(183,191,217,0.4)",
  background: "transparent", color: "#6a6a71", fontSize: 13, fontWeight: 600,
  cursor: "pointer", fontFamily: "inherit",
}
