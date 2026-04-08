"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Heart, Star, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import ExploreNav from "@/components/ExploreNav"
import { VENDOR_BASIC, VENDORS_WITH_PHOTO } from "@/lib/vendorData"
import { C } from "@/lib/colors"

// Category definitions
const CATEGORIES = [
  { slug: "musique-dj",      icon: "🎧", label: "Musique & DJ",          match: ["DJ", "Chanteur / chanteuse", "Orchestre", "Violoniste", "Dekka Marrakchia / Issawa"] },
  { slug: "traiteur",        icon: "🍽️", label: "Traiteur",              match: ["Traiteur", "Pâtissier / Cake designer", "Service de bar / mixologue"] },
  { slug: "photo-video",     icon: "📸", label: "Photo & Vidéo",         match: ["Photographe", "Vidéaste"] },
  { slug: "lieu",            icon: "🏛️", label: "Lieu",                  match: ["Lieu de réception", "Structures événementielles"] },
  { slug: "decor-lumieres",  icon: "✨", label: "Décor & Lumières",      match: ["Décorateur", "Fleuriste événementiel", "Créateur d'ambiance lumineuse"] },
  { slug: "beaute",          icon: "💄", label: "Beauté",                match: ["Hairstylist", "Makeup Artist", "Robes de mariés", "Spa / soins esthétiques"] },
  { slug: "neggafa",         icon: "👑", label: "Neggafa",               match: ["Neggafa"] },
  { slug: "planification",   icon: "📋", label: "Planification",         match: ["Event planner", "Wedding planner"] },
  { slug: "animation",       icon: "🎪", label: "Animation",             match: ["Animateur enfants", "Magicien", "Structures gonflables", "Jeux & animations enfants"] },
  { slug: "transport",       icon: "🚗", label: "Transport",             match: ["Location de voiture de mariage", "VTC / Transport invités"] },
  { slug: "securite",        icon: "🛡️", label: "Sécurité",             match: ["Sécurité événementielle"] },
  { slug: "cadeaux",         icon: "🎁", label: "Cadeaux & Papeterie",   match: ["Créateur de cadeaux invités", "Créateur de faire-part"] },
]

const CAT_IMAGES: Record<string, string> = {
  "DJ":                            "https://images.unsplash.com/photo-1571266028243-d220c6a18571?w=500&h=400&fit=crop&q=80",
  "Chanteur / chanteuse":          "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=500&h=400&fit=crop&q=80",
  "Orchestre":                     "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=400&fit=crop&q=80",
  "Violoniste":                    "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=500&h=400&fit=crop&q=80",
  "Dekka Marrakchia / Issawa":     "https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=500&h=400&fit=crop&q=80",
  "Traiteur":                      "https://images.unsplash.com/photo-1555244162-803834f70033?w=500&h=400&fit=crop&q=80",
  "Pâtissier / Cake designer":     "https://images.unsplash.com/photo-1535141192574-5f39a5847d0a?w=500&h=400&fit=crop&q=80",
  "Service de bar / mixologue":    "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=500&h=400&fit=crop&q=80",
  "Photographe":                   "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=500&h=400&fit=crop&q=80",
  "Vidéaste":                      "https://images.unsplash.com/photo-1601506521793-dc748fc80b67?w=500&h=400&fit=crop&q=80",
  "Lieu de réception":             "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&h=400&fit=crop&q=80",
  "Structures événementielles":    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=500&h=400&fit=crop&q=80",
  "Fleuriste événementiel":        "https://images.unsplash.com/photo-1487530811015-780b63e1b5a7?w=500&h=400&fit=crop&q=80",
  "Décorateur":                    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=500&h=400&fit=crop&q=80",
  "Créateur d'ambiance lumineuse": "https://images.unsplash.com/photo-1508997449629-303059a039c0?w=500&h=400&fit=crop&q=80",
  "Hairstylist":                   "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&h=400&fit=crop&q=80",
  "Makeup Artist":                 "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=500&h=400&fit=crop&q=80",
  "Neggafa":                       "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=500&h=400&fit=crop&q=80",
  "Robes de mariés":               "https://images.unsplash.com/photo-1594552072238-b8a33785b6cd?w=500&h=400&fit=crop&q=80",
  "Event planner":                 "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500&h=400&fit=crop&q=80",
  "Wedding planner":               "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500&h=400&fit=crop&q=80",
  "Location de voiture de mariage":"https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&h=400&fit=crop&q=80",
  "VTC / Transport invités":       "https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=500&h=400&fit=crop&q=80",
  "Sécurité événementielle":       "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=500&h=400&fit=crop&q=80",
  "Animateur enfants":             "https://images.unsplash.com/photo-1558171813-13b498fa0b47?w=500&h=400&fit=crop&q=80",
  "Magicien":                      "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=500&h=400&fit=crop&q=80",
  "Structures gonflables":         "https://images.unsplash.com/photo-1575783970733-1aaedde1db74?w=500&h=400&fit=crop&q=80",
  "Créateur de cadeaux invités":   "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&h=400&fit=crop&q=80",
  "Créateur de faire-part":        "https://images.unsplash.com/photo-1572862881989-53f82a89e668?w=500&h=400&fit=crop&q=80",
  "Spa / soins esthétiques":       "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500&h=400&fit=crop&q=80",
  "Jeux & animations enfants":     "https://images.unsplash.com/photo-1576515652033-4cb4ae1c67ed?w=500&h=400&fit=crop&q=80",
}

const VENDORS = Object.entries(VENDOR_BASIC).map(([id, v]) => ({ id, ...v }))

function VendorCard({ vendor, isFav, onToggleFav }: { vendor: typeof VENDORS[0]; isFav: boolean; onToggleFav: () => void }) {
  const [hovered, setHovered] = useState(false)
  const img = CAT_IMAGES[vendor.category] ?? "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&h=400&fit=crop&q=80"

  return (
    <Link href={`/vendor/${vendor.id}`} className="group flex flex-col gap-2 block" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="relative aspect-square rounded-2xl overflow-hidden">
        <img src={img} alt={vendor.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />

        {/* Heart */}
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation(); onToggleFav() }}
          className="absolute top-2.5 right-2.5 z-10 transition-transform hover:scale-110"
        >
          <Heart size={20} fill={isFav ? C.terra : "rgba(255,255,255,0.6)"} color={isFav ? C.terra : "#fff"} strokeWidth={2} />
        </button>

        {/* Rating badge if 5 */}
        {vendor.rating === 5 && (
          <div className="absolute top-2.5 left-2.5 bg-white/90 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1" style={{ color: C.white }}>
            ✦ Coup de cœur
          </div>
        )}

        {/* Hover: Contacter CTA */}
        <div
          className="absolute bottom-0 left-0 right-0 flex items-center justify-center pb-3 transition-opacity duration-200"
          style={{ opacity: hovered ? 1 : 0 }}
        >
          <span className="text-xs font-bold px-4 py-1.5 rounded-full" style={{ backgroundColor: C.terra, color: "#fff" }}>
            Voir & Contacter
          </span>
        </div>
      </div>

      <div className="px-0.5">
        <p className="text-xs font-bold leading-tight truncate" style={{ color: C.white }}>{vendor.name}</p>
        <p className="text-xs mt-0.5 truncate" style={{ color: C.mist }}>{vendor.category}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="flex items-center gap-0.5">
            <Star size={11} fill={C.terra} color={C.terra} />
            <span className="text-xs font-semibold" style={{ color: C.white }}>{vendor.rating}</span>
          </span>
          <span className="flex items-center gap-0.5">
            <MapPin size={10} style={{ color: C.steel }} />
            <span className="text-xs" style={{ color: C.steel }}>{vendor.city}, Maroc</span>
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function CategoryPage() {
  const params = useParams()
  const slug = params.category as string

  const category = CATEGORIES.find(c => c.slug === slug)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState("")
  const [activeCity, setActiveCity] = useState("Toutes les villes")
  const [activeDate, setActiveDate] = useState("")
  const [sortBy, setSortBy] = useState("rating")
  const [photoFilter, setPhotoFilter] = useState<"all" | "avec" | "sans">("all")

  const CITIES = ["Toutes les villes", "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Meknès", "Agadir", "Kénitra", "El Jadida", "Mohammedia", "Oujda", "Tétouan", "Salé", "Béni Mellal", "Essaouira", "Khémisset", "Laâyoune", "Dakhla", "Settat", "Nador", "Ouarzazate", "Safi", "Tiznit", "Khouribga", "Errachidia", "Guelmim", "Berkane", "Al Hoceima", "Ifrane", "Chefchaouen", "Taroudant", "Azrou", "Figuig", "Témara", "Skhirat", "Asilah", "Ourika", "Bouznika", "Martil", "Saïdia"]

  useEffect(() => {
    try {
      const raw = localStorage.getItem("momento_favorites")
      if (raw) setFavorites(new Set(JSON.parse(raw)))
    } catch { /* noop */ }
  }, [])

  function toggleFav(id: string) {
    setFavorites(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      localStorage.setItem("momento_favorites", JSON.stringify([...next]))
      return next
    })
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: C.ink }}>
        <div className="text-center">
          <p className="text-lg font-bold mb-4" style={{ color: C.white }}>Catégorie introuvable</p>
          <Link href="/explore" className="text-sm font-semibold" style={{ color: C.terra }}>← Retour aux prestataires</Link>
        </div>
      </div>
    )
  }

  const hasFilters = !!(search || activeCity !== "Toutes les villes" || activeDate || photoFilter !== "all")

  let filtered = VENDORS.filter(v => {
    if (!category.match.includes(v.category)) return false
    if (search && !v.name.toLowerCase().includes(search.toLowerCase()) && !v.category.toLowerCase().includes(search.toLowerCase())) return false
    if (activeCity !== "Toutes les villes" && v.city !== activeCity) return false
    if (photoFilter === "avec" && !VENDORS_WITH_PHOTO.has(v.id)) return false
    if (photoFilter === "sans" && VENDORS_WITH_PHOTO.has(v.id)) return false
    return true
  })
  if (sortBy === "rating") filtered = [...filtered].sort((a, b) => b.rating - a.rating)
  if (sortBy === "name") filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.ink, color: C.white }}>

      <ExploreNav
        search={search}
        onSearch={setSearch}
        searchPlaceholder={`Rechercher un·e ${category.label.toLowerCase()}…`}
        activeDate={activeDate}
        onDateChange={setActiveDate}
        activeCity={activeCity}
        onCityChange={setActiveCity}
        sortBy={sortBy}
        onSortChange={setSortBy}
        photoFilter={photoFilter}
        onPhotoFilterChange={setPhotoFilter}
        hasFilters={hasFilters}
        onReset={() => { setSearch(""); setActiveCity("Toutes les villes"); setActiveDate(""); setSortBy("rating"); setPhotoFilter("all") }}
        cities={CITIES}
        activeSlug={slug}
        totalCount={VENDORS.length}
        categoryCounts={Object.fromEntries(
          CATEGORIES.map(cat => [cat.slug, VENDORS.filter(v => cat.match.includes(v.category)).length])
        )}
      />

      <div className="w-full px-4 sm:px-8 py-8">

        {/* Hero header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Link href="/explore" className="flex items-center gap-1 text-sm transition-opacity hover:opacity-70" style={{ color: C.mist }}>
              <ChevronLeft size={15} /> Tous les prestataires
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{category.icon}</span>
            <div>
              <h1
                className="text-3xl sm:text-4xl font-normal italic"
                style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif", color: C.accent }}
              >
                {category.label}
              </h1>
              <p className="text-sm" style={{ color: C.mist }}>
                {filtered.length} prestataire{filtered.length !== 1 ? "s" : ""} au Maroc
              </p>
            </div>
          </div>
        </div>

        {/* City filter */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
          {CITIES.map(city => (
            <button
              key={city}
              onClick={() => setActiveCity(city)}
              className="shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all"
              style={{
                backgroundColor: activeCity === city ? C.white : C.dark,
                color: activeCity === city ? C.ink : C.mist,
                border: `1px solid ${activeCity === city ? C.white : C.anthracite}`,
              }}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Vendor grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg font-bold mb-2" style={{ color: C.white }}>Aucun résultat</p>
            <p className="text-sm" style={{ color: C.mist }}>Essayez de changer de ville ou de termes de recherche.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {filtered.map(vendor => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                isFav={favorites.has(vendor.id)}
                onToggleFav={() => toggleFav(vendor.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
