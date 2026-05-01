"use client"
import { useEffect, useState } from "react"

interface Props { name: string; date: string }

function getTimeLeft(dateStr: string) {
  const diff = Math.max(0, new Date(dateStr).getTime() - Date.now())
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-MA", { day: "numeric", month: "long", year: "numeric" })
}

const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"

export default function TicketCountdown({ name, date }: Props) {
  const [t, setT] = useState(getTimeLeft(date))
  useEffect(() => {
    const id = setInterval(() => setT(getTimeLeft(date)), 1000)
    return () => clearInterval(id)
  }, [date])

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 0, padding: "0 4px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", width: "100%", paddingBottom: 10 }}>
        <p style={{ fontSize: "var(--text-sm)", fontWeight: 800, color: "var(--dash-text)", margin: "0 0 2px", letterSpacing: "-0.01em", textTransform: "uppercase" }}>
          {name}
        </p>
        <p style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3)", margin: 0 }}>{formatDate(date)}</p>
      </div>

      {/* Dashed separator (ticket tear) */}
      <div style={{ width: "100%", borderTop: "2px dashed var(--dash-border)", margin: "0 0 10px", position: "relative" }}>
        <div style={{ position: "absolute", left: -12, top: -7, width: 12, height: 12, borderRadius: "50%", background: "var(--dash-bg,#f7f7fb)" }} />
        <div style={{ position: "absolute", right: -12, top: -7, width: 12, height: 12, borderRadius: "50%", background: "var(--dash-bg,#f7f7fb)" }} />
      </div>

      {/* Columns */}
      <div style={{ display: "flex", width: "100%", justifyContent: "space-around" }}>
        {[
          { val: t.days, label: "JOURS" },
          { val: t.hours, label: "HEURES" },
          { val: t.minutes, label: "MIN" },
          { val: t.seconds, label: "SEC" },
        ].map(({ val, label }, i) => (
          <div key={label} style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{
              fontFamily: "monospace", fontSize: "var(--text-md)", fontWeight: 900, fontVariantNumeric: "tabular-nums",
              backgroundImage: G, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              {String(val).padStart(2, "0")}
            </span>
            <span style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3)", letterSpacing: "0.06em" }}>{label}</span>
            {i < 3 && (
              <span style={{ position: "absolute", marginLeft: "calc(25% * " + (i + 1) + ")", marginTop: -2, fontSize: "var(--text-sm)", color: "var(--dash-text-3)" }}>·</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
