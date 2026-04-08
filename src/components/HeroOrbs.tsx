"use client"

import { useEffect, useRef } from "react"

// Floating 3D orbs/particles rendered on canvas
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
      canvas.width = W * window.devicePixelRatio
      canvas.height = H * window.devicePixelRatio
      ctx!.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    // Orb data
    const ORBS = [
      { x: 0.15, y: 0.25, r: 80, color: "rgba(196,83,42,0.12)", dx: 0.18, dy: 0.12, phase: 0 },
      { x: 0.82, y: 0.15, r: 120, color: "rgba(196,83,42,0.07)", dx: -0.14, dy: 0.18, phase: 1 },
      { x: 0.68, y: 0.72, r: 90, color: "rgba(196,83,42,0.10)", dx: 0.10, dy: -0.15, phase: 2 },
      { x: 0.25, y: 0.70, r: 60, color: "rgba(196,83,42,0.08)", dx: -0.12, dy: -0.10, phase: 0.5 },
      { x: 0.50, y: 0.10, r: 50, color: "rgba(196,83,42,0.06)", dx: 0.08, dy: 0.20, phase: 1.5 },
    ]

    // Particles
    const N = 28
    type Particle = { x: number; y: number; r: number; alpha: number; dx: number; dy: number; twinkle: number }
    const particles: Particle[] = Array.from({ length: N }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.5 + 0.4,
      alpha: Math.random() * 0.4 + 0.1,
      dx: (Math.random() - 0.5) * 0.04,
      dy: (Math.random() - 0.5) * 0.04,
      twinkle: Math.random() * Math.PI * 2,
    }))

    let t = 0

    function draw() {
      if (!ctx) return
      ctx.clearRect(0, 0, W, H)

      // Orbs
      ORBS.forEach(o => {
        const px = ((o.x * W + Math.sin(t * o.dx + o.phase) * 60) % W + W) % W
        const py = ((o.y * H + Math.cos(t * o.dy + o.phase) * 40) % H + H) % H

        const grad = ctx.createRadialGradient(px, py, 0, px, py, o.r)
        grad.addColorStop(0, o.color.replace("0.", "0.").replace(/[\d.]+\)$/, m => `${parseFloat(m) * 1.5})`))
        grad.addColorStop(1, "rgba(196,83,42,0)")
        ctx.beginPath()
        ctx.arc(px, py, o.r, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
      })

      // Particles
      particles.forEach(p => {
        p.x += p.dx * 0.01
        p.y += p.dy * 0.01
        if (p.x < 0) p.x = 1
        if (p.x > 1) p.x = 0
        if (p.y < 0) p.y = 1
        if (p.y > 1) p.y = 0
        p.twinkle += 0.02

        const alpha = p.alpha * (0.6 + 0.4 * Math.sin(p.twinkle))
        ctx.beginPath()
        ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(196,83,42,${alpha})`
        ctx.fill()
      })

      // Subtle connection lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = (particles[i].x - particles[j].x) * W
          const dy = (particles[i].y - particles[j].y) * H
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x * W, particles[i].y * H)
            ctx.lineTo(particles[j].x * W, particles[j].y * H)
            ctx.strokeStyle = `rgba(196,83,42,${0.06 * (1 - dist / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      t += 0.008
      animId = requestAnimationFrame(draw)
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
      style={{ opacity: 0.7 }}
      aria-hidden
    />
  )
}
