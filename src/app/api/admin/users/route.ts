import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isAdminUser } from "@/lib/adminAuth"

/**
 * GET /api/admin/users — Liste paginée + recherche.
 * Query: ?q=email|name (string max 200), ?page=1, ?limit=50 (max 100)
 * Renvoie: { users[], total, page, limit }
 */
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!(await isAdminUser(session.user.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = req.nextUrl
  const q     = (searchParams.get("q") ?? "").trim().slice(0, 200)
  const page  = Math.min(1000, Math.max(1, parseInt(searchParams.get("page")  ?? "1",  10) || 1))
  const limit = Math.min(100,  Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10) || 50))

  const where = q
    ? {
        OR: [
          { email:       { contains: q.toLowerCase(), mode: "insensitive" as const } },
          { name:        { contains: q,               mode: "insensitive" as const } },
          { firstName:   { contains: q,               mode: "insensitive" as const } },
          { lastName:    { contains: q,               mode: "insensitive" as const } },
          { companyName: { contains: q,               mode: "insensitive" as const } },
        ],
      }
    : {}

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id:             true,
        email:          true,
        name:           true,
        firstName:      true,
        lastName:       true,
        companyName:    true,
        role:           true,
        plan:           true,
        planExpiresAt:  true,
        emailVerified:  true,
        agreedTosAt:    true,
        marketingOptIn: true,
        createdAt:      true,
        updatedAt:      true,
        vendorSlug:     true,
        _count:         { select: { planners: true, sentMessages: true } },
      },
      orderBy: { createdAt: "desc" },
      skip:    (page - 1) * limit,
      take:    limit,
    }),
    prisma.user.count({ where }),
  ])

  return NextResponse.json({ users, total, page, limit })
}
