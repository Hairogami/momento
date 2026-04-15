/**
 * GET /api/vendor/stats
 * Query params :
 *   - period: "today" | "7d" | "30d" | "custom"   (défaut: "30d")
 *   - from:   YYYY-MM-DD  (requis si period=custom)
 *   - to:     YYYY-MM-DD  (requis si period=custom, inclusif fin-de-journée)
 *
 * Réponse :
 *   - kpis  : { views, contactClicks, requests, conversionRate } avec delta vs période précédente de même durée
 *   - series: points temporels (heures si today, sinon jours) → sparkline vues
 *   - funnel: views → contactClicks → requests → won (sur la période courante)
 *   - donut : inbox all-time par statut (period-independent)
 *
 * Auth : role="vendor" + vendorSlug (IDOR-safe).
 */
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const CONTACT_CLICK_TYPES = ["contact_click", "phone_click", "whatsapp_click"] as const
const PERIODS = ["today", "7d", "30d", "custom"] as const
type Period = typeof PERIODS[number]

const MAX_CUSTOM_DAYS = 90 // protège la requête (et la UI sparkline)

type DeltaKpi = { current: number; previous: number; deltaPct: number | null }
function kpi(current: number, previous: number): DeltaKpi {
  const deltaPct = previous === 0
    ? (current === 0 ? 0 : null)
    : Math.round(((current - previous) / previous) * 1000) / 10
  return { current, previous, deltaPct }
}

type Window = { start: Date; end: Date; bucket: "hour" | "day"; bucketCount: number }

function resolveWindow(period: Period, fromRaw: string | null, toRaw: string | null, now: Date): Window | { error: string } {
  if (period === "today") {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0))
    return { start, end: now, bucket: "hour", bucketCount: 24 }
  }
  if (period === "7d") {
    return { start: new Date(now.getTime() - 7 * 86400_000), end: now, bucket: "day", bucketCount: 7 }
  }
  if (period === "30d") {
    return { start: new Date(now.getTime() - 30 * 86400_000), end: now, bucket: "day", bucketCount: 30 }
  }
  // custom
  if (!fromRaw || !toRaw) return { error: "Paramètres 'from' et 'to' requis pour period=custom." }
  const from = new Date(`${fromRaw}T00:00:00.000Z`)
  const to   = new Date(`${toRaw}T23:59:59.999Z`)
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return { error: "Dates invalides (format YYYY-MM-DD attendu)." }
  }
  if (from > to) return { error: "'from' doit être antérieur à 'to'." }
  const days = Math.ceil((to.getTime() - from.getTime()) / 86400_000)
  if (days > MAX_CUSTOM_DAYS) return { error: `Plage max : ${MAX_CUSTOM_DAYS} jours.` }
  return { start: from, end: to, bucket: "day", bucketCount: Math.max(1, days) }
}

function hourKey(d: Date): string {
  // "YYYY-MM-DDTHH" UTC
  return d.toISOString().slice(0, 13)
}
function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export async function GET(req: NextRequest) {
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

  // ── Parse period ─────────────────────────────────────────────────────────
  const sp = req.nextUrl.searchParams
  const period = (PERIODS as readonly string[]).includes(sp.get("period") ?? "") ? (sp.get("period") as Period) : "30d"
  const now = new Date()
  const win = resolveWindow(period, sp.get("from"), sp.get("to"), now)
  if ("error" in win) return NextResponse.json({ error: win.error }, { status: 400 })

  // Fenêtre précédente de même durée
  const windowMs = win.end.getTime() - win.start.getTime()
  const prevStart = new Date(win.start.getTime() - windowMs)
  const prevEnd   = win.start

  // ── Fetch (current + previous + donut) ───────────────────────────────────
  const [eventsCurr, eventsPrev, reqsCurr, reqsPrev, donutGroups] = await Promise.all([
    prisma.vendorEvent.findMany({
      where: { vendorSlug: slug, createdAt: { gte: win.start, lte: win.end } },
      select: { type: true, createdAt: true },
    }),
    prisma.vendorEvent.findMany({
      where: { vendorSlug: slug, createdAt: { gte: prevStart, lte: prevEnd } },
      select: { type: true },
    }),
    prisma.contactRequest.findMany({
      where: { vendorSlug: slug, createdAt: { gte: win.start, lte: win.end } },
      select: { status: true },
    }),
    prisma.contactRequest.findMany({
      where: { vendorSlug: slug, createdAt: { gte: prevStart, lte: prevEnd } },
      select: { id: true },
    }),
    prisma.contactRequest.groupBy({
      by: ["status"],
      where: { vendorSlug: slug },
      _count: { _all: true },
    }),
  ])

  // ── KPIs ─────────────────────────────────────────────────────────────────
  const cntViews  = (arr: ReadonlyArray<{ type: string }>) => arr.filter(e => e.type === "view").length
  const cntClicks = (arr: ReadonlyArray<{ type: string }>) => arr.filter(e => (CONTACT_CLICK_TYPES as readonly string[]).includes(e.type)).length

  const viewsCurr  = cntViews(eventsCurr)
  const viewsPrev  = cntViews(eventsPrev)
  const clicksCurr = cntClicks(eventsCurr)
  const clicksPrev = cntClicks(eventsPrev)
  const reqsCountCurr = reqsCurr.length
  const reqsCountPrev = reqsPrev.length
  const cvrCurr = viewsCurr > 0 ? Math.round((reqsCountCurr / viewsCurr) * 1000) / 10 : 0
  const cvrPrev = viewsPrev > 0 ? Math.round((reqsCountPrev / viewsPrev) * 1000) / 10 : 0

  // ── Series (sparkline) ───────────────────────────────────────────────────
  // Bucket continu (0 semés) pour une courbe sans trous.
  const buckets = new Map<string, number>()
  if (win.bucket === "hour") {
    // 24 heures depuis win.start
    for (let i = 0; i < 24; i++) {
      const d = new Date(win.start.getTime() + i * 3600_000)
      if (d > win.end) break
      buckets.set(hourKey(d), 0)
    }
    for (const e of eventsCurr) {
      if (e.type !== "view") continue
      const key = hourKey(e.createdAt)
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1)
    }
  } else {
    // N jours depuis win.start → win.end
    for (let i = 0; i < win.bucketCount; i++) {
      const d = new Date(win.start.getTime() + i * 86400_000)
      if (d > win.end) break
      buckets.set(dayKey(d), 0)
    }
    for (const e of eventsCurr) {
      if (e.type !== "view") continue
      const key = dayKey(e.createdAt)
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1)
    }
  }
  const series = Array.from(buckets.entries()).map(([label, views]) => ({ label, views }))

  // ── Funnel ───────────────────────────────────────────────────────────────
  const wonCurr = reqsCurr.filter(r => r.status === "won" || r.status === "confirmed").length
  const funnel = {
    views: viewsCurr,
    contactClicks: clicksCurr,
    requests: reqsCountCurr,
    won: wonCurr,
  }

  // ── Donut (all-time, tolère statuts legacy) ──────────────────────────────
  const sumStatus = (...keys: string[]) =>
    donutGroups.filter(g => keys.includes(g.status)).reduce((acc, g) => acc + g._count._all, 0)
  const donut = {
    new:     sumStatus("new", "pending"),
    read:    sumStatus("read"),
    replied: sumStatus("replied"),
    won:     sumStatus("won", "confirmed"),
    lost:    sumStatus("lost", "declined"),
  }

  return NextResponse.json({
    period,
    window: {
      start: win.start.toISOString(),
      end:   win.end.toISOString(),
      bucket: win.bucket,
    },
    kpis: {
      views:          kpi(viewsCurr,  viewsPrev),
      contactClicks:  kpi(clicksCurr, clicksPrev),
      requests:       kpi(reqsCountCurr, reqsCountPrev),
      conversionRate: kpi(cvrCurr, cvrPrev),
    },
    series,
    funnel,
    donut,
    generatedAt: now.toISOString(),
  })
}
