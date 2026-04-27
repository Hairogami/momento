"use client"

import { useState, type CSSProperties } from "react"
import type { Guest } from "./GuestCard"

type Props = {
  rsvpId: string
  guests: Guest[]
  onLink: (guestId: string, rsvpId: string) => Promise<void>
  onClose: () => void
}

export function LinkRsvpDialog({ rsvpId, guests, onLink, onClose }: Props) {
  const [selected, setSelected] = useState<string>("")
  const handleConfirm = async () => {
    if (!selected) return
    await onLink(selected, rsvpId)
    onClose()
  }
  return (
    <div
      role="dialog"
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--dash-surface, #fff)", padding: "var(--space-5)",
          borderRadius: "var(--radius-lg)", minWidth: 320, maxWidth: 480,
          display: "flex", flexDirection: "column", gap: "var(--space-3)",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--dash-text, #121317)" }}>
          Lier à un invité
        </h3>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          style={{
            padding: "var(--space-2) var(--space-3)", fontSize: "var(--text-sm)",
            background: "var(--dash-faint, rgba(183,191,217,0.07))", color: "var(--dash-text, #121317)",
            border: "1px solid var(--dash-border)", borderRadius: "var(--radius-md)",
          }}
        >
          <option value="">— Choisir un invité —</option>
          {guests.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
        <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
          <button type="button" onClick={onClose} style={btnSecondary}>Annuler</button>
          <button type="button" onClick={handleConfirm} disabled={!selected} style={btnPrimary}>Lier</button>
        </div>
      </div>
    </div>
  )
}

const btnSecondary: CSSProperties = {
  padding: "var(--space-2) var(--space-3)", fontSize: "var(--text-sm)",
  background: "transparent", color: "var(--dash-text-2)",
  border: "1px solid var(--dash-border)", borderRadius: "var(--radius-md)", cursor: "pointer",
}
const btnPrimary: CSSProperties = {
  padding: "var(--space-2) var(--space-3)", fontSize: "var(--text-sm)",
  background: "var(--dash-text, #121317)", color: "var(--dash-surface, #fff)",
  border: "none", borderRadius: "var(--radius-md)", cursor: "pointer",
}
