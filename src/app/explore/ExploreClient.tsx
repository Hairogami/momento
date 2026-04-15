"use client"
import { useState, useEffect, useMemo, useRef } from "react"
import AntNav from "@/components/clone/AntNav"
import AntVendorCard from "@/components/clone/AntVendorCard"
import type { VendorListItem } from "@/lib/vendorQueries"

// ── PillSelect — custom dropdown styled avec les tokens de la page ───────────
function PillSelect({ value, onChange, options, placeholder }: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = options.find(o => o.value === value)

  useEffect(() => {
    if (!open) return
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onOutside)
    return () => document.removeEventListener("mousedown", onOutside)
  }, [open])

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          height: 40, padding: "0 14px",
          border: `1px solid ${open ? "rgba(225,29,72,0.5)" : "var(--dash-border,rgba(183,191,217,0.35))"}`,
          borderRadius: 999,
          background: "var(--dash-input-bg,#fafafa)",
          fontSize: 13, color: value ? "var(--dash-text,#121317)" : "var(--dash-text-3,#9a9aaa)",
          cursor: "pointer", fontFamily: "inherit",
          display: "flex", alignItems: "center", gap: 6,
          whiteSpace: "nowrap", transition: "border-color 0.15s",
        }}
      >
        {current?.label ?? placeholder}
        <svg width="8" height="5" viewBox="0 0 8 5" style={{ opacity: 0.5, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s", flexShrink: 0 }}>
          <path d="M1 1l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        </svg>
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0,
          minWidth: "100%", maxHeight: 240, overflowY: "auto",
          background: "var(--dash-surface,#fff)",
          border: "1px solid var(--dash-border,rgba(183,191,217,0.25))",
          borderRadius: 14,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          zIndex: 100, padding: "6px 0",
        }}>
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              style={{
                width: "100%", padding: "8px 14px",
                background: opt.value === value ? "rgba(225,29,72,0.06)" : "transparent",
                border: "none", textAlign: "left",
                fontSize: 13, color: opt.value === value ? "#E11D48" : "var(--dash-text,#121317)",
                fontWeight: opt.value === value ? 600 : 400,
                cursor: "pointer", fontFamily: "inherit",
                whiteSpace: "nowrap",
                transition: "background 0.1s",
              }}
              onMouseEnter={e => { if (opt.value !== value) (e.currentTarget as HTMLButtonElement).style.background = "var(--dash-faint-2,#f4f4f8)" }}
              onMouseLeave={e => { if (opt.value !== value) (e.currentTarget as HTMLButtonElement).style.background = "transparent" }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Category filter groups ───────────────────────────────────────────────────
const MAJOR_CATS = [
  { label: "Tous",              emoji: "✦"  },
  { label: "Traiteur",          emoji: "🍽️" },
  { label: "Lieu de réception", emoji: "🏛️" },
  { label: "Orchestre",         emoji: "🎻" },
  { label: "Neggafa",           emoji: "👘" },
  { label: "Photographe",       emoji: "📸" },
  { label: "Makeup & Beauté",   emoji: "💄" },
  { label: "DJ",                emoji: "🎧" },
  { label: "Décoration",        emoji: "✨" },
  { label: "Pâtissier",         emoji: "🎂" },
  { label: "Planner",           emoji: "📋" },
  { label: "Dekka / Issawa",    emoji: "🥁" },
  { label: "Vidéaste",          emoji: "🎬" },
  { label: "Robes",             emoji: "👗" },
  { label: "Animation",         emoji: "🎪" },
  { label: "Transport",         emoji: "🚗" },
  { label: "Chanteur",          emoji: "🎤" },
  { label: "Violoniste",        emoji: "🎵" },
  { label: "Autres",            emoji: "⚡" },
]

const MAJOR_KW: Record<string, string[]> = {
  "Traiteur":          ["traiteur"],
  "Lieu de réception": ["lieu de réception"],
  "Orchestre":         ["orchestre"],
  "Neggafa":           ["neggafa"],
  "Photographe":       ["photographe"],
  "Makeup & Beauté":   ["makeup", "hairstylist", "spa", "soins", "esthétique"],
  "DJ":                ["dj"],
  "Décoration":        ["décorateur", "fleuriste", "ambiance lumineuse"],
  "Pâtissier":         ["pâtissier", "cake designer"],
  "Planner":           ["wedding planner", "event planner"],
  "Dekka / Issawa":    ["dekka", "issawa"],
  "Vidéaste":          ["vidéaste"],
  "Robes":             ["robes de mariés"],
  "Animation":         ["magicien", "animateur", "gonflable", "bar / mixologue", "jeux"],
  "Transport":         ["location de voiture", "vtc", "transport"],
  "Chanteur":          ["chanteur"],
  "Violoniste":        ["violoniste"],
  "Autres":            ["faire-part", "cadeaux", "sécurité", "structures"],
}

function matchesMajor(category: string, major: string): boolean {
  if (!major || major === "Tous") return true
  const keywords = MAJOR_KW[major] ?? []
  const cat = category.toLowerCase()
  return keywords.some(k => cat.includes(k.toLowerCase()))
}

// ── Event type → category keywords ──────────────────────────────────────────
const EVENT_TYPE_KW: Record<string, string[]> = {
  "mariage":     ["photographe", "neggafa", "traiteur", "décorateur", "fleuriste", "orchestre", "wedding planner", "robes", "lieu de réception", "vidéaste", "makeup", "hairstylist", "pâtissier", "cake"],
  "fiancailles": ["photographe", "orchestre", "traiteur", "neggafa", "décorateur", "fleuriste", "makeup", "pâtissier"],
  "corporate":   ["event planner", "lieu de réception", "dj", "traiteur", "transport", "vtc", "sécurité", "animateur"],
  "anniversaire":["dj", "animateur", "magicien", "pâtissier", "cake", "décorateur", "photographe", "bar", "gonflable"],
}

function matchesEventType(category: string, eventType: string): boolean {
  if (!eventType) return true
  const keywords = EVENT_TYPE_KW[eventType] ?? []
  const cat = category.toLowerCase()
  return keywords.some(k => cat.includes(k.toLowerCase()))
}

const PAGE_SIZE = 48

// ── Component ────────────────────────────────────────────────────────────────
export default function ExploreClient({ initialVendors, totalCount }: {
  initialVendors: VendorListItem[]
  totalCount: number
}) {
  const [search, setSearch]       = useState("")
  const [activeCity, setActiveCity] = useState("")
  const [activeMajor, setActiveMajor] = useState("Tous")
  const [sortBy, setSortBy]       = useState<"rating" | "name" | "name_desc" | "city">("rating")
  const [ratingMin, setRatingMin] = useState(0)
  const [eventType, setEventType] = useState("")
  const [socialFilter, setSocialFilter] = useState<Set<"instagram" | "facebook">>(new Set())
  const [photoOnly, setPhotoOnly] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const filtersRef = useRef<HTMLDivElement>(null)
  const [page, setPage]           = useState(1)
  const [scrolled, setScrolled]   = useState(false)
  const catsRef = useRef<HTMLDivElement>(null)

  // Unique cities from data
  const cities = useMemo(() => {
    const cs = new Set(initialVendors.map(v => v.city).filter(Boolean))
    return Array.from(cs).sort()
  }, [initialVendors])

  // Close filters popover on outside click
  useEffect(() => {
    if (!filtersOpen) return
    function onOutside(e: MouseEvent) {
      if (filtersRef.current && !filtersRef.current.contains(e.target as Node)) setFiltersOpen(false)
    }
    document.addEventListener("mousedown", onOutside)
    return () => document.removeEventListener("mousedown", onOutside)
  }, [filtersOpen])

  // Sticky bar on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 56)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Filter + sort
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return initialVendors
      .filter(v => {
        if (q && !v.name.toLowerCase().includes(q) && !v.category.toLowerCase().includes(q) && !v.city.toLowerCase().includes(q)) return false
        if (activeCity && v.city !== activeCity) return false
        if (!matchesMajor(v.category, activeMajor)) return false
        if (!matchesEventType(v.category, eventType)) return false
        if (ratingMin > 0 && v.rating < ratingMin) return false
        if (socialFilter.has("instagram") && !v.instagram) return false
        if (socialFilter.has("facebook") && !v.facebook) return false
        if (photoOnly && !v.hasPhoto) return false
        return true
      })
      .sort((a, b) => {
        if (sortBy === "rating")     return b.rating - a.rating
        if (sortBy === "name")       return a.name.localeCompare(b.name, "fr")
        if (sortBy === "name_desc")  return b.name.localeCompare(a.name, "fr")
        if (sortBy === "city")       return a.city.localeCompare(b.city, "fr")
        return 0
      })
  }, [initialVendors, search, activeCity, activeMajor, sortBy, ratingMin, eventType, socialFilter, photoOnly])

  // Reset pagination on filter change
  useEffect(() => { setPage(1) }, [search, activeCity, activeMajor, sortBy, ratingMin, eventType, socialFilter, photoOnly])

  const visible = filtered.slice(0, page * PAGE_SIZE)
  const hasMore = visible.length < filtered.length

  const hasFilters = search || activeCity || activeMajor !== "Tous" || ratingMin > 0 || eventType || socialFilter.size > 0 || photoOnly

  function clearFilters() {
    setSearch(""); setActiveCity(""); setActiveMajor("Tous")
    setRatingMin(0); setEventType(""); setSocialFilter(new Set()); setPhotoOnly(false)
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      className="ant-root"
      style={{ minHeight: "100vh", background: "var(--dash-bg,#f7f7fb)", paddingTop: 56 }}
    >
      <AntNav hideLinks centerSlot={
        <div className="flex items-center gap-2" style={{ width: "100%", maxWidth: 616 }}>
          {/* Search input */}
          <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
            <span style={{
              position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
              fontSize: 14, color: "var(--dash-text-3,#9a9aaa)", pointerEvents: "none",
              fontFamily: "'Google Symbols','Material Symbols Outlined'", fontWeight: "normal",
            }}>search</span>
            <input
              type="text"
              placeholder="DJ, photographe, traiteur..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", height: 40,
                paddingLeft: 34, paddingRight: 12,
                borderRadius: 999,
                border: "1px solid var(--dash-border,rgba(183,191,217,0.35))",
                background: "var(--dash-input-bg,#fafafa)",
                fontSize: 13, color: "var(--dash-text,#121317)",
                outline: "none", boxSizing: "border-box", fontFamily: "inherit",
                transition: "border-color 0.15s",
              }}
              onFocus={e => (e.target.style.borderColor = "rgba(225,29,72,0.5)")}
              onBlur={e => (e.target.style.borderColor = "var(--dash-border,rgba(183,191,217,0.35))")}
            />
          </div>
          {/* City */}
          <PillSelect
            value={activeCity}
            onChange={setActiveCity}
            placeholder="Ville"
            options={[{ value: "", label: "Toutes" }, ...cities.map(c => ({ value: c, label: c }))]}
          />
          {/* Événement */}
          <PillSelect
            value={eventType}
            onChange={setEventType}
            placeholder="Événement"
            options={[
              { value: "",           label: "Tous" },
              { value: "mariage",    label: "💍 Mariage" },
              { value: "fiancailles",label: "💐 Fiançailles" },
              { value: "corporate",  label: "🏢 Corporate" },
              { value: "anniversaire",label: "🎉 Anniversaire" },
            ]}
          />
          {/* Note */}
          <PillSelect
            value={String(ratingMin)}
            onChange={v => setRatingMin(Number(v))}
            placeholder="Note"
            options={[
              { value: "0",   label: "Toutes" },
              { value: "4",   label: "★ 4+" },
              { value: "4.5", label: "★ 4.5+" },
              { value: "5",   label: "★ 5 seulement" },
            ]}
          />
          {/* Sort */}
          <PillSelect
            value={sortBy}
            onChange={v => setSortBy(v as "rating" | "name" | "name_desc" | "city")}
            placeholder="Tri"
            options={[
              { value: "rating",    label: "Mieux notés" },
              { value: "name",      label: "A → Z" },
              { value: "name_desc", label: "Z → A" },
              { value: "city",      label: "Par ville" },
            ]}
          />
          {/* Clear */}
          {hasFilters && (
            <button onClick={clearFilters} style={{
              height: 40, padding: "0 14px", borderRadius: 999,
              border: "1px solid rgba(225,29,72,0.3)", background: "rgba(225,29,72,0.05)",
              color: "#E11D48", fontSize: 12, fontWeight: 500,
              cursor: "pointer", fontFamily: "inherit", flexShrink: 0, whiteSpace: "nowrap",
            }}>✕</button>
          )}
        </div>
      }>
      </AntNav>

      {/* ── Sticky filter bar — categories only ── */}
      <div
        className="sticky z-40 transition-all duration-300 clone-filter-bar"
        style={{
          top: 56,
          background: scrolled ? "var(--dash-surface-blur,rgba(255,255,255,0.96))" : "var(--dash-surface,#fff)",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: "1px solid var(--dash-border,rgba(183,191,217,0.18))",
          boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.06)" : "none",
        }}
      >
        {/* Category pills */}
        <div style={{ padding: "10px 24px 10px", position: "relative", display: "flex", alignItems: "center", gap: 4 }}>
          {/* Scroll left */}
          <button onClick={() => catsRef.current?.scrollBy({ left: -200, behavior: "smooth" })} style={{
            flexShrink: 0, width: 28, height: 28, borderRadius: "50%",
            border: "1px solid var(--dash-border,rgba(183,191,217,0.3))",
            background: "var(--dash-surface,#fff)", color: "var(--dash-text-2,#45474D)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, lineHeight: 1,
          }}>‹</button>
          <style>{`.clone-explore-cats::-webkit-scrollbar { display: none; }`}</style>
          <div ref={catsRef} className="clone-explore-cats" style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none", flex: 1 }}>
            {MAJOR_CATS.map(cat => {
              const active = activeMajor === cat.label
              return (
                <button
                  key={cat.label}
                  onClick={() => setActiveMajor(cat.label)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "5px 14px", borderRadius: 999,
                    border: active ? "none" : "1px solid var(--dash-border,rgba(183,191,217,0.3))",
                    background: active
                      ? "linear-gradient(135deg, var(--g1, #E11D48), var(--g2, #9333EA))"
                      : "var(--dash-surface,#fff)",
                    color: active ? "#fff" : "var(--dash-text-2,#45474D)",
                    fontSize: 12, fontWeight: active ? 600 : 400,
                    cursor: "pointer", transition: "all 0.15s",
                    fontFamily: "inherit",
                    whiteSpace: "nowrap",
                    boxShadow: active ? "0 2px 12px rgba(225,29,72,0.25)" : "none",
                  }}
                >
                  <span style={{ fontSize: 13 }}>{cat.emoji}</span>
                  {cat.label}
                  {active && (
                    <span style={{
                      background: "rgba(255,255,255,0.25)", borderRadius: 99,
                      padding: "1px 7px", fontSize: 11, fontWeight: 700,
                    }}>
                      {filtered.length}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          {/* Scroll right */}
          <button onClick={() => catsRef.current?.scrollBy({ left: 200, behavior: "smooth" })} style={{
            flexShrink: 0, width: 28, height: 28, borderRadius: "50%",
            border: "1px solid var(--dash-border,rgba(183,191,217,0.3))",
            background: "var(--dash-surface,#fff)", color: "var(--dash-text-2,#45474D)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, lineHeight: 1,
          }}>›</button>

          {/* ── Filtres avancés ── */}
          <div ref={filtersRef} style={{ position: "relative", flexShrink: 0, marginLeft: 8 }}>
            {/* Trigger */}
            {(() => {
              const advCount = socialFilter.size + (photoOnly ? 1 : 0)
              return (
                <button onClick={() => setFiltersOpen(o => !o)} style={{
                  height: 28, padding: "0 12px", borderRadius: 999,
                  border: filtersOpen || advCount > 0
                    ? "1px solid rgba(225,29,72,0.5)"
                    : "1px solid var(--dash-border,rgba(183,191,217,0.3))",
                  background: advCount > 0
                    ? "linear-gradient(135deg,var(--g1,#E11D48),var(--g2,#9333EA))"
                    : "var(--dash-surface,#fff)",
                  color: advCount > 0 ? "#fff" : "var(--dash-text-2,#6a6a71)",
                  fontSize: 12, fontWeight: advCount > 0 ? 600 : 400,
                  cursor: "pointer", fontFamily: "inherit",
                  display: "flex", alignItems: "center", gap: 5,
                  transition: "all 0.15s",
                }}>
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                    <path d="M1 2h10M3 5h6M5 8h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Filtres
                  {advCount > 0 && (
                    <span style={{
                      background: "rgba(255,255,255,0.3)", borderRadius: 99,
                      padding: "0 5px", fontSize: 10, fontWeight: 700,
                    }}>{advCount}</span>
                  )}
                </button>
              )
            })()}

            {/* Popover */}
            {filtersOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", right: 0,
                width: 240,
                background: "var(--dash-surface,#fff)",
                border: "1px solid var(--dash-border,rgba(183,191,217,0.2))",
                borderRadius: 16,
                boxShadow: "0 12px 40px rgba(0,0,0,0.14)",
                zIndex: 200, overflow: "hidden",
              }}>
                {/* Section réseaux sociaux */}
                <div style={{ padding: "14px 16px 10px" }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--dash-text-3,#9a9aaa)", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Réseaux sociaux
                  </p>
                  <div style={{ display: "flex", gap: 6 }}>
                    {(["instagram", "facebook"] as const).map(s => {
                      const active = socialFilter.has(s)
                      return (
                        <button key={s} onClick={() => setSocialFilter(prev => {
                          const next = new Set(prev)
                          if (active) next.delete(s); else next.add(s)
                          return next
                        })} style={{
                          flex: 1, height: 32, borderRadius: 10, fontSize: 12,
                          fontWeight: active ? 600 : 400,
                          border: active ? "none" : "1px solid var(--dash-border,rgba(183,191,217,0.3))",
                          background: active
                            ? s === "instagram"
                              ? "linear-gradient(135deg,#f09433,#dc2743,#bc1888)"
                              : "#1877F2"
                            : "var(--dash-faint-2,#f4f4f8)",
                          color: active ? "#fff" : "var(--dash-text-2,#6a6a71)",
                          cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                        }}>
                          {s === "instagram" ? "Instagram" : "Facebook"}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div style={{ height: 1, background: "var(--dash-border,rgba(183,191,217,0.12))", margin: "0 16px" }} />

                {/* Section médias */}
                <div style={{ padding: "10px 16px 14px" }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--dash-text-3,#9a9aaa)", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Médias
                  </p>
                  <button onClick={() => setPhotoOnly(p => !p)} style={{
                    width: "100%", height: 32, borderRadius: 10, fontSize: 12,
                    fontWeight: photoOnly ? 600 : 400,
                    border: photoOnly ? "none" : "1px solid var(--dash-border,rgba(183,191,217,0.3))",
                    background: photoOnly
                      ? "linear-gradient(135deg,var(--g1,#E11D48),var(--g2,#9333EA))"
                      : "var(--dash-faint-2,#f4f4f8)",
                    color: photoOnly ? "#fff" : "var(--dash-text-2,#6a6a71)",
                    cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}>
                    🖼️ Avec photos uniquement
                  </button>
                </div>

                {/* Footer reset */}
                {(socialFilter.size > 0 || photoOnly) && (
                  <>
                    <div style={{ height: 1, background: "var(--dash-border,rgba(183,191,217,0.12))" }} />
                    <button onClick={() => { setSocialFilter(new Set()); setPhotoOnly(false) }} style={{
                      width: "100%", padding: "10px 16px",
                      background: "transparent", border: "none",
                      fontSize: 12, color: "#E11D48",
                      cursor: "pointer", fontFamily: "inherit",
                      textAlign: "left",
                    }}>
                      ✕ Réinitialiser ces filtres
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── Main content ── */}
      <div
        className="mx-auto"
        style={{ maxWidth: 1200, padding: "40px 24px 64px" }}
      >
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
                <p className="clone-muted" style={{ fontSize: 13, color: "var(--dash-text-2,#6a6a71)", marginBottom: 16 }}>
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
            <h2 className="clone-heading" style={{ fontSize: 18, fontWeight: 600, color: "var(--dash-text,#121317)", margin: 0 }}>
              Aucun prestataire trouvé
            </h2>
            <p className="clone-muted" style={{ fontSize: 14, color: "var(--dash-text-2,#6a6a71)", marginTop: 8 }}>
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
        borderTop: "1px solid var(--dash-border,rgba(183,191,217,0.15))",
        padding: "20px 24px",
        textAlign: "center",
      }}>
        <p className="clone-muted" style={{ fontSize: 12, color: "var(--dash-text-3,#9a9aaa)", margin: 0 }}>
          {totalCount}+ prestataires vérifiés · 41 villes · 0% commission
        </p>
      </div>
    </div>
  )
}
