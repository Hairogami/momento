"use client"

import { useEffect, useRef } from "react"

export default function HeroOrbs() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number
    let W = 0, H = 0

    function resize() {
      if (!canvas) return
      W = canvas.offsetWidth
      H = canvas.offsetHeight
      canvas.width  = W * window.devicePixelRatio
      canvas.height = H * window.devicePixelRatio
      ctx!.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    // Three slow-drifting light sources — warm gold & terracotta
    const lights = [
      {
        x: 0.20, y: 0.35,
        driftX: 0.00018, driftY: 0.00012,
        r: () => Math.min(W, H) * 0.75,
        color: [210, 165, 90] as [number,number,number],
        baseAlpha: 0.13,
        pulse: 0, pulseSpeed: 0.0008,
      },
      {
        x: 0.78, y: 0.22,
        driftX: -0.00014, driftY: 0.00016,
        r: () => Math.min(W, H) * 0.65,
        color: [196, 83, 42] as [number,number,number],
        baseAlpha: 0.09,
        pulse: Math.PI * 0.7, pulseSpeed: 0.0006,
      },
      {
        x: 0.55, y: 0.80,
        driftX: 0.00010, driftY: -0.00014,
        r: () => Math.min(W, H) * 0.55,
        color: [180, 140, 70] as [number,number,number],
        baseAlpha: 0.08,
        pulse: Math.PI * 1.3, pulseSpeed: 0.0007,
      },
    ]

    let frameCount = 0
    function draw() {
      animId = requestAnimationFrame(draw)
      frameCount++
      if (frameCount % 2 !== 0) return // throttle ~30fps
      if (!ctx) return
      ctx.clearRect(0, 0, W, H)

      lights.forEach(l => {
        // Slow continuous drift — bounce off edges
        l.x += l.driftX
        l.y += l.driftY
        if (l.x < 0.05 || l.x > 0.95) l.driftX *= -1
        if (l.y < 0.05 || l.y > 0.95) l.driftY *= -1

        // Gentle pulse
        l.pulse += l.pulseSpeed
        const alpha = l.baseAlpha * (0.75 + 0.25 * Math.sin(l.pulse))

        const cx = l.x * W
        const cy = l.y * H
        const r  = l.r()

        const g = ctx!.createRadialGradient(cx, cy, 0, cx, cy, r)
        const [r1, g1, b1] = l.color
        g.addColorStop(0,    `rgba(${r1},${g1},${b1},${alpha})`)
        g.addColorStop(0.45, `rgba(${r1},${g1},${b1},${alpha * 0.3})`)
        g.addColorStop(1,    `rgba(${r1},${g1},${b1},0)`)

        ctx!.beginPath()
        ctx!.arc(cx, cy, r, 0, Math.PI * 2)
        ctx!.fillStyle = g
        ctx!.fill()
      })

      // Deep vignette — darkens edges, focuses center
      const vg = ctx!.createRadialGradient(W/2, H/2, H * 0.15, W/2, H/2, H)
      vg.addColorStop(0,    "rgba(26,18,8,0)")
      vg.addColorStop(0.6,  "rgba(26,18,8,0.2)")
      vg.addColorStop(1,    "rgba(26,18,8,0.65)")
      ctx!.fillStyle = vg
      ctx!.fillRect(0, 0, W, H)

    }

    resize()
    window.addEventListener("resize", resize)
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden
    />
  )
}
