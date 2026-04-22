/**
 * Dashboard completion score (0-100).
 *
 * Milestones pondérées :
 *   • Événement (type + sous-type)            10%
 *   • Catégories choisies                     15%
 *   • Budget défini                           15%
 *   • Prestataires confirmés (ratio couvert)  30%
 *   • Invités renseignés                      15%
 *   • Tâches complétées                       15%
 */

type Planner = {
  eventType?: string | null
  eventSubType?: string | null
  categories?: string[] | null
  budget?: number | null
  budgetBreakdown?: unknown
  guestCount?: number | null
}

type Vendors = Array<{ vendor?: { category?: string | null } | null; status?: string | null }>
type Guests  = Array<{ rsvp?: string | null }>
type Tasks   = Array<{ done?: boolean }>

export type CompletionInput = {
  planner: Planner
  vendors?: Vendors
  guests?: Guests
  tasks?: Tasks
}

export function computeCompletion({ planner, vendors = [], guests = [], tasks = [] }: CompletionInput): number {
  let pct = 0

  // Événement
  if (planner.eventType) pct += 5
  if (planner.eventSubType) pct += 5

  // Catégories
  const cats = Array.isArray(planner.categories) ? planner.categories : []
  if (cats.length >= 3) pct += 15
  else if (cats.length > 0) pct += Math.round((cats.length / 3) * 15)

  // Budget
  if (planner.budget && planner.budget > 0) pct += 7.5
  if (planner.budgetBreakdown && typeof planner.budgetBreakdown === "object") pct += 7.5

  // Prestataires — ratio catégories couvertes
  if (cats.length > 0 && vendors.length > 0) {
    const covered = cats.filter(c => vendors.some(v => v.vendor?.category === c)).length
    pct += Math.round((covered / cats.length) * 30)
  }

  // Invités
  if (planner.guestCount && planner.guestCount > 0) pct += 8
  if (guests.length > 0) {
    const responded = guests.filter(g => g.rsvp && g.rsvp !== "pending").length
    pct += Math.round((responded / guests.length) * 7)
  }

  // Tâches
  if (tasks.length > 0) {
    const done = tasks.filter(t => t.done).length
    pct += Math.round((done / tasks.length) * 15)
  }

  return Math.max(0, Math.min(100, Math.round(pct)))
}
