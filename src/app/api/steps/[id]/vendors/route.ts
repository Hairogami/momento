import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: stepId } = await params
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
  const { id: stepId } = await params
  const { vendorId } = await req.json()
  await prisma.stepVendor.deleteMany({ where: { stepId, vendorId } })
  return new Response(null, { status: 204 })
}
