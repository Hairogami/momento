/**
 * Plan gating — features accessibles selon plan user.
 */

export type UserPlan = "free" | "pro" | "max"

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

const PRO_FEATURES: Feature[] = [
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
]

const PLAN_FEATURES: Record<UserPlan, Set<Feature>> = {
  free: new Set<Feature>([
    // swipe/découverte, budget total, notes, countdown, favoris, mes-prestataires
  ]),
  pro: new Set<Feature>(PRO_FEATURES),
  // Max = Pro + accompagnement premium (planner humain, agent IA). Toutes les
  // features Pro sont incluses ; la différence sur les bonus se gère en UI.
  max: new Set<Feature>(PRO_FEATURES),
}

export function canAccess(plan: UserPlan, feature: Feature): boolean {
  // DEV bypass — unlock toutes les features en local (zéro impact prod)
  if (process.env.NODE_ENV === "development" && process.env.VERCEL !== "1") return true
  return PLAN_FEATURES[plan].has(feature)
}

export function isPro(plan: UserPlan): boolean {
  // DEV bypass — considéré pro en local
  if (process.env.NODE_ENV === "development" && process.env.VERCEL !== "1") return true
  return plan === "pro" || plan === "max"
}
