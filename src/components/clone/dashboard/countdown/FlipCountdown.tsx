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
      <div className={`flipper${flipping ? " is-flipping" : ""}`} onAnimationEnd={() => { setFlipping(false); setPrev(digit) }}>
        <div className="flip-card flipper__top">{prev}</div>
        <div className="flip-card flipper__bottom">{current}</div>
      </div>
    </div>
  )
}

function FlipNumber({ value }: { value: number }) {
  const str = String(value).padStart(2, "0")
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {str.split("").map((d, i) => <FlipUnit key={i} digit={d} />)}
    </div>
  )
}

export default function FlipCountdown({ name, date }: Props) {
  const [t, setT] = useState(getTimeLeft(date))
  useEffect(() => {
    const id = setInterval(() => setT(getTimeLeft(date)), 1000)
    return () => clearInterval(id)
  }, [date])

  const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 14 }}>
      <p style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--dash-text)", margin: 0 }}>{name}</p>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
        {[
          { val: t.days,    label: "jours" },
          { val: t.hours,   label: "h" },
          { val: t.minutes, label: "min" },
          { val: t.seconds, label: "sec" },
        ].map(({ val, label }, i) => (
          <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <FlipNumber value={val} />
            <span style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</span>
            {i < 3 && (
              <span style={{
                position: "absolute", fontSize: "var(--text-md)", fontWeight: 900,
                backgroundImage: G, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                marginTop: -28, marginLeft: 72,
              }}>:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
