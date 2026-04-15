import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextRequest } from "next/server"
import { rateLimitAsync, getIp } from "@/lib/rateLimiter"

export async function GET(req: NextRequest) {
  const ip = getIp(req)
  if (!ip) {
    return Response.json({ error: "Requête non identifiable." }, { status: 400 })
  }
  const rl = await rateLimitAsync(`vendors-list:${ip}`, 60, 60_000)
  if (!rl.ok) {
    return Response.json(
      { error: "Trop de requêtes. Réessayez dans une minute." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    )
  }

  const { searchParams } = req.nextUrl
  const rawCategory = searchParams.get("category")
  const category = rawCategory ? rawCategory.slice(0, 100) : null
  const page = Math.min(1000, Math.max(1, parseInt(searchParams.get("page") ?? "1", 10)))
  // WR-09: Cap at 50 per request on public endpoint to prevent bulk scraping
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10) || 20))
  // W03: public endpoint — exclude sensitive contact/location fields
  const vendors = await prisma.vendor.findMany({
    where: category ? { category } : {},
    orderBy: [{ media: { _count: "desc" } }, { name: "asc" }],
    skip: (page - 1) * limit,
    take: limit,
    select: {
      id: true,
      slug: true,
      name: true,
      category: true,
      description: true,
      address: true,
      city: true,
      priceMin: true,
      priceMax: true,
      priceRange: true,
      rating: true,
      reviewCount: true,
      website: true,
      instagram: true,
      facebook: true,
      phone: true,
      email: true,
      region: true,
      verified: true,
      media: { select: { url: true, order: true }, orderBy: { order: "asc" }, take: 5 },
    },
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
  // WR-04: Sanitize slug — strip accents, non-alphanumeric chars, normalize
  const rawSlug = typeof body.slug === "string" ? body.slug : String(body.name)
  const slug = rawSlug
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100)
  let vendor
  try {
    vendor = await prisma.vendor.create({
      data: {
        slug,
        name: String(body.name).slice(0, 200),
        category: String(body.category).slice(0, 100),
        description: body.description ? String(body.description).slice(0, 2000) : undefined,
        phone: body.phone ? String(body.phone).slice(0, 30) : undefined,
        email: body.email ? String(body.email).slice(0, 200) : undefined,
        website: body.website ? String(body.website).slice(0, 500) : undefined,
        address: body.address ? String(body.address).slice(0, 500) : undefined,
        // W01: validate coordinate ranges and email/website format
        lat: typeof body.lat === "number" && isFinite(body.lat) && body.lat >= -90  && body.lat <= 90  ? body.lat : undefined,
        lng: typeof body.lng === "number" && isFinite(body.lng) && body.lng >= -180 && body.lng <= 180 ? body.lng : undefined,
        priceRange: body.priceRange ? String(body.priceRange) : undefined,
        rating: typeof body.rating === "number" ? Math.min(5, Math.max(0, body.rating)) : undefined,
      },
    })
  } catch (createErr: unknown) {
    // W-N03: handle duplicate slug — can occur if two admins create the same vendor concurrently
    if ((createErr as { code?: string })?.code === "P2002") {
      return Response.json({ error: "Un prestataire avec ce slug existe déjà." }, { status: 409 })
    }
    throw createErr
  }
  return Response.json(vendor, { status: 201 })
}
