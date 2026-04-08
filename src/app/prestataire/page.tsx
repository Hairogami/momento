import Link from "next/link"
import { DarkModeToggle } from "@/components/DarkModeToggle"
import Footer from "@/components/Footer"
import { C } from "@/lib/colors"
import { MomentoLogo } from "@/components/MomentoLogo"

const STATS = [
  { n: "2 400+", l: "Prestataires" },
  { n: "18 500", l: "Clients" },
  { n: "340",    l: "Villes couvertes" },
  { n: "4.8★",   l: "Satisfaction" },
]

const BENEFITS = [
  {
    icon: "👁",
    title: "Visibilité",
    desc: "Soyez trouvé par 18 500 couples et organisateurs chaque mois grâce à notre annuaire optimisé.",
  },
  {
    icon: "📩",
    title: "Réservations",
    desc: "Recevez des demandes directes et qualifiées, sans commission cachée ni intermédiaire.",
  },
  {
    icon: "📊",
    title: "Gestion",
    desc: "Dashboard complet : agenda, messagerie, statistiques en temps réel pour piloter votre activité.",
  },
]

const STEPS = [
  { n: "01", title: "Créez votre profil", desc: "Renseignez vos informations, tarifs et galerie photos en quelques minutes." },
  { n: "02", title: "Recevez des demandes", desc: "Les clients intéressés vous contactent directement via la messagerie intégrée." },
  { n: "03", title: "Développez votre activité", desc: "Gérez vos réservations, suivez vos stats et bâtissez votre réputation." },
]

const TESTIMONIALS = [
  {
    name: "Nadia Benali",
    role: "Photographe — Casablanca",
    text: "Depuis que j'ai rejoint Momento, j'ai triplé mes demandes de mariages. La plateforme est simple, professionnelle et les clients arrivent vraiment qualifiés.",
    rating: 5,
  },
  {
    name: "Youssef El Idrissi",
    role: "DJ & Animation — Marrakech",
    text: "J'apprécie de recevoir les demandes directement sans passer par une agence. Pas de frais cachés, un vrai contact direct avec les organisateurs. Top !",
    rating: 5,
  },
  {
    name: "Samira Ouazzani",
    role: "Wedding Planner — Rabat",
    text: "Le dashboard est mon allié au quotidien : je gère mon agenda, mes messages et mes avis depuis un seul endroit. Je recommande vivement à tous les prestataires.",
    rating: 5,
  },
]

export default function PrestataireLanding() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: C.ink }}>
      {/* Nav */}
      <nav
        className="border-b px-6 h-16 flex items-center justify-between sticky top-0 z-10"
        style={{ borderColor: C.anthracite, backgroundColor: C.ink }}
      >
        <MomentoLogo iconSize={28} />
        <div className="flex items-center gap-4">
          <DarkModeToggle />
          <Link href="/login" className="text-sm font-medium" style={{ color: C.mist }}>
            Connexion
          </Link>
          <Link
            href="/prestataire/claim"
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: C.terra, color: "#fff" }}
          >
            Rejoindre
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
        <p
          className="text-xs font-semibold tracking-widest uppercase mb-4"
          style={{ color: C.terra }}
        >
          Espace Prestataire
        </p>
        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
          style={{ fontFamily: "Cormorant, Georgia, serif", color: C.white }}
        >
          Rejoignez la plateforme&nbsp;#1 des prestataires événementiels au Maroc
        </h1>
        <p className="text-lg max-w-2xl mx-auto mb-10" style={{ color: C.mist }}>
          Visibilité, réservations directes, dashboard professionnel — tout ce dont vous avez besoin pour développer votre activité.
        </p>
        <Link
          href="/prestataire/claim"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base transition-all hover:opacity-90"
          style={{ backgroundColor: C.terra, color: "#fff" }}
        >
          Rejoindre maintenant →
        </Link>
      </section>

      {/* ── STATS BAR ── */}
      <section
        className="border-y py-8"
        style={{ borderColor: C.anthracite, backgroundColor: C.dark }}
      >
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {STATS.map((s) => (
            <div key={s.l}>
              <p className="text-3xl font-bold" style={{ color: C.terra, fontFamily: "Cormorant, Georgia, serif" }}>
                {s.n}
              </p>
              <p className="text-sm mt-1" style={{ color: C.mist }}>
                {s.l}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
        <h2
          className="text-3xl sm:text-4xl font-bold text-center mb-3"
          style={{ fontFamily: "Cormorant, Georgia, serif", color: C.white }}
        >
          Pourquoi rejoindre Momento ?
        </h2>
        <p className="text-center text-sm mb-12" style={{ color: C.mist }}>
          Tout ce qu&apos;il faut pour développer votre activité événementielle au Maroc
        </p>
        <div className="grid sm:grid-cols-3 gap-6">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="rounded-2xl p-6"
              style={{ backgroundColor: C.dark, border: `1px solid ${C.anthracite}` }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-4"
                style={{ backgroundColor: `${C.terra}18` }}
              >
                {b.icon}
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: C.white }}>
                {b.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: C.mist }}>
                {b.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section
        className="py-20 border-y"
        style={{ borderColor: C.anthracite, backgroundColor: C.dark }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2
            className="text-3xl sm:text-4xl font-bold text-center mb-3"
            style={{ fontFamily: "Cormorant, Georgia, serif", color: C.white }}
          >
            Comment ça marche ?
          </h2>
          <p className="text-center text-sm mb-14" style={{ color: C.mist }}>
            Trois étapes simples pour démarrer
          </p>
          <div className="grid sm:grid-cols-3 gap-8">
            {STEPS.map((step) => (
              <div key={step.n} className="flex flex-col items-center text-center">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg mb-4"
                  style={{ backgroundColor: `${C.terra}18`, color: C.terra, fontFamily: "Cormorant, Georgia, serif" }}
                >
                  {step.n}
                </div>
                <h3 className="font-bold mb-2" style={{ color: C.white }}>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: C.mist }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
          {/* connector lines (desktop only) */}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
        <h2
          className="text-3xl sm:text-4xl font-bold text-center mb-3"
          style={{ fontFamily: "Cormorant, Georgia, serif", color: C.white }}
        >
          Ils nous font confiance
        </h2>
        <p className="text-center text-sm mb-12" style={{ color: C.mist }}>
          Ce que disent nos prestataires
        </p>
        <div className="grid sm:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl p-6 flex flex-col gap-4"
              style={{ backgroundColor: C.dark, border: `1px solid ${C.anthracite}` }}
            >
              <div className="flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <span key={i} style={{ color: C.terra }}>★</span>
                ))}
              </div>
              <p className="text-sm leading-relaxed flex-1" style={{ color: C.white }}>
                &ldquo;{t.text}&rdquo;
              </p>
              <div>
                <p className="font-semibold text-sm" style={{ color: C.white }}>{t.name}</p>
                <p className="text-xs" style={{ color: C.mist }}>{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section
        className="py-20 border-t"
        style={{ borderColor: C.anthracite, backgroundColor: C.dark }}
      >
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2
            className="text-3xl sm:text-4xl font-bold mb-4"
            style={{ fontFamily: "Cormorant, Georgia, serif", color: C.white }}
          >
            Prêt à développer votre activité ?
          </h2>
          <p className="text-base mb-8" style={{ color: C.mist }}>
            Rejoignez 2 400+ prestataires et commencez à recevoir des demandes qualifiées dès aujourd&apos;hui. C&apos;est gratuit pour démarrer.
          </p>
          <Link
            href="/prestataire/claim"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl font-bold text-base transition-all hover:opacity-90"
            style={{ backgroundColor: C.terra, color: "#fff" }}
          >
            Rejoindre maintenant →
          </Link>
          <p className="text-xs mt-4" style={{ color: C.mist }}>
            Déjà inscrit ?{" "}
            <Link href="/login" style={{ color: C.terra }}>
              Se connecter
            </Link>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
