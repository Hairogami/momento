"use client"

import HeroSection from "@/components/event-site/ui/HeroSection"
import ProgramTimeline, { type ProgramStep } from "@/components/event-site/ui/ProgramTimeline"
import RsvpForm from "@/components/event-site/ui/RsvpForm"
import MapLinks from "@/components/event-site/ui/MapLinks"
import SiteNav, { type NavItem } from "@/components/event-site/ui/SiteNav"
import LocationMap from "@/components/event-site/ui/LocationMap"
import { generateShaderParams, generateDecoratifParams, generateEditorialParams, overrideDecoratifParams } from "@/lib/eventSiteSeed"
import type { MoodId, Palette } from "@/lib/eventSiteTokens"

type Speaker = { name: string; role?: string; bio?: string; photoUrl?: string }
type Partner = { name: string; logoUrl?: string; url?: string }

type Content = {
  hero?: { title?: string; subtitle?: string; date?: string; venue?: string }
  about?: string
  program?: ProgramStep[]
  speakers?: Speaker[]
  partners?: Partner[]
  mainEvent?: {
    venueName?: string; mapsUrl?: string; wazeUrl?: string
    location?: string
    locationResolved?: { lat: number; lng: number; displayName?: string }
  }
  dressCode?: string
  welcomeNote?: string
  rsvp?: { deadline?: string }
}

type Props = {
  slug: string; mood: MoodId; palette: Palette
  content: Content; heroImageUrl?: string | null
}

export default function CorporateTemplate({ slug, mood, palette, content, heroImageUrl }: Props) {
  const h = content.hero ?? {}
  const title = h.title || "Notre événement"
  const navItems: NavItem[] = [
    { id: "top", label: "Accueil" },
    ...(content.about ? [{ id: "about", label: "À propos" } as NavItem] : []),
    ...(content.program?.length ? [{ id: "programme", label: "Programme" } as NavItem] : []),
    ...(content.speakers?.length ? [{ id: "speakers", label: "Orateurs" } as NavItem] : []),
    ...(content.mainEvent?.venueName ? [{ id: "lieu", label: "Lieu" } as NavItem] : []),
    { id: "rsvp", label: "Inscription" },
  ]
  return (
    <main style={{ color: "var(--evt-text)", background: "var(--evt-bg)", fontFamily: "var(--evt-font-body)" }}>
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
      />

      {content.welcomeNote && (
        <section style={sectionCentered}>
          <p style={welcomeStyle}>{content.welcomeNote}</p>
        </section>
      )}

      {content.about && (
        <section id="about" style={sectionCentered}>
          <h2 style={h2Style}>À propos</h2>
          <p style={bodyStyle}>{content.about}</p>
        </section>
      )}

      {content.program && content.program.length > 0 && (
        <section id="programme">
          <ProgramTimeline steps={content.program} title="Programme" />
        </section>
      )}

      {content.speakers && content.speakers.length > 0 && (
        <section id="speakers" style={{ ...sectionCentered, maxWidth: 1000 }}>
          <h2 style={h2Style}>Orateurs</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginTop: 28, textAlign: "left" }}>
            {content.speakers.map((s, i) => (
              <div key={i} style={{ padding: "24px 20px", borderRadius: 14, background: "var(--evt-secondary)", border: "1px solid var(--evt-main)" }}>
                {s.photoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.photoUrl} alt={s.name} style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", marginBottom: 14 }} />
                )}
                <div style={{ fontFamily: "var(--evt-font-heading)", fontSize: 18, fontWeight: 500, color: "var(--evt-text)" }}>{s.name}</div>
                {s.role && <div style={{ fontSize: 12, color: "var(--evt-main)", marginTop: 4, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>{s.role}</div>}
                {s.bio && <p style={{ fontSize: 13, color: "var(--evt-text-muted)", marginTop: 10, lineHeight: 1.6 }}>{s.bio}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {content.mainEvent && content.mainEvent.venueName && (
        <section id="lieu" style={sectionCentered}>
          <h2 style={h2Style}>Lieu</h2>
          <p style={{ ...bodyStyle, marginBottom: 20 }}>{content.mainEvent.venueName}</p>

          {content.mainEvent.locationResolved && (
            <div style={{ maxWidth: 720, margin: "0 auto 20px" }}>
              <LocationMap
                lat={content.mainEvent.locationResolved.lat}
                lng={content.mainEvent.locationResolved.lng}
                venueName={content.mainEvent.venueName}
                height={340}
              />
            </div>
          )}

          <MapLinks venueName={content.mainEvent.venueName} mapsUrl={content.mainEvent.mapsUrl} wazeUrl={content.mainEvent.wazeUrl} />
        </section>
      )}

      {content.dressCode && (
        <section style={sectionCentered}>
          <h2 style={h2Style}>Dress code</h2>
          <p style={bodyStyle}>{content.dressCode}</p>
        </section>
      )}

      {content.partners && content.partners.length > 0 && (
        <section style={{ ...sectionCentered, maxWidth: 980 }}>
          <h2 style={h2Style}>Partenaires</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 28, justifyContent: "center", marginTop: 24, alignItems: "center" }}>
            {content.partners.map((p, i) => (
              <a key={i} href={p.url ?? "#"} target="_blank" rel="noopener noreferrer" style={{ opacity: 0.65, transition: "opacity 0.15s" }}>
                {p.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.logoUrl} alt={p.name} style={{ maxHeight: 48, maxWidth: 140, objectFit: "contain" }} />
                ) : (
                  <span style={{ fontFamily: "var(--evt-font-heading)", fontSize: 18, color: "var(--evt-text-muted)" }}>{p.name}</span>
                )}
              </a>
            ))}
          </div>
        </section>
      )}

      <section id="rsvp" style={{ marginTop: 40, background: "var(--evt-secondary)", borderTop: "1px solid var(--evt-main)", padding: "80px 24px 100px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <h2 style={h2Style}>Inscription</h2>
          <RsvpForm slug={slug} allowPlusOne={false} deadline={content.rsvp?.deadline ?? null} accentColor={palette.main} />
        </div>
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
