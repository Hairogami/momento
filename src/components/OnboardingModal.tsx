"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { X, Calendar, Users, Wallet } from "lucide-react"
import { C } from "@/lib/colors"

const STORAGE_KEY = "momento:onboarding_seen"

const STEPS = [
  {
    icon: <Calendar size={22} />,
    title: "Créez votre événement",
    desc: "Donnez un nom, une date, et un budget à votre événement.",
  },
  {
    icon: <Users size={22} />,
    title: "Gérez vos invités",
    desc: "Importez votre liste, suivez les RSVP en temps réel.",
  },
  {
    icon: <Wallet size={22} />,
    title: "Pilotez votre budget",
    desc: "Ajoutez vos dépenses et gardez le contrôle à tout moment.",
  },
]

export default function OnboardingModal({ show }: { show: boolean }) {
  const router = useRouter()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!show) return
    const seen = localStorage.getItem(STORAGE_KEY)
    if (!seen) setVisible(true)
  }, [show])

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1")
    setVisible(false)
  }

  function start() {
    dismiss()
    router.push("/dashboard")
  }

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={dismiss}
    >
      <div
        className="relative w-full max-w-md rounded-2xl p-8"
        style={{
          backgroundColor: "var(--bg-card)",
          border: `1px solid var(--border)`,
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={dismiss}
          aria-label="Fermer"
          className="absolute top-4 right-4 p-1.5 rounded-lg transition-opacity hover:opacity-70"
          style={{ color: C.mist }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase mb-3" style={{ color: C.terra }}>
            ✦ Bienvenue sur Momento ✦
          </p>
          <h2 className="text-xl font-semibold" style={{ color: C.white }}>
            Organisez votre événement en 3 étapes
          </h2>
        </div>

        {/* Steps */}
        <div className="space-y-4 mb-8">
          {STEPS.map((step, i) => (
            <div key={i} className="flex items-start gap-4">
              <div
                className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `rgba(var(--momento-terra-rgb), 0.15)`, color: C.terra }}
              >
                {step.icon}
              </div>
              <div>
                <p className="text-sm font-semibold mb-0.5" style={{ color: C.white }}>{step.title}</p>
                <p className="text-xs" style={{ color: C.mist }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={start}
          className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: C.terra, color: "var(--momento-ink)" }}
        >
          Créer mon premier événement
        </button>

        <button
          onClick={dismiss}
          className="w-full mt-3 py-2 text-xs transition-opacity hover:opacity-70"
          style={{ color: C.mist }}
        >
          Explorer d&apos;abord
        </button>
      </div>
    </div>
  )
}
