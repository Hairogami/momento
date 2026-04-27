"use client"
import type { BudgetItem } from "@/components/clone/dashboard/BudgetWidget"

const BUDGET_COLORS_LIST = ["#818cf8","#f59e0b","#a855f7","#22c55e","#60a5fa","#f472b6","#34d399","#fb923c"]

function donutPath(cx: number, cy: number, outerR: number, innerR: number, startDeg: number, endDeg: number) {
  const toRad = (d: number) => ((d - 90) * Math.PI) / 180
  const x1 = cx + outerR * Math.cos(toRad(startDeg)), y1 = cy + outerR * Math.sin(toRad(startDeg))
  const x2 = cx + outerR * Math.cos(toRad(endDeg)),   y2 = cy + outerR * Math.sin(toRad(endDeg))
  const x3 = cx + innerR * Math.cos(toRad(endDeg)),   y3 = cy + innerR * Math.sin(toRad(endDeg))
  const x4 = cx + innerR * Math.cos(toRad(startDeg)), y4 = cy + innerR * Math.sin(toRad(startDeg))
  const lg = endDeg - startDeg > 180 ? 1 : 0
  return `M${x1},${y1} A${outerR},${outerR},0,${lg},1,${x2},${y2} L${x3},${y3} A${innerR},${innerR},0,${lg},0,${x4},${y4} Z`
}

// WIDGET-CONTRACT : data = budgetItems via dashboard-data ; empty state ok.
export default function RepartitionBudgetWidget({ budgetItems }: { budgetItems: BudgetItem[] }) {
  const entries = budgetItems.map((b, i) => ({ label: b.label, val: b.spent || b.allocated, color: b.color ?? BUDGET_COLORS_LIST[i % BUDGET_COLORS_LIST.length] })).filter(b => b.val > 0).sort((a, b) => b.val - a.val).slice(0, 6)
  const total = entries.reduce((s, e) => s + e.val, 0)
  if (entries.length === 0) return <div style={{ padding: "20px 16px", fontSize: "var(--text-xs)", color: "var(--dash-text-3,#9a9aaa)" }}>Aucune dépense</div>
  let angle = 0
  const paths = entries.map(e => {
    const sweep = total > 0 ? (e.val / total) * 360 : 0
    const path = donutPath(50, 50, 42, 28, angle, angle + Math.max(sweep - 1, 0))
    angle += sweep
    return { ...e, path }
  })
  return (
    <div style={{ padding: "10px 16px 16px", display: "flex", flexDirection: "column", gap: 10, boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <svg width={90} height={90} viewBox="0 0 100 100">
          {paths.map((p, i) => <path key={i} d={p.path} fill={p.color} opacity={0.9} />)}
          <text x={50} y={54} textAnchor="middle" fontSize={7} fontWeight="700" fill="var(--dash-text,#121317)">{Math.round(total / 1000)}k</text>
        </svg>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {paths.map(p => (
          <div key={p.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--text-2xs)" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
            <span style={{ flex: 1, color: "var(--dash-text-2,#45474D)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.label}</span>
            <span style={{ fontWeight: 600, color: p.color }}>{Math.round((p.val / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
