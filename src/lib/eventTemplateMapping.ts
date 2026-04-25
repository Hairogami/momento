/**
 * Mapping eventType (Planner) → template (EventSite).
 * Source unique de vérité — était dupliqué dans /api/event-site/route.ts et /dashboard/event-site/page.tsx.
 */

export const FAMILY_TO_TEMPLATE: Record<string, string> = {
  mariage: "mariage",
  fete: "fete-famille",
  naissance: "fete-famille",
  milestones: "fete-famille",
  corporate: "corporate",
  conference: "conference",
  religieux: "generique",
  caritatif: "generique",
  loisirs: "generique",
  autre: "generique",
}

/** Whitelist des templates valides côté API (PATCH event-site). */
export const ALLOWED_TEMPLATES = new Set([
  "mariage", "fete-famille", "corporate", "conference", "generique",
])

/**
 * Renvoie le template attendu pour un eventType.
 * Fallback: "generique" si eventType inconnu/null.
 */
export function templateForEventType(eventType: string | null | undefined): string {
  return FAMILY_TO_TEMPLATE[eventType ?? "autre"] ?? "generique"
}
