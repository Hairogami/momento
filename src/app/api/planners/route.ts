import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextRequest } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    // Return all planners for unauthenticated (backward compat with localStorage flow)
    const planners = await prisma.planner.findMany({
      include: { steps: true, events: true },
      orderBy: { createdAt: "desc" },
    })
    return Response.json(planners)
  }

  const planners = await prisma.planner.findMany({
    where: { userId: session!.user!.id },
    include: { steps: true, events: true },
    orderBy: { createdAt: "desc" },
  })
  return Response.json(planners)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  const body = await request.json()
  const planner = await prisma.planner.create({
    data: {
      title: body.title,
      coupleNames: body.coupleNames,
      weddingDate: body.weddingDate ? new Date(body.weddingDate) : null,
      budget: body.budget ? parseFloat(body.budget) : null,
      location: body.location,
      coverColor: body.coverColor || "#f9a8d4",
      userId: session?.user?.id ?? null,
    },
  })
  return Response.json(planner, { status: 201 })
}
