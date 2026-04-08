"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import { C } from "@/lib/colors"
import { MomentoLogo } from "@/components/MomentoLogo"

const CATEGORIES = [
  { icon: "📸", label: "Photographe" },
  { icon: "🎥", label: "Vidéaste" },
  { icon: "🎵", label: "DJ" },
  { icon: "🎼", label: "Orchestre" },
  { icon: "🎤", label: "Chanteur / chanteuse" },
  { icon: "🍽️", label: "Traiteur" },
  { icon: "💐", label: "Fleuriste événementiel" },
  { icon: "🏛️", label: "Lieu de réception" },
  { icon: "💄", label: "Makeup Artist" },
  { icon: "💇", label: "Hairstylist" },
  { icon: "💍", label: "Wedding planner" },
  { icon: "🎪", label: "Event planner" },
  { icon: "🎂", label: "Pâtissier / Cake designer" },
  { icon: "🚗", label: "Location de voiture de mariage" },
  { icon: "🌸", label: "Décorateur" },
  { icon: "👘", label: "Neggafa" },
  { icon: "💌", label: "Créateur de faire-part" },
  { icon: "🎁", label: "Créateur de cadeaux invités" },
  { icon: "🎩", label: "Animateur enfants" },
  { icon: "🚌", label: "VTC / Transport invités" },
  { icon: "💡", label: "Créateur d'ambiance lumineuse" },
  { icon: "🍹", label: "Service de bar / mixologue" },
  { icon: "💆", label: "Spa / soins esthétiques" },
  { icon: "🪄", label: "Magicien" },
  { icon: "🎻", label: "Violoniste" },
  { icon: "🥁", label: "Dekka Marrakchia / Issawa" },
  { icon: "👗", label: "Robes de mariés" },
  { icon: "🔒", label: "Sécurité événementielle" },
]

export default function CategoriesPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  function toggle(label: string) {
    setSelected(s =>
      s.includes(label) ? s.filter(x => x !== label) : [...s, label]
    )
  }

  async function handleContinue() {
    setLoading(true)
    try {
      await fetch("/api/workspace", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ neededCategories: selected }),
      })
    } catch { /* continue anyway */ }
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.ink, color: C.white }}>

      {/* NAV */}
      <nav className="sticky top-0 z-40 border-b px-6 h-16 flex items-center justify-between"
        style={{ backgroundColor: `${C.ink}F5`, backdropFilter: "blur(16px)", borderColor: C.anthracite }}>
        <Link href="/event/new" className="flex items-center gap-2 text-sm font-medium" style={{ color: C.mist }}>
          <ArrowLeft size={16} />
          <MomentoLogo iconSize={28} />
        </Link>
        <div className="text-xs font-semibold tracking-widest uppercase" style={{ color: C.steel }}>
          Étape 4 / 4
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-xs px-3 py-1.5 rounded-lg transition hover:opacity-70"
          style={{ color: C.steel }}
        >
          Ignorer →
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: C.terra }}>
            Prestataires
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: C.white }}>
            De quoi avez-vous besoin ?
          </h1>
          <p className="text-base" style={{ color: C.mist }}>
            Sélectionnez les prestataires que vous souhaitez pour votre événement.
          </p>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-10">
          {CATEGORIES.map(({ icon, label }) => {
            const active = selected.includes(label)
            return (
              <button
                key={label}
                onClick={() => toggle(label)}
                className="relative flex flex-col items-center gap-2 p-4 rounded-2xl transition-all hover:-translate-y-0.5"
                style={{
                  backgroundColor: active ? "rgba(var(--momento-terra-rgb),0.15)" : C.dark,
                  border: `2px solid ${active ? "var(--momento-terra)" : C.anthracite}`,
                }}
              >
                {active && (
                  <span className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "var(--momento-terra)" }}>
                    <Check size={9} color="white" strokeWidth={3} />
                  </span>
                )}
                <span className="text-2xl">{icon}</span>
                <span className="text-xs font-medium text-center leading-tight"
                  style={{ color: active ? "var(--momento-terra)" : C.mist }}>
                  {label}
                </span>
              </button>
            )
          })}
        </div>

        {/* CTA */}
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-4 rounded-2xl font-bold text-sm"
            style={{ backgroundColor: C.dark, color: C.mist, border: `1.5px solid ${C.anthracite}` }}
          >
            Ignorer
          </button>
          <button
            onClick={handleContinue}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 font-bold text-base py-4 rounded-2xl transition-all hover:opacity-90"
            style={{
              backgroundColor: selected.length > 0 ? "var(--momento-terra)" : C.anthracite,
              color: selected.length > 0 ? "#fff" : C.steel,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {selected.length > 0
              ? `Continuer avec ${selected.length} prestataire${selected.length > 1 ? "s" : ""}`
              : "Sélectionnez des prestataires"}
            <ArrowRight size={17} />
          </button>
        </div>

      </div>
    </div>
  )
}
