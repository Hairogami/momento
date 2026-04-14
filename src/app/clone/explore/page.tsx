"use client"
import { useState, useEffect, useMemo } from "react"
import AntNav from "@/components/clone/AntNav"
import AntVendorCard from "@/components/clone/AntVendorCard"
import { VENDOR_BASIC, VENDOR_COUNT } from "@/lib/vendorData"

// ── Types ────────────────────────────────────────────────────────────────────
type VendorEntry = { id: string; name: string; category: string; city: string; rating: number }

// ── Category filter groups ───────────────────────────────────────────────────
const MAJOR_CATS = [
  { label: "Tous",           emoji: "✦" },
  { label: "Musique & Son",  emoji: "🎵" },
  { label: "Photo & Vidéo",  emoji: "📸" },
  { label: "Gastronomie",    emoji: "🍽️" },
  { label: "Décor & Ambiance", emoji: "✨" },
  { label: "Beauté & Style", emoji: "💄" },
  { label: "Planification",  emoji: "📋" },
  { label: "Animation",      emoji: "🎪" },
  { label: "Lieu & Espace",  emoji: "🏛️" },
  { label: "Transport",      emoji: "🚗" },
]

const MAJOR_KW: Record<string, string[]> = {
  "Musique & Son":    ["dj", "musique", "chanteur", "orchestre", "violon", "dekka", "issawa", "gnawa", "groupe", "musicien"],
  "Photo & Vidéo":   ["photo", "vid", "cinéma", "film"],
  "Gastronomie":     ["traiteur", "pâtissier", "bar", "mixologue", "chef", "gastro", "cuisinier"],
  "Décor & Ambiance":["décor", "fleur", "lumin", "ambiance", "scénographie"],
  "Beauté & Style":  ["hair", "makeup", "maquillage", "neggafa", "robe", "spa", "coiffeur", "beauté", "esthétique"],
  "Planification":   ["planner", "organisateur", "coordinateur"],
  "Animation":       ["animat", "magicien", "gonflable", "clown"],
  "Lieu & Espace":   ["lieu", "salle", "espace", "villa", "riad", "hôtel", "maison", "domaine", "réception"],
  "Transport":       ["transport", "voiture", "vtc", "limousine"],
}

function matchesMajor(category: string, major: string): boolean {
  if (!major || major === "Tous") return true
  const keywords = MAJOR_KW[major] ?? []
  const cat = category.toLowerCase()
  return keywords.some(k => cat.includes(k))
}

// ── Initial static data ──────────────────────────────────────────────────────
const INITIAL: VendorEntry[] = Object.entries(VENDOR_BASIC).map(([id, v]) => ({
  id, name: v.name, category: v.category, city: v.city, rating: v.rating,
}))

const PAGE_SIZE = 48

// ── Component ────────────────────────────────────────────────────────────────
export default function CloneExplorePage() {
  const [vendors, setVendors]     = useState<VendorEntry[]>(INITIAL)
  const [search, setSearch]       = useState("")
  const [activeCity, setActiveCity] = useState("")
  const [activeMajor, setActiveMajor] = useState("Tous")
  const [sortBy, setSortBy]       = useState<"rating" | "name">("rating")
  const [page, setPage]           = useState(1)
  const [scrolled, setScrolled]   = useState(false)

  // Unique cities from data
  const cities = useMemo(() => {
    const cs = new Set(INITIAL.map(v => v.city).filter(Boolean))
    return Array.from(cs).sort()
  }, [])

  // Sticky bar on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 56)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Fresh data from API (same as v1)
  useEffect(() => {
    fetch("/api/vendors?limit=1200")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data?.vendors)) {
          setVendors(data.vendors.map((v: Record<string, unknown>) => ({
            id:       (v.slug as string) || (v.id as string),
            name:      v.name as string,
            category:  v.category as string,
            city:      (v.city as string) || "",
            rating:    typeof v.rating === "number" ? v.rating : 4,
          })))
        }
      })
      .catch(() => {}) // keep static fallback
  }, [])

  // Filter + sort
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return vendors
      .filter(v => {
        if (q && !v.name.toLowerCase().includes(q) && !v.category.toLowerCase().includes(q) && !v.city.toLowerCase().includes(q)) return false
        if (activeCity && v.city !== activeCity) return false
        if (!matchesMajor(v.category, activeMajor)) return false
        return true
      })
      .sort((a, b) => sortBy === "rating" ? b.rating - a.rating : a.name.localeCompare(b.name, "fr"))
  }, [vendors, search, activeCity, activeMajor, sortBy])

  // Reset pagination on filter change
  useEffect(() => { setPage(1) }, [search, activeCity, activeMajor, sortBy])

  const visible = filtered.slice(0, page * PAGE_SIZE)
  const hasMore = visible.length < filtered.length

  const hasFilters = search || activeCity || activeMajor !== "Tous"

  function clearFilters() {
    setSearch(""); setActiveCity(""); setActiveMajor("Tous")
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      className="ant-root"
      style={{ minHeight: "100vh", background: "#f7f7fb" }}
    >
      <AntNav />

      {/* ── Sticky filter bar ── */}
      <div
        className="sticky z-40 transition-all duration-300 clone-filter-bar"
        style={{
          top: 56,
          background: scrolled ? "rgba(255,255,255,0.96)" : "#fff",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: "1px solid rgba(183,191,217,0.18)",
          boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.06)" : "none",
        }}
      >
        {/* Search + city + sort */}
        <div
          className="mx-auto"
          style={{ maxWidth: 1200, padding: "10px 24px 8px" }}
        >
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Search input */}
            <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
              <span style={{
                position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                fontSize: 14, color: "#9a9aaa", pointerEvents: "none",
                fontFamily: "'Google Symbols','Material Symbols Outlined'",
                fontWeight: "normal",
              }}>
                search
              </span>
              <input
                type="text"
                placeholder="DJ, photographe, traiteur..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: "100%", height: 40,
                  paddingLeft: 38, paddingRight: 14,
                  borderRadius: 999,
                  border: "1px solid rgba(183,191,217,0.35)",
                  background: "#fafafa",
                  fontSize: 13, color: "#121317",
                  outline: "none", boxSizing: "border-box",
                  fontFamily: "inherit",
                  transition: "border-color 0.15s",
                }}
                onFocus={e => (e.target.style.borderColor = "rgba(225,29,72,0.5)")}
                onBlur={e => (e.target.style.borderColor = "rgba(183,191,217,0.35)")}
              />
            </div>

            {/* City selector */}
            <select
              value={activeCity}
              onChange={e => setActiveCity(e.target.value)}
              style={{
                height: 40, padding: "0 14px",
                border: "1px solid rgba(183,191,217,0.35)",
                borderRadius: 999,
                background: "#fafafa",
                fontSize: 13, color: "#121317",
                outline: "none", cursor: "pointer",
                flexShrink: 0, fontFamily: "inherit",
                minWidth: 140,
              }}
            >
              <option value="">Toutes les villes</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Sort — desktop only */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as "rating" | "name")}
              className="hidden sm:block"
              style={{
                height: 40, padding: "0 14px",
                border: "1px solid rgba(183,191,217,0.35)",
                borderRadius: 999,
                background: "#fafafa",
                fontSize: 13, color: "#121317",
                outline: "none", cursor: "pointer",
                flexShrink: 0, fontFamily: "inherit",
              }}
            >
              <option value="rating">Mieux notés</option>
              <option value="name">A → Z</option>
            </select>

            {/* Clear filters button */}
            {hasFilters && (
              <button
                onClick={clearFilters}
                style={{
                  height: 40, padding: "0 16px",
                  borderRadius: 999,
                  border: "1px solid rgba(225,29,72,0.3)",
                  background: "rgba(225,29,72,0.05)",
                  color: "#E11D48",
                  fontSize: 12, fontWeight: 500,
                  cursor: "pointer", fontFamily: "inherit",
                  flexShrink: 0, whiteSpace: "nowrap",
                  transition: "all 0.15s",
                }}
              >
                ✕ Effacer
              </button>
            )}
          </div>
        </div>

        {/* Category pills */}
        <div
          className="mx-auto"
          style={{
            maxWidth: 1200, padding: "0 24px 10px",
            overflowX: "auto", scrollbarWidth: "none",
          }}
        >
          <style>{`.clone-explore-cats::-webkit-scrollbar { display: none; }`}</style>
          <div className="clone-explore-cats" style={{ display: "flex", gap: 6, minWidth: "max-content" }}>
            {MAJOR_CATS.map(cat => {
              const active = activeMajor === cat.label
              return (
                <button
                  key={cat.label}
                  onClick={() => setActiveMajor(cat.label)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "5px 14px", borderRadius: 999,
                    border: active ? "none" : "1px solid rgba(183,191,217,0.3)",
                    background: active
                      ? "linear-gradient(135deg, var(--g1, #E11D48), var(--g2, #9333EA))"
                      : "#fff",
                    color: active ? "#fff" : "#45474D",
                    fontSize: 12, fontWeight: active ? 600 : 400,
                    cursor: "pointer", transition: "all 0.15s",
                    fontFamily: "inherit",
                    whiteSpace: "nowrap",
                    boxShadow: active ? "0 2px 12px rgba(225,29,72,0.25)" : "none",
                  }}
                >
                  <span style={{ fontSize: 13 }}>{cat.emoji}</span>
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div
        className="mx-auto"
        style={{ maxWidth: 1200, padding: "28px 24px 64px" }}
      >
        {/* Results header */}
        <div style={{ marginBottom: 24 }}>
          <h1 className="clone-heading" style={{
            fontSize: 22, fontWeight: 700, color: "#121317", margin: 0,
          }}>
            {filtered.length.toLocaleString("fr")} prestataire{filtered.length !== 1 ? "s" : ""}
            {activeMajor !== "Tous" ? <span style={{ fontWeight: 400, color: "#6a6a71" }}> · {activeMajor}</span> : null}
            {activeCity
              ? <span style={{ fontWeight: 400, color: "#6a6a71" }}> · {activeCity}</span>
              : <span style={{ fontWeight: 400, color: "#6a6a71" }}> au Maroc</span>
            }
          </h1>
          {search && (
            <p className="clone-muted" style={{ fontSize: 13, color: "#6a6a71", margin: "4px 0 0" }}>
              Résultats pour &ldquo;{search}&rdquo;
            </p>
          )}
        </div>

        {/* Grid */}
        {visible.length > 0 ? (
          <>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 20,
            }}>
              {visible.map(v => (
                <AntVendorCard
                  key={v.id}
                  id={v.id}
                  name={v.name}
                  category={v.category}
                  city={v.city}
                  rating={v.rating}
                />
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <div style={{ textAlign: "center", marginTop: 40 }}>
                <p className="clone-muted" style={{ fontSize: 13, color: "#6a6a71", marginBottom: 16 }}>
                  {visible.length} sur {filtered.length} prestataires
                </p>
                <button
                  onClick={() => setPage(p => p + 1)}
                  style={{
                    padding: "12px 32px", borderRadius: 999,
                    background: "linear-gradient(135deg, var(--g1, #E11D48), var(--g2, #9333EA))",
                    color: "#fff", border: "none",
                    fontSize: 14, fontWeight: 600,
                    cursor: "pointer", fontFamily: "inherit",
                    transition: "opacity 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >
                  Voir plus de prestataires
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <p style={{ fontSize: 48, margin: "0 0 16px" }}>🔍</p>
            <h2 className="clone-heading" style={{ fontSize: 18, fontWeight: 600, color: "#121317", margin: 0 }}>
              Aucun prestataire trouvé
            </h2>
            <p className="clone-muted" style={{ fontSize: 14, color: "#6a6a71", marginTop: 8 }}>
              Essayez de modifier vos filtres ou votre recherche
            </p>
            <button
              onClick={clearFilters}
              style={{
                marginTop: 24, padding: "10px 28px", borderRadius: 999,
                background: "linear-gradient(135deg, var(--g1, #E11D48), var(--g2, #9333EA))",
                color: "#fff", border: "none",
                fontSize: 14, fontWeight: 500,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      {/* Footer-like bar */}
      <div style={{
        borderTop: "1px solid rgba(183,191,217,0.15)",
        padding: "20px 24px",
        textAlign: "center",
      }}>
        <p className="clone-muted" style={{ fontSize: 12, color: "#9a9aaa", margin: 0 }}>
          {VENDOR_COUNT}+ prestataires vérifiés · 41 villes · 0% commission
        </p>
      </div>
    </div>
  )
}
