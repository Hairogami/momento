"use client"

import type { CSSProperties, ReactNode } from "react"

const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"

type Props = {
  /** Texte du bouton primary (gradient G) */
  label: string
  /** Action déclenchée par le tap */
  onClick: () => void
  /** Désactivé : opacity 0.6, cursor not-allowed */
  disabled?: boolean
  /** Hint secondaire affiché à gauche du bouton (ex: "Brouillon · 12 invités") */
  hint?: ReactNode
  /** Icône leading (string emoji ou node JSX). "+ " par défaut implicite via label */
  icon?: ReactNode
  /** Aria-label si label est non-textuel */
  ariaLabel?: string
  /** Forcer l'affichage desktop (par défaut hidden ≥768px) */
  alwaysVisible?: boolean
  /**
   * Espace réservé en bas (en px) pour laisser place à une bottom-nav existante.
   * Défaut 64 — hauteur de MobileDashNav. Mettre à 0 si la page n'a pas de nav fixe.
   */
  bottomOffset?: number
}

/**
 * Sticky CTA bar mobile : barre fixée en bas, safe-area-inset-bottom respecté.
 * Hidden sur desktop (≥768px) sauf si `alwaysVisible`.
 *
 * Pattern : 1 action primary (gradient G) + hint optionnel à gauche.
 * z-index 90 : au-dessus du contenu, sous les modals/sheets (≥1000).
 *
 * Le parent doit réserver `padding-bottom: calc(72px + env(safe-area-inset-bottom))`
 * sous 768px pour éviter que la barre masque le dernier contenu scrollable.
 */
export default function StickyCta({
  label,
  onClick,
  disabled = false,
  hint,
  icon,
  ariaLabel,
  alwaysVisible = false,
  bottomOffset = 64,
}: Props) {
  const wrapperStyle: CSSProperties = {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: bottomOffset,
    zIndex: 90,
    background: "var(--dash-surface, #fff)",
    borderTop: "1px solid var(--dash-border, rgba(183,191,217,0.15))",
    boxShadow: "0 -4px 16px rgba(0,0,0,0.06)",
    paddingTop: 10,
    paddingBottom: bottomOffset > 0 ? 10 : "calc(10px + env(safe-area-inset-bottom))",
    paddingLeft: "calc(16px + env(safe-area-inset-left))",
    paddingRight: "calc(16px + env(safe-area-inset-right))",
    display: "flex",
    alignItems: "center",
    gap: 12,
  }

  const buttonStyle: CSSProperties = {
    flex: hint ? "0 0 auto" : 1,
    minHeight: 48,
    padding: "12px 22px",
    borderRadius: 999,
    background: disabled ? "var(--dash-faint-2, rgba(183,191,217,0.18))" : G,
    color: "#fff",
    border: "none",
    fontSize: "var(--text-sm)",
    fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "inherit",
    boxShadow: disabled
      ? "none"
      : "0 4px 14px color-mix(in srgb, var(--g1,#E11D48) 30%, transparent)",
    opacity: disabled ? 0.6 : 1,
    transition: "transform 0.15s, box-shadow 0.15s",
    touchAction: "manipulation",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    whiteSpace: "nowrap",
  }

  const hintStyle: CSSProperties = {
    flex: 1,
    minWidth: 0,
    fontSize: "var(--text-xs)",
    color: "var(--dash-text-2, #6a6a71)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }

  return (
    <div
      className={alwaysVisible ? "sticky-cta-bar sticky-cta-always" : "sticky-cta-bar"}
      style={wrapperStyle}
      role="region"
      aria-label="Actions principales"
    >
      {hint && <span style={hintStyle}>{hint}</span>}
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel ?? label}
        style={buttonStyle}
      >
        {icon}
        {label}
      </button>
    </div>
  )
}
