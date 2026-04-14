"use client"
import { useEffect, useRef } from "react"

/* ── tuning ───────────────────────────────────────────── */
const SCALE_MIN  = 0.26
const SCALE_MAX  = 0.87   // jamais plein écran
const RADIUS_MIN = 36     // très arrondi au départ
const RADIUS_MAX = 24     // clairement arrondi au max
const LERP       = 0.09   // fluide et réactif
/* ─────────────────────────────────────────────────────── */

const smoothstep = (t: number) => t * t * (3 - 2 * t)

export default function AntVideoSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const windowRef    = useRef<HTMLDivElement>(null)
  const overlayRef   = useRef<HTMLDivElement>(null)
  const rafRef       = useRef<number>(0)
  const curScale     = useRef(SCALE_MIN)
  const curRadius    = useRef(RADIUS_MIN)

  useEffect(() => {
    const container = containerRef.current
    const win       = windowRef.current
    if (!container || !win) return

    const loop = () => {
      const rect = container.getBoundingClientRect()
      const vh   = window.innerHeight

      /*
       * Ancien déclencheur : démarre quand le container entre dans
       * le viewport PAR LE BAS (pendant que le hero est encore visible).
       *   rect.top = vh  → raw = 0  (container juste au bas du viewport)
       *   rect.top = 0   → raw = 1  (container top au haut du viewport)
       *
       * Container = 130dvh :
       *   – animation se termine exactement au début du sticky (~raw=1)
       *   – 30dvh de hold sticky → puis AntAgentFirst arrive
       */
      const raw   = Math.max(0, Math.min(1, (vh - rect.top) / vh))
      const eased = smoothstep(raw)

      const targetScale  = SCALE_MIN + (SCALE_MAX - SCALE_MIN) * eased
      const targetRadius = RADIUS_MIN + (RADIUS_MAX - RADIUS_MIN) * eased

      curScale.current  += (targetScale  - curScale.current)  * LERP
      curRadius.current += (targetRadius - curRadius.current) * LERP

      win.style.transform    = `scale(${curScale.current.toFixed(5)})`
      win.style.borderRadius = `${curRadius.current.toFixed(2)}px`
      win.style.opacity      = String(Math.min(1, raw * 5).toFixed(3))

      // Overlay text — apparaît progressivement à partir de 75% de l'animation
      if (overlayRef.current) {
        const scaleProgress = (curScale.current - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)
        const textOpacity   = Math.max(0, (scaleProgress - 0.75) / 0.25)
        overlayRef.current.style.opacity = textOpacity.toFixed(3)
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    /* 130dvh : animation termine au moment où le sticky démarre,
       puis ~30dvh de hold avant de laisser passer AntAgentFirst */
    <div ref={containerRef} style={{ height: "130dvh", position: "relative" }}>
      <div
        className="clone-video-bg"
        style={{
          position: "sticky",
          top: 0,
          height: "100dvh",
          backgroundColor: "#fff",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/*
         * Remplace le placeholder par ta vidéo :
         *   <video autoPlay muted loop playsInline
         *     src="/videos/ton-fichier.mp4"
         *     style={{ width:"100%", height:"100%", objectFit:"cover" }} />
         */}
        <div
          ref={windowRef}
          style={{
            position: "absolute",
            inset: 0,
            willChange: "transform, border-radius, opacity",
            transformOrigin: "center center",
            overflow: "hidden",
            transform: `scale(${SCALE_MIN})`,
            borderRadius: `${RADIUS_MIN}px`,
            opacity: 0,
          }}
        >
          <div style={{ width:"100%", height:"100%", background:"#000",
            display:"flex", alignItems:"center", justifyContent:"center",
            position: "relative" }}>
            <svg width="160" height="160" viewBox="0 0 220 220" fill="none">
              <defs>
                <linearGradient id="vGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%"   stopColor="#E11D48"/>
                  <stop offset="100%" stopColor="#9333EA"/>
                </linearGradient>
                <filter id="vGlow">
                  <feGaussianBlur stdDeviation="6" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              <path d="M110 20 L22 200 H64 L110 108 L156 200 H198 Z"
                fill="url(#vGrad)" filter="url(#vGlow)"/>
              <path d="M110 100 L84 162 H136 Z" fill="#000" opacity="0.65"/>
            </svg>
            <p style={{ position:"absolute", bottom:40, fontSize:11,
              color:"rgba(255,255,255,0.25)", letterSpacing:"0.12em",
              textTransform:"uppercase" }}>
              Vidéo à placer ici
            </p>

            {/* Overlay texte — apparaît au max de l'animation */}
            <div
              ref={overlayRef}
              style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "flex-end",
                paddingBottom: 80,
                opacity: 0,
                pointerEvents: "none",
              }}
            >
              <p style={{
                fontSize: "clamp(0.9rem, 2vw, 1.25rem)",
                fontWeight: 500,
                color: "rgba(255,255,255,0.85)",
                letterSpacing: "-0.01em",
                textAlign: "center",
              }}>
                1 000+ prestataires · 41 villes · Zéro commission
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
