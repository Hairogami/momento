"use client"

import type { CSSProperties } from "react"
import type { Guest } from "./GuestCard"

type Props = {
  guests: Guest[]
  onPatch: (id: string, patch: Partial<Guest>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const LABELS: Record<string, string> = {
  pending: "En attente",
  yes: "Confirmé",
  no: "Refuse",
  invited: "Invité",
}

export function GuestTable({ guests, onDelete }: Props) {
  if (guests.length === 0) {
    return <p style={{ fontSize: "var(--text-sm)", color: "var(--dash-text-3)", padding: "var(--space-4)" }}>Aucun invité.</p>
  }
  return (
    <div style={{ overflowX: "auto", border: "1px solid var(--dash-border)", borderRadius: "var(--radius-lg)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-sm)" }}>
        <thead style={{ background: "var(--dash-surface-2)" }}>
          <tr>
            <th style={thStyle}>Statut</th>
            <th style={thStyle}>Nom</th>
            <th style={thStyle}>Note</th>
            <th style={thStyle}></th>
          </tr>
        </thead>
        <tbody>
          {guests.map((g) => (
            <tr key={g.id} style={{ borderTop: "1px solid var(--dash-border)" }}>
              <td style={tdStyle}>{LABELS[g.rsvp] ?? g.rsvp}</td>
              <td style={tdStyle}>{g.name}</td>
              <td style={tdStyle}>{g.notes ?? "—"}</td>
              <td style={tdStyle}>
                <button type="button" className="no-print" onClick={() => {
                  if (confirm(`Supprimer ${g.name} ?`)) onDelete(g.id)
                }} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--dash-text-3)" }}>✕</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const thStyle: CSSProperties = { textAlign: "left", padding: "var(--space-2) var(--space-3)", fontWeight: 600, color: "var(--dash-text-2)" }
const tdStyle: CSSProperties = { padding: "var(--space-2) var(--space-3)", color: "var(--dash-text-1)" }
