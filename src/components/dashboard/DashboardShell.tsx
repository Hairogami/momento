"use client"

import { ReactNode, useEffect } from "react"
import DashSidebar from "@/components/clone/dashboard/DashSidebar"
import MobileDashNav from "@/components/clone/dashboard/MobileDashNav"

export interface DashboardShellEvent {
  id: string
  name: string
  date: string
  color: string
}

export interface DashboardShellProps {
  events: DashboardShellEvent[]
  activeEventId: string
  onEventChange: (id: string) => void
  firstName?: string
  messageUnread?: number
  /** Contenu principal de la page (zone main). */
  children: ReactNode
  /** Si true, retire le padding-bottom mobile (utile pour pages avec footer custom). */
  noBottomPadding?: boolean
}

/**
 * Shell responsive unifié pour toutes les pages de l'espace client.
 *
 * Desktop (≥1024px) : flex row, DashSidebar 240px + main fluide.
 * Mobile (<1024px) : block, MobileDashNav fixed bottom (64px + safe-area).
 *
 * Garantit un layout cohérent à travers /accueil, /dashboard, /budget, /messages,
 * /guests, /favorites, /mes-prestataires, /profile, /notifications, /planner,
 * /dashboard/event-site.
 */
export default function DashboardShell({
  events,
  activeEventId,
  onEventChange,
  firstName,
  messageUnread = 0,
  children,
  noBottomPadding = false,
}: DashboardShellProps) {
  // Padding-bottom mobile sur <body> — la solution la plus déterministe pour
  // que la bottom nav fixe (MobileDashNav) ne recouvre jamais le contenu,
  // quel que soit le navigateur, le layout interne ou les containers de scroll.
  useEffect(() => {
    if (noBottomPadding) return
    document.body.classList.add("has-mobile-bottom-nav")
    return () => document.body.classList.remove("has-mobile-bottom-nav")
  }, [noBottomPadding])

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100dvh",
        background: "var(--dash-bg, #f7f7fb)",
        color: "var(--dash-text, #121317)",
      }}
    >
      {/* Desktop sidebar — masquée sous 1024px */}
      <div className="hidden lg:flex" style={{ flexShrink: 0 }}>
        <DashSidebar
          events={events}
          activeEventId={activeEventId}
          onEventChange={onEventChange}
          firstName={firstName}
        />
      </div>

      {/* Main content */}
      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {children}
        {/* Spacer mobile : garantit ~84px d'espace sous le contenu pour la bottom nav fixe (64px + safe-area).
            Déterministe quel que soit le layout interne — pas de dépendance au padding parent / flex. */}
        {!noBottomPadding && (
          <div
            aria-hidden="true"
            className="lg:hidden"
            style={{ flexShrink: 0, height: "calc(64px + env(safe-area-inset-bottom) + 16px)" }}
          />
        )}
      </main>

      {/* Mobile bottom nav — auto-portal vers body, auto-hide ≥1024px via lg:!hidden */}
      <MobileDashNav
        messageUnread={messageUnread}
        events={events}
        activeEventId={activeEventId}
        onEventChange={onEventChange}
      />
    </div>
  )
}
