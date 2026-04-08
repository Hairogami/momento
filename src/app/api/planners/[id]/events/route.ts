import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: plannerId } = await params
  const body = await req.json()
  const event = await prisma.plannerEvent.create({
    data: {
      title: body.title,
      date: new Date(body.date),
      endDate: body.endDate ? new Date(body.endDate) : null,
      type: body.type || "task",
      color: body.color || "#f9a8d4",
      plannerId,
    },
  })
  return Response.json(event, { status: 201 })
}
