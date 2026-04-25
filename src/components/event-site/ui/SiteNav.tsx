"use client"

import { useEffect, useState } from "react"

export type NavItem = { id: string; label: string }

type Props = {
  title: string
  items: NavItem[]
}

/**
 * Barre de navigation sticky + menu hamburger mobile.
 * Utilise les ancres internes (#id) avec smooth-scroll.
 */
export default function SiteNav({ title, items }: Props) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Ferme le drawer au resize desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 720) setOpen(false) }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  function goTo(id: string) {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
    setOpen(false)
  }

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 100,
          padding: "14px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: scrolled
            ? "color-mix(in srgb, var(--evt-bg) 92%, transparent)"
            : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled ? "1px solid color-mix(in srgb, var(--evt-main) 15%, transparent)" : "1px solid transparent",
          transition: "background 240ms ease, backdrop-filter 240ms ease, border-color 240ms ease",
          fontFamily: "var(--evt-font-body)",
        }}
      >
        <button
          onClick={() => goTo("top")}
          aria-label="Retour en haut"
          style={{
            background: "transparent", border: "none", cursor: "pointer",
            padding: 0,
            width: 0, height: 0, overflow: "hidden",
            position: "absolute",
          }}
        >
          <span style={{ position: "absolute", left: -9999, top: -9999 }}>{title}</span>
        </button>

        {/* Desktop : liens inline */}
        <nav className="site-nav-desktop" style={{ display: "flex", gap: 22 }}>
          {items.map(it => (
            <button
              key={it.id}
              onClick={() => goTo(it.id)}
              style={{
                background: "transparent", border: "none", cursor: "pointer",
                fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase",
                color: "var(--evt-text-muted)",
                padding: "4px 2px",
                fontFamily: "inherit",
                fontWeight: 500,
              }}
            >
              {it.label}
            </button>
          ))}
        </nav>

        {/* Mobile : hamburger */}
        <button
          className="site-nav-burger"
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu"
          style={{
            background: "transparent", border: "none", cursor: "pointer",
            padding: 6, color: "var(--evt-text)",
            display: "none",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="3" y1="7" x2="19" y2="7" />
            <line x1="3" y1="11" x2="19" y2="11" />
            <line x1="3" y1="15" x2="19" y2="15" />
          </svg>
        </button>
      </header>

      {/* Drawer mobile */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 150,
            background: "color-mix(in srgb, var(--evt-bg) 96%, transparent)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: 24,
          }}
        >
          <button
            onClick={() => setOpen(false)}
            aria-label="Fermer le menu"
            style={{
              position: "absolute", top: 18, right: 18,
              background: "transparent", border: "none", cursor: "pointer",
              color: "var(--evt-text)", padding: 8,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>

          <nav
            onClick={e => e.stopPropagation()}
            style={{ display: "flex", flexDirection: "column", gap: 18, textAlign: "center" }}
          >
            {items.map(it => (
              <button
                key={it.id}
                onClick={() => goTo(it.id)}
                style={{
                  background: "transparent", border: "none", cursor: "pointer",
                  fontFamily: "var(--evt-font-heading)",
                  fontSize: 26, fontWeight: 500, letterSpacing: "-0.01em",
                  color: "var(--evt-text)",
                  padding: "6px 14px",
                }}
              >
                {it.label}
              </button>
            ))}
          </nav>
        </div>
      )}

      <style>{`
        @media (max-width: 720px) {
          .site-nav-desktop { display: none !important; }
          .site-nav-burger { display: flex !important; order: -1 !important; margin-right: auto !important; }
        }
      `}</style>
    </>
  )
}
