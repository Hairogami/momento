"use client"

import { useEffect, useState, useMemo } from "react"
import { seededRng } from "@/lib/eventSiteSeed"

type Variant = "petals" | "stars" | "confetti" | "dots"

type Props = {
  /** Seed pour positions déterministes par site */
  seed: string
  variant?: Variant
  color?: string
  /** Nombre de particules — défaut 14 */
  count?: number
}

/**
 * Particules SVG flottantes discrètes en background — montent lentement + rotation légère.
 * Respecte prefers-reduced-motion (particules statiques placées).
 * position: fixed, z-index: 0, pointer-events: none → invisible aux interactions.
 */
export default function FloatingParticles({ seed, variant = "petals", color = "var(--evt-accent)", count = 14 }: Props) {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    if (typeof window === "undefined") return
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mq.matches)
  }, [])

  const particles = useMemo(() => {
    const rng = seededRng(`particles:${seed}:${variant}`)
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.round(rng() * 100),               // % horizontal
      size: 8 + Math.round(rng() * 16),            // 8-24 px
      delay: Math.round(rng() * 20000),            // 0-20s offset
      duration: 18000 + Math.round(rng() * 14000), // 18-32s total
      rotation: Math.round(rng() * 360),
      opacity: 0.2 + rng() * 0.35,                 // 0.2 - 0.55
    }))
  }, [seed, variant, count])

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            bottom: -40,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            color,
            animation: reduced ? undefined : `evtFloat ${p.duration}ms linear ${p.delay}ms infinite`,
            transform: reduced ? `translateY(-${Math.round(p.delay / 1000 * 5)}px) rotate(${p.rotation}deg)` : undefined,
          }}
        >
          <Shape variant={variant} />
        </div>
      ))}
      <style>{`
        @keyframes evtFloat {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0;
          }
          8% { opacity: 0.5; }
          92% { opacity: 0.5; }
          100% {
            transform: translateY(-110vh) translateX(-30px) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

function Shape({ variant }: { variant: Variant }) {
  switch (variant) {
    case "petals":
      // Pétale organique — demi-cercles + pointe
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
          <path d="M12,2 C18,6 20,12 18,18 C14,22 10,22 6,18 C4,12 6,6 12,2 Z" />
        </svg>
      )
    case "stars":
      // Étoile 5 branches
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
          <path d="M12,2 L14.5,9 L22,9.5 L16,14 L18,22 L12,17.5 L6,22 L8,14 L2,9.5 L9.5,9 Z" />
        </svg>
      )
    case "confetti":
      // Rectangle oblique (confetti)
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
          <rect x="9" y="4" width="6" height="16" rx="1.5" transform="rotate(25 12 12)" />
        </svg>
      )
    case "dots":
      // Cercle simple
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
          <circle cx="12" cy="12" r="6" />
        </svg>
      )
  }
}
