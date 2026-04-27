"use client"

export type Guest = {
  id: string
  name: string
  rsvp: string
  notes: string | null
  linkedRsvpId: string | null
}

type Props = {
  guest: Guest
  onPatch: (id: string, patch: Partial<Guest>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const STATUSES = ["pending", "yes", "no", "invited"] as const
const LABELS: Record<string, string> = {
  pending: "⏳ En attente",
  yes: "✓ Confirmé",
  no: "✗ Refuse",
  invited: "📞 Invité",
}

export function GuestCard({ guest, onPatch, onDelete }: Props) {
  const cycle = () => {
    const idx = STATUSES.indexOf(guest.rsvp as typeof STATUSES[number])
    const next = STATUSES[(idx + 1) % STATUSES.length] ?? "pending"
    onPatch(guest.id, { rsvp: next })
  }
  return (
    <article style={{
      background: "var(--dash-surface-1)",
      border: "1px solid var(--dash-border)",
      borderRadius: "var(--radius-lg)",
      padding: "var(--space-4)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-2)",
    }}>
      <header style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-2)", alignItems: "center" }}>
        <span style={{ fontSize: "var(--text-base)", fontWeight: 600, color: "var(--dash-text-1)" }}>{guest.name}</span>
        <button type="button" onClick={cycle} className="no-print" style={{
          background: "transparent", border: "none", cursor: "pointer",
          fontSize: "var(--text-sm)", color: "var(--dash-text-2)",
        }}>{LABELS[guest.rsvp] ?? guest.rsvp}</button>
      </header>
      {guest.notes && (
        <p style={{ fontSize: "var(--text-sm)", color: "var(--dash-text-3)", margin: 0 }}>{guest.notes}</p>
      )}
      {guest.linkedRsvpId && (
        <span style={{ fontSize: "var(--text-xs)", color: "var(--dash-text-3)" }}>→ Lié à une réponse site</span>
      )}
      <button type="button" onClick={() => {
        if (confirm(`Supprimer ${guest.name} ?`)) onDelete(guest.id)
      }} className="no-print" style={{
        alignSelf: "flex-end", background: "transparent", border: "none",
        cursor: "pointer", color: "var(--dash-text-3)", fontSize: "var(--text-xs)",
      }}>Supprimer</button>
    </article>
  )
}
