/**
 * Primitives skeleton — couleurs via CSS vars (--dash-faint-2, --dash-surface, --dash-border)
 * pour suivre automatiquement le mode clair/sombre actif.
 *
 * Animation : classe globale `.mo-skel` (définie dans globals.css → @keyframes moPulse).
 *
 * Compose ces primitives dans chaque loading.tsx pour mimer la structure réelle de sa page.
 */

import type { CSSProperties } from "react"

type SkelProps = { style?: CSSProperties; delay?: number; className?: string }

function applyDelay(style: CSSProperties | undefined, delay?: number): CSSProperties {
  return delay ? { ...style, animationDelay: `${delay}s` } : style ?? {}
}

export function SkelBlock({ style, delay, className }: SkelProps) {
  return (
    <div
      className={`mo-skel ${className ?? ""}`}
      style={applyDelay(
        {
          background: "var(--dash-faint-2, rgba(183,191,217,0.12))",
          borderRadius: 8,
          ...style,
        },
        delay,
      )}
    />
  )
}

export function SkelLine({ width = "100%", height = 12, style, delay }: SkelProps & { width?: number | string; height?: number }) {
  return (
    <div
      className="mo-skel"
      style={applyDelay(
        {
          width,
          height,
          borderRadius: 4,
          background: "var(--dash-faint-2, rgba(183,191,217,0.18))",
          ...style,
        },
        delay,
      )}
    />
  )
}

export function SkelCircle({ size = 40, style, delay }: SkelProps & { size?: number }) {
  return (
    <div
      className="mo-skel"
      style={applyDelay(
        {
          width: size,
          height: size,
          borderRadius: "50%",
          background: "var(--dash-faint-2, rgba(183,191,217,0.18))",
          flexShrink: 0,
          ...style,
        },
        delay,
      )}
    />
  )
}

export function SkelPill({ width = 80, height = 28, style, delay }: SkelProps & { width?: number | string; height?: number }) {
  return (
    <div
      className="mo-skel"
      style={applyDelay(
        {
          width,
          height,
          borderRadius: 99,
          background: "var(--dash-faint-2, rgba(183,191,217,0.15))",
          flexShrink: 0,
          ...style,
        },
        delay,
      )}
    />
  )
}

export function SkelCard({ children, style }: { children?: React.ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        background: "var(--dash-surface, #ffffff)",
        border: "1px solid var(--dash-border, rgba(183,191,217,0.15))",
        borderRadius: 16,
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  )
}
