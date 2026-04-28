"use client"

import { useState, type CSSProperties } from "react"
import type { Guest } from "./types"
import BottomSheet from "@/components/mobile/BottomSheet"

const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"

type Props = {
  rsvpId: string
  guests: Guest[]
  onLink: (guestId: string, rsvpId: string) => Promise<void>
  onClose: () => void
}

export function LinkRsvpDialog({ rsvpId, guests, onLink, onClose }: Props) {
  const [selected, setSelected] = useState<string>("")
  const [busy, setBusy] = useState(false)

  const handleConfirm = async () => {
    if (!selected || busy) return
    setBusy(true)
    try {
      await onLink(selected, rsvpId)
      onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <BottomSheet
      open
      onClose={onClose}
      title="Lier à un invité"
      maxWidth={480}
      ariaLabelledBy="link-rsvp-title"
    >
      <div
        style={{
          padding: "16px 20px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--dash-text-2, #6a6a71)" }}>
          Sélectionnez l&apos;invité à associer à cette réponse RSVP.
        </p>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          autoFocus
          style={{
            padding: "12px 14px",
            fontSize: "var(--text-sm)",
            background: "var(--dash-surface, #fff)",
            color: "var(--dash-text, #121317)",
            border: "1px solid var(--dash-border, rgba(183,191,217,0.25))",
            borderRadius: 10,
            outline: "none",
            fontFamily: "inherit",
            width: "100%",
          }}
        >
          <option value="">— Choisir un invité —</option>
          {guests.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
          <button type="button" onClick={onClose} style={btnSecondary} disabled={busy}>Annuler</button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selected || busy}
            style={{
              ...btnPrimary,
              opacity: !selected || busy ? 0.6 : 1,
              cursor: !selected || busy ? "not-allowed" : "pointer",
            }}
          >
            {busy ? "…" : "Lier"}
          </button>
        </div>
      </div>
    </BottomSheet>
  )
}

const btnSecondary: CSSProperties = {
  padding: "10px 18px",
  fontSize: "var(--text-sm)",
  fontWeight: 600,
  background: "var(--dash-faint, rgba(183,191,217,0.07))",
  color: "var(--dash-text-2, #6a6a71)",
  border: "1px solid var(--dash-border, rgba(183,191,217,0.25))",
  borderRadius: 10,
  cursor: "pointer",
  fontFamily: "inherit",
}
const btnPrimary: CSSProperties = {
  padding: "10px 22px",
  fontSize: "var(--text-sm)",
  fontWeight: 600,
  background: G,
  color: "#fff",
  border: "none",
  borderRadius: 10,
  cursor: "pointer",
  fontFamily: "inherit",
  boxShadow: "0 2px 8px color-mix(in srgb, var(--g1) 25%, transparent)",
}
