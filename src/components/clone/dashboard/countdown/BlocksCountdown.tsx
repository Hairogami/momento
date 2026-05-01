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

const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"

export default function BlocksCountdown({ name, date }: Props) {
  const [t, setT] = useState(getTimeLeft(date))
  useEffect(() => {
    const id = setInterval(() => setT(getTimeLeft(date)), 1000)
    return () => clearInterval(id)
  }, [date])

  const units = [
    { val: t.days,    label: "Jours",  accent: true },
    { val: t.hours,   label: "Heures", accent: false },
    { val: t.minutes, label: "Min",    accent: false },
    { val: t.seconds, label: "Sec",    accent: false },
  ]

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12, padding: "0 4px" }}>
      <p style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--dash-text)", margin: 0, textAlign: "center" }}>{name}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, width: "100%" }}>
        {units.map(({ val, label, accent }) => (
          <div key={label} style={{
            borderRadius: 12,
            background: accent ? G : "var(--dash-faint-2,rgba(183,191,217,0.18))",
            border: accent ? "none" : "1px solid var(--dash-border)",
            padding: "12px 8px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          }}>
            <span style={{
              fontSize: "var(--text-xl)", fontWeight: 900, lineHeight: 1, fontVariantNumeric: "tabular-nums",
              color: accent ? "#fff" : "var(--dash-text)",
            }}>
              {String(val).padStart(2, "0")}
            </span>
            <span style={{
              fontSize: "var(--text-2xs)", textTransform: "uppercase", letterSpacing: "0.08em",
              color: accent ? "rgba(255,255,255,0.75)" : "var(--dash-text-3)",
            }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
