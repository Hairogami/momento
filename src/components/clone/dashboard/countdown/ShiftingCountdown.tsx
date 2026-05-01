"use client"
import { useEffect, useRef, useState } from "react"

interface Props { name: string; date: string }

const SECOND = 1000, MINUTE = SECOND * 60, HOUR = MINUTE * 60, DAY = HOUR * 24

function compute(dateStr: string, unit: "Day" | "Hour" | "Minute" | "Second") {
  const d = new Date(dateStr).getTime() - Date.now()
  switch (unit) {
    case "Day":    return Math.max(0, Math.floor(d / DAY))
    case "Hour":   return Math.max(0, Math.floor((d % DAY) / HOUR))
    case "Minute": return Math.max(0, Math.floor((d % HOUR) / MINUTE))
    default:       return Math.max(0, Math.floor((d % MINUTE) / SECOND))
  }
}

function CountdownCol({ unit, label, dateStr }: { unit: "Day"|"Hour"|"Minute"|"Second"; label: string; dateStr: string }) {
  const [value, setValue] = useState(() => compute(dateStr, unit))
  const [animating, setAnimating] = useState(false)
  const prev = useRef(value)

  useEffect(() => {
    const id = setInterval(() => {
      const v = compute(dateStr, unit)
      if (v !== prev.current) {
        setAnimating(true)
        setTimeout(() => {
          setValue(v)
          prev.current = v
          setAnimating(false)
        }, 200)
      }
    }, 1000)
    return () => clearInterval(id)
  }, [dateStr, unit])

  const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"
  const display = unit === "Second" ? String(value).padStart(2, "0") : value

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ position: "relative", width: "100%", overflow: "hidden", textAlign: "center", height: "1.2em" }}>
        <span style={{
          display: "block",
          fontSize: "var(--text-2xl)", fontWeight: 900, lineHeight: 1.2, fontVariantNumeric: "tabular-nums",
          backgroundImage: G, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          transition: animating ? "none" : "opacity 0.2s",
          opacity: animating ? 0 : 1,
          transform: animating ? "translateY(-30%)" : "translateY(0)",
        }}>
          {display}
        </span>
      </div>
      <span style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </span>
      <div style={{ height: 1, width: "100%", background: "var(--dash-border)" }} />
    </div>
  )
}

export default function ShiftingCountdown({ name, date }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12, padding: "0 8px" }}>
      <p style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--dash-text)", margin: 0, textAlign: "center" }}>{name}</p>
      <div style={{ display: "flex", gap: 16, width: "100%" }}>
        <CountdownCol unit="Day"    label="jours"  dateStr={date} />
        <CountdownCol unit="Hour"   label="heures" dateStr={date} />
        <CountdownCol unit="Minute" label="min"    dateStr={date} />
        <CountdownCol unit="Second" label="sec"    dateStr={date} />
      </div>
    </div>
  )
}
