import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Calendar, Users, Zap, ChevronDown } from "lucide-react"
import LandingNav from "./LandingNav"
import Footer from "@/components/Footer"
import HeroParticles from "@/components/HeroParticles"
import SnapScroll from "@/components/SnapScroll"
import AirbnbSearchBar from "@/components/AirbnbSearchBar"
import { VENDOR_COUNT } from "@/lib/vendorData"
import { C } from "@/lib/colors"

export const metadata: Metadata = {
  title: "Momento — Marketplace événementiel au Maroc",
  description: `Trouvez et réservez les meilleurs prestataires événementiels au Maroc : photographes, DJ, traiteurs, décorateurs et plus. ${VENDOR_COUNT}+ professionnels référencés.`,
  alternates: { canonical: "https://momentoevents.app" },
  openGraph: {
    title: "Momento — Marketplace événementiel au Maroc",
    description: "Trouvez, comparez et réservez les meilleurs prestataires du Maroc pour votre mariage, anniversaire ou événement d'entreprise.",
    url: "https://momentoevents.app",
    type: "website",
  },
}

const CATS = [
  { slug: "musique-son",   icon: "🎵", label: "Musique & Son",    href: "/explore?category=musique-son" },
  { slug: "gastronomie",   icon: "🍽️", label: "Gastronomie",      href: "/explore?category=gastronomie" },
  { slug: "photo-video",   icon: "📸", label: "Photo & Vidéo",    href: "/explore?category=photo-video" },
  { slug: "decor-ambiance",icon: "✨", label: "Décor & Ambiance", href: "/explore?category=decor-ambiance" },
  { slug: "beaute-style",  icon: "💄", label: "Beauté & Style",   href: "/explore?category=beaute-style" },
  { slug: "planification", icon: "📋", label: "Planification",    href: "/explore?category=planification" },
]

const STEPS = [
  { n: "01", icon: <Calendar size={18} />, t: "Fixe ta date & ton lieu",  d: "Type, date, lieu et budget. 30 secondes chrono." },
  { n: "02", icon: <Users size={18} />,    t: "Trouve tes prestataires",  d: `${VENDOR_COUNT} pros vérifiés — filtre par ville, style et budget.` },
  { n: "03", icon: <Zap size={18} />,      t: "Contacte & réserve",        d: "Envoie une demande, confirme. C'est tout." },
]

export default function Landing() {
  return (
    <div style={{ backgroundColor: C.ink, color: C.white }}>
      <LandingNav />

      <SnapScroll>

        {/* ══ SECTION 1 — HERO ══ */}
        <section
          data-snap-section=""
          className="snap-section flex flex-col items-center justify-center text-center px-4"
          style={{ backgroundColor: C.ink }}
        >
          <HeroParticles />

          <div className="relative z-10 flex flex-col items-center gap-5 max-w-4xl w-full">

            <div className="hero-anim" style={{ animationDelay: "0.05s" }}>
              <Image
                src="/logo-badge-light.png"
                alt="Momento"
                width={72} height={72}
                style={{ objectFit: "contain" }}
                priority
              />
            </div>

            <p
              className="hero-anim text-xs font-semibold tracking-widest uppercase"
              style={{ color: C.terra, letterSpacing: "0.22em", animationDelay: "0.18s" }}
            >
              N°1 des prestataires événementiels · Maroc
            </p>

            <h1
              className="hero-anim font-display font-light title-massive"
              style={{ color: C.white, animationDelay: "0.3s" }}
            >
              L&apos;événement parfait<br />
              <em style={{ fontStyle: "italic", color: C.terra }}>commence ici.</em>
            </h1>

            <p
              className="hero-anim text-sm sm:text-base max-w-md leading-relaxed"
              style={{ color: C.mist, opacity: 0.8, animationDelay: "0.44s" }}
            >
              Trouve ton photographe, ton DJ, ton traiteur au Maroc —<br className="hidden sm:block" />
              directement, sans commission, sans intermédiaire.
            </p>

            <div
              className="hero-anim flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
              style={{ animationDelay: "0.58s" }}
            >
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 text-xs font-semibold tracking-widest uppercase px-8 py-4 transition-all hover:opacity-90 hover:-translate-y-0.5"
                style={{
                  backgroundColor: C.terra,
                  color: "var(--momento-ink)",
                  letterSpacing: "0.16em",
                  boxShadow: "0 8px 32px rgba(var(--momento-terra-rgb),0.25)",
                }}
              >
                Créer mon événement <ArrowRight size={14} />
              </Link>
              <Link
                href="/explore"
                className="flex items-center justify-center gap-2 text-xs font-semibold tracking-widest uppercase px-8 py-4 transition-all hover:opacity-80"
                style={{
                  backgroundColor: C.anthracite,
                  color: C.white,
                  border: `0.5px solid ${C.steel}`,
                  letterSpacing: "0.16em",
                }}
              >
                Explorer
              </Link>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="scroll-indicator flex flex-col items-center gap-1.5" style={{ color: C.mist }}>
            <span className="text-[10px] tracking-widest uppercase" style={{ letterSpacing: "0.2em" }}>Scroll</span>
            <ChevronDown size={16} />
          </div>
        </section>

        {/* ══ SECTION 2 — EXPLORER ══ */}
        <section
          data-snap-section=""
          className="snap-section flex flex-col items-center justify-center px-4 sm:px-8"
          style={{ backgroundColor: C.dark }}
        >
          <div className="w-full max-w-3xl">

            <p
              className="anim-item text-xs font-semibold tracking-widest uppercase mb-3"
              style={{ color: C.terra, letterSpacing: "0.22em" }}
            >
              Explorer
            </p>

            <h2
              className="anim-item font-display font-light title-massive mb-6"
              style={{ color: C.white, transitionDelay: "80ms" }}
            >
              Trouve tes<br />
              <em style={{ fontStyle: "italic" }}>prestataires</em>
            </h2>

            <div className="anim-item mb-8" style={{ transitionDelay: "160ms" }}>
              <AirbnbSearchBar />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {CATS.map((cat, idx) => (
                <Link
                  key={cat.slug}
                  href={cat.href}
                  className="anim-item flex items-center gap-2.5 px-3 py-3 transition-all hover:opacity-80 group"
                  style={{
                    backgroundColor: C.anthracite,
                    border: `0.5px solid ${C.steel}`,
                    transitionDelay: `${240 + idx * 55}ms`,
                  }}
                >
                  <span className="text-base flex-shrink-0">{cat.icon}</span>
                  <span className="text-xs font-display font-light truncate" style={{ color: C.white }}>
                    {cat.label}
                  </span>
                  <ArrowRight
                    size={10}
                    className="ml-auto flex-shrink-0 opacity-0 group-hover:opacity-60 transition-opacity"
                    style={{ color: C.terra }}
                  />
                </Link>
              ))}
            </div>

          </div>
        </section>

        {/* ══ SECTION 3 — PROCESS ══ */}
        <section
          data-snap-section=""
          className="snap-section flex flex-col items-center justify-center px-4 sm:px-8"
          style={{ backgroundColor: C.ink }}
        >
          <div className="w-full max-w-5xl">

            <p
              className="anim-item text-xs font-semibold tracking-widest uppercase mb-3"
              style={{ color: C.terra, letterSpacing: "0.22em" }}
            >
              Simple
            </p>

            <h2
              className="anim-item font-display font-light title-massive mb-10"
              style={{ color: C.white, transitionDelay: "80ms" }}
            >
              3 étapes.<br />
              <em style={{ fontStyle: "italic", color: C.silver }}>C&apos;est tout.</em>
            </h2>

            <div
              className="grid grid-cols-1 sm:grid-cols-3"
              style={{ borderTop: `0.5px solid ${C.anthracite}` }}
            >
              {STEPS.map((s, i) => (
                <div
                  key={s.n}
                  className="anim-item flex flex-col gap-4 p-6 sm:p-8"
                  style={{
                    borderRight: i < STEPS.length - 1 ? `0.5px solid ${C.anthracite}` : undefined,
                    transitionDelay: `${160 + i * 120}ms`,
                  }}
                >
                  <div className="flex items-start gap-4">
                    <span
                      className="font-display text-4xl font-light leading-none"
                      style={{ color: `${C.terra}40` }}
                    >
                      {s.n}
                    </span>
                    <div
                      className="w-9 h-9 flex items-center justify-center flex-shrink-0 mt-1"
                      style={{ border: `0.5px solid ${C.terra}`, color: C.terra }}
                    >
                      {s.icon}
                    </div>
                  </div>
                  <h3 className="font-display text-xl font-light" style={{ color: C.white }}>{s.t}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: C.mist }}>{s.d}</p>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div
              className="anim-item flex items-center justify-center gap-12 sm:gap-20 py-8"
              style={{ borderTop: `0.5px solid ${C.anthracite}`, transitionDelay: "520ms" }}
            >
              {[
                { n: String(VENDOR_COUNT), l: "Prestataires" },
                { n: "41+",               l: "Villes" },
                { n: "31",                l: "Catégories" },
              ].map(s => (
                <div key={s.l} className="text-center">
                  <div className="font-display text-3xl sm:text-4xl font-light" style={{ color: C.terra }}>{s.n}</div>
                  <div
                    className="text-xs tracking-widest uppercase mt-0.5"
                    style={{ color: C.mist, letterSpacing: "0.18em", opacity: 0.7 }}
                  >
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ SECTION 4 — CTA + FOOTER ══ */}
        <section
          data-snap-section=""
          className="snap-section flex flex-col"
          style={{ backgroundColor: C.dark }}
        >
          <div
            className="flex-1 grid grid-cols-1 sm:grid-cols-2"
            style={{ borderBottom: `0.5px solid ${C.anthracite}` }}
          >
            {/* Left — clients */}
            <div
              className="flex flex-col justify-center gap-5 px-8 sm:px-14 py-16 sm:py-0"
              style={{ borderRight: `0.5px solid ${C.anthracite}` }}
            >
              <p
                className="anim-item text-xs tracking-widest uppercase"
                style={{ color: C.terra, letterSpacing: "0.22em" }}
              >
                Pour les clients
              </p>
              <h2
                className="anim-item font-display font-light leading-tight"
                style={{
                  color: C.white,
                  fontSize: "clamp(2rem, 5vw, 4.5rem)",
                  lineHeight: 1.08,
                  letterSpacing: "-0.02em",
                  transitionDelay: "80ms",
                }}
              >
                Ton prochain<br />
                événement<br />
                <em style={{ fontStyle: "italic", color: C.silver }}>commence ici.</em>
              </h2>
              <p
                className="anim-item text-sm leading-relaxed"
                style={{ color: C.mist, transitionDelay: "160ms" }}
              >
                Des milliers d&apos;organisateurs au Maroc préparent leur événement avec Momento.
              </p>
              <div
                className="anim-item flex flex-col sm:flex-row gap-3"
                style={{ transitionDelay: "240ms" }}
              >
                <Link
                  href="/dashboard"
                  className="flex items-center justify-center gap-2 text-xs font-semibold tracking-widest uppercase px-7 py-4 transition-all hover:opacity-90"
                  style={{ backgroundColor: C.terra, color: "var(--momento-ink)", letterSpacing: "0.16em" }}
                >
                  Créer mon événement <ArrowRight size={14} />
                </Link>
                <Link
                  href="/explore"
                  className="flex items-center justify-center gap-2 text-xs font-semibold tracking-widest uppercase px-7 py-4 transition-all hover:opacity-80"
                  style={{ backgroundColor: "transparent", color: C.white, border: `0.5px solid ${C.steel}`, letterSpacing: "0.16em" }}
                >
                  Explorer
                </Link>
              </div>
            </div>

            {/* Right — prestataires */}
            <div
              className="flex flex-col justify-center gap-5 px-8 sm:px-14 py-16 sm:py-0"
              style={{ backgroundColor: C.ink }}
            >
              <p
                className="anim-item text-xs tracking-widest uppercase"
                style={{ color: C.terra, letterSpacing: "0.22em", transitionDelay: "120ms" }}
              >
                Pour les prestataires
              </p>
              <h2
                className="anim-item font-display font-light leading-tight"
                style={{
                  color: C.white,
                  fontSize: "clamp(2rem, 5vw, 4.5rem)",
                  lineHeight: 1.08,
                  letterSpacing: "-0.02em",
                  transitionDelay: "200ms",
                }}
              >
                Développe<br />
                ta <em style={{ fontStyle: "italic", color: C.terra }}>clientèle</em><br />
                sur Momento.
              </h2>
              <p
                className="anim-item text-sm leading-relaxed"
                style={{ color: C.mist, transitionDelay: "280ms" }}
              >
                Publie ton profil gratuitement et reçois des demandes de clients qui te correspondent.
              </p>
              <div className="anim-item" style={{ transitionDelay: "360ms" }}>
                <Link
                  href="/prestataires"
                  className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase px-7 py-4 transition-all hover:opacity-90"
                  style={{ backgroundColor: C.white, color: C.ink, letterSpacing: "0.16em" }}
                >
                  Créer mon profil <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          <Footer />
        </section>

      </SnapScroll>
    </div>
  )
}
