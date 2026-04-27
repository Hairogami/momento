"use client"

import { useState, type CSSProperties } from "react"

export type Rsvp = {
  id: string
  guestName: string
  guestEmail: string | null
  guestPhone: string | null
  attendingMain: boolean
  attendingDayAfter: boolean | null
  plusOneName: string | null
  dietaryNeeds: string | null
  message: string | null
  createdAt: string
}

type Props = {
  rsvp: Rsvp
  onPatch: (id: string, patch: Partial<Rsvp>) => Promise<void>
  onLink?: (rsvpId: string) => void
}

export function RsvpCard({ rsvp, onPatch, onLink }: Props) {
  const [editing, setEditing] = useState<keyof Rsvp | null>(null)
  const hasPlusOne = !!rsvp.plusOneName?.trim()
  const hasDiet = !!rsvp.dietaryNeeds?.trim()
  const hasMsg = !!rsvp.message?.trim()

  return (
    <article
      style={{
        background: "var(--dash-surface-1)",
        border: "1px solid var(--dash-border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-4)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
      }}
    >
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--space-2)" }}>
        <EditableText
          value={rsvp.guestName}
          editing={editing === "guestName"}
          onStart={() => setEditing("guestName")}
          onSave={async (v) => { await onPatch(rsvp.id, { guestName: v }); setEditing(null) }}
          onCancel={() => setEditing(null)}
          style={{ fontSize: "var(--text-base)", fontWeight: 600, color: "var(--dash-text-1)", flex: 1 }}
        />
        <span style={{ fontSize: "var(--text-lg)", color: rsvp.attendingMain ? "#3a8a4a" : "#a04040" }}>
          {rsvp.attendingMain ? "✓" : "✗"}
        </span>
      </header>

      {hasPlusOne && <Row icon="+1" text={rsvp.plusOneName!} />}
      {hasDiet && <Row icon="🍽" text={rsvp.dietaryNeeds!} />}
      {hasMsg && <Row icon="💬" text={`"${rsvp.message}"`} />}

      {onLink && (
        <button
          type="button"
          onClick={() => onLink(rsvp.id)}
          className="no-print"
          style={{
            marginTop: "var(--space-2)",
            fontSize: "var(--text-xs)",
            color: "var(--dash-text-3)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            alignSelf: "flex-start",
            textDecoration: "underline",
          }}
        >
          ✓ Lier à mes invités
        </button>
      )}
    </article>
  )
}

function Row({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ display: "flex", gap: "var(--space-2)", fontSize: "var(--text-sm)", color: "var(--dash-text-2)" }}>
      <span style={{ minWidth: 18 }}>{icon}</span>
      <span>{text}</span>
    </div>
  )
}

function EditableText({
  value, editing, onStart, onSave, onCancel, style,
}: {
  value: string
  editing: boolean
  onStart: () => void
  onSave: (v: string) => void
  onCancel: () => void
  style?: CSSProperties
}) {
  const [draft, setDraft] = useState(value)
  if (!editing) {
    return <span onClick={onStart} style={{ ...style, cursor: "pointer" }}>{value}</span>
  }
  return (
    <input
      autoFocus
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => onSave(draft)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSave(draft)
        if (e.key === "Escape") onCancel()
      }}
      style={{ ...style, border: "1px solid var(--dash-border)", padding: "2px 6px", borderRadius: 4, background: "var(--dash-surface-2)" }}
    />
  )
}
