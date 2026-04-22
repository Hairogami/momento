/**
 * Plan gating — features accessibles selon plan user.
 */

export type UserPlan = "free" | "pro"

export type Feature =
  | "events.multiple"           // créer plus d'un événement
  | "vendors.contact"           // contacter un prestataire (paywall principal)
  | "vendors.favorites"         // système favoris + comparaison
  | "budget.breakdown"          // répartition budget détaillée + verdict IA
  | "tasks.timeline"            // checklist temporelle avec deadlines
  | "guests.manage"             // gestion invités + RSVP
  | "messages.direct"           // messagerie directe prestataires
  | "theme.custom"              // palette + thème personnalisés
  | "dashboard.widgets.advanced"// widgets avancés (notes multiples, alertes, moodboard, timeline, plan de table)
  | "fairepart.templates"       // templates faire-part (phase Pro 3)
  | "site.wedding"              // site mariage builder (phase Pro 2)
  | "contrats.templates"        // contrats type (phase Pro 1)

const PLAN_FEATURES: Record<UserPlan, Set<Feature>> = {
  free: new Set<Feature>([
    // swipe/découverte, budget total, notes, countdown — autorisés Free
  ]),
  pro: new Set<Feature>([
    "events.multiple",
    "vendors.contact",
    "vendors.favorites",
    "budget.breakdown",
    "tasks.timeline",
    "guests.manage",
    "messages.direct",
    "theme.custom",
    "dashboard.widgets.advanced",
    "fairepart.templates",
    "site.wedding",
    "contrats.templates",
  ]),
}

export function canAccess(plan: UserPlan, feature: Feature): boolean {
  return PLAN_FEATURES[plan].has(feature)
}

export function isPro(plan: UserPlan): boolean {
  return plan === "pro"
}
