"use client"

import Link from "next/link"
import { ArrowLeft, ArrowRight, Check, Star, TrendingUp, Shield, Clock } from "lucide-react"
import { MomentoLogo } from "@/components/MomentoLogo"
import { DarkModeToggle } from "@/components/DarkModeToggle"
import { C } from "@/lib/colors"

const BENEFITS = [
  { icon: <TrendingUp size={22} />, title: "Plus de visibilité", desc: "Votre profil vu par des milliers d'organisateurs d'événements au Maroc." },
  { icon: <Shield size={22} />, title: "Badge vérifié", desc: "Un badge de confiance qui rassure vos clients et vous distingue de la concurrence." },
  { icon: <Star size={22} />, title: "Avis clients", desc: "Collectez des avis authentiques et construisez votre réputation en ligne." },
  { icon: <Clock size={22} />, title: "Gestion simplifiée", desc: "Gérez vos demandes, disponibilités et bookings depuis un seul tableau de bord." },
]

const PLANS = [
  {
    name: "Standard",
    price: "Gratuit",
    features: ["Profil public visible", "Jusqu'à 5 photos", "Recevoir des demandes", "Support email"],
    cta: "Créer mon profil",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "299 MAD / mois",
    features: ["Tout Standard +", "Photos illimitées", "Badge Pro vérifié", "Mise en avant dans les résultats", "Statistiques détaillées", "Support prioritaire"],
    cta: "Démarrer Pro",
    highlighted: true,
  },
]

export default function PrestatairesPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: C.ink, color: C.white }}>

      {/* NAV */}
      <nav className="sticky top-0 z-40 border-b px-6 h-16 flex items-center justify-between"
        style={{ backgroundColor: `${C.ink}F5`, backdropFilter: "blur(16px)", borderColor: C.anthracite }}>
        <div className="flex items-center gap-2">
          <Link href="/" style={{ color: C.mist }}><ArrowLeft size={16} /></Link>
          <MomentoLogo iconSize={28} />
        </div>
        <div className="flex items-center gap-3">
          <DarkModeToggle />
          <Link href="/prestataire" className="text-sm font-medium px-4 py-2 transition-opacity hover:opacity-70" style={{ color: C.mist }}>
            Déjà inscrit →
          </Link>
          <Link href="/prestataire"
            className="text-sm font-bold px-5 py-2.5 rounded-xl transition-all hover:opacity-90"
            style={{ backgroundColor: C.terra, color: "#fff" }}>
            Rejoindre
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="py-24 px-6 text-center" style={{ backgroundColor: C.ink }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: C.terra }}>Pour les prestataires</p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6" style={{ color: C.white }}>
            Développez votre activité<br />
            <span className="font-display italic font-normal" style={{ color: C.accent }}>avec Momento.</span>
          </h1>
          <p className="text-lg mb-10 max-w-xl mx-auto leading-relaxed" style={{ color: C.mist }}>
            Rejoignez la plateforme de référence pour les prestataires événementiels au Maroc.
            Des clients qualifiés, directement dans votre tableau de bord.
          </p>
          <Link href="/prestataire"
            className="inline-flex items-center gap-2 font-bold text-base px-10 py-4 rounded-2xl transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{ backgroundColor: C.terra, color: "#fff", boxShadow: "0 8px 40px rgba(196,83,42,0.25)" }}>
            Créer mon profil prestataire <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="py-20 px-6" style={{ backgroundColor: C.dark }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-14" style={{ color: C.white }}>Pourquoi rejoindre Momento ?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BENEFITS.map(b => (
              <div key={b.title} className="p-6 rounded-2xl flex gap-4" style={{ backgroundColor: C.anthracite, border: `1px solid ${C.steel}` }}>
                <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${C.terra}20`, color: C.terra }}>
                  {b.icon}
                </div>
                <div>
                  <h3 className="font-bold text-base mb-1" style={{ color: C.white }}>{b.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: C.mist }}>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-20 px-6" style={{ backgroundColor: C.ink }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4" style={{ color: C.white }}>Tarifs simples et transparents</h2>
          <p className="text-center text-base mb-14" style={{ color: C.mist }}>Commencez gratuitement. Passez Pro quand vous êtes prêt.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {PLANS.map(plan => (
              <div key={plan.name} className="p-8 rounded-2xl flex flex-col"
                style={{
                  backgroundColor: plan.highlighted ? C.accent : C.dark,
                  border: `2px solid ${plan.highlighted ? C.terra : C.anthracite}`,
                }}>
                <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: plan.highlighted ? C.anthracite : C.mist }}>
                  {plan.name}
                </p>
                <p className="text-3xl font-bold mb-6" style={{ color: plan.highlighted ? C.ink : C.white }}>
                  {plan.price}
                </p>
                <ul className="flex flex-col gap-3 mb-8 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm" style={{ color: plan.highlighted ? C.dark : C.mist }}>
                      <Check size={15} style={{ color: plan.highlighted ? C.ink : C.terra, flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/prestataire"
                  className="w-full text-center font-bold py-3.5 rounded-xl transition-all hover:opacity-90"
                  style={{
                    backgroundColor: plan.highlighted ? C.terra : C.anthracite,
                    color: plan.highlighted ? "#fff" : C.white,
                  }}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 py-10 border-t" style={{ borderColor: C.anthracite }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm font-bold tracking-[0.2em] uppercase" style={{ color: C.silver }}>Momento</span>
          <p className="text-xs" style={{ color: C.steel }}>© 2026 Momento. Tous droits réservés.</p>
          <Link href="/" className="text-xs hover:opacity-70 transition-opacity" style={{ color: C.steel }}>← Retour à l'accueil</Link>
        </div>
      </footer>
    </div>
  )
}
