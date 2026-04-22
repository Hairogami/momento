import { EVENT_FAMILIES } from "@/lib/eventTypes"

/**
 * Return a human label for a Planner's eventType + eventSubType pair.
 * Examples:
 *   ("mariage", "traditionnel") → "mariage traditionnel"
 *   ("naissance", "aqiqa") → "Aqiqa"
 *   ("corporate", "seminaire") → "séminaire d'entreprise"
 * Fallbacks to just the family label, or "événement" if nothing set.
 */
export function getEventLabel(eventType: string | null | undefined, eventSubType: string | null | undefined): string {
  if (!eventType) return "événement"
  const family = EVENT_FAMILIES.find(f => f.id === eventType)
  if (!family) return "événement"
  if (!eventSubType) return family.label.toLowerCase()
  const sub = family.subtypes.find(s => s.id === eventSubType)
  if (!sub) return family.label.toLowerCase()
  return sub.label.toLowerCase()
}
