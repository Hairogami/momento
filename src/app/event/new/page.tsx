"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Calendar, Users, MapPin, Wallet, Check } from "lucide-react"
import { useSessionUser } from "@/components/SessionProvider"
import { C } from "@/lib/colors"
import { MomentoLogo } from "@/components/MomentoLogo"

const EVENT_TYPES = [
  { icon: "💍", label: "Mariage",       color: "#FF3C6F" },
  { icon: "🎂", label: "Anniversaire",  color: "#FF8C00" },
  { icon: "🎓", label: "Soutenance",    color: "#10B981" },
  { icon: "👶", label: "Baby shower",   color: "#F472B6" },
  { icon: "💒", label: "Fiançailles",   color: "#F59E0B" },
  { icon: "⛪", label: "Cérémonie",     color: "#7C3AED" },
  { icon: "🎉", label: "Fête privée",   color: "#A855F7" },
  { icon: "🏢", label: "Corporate",     color: "#0EA5E9" },
]

const BUDGET_OPTIONS = [
  { label: "< 10 000 MAD",   value: "5000" },
  { label: "10 000 – 30 000", value: "20000" },
  { label: "30 000 – 60 000", value: "45000" },
  { label: "60 000 – 100 000", value: "80000" },
  { label: "> 100 000 MAD",  value: "150000" },
]

export default function NewEventPage() {
  const router = useRouter()
  const user = useSessionUser()
  const keySuffix = `_${user?.id ?? "guest"}`
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    type: "",
    name: "",
    date: "",
    guestCount: "",
    budget: "",
    location: "",
  })

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function handleSubmit() {
    // Sauvegarde l'événement en localStorage
    const event = {
      id: Date.now().toString(),
      type: form.type,
      name: form.name || `Mon ${form.type}`,
      date: form.date,
      guestCount: form.guestCount,
      budget: form.budget,
      location: form.location,
      createdAt: new Date().toISOString(),
    }
    // Ajoute aux événements existants
    const existing = JSON.parse(localStorage.getItem(`momento_events${keySuffix}`) ?? "[]")
    existing.unshift(event)
    localStorage.setItem(`momento_events${keySuffix}`, JSON.stringify(existing))
    localStorage.setItem(`momento_current_event${keySuffix}`, JSON.stringify(event))
    // Redirige vers la marketplace avec le contexte
    router.push(`/explore?event=${encodeURIComponent(form.type)}`)
  }

  const canGoStep2 = !!form.type
  const canGoStep3 = !!form.name && !!form.date

  const selectedType = EVENT_TYPES.find(t => t.label === form.type)

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.ink, color: C.white }}>

      {/* NAV */}
      <nav className="sticky top-0 z-40 border-b px-6 h-16 flex items-center justify-between"
        style={{ backgroundColor: `${C.ink}F5`, backdropFilter: "blur(16px)", borderColor: C.anthracite }}>
        <Link href="/" className="flex items-center gap-2 text-sm font-medium" style={{ color: C.mist }}>
          <ArrowLeft size={16} />
          <MomentoLogo iconSize={28} />
        </Link>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map(n => (
            <div key={n} className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={{
                  backgroundColor: step >= n ? (selectedType?.color ?? C.terra) : C.anthracite,
                  color: step >= n ? "#fff" : C.mist,
                }}>
                {step > n ? <Check size={13} /> : n}
              </div>
              {n < 3 && <div className="w-8 h-0.5 rounded" style={{ backgroundColor: step > n ? (selectedType?.color ?? C.terra) : C.anthracite }} />}
            </div>
          ))}
        </div>

        <div className="w-24" />
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* STEP 1 — Type */}
        {step === 1 && (
          <>
            <div className="text-center mb-10">
              <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: C.terra }}>Étape 1 / 3</p>
              <h1 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: C.white }}>Quel type d&apos;événement ?</h1>
              <p className="text-base" style={{ color: C.mist }}>Nous sélectionnerons les meilleurs prestataires pour vous.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
              {EVENT_TYPES.map(t => (
                <button key={t.label} onClick={() => set("type", t.label)}
                  className="flex flex-col items-center gap-3 p-5 rounded-2xl transition-all hover:-translate-y-0.5"
                  style={{
                    backgroundColor: form.type === t.label ? `${t.color}20` : C.dark,
                    border: `2px solid ${form.type === t.label ? t.color : C.anthracite}`,
                  }}>
                  <span className="text-3xl">{t.icon}</span>
                  <span className="text-xs font-semibold" style={{ color: form.type === t.label ? t.color : C.mist }}>
                    {t.label}
                  </span>
                </button>
              ))}
            </div>

            <button onClick={() => canGoStep2 && setStep(2)} disabled={!canGoStep2}
              className="w-full flex items-center justify-center gap-2 font-bold text-base py-4 rounded-2xl transition-all"
              style={{
                backgroundColor: canGoStep2 ? (selectedType?.color ?? C.terra) : C.anthracite,
                color: canGoStep2 ? "#fff" : C.steel,
                cursor: canGoStep2 ? "pointer" : "not-allowed",
              }}>
              Continuer <ArrowRight size={17} />
            </button>
          </>
        )}

        {/* STEP 2 — Détails */}
        {step === 2 && (
          <>
            <div className="text-center mb-10">
              <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: selectedType?.color ?? C.terra }}>
                {selectedType?.icon} {form.type} · Étape 2 / 3
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: C.white }}>Les détails</h1>
              <p className="text-base" style={{ color: C.mist }}>Plus d&apos;infos = meilleures recommandations.</p>
            </div>

            <div className="flex flex-col gap-5 mb-10">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: C.silver }}>Nom de l&apos;événement *</label>
                <input type="text" placeholder={`Ex : Mariage Yasmine & Karim`} value={form.name}
                  onChange={e => set("name", e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl text-sm outline-none"
                  style={{ backgroundColor: C.dark, border: `1.5px solid ${form.name ? (selectedType?.color ?? C.terra) : C.anthracite}`, color: C.white }} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: C.silver }}>
                  <Calendar size={14} className="inline mr-1.5" />Date de l&apos;événement *
                </label>
                <input type="date" value={form.date} onChange={e => set("date", e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl text-sm outline-none"
                  style={{ backgroundColor: C.dark, border: `1.5px solid ${form.date ? (selectedType?.color ?? C.terra) : C.anthracite}`, color: C.white, colorScheme: "light" }} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: C.silver }}>
                    <Users size={14} className="inline mr-1.5" />Invités
                  </label>
                  <input type="number" placeholder="150" value={form.guestCount}
                    onChange={e => set("guestCount", e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl text-sm outline-none"
                    style={{ backgroundColor: C.dark, border: `1.5px solid ${C.anthracite}`, color: C.white }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: C.silver }}>
                    <MapPin size={14} className="inline mr-1.5" />Ville
                  </label>
                  <input type="text" placeholder="Casablanca" value={form.location}
                    onChange={e => set("location", e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl text-sm outline-none"
                    style={{ backgroundColor: C.dark, border: `1.5px solid ${C.anthracite}`, color: C.white }} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: C.silver }}>
                  <Wallet size={14} className="inline mr-1.5" />Budget estimé
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BUDGET_OPTIONS.map(b => (
                    <button key={b.value} onClick={() => set("budget", b.value)}
                      className="px-3 py-2.5 rounded-xl text-xs font-medium transition-all"
                      style={{
                        backgroundColor: form.budget === b.value ? (selectedType?.color ?? C.terra) : C.dark,
                        color: form.budget === b.value ? "#fff" : C.mist,
                        border: `1.5px solid ${form.budget === b.value ? (selectedType?.color ?? C.terra) : C.anthracite}`,
                      }}>
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)}
                className="px-6 py-4 rounded-2xl font-bold text-sm"
                style={{ backgroundColor: C.dark, color: C.white, border: `1.5px solid ${C.anthracite}` }}>
                ← Retour
              </button>
              <button onClick={() => canGoStep3 && setStep(3)} disabled={!canGoStep3}
                className="flex-1 flex items-center justify-center gap-2 font-bold text-base py-4 rounded-2xl transition-all"
                style={{
                  backgroundColor: canGoStep3 ? (selectedType?.color ?? C.terra) : C.anthracite,
                  color: canGoStep3 ? "#fff" : C.steel,
                  cursor: canGoStep3 ? "pointer" : "not-allowed",
                }}>
                Continuer <ArrowRight size={17} />
              </button>
            </div>
          </>
        )}

        {/* STEP 3 — Récap */}
        {step === 3 && (
          <>
            <div className="text-center mb-10">
              <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: selectedType?.color ?? C.terra }}>
                {selectedType?.icon} Étape 3 / 3
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: C.white }}>Tout est correct ?</h1>
              <p className="text-base" style={{ color: C.mist }}>On vous trouve les meilleurs prestataires juste après.</p>
            </div>

            <div className="rounded-2xl p-6 mb-8" style={{ backgroundColor: C.dark, border: `2px solid ${selectedType?.color ?? C.terra}30` }}>
              {[
                { label: "Type",    value: `${selectedType?.icon} ${form.type}` },
                { label: "Nom",     value: form.name },
                { label: "Date",    value: form.date ? new Date(form.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "—" },
                { label: "Invités", value: form.guestCount ? `${form.guestCount} personnes` : "Non précisé" },
                { label: "Ville",   value: form.location || "Non précisée" },
                { label: "Budget",  value: form.budget ? `${parseInt(form.budget).toLocaleString("fr-FR")} MAD` : "Non précisé" },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: C.anthracite }}>
                  <span className="text-sm" style={{ color: C.mist }}>{row.label}</span>
                  <span className="text-sm font-semibold" style={{ color: C.white }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* CTA principal */}
            <div className="rounded-2xl p-5 mb-4" style={{ backgroundColor: `${selectedType?.color ?? C.terra}12`, border: `1px solid ${selectedType?.color ?? C.terra}30` }}>
              <p className="text-sm font-medium mb-1" style={{ color: selectedType?.color ?? C.terra }}>
                🎯 Prochaine étape
              </p>
              <p className="text-xs" style={{ color: C.mist }}>
                Nous allons vous montrer les prestataires recommandés pour votre {form.type.toLowerCase()} à {form.location || "Maroc"}.
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)}
                className="px-6 py-4 rounded-2xl font-bold text-sm"
                style={{ backgroundColor: C.dark, color: C.white, border: `1.5px solid ${C.anthracite}` }}>
                ← Modifier
              </button>
              <button onClick={handleSubmit}
                className="flex-1 flex items-center justify-center gap-2 font-bold text-base py-4 rounded-2xl transition-all hover:opacity-90"
                style={{ backgroundColor: selectedType?.color ?? C.terra, color: "#fff" }}>
                Trouver mes prestataires <ArrowRight size={17} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
