"use client"
/**
 * PublicCalendar — mini-calendrier 3 mois pour la fiche publique /vendor/[slug].
 *
 * - Fetch client-side au mount (PAS de SSG — les dates doivent être fraîches)
 * - Affiche les dates déjà prises (rouge) sur 3 mois (courant + 2)
 * - Les jours futurs non pris sont cliquables → onDateClick(date)
 *   consommé par le parent pour ouvrir le modal contact avec la date pré-remplie
 * - Aucune info client n'est exposée — uniquement des dates "occupé"
 */
import { useEffect, useMemo, useState } from "react"

const MONTHS_FULL = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"]
const WEEKDAYS = ["L","M","M","J","V","S","D"]

function firstWeekdayMonOffset(y: number, m: number): number {
  const d = new Date(Date.UTC(y, m, 1)).getUTCDay()
  return (d + 6) % 7
}
function daysInMonth(y: number, m: number): number {
  return new Date(Date.UTC(y, m + 1, 0)).getUTCDate()
}
function keyOf(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
}

type Props = {
  slug: string
  onDateClick?: (date: string) => void
}

export default function PublicCalendar({ slug, onDateClick }: Props) {
  const [booked, setBooked] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/vendor/${encodeURIComponent(slug)}/calendar`)
      .then(r => r.ok ? r.json() : Promise.reject("err"))
      .then((d: { bookedDates: string[] }) => {
        if (!cancelled) setBooked(new Set(d.bookedDates))
      })
      .catch(() => { if (!cancelled) setError("Indisponible") })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [slug])

  // 3 mois : courant + 2 suivants
  const months = useMemo(() => {
    const now = new Date()
    const y = now.getUTCFullYear()
    const m = now.getUTCMonth()
    return [0, 1, 2].map(offset => {
      const yy = y + Math.floor((m + offset) / 12)
      const mm = (m + offset) % 12
      return { year: yy, month: mm }
    })
  }, [])

  const todayKey = useMemo(() => {
    const n = new Date()
    return keyOf(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate())
  }, [])

  return (
    <div style={{
      background: "var(--dash-surface,#fff)", borderRadius: 20, padding: 20,
      border: "1px solid var(--dash-border,rgba(183,191,217,0.18))",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--dash-text,#121317)", margin: 0 }}>
          Disponibilités
        </h3>
        <span style={{ fontSize: 11, color: "var(--dash-text-3,#6a6a71)" }}>3 prochains mois</span>
      </div>
      <p style={{ fontSize: 12, color: "var(--dash-text-3,#6a6a71)", margin: "0 0 14px" }}>
        Cases rouges = dates déjà prises. Cliquez une date libre pour envoyer une demande.
      </p>

      {loading ? (
        <div style={{ padding: 24, textAlign: "center", color: "#9a9aaa", fontSize: 12 }}>Chargement…</div>
      ) : error ? (
        <div style={{ padding: 24, textAlign: "center", color: "#9a9aaa", fontSize: 12 }}>
          Calendrier indisponible pour le moment.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {months.map(({ year, month }) => (
            <MonthGrid
              key={`${year}-${month}`}
              year={year} month={month}
              bookedSet={booked}
              todayKey={todayKey}
              onDateClick={onDateClick}
            />
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 14, marginTop: 14, fontSize: 11, color: "#6b7280", flexWrap: "wrap" }}>
        <LegendDot color="#E11D48" label="Pris" />
        <LegendDot color="#16a34a" label="Libre" outline />
        <LegendDot color="#d1d5db" label="Passé" />
      </div>
    </div>
  )
}

function MonthGrid({
  year, month, bookedSet, todayKey, onDateClick,
}: {
  year: number
  month: number
  bookedSet: Set<string>
  todayKey: string
  onDateClick?: (date: string) => void
}) {
  const offset = firstWeekdayMonOffset(year, month)
  const total = daysInMonth(year, month)

  return (
    <div>
      <div style={{
        fontSize: 12, fontWeight: 700, color: "var(--dash-text,#121317)",
        marginBottom: 6, textTransform: "capitalize",
      }}>
        {MONTHS_FULL[month]} {year}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3, marginBottom: 3 }}>
        {WEEKDAYS.map((w, i) => (
          <div key={i} style={{ fontSize: 10, fontWeight: 700, color: "#9a9aaa", textAlign: "center" }}>{w}</div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
        {Array.from({ length: offset }).map((_, i) => <div key={`p${i}`} />)}

        {Array.from({ length: total }).map((_, i) => {
          const day = i + 1
          const k = keyOf(year, month, day)
          const isBooked = bookedSet.has(k)
          const isToday = k === todayKey
          const isPast = k < todayKey
          const clickable = !isBooked && !isPast && !!onDateClick

          const bg = isBooked
            ? "#E11D48"
            : isPast
              ? "#f0f1f6"
              : isToday
                ? "rgba(147,51,234,0.08)"
                : "#fff"
          const color = isBooked ? "#fff" : isPast ? "#c7c9d2" : "#121317"
          const border = isBooked
            ? "1px solid #E11D48"
            : isToday
              ? "1px solid #9333EA"
              : "1px solid rgba(183,191,217,0.22)"

          return (
            <button
              key={k}
              type="button"
              disabled={!clickable}
              onClick={clickable ? () => onDateClick?.(k) : undefined}
              title={isBooked ? "Date prise" : isPast ? "Date passée" : "Demander cette date"}
              style={{
                aspectRatio: "1", padding: 0, border,
                borderRadius: 6, background: bg, color,
                fontSize: 11, fontWeight: isToday ? 700 : 500,
                cursor: clickable ? "pointer" : "default",
                fontFamily: "inherit",
                transition: "transform 80ms ease",
              }}
              onMouseEnter={e => { if (clickable) e.currentTarget.style.transform = "scale(1.08)" }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)" }}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function LegendDot({ color, label, outline }: { color: string; label: string; outline?: boolean }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{
        width: 10, height: 10, borderRadius: 2,
        background: outline ? "#fff" : color,
        border: outline ? `1.5px solid ${color}` : "none",
      }} />
      {label}
    </span>
  )
}
