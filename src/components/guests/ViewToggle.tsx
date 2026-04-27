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
        gap: 4,
        background: "var(--dash-faint, rgba(183,191,217,0.07))",
        borderRadius: 12,
        padding: 4,
        border: "1px solid var(--dash-border, rgba(183,191,217,0.15))",
      }}
    >
      <button type="button" onClick={() => onChange("cards")} style={btnStyle(value === "cards")}>
        <span style={{ fontSize: 14 }}>◧</span>
        <span>Cards</span>
      </button>
      <button type="button" onClick={() => onChange("list")} style={btnStyle(value === "list")}>
        <span style={{ fontSize: 14 }}>☰</span>
        <span>Liste</span>
      </button>
    </div>
  )
}

function btnStyle(active: boolean): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "7px 14px",
    fontSize: "clamp(12px, 0.9vw, 13px)",
    color: active ? "var(--dash-text, #121317)" : "var(--dash-text-2, #6a6a71)",
    background: active ? "var(--dash-surface, #fff)" : "transparent",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: active ? 600 : 500,
    fontFamily: "inherit",
    boxShadow: active ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
    transition: "background 0.15s, color 0.15s",
  }
}
