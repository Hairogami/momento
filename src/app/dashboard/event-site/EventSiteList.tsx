"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import AntNav from "@/components/clone/AntNav"
import DashSidebar from "@/components/clone/dashboard/DashSidebar"
import CreateEventModal from "@/components/clone/dashboard/CreateEventModal"
import { usePlanners } from "@/hooks/usePlanners"
import { PALETTES, FONTS } from "@/lib/eventSiteTokens"

const G = "linear-gradient(135deg, #E11D48, #9333EA)"

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

const EVENT_TYPE_EMOJI: Record<string, string> = {
  mariage: "💍",
  fete: "🎉",
  naissance: "👶",
  milestones: "🎂",
  corporate: "💼",
  conference: "🎤",
  religieux: "🕌",
  caritatif: "❤️",
  loisirs: "🎨",
  autre: "✨",
}

function formatDate(d: string | Date | null): string {
  if (!d) return "Date à définir"
  const date = typeof d === "string" ? new Date(d) : d
  if (isNaN(date.getTime())) return "Date à définir"
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
}

export default function EventSiteList({ sites, orphans }: Props) {
  const router = useRouter()
  const { events, activeEventId, setActiveEventId } = usePlanners()
  const [creating, setCreating] = useState(false)
  const [selectedPlannerId, setSelectedPlannerId] = useState<string>(orphans[0]?.id ?? "")
  const [error, setError] = useState<string | null>(null)
  const [showCreateEventModal, setShowCreateEventModal] = useState(false)
  const [showOrphanPicker, setShowOrphanPicker] = useState(false)

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

  function openCreateEventModal() {
    setShowCreateEventModal(true)
  }

  function handleEventCreated() {
    setShowCreateEventModal(false)
    router.push("/planner")
  }

  function handleNewSiteClick() {
    if (orphans.length === 0) {
      openCreateEventModal()
    } else {
      setShowOrphanPicker(true)
    }
  }

  // Empty state — aucun planner du tout
  if (sites.length === 0 && orphans.length === 0) {
    return (
      <div className="ant-root" style={pageStyle}>
        <div className="hidden lg:flex">
          <DashSidebar events={events} activeEventId={activeEventId} onEventChange={setActiveEventId} />
        </div>
        <div className="lg:hidden"><AntNav /></div>
        <main className="pb-20 md:pb-0" style={contentStyle}>
          <EmptyHero onCreate={openCreateEventModal} />
        </main>
        <CreateEventModal
          open={showCreateEventModal}
          onClose={() => setShowCreateEventModal(false)}
          onCreated={handleEventCreated}
        />
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
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Header */}
          <div style={{
            marginBottom: 32, display: "flex", alignItems: "flex-start",
            justifyContent: "space-between", flexWrap: "wrap", gap: 12,
          }}>
            <div>
              <h1 style={{
                fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 700,
                color: "var(--dash-text,#121317)", margin: "0 0 6px",
                letterSpacing: "-0.02em",
              }}>
                Sites événement
              </h1>
              <p style={{ fontSize: 13, color: "var(--dash-text-2,#6a6a71)", margin: 0 }}>
                {sites.length} site{sites.length !== 1 ? "s" : ""} {sites.length > 1 ? "créés" : "créé"}
                {orphans.length > 0 && ` · ${orphans.length} événement${orphans.length !== 1 ? "s" : ""} sans site`}
              </p>
            </div>

            <button
              onClick={handleNewSiteClick}
              style={{
                padding: "8px 16px", borderRadius: 99, fontSize: 12, fontWeight: 600,
                border: "none", background: G, color: "#fff",
                cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
              }}
            >+ Nouveau site</button>
          </div>

          {/* Section : sites existants */}
          {sites.length > 0 && (
            <section style={{ marginBottom: 40 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--dash-text,#121317)", margin: 0 }}>
                  Vos sites
                </h2>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                  background: "rgba(34,197,94,0.1)", color: "#22c55e",
                }}>
                  {sites.length} {sites.length > 1 ? "sites" : "site"}
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {sites.map(({ planner, site }) => (
                  <SiteCardItem key={site.id} planner={planner} site={site} />
                ))}
              </div>
            </section>
          )}

          {/* Section : événements orphelins (cards visuelles) */}
          {orphans.length > 0 && (
            <section>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--dash-text,#121317)", margin: 0 }}>
                  Événements sans site
                </h2>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                  background: "rgba(225,29,72,0.08)", color: "#E11D48",
                }}>
                  {orphans.length} en attente
                </span>
              </div>
              <p style={{ fontSize: 13, color: "var(--dash-text-2,#6a6a71)", margin: "0 0 16px" }}>
                Créez un site pour partager les infos et collecter les RSVP.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                {orphans.map(o => (
                  <OrphanCard
                    key={o.id}
                    orphan={o}
                    onCreate={() => {
                      setSelectedPlannerId(o.id)
                      void createOneClick(o.id)
                    }}
                    busy={creating && selectedPlannerId === o.id}
                  />
                ))}
              </div>
              {error && (
                <div style={{
                  marginTop: 14, padding: "10px 14px", borderRadius: 10,
                  background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.25)",
                  fontSize: 12, color: "#dc2626",
                }}>
                  {error}
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      {/* Modal picker (déclenché par le CTA top-right si orphans > 0) */}
      {showOrphanPicker && (
        <OrphanPickerModal
          orphans={orphans}
          selectedId={selectedPlannerId}
          onSelect={setSelectedPlannerId}
          onClose={() => setShowOrphanPicker(false)}
          onConfirm={async () => {
            await createSite()
          }}
          creating={creating}
          error={error}
        />
      )}

      <CreateEventModal
        open={showCreateEventModal}
        onClose={() => setShowCreateEventModal(false)}
        onCreated={handleEventCreated}
      />
    </div>
  )

  // ── helpers locaux ─────────────────────────────────────────────────────
  async function createOneClick(plannerId: string) {
    setCreating(true)
    setError(null)
    try {
      const r = await fetch("/api/event-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plannerId }),
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
}

/**
 * Empty state hero — style cohérent avec le dashboard "premier événement"
 */
function EmptyHero({ onCreate }: { onCreate: () => void }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      textAlign: "center", padding: "60px 24px", maxWidth: 640, margin: "0 auto",
    }}>
      {/* Icône gradient */}
      <div style={{
        width: 72, height: 72, borderRadius: 22,
        background: G,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 24,
        boxShadow: "0 16px 48px rgba(225,29,72,0.25)",
      }}>
        <span style={{
          fontFamily: "'Google Symbols','Material Symbols Outlined'",
          fontSize: 36, color: "#fff", lineHeight: 1,
        }}>share</span>
      </div>

      <p style={{
        fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
        color: "#E11D48", margin: "0 0 12px",
      }}>
        ✦ Sites événement ✦
      </p>

      <h1 style={{
        fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700,
        color: "var(--dash-text,#121317)", letterSpacing: "-0.025em",
        margin: "0 0 12px", lineHeight: 1.15,
      }}>
        Créez votre premier site
      </h1>
      <p style={{
        fontSize: 15, color: "var(--dash-text-2,#6a6a71)",
        margin: "0 0 28px", lineHeight: 1.6, maxWidth: 440,
      }}>
        Partagez les infos pratiques, le programme et collectez les RSVP de vos invités — un site personnalisé par événement.
      </p>

      <button
        type="button"
        onClick={onCreate}
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "14px 32px", borderRadius: 14,
          background: G, color: "#fff",
          fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer",
          fontFamily: "inherit",
          boxShadow: "0 8px 24px rgba(225,29,72,0.3)",
        }}
      >
        Créer un événement
      </button>
    </div>
  )
}

/**
 * Card mini-replica du hero du site événement.
 */
function SiteCardItem({ planner, site }: { planner: SiteCard["planner"]; site: SiteCard["site"] }) {
  const router = useRouter()
  const palette = PALETTES.find(p => p.id === site.palette) ?? PALETTES[0]!
  const eventTypeLabel = EVENT_TYPE_LABEL[planner.eventType ?? "autre"] ?? "Événement"
  const headingFont = FONTS["cormorant"].stack
  const title = planner.coupleNames || planner.title || "Événement"

  return (
    <button
      type="button"
      onClick={() => router.push(`/dashboard/event-site/${site.id}`)}
      style={{
        display: "block", width: "100%", padding: 0, textAlign: "left",
        borderRadius: 16, overflow: "hidden",
        background: palette.bg,
        border: `1px solid ${palette.main}33`,
        cursor: "pointer",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        transition: "transform 150ms ease, box-shadow 150ms ease",
        fontFamily: "inherit",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-2px)"
        e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,0.12)"
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)"
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)"
      }}
    >
      <div style={{
        position: "relative",
        aspectRatio: "16/10",
        background: site.heroImageUrl
          ? `linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%), url(${site.heroImageUrl}) center/cover no-repeat`
          : `linear-gradient(135deg, ${palette.bg} 0%, ${palette.secondary} 100%)`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "20px 16px", gap: 8, overflow: "hidden",
      }}>
        {!site.heroImageUrl && (
          <div aria-hidden style={{
            position: "absolute", inset: 0,
            backgroundImage: `radial-gradient(circle at 20% 30%, ${palette.main}1a 0%, transparent 30%), radial-gradient(circle at 80% 70%, ${palette.accent}1a 0%, transparent 30%)`,
            pointerEvents: "none",
          }} />
        )}

        <div style={{
          position: "relative", zIndex: 1,
          fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase",
          color: site.heroImageUrl ? "rgba(255,255,255,0.85)" : palette.main, fontWeight: 600,
        }}>
          · {formatDate(planner.weddingDate).toUpperCase()} ·
        </div>

        <div style={{
          position: "relative", zIndex: 1,
          fontFamily: headingFont,
          fontSize: "clamp(1.3rem, 2.4vw, 1.7rem)",
          color: site.heroImageUrl ? "#fff" : palette.text,
          fontWeight: 500, letterSpacing: "-0.01em", lineHeight: 1.1,
          textAlign: "center",
          maxWidth: "90%",
          overflow: "hidden", textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical" as const,
        }}>
          {title}
        </div>

        <div style={{
          position: "absolute", top: 10, right: 10,
          padding: "3px 9px", borderRadius: 99,
          background: site.published ? "rgba(22,163,74,0.95)" : "rgba(0,0,0,0.65)",
          color: "#fff", fontSize: 9, fontWeight: 700,
          letterSpacing: "0.08em", textTransform: "uppercase",
        }}>
          {site.published ? "Publié" : "Brouillon"}
        </div>

        <div style={{
          position: "absolute", bottom: 10, left: 10,
          display: "flex", gap: 3,
        }}>
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: palette.main, border: "1.5px solid rgba(255,255,255,0.7)" }} />
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: palette.accent, border: "1.5px solid rgba(255,255,255,0.7)" }} />
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: palette.secondary, border: "1.5px solid rgba(255,255,255,0.7)" }} />
        </div>
      </div>

      <div style={{
        padding: "12px 14px 14px",
        background: "var(--dash-surface,#fff)",
        borderTop: `1px solid ${palette.main}1a`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <span style={chipStyle}>{eventTypeLabel}</span>
        </div>
        {site.published ? (
          <p style={{ fontSize: 11, color: "var(--dash-text-3,#9a9aaa)", margin: 0, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            /evt/{site.slug}
          </p>
        ) : (
          <p style={{ fontSize: 11, color: "var(--dash-text-3,#9a9aaa)", margin: 0, fontStyle: "italic" }}>
            Pas encore publié — cliquez pour éditer
          </p>
        )}
      </div>
    </button>
  )
}

/**
 * Card pour un événement orphelin — invite à créer un site en 1 clic.
 */
function OrphanCard({ orphan, onCreate, busy }: { orphan: Orphan; onCreate: () => void; busy: boolean }) {
  const eventTypeLabel = EVENT_TYPE_LABEL[orphan.eventType ?? "autre"] ?? "Événement"
  const emoji = EVENT_TYPE_EMOJI[orphan.eventType ?? "autre"] ?? "✨"
  const title = orphan.coupleNames || orphan.title || "Événement"

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      borderRadius: 16, overflow: "hidden",
      background: "var(--dash-surface,#fff)",
      border: "1px dashed rgba(225,29,72,0.3)",
      transition: "border-color 150ms ease, transform 150ms ease",
    }}>
      {/* Bandeau eyebrow */}
      <div style={{
        padding: "32px 18px",
        background: "linear-gradient(135deg, rgba(225,29,72,0.06) 0%, rgba(147,51,234,0.06) 100%)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        borderBottom: "1px dashed rgba(225,29,72,0.2)",
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 16,
          background: "rgba(255,255,255,0.9)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 26,
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
        }}>{emoji}</div>
        <div style={{
          fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
          color: "#E11D48",
        }}>Aucun site</div>
      </div>

      {/* Body */}
      <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div>
          <div style={{
            fontSize: 15, fontWeight: 700, color: "var(--dash-text,#121317)",
            letterSpacing: "-0.01em", marginBottom: 3,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{title}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={chipStyle}>{eventTypeLabel}</span>
            <span style={{ fontSize: 11, color: "var(--dash-text-3,#9a9aaa)" }}>
              {formatDate(orphan.weddingDate)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onCreate}
          disabled={busy}
          style={{
            padding: "10px 14px", borderRadius: 10,
            border: "none", background: G, color: "#fff",
            fontSize: 13, fontWeight: 600, cursor: busy ? "wait" : "pointer",
            fontFamily: "inherit",
            opacity: busy ? 0.7 : 1,
            boxShadow: "0 4px 12px rgba(225,29,72,0.18)",
          }}
        >
          {busy ? "Création…" : "Créer le site"}
        </button>
      </div>
    </div>
  )
}

/**
 * Modal picker pour choisir l'événement (déclenché depuis CTA top-right).
 */
function OrphanPickerModal({
  orphans, selectedId, onSelect, onClose, onConfirm, creating, error,
}: {
  orphans: Orphan[]
  selectedId: string
  onSelect: (id: string) => void
  onClose: () => void
  onConfirm: () => void
  creating: boolean
  error: string | null
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 480, maxHeight: "85vh", overflowY: "auto",
          borderRadius: 18, background: "var(--dash-surface,#fff)",
          padding: "24px 22px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <h2 style={{
            fontSize: 18, fontWeight: 700, margin: "0 0 4px",
            color: "var(--dash-text,#121317)", letterSpacing: "-0.02em",
          }}>Pour quel événement ?</h2>
          <p style={{ fontSize: 12, color: "var(--dash-text-2,#6a6a71)", margin: 0 }}>
            Sélectionnez l&apos;événement pour lequel créer un site.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
          {orphans.map(o => {
            const selected = selectedId === o.id
            const emoji = EVENT_TYPE_EMOJI[o.eventType ?? "autre"] ?? "✨"
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => onSelect(o.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px", borderRadius: 12, textAlign: "left",
                  border: selected ? "1.5px solid #E11D48" : "1px solid rgba(183,191,217,0.25)",
                  background: selected ? "rgba(225,29,72,0.04)" : "var(--dash-surface,#fff)",
                  cursor: "pointer", fontFamily: "inherit",
                  transition: "all 120ms ease",
                }}
              >
                <span style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: "rgba(225,29,72,0.06)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, flexShrink: 0,
                }}>{emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 14, fontWeight: 600, color: "var(--dash-text,#121317)",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {o.coupleNames || o.title}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--dash-text-3,#9a9aaa)", marginTop: 1 }}>
                    {EVENT_TYPE_LABEL[o.eventType ?? "autre"] ?? "Événement"} · {formatDate(o.weddingDate)}
                  </div>
                </div>
                {selected && (
                  <span style={{
                    fontFamily: "'Google Symbols','Material Symbols Outlined'",
                    fontSize: 20, color: "#E11D48",
                  }}>check_circle</span>
                )}
              </button>
            )
          })}
        </div>

        {error && (
          <div style={{
            padding: "8px 12px", borderRadius: 8,
            background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.25)",
            fontSize: 12, color: "#dc2626", marginBottom: 12,
          }}>{error}</div>
        )}

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "10px 16px", borderRadius: 10,
              border: "1px solid rgba(183,191,217,0.3)",
              background: "transparent", color: "var(--dash-text-2,#6a6a71)",
              fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            }}
          >Annuler</button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={creating || !selectedId}
            style={{
              padding: "10px 18px", borderRadius: 10,
              border: "none", background: G, color: "#fff",
              fontSize: 13, fontWeight: 600,
              cursor: (creating || !selectedId) ? "not-allowed" : "pointer",
              opacity: (creating || !selectedId) ? 0.6 : 1,
              fontFamily: "inherit",
              boxShadow: "0 4px 12px rgba(225,29,72,0.2)",
            }}
          >{creating ? "Création…" : "Créer le site"}</button>
        </div>
      </div>
    </div>
  )
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

const pageStyle: React.CSSProperties = {
  display: "flex", minHeight: "100vh",
  background: "var(--dash-bg,#f7f7fb)",
  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
}

const contentStyle: React.CSSProperties = {
  flex: 1, padding: "clamp(16px, 4vw, 32px)", overflowY: "auto",
}
