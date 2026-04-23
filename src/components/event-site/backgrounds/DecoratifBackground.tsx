"use client"

import { useEffect, useState } from "react"
import type { DecoratifBgParams } from "@/lib/eventSiteSeed"

type Props = {
  params: DecoratifBgParams
  colorMain: string
  colorAccent: string
  colorBg?: string
  intensity?: number
  fullPage?: boolean
}

/**
 * Fond décoratif — pattern SVG encodé en data-URI + CSS background-repeat.
 * Avantage : la taille du tile est en px réels, pas scalée au viewport → pattern régulier et discret.
 *
 * `fullPage` = true → position:fixed, opacity très basse, pattern continu sur toute la page.
 * Respecte prefers-reduced-motion pour l'animation de drift.
 */
export default function DecoratifBackground({
  params, colorMain, colorAccent, colorBg = "#FAF3E8", intensity = 1, fullPage = false,
}: Props) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  useEffect(() => {
    if (typeof window === "undefined") return
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mq.matches)
    const h = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener("change", h)
    return () => mq.removeEventListener("change", h)
  }, [])

  // Opacité contrôlée — plus basse si full page
  const rawOpacity = Math.max(0.08, Math.min(0.55, params.opacity * intensity))
  const opacity = fullPage ? Math.min(0.13, rawOpacity * 0.28) : rawOpacity

  // Taille de tile en px — plus grande si full page (pattern plus espacé)
  const baseTile = fullPage ? 180 : (params.dense ? 110 : 150)
  const tileSize = Math.round(baseTile / params.scale)

  const svg = buildPatternSvg(params.pattern, tileSize, colorMain, colorAccent)
  const dataUri = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`

  const wrapperStyle: React.CSSProperties = fullPage
    ? {
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        backgroundImage: dataUri,
        backgroundRepeat: "repeat",
        backgroundSize: `${tileSize}px ${tileSize}px`,
        opacity,
        transform: `rotate(${params.rotation}deg)`,
        transformOrigin: "center",
        animation: prefersReducedMotion ? undefined : "evtDecoratifDrift 28s ease-in-out infinite",
      }
    : {
        position: "absolute",
        inset: 0,
        zIndex: 0,
        background: colorBg,
        backgroundImage: dataUri,
        backgroundRepeat: "repeat",
        backgroundSize: `${tileSize}px ${tileSize}px`,
      }

  if (fullPage) {
    return (
      <>
        <div aria-hidden style={wrapperStyle} />
        <style>{`
          @keyframes evtDecoratifDrift {
            0%,100% { transform: rotate(${params.rotation}deg) translateY(0); }
            50%     { transform: rotate(${params.rotation}deg) translateY(-8px); }
          }
        `}</style>
      </>
    )
  }

  // Mode non-fullPage : on garde l'ancien rendu avec opacity portée par le bg
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        background: colorBg,
      }}
    >
      <div
        style={{
          position: "absolute", inset: 0,
          backgroundImage: dataUri,
          backgroundRepeat: "repeat",
          backgroundSize: `${tileSize}px ${tileSize}px`,
          opacity,
          transform: `rotate(${params.rotation}deg) scale(1.08)`,
          transformOrigin: "center",
        }}
      />
    </div>
  )
}

/* ─── SVG builders ─────────────────────────────────────────────────────── */

function buildPatternSvg(pattern: DecoratifBgParams["pattern"], s: number, main: string, accent: string): string {
  const inner = patternInner(pattern, s, main, accent)
  return `<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}' viewBox='0 0 ${s} ${s}' fill='none'>${inner}</svg>`
}

function patternInner(pattern: DecoratifBgParams["pattern"], s: number, main: string, accent: string): string {
  switch (pattern) {
    case "arabesque":
      return `
        <path d='M${s / 2},${s * 0.15} Q${s * 0.75},${s * 0.4} ${s / 2},${s * 0.65} Q${s * 0.25},${s * 0.4} ${s / 2},${s * 0.15} Z M${s / 2},${s * 0.65} Q${s * 0.75},${s * 0.9} ${s / 2},${s * 1.05} L${s / 2},${s * 0.65}' stroke='${accent}' stroke-width='1.1' fill='none'/>
        <circle cx='${s / 2}' cy='${s / 2}' r='2.6' fill='${main}'/>
      `
    case "losanges":
      return `
        <path d='M${s / 2},${s * 0.12} L${s * 0.88},${s / 2} L${s / 2},${s * 0.88} L${s * 0.12},${s / 2} Z' stroke='${accent}' stroke-width='0.8' fill='none'/>
        <path d='M${s / 2},${s * 0.32} L${s * 0.68},${s / 2} L${s / 2},${s * 0.68} L${s * 0.32},${s / 2} Z' fill='${main}' fill-opacity='0.3'/>
      `
    case "cercles":
      return `
        <circle cx='${s / 2}' cy='${s / 2}' r='${s * 0.3}' stroke='${main}' stroke-width='0.9' fill='none'/>
        <circle cx='${s / 2}' cy='${s / 2}' r='${s * 0.14}' stroke='${accent}' stroke-width='0.7' fill='none'/>
        <circle cx='${s / 2}' cy='${s / 2}' r='2.2' fill='${accent}'/>
      `
    case "hexagone":
      return `
        <path d='M${s / 2},${s * 0.1} L${s * 0.88},${s * 0.3} L${s * 0.88},${s * 0.7} L${s / 2},${s * 0.9} L${s * 0.12},${s * 0.7} L${s * 0.12},${s * 0.3} Z' stroke='${main}' stroke-width='0.8' fill='none'/>
        <circle cx='${s / 2}' cy='${s / 2}' r='3' fill='${accent}'/>
      `
    case "florale":
      return `
        <g transform='translate(${s / 2},${s / 2})'>
          ${[0, 60, 120, 180, 240, 300].map(a => `<ellipse cx='0' cy='${-s * 0.22}' rx='${s * 0.07}' ry='${s * 0.17}' fill='${accent}' fill-opacity='0.45' transform='rotate(${a})'/>`).join("")}
          <circle r='2.6' fill='${main}'/>
        </g>
      `
    case "zellige":
      return `
        <g transform='translate(${s / 2},${s / 2})'>
          ${[0, 45, 90, 135].map(a => `<rect x='${-s * 0.32}' y='${-s * 0.025}' width='${s * 0.64}' height='${s * 0.05}' fill='${main}' fill-opacity='0.5' transform='rotate(${a})' rx='1'/>`).join("")}
          <circle r='${s * 0.075}' fill='${accent}' fill-opacity='0.9'/>
        </g>
      `
    case "fleurs-line":
      return `
        <path d='M${s * 0.2},${s} Q${s * 0.3},${s * 0.6} ${s * 0.25},${s * 0.3}' stroke='${accent}' stroke-width='0.9' fill='none' stroke-linecap='round'/>
        <path d='M${s * 0.27},${s * 0.55} Q${s * 0.4},${s * 0.5} ${s * 0.38},${s * 0.62}' stroke='${accent}' stroke-width='0.8' fill='none'/>
        <g transform='translate(${s * 0.25},${s * 0.25})'>
          ${[0, 72, 144, 216, 288].map(a => `<circle cx='0' cy='${-s * 0.05}' r='${s * 0.035}' stroke='${main}' stroke-width='0.8' fill='none' transform='rotate(${a})'/>`).join("")}
          <circle r='${s * 0.015}' fill='${main}'/>
        </g>
        <path d='M${s * 0.75},${s * 0.1} Q${s * 0.7},${s * 0.4} ${s * 0.8},${s * 0.7}' stroke='${accent}' stroke-width='0.9' fill='none' stroke-linecap='round'/>
        <g transform='translate(${s * 0.82},${s * 0.72})'>
          ${[0, 72, 144, 216, 288].map(a => `<circle cx='0' cy='${-s * 0.04}' r='${s * 0.028}' stroke='${main}' stroke-width='0.7' fill='none' transform='rotate(${a})'/>`).join("")}
        </g>
      `
    case "constellations": {
      const stars: Array<[number, number, number]> = [
        [s * 0.18, s * 0.22, 2.2],
        [s * 0.4, s * 0.35, 1.4],
        [s * 0.72, s * 0.2, 2.6],
        [s * 0.58, s * 0.55, 1.7],
        [s * 0.3, s * 0.72, 2.2],
        [s * 0.82, s * 0.78, 1.9],
      ]
      return `
        <path d='M${s * 0.18},${s * 0.22} L${s * 0.4},${s * 0.35} L${s * 0.72},${s * 0.2} M${s * 0.4},${s * 0.35} L${s * 0.58},${s * 0.55} L${s * 0.3},${s * 0.72} M${s * 0.58},${s * 0.55} L${s * 0.82},${s * 0.78}' stroke='${accent}' stroke-width='0.5' fill='none' opacity='0.6'/>
        ${stars.map(([x, y, r]) => `<circle cx='${x}' cy='${y}' r='${r}' fill='${main}' fill-opacity='0.85'/>`).join("")}
      `
    }
    case "vagues": {
      const rows = 4
      const amp = s * 0.06
      const period = s / 2
      return Array.from({ length: rows }, (_, i) => {
        const y = (s * (i + 0.5)) / rows
        const color = i % 2 === 0 ? main : accent
        const w = i % 2 === 0 ? 1 : 0.7
        return `<path d='M0,${y} Q${period / 2},${y - amp} ${period},${y} T${period * 2},${y}' stroke='${color}' stroke-width='${w}' fill='none' opacity='0.55' stroke-linecap='round'/>`
      }).join("")
    }
  }
}
