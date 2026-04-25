import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { Feature } from "@/lib/planGate"
import { isPro, type UserPlan } from "@/lib/planGate"
import { IS_DEV } from "@/lib/devMock"

/**
 * Server-side Pro plan gate.
 *
 * Usage dans un Server Component (layout.tsx ou page.tsx) :
 *   await requireProPlan({ from: "/messages", reason: "messages" })
 *
 * - Si l'utilisateur n'est pas authentifié → /login?next=<from>
 * - Si son plan n'est pas "pro" → /upgrade?from=<from>&reason=<reason>
 * - Si son planExpiresAt est passé → downgrade automatique en DB puis redirect upgrade
 *
 * Retourne le plan courant si tout est OK (garanti "pro").
 */
export async function requireProPlan(opts: {
  from: string
  /** Raison affichée sur /upgrade pour personnaliser le pitch */
  reason?: Feature | "messages" | "guests" | "checklist" | "favorites" | "theme" | "events-multiple" | "planner" | "budget-detailed"
}): Promise<UserPlan> {
  // DEV bypass — aucune restriction en local, zéro impact prod (IS_DEV=false sur Vercel)
  if (IS_DEV) return "pro"

  const session = await auth()
  if (!session?.user?.id) {
    const next = encodeURIComponent(opts.from)
    redirect(`/login?next=${next}`)
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, planExpiresAt: true },
  })

  if (!user) {
    redirect("/login")
  }

  let currentPlan = (user.plan ?? "free") as UserPlan

  // Expiration → downgrade
  if (
    currentPlan === "pro" &&
    user.planExpiresAt &&
    user.planExpiresAt.getTime() < Date.now()
  ) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { plan: "free", planExpiresAt: null },
    })
    currentPlan = "free"
  }

  if (!isPro(currentPlan)) {
    const params = new URLSearchParams({ from: opts.from })
    if (opts.reason) params.set("reason", opts.reason)
    redirect(`/upgrade?${params.toString()}`)
  }

  return currentPlan
}

/**
 * Lecture du plan côté serveur, sans redirect.
 * Utile pour conditionner un rendu (ex: dashboard qui montre widgets Pro si plan=pro).
 */
export async function getCurrentPlan(): Promise<{
  plan: UserPlan
  planExpiresAt: Date | null
  userId: string | null
}> {
  // DEV bypass — toujours pro en local
  if (IS_DEV) return { plan: "pro", planExpiresAt: null, userId: "dev" }

  const session = await auth()
  if (!session?.user?.id) return { plan: "free", planExpiresAt: null, userId: null }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, planExpiresAt: true },
  })
  if (!user) return { plan: "free", planExpiresAt: null, userId: session.user.id }

  // Auto-downgrade si expiré
  if (
    user.plan === "pro" &&
    user.planExpiresAt &&
    user.planExpiresAt.getTime() < Date.now()
  ) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { plan: "free", planExpiresAt: null },
    })
    return { plan: "free", planExpiresAt: null, userId: session.user.id }
  }

  return {
    plan: (user.plan ?? "free") as UserPlan,
    planExpiresAt: user.planExpiresAt ?? null,
    userId: session.user.id,
  }
}
