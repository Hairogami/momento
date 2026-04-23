import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getRankingWeights, scoreVendor } from "@/lib/rankingScore"

/**
 * GET /api/planners/[id]/recommendations
 * Retourne le top-1 vendor recommandé par catégorie du planner,
 * filtré par ville + fenêtre budget (breakdown[cat] × 0.6 → × 1.4).
 *
 * Ranking : utilise le scoring partagé `scoreVendor` (mêmes poids que
 * /explore et VendorSwipe — admin-configurable via /admin/ranking) +
 * un bonus `withinBudget` pour privilégier les prestas dans l'enveloppe.
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
    _count: { select: { media: true } },
  } as const

  const weights = await getRankingWeights()
  // Bonus budget proportionnel au poids featured (~10%) pour privilégier
  // les prestas dans l'enveloppe sans écraser le ranking éditorial global.
  const budgetBonus = weights.featured * 0.1

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

    const ranked = vendors
      .map(v => {
        const base = scoreVendor(
          { featured: v.featured, rating: v.rating, reviewCount: v.reviewCount, mediaCount: v._count.media },
          weights,
        )
        const score = base + (withinBudget(v) ? budgetBonus : 0)
        return { v, score }
      })
      .sort((a, b) => b.score - a.score)

    const top = ranked[0]?.v
    if (!top) return { category, vendor: null }

    // Strip _count pour garder la forme existante côté client
    const vendorOut = {
      id: top.id, slug: top.slug, name: top.name, category: top.category, city: top.city,
      rating: top.rating, reviewCount: top.reviewCount, featured: top.featured,
      priceMin: top.priceMin, priceMax: top.priceMax,
    }
    return { category, vendor: vendorOut }
  }))

  return NextResponse.json(recommendations)
}
