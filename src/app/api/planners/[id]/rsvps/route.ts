import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { IS_DEV } from "@/lib/devMock"
import { requireSession } from "@/lib/devAuth"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: plannerId } = await params

  let userId: string
  if (IS_DEV) {
    const s = await requireSession()
    userId = s.user.id
  } else {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    userId = session.user.id
  }

  const planner = await prisma.planner.findUnique({
    where: { id: plannerId },
    select: {
      userId: true,
      eventSite: { select: { id: true, viewCount: true } },
    },
  })
  if (!planner || planner.userId !== userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  if (!planner.eventSite) {
    return NextResponse.json({
      rsvps: [],
      stats: { viewCount: 0, confirmed: 0, plusOnes: 0, total: 0 },
    })
  }

  const rsvps = await prisma.eventRsvp.findMany({
    where: { eventSiteId: planner.eventSite.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      guestName: true,
      guestEmail: true,
      guestPhone: true,
      attendingMain: true,
      attendingDayAfter: true,
      plusOneName: true,
      dietaryNeeds: true,
      message: true,
      createdAt: true,
    },
  })

  const confirmed = rsvps.filter(r => r.attendingMain).length
  const plusOnes = rsvps.filter(r => r.attendingMain && r.plusOneName && r.plusOneName.trim().length > 0).length

  return NextResponse.json({
    rsvps,
    stats: {
      viewCount: planner.eventSite.viewCount,
      confirmed,
      plusOnes,
      total: rsvps.length,
    },
  })
}
