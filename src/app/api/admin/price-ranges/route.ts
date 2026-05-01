import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

async function isAdmin(req: Request) {
  const session = await auth()
  if (!session?.user?.email) return false
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim().toLowerCase())
  return adminEmails.includes(session.user.email.toLowerCase())
}

export async function GET(req: Request) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const ranges = await prisma.categoryPriceRange.findMany({
    orderBy: { category: "asc" },
  })
  return NextResponse.json(ranges)
}

export async function PUT(req: Request) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { category, tier1Max, tier2Max, tier3Max } = body

  if (!category || tier1Max == null || tier2Max == null || tier3Max == null) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }
  if (tier1Max >= tier2Max || tier2Max >= tier3Max) {
    return NextResponse.json({ error: "Tiers must be strictly increasing: tier1 < tier2 < tier3" }, { status: 400 })
  }

  const updated = await prisma.categoryPriceRange.upsert({
    where: { category },
    create: { category, tier1Max, tier2Max, tier3Max },
    update: { tier1Max, tier2Max, tier3Max },
  })
  return NextResponse.json(updated)
}
