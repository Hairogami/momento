import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const step = await prisma.step.update({
    where: { id },
    data: {
      title: body.title,
      description: body.description,
      status: body.status,
      category: body.category,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
    },
    include: { vendors: { include: { vendor: true } } },
  })
  return Response.json(step)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.step.delete({ where: { id } })
  return new Response(null, { status: 204 })
}
