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

/**
 * Sidebar skeleton — mime DashSidebar (visible lg+).
 * Réutilisé par tous les loaders dashboard authentifié.
 */
export function DashSidebarSkel() {
  return (
    <aside
      className="hidden lg:flex"
      style={{
        width: 260,
        flexShrink: 0,
        flexDirection: "column",
        gap: 14,
        padding: "20px 16px",
        background: "var(--dash-sidebar, #ffffff)",
        borderRight: "1px solid var(--dash-border, rgba(183,191,217,0.15))",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <SkelCircle size={36} />
        <SkelLine width={120} height={14} delay={0.05} />
      </div>
      <SkelBlock style={{ height: 64, borderRadius: 14 }} delay={0.1} />
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 6px" }}>
          <SkelBlock style={{ width: 18, height: 18, borderRadius: 6 }} delay={0.12 + i * 0.04} />
          <SkelLine width={`${50 + (i % 3) * 12}%`} height={11} delay={0.14 + i * 0.04} />
        </div>
      ))}
    </aside>
  )
}

/**
 * Topbar mobile minimal — burger + titre.
 */
export function DashTopbarMobileSkel() {
  return (
    <div
      className="flex lg:hidden"
      style={{
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        background: "var(--dash-surface, #fff)",
        borderBottom: "1px solid var(--dash-border, rgba(183,191,217,0.15))",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <SkelBlock style={{ width: 32, height: 32, borderRadius: 8 }} />
      <SkelLine width={140} height={14} delay={0.05} />
    </div>
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
