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
  heroImageUrl, shaderParams, decoratifParams, editorialParams,
}: Props) {
  const isDark = mood === "shader"
  // Photo uploadée → fond sombre derrière la typo → texte blanc forcé
  const overPhoto = Boolean(heroImageUrl)
  const textColor = isDark || overPhoto ? "#fff" : palette.text
  const mutedColor = isDark || overPhoto ? "rgba(255,255,255,0.82)" : palette.textMuted

  return (
    <section
      style={{
        position: "relative",
        minHeight: "min(100vh, 780px)",
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
          <div aria-hidden style={{
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
          {mood === "decoratif" && decoratifParams && (
            <div style={{ position: "absolute", inset: 0, zIndex: 2, mixBlendMode: "overlay", opacity: 0.5 }}>
              <DecoratifBackground params={decoratifParams} colorMain={palette.main} colorAccent={palette.accent} colorBg="transparent" intensity={0.7} />
            </div>
          )}
        </>
      ) : (
        <>
          {mood === "shader" && shaderParams && (
            <ShaderBackground params={shaderParams} colorMain={palette.main} colorAccent={palette.accent} colorBg={palette.darkBg ?? "#0d0e14"} />
          )}
          {mood === "decoratif" && decoratifParams && (
            <DecoratifBackground params={decoratifParams} colorMain={palette.main} colorAccent={palette.accent} colorBg={palette.bg} />
          )}
          {mood === "editorial" && editorialParams && (
            <EditorialBackground params={editorialParams} heroImageUrl={heroImageUrl} colorBg={palette.bg} colorText={palette.text} />
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
            fontSize: 11,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: mutedColor,
            marginBottom: 20,
          }}>
            · {date} ·
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

        {subtitle && (
          <p style={{
            fontFamily: "var(--evt-font-body)",
            fontSize: "clamp(0.85rem, 1.4vw, 1rem)",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: mutedColor,
            marginTop: 24,
            fontWeight: 500,
          }}>
            {subtitle}
          </p>
        )}

        {venueName && (
          <p style={{
            fontFamily: "var(--evt-font-heading)",
            fontStyle: "italic",
            fontSize: "clamp(1rem, 2vw, 1.4rem)",
            color: mutedColor,
            marginTop: 30,
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
        fontSize: 10,
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
