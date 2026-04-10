import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category")
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
  const limit = Math.min(1000, parseInt(searchParams.get("limit") ?? "50", 10))
  const vendors = await prisma.vendor.findMany({
    where: category ? { category } : {},
    orderBy: { name: "asc" },
    skip: (page - 1) * limit,
    take: limit,
  })
  return Response.json(vendors)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Non authentifié." }, { status: 401 })
  }
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } })
  if (dbUser?.role !== "admin") {
    return Response.json({ error: "Non autorisé." }, { status: 403 })
  }
  const body = await req.json()
  if (!body.name || !body.category) {
    return Response.json({ error: "name et category sont requis." }, { status: 400 })
  }
  const vendor = await prisma.vendor.create({
    data: {
      slug: (body.slug ?? body.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-")).slice(0, 100),
      name: String(body.name).slice(0, 200),
      category: String(body.category).slice(0, 100),
      description: body.description ? String(body.description).slice(0, 2000) : undefined,
      phone: body.phone ? String(body.phone).slice(0, 30) : undefined,
      email: body.email ? String(body.email).slice(0, 200) : undefined,
      website: body.website ? String(body.website).slice(0, 500) : undefined,
      address: body.address ? String(body.address).slice(0, 500) : undefined,
      lat: typeof body.lat === "number" ? body.lat : undefined,
      lng: typeof body.lng === "number" ? body.lng : undefined,
      priceRange: body.priceRange ? String(body.priceRange) : undefined,
      rating: typeof body.rating === "number" ? Math.min(5, Math.max(0, body.rating)) : undefined,
    },
  })
  return Response.json(vendor, { status: 201 })
}
