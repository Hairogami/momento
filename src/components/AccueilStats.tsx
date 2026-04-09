"use client"

import { useEffect, useState, useCallback } from "react"
import { C } from "@/lib/colors"

/* ─── Types ─────────────────────────────────────────────────────────────────── */

interface MonthStat  { mois: string; total: number; realises: number }
interface PartnerStat { label: string; count: number; color: string }
interface Stats {
  eventsByMonth: MonthStat[]
  partnersByCategory: PartnerStat[]
  totals: { created: number; realized: number; partners: number }
}

/* ─── SVG helpers ────────────────────────────────────────────────────────────── */

function polarToXY(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function donutPath(cx: number, cy: number, outer: number, inner: number, start: number, end: number) {
  const o1 = polarToXY(cx, cy, outer, start)
  const o2 = polarToXY(cx, cy, outer, end)
  const i1 = polarToXY(cx, cy, inner, end)
  const i2 = polarToXY(cx, cy, inner, start)
  const large = end - start > 180 ? 1 : 0
  return `M${o1.x} ${o1.y} A${outer} ${outer} 0 ${large} 1 ${o2.x} ${o2.y} L${i1.x} ${i1.y} A${inner} ${inner} 0 ${large} 0 ${i2.x} ${i2.y} Z`
}

/* ─── Chart 1 : Événements vs Réalisés ──────────────────────────────────────── */

function EventsChart({ data, totals }: { data: MonthStat[]; totals: Stats["totals"] }) {
  const W = 340, H = 160
  const padL = 28, padR = 12, padT = 12, padB = 28
  const chartW = W - padL - padR
  const chartH = H - padT - padB
  const maxVal = Math.max(...data.map(d => d.total), 1) + 1
  const cols   = data.length
  const step   = chartW / cols
  const barW   = step * 0.28
  const taux   = totals.created > 0 ? Math.round((totals.realized / totals.created) * 100) : 0
  const yTicks = [0, Math.round(maxVal / 2), maxVal]

  return (
    <div className="flex-1 rounded-2xl p-5" style={{ backgroundColor: "var(--bg-card)", border: `1px solid var(--border)` }}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: C.terra }}>📅 Événements</p>
          <p className="text-sm font-medium" style={{ color: C.mist }}>Créés vs Réalisés</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold" style={{ color: C.terra }}>{taux}%</p>
          <p className="text-xs" style={{ color: `${C.mist}70` }}>taux de réalisation</p>
        </div>
      </div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
        {yTicks.map(v => {
          const y = padT + chartH - (v / maxVal) * chartH
          return (
            <g key={v}>
              <line x1={padL} x2={W - padR} y1={y} y2={y} stroke={C.anthracite} strokeWidth={0.5} strokeDasharray="4 3" />
              <text x={padL - 4} y={y + 4} textAnchor="end" fontSize={8} fill={`${C.mist}60`}>{v}</text>
            </g>
          )
        })}
        {data.map((d, i) => {
          const x      = padL + i * step + step / 2
          const yT     = padT + chartH - (d.total    / maxVal) * chartH
          const yR     = padT + chartH - (d.realises / maxVal) * chartH
          const hT     = (d.total    / maxVal) * chartH
          const hR     = (d.realises / maxVal) * chartH
          return (
            <g key={i}>
              <rect x={x - barW - 1} y={yT} width={barW} height={hT} rx={3} fill={`${C.terra}35`} />
              <rect x={x + 1}        y={yR} width={barW} height={hR} rx={3} fill={C.terra} />
              <text x={x} y={H - 4} textAnchor="middle" fontSize={8} fill={`${C.mist}70`}>{d.mois}</text>
            </g>
          )
        })}
      </svg>

      <div className="flex items-center gap-4 mt-2">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: `${C.terra}35` }} />
          <span className="text-xs" style={{ color: `${C.mist}80` }}>Créés ({totals.created})</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: C.terra }} />
          <span className="text-xs" style={{ color: `${C.mist}80` }}>Réalisés ({totals.realized})</span>
        </span>
      </div>
    </div>
  )
}

/* ─── Chart 2 : Partenaires ─────────────────────────────────────────────────── */

function PartnersChart({ data, totals }: { data: PartnerStat[]; totals: Stats["totals"] }) {
  const cx = 70, cy = 70, outer = 58, inner = 38, size = 140
  const total = totals.partners || data.reduce((s, d) => s + d.count, 0)

  let angle = 0
  const paths = data.map(d => {
    const sweep = total > 0 ? (d.count / total) * 360 : 0
    const path  = donutPath(cx, cy, outer, inner, angle, angle + Math.max(sweep - 0.5, 0))
    angle += sweep
    return { ...d, path }
  })

  return (
    <div className="flex-1 rounded-2xl p-5" style={{ backgroundColor: "var(--bg-card)", border: `1px solid var(--border)` }}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: C.terra }}>🤝 Partenaires</p>
          <p className="text-sm font-medium" style={{ color: C.mist }}>Utilisés via Momento</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold" style={{ color: C.terra }}>{total}</p>
          <p className="text-xs" style={{ color: `${C.mist}70` }}>réservations</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
          {paths.map((p, i) => <path key={i} d={p.path} fill={p.color} opacity={0.9} />)}
          {total === 0 && (
            <circle cx={cx} cy={cy} r={outer} fill="none" stroke={C.anthracite} strokeWidth={outer - inner} />
          )}
          <text x={cx} y={cy - 6}  textAnchor="middle" fontSize={16} fontWeight="700" fill={C.terra}>{total}</text>
          <text x={cx} y={cy + 10} textAnchor="middle" fontSize={8}  fill={`${C.mist}80`}>partenaires</text>
        </svg>

        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          {paths.map(p => (
            <div key={p.label} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
              <span className="text-xs truncate flex-1" style={{ color: `${C.mist}80` }}>{p.label}</span>
              <span className="text-xs font-semibold flex-shrink-0" style={{ color: C.mist }}>{p.count}</span>
            </div>
          ))}
          {paths.length === 0 && (
            <p className="text-xs" style={{ color: `${C.mist}60` }}>Aucun partenaire encore utilisé</p>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Export principal ───────────────────────────────────────────────────────── */

export default function AccueilStats() {
  const [stats, setStats] = useState<Stats | null>(null)

  const fetchStats = useCallback(() => {
    fetch("/api/stats")
      .then(r => r.json())
      .then(setStats)
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchStats()

    // Rafraîchissement automatique toutes les 30s
    const interval = setInterval(fetchStats, 30_000)

    // Rafraîchissement sur focus (retour sur l'onglet)
    window.addEventListener("focus", fetchStats)

    // Rafraîchissement sur événement custom émis par le dashboard
    window.addEventListener("momento:stats-refresh", fetchStats)

    return () => {
      clearInterval(interval)
      window.removeEventListener("focus", fetchStats)
      window.removeEventListener("momento:stats-refresh", fetchStats)
    }
  }, [fetchStats])

  if (!stats) {
    return (
      <div className="flex gap-4 px-6 pb-8 max-w-4xl mx-auto w-full">
        {[0, 1].map(i => (
          <div key={i} className="flex-1 rounded-2xl h-56 animate-pulse" style={{ backgroundColor: "var(--bg-card)" }} />
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-4 px-6 pb-12 max-w-4xl mx-auto w-full" style={{ marginTop: "-120px" }}>
      <EventsChart data={stats.eventsByMonth} totals={stats.totals} />
      <PartnersChart data={stats.partnersByCategory} totals={stats.totals} />
    </div>
  )
}
