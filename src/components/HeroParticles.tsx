"use client"

import { useEffect, useRef } from "react"

interface Dot {
  x: number; y: number
  vx: number; vy: number
  r: number; alpha: number
}

type Light = {
  x: number; y: number
  dx: number; dy: number
  color: [number, number, number]
  alpha: number; pulse: number; ps: number
}

export default function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let W = 0, H = 0, animId: number
    const mouse = { x: -9999, y: -9999 }
    let dots: Dot[] = []

    const lights: Light[] = [
      { x: 0.20, y: 0.35, dx: 0.00018, dy: 0.00012, color: [210, 165, 90], alpha: 0.12, pulse: 0,              ps: 0.0008 },
      { x: 0.78, y: 0.22, dx: -0.00014, dy: 0.00016, color: [196, 83, 42],  alpha: 0.09, pulse: Math.PI * 0.7, ps: 0.0006 },
      { x: 0.55, y: 0.80, dx: 0.00010, dy: -0.00014, color: [180, 140, 70], alpha: 0.08, pulse: Math.PI * 1.3, ps: 0.0007 },
    ]

    function resize() {
      if (!canvas) return
      W = canvas.offsetWidth
      H = canvas.offsetHeight
      canvas.width  = W * window.devicePixelRatio
      canvas.height = H * window.devicePixelRatio
      ctx!.scale(window.devicePixelRatio, window.devicePixelRatio)
      initDots()
    }

    function initDots() {
      const count = Math.min(65, Math.floor(W * H / 15000))
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.32,
        vy: (Math.random() - 0.5) * 0.32,
        r: Math.random() * 1.2 + 0.4,
        alpha: Math.random() * 0.3 + 0.1,
      }))
    }

    function draw() {
      animId = requestAnimationFrame(draw)
      ctx!.clearRect(0, 0, W, H)

      // Ambient light sources
      lights.forEach(l => {
        l.x += l.dx; l.y += l.dy
        if (l.x < 0.05 || l.x > 0.95) l.dx *= -1
        if (l.y < 0.05 || l.y > 0.95) l.dy *= -1
        l.pulse += l.ps
        const a  = l.alpha * (0.75 + 0.25 * Math.sin(l.pulse))
        const cx = l.x * W, cy = l.y * H
        const r  = Math.min(W, H) * 0.65
        const g  = ctx!.createRadialGradient(cx, cy, 0, cx, cy, r)
        const [r1, g1, b1] = l.color
        g.addColorStop(0,    `rgba(${r1},${g1},${b1},${a})`)
        g.addColorStop(0.45, `rgba(${r1},${g1},${b1},${a * 0.3})`)
        g.addColorStop(1,    `rgba(${r1},${g1},${b1},0)`)
        ctx!.beginPath()
        ctx!.arc(cx, cy, r, 0, Math.PI * 2)
        ctx!.fillStyle = g
        ctx!.fill()
      })

      // Connection lines between nearby dots
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx   = dots[i].x - dots[j].x
          const dy   = dots[i].y - dots[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 115) {
            ctx!.beginPath()
            ctx!.strokeStyle = `rgba(217,107,58,${0.13 * (1 - dist / 115)})`
            ctx!.lineWidth   = 0.5
            ctx!.moveTo(dots[i].x, dots[i].y)
            ctx!.lineTo(dots[j].x, dots[j].y)
            ctx!.stroke()
          }
        }
      }

      // Dots + cursor repulsion
      dots.forEach(d => {
        d.x += d.vx; d.y += d.vy
        if (d.x < 0 || d.x > W) d.vx *= -1
        if (d.y < 0 || d.y > H) d.vy *= -1

        const dx   = d.x - mouse.x
        const dy   = d.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 140 && dist > 0) {
          const force = (140 - dist) / 140
          d.x += (dx / dist) * force * 2.8
          d.y += (dy / dist) * force * 2.8
        }

        ctx!.beginPath()
        ctx!.arc(d.x, d.y, d.r, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(217,107,58,${d.alpha})`
        ctx!.fill()
      })

      // Vignette
      const vg = ctx!.createRadialGradient(W / 2, H / 2, H * 0.15, W / 2, H / 2, H)
      vg.addColorStop(0,   "rgba(26,18,8,0)")
      vg.addColorStop(0.6, "rgba(26,18,8,0.18)")
      vg.addColorStop(1,   "rgba(26,18,8,0.72)")
      ctx!.fillStyle = vg
      ctx!.fillRect(0, 0, W, H)
    }

    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }

    resize()
    window.addEventListener("resize", resize)
    window.addEventListener("mousemove", onMouseMove)
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", onMouseMove)
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
