"use client"
import { useEffect, useRef } from "react"

// Palette alignée sur le hero (WORDS) + gradient brand
const COLORS = [
  "#E11D48", // rose brand
  "#9333EA", // violet brand
  "#BE185D", // rose foncé
  "#EC4899", // pink
  "#F59E0B", // amber
  "#A855F7", // purple
  "#6366F1", // indigo
  "#FDE68A", // highlight étincelle
]

type Rocket = {
  xStart: number
  yStart: number
  xTarget: number
  yTarget: number
  tStart: number
  duration: number   // ms — variable par fusée (vitesse différente)
  color: string
  trail: { x: number; y: number }[]
}

type Spark = {
  x: number
  y: number
  vx: number
  vy: number
  life: number      // 0..1, décroît
  maxLife: number   // ms
  color: string
  size: number
}

// Physique des étincelles — gravité douce + drag fort pour que ça flotte longtemps
const SPARK_GRAVITY = 0.012
const SPARK_DRAG    = 0.992
const TRAIL_LEN     = 14

// easeOutQuad — décélération douce quand la fusée approche du sommet
const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t)

export default function AntFireworks({
  minInterval = 1600,
  maxInterval = 3200,
  sparkCount  = 280,   // 3× confetti précédent (~90)
  className   = "",
}: {
  minInterval?: number
  maxInterval?: number
  sparkCount?: number
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener("resize", resize)

    const rockets: Rocket[] = []
    const sparks: Spark[] = []
    let raf = 0
    let launchTimer: ReturnType<typeof setTimeout> | undefined

    const rand = (a: number, b: number) => a + Math.random() * (b - a)
    const pickColor = () => COLORS[Math.floor(Math.random() * COLORS.length)]

    const launch = () => {
      const W = canvas.offsetWidth
      const H = canvas.offsetHeight
      const xStart  = rand(W * 0.08, W * 0.92)
      const yStart  = H + 10
      const xTarget = xStart + rand(-W * 0.05, W * 0.05)   // léger décalage horizontal
      const yTarget = rand(H * 0.08, H * 0.45)
      const duration = rand(3000, 5200)                     // ≥ 3 s garanti
      rockets.push({
        xStart, yStart, xTarget, yTarget,
        tStart: performance.now(),
        duration,
        color: pickColor(),
        trail: [],
      })
      scheduleNext()
    }

    const scheduleNext = () => {
      const delay = rand(minInterval, maxInterval)
      launchTimer = setTimeout(launch, delay)
    }

    const explode = (x: number, y: number, baseColor: string) => {
      // Zone d'expansion ≥ 2× : vitesse initiale ~ 2× précédemment (était 2.2–5.5)
      for (let i = 0; i < sparkCount; i++) {
        const angle = rand(0, Math.PI * 2)
        // Distribution en anneau + spray radial → couvre une large surface
        const speed = rand(4.5, 11.5)
        const maxLife = rand(18000, 24000)   // ≥ 20 s (min 18 s visuels)
        sparks.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          maxLife,
          color:
            Math.random() < 0.12 ? "#FFFFFF"
            : Math.random() < 0.55 ? baseColor
            : pickColor(),
          size: rand(1.8, 3.4),
        })
      }
    }

    let lastTs = performance.now()
    const draw = (ts: number) => {
      const dt = Math.min(48, ts - lastTs)
      lastTs = ts
      const W = canvas.offsetWidth
      const H = canvas.offsetHeight
      ctx.clearRect(0, 0, W, H)

      // ── Fusées (montée parametrée en temps) ──
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i]
        const p = (ts - r.tStart) / r.duration
        if (p >= 1) {
          explode(r.xTarget, r.yTarget, r.color)
          rockets.splice(i, 1)
          continue
        }
        const eased = easeOutQuad(p)
        const x = r.xStart + (r.xTarget - r.xStart) * eased
        const y = r.yStart + (r.yTarget - r.yStart) * eased

        r.trail.push({ x, y })
        if (r.trail.length > TRAIL_LEN) r.trail.shift()

        // Traînée
        for (let t = 0; t < r.trail.length; t++) {
          const tp = r.trail[t]
          const alpha = (t / r.trail.length) * 0.75
          ctx.globalAlpha = alpha
          ctx.fillStyle = r.color
          ctx.beginPath()
          ctx.arc(tp.x, tp.y, 1.8, 0, Math.PI * 2)
          ctx.fill()
        }
        // Tête de fusée
        ctx.globalAlpha = 1
        ctx.fillStyle = "#FFFFFF"
        ctx.beginPath()
        ctx.arc(x, y, 2.4, 0, Math.PI * 2)
        ctx.fill()
      }

      // ── Étincelles (vie longue ~20s, flottement doux) ──
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]
        s.life -= dt / s.maxLife
        if (s.life <= 0) {
          sparks.splice(i, 1)
          continue
        }
        s.vx *= SPARK_DRAG
        s.vy *= SPARK_DRAG
        s.vy += SPARK_GRAVITY
        s.x += s.vx
        s.y += s.vy

        // Courbe d'opacité : reste brillant longtemps, fade sur les derniers 30% de vie
        const fade = s.life > 0.3 ? 1 : s.life / 0.3

        ctx.globalAlpha = Math.max(0, fade)
        ctx.fillStyle = s.color
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
        ctx.fill()

        // Halo
        ctx.globalAlpha = Math.max(0, fade * 0.22)
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.size * 2.6, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      raf = requestAnimationFrame(draw)
    }

    // Respect reduced-motion
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (!mq.matches) {
      raf = requestAnimationFrame(draw)
      scheduleNext()
    }

    return () => {
      cancelAnimationFrame(raf)
      if (launchTimer) clearTimeout(launchTimer)
      window.removeEventListener("resize", resize)
    }
  }, [minInterval, maxInterval, sparkCount])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 5,
        mixBlendMode: "screen",
      }}
    />
  )
}
