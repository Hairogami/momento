import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const planner = await prisma.planner.findUnique({
    where: { id },
    include: {
      steps: {
        include: { vendors: { include: { vendor: true } } },
        orderBy: { order: "asc" },
      },
      events: { orderBy: { date: "asc" } },
    },
  })
  if (!planner) return Response.json({ error: "Not found" }, { status: 404 })
  return Response.json(planner)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const planner = await prisma.planner.update({
    where: { id },
    data: {
      title: body.title,
      coupleNames: body.coupleNames,
      weddingDate: body.weddingDate ? new Date(body.weddingDate) : undefined,
      budget: body.budget !== undefined ? parseFloat(body.budget) : undefined,
      location: body.location,
      coverColor: body.coverColor,
    },
  })
  return Response.json(planner)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.planner.delete({ where: { id } })
  return new Response(null, { status: 204 })
}
