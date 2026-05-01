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

export default function MinimalCountdown({ name, date }: Props) {
  const [t, setT] = useState(getTimeLeft(date))
  useEffect(() => {
    const id = setInterval(() => setT(getTimeLeft(date)), 1000)
    return () => clearInterval(id)
  }, [date])

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 8 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          fontSize: "clamp(52px, 10vw, 72px)", fontWeight: 900, lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
          backgroundImage: G, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>
          {t.days}
        </div>
        <div style={{ fontSize: "var(--text-xs)", color: "var(--dash-text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4 }}>
          jours
        </div>
      </div>
      <p style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--dash-text)", margin: "8px 0 0", textAlign: "center" }}>
        {name}
      </p>
      <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
        {[{ val: t.hours, l: "h" }, { val: t.minutes, l: "m" }, { val: t.seconds, l: "s" }].map(({ val, l }) => (
          <span key={l} style={{ fontSize: "var(--text-xs)", color: "var(--dash-text-2)", fontVariantNumeric: "tabular-nums" }}>
            <strong style={{ color: "var(--dash-text)" }}>{String(val).padStart(2, "0")}</strong>{l}
          </span>
        ))}
      </div>
    </div>
  )
}
