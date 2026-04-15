"use client"
/**
 * Home de l'espace prestataire — orchestre :
 *  - PeriodSelector (Aujourd'hui / 7j / 30j / Custom)
 *  - KPI strip (4 cartes avec delta)
 *  - Sparkline vues (SVG natif)
 *  - Funnel views → clicks → requests → won (barres décroissantes)
 *  - Donut inbox par statut
 *  - ScoreCard complétude (top 3 actions)
 *  - Preview fiche publique
 *
 * Data : GET /api/vendor/stats?period=... + GET /api/vendor/completion
 */
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"

type Period = "today" | "7d" | "30d" | "custom"

type DeltaKpi = { current: number; previous: number; deltaPct: number | null }

type StatsPayload = {
  period: Period
  window: { start: string; end: string; bucket: "hour" | "day" }
  kpis: {
    views:          DeltaKpi
    contactClicks:  DeltaKpi
    requests:       DeltaKpi
    conversionRate: DeltaKpi
  }
  series: { label: string; views: number }[]
  funnel: { views: number; contactClicks: number; requests: number; won: number }
  donut:  { new: number; read: number; replied: number; won: number; lost: number }
}

type CompletionPayload = {
  score: number
  maxScore: number
  percent: number
  itemsDone: number
  itemsTotal: number
  nextSteps: { id: string; label: string; weight: number; cta: { label: string; href: string } }[]
}

export default function VendorHome({ publicSlug, vendorName }: { publicSlug: string; vendorName: string }) {
  const [period, setPeriod] = useState<Period>("30d")
  const [from,   setFrom]   = useState<string>(() => toInputDate(new Date(Date.now() - 30 * 86400_000)))
  const [to,     setTo]     = useState<string>(() => toInputDate(new Date()))

  const [stats,       setStats]      = useState<StatsPayload | null>(null)
  const [completion,  setCompletion] = useState<CompletionPayload | null>(null)
  const [loading,     setLoading]    = useState(true)
  const [error,       setError]      = useState<string | null>(null)

  const statsUrl = useMemo(() => {
    if (period === "custom") return `/api/vendor/stats?period=custom&from=${from}&to=${to}`
    return `/api/vendor/stats?period=${period}`
  }, [period, from, to])

  // Fetch stats dès que la période change
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch(statsUrl)
      .then(r => r.ok ? r.json() : r.json().then(d => Promise.reject(d.error ?? "Erreur")))
      .then((data: StatsPayload) => { if (!cancelled) setStats(data) })
      .catch(e => { if (!cancelled) setError(typeof e === "string" ? e : "Erreur chargement") })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [statsUrl])

  // Fetch completion (indépendant de la période)
  useEffect(() => {
    fetch("/api/vendor/completion")
      .then(r => r.ok ? r.json() : null)
      .then((data: CompletionPayload | null) => { if (data) setCompletion(data) })
      .catch(() => {})
  }, [])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#121317", margin: 0 }}>Bonjour, {vendorName}</h1>
          <p style={{ fontSize: 13, color: "#6a6a71", margin: "4px 0 0" }}>
            Voici l&apos;activité de votre fiche prestataire
          </p>
        </div>
        <PeriodSelector
          period={period} setPeriod={setPeriod}
          from={from} setFrom={setFrom}
          to={to} setTo={setTo}
        />
      </div>

      {error && <Banner variant="error">{error}</Banner>}

      {/* KPI strip */}
      <KPIStrip stats={stats} loading={loading} period={period} />

      {/* Row 1 : Sparkline + Donut */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
        <Card title="Vues de votre fiche" subtitle={windowLabel(stats)}>
          <Sparkline series={stats?.series ?? []} bucket={stats?.window.bucket ?? "day"} />
        </Card>
        <Card title="Inbox (tous statuts)" subtitle="Depuis la création">
          <Donut donut={stats?.donut} />
        </Card>
      </div>

      {/* Row 2 : Funnel + ScoreCard */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card title="Entonnoir de conversion" subtitle={windowLabel(stats)}>
          <Funnel funnel={stats?.funnel} />
        </Card>
        <Card title="Complétude du profil" subtitle={completion ? `${completion.itemsDone}/${completion.itemsTotal} items validés` : ""}>
          <ScoreCard completion={completion} />
        </Card>
      </div>

      {/* Preview fiche publique */}
      <Card title="Votre fiche publique" subtitle={`/vendor/${publicSlug}`}>
        <PreviewCard publicSlug={publicSlug} />
      </Card>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
 *   Period selector
 * ══════════════════════════════════════════════════════════════════════════ */

function PeriodSelector(props: {
  period: Period; setPeriod: (p: Period) => void
  from: string; setFrom: (v: string) => void
  to: string; setTo: (v: string) => void
}) {
  const tabs: { id: Period; label: string }[] = [
    { id: "today",  label: "Aujourd'hui" },
    { id: "7d",     label: "7 derniers jours" },
    { id: "30d",    label: "30 derniers jours" },
    { id: "custom", label: "Personnalisé" },
  ]
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <div style={{
        display: "inline-flex", padding: 3, borderRadius: 10,
        background: "#f0f1f6", border: "1px solid rgba(183,191,217,0.22)",
      }}>
        {tabs.map(t => {
          const active = props.period === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => props.setPeriod(t.id)}
              style={{
                padding: "6px 12px", borderRadius: 7,
                fontSize: 12, fontWeight: active ? 600 : 500,
                color: active ? "#fff" : "#45474D",
                background: active ? "#121317" : "transparent",
                border: "none", cursor: "pointer",
                transition: "background 120ms ease",
                fontFamily: "inherit",
              }}
            >
              {t.label}
            </button>
          )
        })}
      </div>
      {props.period === "custom" && (
        <div style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
          <input type="date" value={props.from} onChange={e => props.setFrom(e.target.value)} style={dateInputStyle} />
          <span style={{ color: "#8a8f9c", fontSize: 12 }}>→</span>
          <input type="date" value={props.to} onChange={e => props.setTo(e.target.value)} style={dateInputStyle} />
        </div>
      )}
    </div>
  )
}

const dateInputStyle: React.CSSProperties = {
  height: 32, padding: "0 8px", borderRadius: 8,
  border: "1px solid rgba(183,191,217,0.35)", background: "#fff",
  fontSize: 12, color: "#121317", fontFamily: "inherit", outline: "none",
}

/* ═══════════════════════════════════════════════════════════════════════════
 *   KPI strip
 * ══════════════════════════════════════════════════════════════════════════ */

function KPIStrip({ stats, loading, period }: { stats: StatsPayload | null; loading: boolean; period: Period }) {
  const items = [
    { label: "Vues de fiche",     key: "views",          format: (n: number) => n.toLocaleString("fr-FR") },
    { label: "Clics contact",     key: "contactClicks",  format: (n: number) => n.toLocaleString("fr-FR") },
    { label: "Demandes reçues",   key: "requests",       format: (n: number) => n.toLocaleString("fr-FR") },
    { label: "Taux de conversion", key: "conversionRate", format: (n: number) => `${n.toFixed(1)}%` },
  ] as const

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
      {items.map(it => {
        const k = stats?.kpis[it.key]
        return (
          <div key={it.key} style={cardStyle(16)}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#8a8f9c", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {it.label}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#121317", marginTop: 8, fontVariantNumeric: "tabular-nums" }}>
              {loading ? "—" : k ? it.format(k.current) : "0"}
            </div>
            <div style={{ fontSize: 11, color: "#6a6a71", marginTop: 4 }}>
              {loading || !k ? "\u00A0" : <DeltaBadge delta={k.deltaPct} />} <span style={{ color: "#8a8f9c" }}>vs {prevPeriodLabel(period)}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function DeltaBadge({ delta }: { delta: number | null }) {
  if (delta === null) return <span style={{ color: "#8a8f9c" }}>N/A</span>
  if (delta === 0)    return <span style={{ color: "#8a8f9c" }}>— 0%</span>
  const up    = delta > 0
  const color = up ? "#16a34a" : "#ef4444"
  const arrow = up ? "▲" : "▼"
  return <span style={{ color, fontWeight: 600 }}>{arrow} {Math.abs(delta).toFixed(1)}%</span>
}

/* ═══════════════════════════════════════════════════════════════════════════
 *   Sparkline
 * ══════════════════════════════════════════════════════════════════════════ */

function Sparkline({ series, bucket }: { series: { label: string; views: number }[]; bucket: "hour" | "day" }) {
  if (series.length === 0) return <EmptyBlock>Aucune donnée sur cette période</EmptyBlock>

  const W = 800, H = 180, PAD = { t: 16, r: 12, b: 22, l: 32 }
  const max = Math.max(1, ...series.map(p => p.views))
  const xStep = series.length > 1 ? (W - PAD.l - PAD.r) / (series.length - 1) : 0

  const points = series.map((p, i) => {
    const x = PAD.l + i * xStep
    const y = PAD.t + (1 - p.views / max) * (H - PAD.t - PAD.b)
    return { x, y, v: p.views, label: p.label }
  })

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ")
  const areaPath = `${path} L ${points[points.length - 1].x.toFixed(1)} ${H - PAD.b} L ${points[0].x.toFixed(1)} ${H - PAD.b} Z`

  // Ticks : 3 gradations Y
  const yTicks = [0, max / 2, max].map(v => ({
    v: Math.round(v),
    y: PAD.t + (1 - v / max) * (H - PAD.t - PAD.b),
  }))

  // Ticks X : 5 labels max
  const xTickStep = Math.max(1, Math.ceil(series.length / 5))
  const xTicks = points.filter((_, i) => i % xTickStep === 0 || i === points.length - 1)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 180, display: "block" }}>
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#E11D48" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#E11D48" stopOpacity="0.00" />
        </linearGradient>
      </defs>
      {/* grid */}
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={PAD.l} x2={W - PAD.r} y1={t.y} y2={t.y} stroke="#eef0f5" strokeWidth="1" />
          <text x={PAD.l - 6} y={t.y + 3} fontSize="10" fill="#8a8f9c" textAnchor="end">{t.v}</text>
        </g>
      ))}
      {/* area + line */}
      <path d={areaPath} fill="url(#sparkFill)" />
      <path d={path} fill="none" stroke="#E11D48" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {/* dots */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#fff" stroke="#E11D48" strokeWidth="1.5">
          <title>{formatTick(p.label, bucket)} : {p.v} vues</title>
        </circle>
      ))}
      {/* x labels */}
      {xTicks.map((t, i) => (
        <text key={i} x={t.x} y={H - 6} fontSize="10" fill="#8a8f9c" textAnchor="middle">
          {formatTick(t.label, bucket)}
        </text>
      ))}
    </svg>
  )
}

function formatTick(label: string, bucket: "hour" | "day") {
  if (bucket === "hour") {
    // "2026-04-15T14" → "14h"
    return `${label.slice(11, 13)}h`
  }
  // "2026-04-15" → "15/04"
  return `${label.slice(8, 10)}/${label.slice(5, 7)}`
}

/* ═══════════════════════════════════════════════════════════════════════════
 *   Funnel
 * ══════════════════════════════════════════════════════════════════════════ */

function Funnel({ funnel }: { funnel?: StatsPayload["funnel"] }) {
  if (!funnel) return <EmptyBlock>—</EmptyBlock>

  const steps: { label: string; value: number; color: string }[] = [
    { label: "Vues",         value: funnel.views,         color: "#E11D48" },
    { label: "Clics contact", value: funnel.contactClicks, color: "#C026D3" },
    { label: "Demandes",     value: funnel.requests,      color: "#9333EA" },
    { label: "Gagnées",      value: funnel.won,           color: "#16A34A" },
  ]
  const max = Math.max(1, ...steps.map(s => s.value))

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {steps.map((s, i) => {
        const prev = i === 0 ? s.value : steps[i - 1].value
        const pct = prev > 0 ? (s.value / prev) * 100 : 0
        return (
          <div key={s.label}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: "#45474D" }}>{s.label}</span>
              <span style={{ fontSize: 12, fontVariantNumeric: "tabular-nums", color: "#121317", fontWeight: 600 }}>
                {s.value.toLocaleString("fr-FR")}
                {i > 0 && <span style={{ color: "#8a8f9c", fontWeight: 400, marginLeft: 6 }}>
                  ({pct.toFixed(1)}%)
                </span>}
              </span>
            </div>
            <div style={{ height: 10, background: "#f0f1f6", borderRadius: 5, overflow: "hidden" }}>
              <div
                style={{
                  width: `${(s.value / max) * 100}%`,
                  height: "100%",
                  background: s.color,
                  transition: "width 280ms ease",
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
 *   Donut
 * ══════════════════════════════════════════════════════════════════════════ */

function Donut({ donut }: { donut?: StatsPayload["donut"] }) {
  if (!donut) return <EmptyBlock>—</EmptyBlock>

  const items = [
    { key: "new",     label: "Nouvelles", value: donut.new,     color: "#E11D48" },
    { key: "read",    label: "Lues",      value: donut.read,    color: "#F59E0B" },
    { key: "replied", label: "Répondues", value: donut.replied, color: "#3B82F6" },
    { key: "won",     label: "Gagnées",   value: donut.won,     color: "#16A34A" },
    { key: "lost",    label: "Perdues",   value: donut.lost,    color: "#94a3b8" },
  ].filter(i => i.value > 0)

  const total = items.reduce((acc, i) => acc + i.value, 0)
  if (total === 0) return <EmptyBlock>Aucune demande encore</EmptyBlock>

  const size = 160, stroke = 24, R = (size - stroke) / 2, C = 2 * Math.PI * R
  let acc = 0

  return (
    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size, flexShrink: 0 }}>
        <circle cx={size / 2} cy={size / 2} r={R} stroke="#f0f1f6" strokeWidth={stroke} fill="none" />
        {items.map(it => {
          const frac = it.value / total
          const dash = frac * C
          const offset = -acc
          acc += dash
          return (
            <circle
              key={it.key}
              cx={size / 2} cy={size / 2} r={R}
              stroke={it.color} strokeWidth={stroke} fill="none"
              strokeDasharray={`${dash} ${C - dash}`}
              strokeDashoffset={offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              strokeLinecap="butt"
            />
          )
        })}
        <text x={size / 2} y={size / 2 - 4} textAnchor="middle" fontSize="22" fontWeight="700" fill="#121317">
          {total}
        </text>
        <text x={size / 2} y={size / 2 + 14} textAnchor="middle" fontSize="10" fill="#8a8f9c">
          demandes
        </text>
      </svg>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map(it => (
          <li key={it.key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: it.color, flexShrink: 0 }} />
            <span style={{ color: "#45474D", flex: 1 }}>{it.label}</span>
            <span style={{ color: "#121317", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{it.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
 *   ScoreCard
 * ══════════════════════════════════════════════════════════════════════════ */

function ScoreCard({ completion }: { completion: CompletionPayload | null }) {
  if (!completion) return <EmptyBlock>Chargement…</EmptyBlock>
  const pct = completion.percent
  const color = pct >= 80 ? "#16a34a" : pct >= 50 ? "#F59E0B" : "#E11D48"

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: "#121317", fontVariantNumeric: "tabular-nums" }}>{pct}%</span>
          <span style={{ fontSize: 12, color: "#6a6a71" }}>{completion.itemsDone} / {completion.itemsTotal} complétés</span>
        </div>
        <div style={{ height: 8, background: "#f0f1f6", borderRadius: 4, overflow: "hidden", marginTop: 8 }}>
          <div style={{ width: `${pct}%`, height: "100%", background: color, transition: "width 280ms ease" }} />
        </div>
      </div>
      {completion.nextSteps.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#8a8f9c", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            À faire maintenant
          </div>
          {completion.nextSteps.map(s => (
            <Link
              key={s.id}
              href={s.cta.href}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 10px", borderRadius: 8,
                background: "#fafbfe", border: "1px solid rgba(183,191,217,0.22)",
                textDecoration: "none", fontSize: 12, color: "#121317",
              }}
            >
              <span style={{ flex: 1 }}>{s.label}</span>
              <span style={{ fontSize: 10, color: "#8a8f9c" }}>+{s.weight} pts</span>
              <span style={{ color: "#8a8f9c" }}>→</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
 *   Preview card
 * ══════════════════════════════════════════════════════════════════════════ */

function PreviewCard({ publicSlug }: { publicSlug: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{
        width: 56, height: 56, borderRadius: 12,
        background: "linear-gradient(135deg,#fde4eb,#e9d5ff)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 24, flexShrink: 0,
      }}>
        🎉
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: "#45474D" }}>
          Votre fiche est visible publiquement à tous les organisateurs qui recherchent un prestataire.
        </div>
        <div style={{ fontSize: 12, color: "#8a8f9c", marginTop: 4 }}>
          Chaque modification est reflétée en temps réel sur la page publique.
        </div>
      </div>
      <Link
        href={`/vendor/${publicSlug}`}
        target="_blank"
        rel="noreferrer"
        style={{
          padding: "10px 16px", borderRadius: 10,
          background: "linear-gradient(135deg,#E11D48,#9333EA)",
          color: "#fff", fontSize: 12, fontWeight: 600,
          textDecoration: "none", whiteSpace: "nowrap",
        }}
      >
        Voir ma fiche ↗
      </Link>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
 *   Shared small bits
 * ══════════════════════════════════════════════════════════════════════════ */

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section style={cardStyle(20)}>
      <header style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: "#121317", margin: 0 }}>{title}</h3>
        {subtitle && <span style={{ fontSize: 11, color: "#8a8f9c" }}>{subtitle}</span>}
      </header>
      {children}
    </section>
  )
}

function Banner({ variant, children }: { variant: "error" | "info"; children: React.ReactNode }) {
  const map = {
    error: { bg: "rgba(239,68,68,0.08)", color: "#b91c1c", border: "rgba(239,68,68,0.2)" },
    info:  { bg: "rgba(59,130,246,0.08)", color: "#1d4ed8", border: "rgba(59,130,246,0.2)" },
  }
  const c = map[variant]
  return (
    <div style={{
      padding: "10px 14px", borderRadius: 10,
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      fontSize: 12,
    }}>
      {children}
    </div>
  )
}

function EmptyBlock({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      padding: "32px 12px", textAlign: "center",
      color: "#8a8f9c", fontSize: 12,
    }}>
      {children}
    </div>
  )
}

function cardStyle(padding: number): React.CSSProperties {
  return {
    background: "#fff", padding,
    borderRadius: 14,
    border: "1px solid rgba(183,191,217,0.22)",
  }
}

function toInputDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function windowLabel(stats: StatsPayload | null): string {
  if (!stats) return ""
  const { period } = stats
  if (period === "today") return "Aujourd'hui"
  if (period === "7d")    return "7 derniers jours"
  if (period === "30d")   return "30 derniers jours"
  const start = stats.window.start.slice(0, 10)
  const end   = stats.window.end.slice(0, 10)
  return `${start} → ${end}`
}

function prevPeriodLabel(period: Period): string {
  if (period === "today") return "hier"
  if (period === "7d")    return "7 j précédents"
  if (period === "30d")   return "30 j précédents"
  return "période précédente"
}
