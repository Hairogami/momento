"use client"
import { useState } from "react"
import type { Booking, BookingStatus } from "./_shared"

const CONTRACT_CYCLE: BookingStatus[] = ["INQUIRY", "PENDING", "CONFIRMED"]
const CONTRACT_CFG: Record<BookingStatus, { label: string; color: string; bg: string }> = {
  CONFIRMED: { label: "Confirmé",   color: "#22c55e", bg: "rgba(34,197,94,0.12)"   },
  PENDING:   { label: "En attente", color: "#f59e0b", bg: "rgba(245,158,11,0.12)"  },
  INQUIRY:   { label: "Contact",    color: "#60a5fa", bg: "rgba(96,165,250,0.12)"  },
}

// WIDGET-CONTRACT VIOLATION (légère) :
// Le widget fait un fetch PATCH inline via cycleStatus → mais c'est une write
// action, pas un read pour hydrater. Acceptable car write actions sont
// autorisées par le contrat (question 5). Pas d'optimistic rollback en cas
// d'erreur réseau (override conservé même si API fail) — TODO future.
export default function ContratsWidget({ bookings }: { bookings: Booking[] }) {
  const [overrides, setOverrides] = useState<Record<string, BookingStatus>>({})
  function cycleStatus(id: string, current: BookingStatus) {
    const next = CONTRACT_CYCLE[(CONTRACT_CYCLE.indexOf(current) + 1) % CONTRACT_CYCLE.length]
    setOverrides(p => ({ ...p, [id]: next }))
    fetch(`/api/bookings/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) }).catch(() => {})
  }
  return (
    <div style={{ padding: "12px 16px 16px", height: "100%", display: "flex", flexDirection: "column", gap: 6, boxSizing: "border-box", overflowY: "auto" }}>
      {bookings.length === 0 && <div style={{ fontSize: "var(--text-xs)", color: "var(--dash-text-3,#9a9aaa)" }}>Aucun contrat</div>}
      {bookings.map(b => {
        const status = overrides[b.id] ?? b.status
        const cfg = CONTRACT_CFG[status] ?? CONTRACT_CFG.PENDING
        return (
          <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 8, background: "var(--dash-faint,rgba(183,191,217,0.08))", fontSize: "var(--text-xs)" }}>
            <span style={{ flex: 1, color: "var(--dash-text,#121317)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.vendor}</span>
            <button onClick={() => cycleStatus(b.id, status)} title="Changer le statut"
              style={{ fontSize: "var(--text-2xs)", fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: cfg.bg, color: cfg.color, border: "none", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
              {cfg.label} ↻
            </button>
          </div>
        )
      })}
    </div>
  )
}
