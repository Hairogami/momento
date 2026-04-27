import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserId } from "@/lib/api-auth"
import { dedupRsvps } from "@/lib/rsvpDedup"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: plannerId } = await params

  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

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

  // Stats calculées sur les RSVPs DÉDUPLIQUÉS (1 personne = 1 ligne).
  // On renvoie aussi la liste brute pour que la page puisse afficher
  // "X doublons masqués" en transparence.
  const deduped = dedupRsvps(rsvps)
  const confirmed = deduped.filter(r => r.attendingMain).length
  const plusOnes = deduped.filter(r => r.attendingMain && r.plusOneName && r.plusOneName.trim().length > 0).length

  return NextResponse.json({
    rsvps,
    stats: {
      viewCount: planner.eventSite.viewCount,
      confirmed,
      plusOnes,
      total: deduped.length,
    },
  })
}
