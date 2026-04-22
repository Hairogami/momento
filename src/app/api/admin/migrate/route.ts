import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const ADMIN_EMAIL = "moumene486@gmail.com"

/**
 * Migration one-shot pour utilisateurs/planners existants.
 * POST /api/admin/migrate
 *   - User sans plan → plan: "free"
 *   - User sans agreedTosAt → agreedTosAt: now
 *   - Planner sans eventType → eventType: "autre", eventSubType: "personnalise"
 *
 * Idempotent — peut être rejoué sans effet de bord.
 */
export async function POST() {
  const session = await auth()
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const [usersUpdated, plannersUpdated] = await prisma.$transaction([
    prisma.user.updateMany({
      where: { agreedTosAt: null },
      data: { agreedTosAt: new Date() },
    }),
    prisma.planner.updateMany({
      where: { eventType: null },
      data: { eventType: "autre", eventSubType: "personnalise" },
    }),
  ])

  return NextResponse.json({
    users: { agreedTosBackfilled: usersUpdated.count },
    planners: { eventTypeBackfilled: plannersUpdated.count },
  })
}
