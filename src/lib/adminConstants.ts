/**
 * Constantes admin partagées client + serveur (PAS de Prisma ici).
 * Pour les helpers nécessitant la DB → @/lib/adminAuth (server-only).
 */

export const DEV_OWNER_EMAIL = "moumene486@gmail.com"

/** Check synchrone par email. Safe à utiliser côté client (useSession). */
export function isAdminEmail(email: string | null | undefined): boolean {
  return email === DEV_OWNER_EMAIL
}
