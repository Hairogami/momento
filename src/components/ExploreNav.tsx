"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, MapPin, ChevronDown, SlidersHorizontal, X } from "lucide-react"
import NavAuthButtons from "./NavAuthButtons"
import { DarkModeToggle } from "./DarkModeToggle"
import { C } from "@/lib/colors"
import { useTheme } from "@/components/ThemeProvider"

const FILTER_CATS = [
  { slug: "musique-dj",     icon: "🎧", label: "Musique & DJ" },
  { slug: "traiteur",       icon: "🍽️", label: "Traiteur" },
  { slug: "photo-video",    icon: "📸", label: "Photo & Vidéo" },
  { slug: "lieu",           icon: "🏛️", label: "Lieu" },
  { slug: "decor-lumieres", icon: "✨", label: "Décor & Lumières" },
  { slug: "beaute",         icon: "💄", label: "Beauté" },
  { slug: "neggafa",        icon: "👑", label: "Neggafa" },
  { slug: "planification",  icon: "📋", label: "Planification" },
  { slug: "animation",      icon: "🎪", label: "Animation" },
  { slug: "transport",      icon: "🚗", label: "Transport" },
  { slug: "securite",       icon: "🛡️", label: "Sécurité" },
  { slug: "cadeaux",        icon: "🎁", label: "Cadeaux & Papeterie" },
]

const DEFAULT_CITIES = [
  "Toutes les villes","Casablanca","Rabat","Marrakech","Fès","Tanger","Meknès",
  "Agadir","Kénitra","El Jadida","Mohammedia","Oujda","Tétouan","Salé",
  "Béni Mellal","Essaouira","Khémisset","Laâyoune","Dakhla","Settat","Nador","Ouarzazate","Safi","Tiznit","Khouribga","Errachidia","Guelmim","Berkane","Al Hoceima","Ifrane","Chefchaouen","Taroudant","Azrou","Figuig","Témara","Skhirat","Asilah","Ourika","Bouznika","Martil","Saïdia",
]

export default function ExploreNav({
  search,
  onSearch,
  searchPlaceholder = "DJ, traiteur, photographe…",
  activeDate = "",
  onDateChange,
  activeCity = "Toutes les villes",
  onCityChange,
  sortBy = "rating",
  onSortChange,
  photoFilter = "all",
  onPhotoFilterChange,
  hasFilters = false,
  onReset,
  cities = DEFAULT_CITIES,
  activeSlug,
  totalCount,
  categoryCounts = {},
}: {
  search: string
  onSearch: (v: string) => void
  searchPlaceholder?: string
  activeDate?: string
  onDateChange?: (v: string) => void
  activeCity?: string
  onCityChange?: (v: string) => void
  sortBy?: string
  onSortChange?: (v: string) => void
  photoFilter?: "all" | "avec" | "sans"
  onPhotoFilterChange?: (v: "all" | "avec" | "sans") => void
  hasFilters?: boolean
  onReset?: () => void
  cities?: string[]
  activeSlug?: string
  totalCount?: number
  categoryCounts?: Record<string, number>
}) {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const [showFilterPanel, setShowFilterPanel] = useState(false)

  const filtersActive = activeCity !== "Toutes les villes" || photoFilter !== "all"

  return (
    <nav
      className="sticky top-0 z-40 border-b"
      style={{ backgroundColor: `${C.ink}F8`, backdropFilter: "blur(16px)", borderColor: C.anthracite }}
    >
      {/* ── 3-column grid row ── */}
      <div className="w-full px-4 sm:px-6 py-3 grid grid-cols-[auto_1fr_auto] sm:grid-cols-[1fr_auto_1fr] items-center gap-3">
        {/* Logo */}
        <Link href="/" className="justify-self-start shrink-0">
          <span className="font-bold tracking-[0.2em] uppercase text-sm" style={{ color: C.white }}>
            Momento
          </span>
        </Link>

        {/* Search pill — 66px Airbnb, 3 sections */}
        <div
          className="col-span-3 sm:col-span-1 sm:col-start-2 flex items-center rounded-full overflow-hidden min-w-0"
          style={{
            backgroundColor: C.ink,
            border: `1px solid ${C.anthracite}`,
            boxShadow: "rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.1) 0px 8px 24px 0px",
            height: 66,
            width: "100%",
            maxWidth: 760,
          }}
        >
          {/* Section 1 — Prestataire */}
          <label
            className="flex-1 flex flex-col justify-center px-6 cursor-text h-full"
            style={{ borderRight: `1px solid ${C.anthracite}` }}
          >
            <span className="text-[12px] font-medium leading-none mb-1" style={{ color: C.white }}>
              Prestataire
            </span>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={e => onSearch(e.target.value)}
              className="w-full bg-transparent outline-none leading-none"
              style={{ color: C.white, fontSize: 14 }}
            />
          </label>

          {/* Section 2 — Date */}
          {onDateChange && (
            <label
              className="hidden sm:flex flex-col justify-center px-6 cursor-pointer h-full"
              style={{ borderRight: `1px solid ${C.anthracite}` }}
            >
              <span className="text-[12px] font-medium leading-none mb-1" style={{ color: C.white }}>Date</span>
              <input
                type="date"
                value={activeDate}
                onChange={e => onDateChange(e.target.value)}
                className="bg-transparent outline-none cursor-pointer leading-none"
                style={{ color: activeDate ? C.white : C.steel, fontSize: 14, colorScheme: isDark ? "dark" : "light" }}
              />
            </label>
          )}

          {/* Section 3 — Filtres */}
          <button
            onClick={() => setShowFilterPanel(f => !f)}
            className="hidden sm:flex flex-col justify-center px-6 h-full text-left transition-colors"
            style={{ borderRight: `1px solid ${C.anthracite}`, backgroundColor: showFilterPanel ? C.dark : "transparent" }}
            aria-expanded={showFilterPanel}
          >
            <span className="text-[12px] font-medium leading-none mb-1" style={{ color: C.white }}>Filtres</span>
            <span className="leading-none" style={{ color: filtersActive ? C.white : C.steel, fontSize: 14 }}>
              {filtersActive ? (activeCity !== "Toutes les villes" ? activeCity : "Actifs") : "Ajouter des filtres"}
            </span>
          </button>

          {/* Search button */}
          <button
            onClick={() => setShowFilterPanel(false)}
            className="mx-2 shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:opacity-90"
            style={{ backgroundColor: C.terra, color: "#fff" }}
            aria-label="Appliquer la recherche"
          >
            <Search size={16} />
          </button>
        </div>

        {/* Auth + mobile filter */}
        <div className="justify-self-end flex items-center gap-2">
          <button
            onClick={() => setShowFilterPanel(f => !f)}
            className="sm:hidden shrink-0 w-12 h-12 rounded-full flex items-center justify-center border"
            style={{
              backgroundColor: showFilterPanel ? C.terra : C.dark,
              borderColor: showFilterPanel ? C.terra : C.anthracite,
              color: showFilterPanel ? "#fff" : C.white,
            }}
            aria-label={showFilterPanel ? "Fermer les filtres" : "Ouvrir les filtres"}
          >
            <SlidersHorizontal size={15} />
          </button>
          <DarkModeToggle />
          <NavAuthButtons />
        </div>
      </div>

      {/* ── Filter dropdown panel ── */}
      {showFilterPanel && (
        <div
          className="border-t px-4 sm:px-8 py-4 flex flex-wrap gap-4 items-center justify-center"
          style={{ borderColor: C.anthracite, backgroundColor: C.dark }}
        >
          {/* Ville */}
          {onCityChange && (
            <div className="flex items-center gap-2">
              <MapPin size={13} style={{ color: C.steel }} />
              <select
                value={activeCity}
                onChange={e => onCityChange(e.target.value)}
                className="py-1.5 px-3 rounded-lg text-xs outline-none cursor-pointer appearance-none"
                style={{ backgroundColor: C.anthracite, color: C.white }}
              >
                {cities.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          )}

          {/* Tri */}
          {onSortChange && (
            <div className="flex items-center gap-2">
              <ChevronDown size={13} style={{ color: C.steel }} />
              <select
                value={sortBy}
                onChange={e => onSortChange(e.target.value)}
                className="py-1.5 px-3 rounded-lg text-xs outline-none cursor-pointer appearance-none"
                style={{ backgroundColor: C.anthracite, color: C.white }}
              >
                <option value="rating">Mieux notés</option>
                <option value="name">Nom A–Z</option>
              </select>
            </div>
          )}

          {/* Photo filter */}
          {onPhotoFilterChange && (
            <div className="flex items-center gap-1 rounded-lg overflow-hidden" style={{ border: `1px solid ${C.anthracite}` }}>
              {(["all", "avec", "sans"] as const).map(v => (
                <button
                  key={v}
                  onClick={() => onPhotoFilterChange(v)}
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
          )}

          {/* Reset */}
          {(hasFilters || filtersActive) && onReset && (
            <button
              onClick={() => { onReset(); setShowFilterPanel(false) }}
              className="flex items-center gap-1 text-xs"
              style={{ color: C.terra }}
            >
              <X size={11} /> Tout effacer
            </button>
          )}
        </div>
      )}

      {/* ── Category icon bar ── */}
      <div
        className="border-t flex overflow-x-auto sm:flex-wrap sm:justify-center gap-0 px-2 sm:px-4 py-2 scrollbar-hide"
        style={{ borderColor: C.anthracite }}
      >
        <Link
          href="/explore"
          className="shrink-0 flex flex-col items-center gap-0.5 px-3 sm:px-4 py-2 rounded-xl transition-all hover:bg-black/5"
          style={{ minWidth: 64 }}
        >
          {totalCount !== undefined && (
            <span className="text-[11px] font-bold tabular-nums" style={{ color: C.terra }}>{totalCount}</span>
          )}
          <span className="text-2xl leading-none">🌟</span>
          <span className="text-[11px] font-semibold whitespace-nowrap" style={{ color: !activeSlug ? C.white : C.mist }}>Tout</span>
          {!activeSlug && <span className="block h-0.5 w-5 rounded-full mt-0.5" style={{ backgroundColor: C.terra }} />}
        </Link>

        {FILTER_CATS.map(cat => {
          const isActive = cat.slug === activeSlug
          const count = categoryCounts[cat.slug]
          return (
            <Link
              key={cat.slug}
              href={`/explore/${cat.slug}`}
              className="shrink-0 flex flex-col items-center gap-0.5 px-3 sm:px-4 py-2 rounded-xl transition-all hover:bg-black/5"
              style={{ minWidth: 64 }}
            >
              {count !== undefined && (
                <span className="text-[11px] font-bold tabular-nums" style={{ color: C.terra }}>{count}</span>
              )}
              <span className="text-2xl leading-none">{cat.icon}</span>
              <span className="text-[11px] font-semibold whitespace-nowrap" style={{ color: isActive ? C.white : C.mist }}>{cat.label}</span>
              {isActive && <span className="block h-0.5 w-5 rounded-full mt-0.5" style={{ backgroundColor: C.terra }} />}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
