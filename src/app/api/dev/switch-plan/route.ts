import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DEV_OWNER_EMAIL } from "@/lib/adminAuth"

// DEV_OWNER_EMAIL centralisé via @/lib/adminAuth (DEV_OWNER_EMAIL)
const ALLOWED_PLANS = new Set(["free", "pro", "max"])

/**
 * POST /api/dev/switch-plan
 * Body: { plan: "free" | "pro" | "max" }
 * Réservé à moumene486@gmail.com — permet de tester le gating par plan.
 *
 * Contrairement à /api/user/plan (qui refuse les upgrades client-side pour la prod),
 * cet endpoint force le plan pour le dev. Ne contourne AUCUN check en prod pour
 * un autre email — 403 sinon.
 */
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id || session.user.email !== DEV_OWNER_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
  }
  const b = body as Record<string, unknown>
  const plan = typeof b.plan === "string" ? b.plan : ""
  if (!ALLOWED_PLANS.has(plan)) {
    return NextResponse.json({ error: "plan doit être free | pro | max" }, { status: 400 })
  }

  const expiry = plan === "free"
    ? null
    : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 an

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      plan,
      planExpiresAt: expiry,
    },
  })

  return NextResponse.json({ plan, planExpiresAt: expiry })
}
