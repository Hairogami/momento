"use client"

import { useEffect, useMemo, useState, type CSSProperties } from "react"
import DashSidebar from "@/components/clone/dashboard/DashSidebar"
import AntNav from "@/components/clone/AntNav"
import { usePlanners } from "@/hooks/usePlanners"
import { ViewToggle, type GuestsView } from "@/components/guests/ViewToggle"
import { GuestsExportMenu } from "@/components/guests/GuestsExportMenu"
import { LinkRsvpDialog } from "@/components/guests/LinkRsvpDialog"
import type { Rsvp } from "@/components/guests/RsvpCard"
import type { Guest } from "@/components/guests/GuestCard"
import { dedupRsvps } from "@/lib/rsvpDedup"

const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"

type RsvpsPayload = {
  rsvps: Rsvp[]
  stats: { viewCount: number; confirmed: number; plusOnes: number; total: number }
}

const GUEST_STATUSES = ["pending", "yes", "no", "invited"] as const
const GUEST_LABELS: Record<string, string> = {
  pending: "⏳ En attente",
  yes: "✓ Confirmé",
  no: "✗ Refuse",
  invited: "📞 Invité",
}
const GUEST_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  yes: "#22c55e",
  no: "#ef4444",
  invited: "#9333EA",
}

export default function GuestsPage() {
  const { events, activeEventId, setActiveEventId } = usePlanners()
  const [guests, setGuests] = useState<Guest[]>([])
  const [rsvpData, setRsvpData] = useState<RsvpsPayload | null>(null)
  const [view, setView] = useState<GuestsView>("cards")
  const [linkingRsvpId, setLinkingRsvpId] = useState<string | null>(null)
  const [newGuestName, setNewGuestName] = useState("")

  function handleEventChange(id: string) {
    setActiveEventId(id)
    try { localStorage.setItem("momento_active_event", id) } catch {}
  }

  const activeEvent = events.find(e => e.id === activeEventId) ?? events[0] ?? { id: "", name: "", date: "", color: "#E11D48" }

  useEffect(() => {
    try {
      const v = localStorage.getItem("momento_guests_view")
      if (v === "cards" || v === "list") setView(v)
    } catch {}
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    try { localStorage.setItem("momento_guests_view", view) } catch {}
  }, [view])

  useEffect(() => {
    if (!activeEventId) return
    Promise.all([
      fetch(`/api/guests?plannerId=${activeEventId}`).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch(`/api/planners/${activeEventId}/rsvps`).then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([gs, rs]: [unknown, RsvpsPayload | null]) => {
      if (Array.isArray(gs)) {
        setGuests(gs.map((g: Record<string, unknown>) => ({
          id: String(g.id),
          name: String(g.name),
          rsvp: String(g.rsvp ?? "pending"),
          notes: typeof g.notes === "string" ? g.notes : null,
          linkedRsvpId: typeof g.linkedRsvpId === "string" ? g.linkedRsvpId : null,
        })))
      }
      if (rs && Array.isArray(rs.rsvps)) {
        setRsvpData({
          rsvps: rs.rsvps.map(r => ({
            ...r,
            createdAt: typeof r.createdAt === "string" ? r.createdAt : new Date(r.createdAt as unknown as string).toISOString(),
          })),
          stats: rs.stats,
        })
      }
    })
  }, [activeEventId])

  const dedupedRsvps = useMemo(() => dedupRsvps(rsvpData?.rsvps ?? []), [rsvpData])

  async function addGuest() {
    if (!newGuestName.trim() || !activeEventId) return
    const name = newGuestName.trim()
    setNewGuestName("")
    const r = await fetch("/api/guests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, plannerId: activeEventId }),
    })
    if (r.ok) {
      const created = await r.json()
      setGuests(g => [{
        id: created.id, name: created.name,
        rsvp: created.rsvp ?? "pending",
        notes: created.notes ?? null,
        linkedRsvpId: created.linkedRsvpId ?? null,
      }, ...g])
    }
  }

  async function patchGuest(id: string, patch: Partial<Guest>) {
    setGuests(g => g.map(x => x.id === id ? { ...x, ...patch } : x))
    await fetch(`/api/guests/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) }).catch(() => {})
  }
  function cycleStatus(g: Guest) {
    const idx = GUEST_STATUSES.indexOf(g.rsvp as typeof GUEST_STATUSES[number])
    const next = GUEST_STATUSES[(idx + 1) % GUEST_STATUSES.length] ?? "pending"
    patchGuest(g.id, { rsvp: next })
  }
  async function deleteGuest(id: string) {
    if (!confirm("Supprimer cet invité ?")) return
    setGuests(g => g.filter(x => x.id !== id))
    await fetch(`/api/guests/${id}`, { method: "DELETE" }).catch(() => {})
  }
  async function patchRsvp(id: string, patch: Partial<Rsvp>) {
    setRsvpData(d => d ? { ...d, rsvps: d.rsvps.map(r => r.id === id ? { ...r, ...patch } : r) } : d)
    await fetch(`/api/rsvps/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) }).catch(() => {})
  }
  async function deleteRsvp(id: string) {
    if (!confirm("Supprimer cette réponse ?")) return
    setRsvpData(d => d ? { ...d, rsvps: d.rsvps.filter(r => r.id !== id) } : d)
    await fetch(`/api/rsvps/${id}`, { method: "DELETE" }).catch(() => {})
  }
  async function linkRsvp(guestId: string, rsvpId: string) {
    await fetch(`/api/guests/${guestId}/link`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rsvpId }) }).catch(() => {})
    setGuests(g => g.map(x => x.id === guestId ? { ...x, linkedRsvpId: rsvpId } : x))
  }

  const cardStyle: CSSProperties = {
    background: "var(--dash-surface,#fff)",
    border: "1px solid var(--dash-border,rgba(183,191,217,0.15))",
    borderRadius: 16,
    padding: "clamp(12px, 1.6vw, 18px) clamp(14px, 1.8vw, 20px)",
    boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
  }

  return (
    <div className="ant-root" style={{ display: "flex", minHeight: "100vh", background: "var(--dash-bg,#f7f7fb)" }}>
      <style jsx global>{`
        @media print {
          nav, .no-print { display: none !important; }
          body { background: white !important; }
          article, table, tr { break-inside: avoid; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ccc; padding: 6px; }
        }
      `}</style>

      <div className="hidden lg:flex no-print">
        <DashSidebar events={events} activeEventId={activeEventId} onEventChange={handleEventChange} />
      </div>
      <div className="lg:hidden no-print"><AntNav /></div>

      <main className="pb-20 md:pb-0" style={{
        flex: 1,
        padding: "clamp(16px, 4vw, 32px) clamp(16px, 4vw, 32px) 64px",
        overflowY: "auto",
        containerType: "inline-size",
      }}>
        {/* Header */}
        <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: "clamp(1.3rem,2vw,1.7rem)", fontWeight: 800, color: "var(--dash-text,#121317)", letterSpacing: "-0.03em", margin: "0 0 4px" }}>Mes invités</h1>
            <p style={{ fontSize: "clamp(11px,0.85vw,13px)", color: "var(--dash-text-2,#6a6a71)", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: activeEvent.color, display: "inline-block" }} />
              {activeEvent.name || "—"}
            </p>
          </div>
          <div className="no-print" style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <ViewToggle value={view} onChange={setView} />
            {activeEventId && <GuestsExportMenu plannerId={activeEventId} />}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 14, marginBottom: 28 }}>
          {[
            { label: "Vues du site",     value: rsvpData?.stats.viewCount ?? 0, color: "var(--dash-text,#121317)" },
            { label: "Confirmés (site)", value: rsvpData?.stats.confirmed ?? 0, color: "#22c55e" },
            { label: "+1 attendus",       value: rsvpData?.stats.plusOnes ?? 0,  color: "#9333EA" },
          ].map(s => (
            <div key={s.label} style={{ ...cardStyle, padding: "16px 20px" }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--dash-text-3,#9a9aaa)", margin: "0 0 6px" }}>{s.label}</p>
              <p style={{ fontSize: "clamp(20px,2.2vw,28px)", fontWeight: 800, color: s.color, margin: 0, letterSpacing: "-0.04em" }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Section 1 — Mes invités (manuel) */}
        <section style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
            <h2 style={{ fontSize: "clamp(15px,1.2vw,18px)", fontWeight: 700, color: "var(--dash-text,#121317)", margin: 0 }}>
              Mes invités <span style={{ color: "var(--dash-text-3,#9a9aaa)", fontWeight: 500 }}>· {guests.length}</span>
            </h2>
          </div>

          <div className="no-print" style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            <input
              value={newGuestName}
              onChange={e => setNewGuestName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") addGuest() }}
              placeholder="Ajouter (ex: Tante Fatima)"
              style={{
                flex: "1 1 220px", minWidth: 200,
                padding: "9px 14px", borderRadius: 10,
                border: "1px solid var(--dash-border,rgba(183,191,217,0.25))",
                background: "var(--dash-surface,#fff)",
                color: "var(--dash-text,#121317)",
                fontSize: "clamp(12px,0.95vw,14px)",
                fontFamily: "inherit", outline: "none",
              }}
            />
            <button type="button" onClick={addGuest} style={{
              padding: "9px 20px", borderRadius: 10, background: G, color: "#fff",
              border: "none", fontSize: "clamp(12px,0.9vw,13px)", fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
            }}>+ Ajouter</button>
          </div>

          {guests.length === 0 ? (
            <p style={{ fontSize: "clamp(12px,0.9vw,13px)", color: "var(--dash-text-3,#9a9aaa)", textAlign: "center", padding: "20px 0", margin: 0 }}>
              Aucun invité. Ajoute-en un ci-dessus.
            </p>
          ) : view === "cards" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%, 240px),1fr))", gap: 12 }}>
              {guests.map(g => (
                <div key={g.id} style={cardStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${activeEvent.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: activeEvent.color, flexShrink: 0 }}>
                      {g.name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ flex: 1, fontSize: "clamp(13px,0.95vw,14px)", fontWeight: 600, color: "var(--dash-text,#121317)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.name}</span>
                    <button type="button" onClick={() => cycleStatus(g)} className="no-print" style={{
                      padding: "4px 10px", borderRadius: 99, border: "none", cursor: "pointer",
                      fontSize: 11, fontWeight: 600, fontFamily: "inherit",
                      background: `${GUEST_COLORS[g.rsvp] ?? "#9a9aaa"}18`,
                      color: GUEST_COLORS[g.rsvp] ?? "#9a9aaa",
                    }}>{GUEST_LABELS[g.rsvp] ?? g.rsvp}</button>
                  </div>
                  {g.notes && <p style={{ marginTop: 8, marginBottom: 0, fontSize: 12, color: "var(--dash-text-3,#9a9aaa)" }}>{g.notes}</p>}
                  {g.linkedRsvpId && <p style={{ marginTop: 6, marginBottom: 0, fontSize: 11, color: "var(--dash-text-3,#9a9aaa)" }}>→ Lié à une réponse site</p>}
                  <button type="button" onClick={() => deleteGuest(g.id)} className="no-print" style={{
                    marginTop: 6, alignSelf: "flex-start", background: "transparent", border: "none",
                    color: "var(--dash-text-3,#9a9aaa)", fontSize: 11, cursor: "pointer", padding: 0,
                  }}>Supprimer</button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "clamp(12px,0.9vw,13px)" }}>
                  <thead style={{ background: "var(--dash-faint,rgba(183,191,217,0.07))" }}>
                    <tr>
                      <th style={th}>Statut</th>
                      <th style={th}>Nom</th>
                      <th style={th}>Note</th>
                      <th style={th}>{""}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guests.map(g => (
                      <tr key={g.id} style={{ borderTop: "1px solid var(--dash-divider,rgba(183,191,217,0.10))" }}>
                        <td style={td}>
                          <button type="button" onClick={() => cycleStatus(g)} className="no-print" style={{
                            padding: "3px 8px", borderRadius: 99, border: "none", cursor: "pointer",
                            fontSize: 11, fontWeight: 600,
                            background: `${GUEST_COLORS[g.rsvp] ?? "#9a9aaa"}18`,
                            color: GUEST_COLORS[g.rsvp] ?? "#9a9aaa",
                          }}>{GUEST_LABELS[g.rsvp] ?? g.rsvp}</button>
                        </td>
                        <td style={td}>{g.name}</td>
                        <td style={td}>{g.notes ?? "—"}</td>
                        <td style={td}>
                          <button type="button" onClick={() => deleteGuest(g.id)} className="no-print" style={{ background: "transparent", border: "none", color: "var(--dash-text-3,#9a9aaa)", cursor: "pointer" }}>✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* Section 2 — Réponses du site (déduplications) */}
        <section>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
            <h2 style={{ fontSize: "clamp(15px,1.2vw,18px)", fontWeight: 700, color: "var(--dash-text,#121317)", margin: 0 }}>
              Réponses du site <span style={{ color: "var(--dash-text-3,#9a9aaa)", fontWeight: 500 }}>· {dedupedRsvps.length}</span>
            </h2>
            {rsvpData && rsvpData.rsvps.length > dedupedRsvps.length && (
              <span style={{ fontSize: 11, color: "var(--dash-text-3,#9a9aaa)" }}>
                {rsvpData.rsvps.length - dedupedRsvps.length} doublons masqués
              </span>
            )}
          </div>

          {dedupedRsvps.length === 0 ? (
            <p style={{ fontSize: "clamp(12px,0.9vw,13px)", color: "var(--dash-text-3,#9a9aaa)", textAlign: "center", padding: "20px 0", margin: 0 }}>
              Aucune réponse pour le moment.
            </p>
          ) : view === "cards" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%, 260px),1fr))", gap: 12 }}>
              {dedupedRsvps.map(r => (
                <div key={r.id} style={cardStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{ flex: 1, fontSize: "clamp(13px,0.95vw,14px)", fontWeight: 700, color: "var(--dash-text,#121317)" }}>{r.guestName}</span>
                    <span style={{
                      width: 22, height: 22, borderRadius: "50%",
                      background: r.attendingMain ? "#22c55e18" : "#ef444418",
                      color: r.attendingMain ? "#22c55e" : "#ef4444",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 700, flexShrink: 0,
                    }}>{r.attendingMain ? "✓" : "✗"}</span>
                  </div>
                  {r.plusOneName?.trim() && <Detail icon="👥" text={`+1 : ${r.plusOneName}`} />}
                  {r.dietaryNeeds?.trim() && <Detail icon="🍽" text={r.dietaryNeeds} />}
                  {r.message?.trim() && <Detail icon="💬" text={`"${r.message}"`} />}
                  <div className="no-print" style={{ display: "flex", gap: 10, marginTop: 10 }}>
                    <button type="button" onClick={() => setLinkingRsvpId(r.id)} style={{
                      background: "transparent", border: "none", color: "var(--dash-text-2,#6a6a71)",
                      fontSize: 11, cursor: "pointer", padding: 0, textDecoration: "underline",
                    }}>Lier</button>
                    <button type="button" onClick={() => deleteRsvp(r.id)} style={{
                      background: "transparent", border: "none", color: "var(--dash-text-3,#9a9aaa)",
                      fontSize: 11, cursor: "pointer", padding: 0, marginLeft: "auto",
                    }}>Supprimer</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "clamp(12px,0.9vw,13px)" }}>
                  <thead style={{ background: "var(--dash-faint,rgba(183,191,217,0.07))" }}>
                    <tr>
                      <th style={th}>✓</th>
                      <th style={th}>Nom</th>
                      <th style={th}>+1</th>
                      <th style={th}>Allergie</th>
                      <th style={th}>Message</th>
                      <th style={th}>{""}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dedupedRsvps.map(r => (
                      <tr key={r.id} style={{ borderTop: "1px solid var(--dash-divider,rgba(183,191,217,0.10))" }}>
                        <td style={{ ...td, color: r.attendingMain ? "#22c55e" : "#ef4444", fontWeight: 700 }}>{r.attendingMain ? "✓" : "✗"}</td>
                        <td style={td}>{r.guestName}</td>
                        <td style={td}>{r.plusOneName ?? "—"}</td>
                        <td style={td}>{r.dietaryNeeds ?? "—"}</td>
                        <td style={td} title={r.message ?? ""}>{truncate(r.message, 40)}</td>
                        <td style={td}>
                          <button type="button" onClick={() => deleteRsvp(r.id)} className="no-print" style={{ background: "transparent", border: "none", color: "var(--dash-text-3,#9a9aaa)", cursor: "pointer" }}>✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>

      {linkingRsvpId && (
        <LinkRsvpDialog
          rsvpId={linkingRsvpId}
          guests={guests}
          onLink={linkRsvp}
          onClose={() => setLinkingRsvpId(null)}
        />
      )}
    </div>
  )
}

function Detail({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ display: "flex", gap: 6, fontSize: "clamp(11px,0.85vw,12px)", color: "var(--dash-text-2,#6a6a71)", marginTop: 3 }}>
      <span style={{ minWidth: 18 }}>{icon}</span>
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{text}</span>
    </div>
  )
}

function truncate(s: string | null, n: number): string {
  if (!s) return "—"
  return s.length <= n ? s : s.slice(0, n) + "…"
}

const th: CSSProperties = { textAlign: "left", padding: "10px 14px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--dash-text-3,#9a9aaa)" }
const td: CSSProperties = { padding: "11px 14px", color: "var(--dash-text,#121317)" }
