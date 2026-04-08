import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: plannerId } = await params
  const body = await req.json()

  const lastStep = await prisma.step.findFirst({
    where: { plannerId },
    orderBy: { order: "desc" },
  })

  const step = await prisma.step.create({
    data: {
      title: body.title,
      description: body.description,
      category: body.category || "general",
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      order: (lastStep?.order ?? -1) + 1,
      plannerId,
    },
    include: { vendors: { include: { vendor: true } } },
  })
  return Response.json(step, { status: 201 })
}
