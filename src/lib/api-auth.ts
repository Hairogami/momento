/**
 * API auth helper — déduplique le branchement IS_DEV à travers les routes.
 *
 * Avant (dupliqué dans 15+ routes) :
 *   let userId: string
 *   if (IS_DEV) {
 *     const s = await requireSession()
 *     userId = s.user.id
 *   } else {
 *     const session = await auth()
 *     if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
 *     userId = session.user.id
 *   }
 *
 * Après :
 *   const userId = await getUserId()
 *   if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
 *
 * Pourquoi : un seul endroit où vit la logique de bascule dev/prod. Plus
 * de risque d'oublier le branch IS_DEV dans une nouvelle route (= bug en local
 * ou bypass auth en prod si inversé).
 */

import { auth } from "@/lib/auth"
import { requireSession } from "@/lib/devAuth"
import { IS_DEV } from "@/lib/devMock"

/**
 * Retourne l'`id` du user authentifié, ou `null` si pas de session.
 *
 * - En IS_DEV (local hors Vercel) → utilise `requireSession()` qui
 *   résout le premier user de la DB et fallback sur un mock si vide.
 * - En prod → utilise `auth()` (NextAuth v5).
 */
export async function getUserId(): Promise<string | null> {
  if (IS_DEV) {
    const s = await requireSession()
    return s.user.id
  }
  const session = await auth()
  return session?.user?.id ?? null
}
