"use client"
import Link from "next/link"

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
  const totalAllocated = items.reduce((s, i) => s + i.allocated, 0)
  const allocPct = total > 0 ? Math.min(1, totalAllocated / total) : 0
  const isOverBudget = totalAllocated > total
  const freeRemaining = Math.max(0, total - totalAllocated)

  const R = 42
  const CIRC = 2 * Math.PI * R
  const dash = CIRC * allocPct

  return (
    <div style={{ padding: "22px 24px", height: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
      {/* Header */}
      <div style={{
        fontSize: "var(--text-2xs)", fontWeight: 600, color: "var(--dash-text-3,#9a9aaa)",
        textTransform: "uppercase", letterSpacing: "0.09em",
        marginBottom: 18,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span>Budget</span>
        {isOverBudget && (
          <span style={{
            fontSize: "var(--text-2xs)", background: "rgba(239,68,68,0.1)", color: "#ef4444",
            padding: "2px 7px", borderRadius: 99, fontWeight: 700,
          }}>DÉPASSÉ</span>
        )}
      </div>

      {/* Donut + totals row */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 18 }}>
        {/* SVG Donut */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <svg width={96} height={96} viewBox="0 0 100 100" style={{ overflow: "hidden", display: "block" }}>
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
              stroke="var(--dash-ring-track,rgba(183,191,217,0.20))"
              strokeWidth={11}
            />
            {/* Progress — allocated vs total */}
            <circle
              cx={50} cy={50} r={R}
              fill="none"
              stroke={isOverBudget ? "#ef4444" : "url(#bgt-used-grad)"}
              strokeWidth={11}
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC - dash}
              transform="rotate(-90 50 50)"
              style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
            />
          </svg>
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            pointerEvents: "none",
          }}>
            <span style={{
              fontSize: "var(--text-sm)", fontWeight: 800, lineHeight: 1,
              backgroundImage: isOverBudget ? "none" : "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))",
              WebkitBackgroundClip: isOverBudget ? undefined : "text",
              WebkitTextFillColor: isOverBudget ? "#ef4444" : "transparent",
              backgroundClip: isOverBudget ? undefined : "text",
              color: isOverBudget ? "#ef4444" : undefined,
            }}>{Math.round(allocPct * 100)}%</span>
            <span style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3,#9a9aaa)", textTransform: "uppercase", marginTop: 1 }}>planifié</span>
          </div>
        </div>

        {/* Numbers */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3,#9a9aaa)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>Alloué</div>
            <div style={{
              fontSize: "var(--text-md)", fontWeight: 800, lineHeight: 1,
              backgroundImage: "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              {totalAllocated.toLocaleString("fr-MA")}
            </div>
            <div style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3,#9a9aaa)", marginTop: 1 }}>Dhs</div>
          </div>
          <div>
            <div style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3,#9a9aaa)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>Libre</div>
            <div style={{
              fontSize: "var(--text-sm)", fontWeight: 700,
              color: freeRemaining < total * 0.1 ? "#ef4444" : "var(--dash-text,#121317)",
            }}>
              {freeRemaining.toLocaleString("fr-MA")} Dhs
            </div>
          </div>
          {spent > 0 && (
            <div style={{ marginTop: 6 }}>
              <div style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3,#9a9aaa)" }}>
                Réel dépensé : <strong style={{ color: "var(--dash-text-2)" }}>{spent.toLocaleString("fr-MA")} Dhs</strong>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category breakdown */}
      <div style={{ flex: 1, overflow: "auto", scrollbarWidth: "none" }}>
        {items.length === 0 ? (
          <p style={{ fontSize: "var(--text-xs)", color: "var(--dash-text-3,#9a9aaa)", textAlign: "center", padding: "16px 0", margin: 0 }}>
            Aucune dépense · <Link href="/budget" style={{ color: "var(--g1,#E11D48)" }}>Ajouter →</Link>
          </p>
        ) : items.slice(0, 5).map((item) => {
          const itemPct = totalAllocated > 0 ? Math.min(1, item.allocated / totalAllocated) : 0
          return (
            <div key={item.label} style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "var(--text-sm)", flexShrink: 0 }}>{item.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, alignItems: "center" }}>
                  <span style={{ fontSize: "var(--text-2xs)", fontWeight: 500, color: "var(--dash-text-2,#45474D)" }}>{item.label}</span>
                  <span style={{ fontSize: "var(--text-2xs)", fontWeight: 600, color: item.color }}>
                    {item.allocated.toLocaleString("fr-MA")}
                  </span>
                </div>
                <div style={{ height: 3, background: "rgba(183,191,217,0.12)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 99,
                    width: `${itemPct * 100}%`,
                    background: item.color,
                    transition: "width 0.4s",
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
        <Link href="/budget" style={{
          fontSize: "var(--text-2xs)", color: "var(--g1,#E11D48)",
          textDecoration: "none", fontWeight: 600,
        }}>
          Gérer le budget →
        </Link>
        <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--dash-text,#121317)" }}>
          {total.toLocaleString("fr-MA")} Dhs
        </span>
      </div>
    </div>
  )
}
