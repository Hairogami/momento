"use client"

import type { ShaderBgParams } from "@/lib/eventSiteSeed"

type Props = {
  params: ShaderBgParams
  colorMain: string
  colorAccent: string
  colorBg?: string
  animated?: boolean
  /** Intensité 0..1 — gère l'opacity globale des blobs */
  intensity?: number
}

/**
 * Fond mesh-gradient animé avec paramètres dérivés du seed du site.
 * CSS-only (pas de WebGL) — performant et compatible ISR SSR.
 * Animation : rotation et respiration subtile des blobs.
 */
export default function ShaderBackground({
  params, colorMain, colorAccent, colorBg = "#0d0e14", animated = true, intensity = 1,
}: Props) {
  const opacity = Math.max(0.2, Math.min(1, intensity))
  const blob1 = params.blob1
  const blob2 = params.blob2

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        zIndex: 0,
        background: `
          radial-gradient(
            ellipse ${blob1.sizeX}% ${blob1.sizeY}% at ${blob1.x}% ${blob1.y}%,
            ${colorMain}${alpha(0.75 * opacity)} 0%,
            transparent 55%
          ),
          radial-gradient(
            ellipse ${blob2.sizeX}% ${blob2.sizeY}% at ${blob2.x}% ${blob2.y}%,
            ${colorAccent}${alpha(0.6 * opacity)} 0%,
            transparent 60%
          ),
          linear-gradient(${params.mainAngle}deg, ${colorBg} 0%, ${darken(colorBg, 0.4)} 100%)
        `,
        ...(animated ? { animation: `evtShaderBreathe ${12 / params.animationSpeed}s ease-in-out infinite` } : null),
      }}
    >
      {animated && (
        <style>{`
          @keyframes evtShaderBreathe {
            0%, 100% { filter: saturate(1) brightness(1); transform: scale(1); }
            50% { filter: saturate(1.1) brightness(1.05); transform: scale(1.02); }
          }
        `}</style>
      )}
    </div>
  )
}

/** Alpha hex suffix depuis un float 0..1. */
function alpha(v: number): string {
  const x = Math.round(Math.max(0, Math.min(1, v)) * 255)
  return x.toString(16).padStart(2, "0").toUpperCase()
}

/** Darken/lighten approximatif d'une couleur hex. factor > 0 = plus sombre. */
function darken(hex: string, factor: number): string {
  const m = hex.replace("#", "").match(/.{1,2}/g)
  if (!m || m.length < 3) return hex
  const [r, g, b] = m.slice(0, 3).map(h => parseInt(h, 16))
  const f = Math.max(0, Math.min(1, 1 - factor))
  return "#" + [r!, g!, b!].map(c => Math.round(c * f).toString(16).padStart(2, "0")).join("")
}
