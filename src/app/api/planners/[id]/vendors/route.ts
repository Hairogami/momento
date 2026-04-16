import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextRequest } from "next/server"

async function assertOwnership(plannerId: string, userId: string) {
  const planner = await prisma.planner.findUnique({
    where: { id: plannerId },
    select: { userId: true },
  })
  if (!planner || planner.userId !== userId) return null
  return planner
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  if (!await assertOwnership(id, session.user.id)) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  const plannerVendors = await prisma.plannerVendor.findMany({
    where: { plannerId: id },
    include: {
      vendor: {
        select: {
          slug: true,
          name: true,
          category: true,
          city: true,
          rating: true,
          reviewCount: true,
          featured: true,
          phone: true,
          instagram: true,
          facebook: true,
          website: true,
          media: { select: { url: true, order: true }, orderBy: { order: "asc" }, take: 3 },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  })

  return Response.json(plannerVendors)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  if (!await assertOwnership(id, session.user.id)) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return Response.json({ error: "Requête invalide." }, { status: 400 })
  }

  const vendorSlug = typeof (body as Record<string, unknown>).vendorSlug === "string"
    ? (body as Record<string, unknown>).vendorSlug as string
    : null

  if (!vendorSlug) return Response.json({ error: "vendorSlug requis." }, { status: 400 })

  // Verify vendor exists
  const vendor = await prisma.vendor.findUnique({ where: { slug: vendorSlug }, select: { slug: true } })
  if (!vendor) return Response.json({ error: "Prestataire introuvable." }, { status: 404 })

  const plannerVendor = await prisma.plannerVendor.upsert({
    where: { plannerId_vendorSlug: { plannerId: id, vendorSlug } },
    create: { plannerId: id, vendorSlug, status: "contacted" },
    update: {}, // ne pas écraser le statut si déjà existant
    include: {
      vendor: {
        select: {
          slug: true, name: true, category: true, city: true,
          rating: true, featured: true,
          media: { select: { url: true }, take: 1 },
        },
      },
    },
  })

  return Response.json(plannerVendor, { status: 201 })
}
