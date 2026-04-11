"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MapPin, Star, Globe, CheckCircle, Calendar, Users, MessageSquare, Share2, X, Loader2 } from "lucide-react"
import ExploreNav from "@/components/ExploreNav"
import Footer from "@/components/Footer"
import { VENDOR_BASIC } from "@/lib/vendorData"
import { VENDOR_DETAILS, CAT_PHOTOS } from "@/lib/vendorDetails"
import dynamic from "next/dynamic"
import { C } from "@/lib/colors"

const VendorMap = dynamic(() => import("@/components/VendorMap"), { ssr: false })
const InstagramWidget = dynamic(() => import("@/components/InstagramWidget"), { ssr: false })
const BookingCalendar = dynamic(() => import("@/components/BookingCalendar"), { ssr: false })

const CAT_ICONS: Record<string, string> = {
  "DJ": "🎧",
  "Chanteur / chanteuse": "🎤",
  "Orchestre": "🎺",
  "Violoniste": "🎻",
  "Dekka Marrakchia / Issawa": "🥁",
  "Traiteur": "🍽️",
  "Pâtissier / Cake designer": "🎂",
  "Service de bar / mixologue": "🍹",
  "Photographe": "📸",
  "Vidéaste": "🎬",
  "Lieu de réception": "🏛️",
  "Fleuriste événementiel": "💐",
  "Décorateur": "✨",
  "Créateur d'ambiance lumineuse": "💡",
  "Hairstylist": "💇",
  "Makeup Artist": "💄",
  "Neggafa": "👑",
  "Robes de mariés": "👗",
  "Event planner": "📋",
  "Wedding planner": "💍",
  "Location de voiture de mariage": "🚗",
  "Sécurité événementielle": "🛡️",
  "Animateur enfants": "🎪",
  "Magicien": "🎩",
  "Structures gonflables": "🎈",
  "Créateur de cadeaux invités": "🎁",
}

const VENDORS: Record<string, { name: string; category: string; city: string; rating: number; website?: string }> = {
  "prestige-photo":         { name: "PRESTIGE PHOTO",            category: "Photographe",                   city: "Rabat",      rating: 5 },
  "touzani-bola-bola-royal":{ name: "TOUZANI BOLA BOLA ROYAL",   category: "Dekka Marrakchia / Issawa",     city: "Rabat",      rating: 5 },
  "dj-azz":                 { name: "DJ AZZ",                    category: "DJ",                            city: "Marrakech",  rating: 4 },
  "dj-c4":                  { name: "DJ C4",                     category: "DJ",                            city: "Marrakech",  rating: 4 },
  "orchestre-kilani":       { name: "ORCHESTRE KILANI",           category: "Chanteur / chanteuse",          city: "Agadir",     rating: 4 },
  "abboudi":                { name: "ABBOUDI",                   category: "Chanteur / chanteuse",          city: "Casablanca", rating: 4 },
  "afrah-darna-prestige":   { name: "AFRAH DARNA PRESTIGE",      category: "Traiteur",                      city: "Marrakech",  rating: 4 },
  "afrah-palace-fes":       { name: "AFRAH PALACE FES",          category: "Traiteur",                      city: "Fès",        rating: 4 },
  "afrah-ghandi":           { name: "AFRAH GHANDI",              category: "Lieu de réception",             city: "Casablanca", rating: 4 },
  "california-palace":      { name: "CALIFORNIA PALACE",         category: "Lieu de réception",             city: "Tanger",     rating: 4 },
  "flawless-photo":         { name: "FLAWLESS PHOTO",            category: "Photographe",                   city: "Rabat",      rating: 4 },
  "la-perle-events":        { name: "LA PERLE EVENTS",           category: "Event planner",                 city: "Marrakech",  rating: 4 },
  "ahlam-mua":              { name: "AHLAM MUA",                 category: "Makeup Artist",                 city: "Casablanca", rating: 4 },
  "amine-castor":           { name: "AMINE CASTOR",              category: "Makeup Artist",                 city: "Rabat",      rating: 4 },
  "alhaja-saadia":          { name: "ALHAJA SAADIA",             category: "Neggafa",                       city: "Marrakech",  rating: 4 },
  "arousati":               { name: "AROUSATI",                  category: "Neggafa",                       city: "Kénitra",    rating: 4 },
  "jawad-asmar":            { name: "JAWAD ASMAR",               category: "Orchestre",                     city: "Rabat",      rating: 4 },
  "cas-consult":            { name: "CAS CONSULT",               category: "Fleuriste événementiel",        city: "Marrakech",  rating: 4 },
  "afrah-riad":             { name: "AFRAH RIAD",                category: "Pâtissier / Cake designer",     city: "Rabat",      rating: 4 },
  "abrievents":             { name: "ABRIEVENTS",                category: "Décorateur",                    city: "Rabat",      rating: 4 },
  "abidi-events":           { name: "ABIDI EVENTS",              category: "Créateur d'ambiance lumineuse", city: "Rabat",      rating: 4 },
  "celeste":                { name: "CELESTE",                   category: "Robes de mariés",               city: "Rabat",      rating: 4 },
  "cocktails-wedding":      { name: "COCKTAILS WEDDING",         category: "Service de bar / mixologue",    city: "Rabat",      rating: 4 },
  "allo-limousine":         { name: "ALLO LIMOUSINE",            category: "Location de voiture de mariage",city: "Rabat",      rating: 4 },
  "diaa-lahmamsi":          { name: "DIAA LAHMAMSI",             category: "Wedding planner",               city: "Rabat",      rating: 4 },
  "anass-hairestyle":       { name: "ANASS HAIRESTYLE",          category: "Hairstylist",                   city: "Casablanca", rating: 4 },
  "crystal-photo":          { name: "CRYSTAL PHOTO",             category: "Vidéaste",                      city: "Rabat",      rating: 4 },
  "pidho-le-magicien":      { name: "PIDHO LE MAGICIEN",         category: "Magicien",                      city: "Rabat",      rating: 4 },
  "karim-groupe":           { name: "KARIM GROUPE MAROC",        category: "Animateur enfants",             city: "Casablanca", rating: 4 },
}

const REVIEWS = [
  { author: "Samira B.", event: "Mariage", note: "Incroyable prestation, tout le monde a adoré. Très professionnel et ponctuel.", stars: 5 },
  { author: "Mehdi K.", event: "Anniversaire", note: "Excellent rapport qualité-prix. Je recommande sans hésitation.", stars: 4 },
  { author: "Fatima Z.", event: "Fiançailles", note: "Superbe travail, à la hauteur de nos attentes. Merci !", stars: 5 },
]

const EVENT_TYPES = ["Mariage", "Fiançailles", "Anniversaire", "Baby shower", "Soutenance", "Cérémonie", "Fête privée", "Corporate"]

interface ContactForm {
  name: string
  email: string
  phone: string
  eventType: string
  eventDate: string
  message: string
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold" style={{ color: C.mist }}>{label}</label>
      {children}
    </div>
  )
}

export default function VendorPageClient({ slug, claimed = false, currentUserId = null }: { slug: string; claimed?: boolean; currentUserId?: string | null }) {
  const detailed = VENDORS[slug]
  const vendor = detailed ?? VENDOR_BASIC[slug] ?? null
  const extra = VENDOR_DETAILS[slug]
  const vendorPhotos = extra?.photos ?? CAT_PHOTOS[vendor?.category ?? ""] ?? []
  const vendorReviews = extra?.reviews ?? REVIEWS
  const [claimDismissed, setClaimDismissed] = useState(false)
  const [msgOpen, setMsgOpen] = useState(false)
  const [form, setForm] = useState<ContactForm>({ name: "", email: "", phone: "", eventType: "", eventDate: "", message: "" })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [sendError, setSendError] = useState("")

  // Reviews from DB
  const [dbReviews, setDbReviews] = useState<{ id: string; rating: number; comment: string | null; eventType: string | null; createdAt: string; author: { name: string | null; image: string | null } }[]>([])
  const [reviewAvg, setReviewAvg] = useState<number | null>(null)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "", eventType: "" })
  const [reviewSending, setReviewSending] = useState(false)
  const [reviewSent, setReviewSent] = useState(false)
  const [reviewError, setReviewError] = useState("")

  useEffect(() => {
    fetch(`/api/reviews?slug=${slug}`)
      .then(r => r.json())
      .then(d => { setDbReviews(d.reviews ?? []); setReviewAvg(d.avg ?? null) })
      .catch(() => {})
  }, [slug])

  async function handleReview() {
    if (reviewForm.rating < 1 || reviewForm.rating > 5) return
    setReviewSending(true); setReviewError("")
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorSlug: slug, rating: reviewForm.rating, comment: reviewForm.comment || undefined, eventType: reviewForm.eventType || undefined }),
      })
      const data = await res.json()
      if (!res.ok) { setReviewError(data.error ?? "Erreur."); return }
      setReviewSent(true)
      // Re-fetch reviews
      fetch(`/api/reviews?slug=${slug}`).then(r => r.json()).then(d => { setDbReviews(d.reviews ?? []); setReviewAvg(d.avg ?? null) }).catch(() => {})
    } catch { setReviewError("Impossible d'envoyer. Réessayez.") }
    finally { setReviewSending(false) }
  }

  function set(k: keyof ContactForm, v: string) { setForm(f => ({ ...f, [k]: v })) }

  function openModal() { setSent(false); setSendError(""); setMsgOpen(true) }

  async function handleSend() {
    setSending(true)
    setSendError("")

    // Authenticated user → use messaging system
    if (currentUserId) {
      if (!form.message.trim()) {
        setSendError("Merci d'écrire un message.")
        setSending(false)
        return
      }
      try {
        const res = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vendorSlug: slug, content: form.message.trim() }),
        })
        if (!res.ok) {
          const data = await res.json()
          setSendError(data.error ?? "Une erreur est survenue.")
        } else {
          const data = await res.json()
          window.location.href = `/messages?conv=${data.conversationId}`
        }
      } catch {
        setSendError("Impossible d'envoyer le message. Réessayez.")
      } finally {
        setSending(false)
      }
      return
    }

    // Guest → legacy contact request
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setSendError("Merci de remplir ton nom, email et message.")
      setSending(false)
      return
    }
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorSlug: slug,
          clientName: form.name,
          clientEmail: form.email,
          clientPhone: form.phone || null,
          eventType: form.eventType || null,
          eventDate: form.eventDate || null,
          message: form.message,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setSendError(data.error ?? "Une erreur est survenue.")
      } else {
        setSent(true)
        setForm({ name: "", email: "", phone: "", eventType: "", eventDate: "", message: "" })
      }
    } catch {
      setSendError("Impossible d'envoyer le message. Réessayez.")
    } finally {
      setSending(false)
    }
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: C.ink }}>
        <p className="text-2xl font-bold" style={{ color: C.white }}>Prestataire introuvable</p>
        <Link href="/explore" className="text-sm font-medium px-4 py-2 rounded-xl" style={{ backgroundColor: C.terra, color: "#fff" }}>
          ← Retour aux prestataires
        </Link>
      </div>
    )
  }

  const icon = CAT_ICONS[vendor.category] ?? "🎪"

  const inputStyle = {
    backgroundColor: C.anthracite,
    border: `1px solid ${C.steel}`,
    color: C.white,
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.ink, color: C.white }}>

      <ExploreNav
        search=""
        onSearch={() => {}}
        searchPlaceholder={`Rechercher un·e ${vendor.category.toLowerCase()}…`}
      />

      <div className="px-4 pt-3 pb-1 max-w-6xl mx-auto">
        <Link href="/explore" className="inline-flex items-center gap-1 text-sm transition-opacity hover:opacity-70" style={{ color: C.mist }}>
          ← Explorer
        </Link>
      </div>

      {/* CLAIM BANNER */}
      {!claimed && !claimDismissed && (
        <div
          className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
          style={{ backgroundColor: C.terra, color: "#FFF8EF" }}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-base flex-shrink-0">🏷️</span>
            <span>
              <strong>Tu es ce prestataire ?</strong>
              {" "}Revendique cette page gratuitement et prends le contrôle de ton profil.
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href={`/prestataire/claim/${slug}`}
              className="px-3 py-1.5 rounded-full text-sm font-semibold transition-opacity hover:opacity-90 whitespace-nowrap"
              style={{ backgroundColor: "#FFF8EF", color: C.terra }}
            >
              Revendiquer →
            </Link>
            <button
              onClick={() => setClaimDismissed(true)}
              className="p-1 rounded-full opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Fermer"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* CLAIMED BADGE — subtle, shown when the profile is already owned */}
      {claimed && (
        <div
          className="flex items-center justify-center gap-2 px-4 py-2 text-xs"
          style={{ backgroundColor: "#1a3320", color: "#6fcf97" }}
        >
          <CheckCircle size={13} />
          <span>Profil revendiqué · Ce prestataire gère directement cette page</span>
        </div>
      )}

      {/* HERO BANNER */}
      {(() => {
        const CAT_IMAGES: Record<string, string> = {
          "DJ":                            "https://images.unsplash.com/photo-1571266028243-d220c6a18571?w=1200&h=500&fit=crop&q=80",
          "Chanteur / chanteuse":          "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1200&h=500&fit=crop&q=80",
          "Orchestre":                     "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=500&fit=crop&q=80",
          "Violoniste":                    "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=1200&h=500&fit=crop&q=80",
          "Dekka Marrakchia / Issawa":     "https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=1200&h=500&fit=crop&q=80",
          "Traiteur":                      "https://images.unsplash.com/photo-1555244162-803834f70033?w=1200&h=500&fit=crop&q=80",
          "Pâtissier / Cake designer":     "https://images.unsplash.com/photo-1535141192574-5f39a5847d0a?w=1200&h=500&fit=crop&q=80",
          "Service de bar / mixologue":    "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1200&h=500&fit=crop&q=80",
          "Photographe":                   "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&h=500&fit=crop&q=80",
          "Vidéaste":                      "https://images.unsplash.com/photo-1601506521793-dc748fc80b67?w=1200&h=500&fit=crop&q=80",
          "Lieu de réception":             "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=500&fit=crop&q=80",
          "Structures événementielles":    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&h=500&fit=crop&q=80",
          "Fleuriste événementiel":        "https://images.unsplash.com/photo-1487530811015-780b63e1b5a7?w=1200&h=500&fit=crop&q=80",
          "Décorateur":                    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&h=500&fit=crop&q=80",
          "Créateur d'ambiance lumineuse": "https://images.unsplash.com/photo-1508997449629-303059a039c0?w=1200&h=500&fit=crop&q=80",
          "Hairstylist":                   "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&h=500&fit=crop&q=80",
          "Makeup Artist":                 "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200&h=500&fit=crop&q=80",
          "Neggafa":                       "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&h=500&fit=crop&q=80",
          "Robes de mariés":               "https://images.unsplash.com/photo-1594552072238-b8a33785b6cd?w=1200&h=500&fit=crop&q=80",
          "Event planner":                 "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&h=500&fit=crop&q=80",
          "Wedding planner":               "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&h=500&fit=crop&q=80",
          "Location de voiture de mariage":"https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=1200&h=500&fit=crop&q=80",
          "VTC / Transport invités":       "https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=1200&h=500&fit=crop&q=80",
          "Sécurité événementielle":       "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=1200&h=500&fit=crop&q=80",
          "Animateur enfants":             "https://images.unsplash.com/photo-1558171813-13b498fa0b47?w=1200&h=500&fit=crop&q=80",
          "Magicien":                      "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=1200&h=500&fit=crop&q=80",
          "Structures gonflables":         "https://images.unsplash.com/photo-1575783970733-1aaedde1db74?w=1200&h=500&fit=crop&q=80",
          "Créateur de cadeaux invités":   "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1200&h=500&fit=crop&q=80",
          "Créateur de faire-part":        "https://images.unsplash.com/photo-1572862881989-53f82a89e668?w=1200&h=500&fit=crop&q=80",
          "Spa / soins esthétiques":       "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&h=500&fit=crop&q=80",
          "Jeux & animations enfants":     "https://images.unsplash.com/photo-1576515652033-4cb4ae1c67ed?w=1200&h=500&fit=crop&q=80",
        }
        const heroImg = CAT_IMAGES[vendor.category]
        return (
          <div className="h-48 sm:h-72 relative overflow-hidden flex items-center justify-center" style={{ backgroundColor: C.dark }}>
            {heroImg ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={heroImg} alt={vendor.category} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <span className="text-7xl sm:text-9xl opacity-30">{icon}</span>
            )}
            <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 30%, ${C.ink} 100%)` }} />
          </div>
        )
      })()}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8 sm:-mt-12 relative z-10">

        {/* Profile card */}
        <div className="rounded-2xl p-5 sm:p-7 mb-6" style={{ backgroundColor: C.dark, border: `1px solid ${C.anthracite}` }}>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full mb-3"
                style={{ backgroundColor: `${C.terra}20`, color: C.terra }}>
                {icon} {vendor.category}
              </span>

              <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: C.white }}>
                {vendor.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3 mb-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} fill={i < vendor.rating ? C.terra : "none"}
                      style={{ color: C.terra }} />
                  ))}
                  <span className="text-sm font-bold ml-1" style={{ color: C.white }}>{vendor.rating}.0</span>
                  <span className="text-xs" style={{ color: C.mist }}>({vendorReviews.length} avis)</span>
                </div>
                <span className="flex items-center gap-1 text-sm" style={{ color: C.mist }}>
                  <MapPin size={13} /> {vendor.city}, Maroc
                </span>
                <span className="flex items-center gap-1 text-xs font-medium" style={{ color: "#10B981" }}>
                  <CheckCircle size={13} /> Référencé
                </span>
              </div>

              <p className="text-sm leading-relaxed" style={{ color: C.mist }}>
                {extra?.description ?? `${vendor.category} basé(e) à ${vendor.city}, disponible pour mariages, anniversaires, cérémonies et événements privés. Profil vérifié sur la plateforme Momento.`}
              </p>
            </div>

            {/* CTA block */}
            <div className="sm:w-56 shrink-0">
              <button onClick={openModal}
                className="w-full flex items-center justify-center gap-2 font-bold py-3.5 rounded-xl mb-2 transition-all hover:opacity-90"
                style={{ backgroundColor: C.terra, color: "#fff" }}>
                <MessageSquare size={16} /> Contacter
              </button>
              {((vendor as { website?: string }).website ?? extra?.website) && (
                <a href={(vendor as { website?: string }).website ?? extra?.website} target="_blank" rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 text-sm font-medium py-3 rounded-xl transition-all hover:opacity-80 mb-2"
                  style={{ backgroundColor: C.anthracite, color: C.white, border: `1px solid ${C.steel}` }}>
                  <Globe size={14} /> Site web
                </a>
              )}
              {extra?.instagram && (
                <a href={extra.instagram} target="_blank" rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 text-sm font-medium py-3 rounded-xl transition-all hover:opacity-80"
                  style={{ backgroundColor: C.anthracite, color: C.white, border: `1px solid ${C.steel}` }}>
                  📷 Instagram
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: <Star size={18} />, value: `${vendor.rating}.0 / 5`, label: "Note" },
            { icon: <Calendar size={18} />, value: "Disponible", label: "Statut" },
            { icon: <Users size={18} />, value: "Tous formats", label: "Capacité" },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4 text-center" style={{ backgroundColor: C.dark, border: `1px solid ${C.anthracite}` }}>
              <div className="flex justify-center mb-1" style={{ color: C.terra }}>{s.icon}</div>
              <p className="text-sm font-bold" style={{ color: C.white }}>{s.value}</p>
              <p className="text-xs" style={{ color: C.mist }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Booking Calendar */}
        <BookingCalendar vendorName={vendor.name} />

        {/* Photo gallery */}
        {vendorPhotos.length > 0 && (
          <div className="mb-6">
            <h2 className="text-base font-bold mb-3" style={{ color: C.white }}>Photos</h2>
            <div className="grid grid-cols-3 gap-2">
              {vendorPhotos.slice(0, 3).map((url, n) => (
                <div key={n} className="aspect-square rounded-xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`${vendor.name} ${n + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instagram Widget */}
        {extra?.instagram && (
          <InstagramWidget
            handle={extra.instagram}
            vendorName={vendor.name}
            category={vendor.category}
            photos={vendorPhotos}
          />
        )}

        {/* Map */}
        <VendorMap vendorId={slug} city={vendor.city} vendorName={vendor.name} category={vendor.category} rating={vendor.rating} />

        {/* Reviews */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold" style={{ color: C.white }}>
              Avis clients{reviewAvg !== null ? ` — ${reviewAvg}/5` : ""}
              <span className="text-xs font-normal ml-2" style={{ color: C.mist }}>
                ({dbReviews.length > 0 ? dbReviews.length : vendorReviews.length})
              </span>
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {(dbReviews.length > 0 ? dbReviews : vendorReviews).map((r, i) => {
              const isDb = dbReviews.length > 0
              const author = isDb ? ((r as typeof dbReviews[0]).author?.name ?? "Anonyme") : (r as typeof vendorReviews[0]).author
              const stars  = isDb ? (r as typeof dbReviews[0]).rating : (r as typeof vendorReviews[0]).stars
              const note   = isDb ? ((r as typeof dbReviews[0]).comment ?? "") : (r as typeof vendorReviews[0]).note
              const event  = isDb ? ((r as typeof dbReviews[0]).eventType ?? "") : (r as typeof vendorReviews[0]).event
              return (
                <div key={i} className="p-4 rounded-xl" style={{ backgroundColor: C.dark, border: `1px solid ${C.anthracite}` }}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-sm font-bold" style={{ color: C.white }}>{author}</span>
                      {event && <span className="text-xs ml-2" style={{ color: C.mist }}>· {event}</span>}
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} size={11} fill={j < stars ? C.terra : "none"} style={{ color: C.terra }} />
                      ))}
                    </div>
                  </div>
                  {note && <p className="text-sm" style={{ color: C.mist }}>{note}</p>}
                </div>
              )
            })}
          </div>

          {/* ReviewForm — utilisateurs connectés uniquement */}
          {currentUserId && !reviewSent && (
            <div className="mt-6 p-4 rounded-xl" style={{ backgroundColor: C.dark, border: `1px solid ${C.anthracite}` }}>
              <h3 className="text-sm font-bold mb-3" style={{ color: C.white }}>Laisser un avis</h3>
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setReviewForm(f => ({ ...f, rating: n }))} aria-label={`${n} étoile${n>1?"s":""}`}>
                    <Star size={22} fill={n <= reviewForm.rating ? C.terra : "none"} style={{ color: C.terra }} />
                  </button>
                ))}
              </div>
              <select
                className="w-full text-sm p-2 rounded-lg mb-2"
                style={{ backgroundColor: C.anthracite, color: C.white, border: `1px solid ${C.steel}` }}
                value={reviewForm.eventType}
                onChange={e => setReviewForm(f => ({ ...f, eventType: e.target.value }))}>
                <option value="">Type d&apos;événement (optionnel)</option>
                {["Mariage","Fiançailles","Anniversaire","Baby shower","Soutenance","Cérémonie","Fête privée","Corporate"].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <textarea
                rows={3}
                placeholder="Votre avis..."
                className="w-full text-sm p-2 rounded-lg resize-none mb-3"
                style={{ backgroundColor: C.anthracite, color: C.white, border: `1px solid ${C.steel}` }}
                value={reviewForm.comment}
                onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
              />
              {reviewError && <p className="text-xs mb-2" style={{ color: "#f87171" }}>{reviewError}</p>}
              <button
                onClick={handleReview}
                disabled={reviewSending}
                className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg disabled:opacity-50"
                style={{ backgroundColor: C.terra, color: "#fff" }}>
                {reviewSending ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} />}
                Publier l&apos;avis
              </button>
            </div>
          )}
          {currentUserId && reviewSent && (
            <p className="mt-4 text-sm text-center" style={{ color: C.terra }}>✓ Avis publié, merci !</p>
          )}
          {!currentUserId && (
            <p className="mt-4 text-xs text-center" style={{ color: C.mist }}>
              <Link href="/login" style={{ color: C.terra }}>Connectez-vous</Link> pour laisser un avis.
            </p>
          )}
        </div>

        {/* Contact CTA mobile */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4"
          style={{ backgroundColor: `${C.ink}F0`, backdropFilter: "blur(12px)", borderTop: `1px solid ${C.anthracite}` }}>
          <button onClick={openModal}
            className="w-full flex items-center justify-center gap-2 font-bold py-4 rounded-2xl"
            style={{ backgroundColor: C.terra, color: "#fff" }}>
            <MessageSquare size={17} /> Contacter {vendor.name.split(" ")[0]}
          </button>
        </div>
        <div className="h-24 sm:h-0" />
      </div>

      {/* Contact modal */}
      {msgOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 overflow-y-auto"
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
          onClick={e => e.target === e.currentTarget && setMsgOpen(false)}>
          <div className="w-full max-w-md rounded-2xl p-6 my-4" style={{ backgroundColor: C.dark, border: `1px solid ${C.anthracite}` }}>

            {sent ? (
              <div className="text-center py-6">
                <p className="text-4xl mb-3">✅</p>
                <p className="font-bold text-lg mb-1" style={{ color: C.white }}>Message envoyé !</p>
                <p className="text-sm mb-5" style={{ color: C.mist }}>
                  {vendor.name} a reçu votre demande et vous répondra rapidement.
                </p>
                <button onClick={() => setMsgOpen(false)}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm" style={{ backgroundColor: C.terra, color: "#fff" }}>
                  Fermer
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-lg" style={{ color: C.white }}>Contacter {vendor.name}</h3>
                  <button onClick={() => setMsgOpen(false)} style={{ color: C.steel }}>
                    <X size={18} />
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Votre nom *">
                      <input value={form.name} onChange={e => set("name", e.target.value)}
                        placeholder="Yasmine B." className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                        style={inputStyle} />
                    </Field>
                    <Field label="Téléphone">
                      <input value={form.phone} onChange={e => set("phone", e.target.value)}
                        placeholder="+212 6 00 00 00 00" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                        style={inputStyle} />
                    </Field>
                  </div>

                  <Field label="Votre email *">
                    <input type="email" value={form.email} onChange={e => set("email", e.target.value)}
                      placeholder="vous@exemple.com" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={inputStyle} />
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Type d'événement">
                      <select value={form.eventType} onChange={e => set("eventType", e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none appearance-none"
                        style={{ ...inputStyle, color: form.eventType ? C.white : C.steel }}>
                        <option value="">Choisir…</option>
                        {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </Field>
                    <Field label="Date prévue">
                      <input type="date" value={form.eventDate} onChange={e => set("eventDate", e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                        style={{ ...inputStyle, colorScheme: "light" }} />
                    </Field>
                  </div>

                  <Field label="Votre message *">
                    <textarea rows={3} value={form.message} onChange={e => set("message", e.target.value)}
                      placeholder="Décrivez votre événement, le nombre d'invités, vos attentes…"
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                      style={inputStyle} />
                  </Field>

                  {sendError && (
                    <p className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: `${C.terra}18`, color: C.terra }}>
                      {sendError}
                    </p>
                  )}

                  <div className="flex gap-3 mt-1">
                    <button onClick={() => setMsgOpen(false)}
                      className="flex-1 py-3 rounded-xl text-sm font-medium"
                      style={{ backgroundColor: C.anthracite, color: C.white }}>
                      Annuler
                    </button>
                    <button onClick={handleSend} disabled={sending}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm disabled:opacity-60"
                      style={{ backgroundColor: C.terra, color: "#fff" }}>
                      {sending ? <Loader2 size={15} className="animate-spin" /> : null}
                      {sending ? "Envoi…" : "Envoyer"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
