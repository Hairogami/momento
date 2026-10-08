"use client"

import type { MoodId } from "@/lib/eventSiteTokens"
import type { ShaderBgParams, DecoratifBgParams, EditorialBgParams } from "@/lib/eventSiteSeed"
import ShaderBackground from "@/components/event-site/backgrounds/ShaderBackground"
import DecoratifBackground from "@/components/event-site/backgrounds/DecoratifBackground"
import EditorialBackground from "@/components/event-site/backgrounds/EditorialBackground"

type Props = {
  title: string
  subtitle?: string | null
  date?: string | null
  venueName?: string | null
  mood: MoodId
  palette: { main: string; accent: string; bg: string; text: string; textMuted: string; darkBg?: string; darkText?: string }
  heroImageUrl?: string | null
  /** Paramètres seeded pour chaque mood — fournis par le renderer parent */
  shaderParams?: ShaderBgParams
  decoratifParams?: DecoratifBgParams
  editorialParams?: EditorialBgParams
}

export default function HeroSection({
  title, subtitle, date, venueName, mood, palette,
  heroImageUrl, shaderParams, decoratifParams, editorialParams, bgVariant = "drift", suppressInnerPattern = false, customPatternOpacity,
}: Props & { bgVariant?: "still" | "drift" | "rich"; suppressInnerPattern?: boolean; customPatternOpacity?: number }) {
  const isDark = mood === "shader"
  // Photo uploadée → fond sombre derrière la typo → texte blanc forcé
  const overPhoto = Boolean(heroImageUrl)
  const textColor = isDark || overPhoto ? "#fff" : palette.text
  const mutedColor = isDark || overPhoto ? "rgba(255,255,255,0.82)" : palette.textMuted

  return (
    <section
      style={{
        position: "relative",
        minHeight: "min(100dvh, 780px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        padding: "min(14vw, 80px) 24px",
      }}
    >
      {/* Background — priorité à la photo hero uploadée par l'user,
          sinon fallback sur le visuel du mood sélectionné */}
      {heroImageUrl ? (
        <>
          {/* Photo hero en fond */}
          <div aria-hidden className={`evt-hero-bg-${bgVariant}`} style={{
            animation: bgVariant === "rich" ? "evtHeroKenBurnsRich 22s ease-in-out infinite"
              : bgVariant === "drift" ? "evtHeroKenBurns 28s ease-in-out infinite"
              : undefined,
            willChange: bgVariant === "still" ? undefined : "transform",
            position: "absolute", inset: 0, zIndex: 0,
            backgroundImage: `url(${heroImageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }} />
          {/* Overlay sombre doux pour lisibilité de la typo */}
          <div aria-hidden style={{
            position: "absolute", inset: 0, zIndex: 1,
            background: isDark
              ? "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 100%)"
              : "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.45) 100%)",
          }} />
          {/* Pattern décoratif discret par-dessus (seulement si mood = decoratif) */}
          {mood === "decoratif" && decoratifParams && !suppressInnerPattern && (
            <div style={{
              position: "absolute", inset: 0, zIndex: 2, mixBlendMode: "overlay",
              animation: bgVariant === "still" ? undefined : "evtHeroPatternOverlay 24s ease-in-out infinite",
              willChange: bgVariant === "still" ? undefined : "transform, opacity",
            }}>
              <DecoratifBackground params={decoratifParams} colorMain={palette.main} colorAccent={palette.accent} colorBg="transparent" intensity={0.7} customOpacity={customPatternOpacity} />
            </div>
          )}
        </>
      ) : (
        <>
          {mood === "shader" && shaderParams && (
            <div aria-hidden style={{
              position: "absolute", inset: 0, zIndex: 0,
              animation: bgVariant === "rich" ? "evtHeroShaderPulse 20s ease-in-out infinite"
                : bgVariant === "drift" ? "evtHeroShaderPulse 32s ease-in-out infinite"
                : undefined,
              willChange: bgVariant === "still" ? undefined : "filter",
            }}>
              <ShaderBackground params={shaderParams} colorMain={palette.main} colorAccent={palette.accent} colorBg={palette.darkBg ?? "#0d0e14"} />
            </div>
          )}
          {mood === "decoratif" && decoratifParams && !suppressInnerPattern && (
            <div aria-hidden style={{
              position: "absolute", inset: 0, zIndex: 0,
              animation: bgVariant === "rich" ? "evtHeroDriftRich 18s ease-in-out infinite"
                : bgVariant === "drift" ? "evtHeroDrift 26s ease-in-out infinite"
                : undefined,
              willChange: bgVariant === "still" ? undefined : "transform, opacity",
            }}>
              <DecoratifBackground params={decoratifParams} colorMain={palette.main} colorAccent={palette.accent} colorBg={palette.bg} customOpacity={customPatternOpacity} />
            </div>
          )}
          {mood === "editorial" && editorialParams && (
            <div aria-hidden style={{
              position: "absolute", inset: 0, zIndex: 0,
              animation: bgVariant === "rich" ? "evtHeroDriftRich 22s ease-in-out infinite"
                : bgVariant === "drift" ? "evtHeroDrift 30s ease-in-out infinite"
                : undefined,
              willChange: bgVariant === "still" ? undefined : "transform",
            }}>
              <EditorialBackground params={editorialParams} heroImageUrl={heroImageUrl} colorBg={palette.bg} colorText={palette.text} />
            </div>
          )}
        </>
      )}

      {/* Contenu hero */}
      <div style={{
        position: "relative",
        zIndex: 2,
        textAlign: "center",
        color: textColor,
        maxWidth: 780,
      }}>
        {date && (
          <div style={{
            fontFamily: "var(--evt-font-body)",
            fontSize: "var(--text-xs)",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: mutedColor,
            marginBottom: 18,
            fontWeight: 500,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 14,
          }}>
            <span aria-hidden style={{ width: 36, height: 1, background: "var(--evt-gold)" }} />
            {date}
            <span aria-hidden style={{ width: 36, height: 1, background: "var(--evt-gold)" }} />
          </div>
        )}

        <h1 style={{
          fontFamily: "var(--evt-font-heading)",
          fontSize: "clamp(2.4rem, 7vw, 5rem)",
          fontWeight: 500,
          lineHeight: 0.95,
          letterSpacing: "-0.02em",
          margin: 0,
          color: textColor,
        }}>
          {title}
        </h1>

        <svg aria-hidden width="120" height="16" viewBox="0 0 120 16" style={{ display: "block", margin: "18px auto 0" }}>
          <line x1="0" y1="8" x2="48" y2="8" stroke="var(--evt-gold)" strokeWidth="1" />
          <line x1="72" y1="8" x2="120" y2="8" stroke="var(--evt-gold)" strokeWidth="1" />
          <path d="M60,2 L66,8 L60,14 L54,8 Z" fill="var(--evt-gold)" />
        </svg>

        {subtitle && (
          <p style={{
            fontFamily: "var(--evt-font-body)",
            fontSize: "var(--text-sm)",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: overPhoto ? "rgba(255,255,255,0.95)" : "var(--evt-main)",
            marginTop: 16,
            marginBottom: 0,
            fontWeight: 600,
          }}>
            {subtitle}
          </p>
        )}

        {venueName && (
          <p style={{
            fontFamily: "var(--evt-font-heading)",
            fontStyle: "italic",
            fontSize: "calc(var(--text-base) * var(--evt-heading-optical, 1))",
            color: mutedColor,
            marginTop: 20,
            marginBottom: 0,
            fontWeight: 400,
          }}>
            {venueName}
          </p>
        )}
      </div>

      {/* Indicateur scroll */}
      <div style={{
        position: "absolute",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        color: mutedColor,
        fontSize: "var(--text-2xs)",
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        fontFamily: "var(--evt-font-body)",
      }}>
        <span>Défiler</span>
        <span style={{ display: "block", width: 1, height: 24, background: "currentColor", opacity: 0.4 }} />
      </div>
    </section>
  )
}
