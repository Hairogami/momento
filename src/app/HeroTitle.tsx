"use client"

import { useState, useEffect } from "react"
import { C } from "@/lib/colors"

const EVENTS = ["Mariage", "Anniversaire", "Fiançailles", "Baby shower", "Soutenance", "Cérémonie", "Fête privée", "Corporate"]

const EVENT_COLORS: Record<string, string> = {
  "Mariage":      "#D4A86A",
  "Anniversaire": "#C47850",
  "Fiançailles":  "#E2C88A",
  "Baby shower":  "#C8A890",
  "Soutenance":   "#A8B890",
  "Cérémonie":    "#B8A878",
  "Fête privée":  "#C8B898",
  "Corporate":    "#9AB0C0",
}

export default function HeroTitle() {
  const [eventIdx, setEventIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setEventIdx(i => (i + 1) % EVENTS.length), 2000)
    return () => clearInterval(t)
  }, [])

  return (
    <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-light leading-tight mb-4"
      style={{ color: C.white }}>
      Chaque{" "}
      <em style={{ color: EVENT_COLORS[EVENTS[eventIdx]], transition: "color 0.4s ease", fontStyle: "italic" }}>
        {EVENTS[eventIdx]}
      </em>
      {" "}est un{" "}
      <em className="font-light" style={{ color: C.silver, fontStyle: "italic" }}>moment.</em>
    </h1>
  )
}
