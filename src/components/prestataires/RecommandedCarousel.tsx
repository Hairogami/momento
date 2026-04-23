"use client"
import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"

const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"

type VendorReco = {
  id: string; slug: string; name: string; category: string; city: string | null
  rating: number | null; reviewCount: number; featured: boolean
  priceMin: number | null; priceMax: number | null
}
type Reco = { category: string; vendor: VendorReco | null }

type Props = { plannerId: string }

export default function RecommandedCarousel({ plannerId }: Props) {
  const [recos, setRecos] = useState<Reco[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectingSlug, setSelectingSlug] = useState<string | null>(null)
  const [changingCat, setChangingCat] = useState<string | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  const fetchRecos = useCallback(() => {
    let cancelled = false
    setLoading(true)
    fetch(`/api/planners/${plannerId}/recommendations`, { cache: "no-store" })
      .then(r => r.ok ? r.json() : [])
      .then((data: Reco[]) => { if (!cancelled) setRecos(Array.isArray(data) ? data : []) })
      .catch(() => { if (!cancelled) setRecos([]) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [plannerId])

  useEffect(() => {
    const cleanup = fetchRecos()
    return cleanup
  }, [fetchRecos])

  function scrollBy(dx: number) {
    trackRef.current?.scrollBy({ left: dx, behavior: "smooth" })
  }

  /**
   * Sélectionne ce vendor dans le planner (crée un PlannerVendor status=contacted).
   * Après sélection, le carrousel re-fetch → ce vendor disparaît (exclu côté API)
   * et le top-2 de sa catégorie prend sa place.
   */
  async function selectVendor(vendor: VendorReco) {
    setSelectingSlug(vendor.slug)
    try {
      const r = await fetch(`/api/planners/${plannerId}/vendors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorSlug: vendor.slug, status: "contacted" }),
      })
      if (r.ok) fetchRecos()
    } finally {
      setSelectingSlug(null)
    }
  }

  /**
   * "Changer" = re-fetcher la liste (les vendors déjà sélectionnés sont
   * exclus côté API → un autre candidat remonte pour cette catégorie).
   */
  async function changeCategory(category: string) {
    setChangingCat(category)
    try {
      await new Promise(r => setTimeout(r, 200)) // petit delay UX pour le feedback
      fetchRecos()
    } finally {
      setChangingCat(null)
    }
  }

  if (!loading && (!recos || recos.length === 0)) return null

  return (
    <section style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(20px, 2.4vw, 26px)",
            fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.15, margin: 0,
            color: "var(--dash-text, #eeeef5)",
          }}>
            ✨ Nos <em style={{ fontStyle: "italic", backgroundImage: G, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>recommandations</em> pour vous
          </h2>
          <p style={{ fontSize: 12.5, color: "var(--dash-text-3, #8888aa)", margin: "4px 0 0" }}>
            Sélection auto selon votre budget, votre ville et votre événement · Sélectionnez ou changez en 1 clic
          </p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => scrollBy(-400)} aria-label="Précédent" style={navBtn}>←</button>
          <button onClick={() => scrollBy(400)} aria-label="Suivant" style={navBtn}>→</button>
        </div>
      </div>

      <div
        ref={trackRef}
        style={{
          display: "flex", gap: 14, overflowX: "auto",
          scrollSnapType: "x mandatory",
          paddingBottom: 12,
          scrollbarWidth: "thin",
        }}
      >
        {loading && Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ ...cardStyle, background: "var(--dash-faint-2, rgba(255,255,255,0.06))" }} />
        ))}
        {!loading && recos && recos.map(r => (
          <RecoCard
            key={r.category}
            reco={r}
            selectingSlug={selectingSlug}
            changing={changingCat === r.category}
            onSelect={selectVendor}
            onChange={() => changeCategory(r.category)}
          />
        ))}
      </div>
    </section>
  )
}

function RecoCard({
  reco, selectingSlug, changing, onSelect, onChange,
}: {
  reco: Reco
  selectingSlug: string | null
  changing: boolean
  onSelect: (v: VendorReco) => void
  onChange: () => void
}) {
  const { category, vendor } = reco
  if (!vendor) {
    return (
      <div style={{ ...cardStyle, padding: 18, border: "1.5px dashed var(--dash-border, rgba(255,255,255,0.07))", background: "var(--dash-faint, rgba(255,255,255,0.04))", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", color: "var(--dash-text-3, #8888aa)" }}>
        <div style={{ fontSize: 24, marginBottom: 6 }}>🌱</div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: "var(--dash-text-2, #b0b0cc)" }}>{category}</div>
        <div style={{ fontSize: 11, marginBottom: 10 }}>Aucun dans votre fourchette</div>
        <Link href={`/explore?cat=${encodeURIComponent(category)}`} style={{ fontSize: 11, color: "var(--g1,#E11D48)", textDecoration: "underline", fontWeight: 600 }}>
          Élargir la recherche →
        </Link>
      </div>
    )
  }
  const priceLabel = vendor.priceMin && vendor.priceMax
    ? `${Math.round(vendor.priceMin / 1000)}–${Math.round(vendor.priceMax / 1000)}k MAD`
    : vendor.priceMin ? `dès ${Math.round(vendor.priceMin / 1000)}k MAD` : null

  const isSelecting = selectingSlug === vendor.slug

  return (
    <div style={cardStyle}>
      <div style={{ position: "relative", aspectRatio: "4 / 3", background: "linear-gradient(135deg, #2a1a2e, #1a1a2a)", overflow: "hidden" }}>
        <span style={{ position: "absolute", top: 10, left: 10, padding: "3px 9px", fontSize: 10.5, color: "#fff", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", borderRadius: 99, fontWeight: 600, zIndex: 2 }}>{category}</span>
        <span style={{ position: "absolute", top: 10, right: 10, padding: "3px 9px", fontSize: 10, color: "#fff", background: G, borderRadius: 99, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", zIndex: 2, boxShadow: "0 3px 10px rgba(225,29,72,0.4)" }}>✨ Reco</span>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,transparent 55%,rgba(0,0,0,0.55))" }} />
      </div>
      <div style={{ padding: "12px 14px 14px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: "-0.01em", color: "var(--dash-text, #eeeef5)" }}>{vendor.name}</div>
        <div style={{ fontSize: 11, color: "var(--dash-text-3, #8888aa)", marginTop: 3 }}>
          <span style={{ color: "#f59e0b" }}>★ {vendor.rating?.toFixed(1) ?? "—"}</span>
          {vendor.city && <> · {vendor.city}</>}
          {vendor.reviewCount > 0 && <> · {vendor.reviewCount} avis</>}
        </div>
        {priceLabel && <div style={{ fontSize: 12, color: "#22c55e", fontWeight: 700, marginTop: 7 }}>≈ {priceLabel}</div>}
        <div style={{ marginTop: "auto", paddingTop: 10, display: "flex", gap: 5, flexWrap: "wrap" }}>
          <button
            onClick={() => onSelect(vendor)}
            disabled={isSelecting}
            style={{ ...btnSelect, opacity: isSelecting ? 0.6 : 1, cursor: isSelecting ? "wait" : "pointer" }}
          >
            {isSelecting ? "…" : "+ Sélectionner"}
          </button>
          <Link href={`/vendor/${vendor.slug}`} style={btnView}>Voir</Link>
          <button
            onClick={onChange}
            disabled={changing}
            style={{ ...btnChange, opacity: changing ? 0.5 : 1, cursor: changing ? "wait" : "pointer" }}
            title="Proposer un autre prestataire de cette catégorie"
          >
            {changing ? "…" : "↻"}
          </button>
        </div>
      </div>
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  flexShrink: 0, width: 240, minHeight: 260,
  scrollSnapAlign: "start",
  background: "var(--dash-surface, #16171e)",
  border: "1px solid var(--dash-border, rgba(255,255,255,0.07))",
  borderRadius: 18, overflow: "hidden",
  display: "flex", flexDirection: "column",
  transition: "transform .2s, border-color .15s, box-shadow .2s",
}

const btnSelect: React.CSSProperties = {
  flex: "1 1 100%", padding: "7px 10px", fontSize: 11.5, color: "#fff",
  background: G, border: "none", borderRadius: 99, fontWeight: 700,
  fontFamily: "inherit", textAlign: "center",
  boxShadow: "0 2px 8px rgba(225,29,72,0.25)",
}
const btnView: React.CSSProperties = {
  flex: 1, padding: "7px 10px", fontSize: 11.5, color: "var(--dash-text-2, #b0b0cc)",
  background: "var(--dash-faint, rgba(255,255,255,0.04))",
  border: "1px solid var(--dash-border, rgba(255,255,255,0.07))",
  borderRadius: 99, fontWeight: 600, textAlign: "center", textDecoration: "none",
}
const btnChange: React.CSSProperties = {
  width: 34, height: 28, fontSize: 13, color: "var(--dash-text-2, #b0b0cc)",
  background: "var(--dash-faint, rgba(255,255,255,0.04))",
  border: "1px solid var(--dash-border, rgba(255,255,255,0.07))",
  borderRadius: 99, fontWeight: 600, fontFamily: "inherit",
  display: "flex", alignItems: "center", justifyContent: "center",
}
const navBtn: React.CSSProperties = {
  width: 34, height: 34, borderRadius: 99,
  background: "var(--dash-faint, rgba(255,255,255,0.04))",
  border: "1px solid var(--dash-border, rgba(255,255,255,0.07))",
  color: "var(--dash-text-2, #b0b0cc)", cursor: "pointer", fontSize: 14,
  display: "flex", alignItems: "center", justifyContent: "center",
  fontFamily: "inherit", fontWeight: 600,
}
