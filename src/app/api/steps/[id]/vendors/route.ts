import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextRequest } from "next/server"

async function getOwnedStep(stepId: string) {
  return prisma.step.findUnique({
    where: { id: stepId },
    select: { id: true, planner: { select: { userId: true } } },
  })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id: stepId } = await params
  const owned = await getOwnedStep(stepId)
  if (!owned || owned.planner.userId !== session.user.id)
    return Response.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()

  if (!body.name || typeof body.name !== "string" || !body.category || typeof body.category !== "string") {
    return Response.json({ error: "name et category requis." }, { status: 400 })
  }
  const safeName     = String(body.name).slice(0, 200).trim()
  const safeCategory = String(body.category).slice(0, 100).trim()

  // WR-05: Generate a collision-resistant slug for non-ASCII names
  const baseSlug = safeName
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
  const safeSlug = (baseSlug || "vendor") + "-" + Date.now().toString(36)

  // Create vendor if it doesn't exist yet (only in the user's planner context)
  let vendor = await prisma.vendor.findFirst({ where: { name: safeName, category: safeCategory } })
  if (!vendor) {
    vendor = await prisma.vendor.create({
      data: {
        slug: safeSlug,
        name: safeName,
        category: safeCategory,
        description: body.description ? String(body.description).slice(0, 1000) : undefined,
        phone:   body.phone   ? String(body.phone).slice(0, 30)   : undefined,
        email:   body.email   ? String(body.email).slice(0, 200)  : undefined,
        address: body.address ? String(body.address).slice(0, 300): undefined,
        lat: typeof body.lat === "number" ? body.lat : undefined,
        lng: typeof body.lng === "number" ? body.lng : undefined,
        priceRange: body.priceRange ? String(body.priceRange).slice(0, 50) : undefined,
      },
    })
  }

  const link = await prisma.stepVendor.create({
    data: { stepId, vendorId: vendor.id, notes: body.notes },
    include: { vendor: true },
  })
  return Response.json(link, { status: 201 })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id: stepId } = await params
  const owned = await getOwnedStep(stepId)
  if (!owned || owned.planner.userId !== session.user.id)
    return Response.json({ error: "Forbidden" }, { status: 403 })

  const { vendorId } = await req.json()
  await prisma.stepVendor.deleteMany({ where: { stepId, vendorId } })
  return new Response(null, { status: 204 })
}
