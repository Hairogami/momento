"use client"

import HeroSection from "@/components/event-site/ui/HeroSection"
import ProgramTimeline, { type ProgramStep } from "@/components/event-site/ui/ProgramTimeline"
import PhotoGallery, { type PhotoItem } from "@/components/event-site/ui/PhotoGallery"
import RsvpForm from "@/components/event-site/ui/RsvpForm"
import MapLinks from "@/components/event-site/ui/MapLinks"
import SiteNav, { type NavItem } from "@/components/event-site/ui/SiteNav"
import LocationMap from "@/components/event-site/ui/LocationMap"
import Reveal from "@/components/event-site/ui/Reveal"
import SectionDivider from "@/components/event-site/ui/SectionDivider"
import Countdown, { type CountdownVariant } from "@/components/event-site/ui/Countdown"
import {
  generateShaderParams, generateDecoratifParams, generateEditorialParams,
  overrideDecoratifParams,
} from "@/lib/eventSiteSeed"
import type { MoodId, Palette } from "@/lib/eventSiteTokens"

type MariageContent = {
  hero?: { title?: string; subtitle?: string; date?: string; venue?: string }
  couple?: { story?: string; photoUrl?: string }
  mainEvent?: {
    venueName?: string
    mapsUrl?: string
    wazeUrl?: string
    time?: string
    description?: string
    /** Entrée brute de l'user (URL, coords, adresse) */
    location?: string
    /** Coords résolues server-side → utilisées pour LocationMap + buttons */
    locationResolved?: { lat: number; lng: number; displayName?: string }
  }
  program?: ProgramStep[]
  dayAfter?: { enabled?: boolean; date?: string; time?: string; venueName?: string; mapsUrl?: string; wazeUrl?: string; description?: string }
  travel?: { airports?: string[]; hotels?: { name: string; mapsUrl?: string; promoCode?: string; priceRange?: string }[]; notes?: string }
  registry?: { label: string; url: string }[]
  dressCode?: string
  /** Compte à rebours jusqu'au grand jour. */
  countdown?: { enabled?: boolean; targetDate?: string; variant?: CountdownVariant; label?: string }
  /** Toggles de visibilité (œil user) — si false, la section est masquée sur le site rendu. */
  visibility?: Partial<Record<"heroDate" | "heroVenue" | "welcomeNote" | "program" | "dressCode" | "rsvp" | "countdown", boolean>>
  welcomeNote?: string
  rsvp?: { deadline?: string; allowPlusOne?: boolean }
  /** Overrides visuels utilisateurs (pattern choisi manuellement dans l'éditeur). */
  style?: { pattern?: string; rotation?: number; dense?: boolean }
}

type Props = {
  slug: string
  mood: MoodId
  palette: Palette
  content: MariageContent
  heroImageUrl?: string | null
  photos?: PhotoItem[]
}

export default function MariageTemplate({ slug, mood, palette, content, heroImageUrl, photos = [] }: Props) {
  const shaderParams = generateShaderParams(slug)
  const decoratifParams = overrideDecoratifParams(
    generateDecoratifParams(slug),
    content.style && typeof content.style === "object"
      ? { pattern: content.style.pattern as never, rotation: content.style.rotation, dense: content.style.dense }
      : null,
  )
  const editorialParams = generateEditorialParams(slug)

  const hero = content.hero ?? {}
  const heroTitle = hero.title || "Notre mariage"
  const hasDayAfter = Boolean(content.dayAfter?.enabled)
  const isVisible = (key: "heroDate" | "heroVenue" | "welcomeNote" | "program" | "dressCode" | "rsvp" | "countdown") =>
    content.visibility?.[key] !== false

  const navItems: NavItem[] = [
    { id: "top",       label: "Accueil" },
    ...(content.couple?.story  ? [{ id: "histoire",   label: "Notre histoire" } as NavItem] : []),
    ...(content.mainEvent && isVisible("heroVenue")       ? [{ id: "ceremonie",  label: "Cérémonie"      } as NavItem] : []),
    ...(content.countdown?.enabled && content.countdown?.targetDate && isVisible("countdown") ? [{ id: "countdown", label: "Compte à rebours" } as NavItem] : []),
    ...(content.program?.length && isVisible("program") ? [{ id: "programme",  label: "Programme"      } as NavItem] : []),
    ...(content.travel?.hotels?.length ? [{ id: "voyage", label: "Voyage"      } as NavItem] : []),
    ...(isVisible("rsvp") ? [{ id: "rsvp", label: "RSVP" } as NavItem] : []),
  ]

  return (
    <main style={{ color: "var(--evt-text)", fontFamily: "var(--evt-font-body)" }}>
      <SiteNav title={heroTitle} items={navItems} />

      <div id="top" />
      {/* Hero */}
      <HeroSection
        title={heroTitle}
        subtitle={hero.subtitle}
        date={isVisible("heroDate") ? hero.date : null}
        venueName={isVisible("heroVenue") ? hero.venue : null}
        mood={mood}
        palette={palette}
        heroImageUrl={heroImageUrl}
        shaderParams={shaderParams}
        decoratifParams={decoratifParams}
        editorialParams={editorialParams}
        bgVariant={
          (content.style as { animationIntensity?: string } | undefined)?.animationIntensity === "none" ? "still"
          : (content.style as { animationIntensity?: string } | undefined)?.animationIntensity === "subtle" ? "still"
          : (content.style as { animationIntensity?: string } | undefined)?.animationIntensity === "festive" ? "rich"
          : "drift"
        }
        suppressInnerPattern={(content.style as { patternFullPage?: boolean } | undefined)?.patternFullPage === true}
        customPatternOpacity={(content.style as { patternOpacity?: number } | undefined)?.patternOpacity}
      />

      {/* Countdown — entre hero et welcome note */}
      {content.countdown?.enabled && content.countdown?.targetDate && isVisible("countdown") && (
        <Reveal as="section" id="countdown">
          <Countdown
            targetDate={content.countdown.targetDate}
            variant={content.countdown.variant ?? "grand"}
            label={content.countdown.label}
          />
        </Reveal>
      )}

      {/* Mot d'accueil */}
      {content.welcomeNote && isVisible("welcomeNote") && (
        <Reveal as="section" style={{ ...sectionCentered, maxWidth: 580 }}>
          <p style={welcomeStyle}>{dropcap(content.welcomeNote)}</p>
        </Reveal>
      )}

      {/* Notre histoire */}
      {content.couple?.story && (
        <>
          <SectionDivider variant="ornament" />
          <Reveal as="section" id="histoire" style={sectionCentered}>
            <h2 style={h2Style}>Notre histoire</h2>
            <p style={bodyStyle}>{dropcap(content.couple.story)}</p>
          </Reveal>
        </>
      )}

      {/* Événement principal */}
      {content.mainEvent && (
        <>
          <SectionDivider variant="leaf" />
          <Reveal as="section" id="ceremonie" style={sectionCentered}>
          <div style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--evt-main)", fontWeight: 600, marginBottom: 12 }}>
            {content.mainEvent.time ? `· ${content.mainEvent.time} ·` : "· Cérémonie ·"}
          </div>
          <h2 style={h2Style}>{content.mainEvent.venueName || "Notre lieu"}</h2>
          {content.mainEvent.description && <p style={bodyStyle}>{content.mainEvent.description}</p>}

          {content.mainEvent.locationResolved && (
            <div style={{ maxWidth: 720, margin: "28px auto 0" }}>
              <LocationMap
                lat={content.mainEvent.locationResolved.lat}
                lng={content.mainEvent.locationResolved.lng}
                venueName={content.mainEvent.venueName}
                height={360}
              />
            </div>
          )}

          {(content.mainEvent.mapsUrl || content.mainEvent.wazeUrl) && content.mainEvent.venueName && (
            <div style={{ marginTop: 20 }}>
              <MapLinks venueName={content.mainEvent.venueName} mapsUrl={content.mainEvent.mapsUrl} wazeUrl={content.mainEvent.wazeUrl} />
            </div>
          )}
          </Reveal>
        </>
      )}

      {/* Programme timeline */}
      {content.program && content.program.length > 0 && isVisible("program") && (
        <>
          <SectionDivider variant="dot-line" />
          <Reveal as="section" id="programme">
            <ProgramTimeline steps={content.program} title="Programme" />
          </Reveal>
        </>
      )}

      {/* Day-after */}
      {hasDayAfter && content.dayAfter && (
        <section style={{ ...sectionCentered, background: "var(--evt-secondary)", margin: "40px -24px", padding: "60px 24px" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--evt-main)", fontWeight: 600, marginBottom: 12 }}>
            · Day-after ·
          </div>
          <h2 style={h2Style}>{content.dayAfter.date} {content.dayAfter.time ? `— ${content.dayAfter.time}` : ""}</h2>
          {content.dayAfter.description && <p style={bodyStyle}>{content.dayAfter.description}</p>}
          {(content.dayAfter.mapsUrl || content.dayAfter.wazeUrl) && content.dayAfter.venueName && (
            <div style={{ marginTop: 18 }}>
              <MapLinks venueName={content.dayAfter.venueName} mapsUrl={content.dayAfter.mapsUrl} wazeUrl={content.dayAfter.wazeUrl} />
            </div>
          )}
        </section>
      )}

      {/* Dress code */}
      {content.dressCode && isVisible("dressCode") && (
        <Reveal as="section" style={{ ...sectionCentered, paddingTop: 56, paddingBottom: 56, maxWidth: 580 }}>
          <div style={{
            fontFamily: "var(--evt-font-body)",
            fontSize: 11,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "var(--evt-main)",
            fontWeight: 600,
            marginBottom: 14,
          }}>· Dress code ·</div>
          <p style={bodyStyle}>{content.dressCode}</p>
        </Reveal>
      )}

      {/* Voyage & hôtels */}
      {content.travel?.hotels && content.travel.hotels.length > 0 && (
        <>
          <SectionDivider variant="leaf" />
          <Reveal as="section" id="voyage" style={sectionCentered}>
            <h2 style={h2Style}>Hébergement</h2>
            {content.travel.notes && <p style={{ ...bodyStyle, marginBottom: 28 }}>{content.travel.notes}</p>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, textAlign: "left" }}>
            {content.travel.hotels.map((h, i) => (
              <div key={i} style={{
                padding: "20px 18px", borderRadius: 14,
                border: "1px solid color-mix(in srgb, var(--evt-main) 30%, transparent)",
                background: "var(--evt-bg)",
              }}>
                <div style={{ fontFamily: "var(--evt-font-heading)", fontSize: 18, fontWeight: 500, color: "var(--evt-text)", marginBottom: 8 }}>{h.name}</div>
                {h.priceRange && <div style={{ fontSize: 12, color: "var(--evt-text-muted)", marginBottom: 4 }}>{h.priceRange}</div>}
                {h.promoCode && (
                  <div style={{ fontSize: 12, color: "var(--evt-main)", marginBottom: 10 }}>
                    Code: <strong>{h.promoCode}</strong>
                  </div>
                )}
                {h.mapsUrl && <MapLinks venueName={h.name} mapsUrl={h.mapsUrl} wazeUrl={null} />}
              </div>
            ))}
          </div>
          </Reveal>
        </>
      )}

      {/* Registre cadeaux */}
      {content.registry && content.registry.length > 0 && (
        <Reveal as="section" style={sectionCentered}>
          <h2 style={h2Style}>Liste de cadeaux</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginTop: 18 }}>
            {content.registry.map((r, i) => (
              <a
                key={i}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "12px 22px",
                  borderRadius: 999,
                  border: "1px solid var(--evt-main)",
                  color: "var(--evt-main)",
                  fontSize: 13,
                  fontWeight: 500,
                  textDecoration: "none",
                  fontFamily: "var(--evt-font-body)",
                }}
              >
                {r.label} →
              </a>
            ))}
          </div>
        </Reveal>
      )}

      {/* Galerie photos */}
      {photos.length > 0 && (
        <Reveal as="section">
          <h2 style={{ ...h2Style, textAlign: "center", marginBottom: 20 }}>Galerie</h2>
          <PhotoGallery photos={photos} layout="grid" />
        </Reveal>
      )}

      {/* RSVP — full-bleed background, contenu centré */}
      {isVisible("rsvp") && (
      <section id="rsvp" style={{ marginTop: 40, background: "var(--evt-secondary)", borderTop: "3px solid var(--evt-main)", borderBottom: "3px solid var(--evt-main)", padding: "80px 24px 100px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
        <h2 style={h2Style}>Confirmez votre présence</h2>
        <RsvpForm
          slug={slug}
          hasDayAfter={hasDayAfter}
          allowPlusOne={content.rsvp?.allowPlusOne ?? true}
          deadline={content.rsvp?.deadline ?? null}
          accentColor={palette.main}
        />
        </div>
      </section>
      )}

      {/* Footer minimal */}
      <footer style={{ padding: "32px 24px", textAlign: "center", fontSize: 11, color: "var(--evt-text-muted)", fontFamily: "var(--evt-font-body)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
        · créé avec <a href="https://momentoevents.app" style={{ color: "var(--evt-main)", textDecoration: "none" }}>Momento</a> ·
      </footer>
    </main>
  )
}

const sectionCentered: React.CSSProperties = {
  padding: "80px 24px",
  maxWidth: 720,
  margin: "0 auto",
  textAlign: "center",
}

const h2Style: React.CSSProperties = {
  fontFamily: "var(--evt-font-heading)",
  fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
  fontWeight: 600,
  letterSpacing: "-0.02em",
  margin: "0 0 20px",
  color: "var(--evt-main)",
}

const bodyStyle: React.CSSProperties = {
  fontFamily: "var(--evt-font-body)",
  fontSize: "clamp(0.95rem, 1.3vw, 1.05rem)",
  lineHeight: 1.75,
  color: "var(--evt-text-muted)",
  margin: 0,
  maxWidth: 560,
  marginLeft: "auto",
  marginRight: "auto",
}

/** Transforme la 1re lettre en dropcap avec un <span> — effet initiale de magazine. */
function dropcap(text: string): React.ReactNode {
  if (!text) return text
  const first = text.charAt(0)
  const rest = text.slice(1)
  return (
    <>
      <span style={{
        float: "left",
        fontFamily: "var(--evt-font-heading)",
        fontSize: "3.4em",
        lineHeight: 0.85,
        paddingRight: "10px",
        paddingTop: "4px",
        color: "var(--evt-main)",
        fontWeight: 500,
      }}>{first}</span>
      {rest}
    </>
  )
}

const welcomeStyle: React.CSSProperties = {
  fontFamily: "var(--evt-font-heading)",
  fontStyle: "italic",
  fontSize: "clamp(1.1rem, 2vw, 1.4rem)",
  lineHeight: 1.6,
  color: "var(--evt-text)",
  margin: 0,
  maxWidth: 600,
  marginLeft: "auto",
  marginRight: "auto",
  textAlign: "center",
}
