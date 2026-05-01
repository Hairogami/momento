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
  const [currentDigit, setCurrentDigit]   = useState(digit)
  const [previousDigit, setPreviousDigit] = useState(digit)
  const [isFlipping, setIsFlipping]       = useState(false)

  useEffect(() => {
    if (digit !== currentDigit) {
      setPreviousDigit(currentDigit)
      setCurrentDigit(digit)
      setIsFlipping(true)
    }
  }, [digit, currentDigit])

  const handleAnimationEnd = (e: React.AnimationEvent) => {
    // flip-bottom is the last animation — reset only once
    if (e.animationName === "flip-bottom") {
      setIsFlipping(false)
      setPreviousDigit(digit)
    }
  }

  return (
    <div className="flip-unit">
      {/* Static bottom half — shows current digit */}
      <div className="flip-card flip-card__bottom">{currentDigit}</div>
      {/* Static top half — shows previous digit until flip completes */}
      <div className="flip-card flip-card__top">{previousDigit}</div>
      {/* Animated flap — top half only, rotates to reveal new top */}
      <div
        className={`flipper${isFlipping ? " is-flipping" : ""}`}
        onAnimationEnd={handleAnimationEnd}
      >
        <div className="flip-card flipper__top">{previousDigit}</div>
        <div className="flip-card flipper__bottom">{currentDigit}</div>
      </div>
    </div>
  )
}

function FlipGroup({ value, label }: { value: number; label: string }) {
  const str = String(value).padStart(2, "0")
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ display: "flex", gap: 4 }}>
        {str.split("").map((d, i) => <FlipUnit key={i} digit={d} />)}
      </div>
      <span style={{
        fontSize: "var(--text-2xs)", color: "rgba(255,255,255,0.5)",
        textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600,
      }}>
        {label}
      </span>
    </div>
  )
}

function Sep() {
  return (
    <span style={{
      fontSize: 28, fontWeight: 900, color: "rgba(255,255,255,0.3)",
      alignSelf: "flex-start", marginTop: 6, lineHeight: 1,
      userSelect: "none", fontFamily: "monospace",
    }}>
      :
    </span>
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
      background: "rgba(0,0,0,0.18)", borderRadius: 12,
    }}>
      <div style={{
        display: "flex", alignItems: "flex-start", gap: 10,
        flexWrap: "wrap", justifyContent: "center", padding: "18px 12px",
      }}>
        <FlipGroup value={t.days}    label="JOURS" />
        <Sep />
        <FlipGroup value={t.hours}   label="HEURES" />
        <Sep />
        <FlipGroup value={t.minutes} label="MIN" />
        <Sep />
        <FlipGroup value={t.seconds} label="SEC" />
      </div>
    </div>
  )
}
