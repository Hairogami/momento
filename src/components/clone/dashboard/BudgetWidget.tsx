"use client"
import { useEffect, useRef, useState } from "react"

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
  const inputRef  = useRef<HTMLInputElement>(null)
  const [spentOverrides, setSpentOverrides] = useState<Record<number, number>>({})
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [editValue, setEditValue]   = useState("")

  function startEdit(idx: number, currentSpent: number) {
    setEditingIdx(idx); setEditValue(String(currentSpent))
    setTimeout(() => inputRef.current?.select(), 10)
  }
  function commitEdit(idx: number) {
    const v = parseFloat(editValue)
    if (!isNaN(v) && v >= 0) setSpentOverrides(p => ({ ...p, [idx]: v }))
    setEditingIdx(null)
  }
  const remaining = Math.max(0, total - spent)
  const pct = total > 0 ? Math.min(1, spent / total) : 0
  const isOverBudget = spent > total

  const R = 42
  const CIRC = 2 * Math.PI * R
  const dash = CIRC * pct

  useEffect(() => {
    if (!circleRef.current) return
    circleRef.current.style.strokeDashoffset = String(CIRC - dash)
  }, [CIRC, dash])

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
              style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
            />
          </svg>
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            pointerEvents: "none",
          }}>
            <span style={{
              fontSize: "var(--text-base)", fontWeight: 800, lineHeight: 1,
              backgroundImage: isOverBudget
                ? "none"
                : "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))",
              WebkitBackgroundClip: isOverBudget ? undefined : "text",
              WebkitTextFillColor: isOverBudget ? "#ef4444" : "transparent",
              backgroundClip: isOverBudget ? undefined : "text",
              color: isOverBudget ? "#ef4444" : undefined,
            }}>{Math.round(pct * 100)}%</span>
            <span style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3,#9a9aaa)", textTransform: "uppercase", marginTop: 1 }}>utilisé</span>
          </div>
        </div>

        {/* Numbers */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3,#9a9aaa)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>Dépensé</div>
            <div style={{
              fontSize: "var(--text-md)", fontWeight: 800, lineHeight: 1,
              backgroundImage: "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              {spent.toLocaleString("fr-MA")}
            </div>
            <div style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3,#9a9aaa)", marginTop: 1 }}>Dhs</div>
          </div>
          <div>
            <div style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3,#9a9aaa)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>Restant</div>
            <div style={{
              fontSize: "var(--text-sm)", fontWeight: 700,
              color: remaining < total * 0.1 ? "#ef4444" : "var(--dash-text,#121317)",
            }}>
              {remaining.toLocaleString("fr-MA")} Dhs
            </div>
          </div>
        </div>
      </div>

      {/* Category breakdown — click montant pour éditer */}
      <div style={{ flex: 1, overflow: "auto", scrollbarWidth: "none" }}>
        {items.slice(0, 5).map((item, idx) => {
          const effectiveSpent = spentOverrides[idx] ?? item.spent
          const itemPct = item.allocated > 0 ? Math.min(1, effectiveSpent / item.allocated) : 0
          const isEditing = editingIdx === idx
          return (
            <div key={item.label} style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "var(--text-sm)", flexShrink: 0 }}>{item.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, alignItems: "center" }}>
                  <span style={{ fontSize: "var(--text-2xs)", fontWeight: 500, color: "var(--dash-text-2,#45474D)" }}>{item.label}</span>
                  {isEditing ? (
                    <input ref={inputRef} type="number" value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onBlur={() => commitEdit(idx)}
                      onKeyDown={e => { if (e.key === "Enter") commitEdit(idx); if (e.key === "Escape") setEditingIdx(null) }}
                      style={{ width: 72, fontSize: "var(--text-2xs)", padding: "1px 5px", borderRadius: 6, border: "1.5px solid var(--g1,#E11D48)", background: "var(--dash-faint,rgba(183,191,217,0.06))", outline: "none", fontFamily: "inherit", color: "var(--dash-text,#121317)", textAlign: "right" }} />
                  ) : (
                    <button onClick={() => startEdit(idx, effectiveSpent)} title="Modifier"
                      style={{ fontSize: "var(--text-2xs)", fontWeight: 600, color: item.color, background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", padding: "1px 4px", borderRadius: 4 }}>
                      {effectiveSpent.toLocaleString("fr-MA")} ✎
                    </button>
                  )}
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
        <span style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3,#9a9aaa)" }}>Total budget</span>
        <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--dash-text,#121317)" }}>
          {total.toLocaleString("fr-MA")} Dhs
        </span>
      </div>
    </div>
  )
}
