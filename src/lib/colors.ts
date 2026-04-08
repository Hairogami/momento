/**
 * Momento design tokens — CSS variable references.
 * These respond to .dark and .palette-* classes on <html>.
 * Import this instead of defining a local C object in each page.
 */
export const C = {
  ink:        "var(--momento-ink)",
  terra:      "var(--momento-terra)",
  white:      "var(--momento-white)",
  anthracite: "var(--momento-anthracite)",
  mist:       "var(--momento-mist)",
  dark:       "var(--momento-dark)",
  steel:      "var(--momento-steel)",
  silver:     "var(--momento-silver)",
  accent:     "var(--momento-accent)",
} as const

export type ColorToken = typeof C[keyof typeof C]
