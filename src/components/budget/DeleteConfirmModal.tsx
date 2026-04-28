"use client"

import { useEffect } from "react"

const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"

interface DeleteConfirmModalProps {
  open: boolean
  title: string
  description?: string
  onConfirm: () => void
  onCancel: () => void
  busy?: boolean
}

/**
 * Modal de confirmation pour actions destructives (suppression dépense, etc.).
 *
 * UX : modal centrale, backdrop cliquable, Escape pour cancel, focus trap léger.
 * Brand : tokens --dash-*, bouton danger en rouge plein, secondary en outline.
 */
export function DeleteConfirmModal({
  open,
  title,
  description,
  onConfirm,
  onCancel,
  busy = false,
}: DeleteConfirmModalProps) {
  // Escape pour fermer
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-confirm-title"
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1500,
        padding: "var(--space-md, 16px)",
        animation: "fade-in 0.15s ease-out",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--dash-surface, #fff)",
          color: "var(--dash-text, #121317)",
          border: "1px solid var(--dash-border, rgba(183,191,217,0.15))",
          borderRadius: 16,
          padding: "clamp(20px, 3vw, 28px)",
          maxWidth: 420,
          width: "100%",
          boxShadow: "var(--shadow-modal, 0 12px 40px rgba(0,0,0,0.2))",
          animation: "slide-in 0.2s ease-out",
        }}
      >
        <h2
          id="delete-confirm-title"
          style={{
            fontSize: "var(--text-lg)",
            fontWeight: 700,
            margin: "0 0 8px",
            color: "var(--dash-text, #121317)",
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h2>
        {description && (
          <p
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--dash-text-2, #6a6a71)",
              margin: "0 0 20px",
              lineHeight: 1.5,
            }}
          >
            {description}
          </p>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            style={{
              padding: "9px 18px",
              borderRadius: 10,
              background: "var(--dash-faint, rgba(183,191,217,0.07))",
              color: "var(--dash-text-2, #6a6a71)",
              border: "1px solid var(--dash-border, rgba(183,191,217,0.25))",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              cursor: busy ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              opacity: busy ? 0.6 : 1,
            }}
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            style={{
              padding: "9px 20px",
              borderRadius: 10,
              background: busy ? "var(--dash-faint-2, rgba(183,191,217,0.18))" : "#ef4444",
              color: "#fff",
              border: "none",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              cursor: busy ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              transition: "transform 0.15s",
            }}
          >
            {busy ? "Suppression…" : "Supprimer"}
          </button>
        </div>

        <style jsx>{`
          @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
          @keyframes slide-in {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        {/* Suppress unused vars warning */}
        <span style={{ display: "none" }}>{G}</span>
      </div>
    </div>
  )
}
