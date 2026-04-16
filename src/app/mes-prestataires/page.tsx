"use client"
import { useEffect, useState, useCallback } from "react"
import AntNav from "@/components/clone/AntNav"
import VendorDiscoverCard, { type DiscoverVendor } from "@/components/prestataires/VendorDiscoverCard"
import { usePlanners } from "@/hooks/usePlanners"

const G = "linear-gradient(135deg, #E11D48, #9333EA)"

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  contacted: { label: "Contacté",  color: "#f59e0b" },
  replied:   { label: "A répondu", color: "#3b82f6" },
  confirmed: { label: "Confirmé",  color: "#22c55e" },
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

  function handleInterestResult(vendorSlug: string, result: { type: string; conversationId?: string; phone?: string | null }) {
    if (planner) loadPlanner(planner.id)
    if (result.type === "message") {
      // Could show a toast here — for now just reload
    }
  }

  const vendorsByCategory = (planner?.categories ?? []).reduce<Record<string, PlannerVendor[]>>((acc, cat) => {
    acc[cat] = plannerVendors.filter(pv => pv.vendor.category === cat)
    return acc
  }, {})

  if (!activeEventId && events.length === 0) {
    return (
      <div style={pageStyle}>
        <AntNav />
        <div style={contentStyle}>
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <p style={{ fontSize: 40, marginBottom: 16 }}>🎉</p>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--dash-text,#121317)", margin: "0 0 8px" }}>Aucun événement</h2>
            <p style={{ fontSize: 13, color: "var(--dash-text-2,#6a6a71)" }}>Créez un événement pour commencer à sélectionner vos prestataires.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      <AntNav />
      <div style={contentStyle}>
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

          {/* Event switcher */}
          {events.length > 1 && (
            <select
              value={activeEventId}
              onChange={e => setActiveEventId(e.target.value)}
              style={{
                padding: "8px 14px", borderRadius: 12, fontSize: 12, fontWeight: 600,
                border: "1.5px solid rgba(183,191,217,0.4)", background: "var(--dash-surface,#fff)", color: "var(--dash-text,#121317)",
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "var(--dash-text-3,#9a9aaa)", fontSize: 13 }}>Chargement…</div>
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
                          <select
                            value={pv.status}
                            onChange={e => updateStatus(pv.vendorSlug, e.target.value)}
                            style={{
                              flex: 1, padding: "6px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                              border: "1.5px solid rgba(183,191,217,0.3)",
                              background: `${STATUS_LABELS[pv.status]?.color ?? "#9a9aaa"}15`,
                              color: STATUS_LABELS[pv.status]?.color ?? "#9a9aaa",
                              cursor: "pointer", fontFamily: "inherit",
                            }}
                          >
                            {Object.entries(STATUS_LABELS).map(([v, s]) => (
                              <option key={v} value={v}>{s.label}</option>
                            ))}
                          </select>
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
      </div>

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
                <p style={{ textAlign: "center", color: "var(--dash-text-3,#9a9aaa)", padding: 40, fontSize: 13 }}>Chargement…</p>
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
  minHeight: "100vh",
  background: "var(--dash-bg,#f7f7fb)",
  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
}

const contentStyle: React.CSSProperties = {
  maxWidth: 1100, margin: "0 auto", padding: "100px 24px 80px",
}
