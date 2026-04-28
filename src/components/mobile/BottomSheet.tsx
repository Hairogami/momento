"use client"

import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type TouchEvent } from "react"
import { createPortal } from "react-dom"

type Props = {
  open: boolean
  onClose: () => void
  /** Titre affiché dans le header de la sheet/modal */
  title?: string
  /** Contenu (form, liste, etc.) */
  children: ReactNode
  /** Largeur max desktop modal (défaut 480px) */
  maxWidth?: number
  /** aria-labelledby pour <h2 id> géré par children */
  ariaLabelledBy?: string
  /** z-index, défaut 1500 (au-dessus de StickyCta z=90) */
  zIndex?: number
  /** Désactiver drag-to-dismiss (formulaires longs avec scroll interne) */
  disableDrag?: boolean
}

/**
 * BottomSheet — modal responsive Momento.
 * - Desktop ≥768px : modal centré (480px max-width par défaut)
 * - Mobile <768px : sheet glissant depuis le bas, drag-to-dismiss
 *
 * UX :
 * - Backdrop click → close
 * - Esc → close
 * - Drag handle visible mobile (40×4 pill grise)
 * - Drag down >100px ou swipe rapide → close
 * - Body scroll lock pendant l'ouverture
 * - Portal vers <body> (évite les bugs containing-block iOS Safari)
 *
 * Brand : tokens --dash-*, transitions CSS 200ms.
 */
export default function BottomSheet({
  open,
  onClose,
  title,
  children,
  maxWidth = 480,
  ariaLabelledBy,
  zIndex = 1500,
  disableDrag = false,
}: Props) {
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [dragY, setDragY] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startYRef = useRef<number | null>(null)
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    const mq = window.matchMedia("(max-width: 767px)")
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  // ESC to close
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, onClose])

  // Body scroll lock
  useEffect(() => {
    if (!open) return
    const original = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = original
    }
  }, [open])

  // Reset drag state when closed
  useEffect(() => {
    if (!open) {
      setDragY(0)
      setDragging(false)
      startYRef.current = null
    }
  }, [open])

  if (!mounted || !open) return null

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (disableDrag || !isMobile) return
    startYRef.current = e.touches[0].clientY
    setDragging(true)
  }

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (disableDrag || !isMobile || startYRef.current === null) return
    const delta = e.touches[0].clientY - startYRef.current
    if (delta > 0) {
      setDragY(delta)
    }
  }

  const handleTouchEnd = () => {
    if (disableDrag || !isMobile) return
    setDragging(false)
    if (dragY > 100) {
      onClose()
    } else {
      setDragY(0)
    }
    startYRef.current = null
  }

  const backdropStyle: CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: isMobile ? "flex-end" : "center",
    justifyContent: "center",
    zIndex,
    padding: isMobile ? 0 : "var(--space-md, 16px)",
    animation: "bs-fade-in 0.2s ease-out",
  }

  const sheetStyle: CSSProperties = isMobile
    ? {
        background: "var(--dash-surface, #fff)",
        color: "var(--dash-text, #121317)",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        width: "100%",
        maxHeight: "min(90vh, 90dvh)",
        display: "flex",
        flexDirection: "column",
        boxShadow: "var(--shadow-modal, 0 -8px 32px rgba(0,0,0,0.18))",
        transform: dragY ? `translateY(${dragY}px)` : "translateY(0)",
        transition: dragging ? "none" : "transform 0.25s cubic-bezier(0.32,0.72,0,1)",
        animation: dragging ? "none" : "bs-slide-up 0.28s cubic-bezier(0.32,0.72,0,1)",
        paddingBottom: "env(safe-area-inset-bottom)",
        touchAction: "pan-y",
      }
    : {
        background: "var(--dash-surface, #fff)",
        color: "var(--dash-text, #121317)",
        border: "1px solid var(--dash-border, rgba(183,191,217,0.15))",
        borderRadius: 16,
        width: "100%",
        maxWidth,
        maxHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        boxShadow: "var(--shadow-modal, 0 12px 40px rgba(0,0,0,0.2))",
        animation: "bs-modal-in 0.2s ease-out",
      }

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={ariaLabelledBy}
      onClick={onClose}
      style={backdropStyle}
    >
      <div
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        style={sheetStyle}
      >
        {isMobile && !disableDrag && (
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              padding: "10px 0 6px",
              display: "flex",
              justifyContent: "center",
              cursor: "grab",
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            <span
              style={{
                width: 40,
                height: 4,
                borderRadius: 999,
                background: "var(--dash-text-3, #9a9aaa)",
                opacity: 0.4,
              }}
            />
          </div>
        )}

        {title && (
          <div
            style={{
              padding: isMobile ? "8px 20px 14px" : "20px 24px 14px",
              borderBottom: "1px solid var(--dash-divider, rgba(183,191,217,0.10))",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexShrink: 0,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "var(--text-lg)",
                fontWeight: 700,
                color: "var(--dash-text, #121317)",
                letterSpacing: "-0.02em",
              }}
            >
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "var(--dash-faint, rgba(183,191,217,0.07))",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--dash-text-2, #6a6a71)",
                fontSize: 18,
                fontFamily: "inherit",
                touchAction: "manipulation",
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>
        )}

        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {children}
        </div>
      </div>

      <style jsx>{`
        @keyframes bs-fade-in {
          from { opacity: 0 }
          to { opacity: 1 }
        }
        @keyframes bs-slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes bs-modal-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )

  return createPortal(content, document.body)
}
