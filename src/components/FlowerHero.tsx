'use client'

import { useEffect, useRef } from 'react'

const PETALS = [
  { event: 'Mariage',     img: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=600&fit=crop&q=80', color: '#D4A86A', accent: '#fff0cc' },
  { event: 'Studio',      img: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=600&fit=crop&q=80', color: '#a78bfa', accent: '#ede9fe' },
  { event: 'Sebou',       img: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&h=600&fit=crop&q=80', color: '#fbbf24', accent: '#fef3c7' },
  { event: 'Khtana',      img: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=600&fit=crop&q=80', color: '#34d399', accent: '#d1fae5' },
  { event: 'Soutenance',  img: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=600&fit=crop&q=80', color: '#60a5fa', accent: '#dbeafe' },
  { event: 'Corporate',   img: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=600&fit=crop&q=80', color: '#94a3b8', accent: '#f1f5f9' },
  { event: 'Anniversaire',img: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=400&h=600&fit=crop&q=80', color: '#f472b6', accent: '#fce7f3' },
  { event: 'Fiançailles', img: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&h=600&fit=crop&q=80', color: '#fb923c', accent: '#ffedd5' },
  { event: 'Décoration',  img: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=600&fit=crop&q=80', color: '#e879f9', accent: '#fae8ff' },
  { event: 'Gastronomie', img: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400&h=600&fit=crop&q=80', color: '#f97316', accent: '#fff7ed' },
]

interface Petal {
  angle: number; layer: number; detachAt: number
  color: string; accent: string; size: number; event: string
  driftAngle: number; fallDist: number; img: HTMLImageElement | null
}
interface Seed { angle: number; len: number; wobble: number }
interface Spark { x: number; y: number; vx: number; vy: number; life: number; color: string; r: number }

export default function FlowerHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    let W = 0, H = 0
    let sp = 0, rawSp = 0, smoothCY = -1
    let time = 0, animId = 0
    let finalBurst = false
    const petals: Petal[] = []
    const seeds: Seed[] = []
    const sparks: Spark[] = []

    // Preload images
    const images: Record<string, HTMLImageElement> = {}
    PETALS.forEach(p => {
      const img = new Image(); img.crossOrigin = 'anonymous'; img.src = p.img
      images[p.event] = img
    })

    function resize() {
      W = canvas!.width = window.innerWidth
      H = canvas!.height = window.innerHeight
      if (smoothCY < 0) smoothCY = H * 0.38
      init()
    }

    function init() {
      petals.length = 0; seeds.length = 0
      const N = PETALS.length // 10 petals
      // 2 layers: 5 inner (layer 0) + 5 outer (layer 1, offset 36°)
      for (let i = 0; i < N; i++) {
        const layer = i < 5 ? 0 : 1
        const idxInLayer = i < 5 ? i : i - 5
        const totalInLayer = 5
        // Inner layer starts at -90°, outer rotated 36° (half-step) for interlocking
        const baseAngle = layer === 0 ? -Math.PI / 2 : -Math.PI / 2 + Math.PI / totalInLayer
        const angle = baseAngle + (idxInLayer / totalInLayer) * Math.PI * 2
        petals.push({
          angle, layer,
          detachAt: (i / N) * 0.68 + 0.06,
          color: PETALS[i].color, accent: PETALS[i].accent,
          size: 1,
          event: PETALS[i].event,
          driftAngle: (Math.random() - 0.5) * 2.2,
          fallDist: 260 + Math.random() * 320,
          img: images[PETALS[i].event] || null,
        })
      }
      for (let i = 0; i < 52; i++) {
        seeds.push({ angle: (i / 52) * Math.PI * 2, len: 68 + Math.random() * 64, wobble: Math.random() * Math.PI * 2 })
      }
      finalBurst = false
    }

    // Scroll: flower active over first 2.5 viewports
    function updateScroll() {
      const scrollY = window.scrollY
      const active = window.innerHeight * 2.5
      rawSp = Math.min(1, Math.max(0, scrollY / active))
    }

    function lerp(a: number, b: number, t: number) { return a + (b - a) * t }
    function easeInOut(t: number) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t }
    function easeOut3(t: number) { return 1 - Math.pow(1 - t, 3) }
    function flowerY(s: number) { return lerp(H * 0.38, H * 0.72, easeInOut(s)) }
    function getSize() { return Math.min(W, H) * 0.38 }

    function drawPetal(
      px: number, py: number, angle: number,
      sz: number, layer: number, color: string, accent: string,
      alpha: number, imgEl: HTMLImageElement | null, label: string
    ) {
      // Layer 0 = inner ring: wide petals, medium height
      // Layer 1 = outer ring: wider + taller petals
      const scales = [
        { pw: 0.16, ph: 0.38, r: 0.24 },  // inner
        { pw: 0.20, ph: 0.50, r: 0.42 },  // outer
      ]
      const sc = scales[Math.min(layer, 1)]
      const pw = sz * sc.pw, ph = sz * sc.ph

      ctx.save()
      ctx.translate(px, py)
      ctx.rotate(angle + Math.PI / 2)
      ctx.globalAlpha = alpha

      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.bezierCurveTo(-pw * 1.15, -ph * 0.28, -pw * 0.95, -ph * 0.82, 0, -ph)
      ctx.bezierCurveTo(pw * 0.95, -ph * 0.82, pw * 1.15, -ph * 0.28, 0, 0)
      ctx.closePath()
      ctx.save(); ctx.clip()

      if (imgEl && imgEl.complete && imgEl.naturalWidth > 0) {
        const iw = pw * 3.5, ih = ph * 1.2
        ctx.drawImage(imgEl, -iw / 2, -ph * 1.05, iw, ih)
        const overlay = ctx.createLinearGradient(0, -ph, 0, 0)
        overlay.addColorStop(0, `${color}44`)
        overlay.addColorStop(0.5, `${color}22`)
        overlay.addColorStop(1, `${color}88`)
        ctx.fillStyle = overlay; ctx.fill()
      } else {
        const g = ctx.createLinearGradient(0, -ph, 0, ph * 0.2)
        g.addColorStop(0, `${accent}cc`); g.addColorStop(0.6, `${color}aa`); g.addColorStop(1, `${color}55`)
        ctx.fillStyle = g; ctx.fill()
      }
      ctx.restore()

      // Digital border glow
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.bezierCurveTo(-pw * 1.15, -ph * 0.28, -pw * 0.95, -ph * 0.82, 0, -ph)
      ctx.bezierCurveTo(pw * 0.95, -ph * 0.82, pw * 1.15, -ph * 0.28, 0, 0)
      ctx.closePath()
      ctx.strokeStyle = `${color}88`; ctx.lineWidth = 1
      ctx.shadowColor = color; ctx.shadowBlur = 10
      ctx.stroke(); ctx.shadowBlur = 0

      ctx.globalAlpha = 1; ctx.restore()

      // Label — drawn in world space, centered on petal
      if (alpha > 0.45) {
        const labelX = px + Math.cos(angle) * sz * sc.ph * 0.42
        const labelY = py + Math.sin(angle) * sz * sc.ph * 0.42
        ctx.save()
        ctx.globalAlpha = alpha * 0.85
        ctx.font = `600 ${Math.max(9, sz * 0.038)}px "Helvetica Neue", sans-serif`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillStyle = '#fff'
        ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 8
        ctx.fillText(label, labelX, labelY)
        ctx.shadowBlur = 0; ctx.globalAlpha = 1; ctx.restore()
      }
    }

    function spawnFinalSparks(cx: number, cy: number) {
      for (let i = 0; i < 60; i++) {
        const a = Math.random() * Math.PI * 2
        const speed = 2 + Math.random() * 5
        const colors = ['#D4A86A','#fbbf24','#a78bfa','#f472b6','#34d399','#60a5fa','#fb923c']
        sparks.push({
          x: cx, y: cy,
          vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - 3,
          life: 1, color: colors[Math.floor(Math.random() * colors.length)],
          r: 2 + Math.random() * 3,
        })
      }
    }

    function updateSparks() {
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]
        s.x += s.vx; s.y += s.vy; s.vy += 0.12; s.life -= 0.018
        if (s.life <= 0) { sparks.splice(i, 1); continue }
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r * s.life, 0, Math.PI * 2)
        ctx.fillStyle = s.color + Math.round(s.life * 255).toString(16).padStart(2, '0')
        ctx.fill()
      }
    }

    function draw() {
      time += 0.013
      updateScroll()
      sp += (rawSp - sp) * 0.052

      const CX = W / 2
      const targetCY = flowerY(sp)
      smoothCY += (targetCY - smoothCY) * 0.055
      const CY = smoothCY
      const SZ = getSize()

      // Transparent — page background shows through
      ctx.clearRect(0, 0, W, H)

      // Overall opacity: fade in at start, fade out when fully done
      const globalAlpha = sp < 0.05
        ? sp / 0.05                              // fade in
        : sp > 0.92
          ? Math.max(0, 1 - (sp - 0.92) / 0.08) // fade out
          : 1

      if (globalAlpha <= 0.01) {
        animId = requestAnimationFrame(draw)
        return
      }

      ctx.save()
      ctx.globalAlpha = globalAlpha

      // Subtle hex grid behind flower only
      const hexAlpha = 0.018 + sp * 0.028
      const hexSize = 32
      const hexCols = Math.ceil(W / (hexSize * 1.73)) + 2
      const hexRows = Math.ceil(H / (hexSize * 1.5)) + 2
      ctx.strokeStyle = `rgba(212,168,106,${hexAlpha})`
      ctx.lineWidth = 0.5
      for (let row = -1; row < hexRows; row++) {
        for (let col = -1; col < hexCols; col++) {
          const hx = col * hexSize * 1.73 + (row % 2) * hexSize * 0.865
          const hy = row * hexSize * 1.5
          // Only draw near the flower center
          const dx = hx - CX, dy = hy - CY
          if (Math.sqrt(dx * dx + dy * dy) > SZ * 1.4) continue
          ctx.beginPath()
          for (let k = 0; k < 6; k++) {
            const a = (k * Math.PI) / 3
            k === 0 ? ctx.moveTo(hx + hexSize * Math.cos(a), hy + hexSize * Math.sin(a))
                    : ctx.lineTo(hx + hexSize * Math.cos(a), hy + hexSize * Math.sin(a))
          }
          ctx.closePath(); ctx.stroke()
        }
      }

      // Stem
      ctx.save(); ctx.beginPath()
      ctx.moveTo(CX, CY + SZ * 0.10)
      ctx.quadraticCurveTo(CX - 14 * sp, CY + SZ * 0.5 + sp * 80, CX, H * 0.96)
      const stemGrad = ctx.createLinearGradient(CX, CY, CX, H * 0.96)
      stemGrad.addColorStop(0, `rgba(100,180,80,${0.55 + sp * 0.3})`)
      stemGrad.addColorStop(1, 'rgba(60,120,50,0.15)')
      ctx.strokeStyle = stemGrad; ctx.lineWidth = 2.5 + sp * 2
      ctx.shadowColor = 'rgba(80,200,60,0.25)'; ctx.shadowBlur = 6
      ctx.stroke(); ctx.shadowBlur = 0; ctx.restore()

      // Leaves
      if (sp > 0.10) {
        const la = Math.min(1, (sp - 0.10) / 0.15)
        const ly = CY + SZ * 0.38
        for (const s of [-1, 1]) {
          ctx.save(); ctx.translate(CX + s * 10, ly); ctx.rotate(s * 0.5)
          ctx.globalAlpha = 0.45 * la
          const lg = ctx.createRadialGradient(s * 26, -5, 1, s * 26, -5, 26)
          lg.addColorStop(0, '#a0ee70'); lg.addColorStop(1, '#3a8030')
          ctx.fillStyle = lg; ctx.beginPath()
          ctx.ellipse(s * 26, -5, 26, 10, 0, 0, Math.PI * 2); ctx.fill()
          ctx.globalAlpha = 1; ctx.restore()
        }
      }

      // Petals
      const sorted = [...petals].sort((a, b) => a.layer - b.layer)
      // Radii matching scales defined in drawPetal: inner=0.24, outer=0.42
      const rMults = [0.24, 0.42]
      for (const p of sorted) {
        const rMult = rMults[p.layer] ?? 0.32
        const r = SZ * rMult
        const isOff = sp >= p.detachAt
        if (isOff) {
          const fp = Math.min(1, (sp - p.detachAt) / Math.max(0.001, 1 - p.detachAt))
          const eased = easeOut3(fp)
          const startX = CX + Math.cos(p.angle) * r
          const startY = CY + Math.sin(p.angle) * r
          const ex = startX + Math.cos(p.angle + p.driftAngle) * p.fallDist * eased
          const ey = startY + p.fallDist * 1.5 * eased + Math.sin(eased * Math.PI) * 60
          const rot = p.angle + eased * Math.PI * (p.layer % 2 === 0 ? 2.2 : -2.6)
          const alpha = Math.max(0, 1 - eased * 1.05) * 0.92
          if (alpha < 0.02) continue
          drawPetal(ex, ey, rot, SZ, p.layer, p.color, p.accent, alpha, p.img, p.event)
        } else {
          const wobble = Math.sin(time * 1.1 + p.angle * 2.2) * 0.015
          const pulse = 1 + Math.sin(time * 0.9 + p.angle) * 0.011
          drawPetal(
            CX + Math.cos(p.angle + wobble) * r,
            CY + Math.sin(p.angle + wobble) * r,
            p.angle, SZ * pulse,
            p.layer, p.color, p.accent, 0.88, p.img, p.event
          )
        }
      }

      // Flower center
      const rem = petals.filter(p => sp < p.detachAt).length / petals.length
      if (rem > 0.02) {
        const cr = SZ * 0.09 * (0.35 + rem * 0.65)
        const pulse = 1 + Math.sin(time * 2) * 0.04
        const cg = ctx.createRadialGradient(CX, CY, 0, CX, CY, cr * pulse)
        cg.addColorStop(0, '#fff8d0'); cg.addColorStop(0.4, '#ffd020')
        cg.addColorStop(0.75, '#f06800'); cg.addColorStop(1, '#802000')
        ctx.shadowColor = 'rgba(255,160,0,0.5)'; ctx.shadowBlur = 22
        ctx.fillStyle = cg; ctx.beginPath()
        ctx.arc(CX, CY, cr * pulse, 0, Math.PI * 2); ctx.fill()
        ctx.shadowBlur = 0
        // Digital dashed ring
        ctx.beginPath(); ctx.arc(CX, CY, cr * pulse * 1.4, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(255,200,80,${0.28 * rem})`
        ctx.lineWidth = 0.8; ctx.setLineDash([3, 5]); ctx.stroke(); ctx.setLineDash([])
      }

      // Dandelion + final burst
      const dP = Math.max(0, (sp - 0.78) / 0.22)
      if (dP > 0) {
        for (const s of seeds) {
          const len = s.len * dP
          const w = Math.sin(time * 0.7 + s.wobble) * 3.5 * (1 - dP * 0.5)
          const ex = CX + Math.cos(s.angle + w * 0.01) * len
          const ey = CY + Math.sin(s.angle + w * 0.01) * len
          ctx.beginPath(); ctx.moveTo(CX, CY); ctx.lineTo(ex, ey)
          ctx.strokeStyle = `rgba(255,225,140,${0.45 * dP})`
          ctx.lineWidth = 0.8; ctx.stroke()
          ctx.beginPath(); ctx.arc(ex, ey, 3.2 * dP, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255,248,210,${0.88 * dP})`; ctx.fill()
          for (let k = -3; k <= 3; k++) {
            const fa = s.angle + k * 0.19
            const fl = (8 + Math.abs(k) * 2) * dP
            ctx.beginPath(); ctx.moveTo(ex, ey)
            ctx.lineTo(ex + Math.cos(fa) * fl, ey + Math.sin(fa) * fl)
            ctx.strokeStyle = `rgba(255,240,175,${(0.35 - Math.abs(k) * 0.04) * dP})`
            ctx.lineWidth = 0.55; ctx.stroke()
          }
        }
        const hg = ctx.createRadialGradient(CX, CY, 0, CX, CY, 28 * dP)
        hg.addColorStop(0, `rgba(255,235,100,${0.55 * dP})`); hg.addColorStop(1, 'transparent')
        ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(CX, CY, 28 * dP, 0, Math.PI * 2); ctx.fill()

        // Final burst when dandelion is complete
        if (dP > 0.92 && !finalBurst) {
          finalBurst = true
          spawnFinalSparks(CX, CY)
        }
      }

      // Sparks
      updateSparks()

      ctx.restore()
      animId = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('scroll', updateScroll, { passive: true })
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', updateScroll)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 2,
        pointerEvents: 'none',
      }}
    />
  )
}
