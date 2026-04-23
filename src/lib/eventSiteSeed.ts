/**
 * Seeded backgrounds — paramètres de rendu uniques par site dérivés du slug.
 *
 * Principe : hash(slug) → nombre → params visuels déterministes.
 * Même slug = même rendu (cohérence). Slug différent = rendu différent.
 * User peut overrider manuellement via sliders / upload photo.
 */

// Simple xmur3 → sfc32 PRNG pattern pour seeds reproductibles en JS
function xmur3(str: string): () => number {
  let h = 1779033703 ^ str.length
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    h ^= h >>> 16
    return h >>> 0
  }
}

function sfc32(a: number, b: number, c: number, d: number): () => number {
  return () => {
    a |= 0; b |= 0; c |= 0; d |= 0
    const t = (((a + b) | 0) + d) | 0
    d = (d + 1) | 0
    a = b ^ (b >>> 9)
    b = (c + (c << 3)) | 0
    c = (c << 21) | (c >>> 11)
    c = (c + t) | 0
    return (t >>> 0) / 4294967296
  }
}

/** Retourne un générateur de nombres [0,1[ déterministe à partir d'un slug. */
export function seededRng(slug: string): () => number {
  const hasher = xmur3(slug)
  return sfc32(hasher(), hasher(), hasher(), hasher())
}

/** Helper : pick un élément d'un tableau via rng. */
export function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]!
}

/** Helper : valeur float dans [min, max] via rng. */
export function rand(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min)
}

// ─── Paramètres de fond par mood ─────────────────────────────────────────────

export type ShaderBgParams = {
  blob1: { x: number; y: number; sizeX: number; sizeY: number }
  blob2: { x: number; y: number; sizeX: number; sizeY: number }
  mainAngle: number // degrees
  accentOpacity: number
  animationSpeed: number // 0.2 → 1.5
}

export function generateShaderParams(slug: string): ShaderBgParams {
  const rng = seededRng(`shader:${slug}`)
  return {
    blob1: {
      x: Math.round(rand(rng, 10, 90)),
      y: Math.round(rand(rng, 10, 90)),
      sizeX: Math.round(rand(rng, 40, 90)),
      sizeY: Math.round(rand(rng, 40, 80)),
    },
    blob2: {
      x: Math.round(rand(rng, 10, 90)),
      y: Math.round(rand(rng, 10, 90)),
      sizeX: Math.round(rand(rng, 40, 90)),
      sizeY: Math.round(rand(rng, 40, 80)),
    },
    mainAngle: Math.round(rand(rng, 90, 310)),
    accentOpacity: rand(rng, 0.3, 0.7),
    animationSpeed: rand(rng, 0.3, 0.9),
  }
}

export type DecoratifBgParams = {
  pattern: "arabesque" | "losanges" | "cercles" | "hexagone" | "florale" | "zellige" | "fleurs-line" | "constellations" | "vagues"
  scale: number // 0.6 → 1.4
  rotation: number // 0 → 8 deg (faible — évite l'effet "penché")
  opacity: number // 0.25 → 0.55
  dense: boolean
}

export function generateDecoratifParams(slug: string): DecoratifBgParams {
  const rng = seededRng(`decoratif:${slug}`)
  return {
    pattern: pick(rng, ["arabesque", "losanges", "cercles", "hexagone", "florale", "zellige", "fleurs-line", "constellations", "vagues"] as const),
    scale: rand(rng, 0.85, 1.15),
    rotation: 0, // pattern toujours droit — user peut activer rotation dans l'éditeur
    opacity: rand(rng, 0.35, 0.55),
    dense: rng() > 0.5,
  }
}

/** Override des params decoratif quand l'user a fait un choix explicite dans l'éditeur */
export function overrideDecoratifParams(
  base: DecoratifBgParams,
  override?: { pattern?: DecoratifBgParams["pattern"]; scale?: number; rotation?: number; opacity?: number; dense?: boolean } | null,
): DecoratifBgParams {
  if (!override) return base
  return {
    pattern: override.pattern ?? base.pattern,
    scale: override.scale ?? base.scale,
    rotation: override.rotation ?? base.rotation,
    opacity: override.opacity ?? base.opacity,
    dense: override.dense ?? base.dense,
  }
}

export type EditorialBgParams = {
  heroLayout: "left" | "right" | "center" | "split"
  accentLine: "top" | "bottom" | "both" | "none"
  columnWeight: "minor" | "balanced" | "major" // force visuelle col gauche
  serifStyleSuffix: number // 0..5 — variante italique/regular selon la valeur
}

export function generateEditorialParams(slug: string): EditorialBgParams {
  const rng = seededRng(`editorial:${slug}`)
  return {
    heroLayout: pick(rng, ["left", "right", "center", "split"] as const),
    accentLine: pick(rng, ["top", "bottom", "both", "none"] as const),
    columnWeight: pick(rng, ["minor", "balanced", "major"] as const),
    serifStyleSuffix: Math.floor(rng() * 6),
  }
}
