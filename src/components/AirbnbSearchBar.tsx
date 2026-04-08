"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import DateRangePicker from "@/components/DateRangePicker"
import { C } from "@/lib/colors"

const CITIES = ["Casablanca","Rabat","Marrakech","Fès","Tanger","Agadir","Meknès","Oujda","Kénitra","El Jadida","Mohammedia","Tétouan","Salé","Béni Mellal","Essaouira","Laâyoune","Dakhla","Settat","Nador","Ouarzazate","Safi","Tiznit","Khouribga","Errachidia","Guelmim","Berkane","Al Hoceima","Ifrane","Chefchaouen","Taroudant","Azrou","Figuig","Témara","Skhirat","Asilah","Ourika","Bouznika","Martil","Saïdia"]

type ActiveField = null | "ville" | "date" | "filtres"

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
]

export default function AirbnbSearchBar() {
  const router = useRouter()
  const [active, setActive] = useState<ActiveField>(null)
  const [hover, setHover] = useState<ActiveField>(null)
  const [ville, setVille] = useState("")
  const [category, setCategory] = useState("")
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const barRef = useRef<HTMLDivElement>(null)

  // Ferme le panel au clic extérieur
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (barRef.current && !barRef.current.contains(e.target as Node)) setActive(null)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  function handleSearch() {
    const params = new URLSearchParams()
    if (ville) params.set("city", ville)
    if (startDate) params.set("date", startDate.toISOString().split("T")[0])
    if (category) params.set("cat", category)
    router.push(`/explore?${params.toString()}`)
    setActive(null)
  }

  function formatDate(d: Date) {
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
  }

  const dateLabel = startDate
    ? endDate
      ? `${formatDate(startDate)} – ${formatDate(endDate)}`
      : formatDate(startDate)
    : ""

  const catLabel = category ? FILTER_CATS.find(f => f.slug === category)?.label ?? "" : ""

  // Compute per-field visual state
  function fieldStyle(field: ActiveField) {
    const isActive = active === field
    const isHovered = !active && hover === field
    const isDimmed = !!active && active !== field

    return {
      backgroundColor: isActive
        ? "#ffffff"
        : isHovered
        ? "#f2ece0"
        : isDimmed
        ? "#f5efe3"
        : "#ffffff",
      opacity: isDimmed ? 0.72 : 1,
      transform: isActive ? "scale(1.04)" : isDimmed ? "scale(0.98)" : "scale(1)",
      boxShadow: isActive
        ? "0 6px 28px rgba(0,0,0,0.18), 0 0 0 2px #C4532A"
        : isHovered
        ? "0 2px 12px rgba(0,0,0,0.10)"
        : "none",
      borderRadius: isActive ? "16px" : "0px",
      zIndex: isActive ? 10 : 1,
      transition: "all 0.2s cubic-bezier(0.25,0.46,0.45,0.94)",
    }
  }

  return (
    <div ref={barRef} className="relative w-full max-w-3xl mx-auto mt-8">
      {/* Barre principale */}
      <div
        className="flex items-stretch rounded-2xl overflow-visible"
        style={{
          backgroundColor: "#fff",
          boxShadow: active
            ? "0 12px 48px rgba(0,0,0,0.18)"
            : hover
            ? "0 4px 24px rgba(0,0,0,0.13)"
            : "0 2px 16px rgba(0,0,0,0.09)",
          border: "1px solid #e0d8c8",
          transition: "box-shadow 0.2s ease",
        }}
      >
        {/* Champ Ville */}
        <button
          className="flex-1 flex flex-col items-start px-5 py-3.5 rounded-l-2xl text-left relative"
          style={fieldStyle("ville")}
          onClick={() => setActive(a => a === "ville" ? null : "ville")}
          onMouseEnter={() => setHover("ville")}
          onMouseLeave={() => setHover(null)}
        >
          <span className="text-xs font-bold" style={{ color: C.white }}>Où</span>
          <span className="text-sm" style={{ color: ville ? C.white : C.steel }}>
            {ville || "Rechercher une ville"}
          </span>
        </button>

        <div style={{
          width: 1,
          backgroundColor: active || hover ? "transparent" : "#e0d8c8",
          alignSelf: "stretch",
          margin: "8px 0",
          transition: "background-color 0.2s ease",
        }} />

        {/* Champ Date */}
        <button
          className="flex-1 flex flex-col items-start px-5 py-3.5 text-left"
          style={fieldStyle("date")}
          onClick={() => setActive(a => a === "date" ? null : "date")}
          onMouseEnter={() => setHover("date")}
          onMouseLeave={() => setHover(null)}
        >
          <span className="text-xs font-bold" style={{ color: C.white }}>Quand</span>
          <span className="text-sm" style={{ color: dateLabel ? C.white : C.steel }}>
            {dateLabel || "Ajouter des dates"}
          </span>
        </button>

        <div style={{
          width: 1,
          backgroundColor: active || hover ? "transparent" : "#e0d8c8",
          alignSelf: "stretch",
          margin: "8px 0",
          transition: "background-color 0.2s ease",
        }} />

        {/* Champ Filtres */}
        <button
          className="flex-1 flex flex-col items-start px-5 py-3.5 text-left"
          style={fieldStyle("filtres")}
          onClick={() => setActive(a => a === "filtres" ? null : "filtres")}
          onMouseEnter={() => setHover("filtres")}
          onMouseLeave={() => setHover(null)}
        >
          <span className="text-xs font-bold" style={{ color: C.white }}>Filtres</span>
          <span className="text-sm" style={{ color: catLabel ? C.white : C.steel }}>
            {catLabel || "Catégorie"}
          </span>
        </button>

        {/* Bouton recherche */}
        <div className="flex items-center pr-2 pl-1">
          <button
            onClick={handleSearch}
            className="flex items-center gap-2 font-bold text-sm px-5 py-3 rounded-xl"
            style={{
              backgroundColor: C.terra,
              color: "#fff",
              transition: "transform 0.15s ease, opacity 0.15s ease",
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            <Search size={16} />
            <span className="hidden sm:inline">Rechercher</span>
          </button>
        </div>
      </div>

      {/* Panel Ville */}
      {active === "ville" && (
        <div
          className="absolute top-full left-0 mt-3 rounded-2xl p-4 z-50 w-72 max-h-72 overflow-y-auto"
          style={{ backgroundColor: "#fff", boxShadow: "0 8px 40px rgba(0,0,0,0.15)", border: "1px solid #e0d8c8" }}
        >
          <p className="text-xs font-bold mb-3" style={{ color: C.mist }}>VILLES POPULAIRES</p>
          <div className="flex flex-col gap-1">
            {CITIES.map(c => (
              <button key={c}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition hover:opacity-80"
                style={{
                  backgroundColor: ville === c ? `${C.terra}15` : "transparent",
                  color: C.white,
                  fontWeight: ville === c ? "700" : "400",
                }}
                onClick={() => { setVille(c); setActive("date") }}
              >
                <span className="text-base">📍</span> {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Panel Date — DateRangePicker */}
      {active === "date" && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onSelect={(start, end) => {
              setStartDate(start)
              setEndDate(end)
              if (end) setActive("filtres")
            }}
            onClear={() => { setStartDate(null); setEndDate(null) }}
            onApply={() => setActive("filtres")}
          />
        </div>
      )}

      {/* Panel Filtres */}
      {active === "filtres" && (
        <div
          className="absolute top-full right-0 mt-3 rounded-2xl p-4 z-50 w-80 max-h-96 overflow-y-auto"
          style={{ backgroundColor: "#fff", boxShadow: "0 8px 40px rgba(0,0,0,0.15)", border: "1px solid #e0d8c8" }}
        >
          <p className="text-xs font-bold mb-3" style={{ color: C.mist }}>CATÉGORIE DE PRESTATAIRE</p>
          <div className="grid grid-cols-2 gap-1.5">
            {FILTER_CATS.map(f => (
              <button key={f.slug}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-left transition"
                style={{
                  backgroundColor: category === f.slug ? `${C.terra}18` : "transparent",
                  color: C.white,
                  fontWeight: category === f.slug ? "700" : "400",
                  border: category === f.slug ? `1px solid ${C.terra}40` : "1px solid transparent",
                }}
                onClick={() => setCategory(c => c === f.slug ? "" : f.slug)}
              >
                <span>{f.icon}</span> {f.label}
              </button>
            ))}
          </div>
          <button onClick={handleSearch}
            className="w-full mt-4 py-3 rounded-xl text-sm font-bold transition hover:opacity-90"
            style={{ backgroundColor: C.terra, color: "#fff" }}>
            Rechercher
          </button>
        </div>
      )}
    </div>
  )
}
