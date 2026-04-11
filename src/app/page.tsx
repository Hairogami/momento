import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Calendar, Users, Zap, Star, MapPin } from "lucide-react"
import NavAuthButtons from "@/components/NavAuthButtons"
import AirbnbSearchBar from "@/components/AirbnbSearchBar"
import HeroOrbs from "@/components/HeroOrbs"
import Footer from "@/components/Footer"
import LandingNav from "./LandingNav"
import HeroTitle from "./HeroTitle"
import { VENDOR_COUNT } from "@/lib/vendorData"
import { C } from "@/lib/colors"
import { MomentoLogo } from "@/components/MomentoLogo"

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
    img: "/cat-beaute.jpg",
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
  { n: "01", icon: <Calendar size={18} />, t: "Fixe ta date & ton lieu", d: "Type, date, lieu et budget. 30 secondes chrono." },
  { n: "02", icon: <Users size={18} />,    t: "Trouve tes prestataires", d: `${VENDOR_COUNT} pros vérifiés — filtre par ville, style et budget.` },
  { n: "03", icon: <Zap size={18} />,      t: "Contacte & réserve", d: "Envoie une demande, confirme. C'est tout." },
]

const CATEGORY_IMAGES: Record<string, string> = {
  "DJ": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&q=80",
  "Photographe": "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&h=400&fit=crop&q=80",
  "Vidéaste": "https://images.unsplash.com/photo-1601506521793-dc748fc80b67?w=400&h=400&fit=crop&q=80",
  "Traiteur": "https://images.unsplash.com/photo-1555244162-803834f70033?w=400&h=400&fit=crop&q=80",
  "Décorateur": "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=400&fit=crop&q=80",
  "Fleuriste événementiel": "https://images.unsplash.com/photo-1487530811015-780b63e1b5a7?w=400&h=400&fit=crop&q=80",
  "Wedding planner": "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=400&fit=crop&q=80",
  "Makeup Artist": "https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&h=400&fit=crop&q=80",
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
  { id: "prestige-photo",       name: "Prestige Photo",       cat: "Photographe",   city: "Rabat",      rating: 5.0, featured: true },
  { id: "afrah-darna-prestige", name: "Afrah Darna Prestige", cat: "Traiteur",       city: "Marrakech",  rating: 4.0, featured: false },
  { id: "la-perle-events",      name: "La Perle Events",      cat: "Event Planner",  city: "Marrakech",  rating: 4.0, featured: false },
  { id: "dj-azz",               name: "DJ AZZ",               cat: "DJ",             city: "Marrakech",  rating: 4.0, featured: false },
  { id: "ahlam-mua",            name: "Ahlam MUA",            cat: "Makeup Artist",  city: "Casablanca", rating: 4.0, featured: false },
]

export default function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: C.ink, color: C.white }}>

      <LandingNav />

      <main>
      {/* ── HERO ── */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 px-4 sm:px-6 text-center overflow-x-clip"
        style={{ backgroundColor: C.ink }}>
        <HeroOrbs />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="flex justify-center mb-5">
            <Image src="/logo-badge-dark.png"  alt="Momento" width={80} height={80} className="dark:hidden" style={{ objectFit: "contain" }} priority />
            <Image src="/logo-badge-light.png" alt="Momento" width={80} height={80} className="hidden dark:block" style={{ objectFit: "contain" }} priority />
          </div>

          <p className="text-xs font-semibold tracking-widest uppercase mb-6" style={{ color: C.terra }}>
            N°1 des prestataires événementiels · Maroc
          </p>

          <HeroTitle />

          <p className="text-sm sm:text-base mb-8 max-w-lg mx-auto leading-relaxed"
            style={{ color: C.mist, opacity: 0.8 }}>
            Trouve ton photographe, ton DJ, ton traiteur au Maroc — directement, sans commission, sans intermédiaire.
          </p>

          <AirbnbSearchBar />

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <Link href="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs font-semibold tracking-widest uppercase px-8 py-4 transition-all hover:opacity-90 hover:-translate-y-0.5"
              style={{ backgroundColor: C.terra, color: "var(--momento-ink)", boxShadow: "0 8px 32px rgba(var(--momento-terra-rgb),0.25)", letterSpacing: "0.16em" }}>
              Créer mon événement <ArrowRight size={14} />
            </Link>
            <Link href="/explore"
              className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs font-semibold tracking-widest uppercase px-8 py-4 transition-all hover:opacity-80"
              style={{ backgroundColor: C.anthracite, color: C.white, letterSpacing: "0.16em", border: `0.5px solid ${C.steel}` }}>
              Explorer
            </Link>
          </div>
        </div>

      </section>

      {/* ── STATS BAR ── */}
      <div className="flex items-center justify-center gap-8 sm:gap-16 py-5"
        style={{ backgroundColor: C.dark, borderBottom: `0.5px solid ${C.anthracite}` }}>
        {[
          { n: String(VENDOR_COUNT), l: "Prestataires" },
          { n: "41+", l: "Villes" },
          { n: "31",  l: "Catégories" },
        ].map(s => (
          <div key={s.l} className="text-center">
            <div className="font-display text-2xl sm:text-3xl font-light" style={{ color: C.white }}>{s.n}</div>
            <div className="text-xs tracking-widest uppercase mt-0.5" style={{ color: C.mist, letterSpacing: "0.18em", opacity: 0.7 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* ── CATÉGORIES ── */}
      <section id="explore" className="py-16 sm:py-24 px-4 sm:px-6" style={{ backgroundColor: C.dark }}>
        <div className="max-w-7xl mx-auto">

          <div className="flex items-end justify-between mb-10 pb-4"
            style={{ borderBottom: `0.5px solid ${C.anthracite}` }}>
            <div>
              <p className="text-xs tracking-widest uppercase mb-2" style={{ color: C.terra, letterSpacing: "0.22em" }}>
                Services
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-light" style={{ color: C.white }}>
                Explorer par <em style={{ fontStyle: "italic" }}>catégorie</em>
              </h2>
            </div>
            <Link href="/explore"
              className="hidden sm:flex items-center gap-2 text-xs tracking-widest uppercase transition-opacity hover:opacity-100"
              style={{ color: C.mist, letterSpacing: "0.16em", opacity: 0.6, borderBottom: `0.5px solid ${C.steel}`, paddingBottom: "2px" }}>
              Toutes les catégories <ArrowRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {MAJOR_CATS_HOME.map((cat, idx) => (
              <Link href={cat.href} key={cat.slug}
                className="relative aspect-[4/3] overflow-hidden group cat-card-hover">
                <Image
                  src={cat.img}
                  alt={cat.label}
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority={idx < 3}
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(26,18,8,0.9) 0%, rgba(26,18,8,0.2) 55%, transparent 100%)" }} />
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                  <div className="text-xl sm:text-2xl mb-1">{cat.icon}</div>
                  <div className="font-display text-lg sm:text-xl font-light" style={{ color: "#fff" }}>{cat.label}</div>
                  <div className="text-xs mt-0.5 tracking-widest uppercase flex items-center gap-1"
                    style={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.14em" }}>
                    {cat.sub.length} spécialités <ArrowRight size={10} />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Link href="/explore"
              className="inline-flex items-center gap-2 text-xs tracking-widest uppercase px-6 py-3 transition-all hover:opacity-80"
              style={{ backgroundColor: C.anthracite, color: C.white, border: `0.5px solid ${C.steel}`, letterSpacing: "0.16em" }}>
              Voir toutes les catégories <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── TOP VENDORS — asymmetric editorial grid ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6" style={{ backgroundColor: C.ink }}>
        <div className="max-w-7xl mx-auto">

          <div className="flex items-end justify-between mb-10 pb-4"
            style={{ borderBottom: `0.5px solid ${C.anthracite}` }}>
            <div>
              <p className="text-xs tracking-widest uppercase mb-2" style={{ color: C.terra, letterSpacing: "0.22em" }}>
                Sélection
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-light" style={{ color: C.white }}>
                Prestataires <em style={{ fontStyle: "italic" }}>en vedette</em>
              </h2>
            </div>
            <Link href="/explore"
              className="hidden sm:flex items-center gap-2 text-xs tracking-widest uppercase transition-opacity hover:opacity-100"
              style={{ color: C.mist, letterSpacing: "0.16em", opacity: 0.6, borderBottom: `0.5px solid ${C.steel}`, paddingBottom: "2px" }}>
              Voir tout <ArrowRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {TOP_VENDORS.map((v, idx) => (
              <Link href={`/vendor/${v.id}`} key={v.id}
                className={`overflow-hidden group block transition-all duration-200 cat-card-hover ${idx === 0 ? "vendor-featured row-span-2" : ""}`}
                style={{ backgroundColor: C.dark, border: `0.5px solid ${C.anthracite}` }}>
                <div className={`relative overflow-hidden ${idx === 0 ? "h-72 sm:h-full min-h-[320px]" : "h-44 sm:h-48"}`}
                  style={{ backgroundColor: C.anthracite }}>
                  <Image
                    src={CATEGORY_IMAGES[v.cat] ?? FALLBACK_IMAGE}
                    alt={v.cat}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {idx === 0 && (
                    <div className="absolute top-3 left-3 text-xs font-semibold tracking-widest uppercase px-2.5 py-1"
                      style={{ backgroundColor: C.terra, color: "#fff", letterSpacing: "0.16em" }}>
                      Coup de cœur
                    </div>
                  )}
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(26,18,8,0.7) 0%, transparent 50%)" }} />
                </div>
                <div className="p-3 sm:p-4">
                  <p className="text-xs tracking-widest uppercase mb-1" style={{ color: C.terra, letterSpacing: "0.18em" }}>{v.cat}</p>
                  <h3 className={`font-display font-light truncate mb-2 ${idx === 0 ? "text-xl" : "text-base"}`} style={{ color: C.white }}>{v.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xs flex items-center gap-1" style={{ color: C.mist }}>
                      <MapPin size={10} /> {v.city}
                    </span>
                    <span className="text-xs flex items-center gap-1" style={{ color: C.terra }}>
                      <Star size={11} fill={C.terra} stroke="none" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-5 text-center sm:hidden">
            <Link href="/explore" className="text-xs tracking-widest uppercase" style={{ color: C.terra }}>
              Voir tous les prestataires →
            </Link>
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE — editorial horizontal strip ── */}
      <section id="how" style={{ backgroundColor: C.dark, borderTop: `0.5px solid ${C.anthracite}`, borderBottom: `0.5px solid ${C.anthracite}` }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center py-10 sm:py-14">
            <p className="text-xs tracking-widest uppercase mb-2" style={{ color: C.terra, letterSpacing: "0.22em" }}>Simple</p>
            <h2 className="font-display text-3xl sm:text-4xl font-light" style={{ color: C.white }}>
              De l&apos;idée à l&apos;événement en <em style={{ fontStyle: "italic" }}>3 étapes</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 pb-12 sm:pb-16"
            style={{ borderTop: `0.5px solid ${C.anthracite}` }}>
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative flex flex-col gap-4 p-6 sm:p-8"
                style={i < STEPS.length - 1 ? { borderRight: `0.5px solid ${C.anthracite}` } : {}}>
                <div className="flex items-start gap-4">
                  <span className="font-display text-4xl font-light" style={{ color: `${C.terra}40`, lineHeight: 1 }}>{s.n}</span>
                  <div className="w-9 h-9 flex items-center justify-center flex-shrink-0 mt-1"
                    style={{ border: `0.5px solid ${C.terra}`, color: C.terra }}>
                    {s.icon}
                  </div>
                </div>
                <h3 className="font-display text-xl font-light" style={{ color: C.white }}>{s.t}</h3>
                <p className="text-sm leading-relaxed" style={{ color: C.mist }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRESTATAIRES BANNER ── */}
      <section className="py-12 sm:py-16 px-4 sm:px-6" style={{ backgroundColor: C.ink }}>
        <div className="max-w-7xl mx-auto">
          <div className="p-6 sm:p-10" style={{ backgroundColor: C.dark, border: `0.5px solid ${C.anthracite}` }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
              <div>
                <p className="text-xs tracking-widest uppercase mb-2" style={{ color: C.terra, letterSpacing: "0.18em" }}>
                  Tu es prestataire ?
                </p>
                <h3 className="font-display text-2xl sm:text-3xl font-light" style={{ color: C.white }}>
                  Fais grandir ton activité<br />
                  <em style={{ fontStyle: "italic", color: C.terra }}>gratuitement</em> sur Momento
                </h3>
              </div>
              <Link href="/prestataires"
                className="flex-shrink-0 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase px-6 py-3.5 transition-all hover:opacity-90 whitespace-nowrap"
                style={{ backgroundColor: C.terra, color: "var(--momento-ink)", letterSpacing: "0.16em" }}>
                Créer mon profil <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px" style={{ borderTop: `0.5px solid ${C.anthracite}` }}>
              {[
                { n: "100%",   label: "Profil gratuit",        desc: "Aucun abonnement. Publie tes services, tes photos et tes tarifs sans frais." },
                { n: "0%",     label: "Commission",             desc: "Garde 100% de tes revenus. Momento ne touche rien sur tes contrats." },
                { n: String(VENDOR_COUNT) + "+", label: "Pros référencés", desc: "Rejoins la plus grande communauté de pros de l'événement au Maroc." },
              ].map(({ n, label, desc }) => (
                <div key={label} className="flex flex-col gap-2 pt-6 sm:pr-8">
                  <div className="font-display text-3xl sm:text-4xl font-light" style={{ color: C.terra }}>{n}</div>
                  <div className="text-sm font-semibold" style={{ color: C.white }}>{label}</div>
                  <p className="text-xs leading-relaxed" style={{ color: C.mist }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TÉMOIGNAGES ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6" style={{ backgroundColor: C.dark }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs tracking-widest uppercase mb-2" style={{ color: C.terra, letterSpacing: "0.22em" }}>
              Ils nous font confiance
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-light" style={{ color: C.white }}>
              Ce que disent nos <em style={{ fontStyle: "italic" }}>organisateurs</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px"
            style={{ backgroundColor: C.anthracite, border: `0.5px solid ${C.anthracite}` }}>
            {[
              {
                name: "Salma B.", event: "Mariage — Marrakech",
                photo: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&q=75",
                text: "Grâce à Momento j'ai trouvé notre DJ et notre photographe en moins d'une heure. Tout était parfait le jour J.",
                stars: 5,
              },
              {
                name: "Youssef A.", event: "Corporate — Casablanca",
                photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&q=75",
                text: "Interface ultra simple, prestataires réactifs. Notre soirée d'entreprise a dépassé toutes les attentes.",
                stars: 5,
              },
              {
                name: "Nadia M.", event: "Fiançailles — Rabat",
                photo: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=80&h=80&fit=crop&q=75",
                text: "Le traiteur recommandé par Momento était exceptionnel. Je recommande à toutes mes amies !",
                stars: 5,
              },
            ].map(({ name, event, photo, text, stars }) => (
              <div key={name} className="flex flex-col gap-5 p-6 sm:p-8 transition-all duration-200 hover:-translate-y-0.5"
                style={{ backgroundColor: C.ink }}>
                <div className="font-display text-5xl font-light leading-none" style={{ color: `${C.terra}30` }}>&ldquo;</div>
                <div className="flex gap-1 -mt-4">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} size={12} fill={C.terra} stroke="none" />
                  ))}
                </div>
                <p className="font-display text-lg font-light leading-relaxed flex-1 italic"
                  style={{ color: C.silver }}>{text}</p>
                <div className="flex items-center gap-3 pt-4" style={{ borderTop: `0.5px solid ${C.anthracite}` }}>
                  <Image src={photo} alt={name} width={40} height={40} className="rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: C.white }}>{name}</p>
                    <p className="text-xs tracking-widest uppercase" style={{ color: C.terra, letterSpacing: "0.14em" }}>{event}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL — split editorial ── */}
      <section className="px-4 sm:px-6" style={{ backgroundColor: C.ink }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ borderTop: `0.5px solid ${C.anthracite}`, borderBottom: `0.5px solid ${C.anthracite}` }}>

            {/* Left — clients */}
            <div className="flex flex-col justify-center gap-5 py-16 sm:py-20 sm:pr-12"
              style={{ borderRight: `0.5px solid ${C.anthracite}` }}>
              <p className="text-xs tracking-widest uppercase" style={{ color: C.terra, letterSpacing: "0.22em" }}>Pour les clients</p>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-light leading-tight" style={{ color: C.white }}>
                Ton prochain<br />
                événement<br />
                <em style={{ fontStyle: "italic", color: C.silver }}>commence ici.</em>
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: C.mist }}>
                Des milliers d&apos;organisateurs au Maroc préparent leur événement avec Momento.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/dashboard"
                  className="flex items-center justify-center gap-2 text-xs font-semibold tracking-widest uppercase px-7 py-4 transition-all hover:opacity-90"
                  style={{ backgroundColor: C.terra, color: "var(--momento-ink)", letterSpacing: "0.16em" }}>
                  Créer mon événement <ArrowRight size={14} />
                </Link>
                <Link href="/explore"
                  className="flex items-center justify-center gap-2 text-xs font-semibold tracking-widest uppercase px-7 py-4 transition-all hover:opacity-80"
                  style={{ backgroundColor: "transparent", color: C.white, border: `0.5px solid ${C.steel}`, letterSpacing: "0.16em" }}>
                  Explorer
                </Link>
              </div>
            </div>

            {/* Right — prestataires */}
            <div className="flex flex-col justify-center gap-5 py-16 sm:py-20 sm:pl-12"
              style={{ backgroundColor: `${C.dark}` }}>
              <p className="text-xs tracking-widest uppercase" style={{ color: C.terra, letterSpacing: "0.22em" }}>Pour les prestataires</p>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-light leading-tight" style={{ color: C.white }}>
                Développe<br />
                ta <em style={{ fontStyle: "italic", color: C.terra }}>clientèle</em><br />
                sur Momento.
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: C.mist }}>
                Publie ton profil gratuitement et reçois des demandes de clients qui te correspondent.
              </p>
              <Link href="/prestataires"
                className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase px-7 py-4 transition-all hover:opacity-90 self-start"
                style={{ backgroundColor: C.white, color: C.ink, letterSpacing: "0.16em" }}>
                Créer mon profil <ArrowRight size={14} />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <Footer />

      </main>
    </div>
  )
}
