"use client"

import type { EditorialBgParams } from "@/lib/eventSiteSeed"

type Props = {
  params: EditorialBgParams
  heroImageUrl?: string | null
  colorBg?: string
  colorText?: string
  /** Opacity de l'overlay sombre qui garantit la lisibilité du texte sur la photo */
  overlayOpacity?: number
}

/**
 * Fond éditorial. Si photo hero fournie → fullscreen photo + overlay lisibilité.
 * Sinon → layout éditorial asymétrique avec blocs colorés + serif oversized.
 * Le layout (heroLayout, accentLine, columnWeight) est dérivé du seed.
 */
export default function EditorialBackground({
  params, heroImageUrl, colorBg = "#FAF3E8", colorText = "#3D2817", overlayOpacity = 0.3,
}: Props) {
  if (heroImageUrl) {
    return (
      <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroImageUrl}
          alt=""
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", objectPosition: params.heroLayout === "left" ? "left center" : params.heroLayout === "right" ? "right center" : "center",
          }}
        />
        {/* Overlay dégradé lecture */}
        <div style={{
          position: "absolute", inset: 0,
          background: params.heroLayout === "split"
            ? `linear-gradient(90deg, rgba(0,0,0,${overlayOpacity + 0.15}) 0%, rgba(0,0,0,${overlayOpacity - 0.1}) 100%)`
            : `linear-gradient(180deg, rgba(0,0,0,${overlayOpacity - 0.1}) 0%, rgba(0,0,0,${overlayOpacity + 0.25}) 100%)`,
        }} />
      </div>
    )
  }

  // Pas de photo — fallback éditorial avec bande d'accent
  const bandColor = colorText
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0, background: colorBg }}>
      {params.accentLine === "top" || params.accentLine === "both" ? (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: bandColor, opacity: 0.7 }} />
      ) : null}
      {params.accentLine === "bottom" || params.accentLine === "both" ? (
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: bandColor, opacity: 0.7 }} />
      ) : null}
      {/* Bande colorée asymétrique selon columnWeight */}
      {params.columnWeight !== "balanced" && (
        <div
          style={{
            position: "absolute",
            top: 0, bottom: 0,
            [params.heroLayout === "right" ? "right" : "left"]: 0,
            width: params.columnWeight === "major" ? "38%" : "22%",
            background: colorText,
            opacity: 0.07,
          }}
        />
      )}
    </div>
  )
}
