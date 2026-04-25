"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { PALETTES } from "@/lib/eventSiteTokens"

type SiteCard = {
  planner: {
    id: string
    title: string
    coupleNames: string
    weddingDate: string | Date | null
    eventType: string | null
  }
  site: {
    id: string
    slug: string
    published: boolean
    template: string
    palette: string
    heroImageUrl: string | null
    updatedAt: Date
  }
}

type Orphan = {
  id: string
  title: string
  coupleNames: string
  weddingDate: string | Date | null
  eventType: string | null
}

type Props = {
  sites: SiteCard[]
  orphans: Orphan[]
}

const EVENT_TYPE_LABEL: Record<string, string> = {
  mariage: "Mariage",
  fete: "Fête familiale",
  naissance: "Naissance",
  milestones: "Anniversaire",
  corporate: "Corporate",
  conference: "Conférence",
  religieux: "Religieux",
  caritatif: "Caritatif",
  loisirs: "Loisirs",
  autre: "Autre",
}

function formatDate(d: string | Date | null): string {
  if (!d) return "Date à définir"
  const date = typeof d === "string" ? new Date(d) : d
  if (isNaN(date.getTime())) return "Date à définir"
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
}

export default function EventSiteList({ sites, orphans }: Props) {
  const router = useRouter()
  const [creating, setCreating] = useState(false)
  const [selectedPlannerId, setSelectedPlannerId] = useState<string>(orphans[0]?.id ?? "")
  const [error, setError] = useState<string | null>(null)

  async function createSite() {
    if (!selectedPlannerId) return
    setCreating(true)
    setError(null)
    try {
      const r = await fetch("/api/event-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plannerId: selectedPlannerId }),
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) {
        setError(data.error ?? `Erreur ${r.status}`)
        setCreating(false)
        return
      }
      router.push(`/dashboard/event-site/${data.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur réseau")
      setCreating(false)
    }
  }

  // Empty state — aucun planner du tout
  if (sites.length === 0 && orphans.length === 0) {
    return (
      <div style={{ padding: "60px 24px", maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
        <h1 style={titleStyle}>Sites événement</h1>
        <div style={{ marginTop: 32, padding: "40px 24px", borderRadius: 14, border: "1px dashed var(--dash-border,rgba(183,191,217,0.3))", background: "var(--dash-faint,rgba(183,191,217,0.04))" }}>
          <div style={{ fontSize: 38, marginBottom: 12 }}>🎉</div>
          <p style={{ fontSize: 14, color: "var(--dash-text-2,#6a6a71)", margin: "0 0 18px", lineHeight: 1.6 }}>
            Vous n&apos;avez pas encore d&apos;événement.
            <br />
            Créez-en un pour pouvoir générer son site.
          </p>
          <Link href="/planner" style={ctaPrimaryStyle}>Créer un événement</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: "32px 24px 80px", maxWidth: 1200, margin: "0 auto" }}>
      <header style={{ marginBottom: 28 }}>
        <h1 style={titleStyle}>Sites événement</h1>
        <p style={{ fontSize: 13, color: "var(--dash-text-2,#6a6a71)", margin: "6px 0 0" }}>
          Un site personnalisable par événement — pour partager les infos et collecter les RSVP.
        </p>
      </header>

      {/* Section : sites existants */}
      {sites.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <h2 style={sectionTitleStyle}>Vos sites ({sites.length})</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {sites.map(({ planner, site }) => {
              const palette = PALETTES.find(p => p.id === site.palette) ?? PALETTES[0]
              const eventTypeLabel = EVENT_TYPE_LABEL[planner.eventType ?? "autre"] ?? "Événement"
              return (
                <Link
                  key={site.id}
                  href={`/dashboard/event-site/${site.id}`}
                  style={cardLinkStyle}
                >
                  {/* Vignette hero */}
                  <div style={{
                    position: "relative",
                    aspectRatio: "16/9",
                    background: site.heroImageUrl
                      ? `url(${site.heroImageUrl}) center/cover no-repeat`
                      : `linear-gradient(135deg, ${palette?.main ?? "#C1713A"} 0%, ${palette?.accent ?? "#8B4513"} 100%)`,
                    borderRadius: "10px 10px 0 0",
                  }}>
                    {/* Badge status */}
                    <div style={{
                      position: "absolute", top: 10, right: 10,
                      padding: "4px 10px", borderRadius: 99,
                      background: site.published ? "rgba(22,163,74,0.95)" : "rgba(0,0,0,0.65)",
                      color: "#fff", fontSize: 10, fontWeight: 700,
                      letterSpacing: "0.08em", textTransform: "uppercase",
                    }}>
                      {site.published ? "Publié" : "Brouillon"}
                    </div>
                    {/* Mini palette swatches */}
                    {palette && (
                      <div style={{
                        position: "absolute", bottom: 10, left: 10,
                        display: "flex", gap: 4,
                      }}>
                        <span style={{ width: 14, height: 14, borderRadius: "50%", background: palette.main, border: "1.5px solid rgba(255,255,255,0.6)" }} />
                        <span style={{ width: 14, height: 14, borderRadius: "50%", background: palette.accent, border: "1.5px solid rgba(255,255,255,0.6)" }} />
                      </div>
                    )}
                  </div>

                  {/* Contenu card */}
                  <div style={{ padding: "14px 14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <span style={chipStyle}>{eventTypeLabel}</span>
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 4px", color: "var(--dash-text,#121317)", lineHeight: 1.3 }}>
                      {planner.coupleNames || planner.title || "Événement"}
                    </h3>
                    <p style={{ fontSize: 12, color: "var(--dash-text-2,#6a6a71)", margin: "0 0 8px" }}>
                      {formatDate(planner.weddingDate)}
                    </p>
                    {site.published && (
                      <p style={{ fontSize: 11, color: "var(--dash-text-3,#9a9aaa)", margin: 0, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        /evt/{site.slug}
                      </p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Section : créer un site pour un événement orphelin */}
      <section>
        <h2 style={sectionTitleStyle}>Créer un nouveau site</h2>
        {orphans.length === 0 ? (
          <div style={{ padding: "20px 18px", borderRadius: 12, background: "var(--dash-faint,rgba(183,191,217,0.05))", border: "1px solid var(--dash-border,rgba(183,191,217,0.2))" }}>
            <p style={{ fontSize: 13, color: "var(--dash-text-2,#6a6a71)", margin: "0 0 10px" }}>
              Tous vos événements ont déjà un site. Créez un nouvel événement pour ajouter un autre site.
            </p>
            <Link href="/planner" style={ctaSecondaryStyle}>Créer un événement</Link>
          </div>
        ) : (
          <div style={{ padding: "18px", borderRadius: 12, background: "var(--dash-surface,#fff)", border: "1px solid var(--dash-border,rgba(183,191,217,0.25))" }}>
            <p style={{ fontSize: 13, color: "var(--dash-text-2,#6a6a71)", margin: "0 0 12px" }}>
              Choisissez l&apos;événement pour lequel créer un site :
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
              {orphans.map(o => (
                <label key={o.id} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px", borderRadius: 8,
                  border: selectedPlannerId === o.id ? "1.5px solid var(--g1,#E11D48)" : "1px solid var(--dash-border,rgba(183,191,217,0.2))",
                  background: selectedPlannerId === o.id ? "rgba(225,29,72,0.04)" : "transparent",
                  cursor: "pointer", transition: "all 120ms ease",
                }}>
                  <input
                    type="radio"
                    name="orphan"
                    value={o.id}
                    checked={selectedPlannerId === o.id}
                    onChange={() => setSelectedPlannerId(o.id)}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--dash-text,#121317)" }}>
                      {o.coupleNames || o.title}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--dash-text-3,#9a9aaa)", marginTop: 2 }}>
                      {EVENT_TYPE_LABEL[o.eventType ?? "autre"] ?? "Événement"} · {formatDate(o.weddingDate)}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {error && (
              <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.25)", fontSize: 12, color: "#dc2626", marginBottom: 12 }}>
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={createSite}
              disabled={creating || !selectedPlannerId}
              style={{
                ...ctaPrimaryStyle,
                opacity: (creating || !selectedPlannerId) ? 0.6 : 1,
                cursor: (creating || !selectedPlannerId) ? "not-allowed" : "pointer",
                display: "inline-block",
              }}
            >
              {creating ? "Création…" : "Créer le site"}
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

const titleStyle: React.CSSProperties = {
  fontSize: "clamp(1.6rem, 3vw, 2rem)",
  fontWeight: 700,
  margin: 0,
  color: "var(--dash-text,#121317)",
}

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--dash-text-2,#6a6a71)",
  margin: "0 0 14px",
}

const chipStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "var(--dash-text-2,#6a6a71)",
  background: "var(--dash-faint,rgba(183,191,217,0.1))",
  padding: "3px 8px",
  borderRadius: 99,
}

const cardLinkStyle: React.CSSProperties = {
  display: "block",
  borderRadius: 12,
  overflow: "hidden",
  background: "var(--dash-surface,#fff)",
  border: "1px solid var(--dash-border,rgba(183,191,217,0.2))",
  textDecoration: "none",
  transition: "transform 150ms ease, box-shadow 150ms ease",
  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
}

const ctaPrimaryStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "10px 18px",
  borderRadius: 10,
  border: "none",
  background: "linear-gradient(135deg,#E11D48,#9333EA)",
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
  textDecoration: "none",
  fontFamily: "inherit",
  cursor: "pointer",
}

const ctaSecondaryStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "9px 14px",
  borderRadius: 9,
  border: "1px solid var(--dash-border,rgba(183,191,217,0.3))",
  background: "var(--dash-surface,#fff)",
  color: "var(--dash-text,#121317)",
  fontSize: 12,
  fontWeight: 600,
  textDecoration: "none",
  fontFamily: "inherit",
  cursor: "pointer",
}
