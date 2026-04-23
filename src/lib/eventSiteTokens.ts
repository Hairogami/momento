/**
 * Tokens visuels pour les sites événement (isolés du dashboard Momento).
 * Palettes, fonts, layouts — sources de vérité uniques pour l'éditeur et les templates.
 */

export type PaletteId = "terracotta" | "rose-or" | "vert-olive" | "bleu-marine" | "noir-blanc" | "pastel"

export type Palette = {
  id: PaletteId
  label: string
  // Couleurs sémantiques — utilisées par shader/pattern/éditorial de façon cohérente
  main: string
  secondary: string
  accent: string
  bg: string
  text: string
  textMuted: string
  // Version dark (certaines palettes fonctionnent mieux en thème sombre)
  darkBg?: string
  darkText?: string
}

export const PALETTES: readonly Palette[] = [
  {
    id: "terracotta",
    label: "Terracotta",
    main: "#C1713A",
    secondary: "#F5EDD6",
    accent: "#8B4513",
    bg: "#FAF3E8",
    text: "#3D2817",
    textMuted: "#8B7355",
    darkBg: "#1F1108",
    darkText: "#F5EDD6",
  },
  {
    id: "rose-or",
    label: "Rose & Or",
    main: "#E8B4B8",
    secondary: "#FFF5F5",
    accent: "#D4AF37",
    bg: "#FFF7F7",
    text: "#3A1F25",
    textMuted: "#8B5A61",
    darkBg: "#1F0F13",
    darkText: "#FFF5F5",
  },
  {
    id: "vert-olive",
    label: "Vert olive",
    main: "#556B2F",
    secondary: "#F5F5DC",
    accent: "#8B7355",
    bg: "#FBFBF0",
    text: "#1F2E10",
    textMuted: "#677A4A",
    darkBg: "#0F180A",
    darkText: "#F5F5DC",
  },
  {
    id: "bleu-marine",
    label: "Bleu marine",
    main: "#1E3A5F",
    secondary: "#F0F4F8",
    accent: "#C9A961",
    bg: "#F7FAFC",
    text: "#0F1F35",
    textMuted: "#4A6785",
    darkBg: "#081224",
    darkText: "#F0F4F8",
  },
  {
    id: "noir-blanc",
    label: "Noir & Blanc",
    main: "#111111",
    secondary: "#FFFFFF",
    accent: "#E11D48",
    bg: "#FFFFFF",
    text: "#111111",
    textMuted: "#555555",
    darkBg: "#0A0A0A",
    darkText: "#FAFAFA",
  },
  {
    id: "pastel",
    label: "Pastel",
    main: "#F4C2C2",
    secondary: "#FAF3E0",
    accent: "#7B9E87",
    bg: "#FEFCF7",
    text: "#4A3838",
    textMuted: "#8B7272",
    darkBg: "#1C1515",
    darkText: "#FAF3E0",
  },
] as const

export function getPalette(id: string): Palette {
  return PALETTES.find(p => p.id === id) ?? PALETTES[0]!
}

// ─── Fonts ───────────────────────────────────────────────────────────────────

export type FontId = "cormorant" | "playfair" | "pjs" | "inter" | "poppins"

export const FONTS: Record<FontId, { label: string; stack: string; googleUrl: string }> = {
  cormorant: {
    label: "Cormorant Garamond",
    stack: "'Cormorant Garamond', 'Times New Roman', serif",
    googleUrl: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap",
  },
  playfair: {
    label: "Playfair Display",
    stack: "'Playfair Display', 'Times New Roman', serif",
    googleUrl: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap",
  },
  pjs: {
    label: "Plus Jakarta Sans",
    stack: "'Plus Jakarta Sans', system-ui, sans-serif",
    googleUrl: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap",
  },
  inter: {
    label: "Inter",
    stack: "'Inter', system-ui, sans-serif",
    googleUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap",
  },
  poppins: {
    label: "Poppins",
    stack: "'Poppins', system-ui, sans-serif",
    googleUrl: "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap",
  },
}

// ─── Layout variants ─────────────────────────────────────────────────────────

export type LayoutId = "classic" | "modern" | "minimal"

export const LAYOUTS: Record<LayoutId, { label: string; description: string }> = {
  classic: { label: "Classic",  description: "Symétrique, centré, généreux" },
  modern:  { label: "Modern",   description: "Asymétrique, photos bleed, titres massifs" },
  minimal: { label: "Minimal",  description: "Beaucoup de blanc, typo épurée, zéro déco" },
}

// ─── Moods ───────────────────────────────────────────────────────────────────

export type MoodId = "editorial" | "shader" | "decoratif"

export const MOODS: Record<MoodId, { label: string; description: string; emoji: string }> = {
  editorial: { label: "Editorial",  emoji: "📰", description: "Magazine chic, typo serif, grille asymétrique" },
  shader:    { label: "Shader",     emoji: "✨", description: "Gradients animés, aurora, atypique" },
  decoratif: { label: "Décoratif",  emoji: "🌿", description: "Patterns SVG, arabesques, florales" },
}

// ─── CSS variables helper ────────────────────────────────────────────────────

/**
 * Génère les CSS variables --evt-* à injecter dans le container racine du site
 * public ou du preview éditeur. Les templates les utilisent via var(--evt-main) etc.
 */
export function paletteToVars(palette: Palette, dark = false): Record<string, string> {
  const bg = dark && palette.darkBg ? palette.darkBg : palette.bg
  const text = dark && palette.darkText ? palette.darkText : palette.text
  return {
    "--evt-main": palette.main,
    "--evt-secondary": palette.secondary,
    "--evt-accent": palette.accent,
    "--evt-bg": bg,
    "--evt-text": text,
    "--evt-text-muted": palette.textMuted,
  }
}

export function fontsToVars(fontHeading: FontId, fontBody: FontId): Record<string, string> {
  return {
    "--evt-font-heading": FONTS[fontHeading]?.stack ?? FONTS.cormorant.stack,
    "--evt-font-body": FONTS[fontBody]?.stack ?? FONTS.pjs.stack,
  }
}
