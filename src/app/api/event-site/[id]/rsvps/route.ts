import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/event-site/[id]/rsvps
 * Owner only. Retourne la liste des RSVP pour le widget dashboard.
 * Stats incluses (yes/no/dayAfter).
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params

  const site = await prisma.eventSite.findUnique({
    where: { id },
    select: { id: true, planner: { select: { userId: true } } },
  })
  if (!site || site.planner.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const rsvps = await prisma.eventRsvp.findMany({
    where: { eventSiteId: id },
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

  const stats = {
    total: rsvps.length,
    attending: rsvps.filter(r => r.attendingMain).length,
    notAttending: rsvps.filter(r => !r.attendingMain).length,
    dayAfter: rsvps.filter(r => r.attendingDayAfter === true).length,
    plusOnes: rsvps.filter(r => r.plusOneName && r.plusOneName.length > 0).length,
  }

  return NextResponse.json({ rsvps, stats })
}
