// Presets d'intensité d'animation pour les sites événement.
// Le user choisit un preset global dans l'éditeur (Style tab).
// Chaque template consomme ces valeurs via EventSiteRenderer → AnimationConfigProvider.

export type AnimationIntensity = "subtle" | "normal" | "festive"

export type AnimationPreset = {
  particlesEnabled: boolean
  particlesSections: ("hero" | "programme" | "rsvp" | "dayAfter")[]
  particlesCount: number
  particlesSpeed: number   // secondes de durée moyenne du float
  parallax: boolean
  revealDistance: number   // px de translateY initial
  revealDuration: number   // ms
}

export const ANIMATION_PRESETS: Record<AnimationIntensity, AnimationPreset> = {
  subtle: {
    particlesEnabled: true,
    particlesSections: ["hero"],
    particlesCount: 8,
    particlesSpeed: 32,
    parallax: false,
    revealDistance: 12,
    revealDuration: 500,
  },
  normal: {
    particlesEnabled: true,
    particlesSections: ["hero", "programme"],
    particlesCount: 14,
    particlesSpeed: 22,
    parallax: true,
    revealDistance: 24,
    revealDuration: 700,
  },
  festive: {
    particlesEnabled: true,
    particlesSections: ["hero", "programme", "rsvp", "dayAfter"],
    particlesCount: 22,
    particlesSpeed: 16,
    parallax: true,
    revealDistance: 36,
    revealDuration: 900,
  },
}

export const DEFAULT_INTENSITY: AnimationIntensity = "normal"

export function resolveIntensity(raw: unknown): AnimationIntensity {
  if (raw === "subtle" || raw === "normal" || raw === "festive") return raw
  return DEFAULT_INTENSITY
}

export function getPreset(intensity: AnimationIntensity): AnimationPreset {
  return ANIMATION_PRESETS[intensity]
}
