"use client"
import { useEffect, useState } from "react"

interface CountdownWidgetProps {
  name: string
  date: string
  guestCount?: number
  guestConfirmed?: number
}

function getTimeLeft(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
}

function formatEventDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-MA", { day: "numeric", month: "long", year: "numeric" })
}

export default function CountdownWidget({ name, date, guestCount = 0, guestConfirmed = 0 }: CountdownWidgetProps) {
  const [time, setTime] = useState<ReturnType<typeof getTimeLeft> | null>(null)

  useEffect(() => {
    setTime(getTimeLeft(date))
    const t = setInterval(() => setTime(getTimeLeft(date)), 1000)
    return () => clearInterval(t)
  }, [date])

  const t = time ?? { days: 0, hours: 0, minutes: 0, seconds: 0 }

  // Ring progress: inverse of days remaining vs total days
  const PLANNING_HORIZON = 365
  const elapsed = Math.max(0, PLANNING_HORIZON - t.days)
  const pct = Math.min(1, elapsed / PLANNING_HORIZON)
  const deg = pct * 360

  const guestPct = guestCount > 0 ? guestConfirmed / guestCount : 0

  return (
    <div style={{ padding: "22px 24px", height: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
      {/* Label */}
      <div style={{
        fontSize: 10, fontWeight: 600, color: "var(--dash-text-3,#9a9aaa)",
        textTransform: "uppercase", letterSpacing: "0.09em",
        marginBottom: 18,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span>Compte à rebours</span>
        <span style={{
          fontSize: 9, background: "rgba(34,197,94,0.1)", color: "#22c55e",
          padding: "2px 7px", borderRadius: 99, fontWeight: 700,
        }}>LIVE</span>
      </div>

      {/* Main content */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, flex: 1 }}>
        {/* Conic-gradient ring */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{
            width: 96, height: 96, borderRadius: "50%",
            background: `conic-gradient(
              from -90deg,
              var(--g1,#E11D48) 0deg,
              var(--g2,#9333EA) ${deg}deg,
              var(--dash-ring-track,rgba(183,191,217,0.20)) ${deg}deg
            )`,
            WebkitMask: "radial-gradient(circle, transparent 38px, black 39px)",
            mask: "radial-gradient(circle, transparent 38px, black 39px)",
          }} />
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            pointerEvents: "none",
          }}>
            <span style={{
              fontSize: 28, fontWeight: 900, lineHeight: 1,
              backgroundImage: "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>{t.days}</span>
            <span style={{ fontSize: 8, color: "var(--dash-text-3,#9a9aaa)", textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 1 }}>
              jours
            </span>
          </div>
        </div>

        {/* Right: breakdown + name */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 13, fontWeight: 700, color: "var(--dash-text,#121317)",
            margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>{name}</p>
          <p style={{ fontSize: 11, color: "var(--dash-text-3,#9a9aaa)", margin: "0 0 14px" }}>{formatEventDate(date)}</p>

          {/* Hours + minutes */}
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { val: t.hours,   label: "heures" },
              { val: t.minutes, label: "min" },
              { val: t.seconds, label: "sec" },
            ].map(({ val, label }) => (
              <div key={label} style={{
                background: "rgba(183,191,217,0.09)",
                borderRadius: 8, padding: "5px 8px", textAlign: "center",
                border: "1px solid rgba(183,191,217,0.15)",
                minWidth: 36,
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--dash-text,#121317)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                  {String(val).padStart(2, "0")}
                </div>
                <div style={{ fontSize: 8, color: "var(--dash-text-3,#9a9aaa)", textTransform: "uppercase", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Guest progress bar */}
      {guestCount > 0 && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(183,191,217,0.1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 10, color: "var(--dash-text-2,#6a6a71)" }}>Invités confirmés</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: "var(--dash-text,#121317)" }}>
              {guestConfirmed} / {guestCount}
            </span>
          </div>
          <div style={{ height: 4, background: "rgba(183,191,217,0.15)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 99,
              width: `${guestPct * 100}%`,
              background: "linear-gradient(90deg, var(--g1,#E11D48), var(--g2,#9333EA))",
              transition: "width 1s ease",
            }} className="clone-progress-fill" />
          </div>
        </div>
      )}
    </div>
  )
}
