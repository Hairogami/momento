"use client"
import { useEffect, useState } from "react"

interface Props { date: string }

function getTimeLeft(dateStr: string) {
  const diff = Math.max(0, new Date(dateStr).getTime() - Date.now())
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
}

function DigitCard({ digit }: { digit: string }) {
  const [displayed, setDisplayed] = useState(digit)
  const [phase, setPhase] = useState<"idle" | "out" | "in">("idle")

  useEffect(() => {
    if (digit === displayed) return
    setPhase("out")
    const t1 = setTimeout(() => {
      setDisplayed(digit)
      setPhase("in")
    }, 180)
    const t2 = setTimeout(() => setPhase("idle"), 360)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [digit]) // eslint-disable-line react-hooks/exhaustive-deps

  const transform =
    phase === "out" ? "translateY(-60%) scaleY(0.4)" :
    phase === "in"  ? "translateY(40%)  scaleY(0.4)" :
    "translateY(0)  scaleY(1)"

  const opacity = phase === "idle" ? 1 : 0

  return (
    <div style={{
      width: 38, height: 52,
      background: "var(--dash-faint-2, rgba(183,191,217,0.18))",
      border: "1px solid var(--dash-border, rgba(183,191,217,0.15))",
      borderRadius: 8,
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden",
      boxShadow: "0 2px 6px rgba(0,0,0,0.10)",
      position: "relative",
    }}>
      {/* top shade */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "50%",
        background: "rgba(0,0,0,0.04)",
        borderBottom: "1px solid var(--dash-border)",
        pointerEvents: "none", zIndex: 1,
      }} />
      <span style={{
        fontSize: "clamp(18px, 3vw, 24px)", fontWeight: 900,
        fontFamily: "monospace", fontVariantNumeric: "tabular-nums",
        color: "var(--dash-text, #121317)",
        lineHeight: 1,
        display: "block",
        transition: "transform 0.18s cubic-bezier(0.4,0,0.2,1), opacity 0.18s",
        transform,
        opacity,
        zIndex: 2,
        position: "relative",
      }}>
        {displayed}
      </span>
    </div>
  )
}

function FlipGroup({ value, label }: { value: number; label: string }) {
  const str = String(value).padStart(2, "0")
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ display: "flex", gap: 3 }}>
        {str.split("").map((d, i) => <DigitCard key={i} digit={d} />)}
      </div>
      <span style={{
        fontSize: "var(--text-2xs)", color: "var(--dash-text-3)",
        textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600,
      }}>{label}</span>
    </div>
  )
}

function Sep() {
  return (
    <span style={{
      fontSize: "clamp(18px,3vw,24px)", fontWeight: 900,
      color: "var(--dash-text-3)", alignSelf: "flex-start",
      marginTop: 10, lineHeight: 1, userSelect: "none",
    }}>:</span>
  )
}

export default function FlipCountdown({ date }: Props) {
  const [t, setT] = useState(getTimeLeft(date))
  useEffect(() => {
    const id = setInterval(() => setT(getTimeLeft(date)), 1000)
    return () => clearInterval(id)
  }, [date])

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "100%", width: "100%",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
        <FlipGroup value={t.days}    label="JOURS" />
        <Sep />
        <FlipGroup value={t.hours}   label="H" />
        <Sep />
        <FlipGroup value={t.minutes} label="MIN" />
        <Sep />
        <FlipGroup value={t.seconds} label="SEC" />
      </div>
    </div>
  )
}
