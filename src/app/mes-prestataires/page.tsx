"use client"
import { useEffect, useState, useCallback, useRef } from "react"
import AntNav from "@/components/clone/AntNav"
import DashSidebar from "@/components/clone/dashboard/DashSidebar"
import VendorDiscoverCard, { type DiscoverVendor } from "@/components/prestataires/VendorDiscoverCard"
import RecommandedCarousel from "@/components/prestataires/RecommandedCarousel"
import { usePlanners } from "@/hooks/usePlanners"
import PageSkeleton from "@/components/clone/PageSkeleton"

const G = "linear-gradient(135deg, #E11D48, #9333EA)"

const ALL_CATEGORIES = [
  { value: "Photographe",               emoji: "📸" },
  { value: "Vidéaste",                  emoji: "🎬" },
  { value: "DJ",                        emoji: "🎧" },
  { value: "Orchestre",                 emoji: "🎻" },
  { value: "Chanteur / chanteuse",      emoji: "🎤" },
  { value: "Traiteur",                  emoji: "🍽️" },
  { value: "Pâtissier / Cake designer", emoji: "🎂" },
  { value: "Service de bar / mixologue",emoji: "🍹" },
  { value: "Lieu de réception",         emoji: "🏛️" },
  { value: "Décorateur",                emoji: "✨" },
  { value: "Fleuriste événementiel",    emoji: "🌸" },
  { value: "Hairstylist",               emoji: "💇" },
  { value: "Makeup Artist",             emoji: "💄" },
  { value: "Neggafa",                   emoji: "👘" },
  { value: "Robes de mariés",           emoji: "👗" },
  { value: "Wedding planner",           emoji: "📋" },
  { value: "Event planner",             emoji: "🗓️" },
  { value: "Animateur enfants",         emoji: "🎪" },
  { value: "Magicien",                  emoji: "🎩" },
  { value: "Violoniste",                emoji: "🎵" },
]

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:   { label: "Sélectionné", color: "#8b5cf6" },
  contacted: { label: "Contacté",    color: "#f59e0b" },
  replied:   { label: "A répondu",   color: "#3b82f6" },
  confirmed: { label: "Confirmé",    color: "#22c55e" },
}

type PlannerVendor = {
  id: string
  vendorSlug: string
  status: string
  notes: string
  vendor: DiscoverVendor
}

type PlannerDetail = {
  id: string
  title: string
  categories: string[]
  coupleNames?: string
  weddingDate?: string | null
}

export default function MesPrestatairesPage() {
  const { events, activeEventId, setActiveEventId } = usePlanners()
  const [planner, setPlanner] = useState<PlannerDetail | null>(null)
  const [plannerVendors, setPlannerVendors] = useState<PlannerVendor[]>([])
  const [loading, setLoading] = useState(false)
  const [addingCategory, setAddingCategory] = useState<string | null>(null)
  const [categoryVendors, setCategoryVendors] = useState<DiscoverVendor[]>([])
  const [loadingCatVendors, setLoadingCatVendors] = useState(false)
  const [showNewCategoryPicker, setShowNewCategoryPicker] = useState(false)
  const [savingCategory, setSavingCategory] = useState(false)
  const [statusDropdown, setStatusDropdown] = useState<string | null>(null)
  const statusRef = useRef<HTMLDivElement>(null)

  const loadPlanner = useCallback(async (id: string) => {
    setLoading(true)
    try {
      const [pRes, pvRes] = await Promise.all([
        fetch(`/api/planners/${id}`),
        fetch(`/api/planners/${id}/vendors`),
      ])
      if (pRes.ok) setPlanner(await pRes.json())
      if (pvRes.ok) setPlannerVendors(await pvRes.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeEventId) loadPlanner(activeEventId)
  }, [activeEventId, loadPlanner])

  useEffect(() => {
    if (!statusDropdown) return
    const close = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setStatusDropdown(null)
    }
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [statusDropdown])

  async function updateStatus(vendorSlug: string, status: string) {
    if (!planner) return
    await fetch(`/api/planners/${planner.id}/vendors/${vendorSlug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    setPlannerVendors(prev => prev.map(pv =>
      pv.vendorSlug === vendorSlug ? { ...pv, status } : pv
    ))
  }

  async function removeVendor(vendorSlug: string) {
    if (!planner) return
    await fetch(`/api/planners/${planner.id}/vendors/${vendorSlug}`, { method: "DELETE" })
    setPlannerVendors(prev => prev.filter(pv => pv.vendorSlug !== vendorSlug))
  }

  async function openCategoryPicker(category: string) {
    setAddingCategory(category)
    setCategoryVendors([])
    setLoadingCatVendors(true)
    try {
      const res = await fetch(`/api/vendors?category=${encodeURIComponent(category)}&limit=20`)
      const data = await res.json()
      if (Array.isArray(data?.vendors)) setCategoryVendors(data.vendors)
    } finally {
      setLoadingCatVendors(false)
    }
  }

  async function addNewCategory(category: string) {
    if (!planner) return
    setSavingCategory(true)
    try {
      const updated = [...planner.categories, category]
      const res = await fetch(`/api/planners/${planner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: updated }),
      })
      if (res.ok) {
        setShowNewCategoryPicker(false)
        await loadPlanner(planner.id)
        // Auto-open the vendor picker for the new category
        openCategoryPicker(category)
      }
    } finally {
      setSavingCategory(false)
    }
  }

  function handleInterestResult(vendorSlug: string, result: { type: string; conversationId?: string; phone?: string | null }) {
    if (result.type === "message") {
      // Passer en "contacté" automatiquement après envoi du message
      updateStatus(vendorSlug, "contacted")
    } else {
      // WhatsApp ou autre — recharger pour sync
      if (planner) loadPlanner(planner.id)
    }
  }

  const vendorsByCategory = (planner?.categories ?? []).reduce<Record<string, PlannerVendor[]>>((acc, cat) => {
    acc[cat] = plannerVendors.filter(pv => pv.vendor.category === cat)
    return acc
  }, {})

  if (!activeEventId && events.length === 0) {
    return (
      <div className="ant-root" style={pageStyle}>
        <div className="hidden lg:flex">
          <DashSidebar events={events} activeEventId={activeEventId} onEventChange={setActiveEventId} />
        </div>
        <div className="lg:hidden"><AntNav /></div>
        <main className="pb-20 md:pb-0" style={contentStyle}>
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <p style={{ fontSize: 40, marginBottom: 16 }}>🎉</p>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--dash-text,#121317)", margin: "0 0 8px" }}>Aucun événement</h2>
            <p style={{ fontSize: 13, color: "var(--dash-text-2,#6a6a71)" }}>Créez un événement pour commencer à sélectionner vos prestataires.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="ant-root" style={pageStyle}>
      <div className="hidden lg:flex">
        <DashSidebar events={events} activeEventId={activeEventId} onEventChange={setActiveEventId} />
      </div>
      <div className="lg:hidden"><AntNav /></div>
      <main className="pb-20 md:pb-0" style={contentStyle}>
        {/* Header */}
        <div style={{ marginBottom: 32, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 700, color: "var(--dash-text,#121317)", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
              Mes prestataires
            </h1>
            {planner && (
              <p style={{ fontSize: 13, color: "var(--dash-text-2,#6a6a71)", margin: 0 }}>
                {planner.title} {planner.weddingDate ? `· ${new Date(planner.weddingDate).toLocaleDateString("fr-MA", { day: "numeric", month: "long", year: "numeric" })}` : ""}
              </p>
            )}
          </div>

          {/* Add category + event switcher */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {planner && (
              <button
                onClick={() => setShowNewCategoryPicker(true)}
                style={{
                  padding: "8px 16px", borderRadius: 99, fontSize: 12, fontWeight: 600,
                  border: "none", background: G, color: "#fff",
                  cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
                }}
              >+ Catégorie</button>
            )}
          {/* Event selector supprimé — événement actif géré par la sidebar */}
          </div>
        </div>

        {/* Carrousel recommandés — en haut de page, avant la sélection par catégorie */}
        {activeEventId && <RecommandedCarousel plannerId={activeEventId} />}

        {loading ? (
          <PageSkeleton variant="cards" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
            {Object.entries(vendorsByCategory).map(([category, vendors]) => (
              <section key={category}>
                {/* Category header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--dash-text,#121317)", margin: 0 }}>{category}</h2>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                      background: vendors.length > 0 ? "rgba(34,197,94,0.1)" : "rgba(183,191,217,0.15)",
                      color: vendors.length > 0 ? "#22c55e" : "var(--dash-text-3,#9a9aaa)",
                    }}>
                      {vendors.length} sélectionné{vendors.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <button
                    onClick={() => openCategoryPicker(category)}
                    style={{
                      padding: "6px 14px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                      border: "1.5px solid rgba(183,191,217,0.4)",
                      background: "transparent", color: "var(--dash-text-2,#6a6a71)", cursor: "pointer",
                    }}
                  >+ Ajouter</button>
                </div>

                {/* Selected vendors */}
                {vendors.length > 0 ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                    {vendors.map(pv => (
                      <div key={pv.vendorSlug} style={{ position: "relative" }}>
                        <VendorDiscoverCard
                          vendor={pv.vendor}
                          plannerId={planner!.id}
                          onInterest={result => handleInterestResult(pv.vendorSlug, result)}
                        />
                        {/* Status + remove */}
                        <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
                          <div style={{ position: "relative", flex: 1 }} ref={statusDropdown === pv.vendorSlug ? statusRef : undefined}>
                            <button
                              onClick={() => setStatusDropdown(statusDropdown === pv.vendorSlug ? null : pv.vendorSlug)}
                              style={{
                                width: "100%", padding: "6px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                                border: "1.5px solid rgba(183,191,217,0.3)",
                                background: `${STATUS_LABELS[pv.status]?.color ?? "#9a9aaa"}15`,
                                color: STATUS_LABELS[pv.status]?.color ?? "#9a9aaa",
                                cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                              }}
                            >
                              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ width: 6, height: 6, borderRadius: "50%", background: STATUS_LABELS[pv.status]?.color ?? "#9a9aaa" }} />
                                {STATUS_LABELS[pv.status]?.label ?? pv.status}
                              </span>
                              <span style={{ fontSize: 9, opacity: 0.6 }}>▼</span>
                            </button>
                            {statusDropdown === pv.vendorSlug && (
                              <div style={{
                                position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 20,
                                background: "var(--dash-surface,#fff)", borderRadius: 10,
                                boxShadow: "0 4px 16px rgba(0,0,0,0.12)", border: "1px solid var(--dash-border,rgba(183,191,217,0.2))",
                                padding: 4, overflow: "hidden",
                              }}>
                                {Object.entries(STATUS_LABELS).map(([v, s]) => (
                                  <button key={v} onClick={() => { updateStatus(pv.vendorSlug, v); setStatusDropdown(null) }} style={{
                                    display: "flex", alignItems: "center", gap: 8, width: "100%",
                                    padding: "7px 10px", border: "none", borderRadius: 6, cursor: "pointer",
                                    background: pv.status === v ? `${s.color}15` : "transparent",
                                    fontSize: 11, fontWeight: 600, color: s.color, fontFamily: "inherit", textAlign: "left",
                                  }}>
                                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color }} />
                                    {s.label}
                                    {pv.status === v && <span style={{ marginLeft: "auto", fontSize: 10 }}>✓</span>}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => removeVendor(pv.vendorSlug)}
                            style={{
                              padding: "6px 10px", borderRadius: 8, fontSize: 11,
                              border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.05)",
                              color: "#ef4444", cursor: "pointer",
                            }}
                          >Retirer</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    border: "1.5px dashed rgba(183,191,217,0.4)", borderRadius: 16,
                    padding: "28px 24px", textAlign: "center",
                  }}>
                    <p style={{ fontSize: 13, color: "var(--dash-text-3,#9a9aaa)", margin: "0 0 12px" }}>
                      Aucun {category.toLowerCase()} sélectionné
                    </p>
                    <button
                      onClick={() => openCategoryPicker(category)}
                      style={{
                        padding: "8px 20px", borderRadius: 99, border: "none",
                        background: G, color: "#fff", fontSize: 12, fontWeight: 600,
                        cursor: "pointer", fontFamily: "inherit",
                      }}
                    >Trouver un {category.toLowerCase()} →</button>
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </main>

      {/* New category picker overlay */}
      {showNewCategoryPicker && planner && (
        <div
          onClick={() => setShowNewCategoryPicker(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 900,
            background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "flex-end", justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "var(--dash-surface,#fff)", borderRadius: "20px 20px 0 0",
              width: "100%", maxWidth: 600, maxHeight: "80vh",
              overflow: "hidden", display: "flex", flexDirection: "column",
            }}
          >
            <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid rgba(183,191,217,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--dash-text,#121317)", margin: "0 0 2px" }}>
                  Ajouter une catégorie
                </h3>
                <p style={{ fontSize: 12, color: "var(--dash-text-2,#6a6a71)", margin: 0 }}>
                  Sélectionne une catégorie à ajouter à ton événement
                </p>
              </div>
              <button onClick={() => setShowNewCategoryPicker(false)} style={{ background: "none", border: "none", fontSize: 18, color: "var(--dash-text-3,#9a9aaa)", cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ overflowY: "auto", padding: 16 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {ALL_CATEGORIES.filter(cat => !planner.categories.includes(cat.value)).map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => addNewCategory(cat.value)}
                    disabled={savingCategory}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "10px 16px", borderRadius: 12, fontSize: 12, fontWeight: 600,
                      border: "1.5px solid rgba(183,191,217,0.35)",
                      background: "var(--dash-bg,#f7f7fb)", color: "var(--dash-text,#121317)",
                      cursor: savingCategory ? "not-allowed" : "pointer",
                      fontFamily: "inherit", transition: "all 0.15s",
                    }}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.value}</span>
                  </button>
                ))}
                {ALL_CATEGORIES.filter(cat => !planner.categories.includes(cat.value)).length === 0 && (
                  <p style={{ fontSize: 13, color: "var(--dash-text-3,#9a9aaa)", padding: "20px 0" }}>
                    Toutes les catégories sont déjà ajoutées.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category picker overlay */}
      {addingCategory && (
        <div
          onClick={() => setAddingCategory(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 900,
            background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "flex-end", justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "var(--dash-surface,#fff)", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 600,
              maxHeight: "80vh", overflow: "hidden", display: "flex", flexDirection: "column",
            }}
          >
            <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid rgba(183,191,217,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--dash-text,#121317)", margin: 0 }}>
                Choisir un {addingCategory}
              </h3>
              <button onClick={() => setAddingCategory(null)} style={{ background: "none", border: "none", fontSize: 18, color: "var(--dash-text-3,#9a9aaa)", cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ overflowY: "auto", padding: 16 }}>
              {loadingCatVendors ? (
                <PageSkeleton variant="cards" />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {categoryVendors.map(v => (
                    <VendorDiscoverCard
                      key={v.slug}
                      vendor={v}
                      plannerId={planner?.id ?? ""}
                      onInterest={result => {
                        handleInterestResult(v.slug, result)
                        setAddingCategory(null)
                      }}
                    />
                  ))}
                  {categoryVendors.length === 0 && (
                    <p style={{ textAlign: "center", color: "var(--dash-text-3,#9a9aaa)", padding: 40, fontSize: 13 }}>
                      Aucun prestataire trouvé dans cette catégorie.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const pageStyle: React.CSSProperties = {
  display: "flex", minHeight: "100vh",
  background: "var(--dash-bg,#f7f7fb)",
  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
}

const contentStyle: React.CSSProperties = {
  flex: 1, padding: "clamp(16px, 4vw, 32px)", overflowY: "auto",
}
