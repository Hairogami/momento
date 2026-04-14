"use client"
import { useEffect, useState } from "react"
import Link from "next/link"

const NAV_LINKS = [
  { label: "Prestataires", href: "/clone/explore" },
  { label: "Événements",   href: "#", hasDropdown: true },
  { label: "Tarifs",       href: "#pricing" },
  { label: "Blog",         href: "#" },
  { label: "À propos",     href: "#", hasDropdown: true },
]

function MomentoLogo({ size = 28, dark = false }: { size?: number; dark?: boolean }) {
  return (
    <span style={{ display: "inline-block", background: dark ? "transparent" : "#fff", borderRadius: 6, lineHeight: 0, padding: 1 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={dark ? "/logo-light.png" : "/logo-icon.png"}
        alt="Momento"
        width={size - 2}
        height={size - 2}
        style={{ objectFit: "contain", display: "block", mixBlendMode: dark ? "normal" : "multiply" }}
      />
    </span>
  )
}

const PALETTES = [
  { name: "Grenade",  g1: "#E11D48", g2: "#9333EA" },  // rose → violet — identité par défaut
  { name: "Nuit",     g1: "#7C3AED", g2: "#1D4ED8" },  // violet profond → bleu nuit
  { name: "Or",       g1: "#D97706", g2: "#DC2626" },  // or marocain → rouge intense
  { name: "Menthe",   g1: "#059669", g2: "#0369A1" },  // menthe → bleu atlas
]

function GsIcon({ icon, size = 16, color }: { icon: string; size?: number; color?: string }) {
  return (
    <span className="clone-gs-icon" style={{
      fontFamily: "'Google Symbols','Material Symbols Outlined'",
      fontWeight: "normal", fontStyle: "normal",
      fontSize: size, color: color ?? "inherit",
      lineHeight: 1, userSelect: "none", display: "inline-block", verticalAlign: "middle",
    }}>
      {icon}
    </span>
  )
}

export default function AntNav() {
  const [scrolled, setScrolled]     = useState(false)
  const [dark, setDark]             = useState(false)
  const [menuOpen, setMenuOpen]     = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [paletteIdx, setPaletteIdx]   = useState(0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle("clone-dark", dark)
  }, [dark])

  useEffect(() => {
    const p = PALETTES[paletteIdx]
    document.documentElement.style.setProperty("--g1", p.g1)
    document.documentElement.style.setProperty("--g2", p.g2)
  }, [paletteIdx])

  const bg      = dark
    ? scrolled ? "rgba(12,13,17,0.96)" : "rgba(12,13,17,0.82)"
    : scrolled ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.75)"
  const border  = scrolled
    ? dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(183,191,217,0.2)"
    : "1px solid transparent"
  const text    = dark ? "#d4d4de" : "#45474D"
  const heading = dark ? "#f0f0f5" : "#121317"

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{ backgroundColor: bg, backdropFilter: "blur(14px)", borderBottom: border }}
      >
        <div className="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/explore" className="flex items-center gap-2">
            <MomentoLogo size={28} dark={dark} />
            <span style={{ fontSize: 14, fontWeight: 500, color: heading, letterSpacing: "-0.01em" }}>
              Momento
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center gap-0.5 px-3 py-1.5 rounded-full text-sm transition-colors"
                style={{ color: text }}
                onMouseEnter={e => (e.currentTarget.style.background = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                {link.label}
                {link.hasDropdown && <GsIcon icon="keyboard_arrow_down" size={16} color={text} />}
              </Link>
            ))}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={() => setDark(d => !d)}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
              style={{
                background: dark ? "rgba(255,255,255,0.08)" : "rgba(183,191,217,0.12)",
                border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(183,191,217,0.22)",
              }}
              title={dark ? "Mode clair" : "Mode sombre"}
            >
              <GsIcon icon={dark ? "light_mode" : "dark_mode"} size={15} color={text} />
            </button>

            {/* Palette */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setPaletteOpen(o => !o)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: dark ? "rgba(255,255,255,0.08)" : "rgba(183,191,217,0.12)",
                  border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(183,191,217,0.22)",
                }}
                title="Palette de couleurs"
              >
                <GsIcon icon="palette" size={15} color={text} />
              </button>
              {paletteOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", right: 0,
                  background: dark ? "rgba(18,19,23,0.97)" : "rgba(255,255,255,0.97)",
                  border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(183,191,217,0.2)",
                  borderRadius: 12, padding: 12,
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
                  zIndex: 100, minWidth: 164,
                }}>
                  <p style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10, color: dark ? "rgba(255,255,255,0.4)" : "#6a6a71" }}>Palette</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {PALETTES.map((p, i) => (
                      <button
                        key={p.name}
                        onClick={() => { setPaletteIdx(i); setPaletteOpen(false) }}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "6px 8px", borderRadius: 8, width: "100%",
                          background: i === paletteIdx ? (dark ? "rgba(255,255,255,0.08)" : "rgba(183,191,217,0.12)") : "transparent",
                          border: "none", cursor: "pointer", textAlign: "left",
                        }}
                      >
                        <div style={{
                          width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                          background: `linear-gradient(135deg, ${p.g1}, ${p.g2})`,
                        }} />
                        <span style={{ fontSize: 13, fontWeight: i === paletteIdx ? 600 : 400, color: dark ? "#d4d4de" : "#45474D" }}>
                          {p.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Hamburger — mobile */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="md:hidden w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: dark ? "rgba(255,255,255,0.08)" : "rgba(183,191,217,0.12)",
                border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(183,191,217,0.22)",
              }}
            >
              <GsIcon icon={menuOpen ? "close" : "menu"} size={16} color={text} />
            </button>

            {/* CTA */}
            <Link
              href="/signup"
              className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all hover:opacity-90"
              style={{ background: dark ? "#fff" : "linear-gradient(135deg, var(--g1, #E11D48), var(--g2, #9333EA))", color: dark ? "#121317" : "#fff" }}
            >
              S&apos;inscrire
            </Link>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden" style={{ background: bg, borderTop: border, padding: "12px 24px 20px" }}>
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl text-sm"
                  style={{ color: text }}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/signup"
                className="mt-3 inline-flex items-center justify-center px-4 py-2.5 rounded-full text-sm font-medium"
                style={{ background: dark ? "#fff" : "linear-gradient(135deg, var(--g1, #E11D48), var(--g2, #9333EA))", color: dark ? "#121317" : "#fff" }}
              >
                S&apos;inscrire
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ─────────────────────────────────────────────────────────
          DARK MODE — global overrides for /clone page.
          !important est nécessaire pour écraser les inline styles React.
          Les sélecteurs d'attribut [style*] ne fonctionnent pas car le DOM
          normalise les couleurs hex en rgb(). On cible les balises HTML et
          les class names ajoutés explicitement.
      ───────────────────────────────────────────────────────── */}
      <style>{`
        /* ── Logo swap light ↔ dark ── */
        .clone-logo-dark                     { display: none; }
        .clone-dark .clone-logo-light        { display: none !important; }
        .clone-dark .clone-logo-dark         { display: inline-block !important; }

        /* ── Page background ── */
        .clone-dark body                     { background: #0c0d11 !important; }
        .clone-dark section                  { background-color: #0c0d11 !important; }
        .clone-dark footer                   { background-color: #0c0d11 !important;
                                               border-top-color: rgba(255,255,255,0.07) !important; }
        /* Video section sticky inner */
        .clone-dark .clone-video-bg          { background-color: #0c0d11 !important; }

        /* ── Typography — overrides inline styles via !important ── */
        .clone-dark h1, .clone-dark h2,
        .clone-dark h3, .clone-dark h4       { color: #f0f0f5 !important; }
        .clone-dark p                        { color: #9a9aaa !important; }
        .clone-dark a                        { color: #9a9aaa; }

        /* Italic accent spans inside headings (color: #6a6a71 inline) */
        .clone-dark h2 span, .clone-dark h3 span { color: #5a5a70 !important; }

        /* Clone-specific semantic classes */
        .clone-dark .clone-heading           { color: #f0f0f5 !important; }
        .clone-dark .clone-body              { color: #9a9aaa !important; }
        .clone-dark .clone-muted             { color: #6a6a80 !important; }
        .clone-dark .clone-label             { color: #6a6a80 !important; }

        /* ── Icon strips ── */
        .clone-dark .clone-icon-item {
          background: rgba(255,255,255,0.06) !important;
          border-color: rgba(255,255,255,0.1) !important;
        }
        /* Target the span icon inside ant-icon-wave (AntAgentFirst) */
        .clone-dark .ant-icon-wave {
          background: rgba(255,255,255,0.06) !important;
          border-color: rgba(255,255,255,0.1) !important;
        }
        .clone-dark .ant-icon-wave .gs-icon,
        .clone-dark .clone-icon-item .clone-gs-icon {
          color: #c8c8d8 !important;
        }

        /* ── Card surfaces in mockups ── */
        .clone-dark .clone-card {
          background: rgba(255,255,255,0.04) !important;
          border-color: rgba(255,255,255,0.09) !important;
        }

        /* ── Mockup internals ── */
        .clone-dark .clone-mockup            { background: rgba(255,255,255,0.04) !important;
                                               border-color: rgba(255,255,255,0.08) !important; }
        .clone-dark .clone-mockup-surface    { background: rgba(255,255,255,0.07) !important;
                                               border-color: rgba(255,255,255,0.08) !important; }
        .clone-dark .clone-mockup-text-h     { color: #e0e0ea !important; }
        .clone-dark .clone-mockup-text       { color: #9a9aaa !important; }
        .clone-dark .clone-mockup-muted      { color: #6a6a80 !important; }

        /* ── Borders ── */
        .clone-dark .clone-border            { border-color: rgba(255,255,255,0.09) !important; }

        /* ── Ghost CTA buttons (light bg + dark text) ── */
        /* "Explorer la plateforme →", step CTAs, etc. */
        .clone-dark .clone-cta-ghost {
          color: #d0d0e0 !important;
          background: rgba(255,255,255,0.07) !important;
          border-color: rgba(255,255,255,0.12) !important;
        }
        /* Generic anchor color fallback for dark mode — lower specificity than inline
           so won't override deliberately white CTAs */
        .clone-dark a.clone-body,
        .clone-dark a.clone-muted             { color: #7a7a8a !important; }
        .clone-dark a.clone-body:hover,
        .clone-dark a.clone-muted:hover       { color: #c8c8d8 !important; }

        /* Progress dots active state */
        .clone-dark button[style*="background: #121317"] {
          background: #f0f0f5 !important;
        }

        /* ── Footer specific ── */
        .clone-dark footer .clone-heading    { color: #f0f0f5 !important; }
        .clone-dark footer .clone-muted      { color: #6a6a80 !important; }

        /* ── AntAgentFirst app preview surfaces ── */
        .clone-dark .clone-mockup             { background: rgba(255,255,255,0.04) !important;
                                               border-color: rgba(255,255,255,0.08) !important; }
        .clone-dark .ant-icon-wave .gs-icon  { color: #c8c8d8 !important; }

        /* Cursor blink in dark mode */
        .clone-dark h2 span[style*="backgroundColor: #121317"],
        .clone-dark h1 span[style*="backgroundColor: #121317"] {
          background-color: #f0f0f5 !important;
        }
      `}</style>
    </>
  )
}
