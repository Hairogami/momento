"use client"
import { useMemo, useState } from "react"
import { invalidatePlannerCache } from "@/hooks/usePlanners"
import { EVENT_FAMILIES, getEventSubType, getBudgetMedian, type EventFamilyId, type EventSubType } from "@/lib/eventTypes"
import { MOROCCAN_CITIES } from "@/lib/cities"

const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"

const ALL_CATEGORIES: { value: string; emoji: string }[] = [
  { value: "Photographe",               emoji: "📸" },
  { value: "Vidéaste",                  emoji: "🎬" },
  { value: "DJ",                        emoji: "🎧" },
  { value: "Orchestre",                 emoji: "🎻" },
  { value: "Chanteur / chanteuse",      emoji: "🎤" },
  { value: "Traiteur",                  emoji: "🍽️" },
  { value: "Pâtissier / Cake designer", emoji: "🎂" },
  { value: "Service de bar / mixologue",emoji: "🍹" },
  { value: "Lieu de réception",         emoji: "🏛️" },
  { value: "Décorateur",                emoji: "✨" },
  { value: "Fleuriste événementiel",    emoji: "🌸" },
  { value: "Hairstylist",               emoji: "💇" },
  { value: "Makeup Artist",             emoji: "💄" },
  { value: "Neggafa",                   emoji: "👘" },
  { value: "Dekka Marrakchia / Issawa", emoji: "🎺" },
  { value: "Robes de mariés",           emoji: "👗" },
  { value: "Wedding planner",           emoji: "📋" },
  { value: "Event planner",             emoji: "🗓️" },
  { value: "Animateur enfants",         emoji: "🎪" },
  { value: "Magicien",                  emoji: "🎩" },
  { value: "Violoniste",                emoji: "🎵" },
  { value: "VTC / Transport invités",   emoji: "🚗" },
  { value: "Créateur de faire-part",    emoji: "🎁" },
]

type Props = {
  open: boolean
  onClose: () => void
  onCreated: (planner: { id: string; title: string; categories: string[] }) => void
}

type Step = 1 | 2 | 3

export default function CreateEventModal({ open, onClose, onCreated }: Props) {
  const [step, setStep] = useState<Step>(1)

  const [familyId, setFamilyId] = useState<EventFamilyId>("mariage")
  const [subtypeId, setSubtypeId] = useState<string>("traditionnel")
  const [subtypeOpen, setSubtypeOpen] = useState<boolean>(false)
  const [title, setTitle] = useState("")
  const [weddingDate, setWeddingDate] = useState("")
  const [city, setCity] = useState("")
  const [cityOpen, setCityOpen] = useState<boolean>(false)
  const [guestCount, setGuestCount] = useState("")

  const [selectedCats, setSelectedCats] = useState<string[] | null>(null)

  const [budgetTotal, setBudgetTotal] = useState<number>(0)
  const [budgetPerCat, setBudgetPerCat] = useState<Record<string, number>>({})

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const family = useMemo(() => EVENT_FAMILIES.find(f => f.id === familyId)!, [familyId])
  const subtype: EventSubType | undefined = useMemo(() => getEventSubType(familyId, subtypeId), [familyId, subtypeId])

  function switchFamily(id: EventFamilyId) {
    setFamilyId(id)
    const fam = EVENT_FAMILIES.find(f => f.id === id)
    const first = fam?.subtypes[0]?.id ?? ""
    setSubtypeId(first)
    setSubtypeOpen(false)
    setSelectedCats(null)
  }

  function enterStep2() {
    if (!subtype) return
    if (selectedCats === null) setSelectedCats(subtype.defaultCategories)
    setStep(2)
  }

  function enterStep3() {
    if (!subtype) return
    const median = getBudgetMedian(subtype, city)
    const nextTotal = budgetTotal || median
    setBudgetTotal(nextTotal)
    const pct = subtype.budgetBreakdown
    const cats = selectedCats ?? subtype.defaultCategories
    const nextPerCat: Record<string, number> = {}
    for (const c of cats) {
      const p = pct[c] ?? 0
      nextPerCat[c] = Math.round((p / 100) * nextTotal)
    }
    setBudgetPerCat(nextPerCat)
    setStep(3)
  }

  if (!open) return null

  function reset() {
    setStep(1)
    setFamilyId("mariage"); setSubtypeId("traditionnel"); setSubtypeOpen(false)
    setTitle(""); setWeddingDate(""); setCity(""); setCityOpen(false); setGuestCount("")
    setSelectedCats(null); setBudgetTotal(0); setBudgetPerCat({})
    setError(""); setLoading(false)
  }
  function handleClose() { reset(); onClose() }

  function toggleCat(cat: string) {
    setSelectedCats(prev => {
      const base = prev ?? []
      return base.includes(cat) ? base.filter(c => c !== cat) : [...base, cat]
    })
  }

  function updateCatBudget(cat: string, value: number) {
    setBudgetPerCat(prev => ({ ...prev, [cat]: Math.max(0, Math.round(value)) }))
  }

  async function handleSubmit() {
    const cats = selectedCats ?? []
    if (cats.length < 3) { setError("Sélectionnez au moins 3 catégories."); return }
    setLoading(true); setError("")
    try {
      const res = await fetch("/api/planners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title || `Mon ${subtype?.label ?? family.label}`,
          coupleNames: "",
          weddingDate: weddingDate || null,
          budget: budgetTotal || null,
          budgetBreakdown: budgetPerCat,
          location: city || null,
          guestCount: guestCount ? parseInt(guestCount, 10) : null,
          eventType: familyId,
          eventSubType: subtypeId,
          categories: cats,
        }),
      })
      if (res.status === 401) {
        setError("Session expirée. Reconnectez-vous pour créer votre événement.")
        return
      }
      const data = await res.json().catch(() => ({} as { error?: string }))
      if (!res.ok) {
        setError(data.error ?? `Erreur ${res.status} lors de la création.`)
        console.error("[CreateEventModal] POST /api/planners failed:", res.status, data)
        return
      }
      invalidatePlannerCache()
      reset()
      onCreated(data)
    } catch (err) {
      console.error("[CreateEventModal] network error:", err)
      setError("Erreur réseau. Vérifiez votre connexion et réessayez.")
    } finally {
      setLoading(false)
    }
  }

  const activeCats = selectedCats ?? subtype?.defaultCategories ?? []
  const budgetSum = Object.values(budgetPerCat).reduce((a, b) => a + b, 0)
  const over = budgetSum > budgetTotal

  // Réinitialise la répartition selon les % recommandés du sous-type (stable, prévisible).
  // Remplace l'ancien rebalance() qui écrasait les ajustements manuels de façon illogique.
  function resetBreakdown() {
    if (!subtype || budgetTotal <= 0) return
    const pct = subtype.budgetBreakdown
    const cats = selectedCats ?? subtype.defaultCategories
    const next: Record<string, number> = {}
    for (const c of cats) {
      const p = pct[c] ?? 0
      next[c] = Math.round((p / 100) * budgetTotal)
    }
    setBudgetPerCat(next)
  }

  // Aligne le total sur la somme actuelle (si user veut garder ses montants et augmenter le budget).
  function alignTotalToSum() {
    if (budgetSum <= 0) return
    setBudgetTotal(budgetSum)
  }

  function bumpTotal(delta: number) {
    setBudgetTotal(prev => Math.max(0, prev + delta))
  }

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(5,5,10,0.72)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, fontFamily: "'Geist', sans-serif",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--dash-surface, #16171e)",
          border: "1px solid var(--dash-border, rgba(255,255,255,0.07))",
          color: "var(--dash-text, #eeeef5)",
          borderRadius: 24, width: "100%", maxWidth: 560,
          maxHeight: "92vh", overflow: "auto",
          boxShadow: "0 40px 90px rgba(0,0,0,0.55)",
        }}
      >
        <div style={{ padding: "24px 26px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 10.5, fontWeight: 700, color: "var(--dash-text-3, #8888aa)", textTransform: "uppercase", letterSpacing: "1.4px", margin: "0 0 4px" }}>
              Étape {step}/3
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 500, letterSpacing: "-0.015em", margin: 0 }}>
              {step === 1 ? "Votre événement" : step === 2 ? "Vos prestataires" : "Votre budget"}
            </h2>
          </div>
          <button onClick={handleClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "var(--dash-text-3, #8888aa)", padding: 4 }}>✕</button>
        </div>

        <div style={{ height: 3, background: "var(--dash-faint-2, rgba(255,255,255,0.08))", margin: "14px 26px 0", borderRadius: 99 }}>
          <div style={{ height: "100%", width: `${(step / 3) * 100}%`, background: G, borderRadius: 99, transition: "width 0.3s ease" }} />
        </div>

        <div style={{ padding: "20px 26px 26px" }}>

          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelStyle}>Type d&apos;événement</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginTop: 8 }}>
                  {EVENT_FAMILIES.map(f => {
                    const active = f.id === familyId
                    return (
                      <button key={f.id} onClick={() => switchFamily(f.id)} type="button"
                        style={{
                          padding: "11px 4px", borderRadius: 12, fontSize: 10.5, fontWeight: 600,
                          border: "1.5px solid",
                          borderColor: active ? "transparent" : "var(--dash-border, rgba(255,255,255,0.07))",
                          background: active ? "rgba(225,29,72,0.12)" : "var(--dash-faint, rgba(255,255,255,0.04))",
                          color: active ? "var(--dash-text, #eeeef5)" : "var(--dash-text-2, #b0b0cc)",
                          cursor: "pointer", transition: "all 0.12s",
                          boxShadow: active ? "0 0 0 1.5px rgba(225,29,72,0.45) inset" : undefined,
                        }}>
                        <div style={{ fontSize: 18 }}>{f.emoji}</div>
                        <div style={{ marginTop: 4, lineHeight: 1.2 }}>{f.label.split(" ")[0]}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Sous-type</label>
                <div style={{ position: "relative" }}>
                  <button
                    type="button"
                    onClick={() => setSubtypeOpen(o => !o)}
                    style={{
                      ...inputStyle,
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      cursor: "pointer", textAlign: "left",
                      borderColor: subtypeOpen ? "rgba(225,29,72,0.5)" : "var(--dash-border, rgba(255,255,255,0.07))",
                    }}
                    aria-expanded={subtypeOpen}
                    aria-haspopup="listbox"
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{subtype?.emoji ?? family.emoji}</span>
                      <span>{subtype?.label ?? "Choisir un sous-type"}</span>
                    </span>
                    <span style={{ fontSize: 11, color: "var(--g1, #E11D48)", transform: subtypeOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>▼</span>
                  </button>
                  {subtypeOpen && (
                    <>
                      <div
                        onClick={() => setSubtypeOpen(false)}
                        style={{ position: "fixed", inset: 0, zIndex: 10 }}
                        aria-hidden
                      />
                      <div
                        role="listbox"
                        style={{
                          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
                          background: "var(--dash-surface, #ffffff)",
                          border: "1.5px solid rgba(225,29,72,0.4)",
                          borderRadius: 12, padding: 5,
                          maxHeight: 260, overflowY: "auto",
                          zIndex: 20,
                          boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
                        }}
                      >
                        {family.subtypes.map(s => {
                          const active = s.id === subtypeId
                          return (
                            <button
                              key={s.id}
                              type="button"
                              role="option"
                              aria-selected={active}
                              onClick={() => { setSubtypeId(s.id); setSubtypeOpen(false) }}
                              style={{
                                width: "100%", display: "flex", alignItems: "center", gap: 10,
                                padding: "10px 12px", borderRadius: 10, border: "none",
                                background: active ? "rgba(225,29,72,0.14)" : "transparent",
                                color: "var(--dash-text, #121317)",
                                fontSize: 13, fontWeight: active ? 700 : 500,
                                cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                                transition: "background 0.12s",
                              }}
                              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "var(--dash-faint-2, rgba(0,0,0,0.05))" }}
                              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "transparent" }}
                            >
                              <span style={{ fontSize: 16 }}>{s.emoji ?? ""}</span>
                              <span style={{ flex: 1 }}>{s.label}</span>
                              {active && <span style={{ color: "var(--g1, #E11D48)", fontSize: 12, fontWeight: 800 }}>✓</span>}
                            </button>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>
                {subtype?.description && (
                  <p style={{ fontSize: 11, color: "var(--dash-text-3, #8888aa)", marginTop: 6 }}>{subtype.description}</p>
                )}
              </div>

              <div>
                <label style={labelStyle}>Nom de l&apos;événement <span style={subtleStyle}>(optionnel)</span></label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder={`Mon ${subtype?.label ?? family.label}`} style={inputStyle} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div>
                  <label style={labelStyle}>📅 Date</label>
                  <input type="date" value={weddingDate} onChange={e => setWeddingDate(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>📍 Ville</label>
                  <div style={{ position: "relative" }}>
                    <button
                      type="button"
                      onClick={() => setCityOpen(o => !o)}
                      style={{
                        ...inputStyle,
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        cursor: "pointer", textAlign: "left",
                        borderColor: cityOpen ? "rgba(225,29,72,0.5)" : "var(--dash-border, rgba(255,255,255,0.07))",
                      }}
                      aria-expanded={cityOpen}
                      aria-haspopup="listbox"
                    >
                      <span style={{ color: city ? "var(--dash-text, #121317)" : "var(--dash-text-3, #8888aa)" }}>
                        {city || "Choisir une ville"}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--g1, #E11D48)", transform: cityOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>▼</span>
                    </button>
                    {cityOpen && (
                      <>
                        <div
                          onClick={() => setCityOpen(false)}
                          style={{ position: "fixed", inset: 0, zIndex: 10 }}
                          aria-hidden
                        />
                        <div
                          role="listbox"
                          style={{
                            position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
                            background: "var(--dash-surface, #ffffff)",
                            border: "1.5px solid rgba(225,29,72,0.4)",
                            borderRadius: 12, padding: 5,
                            maxHeight: 260, overflowY: "auto",
                            zIndex: 20,
                            boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
                          }}
                        >
                          {MOROCCAN_CITIES.map(c => {
                            const active = c === city
                            return (
                              <button
                                key={c}
                                type="button"
                                role="option"
                                aria-selected={active}
                                onClick={() => { setCity(c); setCityOpen(false) }}
                                style={{
                                  width: "100%", display: "flex", alignItems: "center", gap: 10,
                                  padding: "9px 12px", borderRadius: 10, border: "none",
                                  background: active ? "rgba(225,29,72,0.14)" : "transparent",
                                  color: "var(--dash-text, #121317)",
                                  fontSize: 13, fontWeight: active ? 700 : 500,
                                  cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                                  transition: "background 0.12s",
                                }}
                                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "var(--dash-faint-2, rgba(0,0,0,0.05))" }}
                                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "transparent" }}
                              >
                                <span style={{ flex: 1 }}>{c}</span>
                                {active && <span style={{ color: "var(--g1, #E11D48)", fontSize: 12, fontWeight: 800 }}>✓</span>}
                              </button>
                            )
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>👥 Invités</label>
                  <input type="number" value={guestCount} onChange={e => setGuestCount(e.target.value)} placeholder="120" min={0} style={inputStyle} />
                </div>
              </div>

              <button onClick={enterStep2} style={btnPrimary}>Continuer →</button>
            </div>
          )}

          {step === 2 && (
            <div>
              <p style={{ fontSize: 13, color: "var(--dash-text-2, #b0b0cc)", margin: "0 0 4px" }}>
                On a pré-sélectionné les catégories pour un <strong style={{ color: "var(--dash-text, #eeeef5)" }}>{subtype?.label.toLowerCase() ?? family.label.toLowerCase()}</strong>.
              </p>
              <p style={{ fontSize: 12, color: "var(--dash-text-3, #8888aa)", margin: "0 0 16px" }}>
                Ajustez à votre guise — minimum 3 catégories.{" "}
                <strong style={{ color: activeCats.length >= 3 ? "#22c55e" : "var(--g1, #E11D48)" }}>
                  {activeCats.length} sélectionnée{activeCats.length !== 1 ? "s" : ""}
                </strong>
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 8, maxHeight: 340, overflowY: "auto", paddingRight: 4 }}>
                {ALL_CATEGORIES.map(cat => {
                  const selected = activeCats.includes(cat.value)
                  const isDefault = subtype?.defaultCategories.includes(cat.value)
                  return (
                    <button key={cat.value} onClick={() => toggleCat(cat.value)} type="button"
                      style={{
                        padding: "10px 12px", borderRadius: 12, fontSize: 12, fontWeight: 600,
                        border: "1.5px solid",
                        borderColor: selected ? "transparent" : "var(--dash-border, rgba(255,255,255,0.07))",
                        background: selected ? "rgba(225,29,72,0.10)" : "var(--dash-faint, rgba(255,255,255,0.04))",
                        color: selected ? "var(--dash-text, #eeeef5)" : "var(--dash-text-2, #b0b0cc)",
                        cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 8,
                        transition: "all 0.12s", position: "relative",
                        boxShadow: selected ? "0 0 0 1.5px rgba(225,29,72,0.5) inset" : undefined,
                      }}>
                      <span style={{ fontSize: 16 }}>{cat.emoji}</span>
                      <span style={{ lineHeight: 1.25, flex: 1 }}>{cat.value}</span>
                      {isDefault && (
                        <span
                          title="Recommandé pour ce type d'événement"
                          aria-label="Recommandé"
                          style={{
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            width: 18, height: 18, borderRadius: "50%",
                            background: "linear-gradient(135deg, var(--g1, #E11D48), var(--g2, #9333EA))",
                            color: "#fff", flexShrink: 0,
                            boxShadow: "0 2px 6px rgba(225,29,72,0.3)",
                          }}
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l2.39 7.36H22l-6.18 4.49 2.36 7.36L12 16.72l-6.18 4.49 2.36-7.36L2 9.36h7.61z" />
                          </svg>
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              {error && <p style={{ fontSize: 12, color: "#ef4444", marginTop: 10, marginBottom: 0 }}>{error}</p>}

              <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                <button onClick={() => setStep(1)} style={btnSecondary} type="button">← Retour</button>
                <button onClick={enterStep3} disabled={activeCats.length < 3}
                  style={{ ...btnPrimary, flex: 1, opacity: activeCats.length < 3 ? 0.5 : 1 }} type="button">
                  Définir le budget →
                </button>
              </div>
            </div>
          )}

          {step === 3 && subtype && (
            <div>
              <p style={{ fontSize: 13, color: "var(--dash-text-2, #b0b0cc)", margin: "0 0 16px" }}>
                Pré-rempli selon le marché pour un <strong style={{ color: "var(--dash-text, #eeeef5)" }}>{subtype.label.toLowerCase()}</strong>{city ? <> à <strong style={{ color: "var(--dash-text, #eeeef5)" }}>{city}</strong></> : null}.
              </p>

              <div style={{ background: "var(--dash-faint, rgba(255,255,255,0.04))", border: "1px solid var(--dash-border, rgba(255,255,255,0.07))", borderRadius: 16, padding: "14px 16px", marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: 10.5, color: "var(--dash-text-3, #8888aa)", fontWeight: 700, letterSpacing: 1.3, textTransform: "uppercase" }}>Budget total</span>
                  <span style={{ fontSize: 22, fontWeight: 800, backgroundImage: G, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    {budgetTotal.toLocaleString("fr-FR")} <span style={{ fontSize: 12, color: "var(--dash-text-3, #8888aa)", WebkitTextFillColor: "initial", background: "none", fontWeight: 500 }}>MAD</span>
                  </span>
                </div>
                <input type="range" min={10_000} max={500_000} step={5_000}
                  value={budgetTotal} onChange={e => setBudgetTotal(parseInt(e.target.value, 10))}
                  style={{ width: "100%", marginTop: 10, accentColor: "#E11D48" }} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 10.5, color: "var(--dash-text-3, #8888aa)", fontWeight: 700, letterSpacing: 1.3, textTransform: "uppercase" }}>Répartition par poste</span>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
                  background: over ? "rgba(245,158,11,0.12)" : "rgba(34,197,94,0.12)",
                  color: over ? "#f59e0b" : "#22c55e",
                  border: over ? "1px solid rgba(245,158,11,0.3)" : "1px solid rgba(34,197,94,0.3)",
                }}>
                  {over ? "⚠" : "✓"} {budgetSum.toLocaleString("fr-FR")} / {budgetTotal.toLocaleString("fr-FR")} MAD
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 300, overflowY: "auto", paddingRight: 4 }}>
                {Object.entries(budgetPerCat).map(([cat, amount]) => {
                  const pct = budgetTotal > 0 ? Math.round((amount / budgetTotal) * 100) : 0
                  return (
                    <div key={cat} style={{ background: "var(--dash-faint, rgba(255,255,255,0.04))", border: "1px solid var(--dash-border, rgba(255,255,255,0.07))", borderRadius: 12, padding: "10px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 600 }}>{cat}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 11, color: "var(--dash-text-3, #8888aa)", fontWeight: 600, width: 32, textAlign: "right" }}>{pct}%</span>
                          <input type="number" min={0} max={budgetTotal * 2} step={500} value={amount}
                            onChange={e => updateCatBudget(cat, parseInt(e.target.value, 10) || 0)}
                            style={{ width: 80, padding: "5px 7px", borderRadius: 7, border: "1.5px solid var(--dash-border, rgba(255,255,255,0.07))", background: "var(--dash-bg, #0d0e14)", color: "var(--dash-text, #eeeef5)", fontSize: 12, fontWeight: 700, textAlign: "right", fontFamily: "inherit" }} />
                          <span style={{ fontSize: 10, color: "var(--dash-text-3, #8888aa)" }}>MAD</span>
                        </span>
                      </div>
                      <input type="range" min={0} max={budgetTotal} step={500} value={amount}
                        onChange={e => updateCatBudget(cat, parseInt(e.target.value, 10))}
                        style={{ width: "100%", accentColor: "#E11D48" }} />
                    </div>
                  )
                })}
              </div>

              {/* Actions budget — explicites et prévisibles */}
              <div style={{ display: "grid", gridTemplateColumns: over ? "1fr 1fr" : "1fr 1fr", gap: 8, marginTop: 10 }}>
                <button onClick={resetBreakdown} type="button"
                  title="Répartit le budget selon les % recommandés pour ce type d'événement"
                  style={{ padding: "9px", background: "transparent", color: "var(--dash-text,#121317)", border: "1px solid var(--dash-border,rgba(183,191,217,0.4))", borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  ↻ Réinitialiser la répartition
                </button>
                {over ? (
                  <button onClick={alignTotalToSum} type="button"
                    title="Augmente le budget final pour couvrir la somme actuelle"
                    style={{ padding: "9px", background: G, color: "#fff", border: "none", borderRadius: 99, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                    ↑ Passer le total à {budgetSum.toLocaleString("fr-FR")} MAD
                  </button>
                ) : (
                  <button onClick={alignTotalToSum} type="button"
                    title="Aligne le total sur la somme actuelle"
                    style={{ padding: "9px", background: "rgba(225,29,72,0.08)", color: "#E11D48", border: "1px solid rgba(225,29,72,0.25)", borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                    = Total = somme ({budgetSum.toLocaleString("fr-FR")} MAD)
                  </button>
                )}
              </div>

              {/* Raccourcis incréments du total */}
              <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 10, color: "var(--dash-text-3,#8888aa)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", alignSelf: "center", marginRight: 4 }}>
                  Augmenter budget
                </span>
                {[1000, 5000, 10000, 25000].map(delta => (
                  <button key={delta} onClick={() => bumpTotal(delta)} type="button"
                    style={{ padding: "5px 10px", background: "var(--dash-faint,rgba(183,191,217,0.08))", color: "var(--dash-text,#121317)", border: "1px solid var(--dash-border,rgba(183,191,217,0.22))", borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                    +{delta.toLocaleString("fr-FR")}
                  </button>
                ))}
              </div>

              {over && (
                <p style={{ fontSize: 11, color: "#f59e0b", marginTop: 8, textAlign: "center" }}>
                  La somme des catégories dépasse le total de <strong>{(budgetSum - budgetTotal).toLocaleString("fr-FR")} MAD</strong>.
                </p>
              )}

              {error && <p style={{ fontSize: 12, color: "#ef4444", marginTop: 10, marginBottom: 0 }}>{error}</p>}

              <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                <button onClick={() => setStep(2)} style={btnSecondary} type="button">← Retour</button>
                <button onClick={handleSubmit} disabled={loading}
                  style={{ ...btnPrimary, flex: 1 }} type="button">
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
  fontSize: 11, fontWeight: 700, color: "var(--dash-text-3, #8888aa)", display: "block", marginBottom: 6,
  textTransform: "uppercase", letterSpacing: "1.2px",
}
const subtleStyle: React.CSSProperties = { color: "var(--dash-text-3, #8888aa)", fontWeight: 500, textTransform: "none", letterSpacing: 0 }

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px", borderRadius: 12, fontSize: 13.5,
  border: "1.5px solid var(--dash-border, rgba(0,0,0,0.08))", outline: "none",
  fontFamily: "inherit", color: "var(--dash-text, #121317)",
  background: "var(--dash-input-bg, #fafafa)", boxSizing: "border-box",
}

const btnPrimary: React.CSSProperties = {
  padding: "13px 22px", borderRadius: 99, border: "none",
  background: G, color: "#fff", fontSize: 14, fontWeight: 700,
  cursor: "pointer", fontFamily: "inherit", transition: "opacity 0.15s",
  boxShadow: "0 6px 18px rgba(225,29,72,0.3)",
}

const btnSecondary: React.CSSProperties = {
  padding: "13px 22px", borderRadius: 99,
  border: "1.5px solid var(--dash-border, rgba(255,255,255,0.07))",
  background: "var(--dash-faint, rgba(255,255,255,0.04))", color: "var(--dash-text-2, #b0b0cc)",
  fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
}
