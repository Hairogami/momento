"use client"

import React, { useState, useMemo, useEffect, useRef, Suspense } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"
import { Search, MapPin, Star, X, ChevronDown, ChevronLeft, ChevronRight, Plus, Check, Heart, SlidersHorizontal, Map } from "lucide-react"
import { MomentoLogo } from "@/components/MomentoLogo"
import NavAuthButtons from "@/components/NavAuthButtons"
import { DarkModeToggle } from "@/components/DarkModeToggle"
import Footer from "@/components/Footer"
import { useSession } from "next-auth/react"
import { VENDOR_BASIC, VENDORS_WITH_PHOTO } from "@/lib/vendorData"
import { VENDOR_DETAILS } from "@/lib/vendorDetails"
import { C } from "@/lib/colors"

const ExploreMap = dynamic(() => import("@/components/ExploreMap"), { ssr: false })

// Category cover images (Unsplash)
const CAT_IMAGES: Record<string, string> = {
  "DJ":                            "https://images.unsplash.com/photo-1571266028243-d220c6a18571?w=400&h=300&fit=crop&q=75",
  "Chanteur / chanteuse":          "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=300&fit=crop&q=75",
  "Orchestre":                     "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop&q=75",
  "Violoniste":                    "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=300&fit=crop&q=75",
  "Dekka Marrakchia / Issawa":     "https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=400&h=300&fit=crop&q=75",
  "Traiteur":                      "https://images.unsplash.com/photo-1555244162-803834f70033?w=400&h=300&fit=crop&q=75",
  "Pâtissier / Cake designer":     "https://images.unsplash.com/photo-1535141192574-5f39a5847d0a?w=400&h=300&fit=crop&q=75",
  "Service de bar / mixologue":    "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400&h=300&fit=crop&q=75",
  "Photographe":                   "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&h=300&fit=crop&q=75",
  "Vidéaste":                      "https://images.unsplash.com/photo-1601506521793-dc748fc80b67?w=400&h=300&fit=crop&q=75",
  "Lieu de réception":             "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop&q=75",
  "Structures événementielles":    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=300&fit=crop&q=75",
  "Fleuriste événementiel":        "https://images.unsplash.com/photo-1487530811015-780b63e1b5a7?w=400&h=300&fit=crop&q=75",
  "Décorateur":                    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=300&fit=crop&q=75",
  "Créateur d'ambiance lumineuse": "https://images.unsplash.com/photo-1508997449629-303059a039c0?w=400&h=300&fit=crop&q=75",
  "Hairstylist":                   "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop&q=75",
  "Makeup Artist":                 "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=300&fit=crop&q=75",
  "Neggafa":                       "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&h=300&fit=crop&q=75",
  "Robes de mariés":               "https://images.unsplash.com/photo-1594552072238-b8a33785b6cd?w=400&h=300&fit=crop&q=75",
  "Event planner":                 "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop&q=75",
  "Wedding planner":               "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop&q=75",
  "Location de voiture de mariage":"https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=300&fit=crop&q=75",
  "VTC / Transport invités":       "https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=400&h=300&fit=crop&q=75",
  "Sécurité événementielle":       "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop&q=75",
  "Animateur enfants":             "https://images.unsplash.com/photo-1558171813-13b498fa0b47?w=400&h=300&fit=crop&q=75",
  "Magicien":                      "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=400&h=300&fit=crop&q=75",
  "Structures gonflables":         "https://images.unsplash.com/photo-1575783970733-1aaedde1db74?w=400&h=300&fit=crop&q=75",
  "Créateur de cadeaux invités":   "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&h=300&fit=crop&q=75",
  "Créateur de faire-part":        "https://images.unsplash.com/photo-1572862881989-53f82a89e668?w=400&h=300&fit=crop&q=75",
  "Spa / soins esthétiques":       "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop&q=75",
  "Jeux & animations enfants":     "https://images.unsplash.com/photo-1576515652033-4cb4ae1c67ed?w=400&h=300&fit=crop&q=75",
}

// Icônes par catégorie (fallback)
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
  "Structures événementielles": "⛺",
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
  "VTC / Transport invités": "🚌",
  "Sécurité événementielle": "🛡️",
  "Animateur enfants": "🎪",
  "Magicien": "🎩",
  "Structures gonflables": "🎈",
  "Créateur de cadeaux invités": "🎁",
  "Créateur de faire-part": "📜",
  "Spa / soins esthétiques": "🧖",
  "Jeux & animations enfants": "🎡",
}

// Mapping event type → recommended vendor categories
const EVENT_CATS: Record<string, string[]> = {
  "Mariage":       ["Photo & Vidéo", "Musique & DJ", "Traiteur", "Lieu", "Décor & Lumières", "Beauté", "Planification", "Transport", "Cadeaux & Papeterie"],
  "Anniversaire":  ["Traiteur", "Musique & DJ", "Animation", "Décor & Lumières"],
  "Soutenance":    ["Photo & Vidéo", "Traiteur"],
  "Baby shower":   ["Décor & Lumières", "Traiteur", "Animation"],
  "Fiançailles":   ["Photo & Vidéo", "Traiteur", "Décor & Lumières", "Beauté"],
  "Cérémonie":     ["Musique & DJ", "Photo & Vidéo", "Décor & Lumières"],
  "Fête privée":   ["Musique & DJ", "Traiteur", "Animation", "Décor & Lumières"],
  "Corporate":     ["Photo & Vidéo", "Traiteur", "Décor & Lumières", "Planification"],
}

// Catégories majeures avec sous-catégories
const MAJOR_CATS = [
  {
    slug: "musique-son",
    icon: "🎵",
    label: "Musique & Son",
    sub: ["DJ", "Chanteur / chanteuse", "Orchestre", "Violoniste", "Dekka Marrakchia / Issawa"],
  },
  {
    slug: "gastronomie",
    icon: "🍽️",
    label: "Gastronomie",
    sub: ["Traiteur", "Pâtissier / Cake designer", "Service de bar / mixologue"],
  },
  {
    slug: "photo-video",
    icon: "📸",
    label: "Photo & Vidéo",
    sub: ["Photographe", "Vidéaste"],
  },
  {
    slug: "lieu-espace",
    icon: "🏛️",
    label: "Lieu & Espace",
    sub: ["Lieu de réception", "Structures événementielles"],
  },
  {
    slug: "decor-ambiance",
    icon: "✨",
    label: "Décor & Ambiance",
    sub: ["Décorateur", "Fleuriste événementiel", "Créateur d'ambiance lumineuse"],
  },
  {
    slug: "beaute-style",
    icon: "💄",
    label: "Beauté & Style",
    sub: ["Hairstylist", "Makeup Artist", "Neggafa", "Robes de mariés", "Spa / soins esthétiques"],
  },
  {
    slug: "planification",
    icon: "📋",
    label: "Planification",
    sub: ["Event planner", "Wedding planner"],
  },
  {
    slug: "animation",
    icon: "🎪",
    label: "Animation",
    sub: ["Animateur enfants", "Magicien", "Structures gonflables", "Jeux & animations enfants"],
  },
  {
    slug: "transport",
    icon: "🚗",
    label: "Transport",
    sub: ["Location de voiture de mariage", "VTC / Transport invités"],
  },
  {
    slug: "securite",
    icon: "🛡️",
    label: "Sécurité",
    sub: ["Sécurité événementielle"],
  },
  {
    slug: "cadeaux-papeterie",
    icon: "🎁",
    label: "Cadeaux & Papeterie",
    sub: ["Créateur de cadeaux invités", "Créateur de faire-part"],
  },
]

// Flat FILTER_CATS kept for backward-compat (used in filtered logic)
const FILTER_CATS = MAJOR_CATS.map(m => ({ slug: m.slug, icon: m.icon, label: m.label, match: m.sub }))

const CITIES = ["Toutes les villes", "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Meknès", "Agadir", "Kénitra", "El Jadida", "Mohammedia", "Oujda", "Tétouan", "Salé", "Béni Mellal", "Essaouira", "Khémisset", "Laâyoune", "Dakhla", "Settat", "Nador", "Ouarzazate", "Safi", "Tiznit", "Khouribga", "Errachidia", "Guelmim", "Berkane", "Al Hoceima", "Ifrane", "Chefchaouen", "Taroudant", "Azrou", "Figuig", "Témara", "Skhirat", "Asilah", "Ourika", "Bouznika", "Martil", "Saïdia"]

// Fallback statique — utilisé si l'API échoue ou pendant le chargement
const VENDORS_FALLBACK = Object.entries(VENDOR_BASIC).map(([id, v]) => ({ id, ...v }))

// Alias pour la rétrocompatibilité du type
const VENDORS = VENDORS_FALLBACK

// Type partagé pour un vendor (compatible fallback + API)
type VendorEntry = { id: string; name: string; category: string; city: string; rating: number }

// Two extra ambiance photos used as slides 2 & 3 for every vendor
const EXTRA_PHOTOS = [
  "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&h=600&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=600&fit=crop&q=80",
]

function getVendorPhotos(vendorId: string, cat: string): string[] {
  const detail = VENDOR_DETAILS[vendorId]
  if (detail?.photos?.length) {
    // Use real vendor photos + fill to 3 if needed
    const photos = detail.photos.slice(0, 3)
    while (photos.length < 3) photos.push(CAT_IMAGES[cat] ?? EXTRA_PHOTOS[0])
    return photos
  }
  const main = CAT_IMAGES[cat]
  return [main ?? EXTRA_PHOTOS[0], EXTRA_PHOTOS[0], EXTRA_PHOTOS[1]]
}

// ─── VendorCard (Airbnb-style) ────────────────────────────────────
function VendorCard({
  v, isFav, onToggleFav, isAdded, onAdd, onCoupDeCoeur, showEventBtn,
}: {
  v: VendorEntry
  isFav: boolean
  onToggleFav: (e: React.MouseEvent) => void
  isAdded: boolean
  onAdd: () => void
  onCoupDeCoeur: (e: React.MouseEvent) => void
  showEventBtn: boolean
}) {
  const [imgIdx, setImgIdx] = useState(0)
  const [hovered, setHovered] = useState(false)
  const photos = getVendorPhotos(v.id, v.category)
  const isCoupDeCoeur = v.rating === 5

  function prev(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    setImgIdx(i => (i - 1 + photos.length) % photos.length)
  }
  function next(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    setImgIdx(i => (i + 1) % photos.length)
  }

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} className="group transition-transform duration-200 hover:-translate-y-0.5">

      {/* ── Image ── */}
      <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 ring-2 ring-transparent group-hover:ring-[var(--momento-terra)] transition-all duration-200">
        <Link href={`/vendor/${v.id}`} className="block w-full h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photos[imgIdx]} alt={v.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={e => { const t = e.currentTarget; if (!t.dataset.fallback) { t.dataset.fallback = "1"; t.src = "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&h=600&fit=crop&q=80" } }}
          />
        </Link>

        {/* Heart */}
        <button onClick={onToggleFav} className="absolute top-3 right-3 z-10 transition-transform hover:scale-110" aria-label="Favoris">
          <Heart size={22} fill={isFav ? C.terra : "rgba(0,0,0,0.25)"} stroke={isFav ? C.terra : "#fff"} strokeWidth={1.5} />
        </button>

        {/* Photo badge */}
        {VENDORS_WITH_PHOTO.has(v.id) && (
          <div className="absolute top-3 left-3 z-10 text-[10px] font-bold px-2 py-1 rounded-full"
            style={{ backgroundColor: "rgba(0,0,0,0.45)", color: "#fff" }}>
            📷
          </div>
        )}

        {/* Coup de cœur badge */}
        {isCoupDeCoeur && (
          <button onClick={onCoupDeCoeur}
            className="absolute bottom-3 left-3 z-10 text-xs font-bold px-3 py-1.5 rounded-full shadow-md transition-transform hover:scale-105"
            style={{ backgroundColor: C.dark, color: C.white, border: `1px solid ${C.anthracite}` }}>
            ✦ Coup de cœur
          </button>
        )}

        {/* Dot indicators */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10 pointer-events-none">
          {photos.map((_, i) => (
            <div key={i} className="rounded-full transition-all"
              style={{ width: i === imgIdx ? 6 : 5, height: i === imgIdx ? 6 : 5, backgroundColor: i === imgIdx ? "#fff" : "rgba(255,255,255,0.5)" }} />
          ))}
        </div>

        {/* Prev / Next arrows */}
        {hovered && imgIdx > 0 && (
          <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white shadow flex items-center justify-center">
            <ChevronLeft size={14} style={{ color: C.white }} />
          </button>
        )}
        {hovered && imgIdx < photos.length - 1 && (
          <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white shadow flex items-center justify-center">
            <ChevronRight size={14} style={{ color: C.white }} />
          </button>
        )}

        {/* Selected badge */}
        {isAdded && (
          <div className="absolute top-3 left-3 z-10 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1"
            style={{ backgroundColor: C.terra, color: "#fff" }}>
            <Check size={10} /> Sélectionné
          </div>
        )}
      </div>

      {/* ── Info ── */}
      <Link href={`/vendor/${v.id}`} className="block">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm leading-snug truncate" style={{ color: C.white }}>{v.name}</p>
            <p className="text-xs mt-0.5 truncate" style={{ color: C.mist }}>{v.category}</p>
            <p className="text-xs" style={{ color: C.steel }}>{v.city}</p>
          </div>
          {isCoupDeCoeur && (
            <div className="shrink-0 flex items-center gap-1 text-xs font-semibold mt-0.5" style={{ color: C.terra }}>
              <Star size={11} fill={C.terra} stroke="none" />
            </div>
          )}
        </div>
      </Link>

      {/* Add to event */}
      {showEventBtn && (
        <button onClick={onAdd}
          className="mt-2 w-full flex items-center justify-center gap-1 text-xs font-bold py-1.5 rounded-xl transition-all"
          style={{ backgroundColor: isAdded ? `${C.terra}20` : C.terra, color: isAdded ? C.terra : "#fff", border: isAdded ? `1px solid ${C.terra}` : "none" }}>
          {isAdded ? <><Check size={11} /> Ajouté</> : <><Plus size={11} /> Ajouter</>}
        </button>
      )}
    </div>
  )
}

type CurrentEvent = {
  id: string
  type: string
  name: string
  date: string
  guestCount: string
  budget: string
  location: string
}

function ExploreContent() {
  const searchParams = useSearchParams()
  const eventParam = searchParams.get("event") ?? ""
  const { data: session } = useSession()
  const user = session?.user ?? null
  const keySuffix = `_${user?.id ?? "guest"}`

  const [search, setSearch] = useState("")
  const categoryParam = searchParams.get("category") ?? ""
  const subParam = searchParams.get("sub") ?? ""
  // activeMajor = slug of major category; activeSub = specific sub-category label (or "")
  const [activeMajor, setActiveMajor] = useState(() => {
    // sub param takes priority — find which major contains this sub
    if (subParam) {
      const found = MAJOR_CATS.find(m => m.sub.includes(subParam))
      return found ? found.slug : ""
    }
    if (categoryParam) {
      const found = MAJOR_CATS.find(m => m.label === categoryParam || m.slug === categoryParam)
      return found ? found.slug : ""
    }
    const recommended = EVENT_CATS[eventParam]
    if (recommended) {
      const found = MAJOR_CATS.find(m => recommended.some(r => m.label.includes(r) || r.includes(m.label)))
      return found ? found.slug : ""
    }
    return ""
  })
  const [activeSub, setActiveSub] = useState(() => subParam || "")
  // For backward compat with filtering logic, derive activeGroup from activeMajor/activeSub
  const activeGroup = activeSub
    ? MAJOR_CATS.find(m => m.slug === activeMajor)?.label ?? ""
    : activeMajor
      ? MAJOR_CATS.find(m => m.slug === activeMajor)?.label ?? ""
      : ""
  const [activeCity, setActiveCity] = useState("Toutes les villes")
  const [activeDate, setActiveDate] = useState("")
  const dateInputRef = useRef<HTMLInputElement>(null)
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [sortBy, setSortBy] = useState("rating")
  const [photoFilter, setPhotoFilter] = useState<"all" | "avec" | "sans">("all")
  const [showMap, setShowMap] = useState(false)
  const [currentEvent, setCurrentEvent] = useState<CurrentEvent | null>(null)
  const [addedVendors, setAddedVendors] = useState<Set<string>>(new Set())
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [coupDeCoeurVendor, setCoupDeCoeurVendor] = useState<string | null>(null)
  const [toast, setToast] = useState("")
  // Vendors state: starts with static fallback, replaced by API data if available
  const [vendors, setVendors] = useState<VendorEntry[]>(VENDORS_FALLBACK)
  // DB counts — starts with static fallback counts, replaced by live DB counts
  const [counts, setCounts] = useState<{ total: number; byCategory: Record<string, number> }>(() => {
    const byCategory: Record<string, number> = {}
    for (const v of VENDORS_FALLBACK) {
      byCategory[v.category] = (byCategory[v.category] ?? 0) + 1
    }
    return { total: VENDORS_FALLBACK.length, byCategory }
  })

  useEffect(() => {
    const saved = localStorage.getItem(`momento_current_event${keySuffix}`)
    if (saved) { try { setCurrentEvent(JSON.parse(saved)) } catch {} }
    const savedVendors = localStorage.getItem(`momento_selected_vendors${keySuffix}`)
    if (savedVendors) {
      try {
        const list = JSON.parse(savedVendors) as { id: string }[]
        setAddedVendors(new Set(list.map(v => v.id)))
      } catch {}
    }
    const savedFavs = localStorage.getItem("momento_favorites")
    if (savedFavs) { try { setFavorites(new Set(JSON.parse(savedFavs))) } catch {} }
  }, [keySuffix])

  // Fetch live counts from DB — separate from vendor list to avoid pagination limits
  useEffect(() => {
    fetch("/api/vendors/counts")
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then((data: { total: number; byCategory: Record<string, number> }) => {
        if (data.total > 0) setCounts(data)
      })
      .catch(() => { /* silently keep static fallback counts */ })
  }, [])

  // Fetch vendors from API, fallback to static data on error
  useEffect(() => {
    fetch("/api/vendors?limit=1000")
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then((data: Array<{ slug: string; name: string; category: string; city?: string | null; rating?: number | null }>) => {
        if (Array.isArray(data) && data.length > 0) {
          setVendors(data.map(v => ({
            id: v.slug,
            name: v.name,
            category: v.category,
            city: v.city ?? "",
            rating: v.rating ?? 4,
          })))
        }
      })
      .catch(() => {
        // Silently keep fallback static data
      })
  }, [])

  function toggleFavorite(vendorId: string, e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(vendorId)) next.delete(vendorId)
      else next.add(vendorId)
      localStorage.setItem("momento_favorites", JSON.stringify([...next]))
      return next
    })
  }

  function addVendor(vendor: VendorEntry) {
    const saved = JSON.parse(localStorage.getItem(`momento_selected_vendors${keySuffix}`) ?? "[]")
    if (!saved.find((v: { id: string }) => v.id === vendor.id)) {
      saved.push(vendor)
      localStorage.setItem(`momento_selected_vendors${keySuffix}`, JSON.stringify(saved))
    }
    setAddedVendors(prev => new Set([...prev, vendor.id]))
    setToast(`${vendor.name} ajouté à votre événement !`)
    setTimeout(() => setToast(""), 2500)
  }

  const filtered = useMemo(() => {
    let list = vendors.filter(v => {
      if (search) {
        const q = search.toLowerCase()
        if (!v.name.toLowerCase().includes(q) && !v.category.toLowerCase().includes(q) && !v.city.toLowerCase().includes(q)) return false
      }
      if (activeSub) {
        // Filter by specific sub-category
        if (v.category !== activeSub) return false
      } else if (activeMajor) {
        // Filter by major category (all subs)
        const major = MAJOR_CATS.find(m => m.slug === activeMajor)
        if (major && !major.sub.includes(v.category)) return false
      }
      if (activeCity !== "Toutes les villes" && v.city !== activeCity) return false
      if (photoFilter === "avec" && !VENDORS_WITH_PHOTO.has(v.id)) return false
      if (photoFilter === "sans" && VENDORS_WITH_PHOTO.has(v.id)) return false
      return true
    })
    if (sortBy === "rating") list = [...list].sort((a, b) => b.rating - a.rating)
    if (sortBy === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [vendors, search, activeMajor, activeSub, activeCity, sortBy, photoFilter])

  const hasFilters = !!(search || activeMajor || activeSub || activeCity !== "Toutes les villes" || activeDate || photoFilter !== "all")

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.ink, color: C.white }}>

      {/* ── NAV (Airbnb-style) ── */}
      <nav className="sticky top-0 z-40 border-b" style={{ backgroundColor: `${C.ink}F8`, backdropFilter: "blur(16px)", borderColor: C.anthracite }}>
        <div className="w-full px-4 sm:px-6 py-3 grid items-center" style={{ gridTemplateColumns: "1fr auto 1fr" }}>

          <MomentoLogo iconSize={30} className="justify-self-start" />

          {/* ── Search pill — dimensions Airbnb ── */}
          <div
            className="flex items-center rounded-full overflow-hidden"
            style={{
              backgroundColor: C.ink,
              border: "1px solid #ddd",
              boxShadow: "rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.1) 0px 8px 24px 0px",
              height: 66,
              width: "100%",
              maxWidth: 760,
            }}
          >
            {/* Section 1 — Prestataire */}
            <label className="flex-1 flex flex-col justify-center px-6 cursor-text border-r h-full" style={{ borderColor: "#ddd" }}>
              <span className="text-[12px] font-medium leading-none mb-1" style={{ color: C.white }}>Prestataire</span>
              <input
                type="text" placeholder="DJ, traiteur, photographe…"
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full bg-transparent outline-none leading-none"
                style={{ color: C.white, fontSize: 14 }}
              />
            </label>

            {/* Section 2 — Date (custom styled) */}
            <div className="relative hidden sm:flex items-center border-r h-full" style={{ borderColor: "#ddd" }}>
              <button
                type="button"
                className="flex flex-col justify-center px-6 h-full cursor-pointer"
                onClick={() => dateInputRef.current?.showPicker?.()}
              >
                <span className="text-[12px] font-medium leading-none mb-1" style={{ color: C.white }}>Date</span>
                <span className="leading-none" style={{ color: activeDate ? C.white : C.steel, fontSize: 14 }}>
                  {activeDate
                    ? new Date(activeDate + "T00:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
                    : "Choisir une date"}
                </span>
              </button>
              <input
                ref={dateInputRef}
                type="date"
                value={activeDate}
                onChange={e => setActiveDate(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                style={{ colorScheme: "light" }}
              />
            </div>

            {/* Section 3 — Filtres */}
            <button
              onClick={() => setShowFilterPanel(f => !f)}
              className="hidden sm:flex flex-col justify-center px-6 h-full border-r text-left transition-colors"
              style={{ borderColor: "#ddd", backgroundColor: showFilterPanel ? C.dark : "transparent" }}>
              <span className="text-[12px] font-medium leading-none mb-1" style={{ color: C.white }}>Filtres</span>
              <span className="leading-none" style={{ color: activeSub || activeMajor || activeCity !== "Toutes les villes" ? C.white : C.steel, fontSize: 14 }}>
                {activeSub || (activeMajor ? MAJOR_CATS.find(m => m.slug === activeMajor)?.label : "") || (activeCity !== "Toutes les villes" ? activeCity : "Ajouter des filtres")}
              </span>
            </button>

            {/* Bouton recherche — 48×48 comme Airbnb */}
            <button
              onClick={() => setShowFilterPanel(false)}
              className="mx-2 shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:opacity-90"
              style={{ backgroundColor: C.terra, color: "#fff" }}>
              <Search size={16} />
            </button>
          </div>

          <div className="justify-self-end flex items-center gap-2">
            {/* Filtres mobile */}
            <button onClick={() => setShowFilterPanel(f => !f)}
              className="sm:hidden shrink-0 w-12 h-12 rounded-full flex items-center justify-center border"
              style={{ backgroundColor: showFilterPanel ? C.terra : C.dark, borderColor: showFilterPanel ? C.terra : C.anthracite, color: showFilterPanel ? "#fff" : C.white }}>
              <SlidersHorizontal size={15} />
            </button>
            <DarkModeToggle />
            <NavAuthButtons />
          </div>
        </div>

        {/* ── Filter dropdown panel ── */}
        {showFilterPanel && (
          <div className="border-t px-4 sm:px-8 py-4 flex flex-wrap gap-4 items-center justify-center" style={{ borderColor: C.anthracite, backgroundColor: C.dark }}>
            <div className="flex items-center gap-2">
              <MapPin size={13} style={{ color: C.steel }} />
              <select value={activeCity} onChange={e => setActiveCity(e.target.value)}
                className="py-1.5 px-3 rounded-lg text-xs outline-none cursor-pointer appearance-none"
                style={{ backgroundColor: C.anthracite, color: C.white }}>
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <ChevronDown size={13} style={{ color: C.steel }} />
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="py-1.5 px-3 rounded-lg text-xs outline-none cursor-pointer appearance-none"
                style={{ backgroundColor: C.anthracite, color: C.white }}>
                <option value="rating">Mieux notés</option>
                <option value="name">Nom A–Z</option>
              </select>
            </div>
            {/* Photo filter */}
            <div className="flex items-center gap-1 rounded-lg overflow-hidden" style={{ border: `1px solid ${C.anthracite}` }}>
              {(["all", "avec", "sans"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setPhotoFilter(v)}
                  className="px-3 py-1.5 text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: photoFilter === v ? C.white : "transparent",
                    color: photoFilter === v ? C.ink : C.mist,
                  }}
                >
                  {v === "all" ? "Toutes" : v === "avec" ? "📷 Avec photo" : "Sans photo"}
                </button>
              ))}
            </div>

            {hasFilters && (
              <button onClick={() => { setSearch(""); setActiveMajor(""); setActiveSub(""); setActiveCity("Toutes les villes"); setActiveDate(""); setPhotoFilter("all") }}
                className="flex items-center gap-1 text-xs" style={{ color: C.terra }}>
                <X size={11} /> Tout effacer
              </button>
            )}
          </div>
        )}

        {/* ── Barre de catégories majeures ── */}
        <div className="border-t overflow-x-auto scrollbar-hide" style={{ borderColor: C.anthracite }}>
          <div className="flex gap-0 px-2 sm:px-4 py-2 w-max mx-auto">
          {/* Tout */}
          <button
            onClick={() => { setActiveMajor(""); setActiveSub("") }}
            className="shrink-0 flex flex-col items-center gap-0.5 px-3 sm:px-4 py-2 rounded-xl transition-all hover:opacity-80 group"
            style={{ minWidth: 64 }}
          >
            <span className="text-[11px] font-bold tabular-nums" style={{ color: C.terra }}>{counts.total}</span>
            <span className="text-2xl leading-none">🌟</span>
            <span className="text-[11px] font-semibold whitespace-nowrap" style={{ color: !activeMajor ? C.white : C.mist }}>Tout</span>
            {!activeMajor && <span className="block h-0.5 w-4 rounded-full mt-0.5" style={{ backgroundColor: C.terra }} />}
          </button>

          {MAJOR_CATS.map(cat => {
            const count = cat.sub.reduce((sum, sub) => sum + (counts.byCategory[sub] ?? 0), 0)
            const isActive = activeMajor === cat.slug
            return (
              <button
                key={cat.slug}
                onClick={() => { setActiveMajor(isActive ? "" : cat.slug); setActiveSub("") }}
                className="shrink-0 flex flex-col items-center gap-0.5 px-3 sm:px-4 py-2 rounded-xl transition-all hover:opacity-80 group"
                style={{ minWidth: 64 }}
              >
                <span className="text-[11px] font-bold tabular-nums" style={{ color: C.terra }}>{count}</span>
                <span className="text-2xl leading-none">{cat.icon}</span>
                <span className="text-[11px] font-semibold whitespace-nowrap" style={{ color: isActive ? C.white : C.mist }}>{cat.label}</span>
                {isActive && <span className="block h-0.5 w-4 rounded-full mt-0.5" style={{ backgroundColor: C.terra }} />}
              </button>
            )
          })}
          </div>
        </div>

        {/* ── Sous-catégories (pills) — apparaît quand une majeure est active ── */}
        {activeMajor && (() => {
          const major = MAJOR_CATS.find(m => m.slug === activeMajor)
          if (!major || major.sub.length <= 1) return null
          return (
            <div className="border-t flex overflow-x-auto gap-2 px-4 py-2.5 scrollbar-hide" style={{ borderColor: C.anthracite, backgroundColor: `${C.dark}99` }}>
              <button
                onClick={() => setActiveSub("")}
                className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
                style={{
                  backgroundColor: !activeSub ? C.terra : C.anthracite,
                  color: !activeSub ? "#fff" : C.mist,
                  border: `1px solid ${!activeSub ? C.terra : C.steel}`,
                }}
              >
                Tous ({major.sub.reduce((sum, sub) => sum + (counts.byCategory[sub] ?? 0), 0)})
              </button>
              {major.sub.map(sub => {
                const count = counts.byCategory[sub] ?? 0
                const isActive = activeSub === sub
                return (
                  <button
                    key={sub}
                    onClick={() => setActiveSub(isActive ? "" : sub)}
                    className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all whitespace-nowrap"
                    style={{
                      backgroundColor: isActive ? C.terra : C.anthracite,
                      color: isActive ? "#fff" : C.mist,
                      border: `1px solid ${isActive ? C.terra : C.steel}`,
                    }}
                  >
                    {CAT_ICONS[sub] ?? ""} {sub} ({count})
                  </button>
                )
              })}
            </div>
          )
        })()}
      </nav>

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg"
          style={{ backgroundColor: C.white, color: C.ink }}>
          <Check size={14} className="inline mr-2" style={{ color: C.terra }} />{toast}
        </div>
      )}

      {/* ── Coup de cœur popup ── */}
      {coupDeCoeurVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setCoupDeCoeurVendor(null)}>
          <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.45)" }} />
          <div className="relative rounded-3xl p-8 max-w-xs w-full shadow-2xl text-center"
            style={{ backgroundColor: C.ink, border: `1px solid ${C.anthracite}` }}
            onClick={e => e.stopPropagation()}>
            <button onClick={() => setCoupDeCoeurVendor(null)} className="absolute top-4 right-4">
              <X size={18} style={{ color: C.steel }} />
            </button>
            <p className="text-3xl mb-3">✦</p>
            <h3 className="font-bold text-lg mb-2" style={{ color: C.white }}>Coup de cœur</h3>
            <p className="text-sm leading-relaxed mb-4" style={{ color: C.mist }}>
              <span className="font-semibold" style={{ color: C.terra }}>{coupDeCoeurVendor}</span>{" "}
              est plébiscité par notre communauté. Note parfaite, prestations unanimement saluées.
            </p>
            <div className="flex justify-center gap-1">
              {[1,2,3,4,5].map(i => <Star key={i} size={16} fill={C.terra} stroke="none" />)}
            </div>
          </div>
        </div>
      )}

      <div className="w-full px-4 sm:px-8 py-6 sm:py-8">

        {/* ── Event context banner ── */}
        {(currentEvent || eventParam) && (
          <div className="rounded-2xl px-5 py-4 mb-6 flex flex-wrap items-center justify-between gap-3"
            style={{ backgroundColor: `${C.terra}18`, border: `1.5px solid ${C.terra}40` }}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: C.terra }}>
                🎯 Vous planifiez votre {currentEvent?.type ?? eventParam}
              </p>
              <p className="text-sm font-bold" style={{ color: C.white }}>
                {currentEvent?.name ?? `Mon ${eventParam}`}
                {currentEvent?.date && <span className="font-normal ml-2" style={{ color: C.mist }}>·{" "}
                  {new Date(currentEvent.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </span>}
                {currentEvent?.location && <span className="font-normal ml-2" style={{ color: C.mist }}>· {currentEvent.location}</span>}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {addedVendors.size > 0 && (
                <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ backgroundColor: C.terra, color: "#fff" }}>
                  {addedVendors.size} prestataire{addedVendors.size > 1 ? "s" : ""} sélectionné{addedVendors.size > 1 ? "s" : ""}
                </span>
              )}
              <Link href="/dashboard" className="text-xs font-semibold px-3 py-1.5 rounded-xl"
                style={{ backgroundColor: C.dark, color: C.white, border: `1px solid ${C.anthracite}` }}>
                Voir mon projet →
              </Link>
            </div>
          </div>
        )}

        {/* Results count + Liste/Carte toggle pill */}
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <p className="text-sm" style={{ color: C.mist }}>
            <span className="font-bold text-base sm:text-lg" style={{ color: C.white }}>{filtered.length}</span>
            {" "}prestataire{filtered.length > 1 ? "s" : ""}
            {activeCity !== "Toutes les villes" && <span> à <strong style={{ color: C.white }}>{activeCity}</strong></span>}
          </p>
          {/* Toggle pill Liste / Carte */}
          <div
            className="flex items-center rounded-xl overflow-hidden text-xs font-semibold"
            style={{ border: `1px solid ${C.anthracite}`, backgroundColor: C.dark }}
          >
            <button
              onClick={() => setShowMap(false)}
              className="flex items-center gap-1.5 px-3 py-2 transition-all"
              style={{
                backgroundColor: !showMap ? C.terra : "transparent",
                color: !showMap ? "#fff" : C.mist,
              }}
            >
              <SlidersHorizontal size={12} />
              Liste
            </button>
            <button
              onClick={() => setShowMap(true)}
              className="flex items-center gap-1.5 px-3 py-2 transition-all"
              style={{
                backgroundColor: showMap ? C.terra : "transparent",
                color: showMap ? "#fff" : C.mist,
              }}
            >
              <Map size={12} />
              Carte
            </button>
          </div>
        </div>

        {/* ── Carte exclusive (remplace la grille) ── */}
        {showMap ? (
          <div
            className="rounded-2xl overflow-hidden mb-4"
            style={{ border: `1px solid ${C.anthracite}`, height: "clamp(360px, 60vh, 600px)" }}
          >
            <ExploreMap
              key={activeCity + activeGroup + filtered.length}
              vendors={filtered}
              activeCity={activeCity}
              activeCategory={activeGroup}
              onCityClick={city => { setActiveCity(city); setShowMap(false) }}
            />
            <p className="text-xs px-4 py-2 flex items-center gap-1.5" style={{ backgroundColor: C.dark, color: C.mist }}>
              <MapPin size={11} style={{ color: C.terra }} />
              {activeGroup ? "Pins colorés par catégorie — cliquez pour voir le profil" : "Cliquez sur un cluster pour filtrer par ville"}
            </p>
          </div>
        ) : (
          /* ── Grille liste ── */
          filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">🔍</p>
              <p className="font-bold text-lg mb-2" style={{ color: C.white }}>Aucun résultat</p>
              <p className="text-sm mb-6" style={{ color: C.mist }}>Essayez d&apos;autres filtres.</p>
              <button onClick={() => { setSearch(""); setActiveMajor(""); setActiveSub(""); setActiveCity("Toutes les villes"); setActiveDate("") }}
                className="px-6 py-3 rounded-xl font-bold text-sm" style={{ backgroundColor: C.terra, color: "#fff" }}>
                Réinitialiser
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
              {filtered.map(v => (
                <VendorCard
                  key={v.id}
                  v={v}
                  isFav={favorites.has(v.id)}
                  onToggleFav={e => toggleFavorite(v.id, e)}
                  isAdded={addedVendors.has(v.id)}
                  onAdd={() => addVendor(v)}
                  onCoupDeCoeur={e => { e.preventDefault(); e.stopPropagation(); setCoupDeCoeurVendor(v.name) }}
                  showEventBtn={!!(currentEvent || eventParam)}
                />
              ))}
            </div>
          )
        )}

        {/* Footer note */}
        <p className="text-center text-xs mt-12 pb-4" style={{ color: C.steel }}>
          {counts.total} prestataires référencés · 41+ villes · 31 catégories · Maroc
        </p>
      </div>
      <Footer />
    </div>
  )
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ backgroundColor: "#F5EDD6" }} />}>
      <ExploreContent />
    </Suspense>
  )
}
