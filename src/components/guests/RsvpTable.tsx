"use client"

import type { CSSProperties } from "react"
import type { Rsvp } from "./RsvpCard"

type Props = {
  rsvps: Rsvp[]
  onPatch: (id: string, patch: Partial<Rsvp>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function RsvpTable({ rsvps, onDelete }: Props) {
  if (rsvps.length === 0) {
    return (
      <p style={{ fontSize: "var(--text-sm)", color: "var(--dash-text-3)", padding: "var(--space-4)" }}>
        Aucune réponse pour le moment.
      </p>
    )
  }

  return (
    <div style={{ overflowX: "auto", border: "1px solid var(--dash-border)", borderRadius: "var(--radius-lg)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-sm)" }}>
        <thead style={{ position: "sticky", top: 0, background: "var(--dash-surface-2)" }}>
          <tr>
            <Th>✓</Th>
            <Th>Nom</Th>
            <Th>+1</Th>
            <Th>Nom +1</Th>
            <Th>Allergie</Th>
            <Th>Message</Th>
            <Th>Lendemain</Th>
            <Th>{""}</Th>
          </tr>
        </thead>
        <tbody>
          {rsvps.map((r) => (
            <tr key={r.id} style={{ borderTop: "1px solid var(--dash-border)" }}>
              <Td>{r.attendingMain ? "✓" : "✗"}</Td>
              <Td>{r.guestName}</Td>
              <Td>{r.plusOneName ? "✓" : "—"}</Td>
              <Td>{r.plusOneName ?? "—"}</Td>
              <Td>{r.dietaryNeeds ?? "—"}</Td>
              <Td title={r.message ?? ""}>{truncate(r.message, 40)}</Td>
              <Td>{r.attendingDayAfter === null ? "—" : r.attendingDayAfter ? "✓" : "✗"}</Td>
              <Td>
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm(`Supprimer la réponse de ${r.guestName} ?`)) await onDelete(r.id)
                  }}
                  className="no-print"
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--dash-text-3)" }}
                  aria-label="Supprimer"
                >
                  ✕
                </button>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const thStyle: CSSProperties = { textAlign: "left", padding: "var(--space-2) var(--space-3)", fontWeight: 600, color: "var(--dash-text-2)" }
const tdStyle: CSSProperties = { padding: "var(--space-2) var(--space-3)", color: "var(--dash-text-1)" }

function Th({ children }: { children: React.ReactNode }) {
  return <th style={thStyle}>{children}</th>
}

function Td({ children, title }: { children: React.ReactNode; title?: string }) {
  return <td style={tdStyle} title={title}>{children}</td>
}

function truncate(s: string | null, n: number): string {
  if (!s) return "—"
  return s.length <= n ? s : s.slice(0, n) + "…"
}
