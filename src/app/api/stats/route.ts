import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { IS_DEV } from "@/lib/devMock"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Non authentifié." }, { status: 401 })
  }

  if (IS_DEV) {
    const [planners, stepVendors] = await Promise.all([
      prisma.planner.findMany({
        where: { userId: session.user.id },
        select: { createdAt: true, weddingDate: true, steps: { select: { status: true } } },
      }).catch((e: unknown) => { console.error("[stats] DB error:", e); return [] }),
      prisma.stepVendor.findMany({
        where: { step: { planner: { userId: session.user.id } } },
        select: { vendor: { select: { category: true } } },
      }).catch(() => []),
    ])

    if (planners.length > 0) {
      return buildStats(planners, stepVendors)
    }

    return Response.json({
      eventsByMonth: MOCK_EVENTS_BY_MONTH,
      partnersByCategory: MOCK_PARTNERS,
      totals: { created: 44, realized: 31, partners: 60 },
    })
  }

  // PERF: separate focused queries instead of 3-level nested include
  const [planners, stepVendors] = await Promise.all([
    prisma.planner.findMany({
      where: { userId: session.user.id },
      take: 100,
      select: { createdAt: true, weddingDate: true, steps: { select: { status: true } } },
    }),
    prisma.stepVendor.findMany({
      where: { step: { planner: { userId: session.user.id } } },
      select: { vendor: { select: { category: true } } },
      take: 5000, // WR-003: cap to prevent unbounded memory usage
    }),
  ])

  return buildStats(planners, stepVendors)
}

type PlannerSlim = { createdAt: Date; weddingDate: Date | null; steps: { status: string }[] }
type VendorSlim  = { vendor: { category: string } }

function buildStats(planners: PlannerSlim[], stepVendors: VendorSlim[]) {
  const now = new Date()

  // ── Événements par mois (12 derniers mois) ──────────────────────────────
  const monthsMap: Record<string, { created: number; realized: number }> = {}
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    monthsMap[key] = { created: 0, realized: 0 }
  }

  for (const p of planners) {
    const created = new Date(p.createdAt)
    const key = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, "0")}`
    if (monthsMap[key]) {
      monthsMap[key].created++
      const isRealized = p.weddingDate && new Date(p.weddingDate) < now
      const allDone = p.steps.length > 0 && p.steps.every(s => s.status === "done")
      if (isRealized || allDone) monthsMap[key].realized++
    }
  }

  const eventsByMonth = Object.entries(monthsMap).map(([key, v]) => {
    const [year, month] = key.split("-")
    const label = new Date(Number(year), Number(month) - 1).toLocaleDateString("fr-FR", { month: "short" })
    return { mois: label, total: v.created, realises: v.realized }
  })

  // ── Partenaires par catégorie ────────────────────────────────────────────
  const catMap: Record<string, number> = {}
  for (const sv of stepVendors) {
    const cat = sv.vendor.category || "Autre"
    catMap[cat] = (catMap[cat] ?? 0) + 1
  }

  const COLORS = ["#e07b5a","#7b5ea7","#5a8ae0","#3a7d5c","#c4922a","#8c6a5a","#e05a7b","#5ab8e0"]
  const partnersByCategory = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, count], i) => ({ label, count, color: COLORS[i % COLORS.length] }))

  const totalRealized = planners.filter(p =>
    (p.weddingDate && new Date(p.weddingDate) < now) ||
    (p.steps.length > 0 && p.steps.every(s => s.status === "done"))
  ).length

  return Response.json({
    eventsByMonth,
    partnersByCategory,
    totals: {
      created: planners.length,
      realized: totalRealized,
      partners: Object.values(catMap).reduce((s, v) => s + v, 0),
    },
  })
}

// ── Fallback mock ────────────────────────────────────────────────────────────

const MOCK_EVENTS_BY_MONTH = [
  { mois: "Sep", total: 2, realises: 2 },
  { mois: "Oct", total: 3, realises: 2 },
  { mois: "Nov", total: 5, realises: 3 },
  { mois: "Déc", total: 4, realises: 2 },
  { mois: "Jan", total: 6, realises: 4 },
  { mois: "Fév", total: 8, realises: 5 },
  { mois: "Mar", total: 7, realises: 6 },
  { mois: "Avr", total: 9, realises: 7 },
  { mois: "Mai", total: 5, realises: 3 },
  { mois: "Jun", total: 6, realises: 4 },
  { mois: "Jul", total: 4, realises: 2 },
  { mois: "Aoû", total: 3, realises: 1 },
]

const MOCK_PARTNERS = [
  { label: "Photographe",  count: 14, color: "#e07b5a" },
  { label: "Traiteur",     count: 12, color: "#7b5ea7" },
  { label: "DJ / Musique", count: 10, color: "#5a8ae0" },
  { label: "Décorateur",   count:  8, color: "#3a7d5c" },
  { label: "Lieu",         count:  7, color: "#c4922a" },
  { label: "Autres",       count:  9, color: "#8c6a5a" },
]
