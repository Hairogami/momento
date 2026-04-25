import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/admin/vendors — listing paginé + recherche + filtre catégorie.
 * Query: ?q (string max 200), ?cat (string max 100), ?page (1+), ?limit (max 100)
 */
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const me = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } })
  if (me?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { searchParams } = req.nextUrl
  const q     = (searchParams.get("q")   ?? "").trim().slice(0, 200)
  const cat   = (searchParams.get("cat") ?? "").trim().slice(0, 100)
  const page  = Math.min(1000, Math.max(1, parseInt(searchParams.get("page")  ?? "1",  10) || 1))
  const limit = Math.min(100,  Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10) || 50))

  const where = {
    AND: [
      q
        ? {
            OR: [
              { name:     { contains: q, mode: "insensitive" as const } },
              { slug:     { contains: q, mode: "insensitive" as const } },
              { category: { contains: q, mode: "insensitive" as const } },
              { city:     { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {},
      cat ? { category: cat } : {},
    ],
  }

  const [vendors, total, categories] = await Promise.all([
    prisma.vendor.findMany({
      where,
      orderBy: { name: "asc" },
      skip:    (page - 1) * limit,
      take:    limit,
      select: {
        id:        true,
        slug:      true,
        name:      true,
        category:  true,
        city:      true,
        rating:    true,
        verified:  true,
        featured:  true,
        phone:     true,
        email:     true,
        instagram: true,
        priceMin:  true,
        priceMax:  true,
        _count:    { select: { media: true, reviews: true } },
      },
    }),
    prisma.vendor.count({ where }),
    prisma.vendor.findMany({
      distinct: ["category"],
      select: { category: true },
      orderBy: { category: "asc" },
    }),
  ])

  return NextResponse.json({
    vendors,
    total,
    page,
    limit,
    categories: categories.map(c => c.category).filter(Boolean),
  })
}
