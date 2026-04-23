"use client"

import HeroSection from "@/components/event-site/ui/HeroSection"
import ProgramTimeline, { type ProgramStep } from "@/components/event-site/ui/ProgramTimeline"
import PhotoGallery, { type PhotoItem } from "@/components/event-site/ui/PhotoGallery"
import RsvpForm from "@/components/event-site/ui/RsvpForm"
import MapLinks from "@/components/event-site/ui/MapLinks"
import { generateShaderParams, generateDecoratifParams, generateEditorialParams } from "@/lib/eventSiteSeed"
import type { MoodId, Palette } from "@/lib/eventSiteTokens"

type Content = {
  hero?: { title?: string; subtitle?: string; date?: string; venue?: string }
  honored?: { name?: string; age?: number; bio?: string; photoUrl?: string }
  mainEvent?: { venueName?: string; mapsUrl?: string; wazeUrl?: string; time?: string; description?: string }
  program?: ProgramStep[]
  dressCode?: string
  registry?: { label: string; url: string }[]
  welcomeNote?: string
  rsvp?: { deadline?: string; allowPlusOne?: boolean }
}

type Props = {
  slug: string; mood: MoodId; palette: Palette
  content: Content; heroImageUrl?: string | null; photos?: PhotoItem[]
}

export default function FeteFamilleTemplate({ slug, mood, palette, content, heroImageUrl, photos = [] }: Props) {
  const h = content.hero ?? {}
  return (
    <main style={{ color: "var(--evt-text)", background: "var(--evt-bg)", fontFamily: "var(--evt-font-body)" }}>
      <HeroSection
        title={h.title || content.honored?.name || "Notre événement"}
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

      {content.honored?.bio && (
        <section style={sectionCentered}>
          <h2 style={h2Style}>{content.honored.name}</h2>
          <p style={bodyStyle}>{content.honored.bio}</p>
        </section>
      )}

      {content.mainEvent && (
        <section style={sectionCentered}>
          <h2 style={h2Style}>{content.mainEvent.venueName || "Où & quand"}</h2>
          {content.mainEvent.description && <p style={bodyStyle}>{content.mainEvent.description}</p>}
          {(content.mainEvent.mapsUrl || content.mainEvent.wazeUrl) && content.mainEvent.venueName && (
            <div style={{ marginTop: 20 }}>
              <MapLinks venueName={content.mainEvent.venueName} mapsUrl={content.mainEvent.mapsUrl} wazeUrl={content.mainEvent.wazeUrl} />
            </div>
          )}
        </section>
      )}

      {content.program && content.program.length > 0 && (
        <ProgramTimeline steps={content.program} title="Programme" />
      )}

      {content.dressCode && (
        <section style={sectionCentered}>
          <h2 style={h2Style}>Dress code</h2>
          <p style={bodyStyle}>{content.dressCode}</p>
        </section>
      )}

      {content.registry && content.registry.length > 0 && (
        <section style={sectionCentered}>
          <h2 style={h2Style}>Liste de cadeaux</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginTop: 18 }}>
            {content.registry.map((r, i) => (
              <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" style={chipLink}>{r.label} →</a>
            ))}
          </div>
        </section>
      )}

      {photos.length > 0 && (
        <section>
          <h2 style={{ ...h2Style, textAlign: "center" }}>Galerie</h2>
          <PhotoGallery photos={photos} />
        </section>
      )}

      <section style={{ ...sectionCentered, paddingTop: 80, paddingBottom: 100, background: "var(--evt-secondary)", margin: "40px -24px 0", borderTop: "1px solid var(--evt-main)" }}>
        <h2 style={h2Style}>Confirmez votre présence</h2>
        <RsvpForm slug={slug} allowPlusOne={content.rsvp?.allowPlusOne ?? true} deadline={content.rsvp?.deadline ?? null} accentColor={palette.main} />
      </section>

      <footer style={footerStyle}>· créé avec <a href="https://momentoevents.app" style={{ color: "var(--evt-main)", textDecoration: "none" }}>Momento</a> ·</footer>
    </main>
  )
}

const sectionCentered: React.CSSProperties = { padding: "80px 24px", maxWidth: 720, margin: "0 auto", textAlign: "center" }
const h2Style: React.CSSProperties = { fontFamily: "var(--evt-font-heading)", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 500, letterSpacing: "-0.02em", margin: "0 0 20px", color: "var(--evt-text)" }
const bodyStyle: React.CSSProperties = { fontFamily: "var(--evt-font-body)", fontSize: "clamp(0.95rem, 1.3vw, 1.05rem)", lineHeight: 1.75, color: "var(--evt-text-muted)", margin: "0 auto", maxWidth: 560 }
const welcomeStyle: React.CSSProperties = { fontFamily: "var(--evt-font-heading)", fontStyle: "italic", fontSize: "clamp(1.1rem, 2vw, 1.4rem)", lineHeight: 1.6, color: "var(--evt-text)", margin: "0 auto", maxWidth: 600, textAlign: "center" }
const chipLink: React.CSSProperties = { padding: "12px 22px", borderRadius: 999, border: "1px solid var(--evt-main)", color: "var(--evt-main)", fontSize: 13, fontWeight: 500, textDecoration: "none", fontFamily: "var(--evt-font-body)" }
const footerStyle: React.CSSProperties = { padding: "32px 24px", textAlign: "center", fontSize: 11, color: "var(--evt-text-muted)", fontFamily: "var(--evt-font-body)", letterSpacing: "0.15em", textTransform: "uppercase" }
