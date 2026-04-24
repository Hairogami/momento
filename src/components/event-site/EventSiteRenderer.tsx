"use client"

import MariageTemplate from "./templates/MariageTemplate"
import FeteFamilleTemplate from "./templates/FeteFamilleTemplate"
import CorporateTemplate from "./templates/CorporateTemplate"
import ConferenceTemplate from "./templates/ConferenceTemplate"
import GeneriqueTemplate from "./templates/GeneriqueTemplate"
import { getPalette, FONTS, type MoodId } from "@/lib/eventSiteTokens"
import { generateDecoratifParams, overrideDecoratifParams } from "@/lib/eventSiteSeed"
import DecoratifBackground from "./backgrounds/DecoratifBackground"
import FloatingParticles from "./backgrounds/FloatingParticles"
import { getPreset, resolveIntensity } from "@/lib/eventSiteAnimations"

const PARTICLES_VARIANT_BY_TEMPLATE: Record<string, "petals" | "stars" | "confetti" | "dots"> = {
  mariage: "petals",
  "fete-famille": "confetti",
  corporate: "dots",
  conference: "dots",
  generique: "stars",
}

type EventSite = {
  slug: string
  template: string
  palette: string
  fontHeading: string
  fontBody: string
  heroImageUrl: string | null
  layoutVariant: string
  // Le mood n'est pas encore persisté dans le schéma — on le dérive du template par défaut.
  // Le "mood" sera ajouté au schéma dans une migration suivante ; pour l'instant on utilise
  // un fallback intelligent basé sur le template.
  content: unknown
  photos?: { id: string; url: string; caption: string | null }[]
}

/** Fallback mood par template en attendant que EventSite.mood soit persisté en DB */
function defaultMood(template: string): MoodId {
  if (template === "mariage") return "decoratif"
  if (template === "fete-famille") return "decoratif"
  if (template === "corporate") return "shader"
  if (template === "conference") return "shader"
  return "editorial"
}

export default function EventSiteRenderer({ site }: { site: EventSite }) {
  const basePalette = getPalette(site.palette)
  // Override avec couleurs custom si l'user en a défini dans content.style.customColors
  const customColors = (site.content as { style?: { customColors?: { main?: string; accent?: string } } })?.style?.customColors
  const palette = customColors && (customColors.main || customColors.accent)
    ? { ...basePalette, main: customColors.main || basePalette.main, accent: customColors.accent || basePalette.accent }
    : basePalette
  const contentStyle = (site.content as { style?: { patternFullPage?: boolean; animationIntensity?: string } } | undefined)?.style
  const patternFullPage = contentStyle?.patternFullPage === true
  const mood: MoodId = patternFullPage ? "decoratif" : defaultMood(site.template)
  const animationPreset = getPreset(resolveIntensity(contentStyle?.animationIntensity))
  const fontH = FONTS[site.fontHeading as keyof typeof FONTS] ?? FONTS.cormorant
  const fontB = FONTS[site.fontBody as keyof typeof FONTS] ?? FONTS.pjs

  // Applique les variables CSS --evt-* sur le container racine
  const isDarkMood = mood === "shader"
  const style: React.CSSProperties & Record<string, string> = {
    "--evt-main": palette.main,
    "--evt-secondary": palette.secondary,
    "--evt-accent": palette.accent,
    "--evt-bg": isDarkMood && palette.darkBg ? palette.darkBg : palette.bg,
    "--evt-text": isDarkMood && palette.darkText ? palette.darkText : palette.text,
    "--evt-text-muted": palette.textMuted,
    "--evt-font-heading": fontH.stack,
    "--evt-font-body": fontB.stack,
    minHeight: "100vh",
    background: "var(--evt-bg)",
    color: "var(--evt-text)",
    fontFamily: "var(--evt-font-body)",
  }

  const content = site.content as Parameters<typeof MariageTemplate>[0]["content"]
  const photos = site.photos?.map(p => ({ id: p.id, url: p.url, caption: p.caption ?? undefined })) ?? []

  return (
    <>
      {/* Charge les fonts Google depuis leurs URLs si besoin */}
      <link rel="stylesheet" href={fontH.googleUrl} />
      <link rel="stylesheet" href={fontB.googleUrl} />
      <div style={style}>
        {/* Pattern décoratif continu sur toute la page (mood decoratif seulement) */}
        {mood === "decoratif" && (
          <DecoratifBackground
            params={overrideDecoratifParams(
              generateDecoratifParams(site.slug),
              (content as unknown as { style?: { pattern?: string; rotation?: number; dense?: boolean } })?.style as never,
            )}
            colorMain={palette.main}
            colorAccent={palette.accent}
            colorBg={palette.bg}
            intensity={1}
            fullPage
          />
        )}

        {/* Particules flottantes — variant selon template */}
        {animationPreset.particlesEnabled && (
          <FloatingParticles
            seed={site.slug}
            variant={PARTICLES_VARIANT_BY_TEMPLATE[site.template] ?? "petals"}
            color={palette.accent}
            count={animationPreset.particlesCount}
            speedSeconds={animationPreset.particlesSpeed}
          />
        )}
        <div style={{ position: "relative", zIndex: 1 }}>
          {renderTemplate(site.template, { slug: site.slug, mood, palette, content, heroImageUrl: site.heroImageUrl, photos })}
        </div>
      </div>
    </>
  )
}

function renderTemplate(
  template: string,
  props: {
    slug: string
    mood: MoodId
    palette: ReturnType<typeof getPalette>
    content: Parameters<typeof MariageTemplate>[0]["content"]
    heroImageUrl: string | null
    photos: { id: string; url: string; caption?: string }[]
  },
) {
  switch (template) {
    case "mariage":      return <MariageTemplate {...props} />
    case "fete-famille": return <FeteFamilleTemplate {...(props as Parameters<typeof FeteFamilleTemplate>[0])} />
    case "corporate":    return <CorporateTemplate {...(props as Parameters<typeof CorporateTemplate>[0])} />
    case "conference":   return <ConferenceTemplate {...(props as Parameters<typeof ConferenceTemplate>[0])} />
    default:             return <GeneriqueTemplate {...(props as Parameters<typeof GeneriqueTemplate>[0])} />
  }
}
