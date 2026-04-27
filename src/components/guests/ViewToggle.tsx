"use client"

import type { CSSProperties } from "react"

export type GuestsView = "cards" | "list"

type Props = {
  value: GuestsView
  onChange: (v: GuestsView) => void
}

export function ViewToggle({ value, onChange }: Props) {
  return (
    <div
      style={{
        display: "inline-flex",
        background: "var(--dash-surface-2)",
        borderRadius: "var(--radius-md)",
        padding: 2,
      }}
    >
      <button type="button" onClick={() => onChange("cards")} style={btnStyle(value === "cards")}>
        ◧ Cards
      </button>
      <button type="button" onClick={() => onChange("list")} style={btnStyle(value === "list")}>
        ☰ Liste
      </button>
    </div>
  )
}

function btnStyle(active: boolean): CSSProperties {
  return {
    padding: "var(--space-2) var(--space-3)",
    fontSize: "var(--text-sm)",
    color: active ? "var(--dash-text-1)" : "var(--dash-text-3)",
    background: active ? "var(--dash-surface-1)" : "transparent",
    border: "none",
    borderRadius: "var(--radius-sm)",
    cursor: "pointer",
    fontWeight: active ? 600 : 400,
  }
}
