"use client"
/**
 * Calendrier privé du prestataire — grille mensuelle navigable.
 * Lit /api/vendor/calendar et surligne :
 *   - 🔴 dates bookées (status won/confirmed)
 *   - 🟠 dates en négociation (new/read/replied/pending)
 *
 * Clic sur un jour → panneau latéral avec les demandes liées.
 */
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"

type Entry = {
  id: string
  clientName: string
  eventType: string | null
  status: string
}

type DayData = {
  date: string // YYYY-MM-DD
  booked: Entry[]
  pending: Entry[]
}

const MONTHS = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sep","Oct","Nov","Déc"]
const MONTHS_FULL = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"]
const WEEKDAYS = ["L","M","M","J","V","S","D"]

function keyOf(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
}

function firstWeekdayMonOffset(y: number, m: number): number {
  // getUTCDay : 0=dim..6=sam → remap L=0..D=6
  const d = new Date(Date.UTC(y, m, 1)).getUTCDay()
  return (d + 6) % 7
}

function daysInMonth(y: number, m: number): number {
  return new Date(Date.UTC(y, m + 1, 0)).getUTCDate()
}

export default function CalendarWidget() {
  const today = new Date()
  const [year,  setYear]  = useState(today.getUTCFullYear())
  const [month, setMonth] = useState(today.getUTCMonth())
  const [dates, setDates] = useState<DayData[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch plage glissante : 6 mois à partir du mois affiché
  useEffect(() => {
    setLoading(true)
    const from = keyOf(year, month, 1)
    const toD  = daysInMonth(year, month)
    const to   = keyOf(year, month, toD)
    fetch(`/api/vendor/calendar?from=${from}&to=${to}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then(data => setDates(data.dates ?? []))
      .catch(() => setDates([]))
      .finally(() => setLoading(false))
  }, [year, month])

  const byDate = useMemo(() => {
    const map = new Map<string, DayData>()
    for (const d of dates) map.set(d.date, d)
    return map
  }, [dates])

  // Nav
  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
    setSelected(null)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
    setSelected(null)
  }
  const goToday = () => {
    setYear(today.getUTCFullYear())
    setMonth(today.getUTCMonth())
    setSelected(keyOf(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
  }

  // Grille
  const offset = firstWeekdayMonOffset(year, month)
  const nDays  = daysInMonth(year, month)
  const todayKey = keyOf(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())

  const cells: Array<{ key: string; day: number } | null> = []
  for (let i = 0; i < offset; i++) cells.push(null)
  for (let d = 1; d <= nDays; d++) cells.push({ key: keyOf(year, month, d), day: d })
  while (cells.length % 7 !== 0) cells.push(null)

  const bookedCount  = dates.reduce((a, d) => a + d.booked.length,  0)
  const pendingCount = dates.reduce((a, d) => a + d.pending.length, 0)

  const selectedData = selected ? byDate.get(selected) : null

  return (
    <div style={{
      background: "#fff", borderRadius: 14,
      border: "1px solid rgba(183,191,217,0.18)",
      padding: 20,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "#121317" }}>
            Agenda · {MONTHS_FULL[month]} {year}
          </h3>
          <p style={{ fontSize: 12, color: "#6b7280", margin: "2px 0 0" }}>
            {loading
              ? "Chargement…"
              : `${bookedCount} prise${bookedCount > 1 ? "s" : ""} · ${pendingCount} en négo`}
          </p>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <NavBtn onClick={prevMonth} label="‹" />
          <button
            onClick={goToday}
            style={{
              padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: "#fff", color: "#45474D",
              border: "1px solid rgba(183,191,217,0.3)",
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Aujourd&apos;hui
          </button>
          <NavBtn onClick={nextMonth} label="›" />
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: selectedData ? "repeat(auto-fit, minmax(260px, 1fr))" : "1fr",
        gap: 16,
      }}>
        {/* Grille */}
        <div>
          {/* Weekday header */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
            {WEEKDAYS.map((w, i) => (
              <div key={i} style={{
                fontSize: 10, fontWeight: 700, color: "#9a9aaa",
                textAlign: "center", textTransform: "uppercase",
              }}>{w}</div>
            ))}
          </div>
          {/* Cells */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {cells.map((c, i) => {
              if (!c) return <div key={i} />
              const data = byDate.get(c.key)
              const isBooked  = (data?.booked.length  ?? 0) > 0
              const isPending = (data?.pending.length ?? 0) > 0
              const isToday = c.key === todayKey
              const isSelected = c.key === selected

              let bg = "transparent"
              let fg = "#45474D"
              let border = "1px solid transparent"
              if (isBooked)       { bg = "#E11D48"; fg = "#fff" }
              else if (isPending) { bg = "rgba(245,158,11,0.15)"; fg = "#B45309" }
              if (isSelected) border = "2px solid #121317"
              else if (isToday) border = "1px solid #9333EA"

              const clickable = data && (data.booked.length > 0 || data.pending.length > 0)

              return (
                <button
                  key={c.key}
                  disabled={!clickable}
                  onClick={() => setSelected(isSelected ? null : c.key)}
                  style={{
                    aspectRatio: "1", minHeight: 40,
                    borderRadius: 8, border,
                    background: bg, color: fg,
                    cursor: clickable ? "pointer" : "default",
                    fontSize: 13, fontWeight: isBooked || isPending ? 700 : 500,
                    fontFamily: "inherit",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    position: "relative",
                    padding: 0,
                  }}
                >
                  {c.day}
                  {clickable && (
                    <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
                      {Array.from({ length: Math.min((data?.booked.length ?? 0) + (data?.pending.length ?? 0), 3) }).map((_, k) => (
                        <span key={k} style={{
                          width: 3, height: 3, borderRadius: "50%",
                          background: isBooked ? "#fff" : "#B45309",
                        }} />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Légende */}
          <div style={{ display: "flex", gap: 14, marginTop: 12, fontSize: 11, color: "#6b7280", flexWrap: "wrap" }}>
            <LegendDot color="#E11D48" label="Date prise (gagnée)" />
            <LegendDot color="rgba(245,158,11,0.6)" label="En négociation" />
            <LegendDot color="#9333EA" label="Aujourd'hui" outline />
          </div>
        </div>

        {/* Panneau latéral */}
        {selectedData && (
          <aside style={{
            background: "#fafbfd", borderRadius: 10, padding: 14,
            border: "1px solid rgba(183,191,217,0.18)",
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#121317", marginBottom: 2 }}>
              {new Date(`${selected}T00:00:00.000Z`).toLocaleDateString("fr-MA", {
                weekday: "long", day: "numeric", month: "long", year: "numeric",
              })}
            </div>
            <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 12 }}>
              {selectedData.booked.length + selectedData.pending.length} demande
              {selectedData.booked.length + selectedData.pending.length > 1 ? "s" : ""}
            </div>

            {selectedData.booked.length > 0 && (
              <PanelSection title="✓ Confirmé" color="#166534" items={selectedData.booked} />
            )}
            {selectedData.pending.length > 0 && (
              <PanelSection title="… En négociation" color="#B45309" items={selectedData.pending} />
            )}

            <Link
              href="/vendor/dashboard/inbox"
              style={{
                display: "block", marginTop: 12, fontSize: 12,
                color: "#E11D48", textDecoration: "none", fontWeight: 600,
              }}
            >
              Voir dans l&apos;inbox →
            </Link>
          </aside>
        )}
      </div>
    </div>
  )
}

function NavBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 30, height: 30, borderRadius: 8,
        background: "#fff", color: "#45474D",
        border: "1px solid rgba(183,191,217,0.3)",
        cursor: "pointer", fontFamily: "inherit",
        fontSize: 18, fontWeight: 600,
      }}
    >
      {label}
    </button>
  )
}

function LegendDot({ color, label, outline }: { color: string; label: string; outline?: boolean }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{
        width: 10, height: 10, borderRadius: "50%",
        background: outline ? "transparent" : color,
        border: outline ? `2px solid ${color}` : "none",
      }} />
      {label}
    </span>
  )
}

function PanelSection({ title, color, items }: { title: string; color: string; items: Entry[] }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map(it => (
          <div key={it.id} style={{
            fontSize: 12, padding: "6px 8px", borderRadius: 6,
            background: "#fff", border: "1px solid rgba(183,191,217,0.18)",
          }}>
            <div style={{ fontWeight: 600, color: "#121317" }}>{it.clientName}</div>
            {it.eventType && <div style={{ fontSize: 11, color: "#6b7280" }}>{it.eventType}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
