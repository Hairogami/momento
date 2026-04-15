/**
 * Helper serveur pour logger les actions admin.
 * Utilisé par les routes `/api/admin/**` — chaque modification passe par ici.
 */
import { prisma } from "@/lib/prisma"
import type { Prisma } from "@/generated/prisma/client"

export type AuditChange = Record<string, { from: unknown; to: unknown }>

export async function logAdminAction(params: {
  adminId: string
  adminEmail: string
  action: string          // ex: "vendor.update"
  targetType: string      // ex: "Vendor"
  targetId: string        // id ou slug
  changes?: AuditChange
}) {
  try {
    await prisma.adminAuditLog.create({
      data: {
        adminId:    params.adminId,
        adminEmail: params.adminEmail,
        action:     params.action,
        targetType: params.targetType,
        targetId:   params.targetId,
        changes:    (params.changes ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    })
  } catch (err) {
    // On ne bloque jamais l'action admin pour une erreur de log
    console.error("[adminAudit] failed to log", params.action, err)
  }
}

/**
 * Construit un diff { field: { from, to } } entre 2 objets plats.
 * Ignore les champs identiques, les undefined, et les fonctions.
 */
export function diffFields<T extends Record<string, unknown>>(
  before: T,
  after: Partial<T>
): AuditChange {
  const changes: AuditChange = {}
  for (const key of Object.keys(after)) {
    const from = before[key]
    const to   = after[key]
    if (to === undefined) continue
    if (from === to) continue
    // Comparaison shallow suffit — on ne log que des scalaires
    changes[key] = { from, to }
  }
  return changes
}
