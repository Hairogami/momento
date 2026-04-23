"use client"

import MapLinks from "./MapLinks"

export type ProgramStep = {
  id?: string
  time: string // "17h00"
  label: string // "Cérémonie"
  venueName?: string | null
  mapsUrl?: string | null
  wazeUrl?: string | null
  description?: string | null
}

type Props = {
  steps: ProgramStep[]
  title?: string
}

/**
 * Timeline verticale minimaliste pour le programme de l'événement.
 * Chaque étape peut avoir son propre lieu (Maps + Waze).
 */
export default function ProgramTimeline({ steps, title = "Programme" }: Props) {
  if (steps.length === 0) return null

  return (
    <section style={{ padding: "80px 24px", maxWidth: 720, margin: "0 auto", position: "relative" }}>
      <h2 style={{
        fontFamily: "var(--evt-font-heading)",
        fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
        fontWeight: 500,
        letterSpacing: "-0.02em",
        textAlign: "center",
        margin: "0 0 56px",
        color: "var(--evt-text)",
      }}>{title}</h2>

      <div style={{ position: "relative", paddingLeft: 40 }}>
        {/* Ligne verticale */}
        <div style={{
          position: "absolute",
          left: 14,
          top: 8,
          bottom: 8,
          width: 1,
          background: "var(--evt-main)",
          opacity: 0.35,
        }} />

        {steps.map((step, i) => (
          <div key={step.id ?? i} style={{ position: "relative", marginBottom: i === steps.length - 1 ? 0 : 40 }}>
            {/* Point de timeline */}
            <div style={{
              position: "absolute",
              left: -32,
              top: 8,
              width: 15,
              height: 15,
              borderRadius: "50%",
              background: "var(--evt-bg)",
              border: "2px solid var(--evt-main)",
              boxShadow: "0 0 0 4px var(--evt-bg)",
            }} />

            <div style={{
              fontFamily: "var(--evt-font-body)",
              fontSize: 11,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "var(--evt-main)",
              fontWeight: 600,
              marginBottom: 8,
            }}>{step.time}</div>

            <h3 style={{
              fontFamily: "var(--evt-font-heading)",
              fontSize: "clamp(1.3rem, 2.5vw, 1.7rem)",
              fontWeight: 500,
              letterSpacing: "-0.01em",
              color: "var(--evt-text)",
              margin: "0 0 6px",
            }}>{step.label}</h3>

            {step.venueName && (
              <p style={{
                fontFamily: "var(--evt-font-heading)",
                fontStyle: "italic",
                fontSize: 15,
                color: "var(--evt-text-muted)",
                margin: "0 0 12px",
              }}>{step.venueName}</p>
            )}

            {step.description && (
              <p style={{
                fontFamily: "var(--evt-font-body)",
                fontSize: 14,
                color: "var(--evt-text-muted)",
                margin: "0 0 14px",
                lineHeight: 1.65,
              }}>{step.description}</p>
            )}

            {(step.mapsUrl || step.wazeUrl) && step.venueName && (
              <MapLinks venueName={step.venueName} mapsUrl={step.mapsUrl} wazeUrl={step.wazeUrl} label="Voir l'itinéraire" />
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
