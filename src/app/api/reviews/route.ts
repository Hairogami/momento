import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { rateLimitAsync, getIp } from "@/lib/rateLimiter"

const ReviewSchema = z.object({
  vendorSlug: z.string().min(1).max(100),
  rating:     z.number().int().min(1).max(5),
  comment:    z.string().max(2000).optional(),
  eventType:  z.string().max(50).optional(),
})

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug")
  if (!slug) return NextResponse.json({ error: "slug requis." }, { status: 400 })

  const vendor = await prisma.vendor.findUnique({
    where: { slug },
    select: { id: true },
  })
  if (!vendor) return NextResponse.json({ reviews: [], avg: null, count: 0 })

  const reviews = await prisma.review.findMany({
    where: { vendorId: vendor.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      rating: true,
      comment: true,
      eventType: true,
      createdAt: true,
      author: { select: { name: true, image: true } },
    },
  })

  const avg = reviews.length > 0
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : null

  return NextResponse.json({ reviews, avg, count: reviews.length })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Connexion requise pour laisser un avis." }, { status: 401 })
  }

  const ip = getIp(req)
  const rl = await rateLimitAsync(`review:${session.user.id}:${ip}`, 3, 3_600_000)
  if (!rl.ok) {
    return NextResponse.json({ error: "Trop d'avis soumis. Réessayez dans 1h." }, { status: 429 })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
  }

  const parsed = ReviewSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Données invalides." }, { status: 400 })
  }

  const { vendorSlug, rating, comment, eventType } = parsed.data

  const vendor = await prisma.vendor.findUnique({ where: { slug: vendorSlug }, select: { id: true } })
  if (!vendor) return NextResponse.json({ error: "Prestataire introuvable." }, { status: 404 })

  // @@unique([authorId, vendorId]) — un seul avis par user/vendor
  const existing = await prisma.review.findUnique({
    where: { authorId_vendorId: { authorId: session.user.id, vendorId: vendor.id } },
  })
  if (existing) {
    return NextResponse.json({ error: "Vous avez déjà laissé un avis pour ce prestataire." }, { status: 409 })
  }

  let review: { id: string; rating: number; comment: string | null; eventType: string | null; createdAt: Date }
  try {
    review = await prisma.review.create({
      data: {
        vendorId:  vendor.id,
        authorId:  session.user.id,
        rating,
        comment:   comment ?? null,
        eventType: eventType ?? null,
      },
      select: { id: true, rating: true, comment: true, eventType: true, createdAt: true },
    })
  } catch (createErr: unknown) {
    // W02: race condition — two concurrent requests both passed the findUnique check
    if ((createErr as { code?: string })?.code === "P2002") {
      return NextResponse.json({ error: "Vous avez déjà laissé un avis pour ce prestataire." }, { status: 409 })
    }
    throw createErr
  }

  // WR-001: atomic update — aggregate + update in single SQL to avoid race condition
  await prisma.$executeRaw`
    UPDATE "Vendor"
    SET rating = (SELECT AVG(rating)::numeric(3,2) FROM "Review" WHERE "vendorId" = ${vendor.id}),
        "reviewCount" = (SELECT COUNT(*)::int FROM "Review" WHERE "vendorId" = ${vendor.id})
    WHERE id = ${vendor.id}
  `

  return NextResponse.json(review, { status: 201 })
}
