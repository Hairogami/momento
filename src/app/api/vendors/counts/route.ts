import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

// Public endpoint — returns vendor counts grouped by category
// Used by /explore page to show accurate DB counts in the nav
export async function GET(_req: NextRequest) {
  try {
    const groups = await prisma.vendor.groupBy({
      by: ["category"],
      _count: { category: true },
    })

    const countByCategory: Record<string, number> = {}
    let total = 0
    for (const g of groups) {
      countByCategory[g.category] = g._count.category
      total += g._count.category
    }

    return Response.json({ total, byCategory: countByCategory })
  } catch {
    // Fallback: return empty so client can use static data
    return Response.json({ total: 0, byCategory: {} })
  }
}
