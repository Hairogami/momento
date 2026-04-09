"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Heart, Star, MapPin } from "lucide-react"
import { C } from "@/lib/colors"

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

const VENDORS = [
  { id: "prestige-photo",           name: "PRESTIGE PHOTO",            category: "Photographe",                   city: "Rabat",        rating: 5 },
  { id: "touzani-bola-bola-royal",  name: "TOUZANI BOLA BOLA ROYAL",   category: "Dekka Marrakchia / Issawa",     city: "Rabat",        rating: 5 },
  { id: "dj-azz",                   name: "DJ AZZ",                    category: "DJ",                            city: "Marrakech",    rating: 4 },
  { id: "dj-c4",                    name: "DJ C4",                     category: "DJ",                            city: "Marrakech",    rating: 4 },
  { id: "orchestre-kilani",         name: "ORCHESTRE KILANI",          category: "Chanteur / chanteuse",          city: "Agadir",       rating: 4 },
  { id: "abboudi",                  name: "ABBOUDI",                   category: "Chanteur / chanteuse",          city: "Casablanca",   rating: 4 },
  { id: "afrah-darna-prestige",     name: "AFRAH DARNA PRESTIGE",      category: "Traiteur",                      city: "Marrakech",    rating: 4 },
  { id: "afrah-palace-fes",         name: "AFRAH PALACE FES",          category: "Traiteur",                      city: "Fès",          rating: 4 },
  { id: "afrah-ghandi",             name: "AFRAH GHANDI",              category: "Lieu de réception",             city: "Casablanca",   rating: 4 },
  { id: "california-palace",        name: "CALIFORNIA PALACE",         category: "Lieu de réception",             city: "Tanger",       rating: 4 },
  { id: "flawless-photo",           name: "FLAWLESS PHOTO",            category: "Photographe",                   city: "Rabat",        rating: 4 },
  { id: "la-perle-events",          name: "LA PERLE EVENTS",           category: "Event planner",                 city: "Marrakech",    rating: 4 },
  { id: "ahlam-mua",                name: "AHLAM MUA",                 category: "Makeup Artist",                 city: "Casablanca",   rating: 4 },
  { id: "amine-castor",             name: "AMINE CASTOR",              category: "Makeup Artist",                 city: "Rabat",        rating: 4 },
  { id: "alhaja-saadia",            name: "ALHAJA SAADIA",             category: "Neggafa",                       city: "Marrakech",    rating: 4 },
  { id: "arousati",                 name: "AROUSATI",                  category: "Neggafa",                       city: "Kénitra",      rating: 4 },
  { id: "jawad-asmar",              name: "JAWAD ASMAR",               category: "Orchestre",                     city: "Rabat",        rating: 4 },
  { id: "mounir-tebbaa",            name: "MOUNIR TEBBAA",             category: "Orchestre",                     city: "Rabat",        rating: 4 },
  { id: "cas-consult",              name: "CAS CONSULT",               category: "Fleuriste événementiel",        city: "Marrakech",    rating: 4 },
  { id: "flowers-meknes",           name: "FLOWERS MEKNES",            category: "Fleuriste événementiel",        city: "Meknès",       rating: 4 },
  { id: "afrah-riad",               name: "AFRAH RIAD",                category: "Pâtissier / Cake designer",     city: "Rabat",        rating: 4 },
  { id: "afrah-nas-fes",            name: "AFRAH NAS FES",             category: "Pâtissier / Cake designer",     city: "Tanger",       rating: 4 },
  { id: "abrievents",               name: "ABRIEVENTS",                category: "Décorateur",                    city: "Rabat",        rating: 4 },
  { id: "decoration-by-lamiae",     name: "DECORATION BY LAMIAE",      category: "Décorateur",                    city: "Fès",          rating: 4 },
  { id: "abidi-events",             name: "ABIDI EVENTS",              category: "Créateur d'ambiance lumineuse", city: "Rabat",        rating: 4 },
  { id: "celeste",                  name: "CELESTE",                   category: "Robes de mariés",               city: "Rabat",        rating: 4 },
  { id: "dentelle-et-soie",         name: "DENTELLE ET SOIE",          category: "Robes de mariés",               city: "Casablanca",   rating: 4 },
  { id: "cocktails-wedding",        name: "COCKTAILS WEDDING",         category: "Service de bar / mixologue",    city: "Rabat",        rating: 4 },
  { id: "allo-limousine",           name: "ALLO LIMOUSINE",            category: "Location de voiture de mariage",city: "Rabat",        rating: 4 },
  { id: "diaa-lahmamsi",            name: "DIAA LAHMAMSI",             category: "Wedding planner",               city: "Rabat",        rating: 4 },
  { id: "anass-hairestyle",         name: "ANASS HAIRESTYLE",          category: "Hairstylist",                   city: "Casablanca",   rating: 4 },
  { id: "aouatif-ghraib",           name: "AOUATIF GHRAIB",            category: "Hairstylist",                   city: "Casablanca",   rating: 4 },
  { id: "crystal-photo",            name: "CRYSTAL PHOTO",             category: "Vidéaste",                      city: "Rabat",        rating: 4 },
  { id: "violoniste-hassan",        name: "VIOLONISTE HASSAN",         category: "Violoniste",                    city: "Casablanca",   rating: 4 },
  { id: "pidho-le-magicien",        name: "PIDHO LE MAGICIEN",         category: "Magicien",                      city: "Rabat",        rating: 4 },
  { id: "npp2-security",            name: "NPP 2 SECURITY",            category: "Sécurité événementielle",       city: "Marrakech",    rating: 4 },
  { id: "gonflable-maroc",          name: "GONFLABLE MAROC OFFICIAL",  category: "Structures gonflables",         city: "Casablanca",   rating: 4 },
  { id: "karim-groupe",             name: "KARIM GROUPE MAROC",        category: "Animateur enfants",             city: "Casablanca",   rating: 4 },
  { id: "chef-oussama",             name: "CHEF OUSSAMA ELYASMINE",    category: "Créateur de cadeaux invités",   city: "Rabat",        rating: 4 },
  { id: "mocktail-land",            name: "MOCKTAIL LAND",             category: "Service de bar / mixologue",    city: "Casablanca",   rating: 4 },
  { id: "invitation-by-loubna",     name: "INVITATION BY LOUBNA",      category: "Créateur de faire-part",        city: "Casablanca",   rating: 4 },
  { id: "papeterie-nadia",          name: "PAPETERIE NADIA",           category: "Créateur de faire-part",        city: "Rabat",        rating: 4 },
  { id: "vtc-star-maroc",           name: "VTC STAR MAROC",            category: "VTC / Transport invités",       city: "Casablanca",   rating: 4 },
  { id: "prestige-auto-mariage",    name: "PRESTIGE AUTO MARIAGE",     category: "Location de voiture de mariage",city: "Casablanca",   rating: 4 },
  { id: "el-merini",                name: "EL MERINI",                 category: "DJ",                            city: "Rabat",        rating: 4 },
  { id: "dj-yomix",                 name: "DJ YOMIX",                  category: "DJ",                            city: "Casablanca",   rating: 4 },
  { id: "dj-ismail",                name: "DJ ISMAIL",                 category: "DJ",                            city: "Casablanca",   rating: 4 },
  { id: "dj-alae",                  name: "DJ ALAE",                   category: "DJ",                            city: "Meknès",       rating: 4 },
  { id: "dj-reda",                  name: "DJ REDA",                   category: "DJ",                            city: "Casablanca",   rating: 4 },
  { id: "dj-yas",                   name: "DJ YAS",                    category: "DJ",                            city: "Rabat",        rating: 4 },
  { id: "zouhair-haraj",            name: "ZOUHAIR HARAJ",             category: "Photographe",                   city: "Casablanca",   rating: 4 },
  { id: "photo-tazi",               name: "PHOTO TAZI",                category: "Photographe",                   city: "Rabat",        rating: 4 },
  { id: "yassine-assouari",         name: "YASSINE ASSOUARI",          category: "Photographe",                   city: "Casablanca",   rating: 4 },
  { id: "tazi-palace-rabat",        name: "TAZI PALACE RABAT",         category: "Lieu de réception",             city: "Rabat",        rating: 4 },
  { id: "pavillon-des-reves",       name: "PAVILLON DES RÊVES",        category: "Lieu de réception",             city: "Casablanca",   rating: 4 },
  { id: "palais-blanc",             name: "PALAIS BLANC",              category: "Lieu de réception",             city: "Casablanca",   rating: 4 },
  { id: "fleur-de-sel",             name: "FLEUR DE SEL",              category: "Fleuriste événementiel",        city: "Marrakech",    rating: 4 },
  { id: "the-bloom-room",           name: "THE BLOOM ROOM",            category: "Fleuriste événementiel",        city: "Casablanca",   rating: 4 },
  { id: "hicham-salim-events",      name: "HICHAM SALIM EVENTS",       category: "Décorateur",                    city: "Casablanca",   rating: 4 },
  { id: "wedding-rabat",            name: "WEDDING RABAT",             category: "Event planner",                 city: "Rabat",        rating: 4 },
  { id: "philocaly-weddings",       name: "PHILOCALY WEDDINGS",        category: "Wedding planner",               city: "Marrakech",    rating: 4 },
  { id: "myrose-events",            name: "MYROSE EVENTS",             category: "Wedding planner",               city: "Casablanca",   rating: 4 },
  { id: "asmaa-hairestyle",         name: "ASMAA HAIRESTYLE",          category: "Hairstylist",                   city: "Casablanca",   rating: 4 },
]

const VENDOR_MAP = new Map(VENDORS.map(v => [v.id, v]))

export default function FavoritesPage() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem("momento_favorites")
      setFavoriteIds(raw ? JSON.parse(raw) : [])
    } catch {
      setFavoriteIds([])
    }
    setLoaded(true)
  }, [])

  function removeFavorite(id: string) {
    const next = favoriteIds.filter(f => f !== id)
    setFavoriteIds(next)
    localStorage.setItem("momento_favorites", JSON.stringify(next))
  }

  const favorites = favoriteIds
    .map(id => VENDOR_MAP.get(id))
    .filter(Boolean) as typeof VENDORS

  return (
    <div className="px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-2xl font-bold" style={{ color: C.white }}>Mes favoris</h1>
        {loaded && favorites.length > 0 && (
          <span className="text-sm px-2.5 py-1 rounded-full font-semibold"
            style={{ backgroundColor: `${C.terra}20`, color: C.terra }}>
            {favorites.length}
          </span>
        )}
      </div>

      {!loaded ? null : favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-5">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: C.dark }}>
            <Heart size={32} style={{ color: C.anthracite }} />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold mb-1" style={{ color: C.white }}>Aucun favori pour l&apos;instant</p>
            <p className="text-sm" style={{ color: C.mist }}>Cliquez sur le ♡ d&apos;un prestataire pour l&apos;ajouter ici.</p>
          </div>
          <Link
            href="/explore"
            className="text-sm font-bold px-6 py-3 rounded-xl transition-all hover:opacity-90"
            style={{ backgroundColor: C.terra, color: "#fff" }}>
            Explorer les prestataires
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {favorites.map(vendor => {
            const img = CAT_IMAGES[vendor.category] ?? "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop&q=75"
            return (
              <div key={vendor.id} className="group relative flex flex-col gap-2">
                <div className="relative aspect-square rounded-2xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={vendor.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <button
                    onClick={() => removeFavorite(vendor.id)}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                    style={{ backgroundColor: "rgba(255,255,255,0.9)" }}
                    title="Retirer des favoris"
                  >
                    <Heart size={16} fill={C.terra} color={C.terra} />
                  </button>
                </div>
                <div className="px-0.5">
                  <Link href={`/vendor/${vendor.id}`}>
                    <p className="text-xs font-bold leading-tight truncate hover:opacity-80" style={{ color: C.white }}>{vendor.name}</p>
                  </Link>
                  <p className="text-xs mt-0.5 truncate" style={{ color: C.mist }}>{vendor.category}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-0.5">
                      <Star size={11} fill={C.terra} color={C.terra} />
                      <span className="text-xs font-semibold" style={{ color: C.white }}>{vendor.rating}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <MapPin size={10} style={{ color: C.steel }} />
                      <span className="text-xs" style={{ color: C.steel }}>{vendor.city}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
