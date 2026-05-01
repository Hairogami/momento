"use client"
import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

const ShiftingCountdown = dynamic(() => import("./countdown/ShiftingCountdown"), { ssr: false })
const FlipCountdown     = dynamic(() => import("./countdown/FlipCountdown"),     { ssr: false })
const BlocksCountdown   = dynamic(() => import("./countdown/BlocksCountdown"),   { ssr: false })
const MinimalCountdown  = dynamic(() => import("./countdown/MinimalCountdown"),  { ssr: false })
const TicketCountdown   = dynamic(() => import("./countdown/TicketCountdown"),   { ssr: false })

type Theme = "ring" | "shifting" | "flip" | "blocks" | "minimal" | "ticket"

interface Props {
  name: string
  date: string
  guestCount?: number
  guestConfirmed?: number
  plannerId: string
  initialTheme?: string
}

function getTimeLeft(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
}

function formatEventDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-MA", { day: "numeric", month: "long", year: "numeric" })
}

const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"

const THEMES: { id: Theme; label: string; emoji: string }[] = [
  { id: "ring",     label: "Arc",     emoji: "⭕" },
  { id: "shifting", label: "Slide",   emoji: "↕" },
  { id: "flip",     label: "Flip",    emoji: "🃏" },
  { id: "blocks",   label: "Blocs",   emoji: "▦" },
  { id: "minimal",  label: "Minimal", emoji: "◎" },
  { id: "ticket",   label: "Ticket",  emoji: "🎫" },
]

// ── Ring design (existing) ────────────────────────────────────────────────────
function RingCountdown({ name, date, guestCount = 0, guestConfirmed = 0 }: Omit<Props, "plannerId" | "initialTheme">) {
  const [time, setTime] = useState<ReturnType<typeof getTimeLeft> | null>(null)
  useEffect(() => {
    setTime(getTimeLeft(date))
    const t = setInterval(() => setTime(getTimeLeft(date)), 1000)
    return () => clearInterval(t)
  }, [date])

  const t = time ?? { days: 0, hours: 0, minutes: 0, seconds: 0 }
  const PLANNING_HORIZON = 365
  const elapsed = Math.max(0, PLANNING_HORIZON - t.days)
  const deg = Math.min(1, elapsed / PLANNING_HORIZON) * 360
  const guestPct = guestCount > 0 ? guestConfirmed / guestCount : 0

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20, flex: 1 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{
            width: 96, height: 96, borderRadius: "50%",
            background: `conic-gradient(from -90deg, var(--g1,#E11D48) 0deg, var(--g2,#9333EA) ${deg}deg, var(--dash-ring-track,rgba(183,191,217,0.20)) ${deg}deg)`,
            WebkitMask: "radial-gradient(circle, transparent 38px, black 39px)",
            mask: "radial-gradient(circle, transparent 38px, black 39px)",
          }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <span style={{ fontSize: "var(--text-lg)", fontWeight: 900, lineHeight: 1, backgroundImage: G, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{t.days}</span>
            <span style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 1 }}>jours</span>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--dash-text)", margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</p>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--dash-text-3)", margin: "0 0 14px" }}>{formatEventDate(date)}</p>
          <div style={{ display: "flex", gap: 8 }}>
            {[{ val: t.hours, label: "heures" }, { val: t.minutes, label: "min" }, { val: t.seconds, label: "sec" }].map(({ val, label }) => (
              <div key={label} style={{ background: "rgba(183,191,217,0.09)", borderRadius: 8, padding: "5px 8px", textAlign: "center", border: "1px solid rgba(183,191,217,0.15)", minWidth: 36 }}>
                <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--dash-text)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{String(val).padStart(2, "0")}</div>
                <div style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3)", textTransform: "uppercase", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {guestCount > 0 && (
        <div style={{ paddingTop: 16, borderTop: "1px solid rgba(183,191,217,0.1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-2)" }}>Invités confirmés</span>
            <span style={{ fontSize: "var(--text-2xs)", fontWeight: 600, color: "var(--dash-text)" }}>{guestConfirmed} / {guestCount}</span>
          </div>
          <div style={{ height: 4, background: "rgba(183,191,217,0.15)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 99, width: `${guestPct * 100}%`, background: G, transition: "width 1s ease" }} />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Theme Picker Modal ─────────────────────────────────────────────────────────
function ThemePicker({ current, onSelect, onClose }: { current: Theme; onSelect: (t: Theme) => void; onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Choisir un design de compte à rebours"
      style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--dash-surface,#fff)",
          border: "1px solid var(--dash-border,rgba(183,191,217,0.15))",
          borderRadius: 20,
          padding: "24px 20px 20px",
          width: "100%", maxWidth: 380,
          boxShadow: "var(--shadow-modal,0 8px 24px rgba(0,0,0,0.12))",
          maxHeight: "90dvh",
          display: "flex", flexDirection: "column",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <p style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--dash-text)", margin: 0 }}>
            Design du compte à rebours
          </p>
          <button
            onClick={onClose}
            aria-label="Fermer"
            style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4, color: "var(--dash-text-3)", lineHeight: 1, fontSize: 18, fontFamily: "inherit" }}
          >
            ✕
          </button>
        </div>

        {/* Grid — scrollable si contenu dépasse */}
        <div style={{
          overflowY: "auto",
          flexShrink: 1,
          scrollbarWidth: "thin",
          scrollbarColor: "var(--dash-border) transparent",
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {THEMES.map(({ id, label, emoji }) => {
              const active = current === id
              return (
                <button
                  key={id}
                  onClick={() => onSelect(id)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                    padding: "14px 8px", borderRadius: 14, cursor: "pointer",
                    border: `2px solid ${active ? "var(--g1,#E11D48)" : "var(--dash-border,rgba(183,191,217,0.15))"}`,
                    background: active
                      ? "color-mix(in srgb, var(--g1,#E11D48) 8%, transparent)"
                      : "var(--dash-faint,rgba(183,191,217,0.07))",
                    transition: "border-color 0.15s, background 0.15s",
                    fontFamily: "inherit",
                    boxShadow: active ? "0 2px 8px color-mix(in srgb, var(--g1,#E11D48) 20%, transparent)" : "none",
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--dash-faint-2,rgba(183,191,217,0.18))" }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = "var(--dash-faint,rgba(183,191,217,0.07))" }}
                >
                  <span style={{ fontSize: 24 }}>{emoji}</span>
                  <span style={{
                    fontSize: "var(--text-2xs)", fontWeight: 700,
                    color: active ? "var(--g1,#E11D48)" : "var(--dash-text-2,#6a6a71)",
                    letterSpacing: "0.01em",
                  }}>
                    {label}
                  </span>
                  {active && (
                    <span style={{
                      fontSize: "var(--text-2xs)", padding: "1px 6px", borderRadius: 99,
                      background: "var(--g1,#E11D48)", color: "#fff", fontWeight: 700,
                    }}>
                      Actif
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer hint */}
        <p style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3)", textAlign: "center", margin: "14px 0 0" }}>
          Le design est sauvegardé automatiquement
        </p>
      </div>
    </div>
  )
}

// ── Main widget ────────────────────────────────────────────────────────────────
export default function CountdownWidget({ name, date, guestCount = 0, guestConfirmed = 0, plannerId, initialTheme }: Props) {
  const [theme, setTheme] = useState<Theme>((initialTheme as Theme) ?? "ring")
  const [pickerOpen, setPickerOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleSelect(t: Theme) {
    setTheme(t)
    setPickerOpen(false)
    setSaving(true)
    try {
      await fetch(`/api/planners/${plannerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countdownTheme: t }),
      })
    } catch { /* non-bloquant */ } finally {
      setSaving(false)
    }
  }

  const innerProps = { name, date, guestCount, guestConfirmed }

  return (
    <div style={{ padding: "22px 24px", height: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
      {/* Header */}
      <div style={{
        fontSize: "var(--text-2xs)", fontWeight: 600, color: "var(--dash-text-3)",
        textTransform: "uppercase", letterSpacing: "0.09em",
        marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span>Compte à rebours</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => setPickerOpen(true)}
            title="Changer le design"
            style={{
              background: "transparent", border: "1px solid var(--dash-border)", borderRadius: 6,
              padding: "2px 8px", cursor: "pointer", fontSize: "var(--text-2xs)",
              color: "var(--dash-text-3)", fontFamily: "inherit", fontWeight: 600,
              opacity: saving ? 0.5 : 1,
            }}
          >
            {saving ? "…" : "Design"}
          </button>
          <span style={{ fontSize: "var(--text-2xs)", background: "rgba(34,197,94,0.1)", color: "#22c55e", padding: "2px 7px", borderRadius: 99, fontWeight: 700 }}>LIVE</span>
        </div>
      </div>

      {/* Centered countdown content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "100%", height: "100%" }}>
          {theme === "ring"     && <RingCountdown     {...innerProps} />}
          {theme === "shifting" && <ShiftingCountdown name={name} date={date} />}
          {theme === "flip"     && <FlipCountdown     name={name} date={date} />}
          {theme === "blocks"   && <BlocksCountdown   name={name} date={date} />}
          {theme === "minimal"  && <MinimalCountdown  name={name} date={date} />}
          {theme === "ticket"   && <TicketCountdown   name={name} date={date} />}
        </div>
      </div>

      {pickerOpen && <ThemePicker current={theme} onSelect={handleSelect} onClose={() => setPickerOpen(false)} />}
    </div>
  )
}
