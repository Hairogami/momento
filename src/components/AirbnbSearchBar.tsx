"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import DateRangePicker from "@/components/DateRangePicker"
import { C } from "@/lib/colors"
import { MOROCCAN_CITIES } from "@/lib/cities"

const CITIES = MOROCCAN_CITIES

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

  function fieldStyle(field: ActiveField) {
    const isActive  = active === field
    const isHovered = !active && hover === field
    const isDimmed  = !!active && active !== field

    return {
      backgroundColor: isActive
        ? "var(--bg)"
        : isHovered
        ? "var(--bg)"
        : "var(--bg-card)",
      opacity: isDimmed ? 0.6 : 1,
      transition: "all 0.2s cubic-bezier(0.25,0.46,0.45,0.94)",
      outline: isActive ? `1.5px solid ${C.terra}` : "none",
      outlineOffset: "-1px",
    }
  }

  return (
    <div ref={barRef} className="relative w-full max-w-3xl mx-auto mt-8">

      {/* ── Barre principale ── */}
      {/* Mobile: stack vertical full-width / Desktop md+: row inline */}
      <div
        className="flex flex-col md:flex-row md:items-stretch"
        style={{
          backgroundColor: "var(--bg-card)",
          border: `0.5px solid ${active ? C.terra : "var(--border)"}`,
          boxShadow: active
            ? `0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(var(--momento-terra-rgb),0.13)`
            : "0 4px 24px rgba(0,0,0,0.3)",
          transition: "border-color 0.2s, box-shadow 0.2s",
        }}
      >
        {/* Champ Ville */}
        <button
          className="flex-1 flex flex-col items-start px-5 py-3 md:py-4 text-left"
          style={fieldStyle("ville")}
          onClick={() => setActive(a => a === "ville" ? null : "ville")}
          onMouseEnter={() => setHover("ville")}
          onMouseLeave={() => setHover(null)}
        >
          <span className="text-xs font-semibold tracking-widest uppercase mb-0.5"
            style={{ color: C.steel, letterSpacing: "0.18em" }}>Où</span>
          <span className="text-sm" style={{ color: ville ? C.white : C.mist }}>
            {ville || "Ville"}
          </span>
        </button>

        {/* Séparateur — horizontal sur mobile, vertical sur desktop */}
        <div
          className="md:w-px md:h-auto md:my-2"
          style={{ height: "0.5px", width: "100%", backgroundColor: "var(--border)", alignSelf: "stretch" }}
        />

        {/* Champ Date */}
        <button
          className="flex-1 flex flex-col items-start px-5 py-3 md:py-4 text-left"
          style={fieldStyle("date")}
          onClick={() => setActive(a => a === "date" ? null : "date")}
          onMouseEnter={() => setHover("date")}
          onMouseLeave={() => setHover(null)}
        >
          <span className="text-xs font-semibold tracking-widest uppercase mb-0.5"
            style={{ color: C.steel, letterSpacing: "0.18em" }}>Quand</span>
          <span className="text-sm" style={{ color: dateLabel ? C.white : C.mist }}>
            {dateLabel || "Date"}
          </span>
        </button>

        <div
          className="md:w-px md:h-auto md:my-2"
          style={{ height: "0.5px", width: "100%", backgroundColor: "var(--border)", alignSelf: "stretch" }}
        />

        {/* Champ Filtres */}
        <button
          className="flex-1 flex flex-col items-start px-5 py-3 md:py-4 text-left"
          style={fieldStyle("filtres")}
          onClick={() => setActive(a => a === "filtres" ? null : "filtres")}
          onMouseEnter={() => setHover("filtres")}
          onMouseLeave={() => setHover(null)}
        >
          <span className="text-xs font-semibold tracking-widest uppercase mb-0.5"
            style={{ color: C.steel, letterSpacing: "0.18em" }}>Filtres</span>
          <span className="text-sm" style={{ color: catLabel ? C.white : C.mist }}>
            {catLabel || "Catégorie"}
          </span>
        </button>

        {/* Bouton recherche — full-width sur mobile, inline sur desktop */}
        <button
          onClick={handleSearch}
          aria-label="Rechercher"
          className="flex items-center justify-center gap-2 text-xs font-semibold tracking-widest uppercase px-5 py-4 transition-opacity hover:opacity-85"
          style={{
            backgroundColor: C.terra,
            color: "var(--bg)",
            letterSpacing: "0.16em",
            flexShrink: 0,
          }}
        >
          <Search size={15} />
          <span>Rechercher</span>
        </button>
      </div>

      {/* ── Panel Ville ── */}
      {active === "ville" && (
        <div
          className="absolute top-full left-0 mt-2 p-3 z-50 w-72 max-h-72 overflow-y-auto"
          style={{
            backgroundColor: "var(--bg-card)",
            border: `0.5px solid var(--border)`,
            boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
          }}
        >
          <p className="text-xs tracking-widest uppercase mb-3 px-2"
            style={{ color: C.steel, letterSpacing: "0.2em" }}>
            Villes populaires
          </p>
          <div className="flex flex-col">
            {CITIES.map(c => (
              <button key={c}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-left transition-colors"
                style={{
                  backgroundColor: ville === c ? "rgba(var(--momento-terra-rgb),0.13)" : "transparent",
                  color: ville === c ? C.white : C.mist,
                  borderLeft: ville === c ? `2px solid ${C.terra}` : "2px solid transparent",
                }}
                onMouseEnter={e => { if (ville !== c) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--bg)" }}
                onMouseLeave={e => { if (ville !== c) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent" }}
                onClick={() => { setVille(c); setActive("date") }}
              >
                <span className="text-sm">📍</span>
                <span>{c}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Panel Date ── */}
      {active === "date" && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50">
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

      {/* ── Panel Filtres ── */}
      {active === "filtres" && (
        <div
          className="absolute top-full right-0 mt-2 p-4 z-50 w-80"
          style={{
            backgroundColor: "var(--bg-card)",
            border: `0.5px solid var(--border)`,
            boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
          }}
        >
          <p className="text-xs tracking-widest uppercase mb-3"
            style={{ color: C.steel, letterSpacing: "0.2em" }}>
            Catégorie de prestataire
          </p>
          <div className="grid grid-cols-2 gap-1">
            {FILTER_CATS.map(f => (
              <button key={f.slug}
                className="flex items-center gap-2 px-3 py-2.5 text-sm text-left transition-colors"
                style={{
                  backgroundColor: category === f.slug ? "rgba(var(--momento-terra-rgb),0.13)" : "transparent",
                  color: category === f.slug ? C.white : C.mist,
                  border: `0.5px solid ${category === f.slug ? "rgba(var(--momento-terra-rgb),0.38)" : "transparent"}`,
                }}
                onMouseEnter={e => { if (category !== f.slug) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--bg)" }}
                onMouseLeave={e => { if (category !== f.slug) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent" }}
                onClick={() => setCategory(c => c === f.slug ? "" : f.slug)}
              >
                <span>{f.icon}</span>
                <span>{f.label}</span>
              </button>
            ))}
          </div>
          <button onClick={handleSearch}
            className="w-full mt-4 py-3 text-xs font-semibold tracking-widest uppercase transition-opacity hover:opacity-85"
            style={{ backgroundColor: C.terra, color: "var(--bg)", letterSpacing: "0.16em" }}>
            Rechercher
          </button>
        </div>
      )}
    </div>
  )
}
