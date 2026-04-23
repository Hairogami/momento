"use client"

import type { DecoratifBgParams } from "@/lib/eventSiteSeed"

type Props = {
  params: DecoratifBgParams
  colorMain: string
  colorAccent: string
  colorBg?: string
  intensity?: number
}

/**
 * Fond décoratif avec pattern SVG. 5 patterns possibles (arabesque, losanges,
 * cercles, hexagone, florale) — choisis depuis le seed. Scale + rotation aussi
 * dérivées du seed pour rendre chaque site unique.
 */
export default function DecoratifBackground({ params, colorMain, colorAccent, colorBg = "#FAF3E8", intensity = 1 }: Props) {
  const opacity = Math.max(0.15, Math.min(0.65, params.opacity * intensity))
  const baseSize = params.dense ? 50 : 80
  const size = Math.round(baseSize / params.scale)

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        zIndex: 0,
        background: colorBg,
      }}
    >
      <svg
        viewBox={`0 0 400 400`}
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity,
          transform: `rotate(${params.rotation}deg) scale(${1 + params.scale * 0.15})`,
          transformOrigin: "center",
        }}
      >
        <defs>
          {renderPattern(params.pattern, size, colorMain, colorAccent)}
        </defs>
        <rect width="100%" height="100%" fill={`url(#evt-pattern-${params.pattern})`} />
      </svg>
    </div>
  )
}

function renderPattern(pattern: DecoratifBgParams["pattern"], size: number, main: string, accent: string): React.ReactElement {
  switch (pattern) {
    case "arabesque":
      return (
        <pattern id="evt-pattern-arabesque" x="0" y="0" width={size} height={size} patternUnits="userSpaceOnUse">
          <path
            d={`M${size / 2},${size * 0.15} Q${size * 0.75},${size * 0.4} ${size / 2},${size * 0.65} Q${size * 0.25},${size * 0.4} ${size / 2},${size * 0.15} Z M${size / 2},${size * 0.65} Q${size * 0.75},${size * 0.9} ${size / 2},${size * 1.05} L${size / 2},${size * 0.65}`}
            fill="none"
            stroke={accent}
            strokeWidth={1.2}
          />
          <circle cx={size / 2} cy={size / 2} r={3} fill={main} />
        </pattern>
      )
    case "losanges":
      return (
        <pattern id="evt-pattern-losanges" x="0" y="0" width={size} height={size} patternUnits="userSpaceOnUse">
          <path d={`M${size / 2},${size * 0.1} L${size * 0.9},${size / 2} L${size / 2},${size * 0.9} L${size * 0.1},${size / 2} Z`} fill="none" stroke={accent} strokeWidth={0.9} />
          <path d={`M${size / 2},${size * 0.3} L${size * 0.7},${size / 2} L${size / 2},${size * 0.7} L${size * 0.3},${size / 2} Z`} fill={main} opacity="0.35" />
        </pattern>
      )
    case "cercles":
      return (
        <pattern id="evt-pattern-cercles" x="0" y="0" width={size} height={size} patternUnits="userSpaceOnUse">
          <circle cx={size / 2} cy={size / 2} r={size * 0.32} fill="none" stroke={main} strokeWidth={1} />
          <circle cx={size / 2} cy={size / 2} r={size * 0.14} fill="none" stroke={accent} strokeWidth={0.8} />
          <circle cx={size / 2} cy={size / 2} r={2.5} fill={accent} />
        </pattern>
      )
    case "hexagone":
      return (
        <pattern id="evt-pattern-hexagone" x="0" y="0" width={size * 0.6} height={size * 1.04} patternUnits="userSpaceOnUse">
          <path
            d={`M${size * 0.3},0 L${size * 0.6},${size * 0.26} L${size * 0.6},${size * 0.78} L${size * 0.3},${size * 1.04} L0,${size * 0.78} L0,${size * 0.26} Z`}
            fill="none"
            stroke={main}
            strokeWidth={0.9}
          />
          <path
            d={`M${size * 0.3},${size * 0.26} L${size * 0.45},${size * 0.52} L${size * 0.3},${size * 0.78} L${size * 0.15},${size * 0.52} Z`}
            fill={accent}
            opacity="0.3"
          />
        </pattern>
      )
    case "florale":
      return (
        <pattern id="evt-pattern-florale" x="0" y="0" width={size} height={size} patternUnits="userSpaceOnUse">
          <g transform={`translate(${size / 2}, ${size / 2})`}>
            {[0, 60, 120, 180, 240, 300].map(angle => (
              <ellipse
                key={angle}
                cx="0"
                cy={-size * 0.22}
                rx={size * 0.08}
                ry={size * 0.18}
                fill={accent}
                opacity="0.4"
                transform={`rotate(${angle})`}
              />
            ))}
            <circle cx="0" cy="0" r={3} fill={main} />
          </g>
        </pattern>
      )
  }
}
