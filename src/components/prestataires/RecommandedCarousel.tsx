"use client"
import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import VendorDiscoverCard, { type DiscoverVendor } from "./VendorDiscoverCard"

const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"

type VendorReco = DiscoverVendor & {
  priceMin: number | null
  priceMax: number | null
}
type Reco = { category: string; vendor: VendorReco | null }

type Props = {
  plannerId: string
  /**
   * Callback optionnel déclenché après une sélection réussie — utile pour
   * que la page parente re-fetche la liste des PlannerVendor et affiche
   * immédiatement la carte dans la section "sélectionnés" (sans refresh).
   */
  onVendorSelected?: () => void
}

export default function RecommandedCarousel({ plannerId, onVendorSelected }: Props) {
  const [recos, setRecos] = useState<Reco[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectingSlug, setSelectingSlug] = useState<string | null>(null)
  const [changingCat, setChangingCat] = useState<string | null>(null)
  const [fadingOut, setFadingOut] = useState<string | null>(null)
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

  useEffect(() => { return fetchRecos() }, [fetchRecos])

  function scrollBy(dx: number) {
    trackRef.current?.scrollBy({ left: dx, behavior: "smooth" })
  }

  /**
   * Sélectionne le vendor → fade-out animation → crée PlannerVendor → refetch.
   * Le parent (/mes-prestataires) refetche aussi via onVendorSelected pour
   * afficher la carte dans la section "sélectionnés" immédiatement.
   */
  async function selectVendor(vendor: VendorReco) {
    setSelectingSlug(vendor.slug)
    setFadingOut(vendor.slug)
    try {
      const r = await fetch(`/api/planners/${plannerId}/vendors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorSlug: vendor.slug, status: "contacted" }),
      })
      if (r.ok) {
        // Petit delay pour laisser l'animation de sortie se jouer
        await new Promise(res => setTimeout(res, 260))
        onVendorSelected?.()
        fetchRecos()
      }
    } finally {
      setSelectingSlug(null)
      setFadingOut(null)
    }
  }

  async function changeCategory(category: string, slug: string) {
    setChangingCat(category)
    setFadingOut(slug)
    try {
      await new Promise(r => setTimeout(r, 220))
      fetchRecos()
    } finally {
      setChangingCat(null)
      setFadingOut(null)
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
            Sélection auto selon votre budget, votre ville et votre événement
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
          display: "flex", gap: 16, overflowX: "auto",
          scrollSnapType: "x mandatory",
          paddingBottom: 12, paddingRight: 12,
          scrollbarWidth: "thin",
        }}
      >
        {loading && Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ ...skelStyle }} />
        ))}
        {!loading && recos && recos.map(r => (
          <RecoSlot
            key={r.category}
            reco={r}
            plannerId={plannerId}
            isFading={r.vendor ? fadingOut === r.vendor.slug : false}
            selecting={r.vendor ? selectingSlug === r.vendor.slug : false}
            changing={changingCat === r.category}
            onSelect={selectVendor}
            onChange={() => r.vendor && changeCategory(r.category, r.vendor.slug)}
          />
        ))}
      </div>
    </section>
  )
}

function RecoSlot({
  reco, plannerId, isFading, selecting, changing, onSelect, onChange,
}: {
  reco: Reco
  plannerId: string
  isFading: boolean
  selecting: boolean
  changing: boolean
  onSelect: (v: VendorReco) => void
  onChange: () => void
}) {
  const { category, vendor } = reco

  if (!vendor) {
    return (
      <div style={emptySlotStyle}>
        <div style={{ fontSize: 24, marginBottom: 6 }}>🌱</div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: "var(--dash-text-2, #b0b0cc)" }}>{category}</div>
        <div style={{ fontSize: 11, marginBottom: 10, color: "var(--dash-text-3,#9a9aaa)" }}>Aucun dans votre fourchette</div>
        <Link href={`/explore?cat=${encodeURIComponent(category)}`} style={{ fontSize: 11, color: "var(--g1,#E11D48)", textDecoration: "underline", fontWeight: 600 }}>
          Élargir la recherche →
        </Link>
      </div>
    )
  }

  return (
    <div
      style={{
        flexShrink: 0,
        width: 300,
        scrollSnapAlign: "start",
        position: "relative",
        transition: "opacity 0.25s ease, transform 0.25s ease",
        opacity: isFading ? 0 : 1,
        transform: isFading ? "scale(0.96) translateY(-4px)" : "scale(1)",
      }}
    >
      {/* Badge recommandé — superposé en haut-droite de la carte, même style partout */}
      <div style={{
        position: "absolute", top: 12, right: 12, zIndex: 3,
        padding: "4px 10px", fontSize: 10, color: "#fff",
        background: G, borderRadius: 99, fontWeight: 800,
        letterSpacing: "0.06em", textTransform: "uppercase",
        boxShadow: "0 3px 10px rgba(225,29,72,0.4)",
        display: "inline-flex", alignItems: "center", gap: 4,
      }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l2.39 7.36H22l-6.18 4.49 2.36 7.36L12 16.72l-6.18 4.49 2.36-7.36L2 9.36h7.61z" />
        </svg>
        Recommandé
      </div>

      {/* Carte identique à celle des prestataires sélectionnés */}
      <VendorDiscoverCard vendor={vendor} plannerId={plannerId} />

      {/* Actions reco : Sélectionner + Changer */}
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button
          onClick={() => onSelect(vendor)}
          disabled={selecting || changing}
          style={{
            flex: 1, padding: "8px 12px", borderRadius: 10, border: "none",
            background: G, color: "#fff",
            fontSize: 12, fontWeight: 700, fontFamily: "inherit",
            cursor: (selecting || changing) ? "wait" : "pointer",
            opacity: (selecting || changing) ? 0.6 : 1,
            boxShadow: "0 3px 10px rgba(225,29,72,0.25)",
            transition: "opacity 0.15s",
          }}
        >
          {selecting ? "Sélection…" : "✓ Sélectionner"}
        </button>
        <button
          onClick={onChange}
          disabled={selecting || changing}
          title="Proposer un autre prestataire de cette catégorie"
          style={{
            padding: "8px 12px", borderRadius: 10,
            border: "1px solid var(--dash-border,rgba(183,191,217,0.3))",
            background: "var(--dash-faint,rgba(183,191,217,0.06))",
            color: "var(--dash-text,#121317)",
            fontSize: 12, fontWeight: 600, fontFamily: "inherit",
            cursor: (selecting || changing) ? "wait" : "pointer",
            opacity: (selecting || changing) ? 0.5 : 1,
            display: "inline-flex", alignItems: "center", gap: 6,
            transition: "opacity 0.15s",
          }}
        >
          {changing ? "…" : "↻ Changer"}
        </button>
      </div>
    </div>
  )
}

const navBtn: React.CSSProperties = {
  width: 34, height: 34, borderRadius: 99,
  background: "var(--dash-faint, rgba(255,255,255,0.04))",
  border: "1px solid var(--dash-border, rgba(255,255,255,0.07))",
  color: "var(--dash-text-2, #b0b0cc)", cursor: "pointer", fontSize: 14,
  display: "flex", alignItems: "center", justifyContent: "center",
  fontFamily: "inherit", fontWeight: 600,
}

const skelStyle: React.CSSProperties = {
  flexShrink: 0, width: 300, height: 380,
  scrollSnapAlign: "start",
  background: "var(--dash-faint-2, rgba(255,255,255,0.06))",
  borderRadius: 18,
}

const emptySlotStyle: React.CSSProperties = {
  flexShrink: 0, width: 300, minHeight: 260,
  padding: 18,
  scrollSnapAlign: "start",
  border: "1.5px dashed var(--dash-border, rgba(255,255,255,0.07))",
  background: "var(--dash-faint, rgba(255,255,255,0.04))",
  borderRadius: 18,
  display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
  textAlign: "center", color: "var(--dash-text-3, #8888aa)",
}
