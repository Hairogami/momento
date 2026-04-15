/**
 * EmptyState — composant partagé pour les états vides du dashboard vendor.
 * Cohérence visuelle : icon emoji + titre + sous-titre + CTA optionnel.
 * Utilisé par : inbox, packages, templates, calendar.
 */
import Link from "next/link"
import type { CSSProperties, ReactNode } from "react"

type Props = {
  icon?: string              // emoji, ex : "📭"
  title: string              // ligne principale
  subtitle?: ReactNode       // ligne secondaire (peut contenir un <a>)
  cta?: {
    label: string
    href?: string            // si href → Link, sinon bouton
    onClick?: () => void
  }
  compact?: boolean          // moins de padding (ex : inside tab)
}

export default function EmptyState({ icon, title, subtitle, cta, compact }: Props) {
  const pad = compact ? "32px 16px" : "52px 20px"
  return (
    <div style={{
      padding: pad,
      textAlign: "center",
      color: "#6b7280",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
    }}>
      {icon && (
        <div style={{ fontSize: compact ? 28 : 40, opacity: 0.55, marginBottom: 4 }}>{icon}</div>
      )}
      <div style={{ fontSize: 14, fontWeight: 600, color: "#121317" }}>{title}</div>
      {subtitle && (
        <div style={{ fontSize: 13, color: "#6b7280", maxWidth: 420, lineHeight: 1.5 }}>{subtitle}</div>
      )}
      {cta && (
        cta.href ? (
          <Link href={cta.href} style={ctaStyle}>{cta.label}</Link>
        ) : (
          <button type="button" onClick={cta.onClick} style={{ ...ctaStyle, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
            {cta.label}
          </button>
        )
      )}
    </div>
  )
}

const ctaStyle: CSSProperties = {
  marginTop: 10,
  padding: "8px 16px",
  borderRadius: 8,
  background: "linear-gradient(135deg,#E11D48,#9333EA)",
  color: "#fff",
  fontSize: 12,
  fontWeight: 600,
  textDecoration: "none",
  whiteSpace: "nowrap",
}
