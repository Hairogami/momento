/**
 * Catégories budget — source unique de vérité.
 *
 * Utilisée par :
 *   - Page /budget (form add/edit, filtres, dropdown)
 *   - RepartitionBudgetWidget (donut + legend)
 *   - DepensesRecentesWidget (color de la ligne)
 *   - Modal add/edit dépense (dropdown)
 *
 * Règles brand-consistency.md :
 *   - Couleurs choisies dans la palette brand neutre (compatibles dark/light mode)
 *   - PAS d'ancien design sépia/terracotta
 *   - Compatibles avec gradient G (--g1 #E11D48, --g2 #9333EA) sans clash
 */

import type { ComponentType } from "react"

export type BudgetCategoryId =
  | "lieu"
  | "traiteur"
  | "photographe"
  | "musique"
  | "decoration"
  | "transport"
  | "tenue"
  | "fleurs"
  | "papeterie"
  | "divers"

export interface BudgetCategory {
  id: BudgetCategoryId
  label: string
  /** Couleur hex pour donut/barre/badge. Choisie dans palette brand-aligned. */
  color: string
  /** Material Symbols icon name. */
  icon: string
}

/**
 * Liste ordonnée par fréquence d'usage typique pour un mariage.
 * "divers" toujours en dernier comme catch-all.
 */
export const BUDGET_CATEGORIES: readonly BudgetCategory[] = [
  { id: "lieu",        label: "Lieu",         color: "#E11D48", icon: "location_on"     },
  { id: "traiteur",    label: "Traiteur",     color: "#9333EA", icon: "local_dining"    },
  { id: "photographe", label: "Photographe",  color: "#F59E0B", icon: "camera_alt"      },
  { id: "musique",     label: "Musique",      color: "#10B981", icon: "music_note"      },
  { id: "decoration",  label: "Décoration",   color: "#3B82F6", icon: "celebration"     },
  { id: "transport",   label: "Transport",    color: "#6366F1", icon: "directions_car"  },
  { id: "tenue",       label: "Tenue",        color: "#EC4899", icon: "checkroom"       },
  { id: "fleurs",      label: "Fleurs",       color: "#22C55E", icon: "local_florist"   },
  { id: "papeterie",   label: "Papeterie",    color: "#8B5CF6", icon: "mail"            },
  { id: "divers",      label: "Divers",       color: "#6B7280", icon: "more_horiz"      },
] as const

/** Lookup par id avec fallback "divers" si id inconnu (catégorie custom legacy). */
export function getCategory(id: string): BudgetCategory {
  return BUDGET_CATEGORIES.find((c) => c.id === id) ?? BUDGET_CATEGORIES[BUDGET_CATEGORIES.length - 1]
}

/** Liste des ids pour validation Zod ou type-guard. */
export const BUDGET_CATEGORY_IDS = BUDGET_CATEGORIES.map((c) => c.id) as readonly BudgetCategoryId[]

/** Type-guard. */
export function isBudgetCategoryId(id: string): id is BudgetCategoryId {
  return BUDGET_CATEGORY_IDS.includes(id as BudgetCategoryId)
}

/** Type pour usage dans React props (évite l'import direct de BudgetCategory partout). */
export type BudgetCategoryWithIcon<T = unknown> = BudgetCategory & { iconComponent?: ComponentType<T> }
