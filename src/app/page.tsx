"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { ArrowRight, Menu, X, Calendar, Users, Zap, Star, MapPin } from "lucide-react"
import NavAuthButtons from "@/components/NavAuthButtons"
import AirbnbSearchBar from "@/components/AirbnbSearchBar"
import { VENDOR_COUNT } from "@/lib/vendorData"

const C = {
  ink:       "#F5EDD6",
  dark:      "#EDE4CC",
  anthracite:"#DDD4BC",
  steel:     "#9A907A",
  mist:      "#6A5F4A",
  silver:    "#3A2E1E",
  white:     "#1A1208",
  accent:    "#2C1A0E",
  terra:     "#C4532A",
}

const EVENTS = ["Mariage", "Anniversaire", "Fiançailles", "Baby shower", "Soutenance", "Cérémonie", "Fête privée", "Corporate"]

const EVENT_COLORS: Record<string, string> = {
  "Mariage":      "#FF3C6F",
  "Anniversaire": "#FF8C00",
  "Fiançailles":  "#F59E0B",
  "Baby shower":  "#F472B6",
  "Soutenance":   "#10B981",
  "Cérémonie":    "#7C3AED",
  "Fête privée":  "#A855F7",
  "Corporate":    "#0EA5E9",
}

const CATEGORIES = [
  { icon: "🎵", label: "Musique & DJ",          href: "/explore?category=Musique+%26+DJ" },
  { icon: "🍽️", label: "Traiteur",              href: "/explore?category=Traiteur" },
  { icon: "🎂", label: "Pâtissier",             href: "/explore?category=Traiteur" },
  { icon: "📸", label: "Photo & Vidéo",         href: "/explore?category=Photo+%26+Vid%C3%A9o" },
  { icon: "🏛️", label: "Lieu",                 href: "/explore?category=Lieu" },
  { icon: "✨", label: "Décor & Lumières",     href: "/explore?category=D%C3%A9cor+%26+Lumi%C3%A8res" },
  { icon: "💄", label: "Beauté",               href: "/explore?category=Beaut%C3%A9" },
  { icon: "📋", label: "Planification",        href: "/explore?category=Planification" },
  { icon: "🎪", label: "Animation",            href: "/explore?category=Animation" },
  { icon: "🚗", label: "Transport",            href: "/explore?category=Transport" },
  { icon: "🛡️", label: "Sécurité",            href: "/explore?category=S%C3%A9curit%C3%A9" },
  { icon: "🎁", label: "Cadeaux & Faire-part", href: "/explore?category=Cadeaux+%26+Papeterie" },
]

const STEPS = [
  { n: "01", icon: <Calendar size={18} />, t: "Créez votre événement", d: "Type, date, lieu et budget. 30 secondes chrono." },
  { n: "02", icon: <Users size={18} />,    t: "Parcourez les prestataires", d: `${VENDOR_COUNT} pros filtrés par ville, catégorie et budget.` },
  { n: "03", icon: <Zap size={18} />,      t: "Réservez directement", d: "Envoyez une demande, confirmez. C'est tout." },
]

const TOP_VENDORS = [
  { id: "prestige-photo",    name: "Prestige Photo",      cat: "Photographe",       city: "Rabat",      rating: 5.0 },
  { id: "afrah-darna-prestige", name: "Afrah Darna Prestige", cat: "Traiteur",       city: "Marrakech",  rating: 4.0 },
  { id: "la-perle-events",   name: "La Perle Events",     cat: "Event Planner",     city: "Marrakech",  rating: 4.0 },
  { id: "dj-azz",            name: "DJ AZZ",              cat: "DJ",                city: "Marrakech",  rating: 4.0 },
]

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [eventIdx, setEventIdx] = useState(0)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", fn)
    return () => window.removeEventListener("scroll", fn)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setEventIdx(i => (i + 1) % EVENTS.length), 2000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: C.ink, color: C.white }}>

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={scrolled ? {
          backgroundColor: `${C.ink}F2`,
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${C.anthracite}`,
        } : {}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">

          <Link href="/" className="font-bold tracking-[0.22em] uppercase text-base sm:text-lg" style={{ color: C.white }}>
            Momento
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: C.mist }}>
            <a href="#explore" className="hover:opacity-80 transition-opacity">Explorer</a>
            <a href="#how"     className="hover:opacity-80 transition-opacity">Comment ça marche</a>
            <Link href="/prestataires" className="hover:opacity-80 transition-opacity">Prestataires</Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <NavAuthButtons />
          </div>

          {/* Mobile burger */}
          <button className="md:hidden p-2 rounded-lg" onClick={() => setMenuOpen(o => !o)}
            style={{ color: C.white }}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden px-4 pb-4 pt-2 flex flex-col gap-3"
            style={{ backgroundColor: C.dark, borderTop: `1px solid ${C.anthracite}` }}>
            <a href="#explore" className="text-sm font-medium py-2" style={{ color: C.mist }} onClick={() => setMenuOpen(false)}>Explorer</a>
            <a href="#how"     className="text-sm font-medium py-2" style={{ color: C.mist }} onClick={() => setMenuOpen(false)}>Comment ça marche</a>
            <Link href="/prestataires" className="text-sm font-medium py-2" style={{ color: C.mist }} onClick={() => setMenuOpen(false)}>Prestataires</Link>
            <NavAuthButtons mobile />
          </div>
        )}
      </nav>

      {/* ── HERO — typographic, rotating event type ── */}
      <section className="pt-32 pb-20 sm:pt-40 sm:pb-28 px-4 sm:px-6 text-center" style={{ backgroundColor: C.ink }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase mb-6" style={{ color: C.terra }}>
            La plateforme événementielle du Maroc
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6" style={{ color: C.white }}>
            Chaque{" "}
            <span style={{ color: EVENT_COLORS[EVENTS[eventIdx]], transition: "color 0.4s ease" }}>
              {EVENTS[eventIdx]}
            </span>
            {" "}est un{" "}
            <span className="italic font-normal" style={{ color: C.silver }}>moment.</span>
          </h1>
          <p className="text-base sm:text-lg mb-8 max-w-xl mx-auto leading-relaxed" style={{ color: C.mist }}>
            Trouvez et réservez les meilleurs prestataires au Maroc — en quelques clics.
          </p>
          <AirbnbSearchBar />
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <Link href="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center gap-2 font-bold text-sm px-8 py-4 rounded-2xl transition-all hover:opacity-90 hover:-translate-y-0.5"
              style={{ backgroundColor: C.terra, color: "#fff", boxShadow: "0 8px 32px rgba(196,83,42,0.25)" }}>
              Créer mon événement <ArrowRight size={15} />
            </Link>
            <Link href="/explore"
              className="w-full sm:w-auto flex items-center justify-center gap-2 font-bold text-sm px-8 py-4 rounded-2xl transition-all hover:opacity-80"
              style={{ backgroundColor: C.anthracite, color: C.white }}>
              Explorer les prestataires
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="flex items-center justify-center gap-8 sm:gap-16 py-5 border-b"
        style={{ backgroundColor: C.dark, borderColor: C.anthracite }}>
        {[
          { n: String(VENDOR_COUNT), l: "Prestataires" },
          { n: "41+", l: "Villes" },
          { n: "31",  l: "Catégories" },
        ].map(s => (
          <div key={s.l} className="text-center">
            <div className="text-lg sm:text-xl font-bold" style={{ color: C.white }}>{s.n}</div>
            <div className="text-xs" style={{ color: C.mist }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* ── CATÉGORIES ── */}
      <section id="explore" className="py-16 sm:py-24 px-4 sm:px-6" style={{ backgroundColor: C.dark }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: C.terra }}>
              Parcourir par catégorie
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: C.white }}>
              Chaque prestataire dont vous avez besoin
            </h2>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-6 gap-2 sm:gap-3">
            {CATEGORIES.map(c => (
              <Link href={c.href} key={c.label}
                className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl transition-all hover:-translate-y-0.5 text-center"
                style={{ backgroundColor: C.anthracite, border: `1px solid ${C.steel}` }}>
                <span className="text-2xl sm:text-3xl">{c.icon}</span>
                <span className="text-xs font-medium leading-tight" style={{ color: C.silver }}>{c.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOP VENDORS ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6" style={{ backgroundColor: C.ink }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8 sm:mb-10">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: C.terra }}>
                Les meilleurs
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: C.white }}>
                Prestataires de la semaine
              </h2>
            </div>
            <Link href="/explore" className="text-sm font-semibold hidden sm:flex items-center gap-1" style={{ color: C.terra }}>
              Voir tout <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {TOP_VENDORS.map(v => (
              <Link href={`/vendor/${v.id}`} key={v.id}
                className="rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5 block"
                style={{ backgroundColor: C.dark, border: `1px solid ${C.anthracite}` }}>
                <div className="h-24 sm:h-32 flex items-center justify-center text-3xl sm:text-4xl"
                  style={{ backgroundColor: C.anthracite }}>
                  {v.cat === "Photographe" ? "📸" : v.cat === "Traiteur" ? "🍽️" : v.cat === "Event Planner" ? "📋" : "🎧"}
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="font-bold text-xs sm:text-sm truncate mb-0.5" style={{ color: C.white }}>{v.name}</h3>
                  <p className="text-xs mb-2" style={{ color: C.terra }}>{v.cat}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs flex items-center gap-0.5" style={{ color: C.mist }}>
                      <MapPin size={9} /> {v.city}
                    </span>
                    <span className="text-xs font-bold flex items-center gap-0.5" style={{ color: C.white }}>
                      <Star size={10} fill={C.terra} style={{ color: C.terra }} /> {v.rating}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-5 text-center sm:hidden">
            <Link href="/explore" className="text-sm font-semibold" style={{ color: C.terra }}>
              Voir tous les prestataires →
            </Link>
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section id="how" className="py-16 sm:py-24 px-4 sm:px-6" style={{ backgroundColor: C.dark }}>
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: C.terra }}>Simple</p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-10 sm:mb-14" style={{ color: C.white }}>
            De l&apos;idée à l&apos;événement en 3 étapes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-left">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative p-5 sm:p-6 rounded-2xl"
                style={{ backgroundColor: C.anthracite, border: `1px solid ${C.steel}` }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${C.terra}20`, color: C.terra }}>
                    {s.icon}
                  </div>
                  <span className="text-xs font-bold font-mono opacity-50" style={{ color: C.terra }}>{s.n}</span>
                </div>
                <h3 className="font-bold text-sm sm:text-base mb-2" style={{ color: C.white }}>{s.t}</h3>
                <p className="text-sm leading-relaxed" style={{ color: C.mist }}>{s.d}</p>
                {i < STEPS.length - 1 && (
                  <div className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full items-center justify-center"
                    style={{ backgroundColor: C.steel }}>
                    <ArrowRight size={12} style={{ color: C.ink }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRESTATAIRES BANNER ── */}
      <section className="py-12 sm:py-16 px-4 sm:px-6" style={{ backgroundColor: C.ink }}>
        <div className="max-w-7xl mx-auto">
          <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6"
            style={{ backgroundColor: C.dark, border: `1px solid ${C.anthracite}` }}>
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: C.terra }}>
                Vous êtes prestataire ?
              </p>
              <h3 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: C.white }}>
                Rejoignez {VENDOR_COUNT} professionnels référencés
              </h3>
              <p className="text-sm" style={{ color: C.mist }}>
                Publiez votre profil gratuitement et recevez des demandes qualifiées.
              </p>
            </div>
            <Link href="/prestataires"
              className="flex-shrink-0 flex items-center gap-2 font-bold text-sm px-6 py-3.5 rounded-2xl transition-all hover:opacity-90 whitespace-nowrap"
              style={{ backgroundColor: C.terra, color: "#fff" }}>
              Créer mon profil <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 text-center" style={{ backgroundColor: C.dark }}>
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: C.terra }}>
            Prêt à commencer ?
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight" style={{ color: C.white }}>
            Votre prochain événement<br />
            <span className="font-normal italic" style={{ color: C.mist }}>commence ici.</span>
          </h2>
          <p className="text-base sm:text-lg mb-8 sm:mb-10" style={{ color: C.mist }}>
            Des milliers d&apos;organisateurs au Maroc font confiance à Momento.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center gap-2 font-bold text-base px-8 py-4 rounded-2xl transition-all hover:opacity-90 hover:-translate-y-0.5"
              style={{ backgroundColor: C.terra, color: "#fff", boxShadow: "0 8px 32px rgba(196,83,42,0.25)" }}>
              Créer mon événement <ArrowRight size={17} />
            </Link>
            <Link href="/explore"
              className="w-full sm:w-auto flex items-center justify-center gap-2 font-bold text-base px-8 py-4 rounded-2xl transition-all hover:opacity-80"
              style={{ backgroundColor: C.anthracite, color: C.white }}>
              Explorer les prestataires
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-4 sm:px-6 py-8 border-t" style={{ borderColor: C.anthracite, backgroundColor: C.ink }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm font-bold tracking-[0.2em] uppercase" style={{ color: C.silver }}>Momento</span>
          <p className="text-xs" style={{ color: C.steel }}>© 2026 Momento · Maroc · Tous droits réservés.</p>
          <div className="flex gap-5 text-xs" style={{ color: C.steel }}>
            <a href="#" className="hover:opacity-80 transition-opacity">Confidentialité</a>
            <a href="#" className="hover:opacity-80 transition-opacity">Conditions</a>
            <Link href="/prestataire" className="hover:opacity-80 transition-opacity">Espace prestataire</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
