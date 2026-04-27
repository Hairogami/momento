/**
 * API-level auth guards (return Response on failure, never redirect).
 *
 * Différent de `requireAuth.ts` (Server Components → redirect) et `requirePro.ts`
 * (Server Components → redirect). Ici on protège des routes API qui doivent
 * répondre par un JSON d'erreur consommable côté client.
 */

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { IS_DEV } from "@/lib/devMock"

/**
 * Hard-gate : exige `User.emailVerified !== null` côté DB.
 *
 * Usage dans une route API, après le check de session :
 *
 *   const session = await auth()
 *   if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
 *   const gate = await requireVerifiedEmail(session.user.id)
 *   if (gate) return gate  // ← 403 si email non vérifié
 *
 * - En IS_DEV (local hors Vercel) → bypass complet, retourne `null`.
 * - En prod → fetch `User.emailVerified` depuis la DB.
 *   - User introuvable → 404
 *   - emailVerified === null → 403 avec code "EMAIL_NOT_VERIFIED"
 *   - sinon → null (caller continue)
 *
 * Retour : `NextResponse` à renvoyer immédiatement, ou `null` si OK.
 */
export async function requireVerifiedEmail(
  userId: string,
): Promise<NextResponse | null> {
  // DEV bypass — aucune restriction en local, zéro impact prod (IS_DEV=false sur Vercel)
  if (IS_DEV) return null

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailVerified: true },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  if (user.emailVerified === null) {
    return NextResponse.json(
      { error: "Email verification required", code: "EMAIL_NOT_VERIFIED" },
      { status: 403 },
    )
  }

  return null
}
