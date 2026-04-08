"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { ArrowRight, Menu, X, Calendar, Users, Zap, Star, MapPin } from "lucide-react"
import NavAuthButtons from "@/components/NavAuthButtons"
import AirbnbSearchBar from "@/components/AirbnbSearchBar"
import { DarkModeToggle } from "@/components/DarkModeToggle"
import HeroOrbs from "@/components/HeroOrbs"
import Footer from "@/components/Footer"
import { VENDOR_COUNT } from "@/lib/vendorData"
import { C } from "@/lib/colors"
import { MomentoLogo } from "@/components/MomentoLogo"

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

// Major categories with sub-categories for the homepage carousel
const MAJOR_CATS_HOME = [
  {
    slug: "musique-son",
    icon: "🎵",
    label: "Musique & Son",
    img: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&h=400&fit=crop&q=75",
    href: "/explore?category=musique-son",
    sub: [
      { icon: "🎧", label: "DJ",                           href: "/explore?sub=DJ" },
      { icon: "🎤", label: "Chanteur / chanteuse",         href: "/explore?sub=Chanteur+%2F+chanteuse" },
      { icon: "🎺", label: "Orchestre",                    href: "/explore?sub=Orchestre" },
      { icon: "🎻", label: "Violoniste",                   href: "/explore?sub=Violoniste" },
      { icon: "🥁", label: "Dekka / Issawa",               href: "/explore?sub=Dekka+Marrakchia+%2F+Issawa" },
    ],
  },
  {
    slug: "gastronomie",
    icon: "🍽️",
    label: "Gastronomie",
    img: "https://images.unsplash.com/photo-1555244162-803834f70033?w=600&h=400&fit=crop&q=75",
    href: "/explore?category=gastronomie",
    sub: [
      { icon: "🍽️", label: "Traiteur",                    href: "/explore?sub=Traiteur" },
      { icon: "🎂", label: "Pâtissier / Cake designer",   href: "/explore?sub=P%C3%A2tissier+%2F+Cake+designer" },
      { icon: "🍹", label: "Bar / mixologue",             href: "/explore?sub=Service+de+bar+%2F+mixologue" },
    ],
  },
  {
    slug: "photo-video",
    icon: "📸",
    label: "Photo & Vidéo",
    img: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&h=400&fit=crop&q=75",
    href: "/explore?category=photo-video",
    sub: [
      { icon: "📸", label: "Photographe",                 href: "/explore?sub=Photographe" },
      { icon: "🎬", label: "Vidéaste",                    href: "/explore?sub=Vid%C3%A9aste" },
    ],
  },
  {
    slug: "decor-ambiance",
    icon: "✨",
    label: "Décor & Ambiance",
    img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&h=400&fit=crop&q=75",
    href: "/explore?category=decor-ambiance",
    sub: [
      { icon: "✨", label: "Décorateur",                  href: "/explore?sub=D%C3%A9corateur" },
      { icon: "💐", label: "Fleuriste événementiel",      href: "/explore?sub=Fleuriste+%C3%A9v%C3%A9nementiel" },
      { icon: "💡", label: "Ambiance lumineuse",          href: "/explore?sub=Cr%C3%A9ateur+d%27ambiance+lumineuse" },
    ],
  },
  {
    slug: "beaute-style",
    icon: "💄",
    label: "Beauté & Style",
    img: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&h=400&fit=crop&q=75",
    href: "/explore?category=beaute-style",
    sub: [
      { icon: "💇", label: "Hairstylist",                 href: "/explore?sub=Hairstylist" },
      { icon: "💄", label: "Makeup Artist",               href: "/explore?sub=Makeup+Artist" },
      { icon: "👑", label: "Neggafa",                     href: "/explore?sub=Neggafa" },
      { icon: "👗", label: "Robes de mariés",             href: "/explore?sub=Robes+de+mari%C3%A9s" },
      { icon: "🧖", label: "Spa / soins esthétiques",     href: "/explore?sub=Spa+%2F+soins+esth%C3%A9tiques" },
    ],
  },
  {
    slug: "planification",
    icon: "📋",
    label: "Planification",
    img: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&h=400&fit=crop&q=75",
    href: "/explore?category=planification",
    sub: [
      { icon: "📋", label: "Event planner",               href: "/explore?sub=Event+planner" },
      { icon: "💍", label: "Wedding planner",             href: "/explore?sub=Wedding+planner" },
    ],
  },
]

const STEPS = [
  { n: "01", icon: <Calendar size={18} />, t: "Créez votre événement", d: "Type, date, lieu et budget. 30 secondes chrono." },
  { n: "02", icon: <Users size={18} />,    t: "Parcourez les prestataires", d: `${VENDOR_COUNT} pros filtrés par ville, catégorie et budget.` },
  { n: "03", icon: <Zap size={18} />,      t: "Réservez directement", d: "Envoyez une demande, confirmez. C'est tout." },
]

const CATEGORY_IMAGES: Record<string, string> = {
  "DJ": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&q=80",
  "Photographe": "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&h=400&fit=crop&q=80",
  "Vidéaste": "https://images.unsplash.com/photo-1601506521793-dc748fc80b67?w=400&h=400&fit=crop&q=80",
  "Traiteur": "https://images.unsplash.com/photo-1555244162-803834f70033?w=400&h=400&fit=crop&q=80",
  "Décorateur": "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=400&fit=crop&q=80",
  "Fleuriste événementiel": "https://images.unsplash.com/photo-1487530811015-780b63e1b5a7?w=400&h=400&fit=crop&q=80",
  "Wedding planner": "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=400&fit=crop&q=80",
  "Makeup Artist": "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=400&fit=crop&q=80",
  "Hairstylist": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop&q=80",
  "Orchestre": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&q=80",
  "Chanteur / chanteuse": "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop&q=80",
  "Lieu de réception": "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=400&fit=crop&q=80",
  "Pâtissier / Cake designer": "https://images.unsplash.com/photo-1535141192574-5f39a5847d0a?w=400&h=400&fit=crop&q=80",
  "Neggafa": "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&h=400&fit=crop&q=80",
  "Event Planner": "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=400&fit=crop&q=80",
  "Event planner": "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=400&fit=crop&q=80",
  "Violoniste": "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=400&fit=crop&q=80",
  "Magicien": "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=400&h=400&fit=crop&q=80",
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=400&fit=crop&q=80"

const TOP_VENDORS = [
  { id: "prestige-photo",       name: "Prestige Photo",       cat: "Photographe",             city: "Rabat",       rating: 5.0 },
  { id: "afrah-darna-prestige", name: "Afrah Darna Prestige", cat: "Traiteur",                city: "Marrakech",   rating: 4.0 },
  { id: "la-perle-events",      name: "La Perle Events",      cat: "Event Planner",           city: "Marrakech",   rating: 4.0 },
  { id: "dj-azz",               name: "DJ AZZ",               cat: "DJ",                      city: "Marrakech",   rating: 4.0 },
  { id: "orient-decor",         name: "Orient Décor",         cat: "Décorateur",              city: "Casablanca",  rating: 4.5 },
  { id: "makeup-sara",          name: "Makeup by Sara",       cat: "Makeup Artist",           city: "Rabat",       rating: 5.0 },
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

          {/* Logo */}
          <MomentoLogo iconSize={34} />

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: C.mist }}>
            <a href="#explore" className="hover:opacity-80 transition-opacity">Explorer</a>
            <a href="#how"     className="hover:opacity-80 transition-opacity">Comment ça marche</a>
            <Link href="/prestataires" className="hover:opacity-80 transition-opacity">Prestataires</Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <DarkModeToggle />
            <NavAuthButtons />
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-2">
            <DarkModeToggle />
            <button className="p-2 rounded-lg" onClick={() => setMenuOpen(o => !o)}
              style={{ color: C.white }}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
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
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 px-4 sm:px-6 text-center overflow-x-clip" style={{ backgroundColor: C.ink }}>
        {/* Hero background photo — subtle overlay */}
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&h=900&fit=crop&q=50"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ backgroundColor: `${C.ink}E0` }} />
        </div>
        {/* Animated 3D orbs background */}
        <HeroOrbs />
        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Hero badge logo — just the mark, no text */}
          <div className="flex justify-center mb-5">
            <Image src="/logo-badge-dark.png" alt="Momento" width={90} height={90} className="dark:hidden" style={{ objectFit: "contain" }} priority />
            <Image src="/logo-badge-light.png" alt="Momento" width={90} height={90} className="hidden dark:block" style={{ objectFit: "contain" }} priority />
          </div>
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

        {/* Floating 3D event cards */}
        <div className="absolute left-4 top-1/3 hidden lg:block" style={{ transform: "perspective(600px) rotateY(15deg) rotateX(5deg)" }}>
          <div className="px-4 py-3 rounded-2xl text-xs font-semibold shadow-lg" style={{
            backgroundColor: C.dark,
            border: `1px solid ${C.anthracite}`,
            color: C.mist,
            animation: "float-a 6s ease-in-out infinite",
          }}>
            📸 Photographe · Rabat
          </div>
        </div>
        <div className="absolute right-6 top-1/4 hidden lg:block" style={{ transform: "perspective(600px) rotateY(-12deg) rotateX(8deg)" }}>
          <div className="px-4 py-3 rounded-2xl text-xs font-semibold shadow-lg" style={{
            backgroundColor: C.dark,
            border: `1px solid ${C.anthracite}`,
            color: C.mist,
            animation: "float-b 7s ease-in-out infinite",
          }}>
            🎵 DJ · Marrakech
          </div>
        </div>
        <div className="absolute right-10 bottom-16 hidden lg:block" style={{ transform: "perspective(600px) rotateY(-8deg) rotateX(-5deg)" }}>
          <div className="px-4 py-3 rounded-2xl text-xs font-semibold shadow-lg" style={{
            backgroundColor: C.dark,
            border: `1px solid ${C.anthracite}`,
            color: C.mist,
            animation: "float-c 8s ease-in-out infinite",
          }}>
            🍽️ Traiteur · Casablanca
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

          {/* Grid catégories — grandes tiles photo style Airbnb */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {MAJOR_CATS_HOME.map(cat => (
              <Link href={cat.href} key={cat.slug}
                className="relative aspect-[4/3] rounded-2xl overflow-hidden group ring-2 ring-transparent hover:ring-[#C4532A] transition-all duration-300 hover:-translate-y-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cat.img}
                  alt={cat.label}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(26,18,8,0.88) 0%, rgba(26,18,8,0.3) 55%, transparent 100%)" }} />
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                  <div className="text-xl sm:text-2xl mb-1">{cat.icon}</div>
                  <div className="font-bold text-sm sm:text-base" style={{ color: "#fff" }}>{cat.label}</div>
                  <div className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "rgba(255,255,255,0.65)" }}>
                    {cat.sub.length} spécialités <ArrowRight size={10} />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Link href="/explore"
              className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-2xl transition-all hover:opacity-80"
              style={{ backgroundColor: C.anthracite, color: C.white, border: `1px solid ${C.steel}` }}>
              Voir toutes les catégories <ArrowRight size={14} />
            </Link>
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

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
            {TOP_VENDORS.map(v => (
              <Link href={`/vendor/${v.id}`} key={v.id}
                className="rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:ring-2 hover:ring-[#C4532A] ring-2 ring-transparent block group"
                style={{ backgroundColor: C.dark, border: `1px solid ${C.anthracite}` }}>
                <div className="relative h-44 sm:h-52 overflow-hidden"
                  style={{ backgroundColor: C.anthracite }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={CATEGORY_IMAGES[v.cat] ?? FALLBACK_IMAGE}
                    alt={v.cat}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={e => { const t = e.currentTarget; if (!t.dataset.f) { t.dataset.f = "1"; t.src = FALLBACK_IMAGE } }}
                  />
                  <div className="absolute bottom-3 left-3">
                    <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: `${C.terra}`, color: "#fff" }}>{v.cat}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-sm truncate mb-1" style={{ color: C.white }}>{v.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xs flex items-center gap-1" style={{ color: C.mist }}>
                      <MapPin size={10} /> {v.city}
                    </span>
                    <span className="text-xs font-bold flex items-center gap-1" style={{ color: C.white }}>
                      <Star size={11} fill={C.terra} style={{ color: C.terra }} /> {v.rating.toFixed(1)}
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

      {/* ── TÉMOIGNAGES ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6" style={{ backgroundColor: C.ink }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase mb-3 text-center" style={{ color: C.terra }}>
            Ils nous font confiance
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-12 text-center" style={{ color: C.white }}>
            Ce que disent nos organisateurs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                name: "Salma B.",
                event: "Mariage — Marrakech",
                photo: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&q=75",
                text: "Grâce à Momento j'ai trouvé notre DJ et notre photographe en moins d'une heure. Tout était parfait le jour J.",
                stars: 5,
              },
              {
                name: "Youssef A.",
                event: "Corporate — Casablanca",
                photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&q=75",
                text: "Plateforme intuitive, prestataires réactifs. Notre soirée d'entreprise a dépassé toutes les attentes.",
                stars: 5,
              },
              {
                name: "Nadia M.",
                event: "Fiançailles — Rabat",
                photo: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=80&h=80&fit=crop&q=75",
                text: "Le traiteur recommandé par Momento était exceptionnel. Je recommande à toutes mes amies !",
                stars: 5,
              },
            ].map(({ name, event, photo, text, stars }) => (
              <div key={name} className="rounded-2xl p-6 flex flex-col gap-4 ring-2 ring-transparent hover:ring-[#C4532A] transition-all duration-200 hover:-translate-y-0.5" style={{ backgroundColor: C.dark }}>
                <div className="flex gap-1">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} size={14} fill="#C4532A" stroke="none" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed flex-1" style={{ color: C.mist }}>&ldquo;{text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: C.anthracite }}>
                  <img src={photo} alt={name} className="w-10 h-10 rounded-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop" }} />
                  <div>
                    <p className="text-sm font-bold" style={{ color: C.white }}>{name}</p>
                    <p className="text-xs" style={{ color: C.terra }}>{event}</p>
                  </div>
                </div>
              </div>
            ))}
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
      <Footer />

    </div>
  )
}
