"use client"
import { useEffect, useRef, useState } from "react"

interface Props { date: string }

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
  const [phase, setPhase] = useState<"idle"|"exit"|"enter">("idle")
  const prev = useRef(value)
  const nextVal = useRef(value)

  useEffect(() => {
    const id = setInterval(() => {
      const v = compute(dateStr, unit)
      if (v !== prev.current) {
        nextVal.current = v
        setPhase("exit")
        setTimeout(() => {
          setValue(v)
          prev.current = v
          setPhase("enter")
          setTimeout(() => setPhase("idle"), 250)
        }, 220)
      }
    }, 1000)
    return () => clearInterval(id)
  }, [dateStr, unit])

  const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"
  const display = String(unit === "Second" ? String(value).padStart(2, "0") : value)

  const style: React.CSSProperties = {
    fontSize: "clamp(28px, 5vw, 44px)",
    fontWeight: 900,
    lineHeight: 1,
    fontVariantNumeric: "tabular-nums",
    backgroundImage: G,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    display: "block",
    transition: "opacity 0.2s, transform 0.2s",
    opacity: phase === "exit" ? 0 : 1,
    transform: phase === "exit" ? "translateY(-20%)" : phase === "enter" ? "translateY(10%)" : "translateY(0)",
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 0 }}>
      <span style={style}>{display}</span>
      <span style={{
        fontSize: "var(--text-2xs)", color: "var(--dash-text-3)",
        textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600,
      }}>
        {label}
      </span>
      <div style={{ height: 1, width: "80%", background: "var(--dash-border)" }} />
    </div>
  )
}

export default function ShiftingCountdown({ date }: Props) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "100%", width: "100%", padding: "0 8px",
    }}>
      <div style={{ display: "flex", gap: 12, width: "100%", alignItems: "flex-start" }}>
        <CountdownCol unit="Day"    label="JOURS"  dateStr={date} />
        <CountdownCol unit="Hour"   label="HEURES" dateStr={date} />
        <CountdownCol unit="Minute" label="MIN"    dateStr={date} />
        <CountdownCol unit="Second" label="SEC"    dateStr={date} />
      </div>
    </div>
  )
}
