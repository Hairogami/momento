"use client"

import { useEffect, useState } from "react"

export type CountdownVariant = "grand" | "minimal" | "flip" | "circle"

type Props = {
  /** Date cible ISO 8601 (ex: "2026-04-04T19:00:00"). */
  targetDate: string
  variant?: CountdownVariant
  /** Label optionnel affiché au-dessus (ex: "Jusqu'au grand jour"). */
  label?: string
  /** Texte affiché quand la date est passée. Défaut: "C'est aujourd'hui !" */
  elapsedText?: string
}

type Remaining = { days: number; hours: number; minutes: number; seconds: number; elapsed: boolean }

function computeRemaining(targetMs: number): Remaining {
  const diff = targetMs - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, elapsed: true }
  const days = Math.floor(diff / 86_400_000)
  const hours = Math.floor((diff % 86_400_000) / 3_600_000)
  const minutes = Math.floor((diff % 3_600_000) / 60_000)
  const seconds = Math.floor((diff % 60_000) / 1000)
  return { days, hours, minutes, seconds, elapsed: false }
}

export default function Countdown({
  targetDate, variant = "grand", label, elapsedText = "C'est aujourd'hui !",
}: Props) {
  const targetMs = new Date(targetDate).getTime()
  const [remaining, setRemaining] = useState<Remaining>(() => computeRemaining(targetMs))

  useEffect(() => {
    if (isNaN(targetMs)) return
    const tick = () => setRemaining(computeRemaining(targetMs))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [targetMs])

  if (isNaN(targetMs)) return null

  if (remaining.elapsed) {
    return (
      <div style={{
        textAlign: "center",
        fontFamily: "var(--evt-font-heading)",
        fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
        color: "var(--evt-main)",
        fontWeight: 600,
        padding: "40px 20px",
      }}>
        {elapsedText}
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "40px 20px" }}>
      {label && (
        <div style={{
          fontFamily: "var(--evt-font-body)",
          fontSize: 11,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "var(--evt-main)",
          fontWeight: 600,
        }}>{label}</div>
      )}
      {variant === "grand" && <VariantGrand r={remaining} />}
      {variant === "minimal" && <VariantMinimal r={remaining} />}
      {variant === "flip" && <VariantFlip r={remaining} />}
      {variant === "circle" && <VariantCircle r={remaining} />}
    </div>
  )
}

/* ─── Variants ───────────────────────────────────────────────────── */

function VariantGrand({ r }: { r: Remaining }) {
  const units: { value: number; label: string }[] = [
    { value: r.days, label: "jours" },
    { value: r.hours, label: "heures" },
    { value: r.minutes, label: "minutes" },
    { value: r.seconds, label: "secondes" },
  ]
  return (
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
      {units.map(u => (
        <div key={u.label} style={{
          minWidth: 90,
          padding: "18px 12px",
          borderRadius: 12,
          border: "1px solid color-mix(in srgb, var(--evt-main) 20%, transparent)",
          background: "color-mix(in srgb, var(--evt-main) 6%, transparent)",
          textAlign: "center",
        }}>
          <div style={{
            fontFamily: "var(--evt-font-heading)",
            fontSize: "clamp(2rem, 5vw, 3.2rem)",
            fontWeight: 600,
            color: "var(--evt-main)",
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}>{String(u.value).padStart(2, "0")}</div>
          <div style={{
            fontFamily: "var(--evt-font-body)",
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--evt-text-muted)",
            marginTop: 8,
          }}>{u.label}</div>
        </div>
      ))}
    </div>
  )
}

function VariantMinimal({ r }: { r: Remaining }) {
  return (
    <div style={{
      fontFamily: "var(--evt-font-heading)",
      fontSize: "clamp(1.4rem, 3vw, 2rem)",
      color: "var(--evt-text)",
      fontWeight: 500,
      letterSpacing: "0.02em",
      fontVariantNumeric: "tabular-nums",
    }}>
      <span style={{ color: "var(--evt-main)", fontWeight: 700 }}>J-{r.days}</span>
      <span style={{ margin: "0 14px", opacity: 0.4 }}>·</span>
      <span>{String(r.hours).padStart(2, "0")}h {String(r.minutes).padStart(2, "0")}m {String(r.seconds).padStart(2, "0")}s</span>
    </div>
  )
}

function VariantFlip({ r }: { r: Remaining }) {
  const units = [
    { value: r.days, label: "JOURS" },
    { value: r.hours, label: "HEURES" },
    { value: r.minutes, label: "MINUTES" },
    { value: r.seconds, label: "SECONDES" },
  ]
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
      {units.map(u => (
        <div key={u.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{
            background: "var(--evt-text)",
            color: "var(--evt-bg)",
            padding: "14px 18px",
            borderRadius: 8,
            fontFamily: "'Courier New', monospace",
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            fontWeight: 700,
            fontVariantNumeric: "tabular-nums",
            boxShadow: "inset 0 -1px 0 rgba(255,255,255,0.2), 0 4px 12px rgba(0,0,0,0.15)",
            letterSpacing: "0.05em",
            position: "relative",
          }}>
            {String(u.value).padStart(2, "0")}
            <span aria-hidden style={{
              position: "absolute", top: "50%", left: 0, right: 0, height: 1,
              background: "color-mix(in srgb, var(--evt-bg) 20%, transparent)",
            }} />
          </div>
          <div style={{
            fontFamily: "var(--evt-font-body)",
            fontSize: 9,
            letterSpacing: "0.25em",
            color: "var(--evt-text-muted)",
            fontWeight: 600,
          }}>{u.label}</div>
        </div>
      ))}
    </div>
  )
}

function VariantCircle({ r }: { r: Remaining }) {
  // Progression sur chaque unité (relative à son cycle complet)
  const units = [
    { value: r.days, label: "Jours", max: 365, color: "var(--evt-main)" },
    { value: r.hours, label: "Heures", max: 24, color: "var(--evt-accent)" },
    { value: r.minutes, label: "Min", max: 60, color: "var(--evt-main)" },
    { value: r.seconds, label: "Sec", max: 60, color: "var(--evt-accent)" },
  ]
  return (
    <div style={{ display: "flex", gap: 18, flexWrap: "wrap", justifyContent: "center" }}>
      {units.map(u => {
        const pct = Math.min(1, u.value / u.max)
        const radius = 36
        const circumference = 2 * Math.PI * radius
        const offset = circumference * (1 - pct)
        return (
          <div key={u.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{ position: "relative", width: 90, height: 90 }}>
              <svg width="90" height="90" viewBox="0 0 90 90">
                <circle cx="45" cy="45" r={radius} fill="none" stroke="color-mix(in srgb, currentColor 15%, transparent)" strokeWidth="3" style={{ color: u.color }} />
                <circle
                  cx="45"
                  cy="45"
                  r={radius}
                  fill="none"
                  stroke={u.color}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  transform="rotate(-90 45 45)"
                  style={{ transition: "stroke-dashoffset 0.8s linear" }}
                />
              </svg>
              <div style={{
                position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--evt-font-heading)",
                fontSize: "1.4rem",
                fontWeight: 600,
                color: "var(--evt-text)",
                fontVariantNumeric: "tabular-nums",
              }}>{u.value}</div>
            </div>
            <div style={{
              fontFamily: "var(--evt-font-body)",
              fontSize: 10,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--evt-text-muted)",
              fontWeight: 600,
            }}>{u.label}</div>
          </div>
        )
      })}
    </div>
  )
}
