/**
 * GET /api/vendor/stats
 * Retourne les KPIs 30j + delta vs période précédente, sparkline 30 points,
 * funnel (views → contactClicks → requests → won) et donut inbox par statut.
 *
 * Auth : role="vendor" + vendorSlug (IDOR : chaque vendor voit UNIQUEMENT ses stats).
 */
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Types d'events considérés comme "clic contact"
const CONTACT_CLICK_TYPES = ["contact_click", "phone_click", "whatsapp_click"] as const

type DeltaKpi = { current: number; previous: number; deltaPct: number | null }

function kpi(current: number, previous: number): DeltaKpi {
  const deltaPct = previous === 0
    ? (current === 0 ? 0 : null) // N/A si on n'a aucune base de comparaison
    : Math.round(((current - previous) / previous) * 1000) / 10 // 1 décimale
  return { current, previous, deltaPct }
}

export async function GET() {
  // ── Auth ─────────────────────────────────────────────────────────────────
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 })
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, vendorSlug: true },
  })
  if (!user || user.role !== "vendor" || !user.vendorSlug) {
    return NextResponse.json({ error: "Accès réservé aux prestataires." }, { status: 403 })
  }
  const slug = user.vendorSlug

  // ── Fenêtres temporelles ─────────────────────────────────────────────────
  const now = new Date()
  const start30  = new Date(now.getTime() - 30 * 86400_000)
  const start60  = new Date(now.getTime() - 60 * 86400_000)

  // ── Fetch parallèle ──────────────────────────────────────────────────────
  const [events60d, requests60d, donutGroups] = await Promise.all([
    // 60j d'events (suffit pour KPIs, sparkline, funnel)
    prisma.vendorEvent.findMany({
      where: { vendorSlug: slug, createdAt: { gte: start60 } },
      select: { type: true, createdAt: true },
    }),
    // 60j de demandes (KPIs + funnel)
    prisma.contactRequest.findMany({
      where: { vendorSlug: slug, createdAt: { gte: start60 } },
      select: { status: true, createdAt: true },
    }),
    // Donut inbox (tous statuts, toutes périodes)
    prisma.contactRequest.groupBy({
      by: ["status"],
      where: { vendorSlug: slug },
      _count: { _all: true },
    }),
  ])

  // ── Split current (30j) vs previous (30-60j) ─────────────────────────────
  const eventsCurr = events60d.filter(e => e.createdAt >= start30)
  const eventsPrev = events60d.filter(e => e.createdAt <  start30)
  const reqsCurr   = requests60d.filter(r => r.createdAt >= start30)
  const reqsPrev   = requests60d.filter(r => r.createdAt <  start30)

  const countViews   = (arr: typeof events60d) => arr.filter(e => e.type === "view").length
  const countClicks  = (arr: typeof events60d) => arr.filter(e => (CONTACT_CLICK_TYPES as readonly string[]).includes(e.type)).length

  const viewsCurr  = countViews(eventsCurr)
  const viewsPrev  = countViews(eventsPrev)
  const clicksCurr = countClicks(eventsCurr)
  const clicksPrev = countClicks(eventsPrev)
  const reqsCountCurr = reqsCurr.length
  const reqsCountPrev = reqsPrev.length

  // Conversion = requests / views * 100 (pct)
  const cvrCurr = viewsCurr > 0 ? Math.round((reqsCountCurr / viewsCurr) * 1000) / 10 : 0
  const cvrPrev = viewsPrev > 0 ? Math.round((reqsCountPrev / viewsPrev) * 1000) / 10 : 0

  // ── Sparkline : 30 points (un par jour) ──────────────────────────────────
  // Bucket par jour UTC (YYYY-MM-DD). On sème 30 jours à 0 pour garantir la continuité.
  const sparkBuckets = new Map<string, number>()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400_000)
    sparkBuckets.set(d.toISOString().slice(0, 10), 0)
  }
  for (const e of eventsCurr) {
    if (e.type !== "view") continue
    const key = e.createdAt.toISOString().slice(0, 10)
    if (sparkBuckets.has(key)) sparkBuckets.set(key, (sparkBuckets.get(key) ?? 0) + 1)
  }
  const sparkline = Array.from(sparkBuckets.entries()).map(([date, views]) => ({ date, views }))

  // ── Funnel (30j) ─────────────────────────────────────────────────────────
  const wonCurr = reqsCurr.filter(r => r.status === "confirmed").length
  const funnel = {
    views: viewsCurr,
    contactClicks: clicksCurr,
    requests: reqsCountCurr,
    won: wonCurr,
  }

  // ── Donut inbox (tous statuts, all-time) ─────────────────────────────────
  const donut = {
    pending:   donutGroups.find(g => g.status === "pending")?._count._all   ?? 0,
    confirmed: donutGroups.find(g => g.status === "confirmed")?._count._all ?? 0,
    declined:  donutGroups.find(g => g.status === "declined")?._count._all  ?? 0,
  }

  return NextResponse.json({
    kpis: {
      views:           kpi(viewsCurr,  viewsPrev),
      contactClicks:   kpi(clicksCurr, clicksPrev),
      requests:        kpi(reqsCountCurr, reqsCountPrev),
      conversionRate:  kpi(cvrCurr, cvrPrev), // ici "current"/"previous" sont des pourcentages
    },
    sparkline,
    funnel,
    donut,
    periodDays: 30,
    generatedAt: now.toISOString(),
  })
}
