"use client"
import { useEffect, useRef } from "react"

const COLORS_LIGHT = ["#C4B5FD","#A5B4FC","#93C5FD","#6EE7B7","#FDE68A","#F9A8D4","#DDD6FE","#BAE6FD"]
const COLORS_DARK  = ["#3B82F6","#60A5FA","#93C5FD","#1D4ED8","#2563EB","#818CF8","#38BDF8"]

interface Particle {
  x: number; y: number; w: number; h: number
  angle: number; color: string; opacity: number
  vx: number; vy: number; va: number
}

function makeParticles(w: number, h: number, count: number, dark: boolean): Particle[] {
  const colors = dark ? COLORS_DARK : COLORS_LIGHT
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    w: Math.random() * 4 + 2,
    h: Math.random() * 7 + 3,
    angle: Math.random() * Math.PI * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    opacity: dark ? Math.random() * 0.8 + 0.2 : Math.random() * 0.55 + 0.15,
    vx: (Math.random() - 0.5) * 0.18,
    vy: (Math.random() - 0.5) * 0.18,
    va: (Math.random() - 0.5) * 0.004,
  }))
}

export default function AntConfetti({
  count = 160,
  dark = false,
  className = "",
}: { count?: number; dark?: boolean; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width  = canvas.offsetWidth  * dpr
      canvas.height = canvas.offsetHeight * dpr
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener("resize", resize)

    let particles = makeParticles(canvas.offsetWidth, canvas.offsetHeight, count, dark)
    let raf: number

    const draw = () => {
      const W = canvas.offsetWidth, H = canvas.offsetHeight
      ctx.clearRect(0, 0, W, H)
      particles.forEach(p => {
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.angle)
        ctx.globalAlpha = p.opacity
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
        p.x += p.vx; p.y += p.vy; p.angle += p.va
        if (p.x < -10) p.x = W + 10
        if (p.x > W + 10) p.x = -10
        if (p.y < -10) p.y = H + 10
        if (p.y > H + 10) p.y = -10
      })
      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize) }
  }, [count, dark])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  )
}
