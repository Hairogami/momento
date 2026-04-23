import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { UserPlan } from "@/lib/planGate"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, planExpiresAt: true },
  })
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Auto-downgrade si expiré
  if (user.plan === "pro" && user.planExpiresAt && user.planExpiresAt.getTime() < Date.now()) {
    const downgraded = await prisma.user.update({
      where: { id: session.user.id },
      data: { plan: "free", planExpiresAt: null },
      select: { plan: true, planExpiresAt: true },
    })
    return NextResponse.json(downgraded)
  }

  return NextResponse.json({ plan: user.plan, planExpiresAt: user.planExpiresAt })
}

/**
 * POST /api/user/plan
 *
 * ⚠ SÉCURITÉ : l'upgrade vers "pro" NE PEUT PAS venir du client.
 * Seul un webhook paiement signé (CMI / PayPal) ou un admin peut upgrader.
 *
 * Accepté côté client :
 *   - downgrade : { plan: "free" } (l'user peut toujours annuler son propre plan)
 *
 * Pour activer l'upgrade en mode dev/staging (pour tester la UI sans payer),
 * définir ALLOW_DEV_UPGRADE=true dans les env vars.
 */
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const body = (await req.json().catch(() => null)) as { plan?: UserPlan } | null
  const nextPlan = body?.plan

  if (nextPlan !== "free" && nextPlan !== "pro") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
  }

  // Downgrade → toujours autorisé côté client
  if (nextPlan === "free") {
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { plan: "free", planExpiresAt: null },
      select: { plan: true, planExpiresAt: true },
    })
    return NextResponse.json(updated)
  }

  // Upgrade → interdit sans paiement signé
  const allowDevUpgrade = process.env.ALLOW_DEV_UPGRADE === "true"
  if (!allowDevUpgrade) {
    return NextResponse.json(
      {
        error: "Upgrade non autorisé. Passer par /upgrade pour payer.",
        code: "PAYMENT_REQUIRED",
      },
      { status: 402 },
    )
  }

  // Mode dev uniquement — flag explicite
  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      plan: "pro",
      planExpiresAt: new Date(Date.now() + 30 * 86400_000),
    },
    select: { plan: true, planExpiresAt: true },
  })
  return NextResponse.json(updated)
}
