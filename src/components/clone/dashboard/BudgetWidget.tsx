"use client"
import { useEffect, useRef } from "react"

export type BudgetItem = {
  label: string
  allocated: number
  spent: number
  color: string
  icon: string
}

interface BudgetWidgetProps {
  total: number
  spent: number
  items: BudgetItem[]
}

export default function BudgetWidget({ total, spent, items }: BudgetWidgetProps) {
  const circleRef = useRef<SVGCircleElement>(null)
  const remaining = Math.max(0, total - spent)
  const pct = total > 0 ? Math.min(1, spent / total) : 0
  const isOverBudget = spent > total

  const R = 42
  const CIRC = 2 * Math.PI * R
  const dash = CIRC * pct

  useEffect(() => {
    if (!circleRef.current) return
    // Animate on mount
    circleRef.current.style.strokeDashoffset = String(CIRC - dash)
  }, [CIRC, dash])

  return (
    <div style={{ padding: "22px 24px", height: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
      {/* Header */}
      <div style={{
        fontSize: 10, fontWeight: 600, color: "#9a9aaa",
        textTransform: "uppercase", letterSpacing: "0.09em",
        marginBottom: 18,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span>Budget</span>
        {isOverBudget && (
          <span style={{
            fontSize: 9, background: "rgba(239,68,68,0.1)", color: "#ef4444",
            padding: "2px 7px", borderRadius: 99, fontWeight: 700,
          }}>DÉPASSÉ</span>
        )}
      </div>

      {/* Donut + totals row */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 18 }}>
        {/* SVG Donut */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <svg width={96} height={96} viewBox="0 0 100 100" style={{ overflow: "visible" }}>
            <defs>
              <linearGradient id="bgt-used-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--g1,#E11D48)" />
                <stop offset="100%" stopColor="var(--g2,#9333EA)" />
              </linearGradient>
            </defs>
            {/* Track */}
            <circle
              cx={50} cy={50} r={R}
              fill="none"
              stroke="rgba(183,191,217,0.15)"
              strokeWidth={11}
            />
            {/* Progress */}
            <circle
              ref={circleRef}
              cx={50} cy={50} r={R}
              fill="none"
              stroke={isOverBudget ? "#ef4444" : "url(#bgt-used-grad)"}
              strokeWidth={11}
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC}
              transform="rotate(-90 50 50)"
              style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)", transformOrigin: "50px 50px" }}
            />
          </svg>
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            pointerEvents: "none",
          }}>
            <span style={{
              fontSize: 16, fontWeight: 800, lineHeight: 1,
              backgroundImage: isOverBudget
                ? "none"
                : "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))",
              WebkitBackgroundClip: isOverBudget ? undefined : "text",
              WebkitTextFillColor: isOverBudget ? "#ef4444" : "transparent",
              backgroundClip: isOverBudget ? undefined : "text",
              color: isOverBudget ? "#ef4444" : undefined,
            }}>{Math.round(pct * 100)}%</span>
            <span style={{ fontSize: 8, color: "#9a9aaa", textTransform: "uppercase", marginTop: 1 }}>utilisé</span>
          </div>
        </div>

        {/* Numbers */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 9, color: "#9a9aaa", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>Dépensé</div>
            <div style={{
              fontSize: 18, fontWeight: 800, lineHeight: 1,
              backgroundImage: "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              {spent.toLocaleString("fr-MA")}
            </div>
            <div style={{ fontSize: 9, color: "#9a9aaa", marginTop: 1 }}>MAD</div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: "#9a9aaa", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>Restant</div>
            <div style={{
              fontSize: 14, fontWeight: 700,
              color: remaining < total * 0.1 ? "#ef4444" : "#121317",
            }}>
              {remaining.toLocaleString("fr-MA")} MAD
            </div>
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div style={{ flex: 1, overflow: "auto", scrollbarWidth: "none" }}>
        {items.slice(0, 5).map(item => {
          const itemPct = item.allocated > 0 ? Math.min(1, item.spent / item.allocated) : 0
          return (
            <div key={item.label} style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 13, flexShrink: 0 }}>{item.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 500, color: "#45474D" }}>{item.label}</span>
                  <span style={{ fontSize: 10, color: "#9a9aaa" }}>
                    {Math.round(itemPct * 100)}%
                  </span>
                </div>
                <div style={{ height: 3, background: "rgba(183,191,217,0.12)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 99,
                    width: `${itemPct * 100}%`,
                    background: item.color,
                    transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)",
                  }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{
        paddingTop: 12, borderTop: "1px solid rgba(183,191,217,0.1)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontSize: 10, color: "#9a9aaa" }}>Total budget</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#121317" }}>
          {total.toLocaleString("fr-MA")} MAD
        </span>
      </div>
    </div>
  )
}
