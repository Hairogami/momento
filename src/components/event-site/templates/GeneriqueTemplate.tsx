"use client"

import HeroSection from "@/components/event-site/ui/HeroSection"
import ProgramTimeline, { type ProgramStep } from "@/components/event-site/ui/ProgramTimeline"
import RsvpForm from "@/components/event-site/ui/RsvpForm"
import MapLinks from "@/components/event-site/ui/MapLinks"
import SiteNav, { type NavItem } from "@/components/event-site/ui/SiteNav"
import LocationMap from "@/components/event-site/ui/LocationMap"
import { generateShaderParams, generateDecoratifParams, generateEditorialParams, overrideDecoratifParams } from "@/lib/eventSiteSeed"
import type { MoodId, Palette } from "@/lib/eventSiteTokens"

type Content = {
  hero?: { title?: string; subtitle?: string; date?: string; venue?: string }
  about?: string
  program?: ProgramStep[]
  mainEvent?: {
    venueName?: string; mapsUrl?: string; wazeUrl?: string; description?: string
    location?: string
    locationResolved?: { lat: number; lng: number; displayName?: string }
  }
  welcomeNote?: string
  rsvp?: { deadline?: string; allowPlusOne?: boolean }
}

type Props = {
  slug: string; mood: MoodId; palette: Palette
  content: Content; heroImageUrl?: string | null
}

export default function GeneriqueTemplate({ slug, mood, palette, content, heroImageUrl }: Props) {
  const h = content.hero ?? {}
  const title = h.title || "Notre événement"
  const navItems: NavItem[] = [
    { id: "top", label: "Accueil" },
    ...(content.about ? [{ id: "about", label: "À propos" } as NavItem] : []),
    ...(content.program?.length ? [{ id: "programme", label: "Programme" } as NavItem] : []),
    ...(content.mainEvent?.venueName ? [{ id: "lieu", label: "Lieu" } as NavItem] : []),
    { id: "rsvp", label: "RSVP" },
  ]
  return (
    <main style={{ color: "var(--evt-text)", fontFamily: "var(--evt-font-body)" }}>
      <SiteNav title={title} items={navItems} />
      <div id="top" />
      <HeroSection
        title={h.title || "Notre événement"}
        subtitle={h.subtitle}
        date={h.date}
        venueName={h.venue}
        mood={mood}
        palette={palette}
        heroImageUrl={heroImageUrl}
        shaderParams={generateShaderParams(slug)}
        decoratifParams={overrideDecoratifParams(generateDecoratifParams(slug), (content as unknown as { style?: { pattern?: string; rotation?: number; dense?: boolean } }).style as never)}
        editorialParams={generateEditorialParams(slug)}
        bgVariant={
          (content as unknown as { style?: { animationIntensity?: string } }).style?.animationIntensity === "none" ? "still"
          : (content as unknown as { style?: { animationIntensity?: string } }).style?.animationIntensity === "subtle" ? "still"
          : (content as unknown as { style?: { animationIntensity?: string } }).style?.animationIntensity === "festive" ? "rich"
          : "drift"
        }
        suppressInnerPattern={(content as unknown as { style?: { patternFullPage?: boolean } }).style?.patternFullPage === true}
        customPatternOpacity={(content as unknown as { style?: { patternOpacity?: number } }).style?.patternOpacity}
      />

      {content.welcomeNote && (
        <section style={sectionCentered}>
          <p style={welcomeStyle}>{content.welcomeNote}</p>
        </section>
      )}

      {content.about && (
        <section id="about" style={sectionCentered}>
          <p style={bodyStyle}>{content.about}</p>
        </section>
      )}

      {content.program && content.program.length > 0 && (
        <section id="programme">
          <ProgramTimeline steps={content.program} />
        </section>
      )}

      {content.mainEvent && content.mainEvent.venueName && (
        <section id="lieu" style={sectionCentered}>
          <h2 style={h2Style}>{content.mainEvent.venueName}</h2>
          {content.mainEvent.description && <p style={bodyStyle}>{content.mainEvent.description}</p>}

          {content.mainEvent.locationResolved && (
            <div style={{ maxWidth: 720, margin: "20px auto" }}>
              <LocationMap
                lat={content.mainEvent.locationResolved.lat}
                lng={content.mainEvent.locationResolved.lng}
                venueName={content.mainEvent.venueName}
                height={340}
              />
            </div>
          )}

          <div style={{ marginTop: 20 }}>
            <MapLinks venueName={content.mainEvent.venueName} mapsUrl={content.mainEvent.mapsUrl} wazeUrl={content.mainEvent.wazeUrl} />
          </div>
        </section>
      )}

      <section id="rsvp" style={{ marginTop: 40, background: "var(--evt-secondary)", borderTop: "3px solid var(--evt-main)", borderBottom: "3px solid var(--evt-main)", padding: "80px 24px 100px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <h2 style={h2Style}>Confirmez votre présence</h2>
          <RsvpForm slug={slug} allowPlusOne={content.rsvp?.allowPlusOne ?? false} deadline={content.rsvp?.deadline ?? null} accentColor={palette.main} />
        </div>
      </section>

      <footer style={footerStyle}>· créé avec <a href="https://momentoevents.app" style={{ color: "var(--evt-main)", textDecoration: "none" }}>Layali</a> ·</footer>
    </main>
  )
}

const sectionCentered: React.CSSProperties = { padding: "80px 24px", maxWidth: 720, margin: "0 auto", textAlign: "center" }
const h2Style: React.CSSProperties = { fontFamily: "var(--evt-font-heading)", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 600, letterSpacing: "-0.02em", margin: "0 0 20px", color: "var(--evt-main)" }
const bodyStyle: React.CSSProperties = { fontFamily: "var(--evt-font-body)", fontSize: "clamp(0.95rem, 1.3vw, 1.05rem)", lineHeight: 1.75, color: "var(--evt-text-muted)", margin: "0 auto", maxWidth: 560 }
const welcomeStyle: React.CSSProperties = { fontFamily: "var(--evt-font-heading)", fontStyle: "italic", fontSize: "clamp(1.1rem, 2vw, 1.4rem)", lineHeight: 1.6, color: "var(--evt-text)", margin: "0 auto", maxWidth: 600, textAlign: "center" }
const footerStyle: React.CSSProperties = { padding: "32px 24px", textAlign: "center", fontSize: "var(--text-xs)", color: "var(--evt-text-muted)", fontFamily: "var(--evt-font-body)", letterSpacing: "0.15em", textTransform: "uppercase" }
