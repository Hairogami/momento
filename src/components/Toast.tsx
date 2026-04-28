"use client"

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"

type ToastType = "success" | "error" | "info"

interface Toast {
  id: string
  type: ToastType
  message: string
}

interface ToastContextValue {
  show: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

/**
 * Hook pour afficher un toast depuis n'importe quel composant.
 * Utilisation : `const toast = useToast(); toast.show("✓ Enregistré", "success")`.
 */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    // Fallback silencieux si le provider n'est pas monté (évite les crashs côté server-side)
    return {
      show: (msg: string) => {
        if (typeof window !== "undefined") console.warn("[Toast] no provider:", msg)
      },
    }
  }
  return ctx
}

/**
 * Provider Toast — à mounter une seule fois au plus haut niveau (root layout
 * ou client wrapper). Affiche les toasts en bas-centre, max 3 simultanés,
 * auto-dismiss 3s, animation slide-up.
 *
 * Brand consistency : style aligné sur tokens --dash-*, jamais de hex random.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const show = useCallback((message: string, type: ToastType = "success") => {
    const id = `t${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setToasts((prev) => {
      const next = [...prev, { id, type, message }]
      return next.slice(-3) // max 3
    })
  }, [])

  // Auto-dismiss
  useEffect(() => {
    if (toasts.length === 0) return
    const t = setTimeout(() => {
      setToasts((prev) => prev.slice(1))
    }, 3000)
    return () => clearTimeout(t)
  }, [toasts])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        aria-live="polite"
        style={{
          position: "fixed",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          zIndex: 2000,
          pointerEvents: "none",
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            style={{
              padding: "10px 20px",
              borderRadius: 999,
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              fontFamily: "inherit",
              boxShadow: "var(--shadow-modal, 0 8px 24px rgba(0,0,0,0.12))",
              background:
                t.type === "success"
                  ? "var(--dash-text, #121317)"
                  : t.type === "error"
                    ? "#ef4444"
                    : "var(--dash-text, #121317)",
              color: t.type === "error" ? "#fff" : "var(--dash-bg, #f7f7fb)",
              animation: "toast-in 0.2s ease-out",
            }}
          >
            {t.message}
          </div>
        ))}
        <style jsx>{`
          @keyframes toast-in {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </ToastContext.Provider>
  )
}
