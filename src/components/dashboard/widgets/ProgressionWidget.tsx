"use client"
import { G } from "./_shared"

// WIDGET-CONTRACT : data = 4 ratios computed dans DashboardClient ; pas de state.
export default function ProgressionWidget({ taskPct, budgetPct, guestPct, bookingsPct }: {
  taskPct: number; budgetPct: number; guestPct: number; bookingsPct: number
}) {
  const score = Math.round(((taskPct + budgetPct + guestPct + bookingsPct) / 4) * 100)
  const R = 40, CIRC = 2 * Math.PI * R
  const dash = CIRC * (score / 100)
  const bars = [
    { label: "Tâches",        val: taskPct,     color: "#818cf8" },
    { label: "Budget",        val: budgetPct,   color: "#f59e0b" },
    { label: "Invités",       val: guestPct,    color: "#22c55e" },
    { label: "Prestataires",  val: bookingsPct, color: "#e11d48" },
  ]
  return (
    <div style={{ padding: "12px 16px 16px", height: "100%", display: "flex", flexDirection: "column", gap: 8, boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <svg width={96} height={96} viewBox="0 0 100 100">
            <defs>
              <linearGradient id="prog-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--g1,#E11D48)" />
                <stop offset="100%" stopColor="var(--g2,#9333EA)" />
              </linearGradient>
            </defs>
            <circle cx={50} cy={50} r={R} fill="none" stroke="var(--dash-faint,rgba(183,191,217,0.18))" strokeWidth={10} />
            <circle cx={50} cy={50} r={R} fill="none" stroke="url(#prog-grad)" strokeWidth={10}
              strokeDasharray={`${dash} ${CIRC}`} strokeLinecap="round"
              transform="rotate(-90 50 50)" style={{ transition: "stroke-dasharray 0.6s ease" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "var(--text-md)", fontWeight: 800, background: G, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{score}%</span>
            <span style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3,#9a9aaa)", textTransform: "uppercase", letterSpacing: "0.06em" }}>global</span>
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
          {bars.map(b => (
            <div key={b.label}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-2xs)", color: "var(--dash-text-2,#45474D)", marginBottom: 2 }}>
                <span>{b.label}</span><span style={{ fontWeight: 600 }}>{Math.round(b.val * 100)}%</span>
              </div>
              <div style={{ height: 4, borderRadius: 99, background: "var(--dash-faint,rgba(183,191,217,0.18))", overflow: "hidden" }}>
                <div style={{ width: `${Math.round(b.val * 100)}%`, height: "100%", background: b.color, transition: "width 0.4s" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
