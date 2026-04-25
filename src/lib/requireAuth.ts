import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

/**
 * Server-side auth gate utilisable depuis un Server Component (layout.tsx, page.tsx).
 * Defense-in-depth — le proxy.ts vérifie juste la présence du cookie session,
 * cette fonction valide réellement la session via Auth.js v5 (`auth()`).
 *
 *   await requireAuth("/dashboard")
 *
 * - Si pas de session → redirect /login?next=<from>
 * - Sinon → retourne la session (typée user.id présent)
 */
export async function requireAuth(from: string) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect(`/login?next=${encodeURIComponent(from)}`)
  }
  return session
}
