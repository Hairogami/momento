import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/planners/[id]/recommendations
 * Returns top-1 recommended vendor per category of the planner,
 * filtered by city + budget range (±20% of budgetBreakdown[category]).
 * Ranking: featured × 3 + rating × 2 + reviewCount × 0.5
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const planner = await prisma.planner.findFirst({
    where: { id, userId: session.user.id },
    select: {
      id: true, categories: true, location: true,
      budget: true, budgetBreakdown: true,
    },
  })
  if (!planner) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const cats = planner.categories ?? []
  if (cats.length === 0) return NextResponse.json([])

  const breakdown = (planner.budgetBreakdown && typeof planner.budgetBreakdown === "object" && !Array.isArray(planner.budgetBreakdown))
    ? (planner.budgetBreakdown as Record<string, number>)
    : {}

  const city = (planner.location ?? "").trim()

  const SELECT = {
    id: true, slug: true, name: true, category: true, city: true,
    rating: true, reviewCount: true, featured: true, priceMin: true, priceMax: true,
  } as const

  // For each category → top 1 matching vendor
  const recommendations = await Promise.all(cats.map(async (category) => {
    const where: Record<string, unknown> = { category }
    if (city) where.city = { contains: city, mode: "insensitive" }

    let vendors = await prisma.vendor.findMany({ where, select: SELECT, take: 30 })
    if (vendors.length === 0) {
      vendors = await prisma.vendor.findMany({ where: { category }, select: SELECT, take: 30 })
    }
    if (vendors.length === 0) return { category, vendor: null }

    const budgetForCat = breakdown[category]
    const withinBudget = (v: (typeof vendors)[number]) => {
      if (!budgetForCat) return true
      const min = v.priceMin ?? null
      const max = v.priceMax ?? v.priceMin ?? null
      if (min === null && max === null) return true
      const lo = budgetForCat * 0.6
      const hi = budgetForCat * 1.4
      return (max ?? Infinity) >= lo && (min ?? 0) <= hi
    }

    const ranked = vendors.map(v => {
      const score =
        (v.featured ? 3 : 0)
        + (v.rating ?? 0) * 2
        + Math.log10((v.reviewCount ?? 0) + 1) * 0.5
        + (withinBudget(v) ? 1 : 0)
      return { ...v, _score: score }
    }).sort((a, b) => b._score - a._score)

    return { category, vendor: ranked[0] ?? null }
  }))

  return NextResponse.json(recommendations)
}
