"use client"

import { useEffect, useState } from "react"
import AntNav from "@/components/clone/AntNav"
import { usePlanners } from "@/hooks/usePlanners"
import { StatsBar } from "@/components/guests/StatsBar"
import { ViewToggle, type GuestsView } from "@/components/guests/ViewToggle"
import { RsvpCard, type Rsvp } from "@/components/guests/RsvpCard"
import { RsvpTable } from "@/components/guests/RsvpTable"
import { GuestCard, type Guest } from "@/components/guests/GuestCard"
import { GuestTable } from "@/components/guests/GuestTable"
import { GuestsExportMenu } from "@/components/guests/GuestsExportMenu"
import { LinkRsvpDialog } from "@/components/guests/LinkRsvpDialog"

const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"

type RsvpsPayload = {
  rsvps: Rsvp[]
  stats: { viewCount: number; confirmed: number; plusOnes: number; total: number }
}

export default function GuestsPage() {
  const { activeEventId } = usePlanners()
  const [guests, setGuests] = useState<Guest[]>([])
  const [rsvpData, setRsvpData] = useState<RsvpsPayload | null>(null)
  const [view, setView] = useState<GuestsView>("cards")
  const [linkingRsvpId, setLinkingRsvpId] = useState<string | null>(null)
  const [newGuestName, setNewGuestName] = useState("")

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
      fetch(`/api/guests?plannerId=${activeEventId}`).then((r) => r.ok ? r.json() : []).catch(() => []),
      fetch(`/api/planners/${activeEventId}/rsvps`).then((r) => r.ok ? r.json() : null).catch(() => null),
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
          rsvps: rs.rsvps.map((r) => ({
            ...r,
            createdAt: typeof r.createdAt === "string" ? r.createdAt : new Date(r.createdAt as unknown as string).toISOString(),
          })),
          stats: rs.stats,
        })
      }
    })
  }, [activeEventId])

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
      setGuests((g) => [{
        id: created.id,
        name: created.name,
        rsvp: created.rsvp ?? "pending",
        notes: created.notes ?? null,
        linkedRsvpId: created.linkedRsvpId ?? null,
      }, ...g])
    }
  }

  async function patchGuest(id: string, patch: Partial<Guest>) {
    setGuests((g) => g.map((x) => (x.id === id ? { ...x, ...patch } : x)))
    await fetch(`/api/guests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }).catch(() => {})
  }

  async function deleteGuest(id: string) {
    setGuests((g) => g.filter((x) => x.id !== id))
    await fetch(`/api/guests/${id}`, { method: "DELETE" }).catch(() => {})
  }

  async function patchRsvp(id: string, patch: Partial<Rsvp>) {
    setRsvpData((d) => d ? { ...d, rsvps: d.rsvps.map((r) => r.id === id ? { ...r, ...patch } : r) } : d)
    await fetch(`/api/rsvps/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }).catch(() => {})
  }

  async function deleteRsvp(id: string) {
    setRsvpData((d) => d ? { ...d, rsvps: d.rsvps.filter((r) => r.id !== id) } : d)
    await fetch(`/api/rsvps/${id}`, { method: "DELETE" }).catch(() => {})
  }

  async function linkRsvp(guestId: string, rsvpId: string) {
    await fetch(`/api/guests/${guestId}/link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rsvpId }),
    }).catch(() => {})
    setGuests((g) => g.map((x) => (x.id === guestId ? { ...x, linkedRsvpId: rsvpId } : x)))
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--dash-bg, #f7f7fb)" }}>
      <style jsx global>{`
        @media print {
          nav, .no-print { display: none !important; }
          body { background: white !important; }
          article, table, tr { break-inside: avoid; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ccc; padding: 6px; }
        }
      `}</style>

      <div className="lg:hidden no-print"><AntNav /></div>

      <main className="pb-20 md:pb-0" style={{
        maxWidth: 1280, margin: "0 auto",
        padding: "clamp(16px, 4vw, 32px)",
        display: "flex", flexDirection: "column", gap: "var(--space-5)",
      }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
          <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, color: "var(--dash-text-1)", margin: 0 }}>
            Mes invités
          </h1>
          <div className="no-print" style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
            <ViewToggle value={view} onChange={setView} />
            {activeEventId && <GuestsExportMenu plannerId={activeEventId} />}
          </div>
        </header>

        <StatsBar
          viewCount={rsvpData?.stats.viewCount ?? 0}
          confirmed={rsvpData?.stats.confirmed ?? 0}
          plusOnes={rsvpData?.stats.plusOnes ?? 0}
        />

        <section>
          <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--dash-text-1)", marginBottom: "var(--space-3)" }}>
            Mes invités ({guests.length})
          </h2>
          <div className="no-print" style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
            <input
              value={newGuestName}
              onChange={(e) => setNewGuestName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addGuest() }}
              placeholder="Ajouter un invité (ex: Tante Fatima)"
              style={{
                flex: 1, padding: "var(--space-2) var(--space-3)", fontSize: "var(--text-sm)",
                background: "var(--dash-surface-2)", color: "var(--dash-text-1)",
                border: "1px solid var(--dash-border)", borderRadius: "var(--radius-md)",
              }}
            />
            <button type="button" onClick={addGuest} style={{
              padding: "var(--space-2) var(--space-4)", background: G,
              color: "#fff", border: "none", borderRadius: "var(--radius-md)",
              cursor: "pointer", fontSize: "var(--text-sm)", fontWeight: 600,
            }}>+ Ajouter</button>
          </div>
          {view === "cards" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "var(--space-3)" }}>
              {guests.map((g) => <GuestCard key={g.id} guest={g} onPatch={patchGuest} onDelete={deleteGuest} />)}
              {guests.length === 0 && (
                <p style={{ fontSize: "var(--text-sm)", color: "var(--dash-text-3)" }}>Aucun invité. Ajoute-en un ci-dessus.</p>
              )}
            </div>
          ) : (
            <GuestTable guests={guests} onPatch={patchGuest} onDelete={deleteGuest} />
          )}
        </section>

        <section>
          <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--dash-text-1)", marginBottom: "var(--space-3)" }}>
            Réponses du site ({rsvpData?.stats.total ?? 0})
          </h2>
          {view === "cards" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "var(--space-3)" }}>
              {(rsvpData?.rsvps ?? []).map((r) => (
                <RsvpCard key={r.id} rsvp={r} onPatch={patchRsvp} onLink={(id) => setLinkingRsvpId(id)} />
              ))}
              {(!rsvpData || rsvpData.rsvps.length === 0) && (
                <p style={{ fontSize: "var(--text-sm)", color: "var(--dash-text-3)" }}>Aucune réponse pour le moment.</p>
              )}
            </div>
          ) : (
            <RsvpTable rsvps={rsvpData?.rsvps ?? []} onPatch={patchRsvp} onDelete={deleteRsvp} />
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
