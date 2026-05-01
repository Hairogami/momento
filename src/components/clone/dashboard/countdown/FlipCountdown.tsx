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

function FlipUnit({ digit }: { digit: string }) {
  const [current, setCurrent] = useState(digit)
  const [prev, setPrev] = useState(digit)
  const [flipping, setFlipping] = useState(false)

  useEffect(() => {
    if (digit !== current) {
      setPrev(current)
      setCurrent(digit)
      setFlipping(true)
    }
  }, [digit, current])

  return (
    <div className="flip-unit">
      <div className="flip-card flip-card__bottom">{current}</div>
      <div className="flip-card flip-card__top">{prev}</div>
      <div
        className={`flipper${flipping ? " is-flipping" : ""}`}
        onAnimationEnd={() => { setFlipping(false); setPrev(digit) }}
      >
        <div className="flip-card flipper__top">{prev}</div>
        <div className="flip-card flipper__bottom">{current}</div>
      </div>
    </div>
  )
}

function FlipGroup({ value, label }: { value: number; label: string }) {
  const str = String(value).padStart(2, "0")
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ display: "flex", gap: 3 }}>
        {str.split("").map((d, i) => <FlipUnit key={i} digit={d} />)}
      </div>
      <span style={{
        fontSize: "var(--text-2xs)", color: "var(--dash-text-3)",
        textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600,
      }}>{label}</span>
    </div>
  )
}

function Colon() {
  return (
    <span style={{
      fontSize: "var(--text-md)", fontWeight: 900, color: "var(--dash-text-3)",
      alignSelf: "flex-start", marginTop: 6, lineHeight: 1, userSelect: "none",
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
        <Colon />
        <FlipGroup value={t.hours}   label="H" />
        <Colon />
        <FlipGroup value={t.minutes} label="MIN" />
        <Colon />
        <FlipGroup value={t.seconds} label="SEC" />
      </div>
    </div>
  )
}
