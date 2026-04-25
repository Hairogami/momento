import "server-only"
import { prisma } from "@/lib/prisma"
import { DEV_OWNER_EMAIL } from "@/lib/adminConstants"

// Re-export pour les imports server existants
export { DEV_OWNER_EMAIL, isAdminEmail } from "@/lib/adminConstants"

/**
 * Vrai si le user est admin (role=admin) ou le dev/owner principal (par email).
 * Utilisé pour bypass les locks (template, plan gating, etc.).
 *
 * Server-only (utilise Prisma → ne pas importer côté client).
 */
export async function isAdminUser(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, role: true },
  })
  if (!user) return false
  return user.email === DEV_OWNER_EMAIL || user.role === "admin"
}
