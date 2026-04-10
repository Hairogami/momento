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

  const review = await prisma.review.create({
    data: {
      vendorId:  vendor.id,
      authorId:  session.user.id,
      rating,
      comment:   comment ?? null,
      eventType: eventType ?? null,
    },
    select: { id: true, rating: true, comment: true, eventType: true, createdAt: true },
  })

  // Mise à jour dénormalisée rating + reviewCount sur Vendor
  const agg = await prisma.review.aggregate({
    where: { vendorId: vendor.id },
    _avg: { rating: true },
    _count: true,
  })
  await prisma.vendor.update({
    where: { id: vendor.id },
    data: {
      rating:      agg._avg.rating ?? null,
      reviewCount: agg._count,
    },
  })

  return NextResponse.json(review, { status: 201 })
}
