import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextRequest } from "next/server"

async function getOwnedStep(stepId: string, userId: string) {
  return prisma.step.findUnique({
    where: { id: stepId },
    select: { id: true, planner: { select: { userId: true } } },
  })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id: stepId } = await params
  const owned = await getOwnedStep(stepId, session.user.id)
  if (!owned || owned.planner.userId !== session.user.id)
    return Response.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()

  // Create vendor if it doesn't exist yet
  let vendor = await prisma.vendor.findFirst({ where: { name: body.name, category: body.category } })
  if (!vendor) {
    vendor = await prisma.vendor.create({
      data: {
        slug: body.slug ?? body.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name: body.name,
        category: body.category,
        description: body.description,
        phone: body.phone,
        email: body.email,
        address: body.address,
        lat: body.lat,
        lng: body.lng,
        priceRange: body.priceRange,
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
  const owned = await getOwnedStep(stepId, session.user.id)
  if (!owned || owned.planner.userId !== session.user.id)
    return Response.json({ error: "Forbidden" }, { status: 403 })

  const { vendorId } = await req.json()
  await prisma.stepVendor.deleteMany({ where: { stepId, vendorId } })
  return new Response(null, { status: 204 })
}
