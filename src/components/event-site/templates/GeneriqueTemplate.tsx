"use client"

import HeroSection from "@/components/event-site/ui/HeroSection"
import ProgramTimeline, { type ProgramStep } from "@/components/event-site/ui/ProgramTimeline"
import RsvpForm from "@/components/event-site/ui/RsvpForm"
import MapLinks from "@/components/event-site/ui/MapLinks"
import { generateShaderParams, generateDecoratifParams, generateEditorialParams } from "@/lib/eventSiteSeed"
import type { MoodId, Palette } from "@/lib/eventSiteTokens"

type Content = {
  hero?: { title?: string; subtitle?: string; date?: string; venue?: string }
  about?: string
  program?: ProgramStep[]
  mainEvent?: { venueName?: string; mapsUrl?: string; wazeUrl?: string; description?: string }
  welcomeNote?: string
  rsvp?: { deadline?: string; allowPlusOne?: boolean }
}

type Props = {
  slug: string; mood: MoodId; palette: Palette
  content: Content; heroImageUrl?: string | null
}

export default function GeneriqueTemplate({ slug, mood, palette, content, heroImageUrl }: Props) {
  const h = content.hero ?? {}
  return (
    <main style={{ color: "var(--evt-text)", background: "var(--evt-bg)", fontFamily: "var(--evt-font-body)" }}>
      <HeroSection
        title={h.title || "Notre événement"}
        subtitle={h.subtitle}
        date={h.date}
        venueName={h.venue}
        mood={mood}
        palette={palette}
        heroImageUrl={heroImageUrl}
        shaderParams={generateShaderParams(slug)}
        decoratifParams={generateDecoratifParams(slug)}
        editorialParams={generateEditorialParams(slug)}
      />

      {content.welcomeNote && (
        <section style={sectionCentered}>
          <p style={welcomeStyle}>{content.welcomeNote}</p>
        </section>
      )}

      {content.about && (
        <section style={sectionCentered}>
          <p style={bodyStyle}>{content.about}</p>
        </section>
      )}

      {content.program && content.program.length > 0 && (
        <ProgramTimeline steps={content.program} />
      )}

      {content.mainEvent && content.mainEvent.venueName && (
        <section style={sectionCentered}>
          <h2 style={h2Style}>{content.mainEvent.venueName}</h2>
          {content.mainEvent.description && <p style={bodyStyle}>{content.mainEvent.description}</p>}
          <div style={{ marginTop: 20 }}>
            <MapLinks venueName={content.mainEvent.venueName} mapsUrl={content.mainEvent.mapsUrl} wazeUrl={content.mainEvent.wazeUrl} />
          </div>
        </section>
      )}

      <section style={{ ...sectionCentered, paddingTop: 80, paddingBottom: 100, background: "var(--evt-secondary)", margin: "40px -24px 0", borderTop: "1px solid var(--evt-main)" }}>
        <h2 style={h2Style}>Confirmez votre présence</h2>
        <RsvpForm slug={slug} allowPlusOne={content.rsvp?.allowPlusOne ?? false} deadline={content.rsvp?.deadline ?? null} accentColor={palette.main} />
      </section>

      <footer style={footerStyle}>· créé avec <a href="https://momentoevents.app" style={{ color: "var(--evt-main)", textDecoration: "none" }}>Momento</a> ·</footer>
    </main>
  )
}

const sectionCentered: React.CSSProperties = { padding: "80px 24px", maxWidth: 720, margin: "0 auto", textAlign: "center" }
const h2Style: React.CSSProperties = { fontFamily: "var(--evt-font-heading)", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 500, letterSpacing: "-0.02em", margin: "0 0 20px", color: "var(--evt-text)" }
const bodyStyle: React.CSSProperties = { fontFamily: "var(--evt-font-body)", fontSize: "clamp(0.95rem, 1.3vw, 1.05rem)", lineHeight: 1.75, color: "var(--evt-text-muted)", margin: "0 auto", maxWidth: 560 }
const welcomeStyle: React.CSSProperties = { fontFamily: "var(--evt-font-heading)", fontStyle: "italic", fontSize: "clamp(1.1rem, 2vw, 1.4rem)", lineHeight: 1.6, color: "var(--evt-text)", margin: "0 auto", maxWidth: 600, textAlign: "center" }
const footerStyle: React.CSSProperties = { padding: "32px 24px", textAlign: "center", fontSize: 11, color: "var(--evt-text-muted)", fontFamily: "var(--evt-font-body)", letterSpacing: "0.15em", textTransform: "uppercase" }
