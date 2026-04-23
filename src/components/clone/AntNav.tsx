"use client"
import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { usePlan } from "@/hooks/usePlan"

// ─── Navigation items ─────────────────────────────────────────────────────
// Public nav — "Dashboard" route conditionnellement vers /login si non-connecté.
// La résolution se fait dans le render (useSession) — href initial = /login par défaut.
// Nav publique minimale : "À propos" + CTA "Vous êtes prestataire ?" en fin.
// Dashboard/Explorer retirés — redondants avec le bouton principal hero + menu user.
const NAV_LINKS_PUBLIC = [
  { label: "À propos",                href: "/a-propos"  },
  { label: "Vous êtes prestataire ?", href: "/pro"       },
]

const NAV_LINKS_CLIENT = [
  { label: "Accueil",   href: "/accueil"   },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Explorer",  href: "/explore"   },
  { label: "Messages",  href: "/messages"  },
]

const NAV_LINKS_VENDOR = [
  { label: "Accueil",    href: "/accueil"          },
  { label: "Espace pro", href: "/vendor/dashboard" },
  { label: "Explorer",   href: "/explore"          },
  { label: "Messages",   href: "/messages"         },
]

const DROPDOWN_CLIENT = [
  { icon: "home",           label: "Accueil",       href: "/accueil"       },
  { icon: "calendar_month", label: "Dashboard",     href: "/dashboard"     },
  { icon: "search",         label: "Explorer",      href: "/explore"       },
  { icon: "chat_bubble",    label: "Messages",      href: "/messages"      },
  { icon: "star",           label: "Favoris",       href: "/favorites"     },
  { icon: "notifications",  label: "Notifications", href: "/notifications" },
  { separator: true },
  { icon: "person",         label: "Profil",        href: "/profile"       },
  { icon: "settings",       label: "Paramètres",    href: "/settings"      },
  { icon: "delete",         label: "Corbeille",     href: "/accueil#corbeille" },
  { separator: true },
  { icon: "logout",         label: "Déconnexion",   signout: true          },
]

const DROPDOWN_VENDOR = [
  { icon: "home",          label: "Accueil",         href: "/accueil"          },
  { icon: "storefront",    label: "Mon espace pro",  href: "/vendor/dashboard" },
  { icon: "search",        label: "Explorer",        href: "/explore"          },
  { icon: "chat_bubble",   label: "Messages",        href: "/messages"         },
  { icon: "notifications", label: "Notifications",   href: "/notifications"    },
  { separator: true },
  { icon: "person",        label: "Profil",          href: "/profile"          },
  { icon: "settings",      label: "Paramètres",      href: "/settings"         },
  { separator: true },
  { icon: "logout",        label: "Déconnexion",     signout: true             },
]

// ─── Palettes ──────────────────────────────────────────────────────────────
const PALETTES = [
  { name: "Grenade", g1: "#E11D48", g2: "#9333EA" },
  { name: "Nuit",    g1: "#7C3AED", g2: "#1D4ED8" },
  { name: "Or",      g1: "#D97706", g2: "#DC2626" },
  { name: "Menthe",  g1: "#059669", g2: "#0369A1" },
]

// ─── Helpers ──────────────────────────────────────────────────────────────
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

function Avatar({ name, image, size = 30 }: { name?: string | null; image?: string | null; size?: number }) {
  const initials = name ? name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() : "?"
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt={name ?? "Avatar"} width={size} height={size} style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontWeight: 700, fontSize: size * 0.38,
    }}>{initials}</div>
  )
}

type DropdownItem =
  | { separator: true }
  | { icon: string; label: string; href?: string; signout?: boolean; separator?: never }

// ─── Main component ────────────────────────────────────────────────────────
export default function AntNav({
  hideLinks = false,
  centerSlot,
  hideDarkToggle = false,
  animateInDelay = 0,
}: {
  hideLinks?: boolean
  centerSlot?: React.ReactNode
  hideDarkToggle?: boolean
  /** Si > 0, les liens nav fade-in après ce délai (ms). Utilisé sur la landing pour synchro avec l'animation hero. */
  animateInDelay?: number
}) {
  const { data: session, status } = useSession()
  const isLoggedIn = status === "authenticated"
  const role       = (session?.user as { role?: string } | undefined)?.role ?? "client"
  const isVendor   = role === "vendor"
  const { plan }   = usePlan()
  const planLabel = plan === "pro" ? "Pro" : plan === "max" ? "Max" : "Free"
  const planBg    = plan === "pro" ? "linear-gradient(135deg,#E11D48,#9333EA)"
                  : plan === "max" ? "linear-gradient(135deg,#9333EA,#3B82F6)"
                  : "rgba(183,191,217,0.15)"
  const planColor = plan === "free" ? "var(--dash-text-2,#6a6a71)" : "#fff"

  const [scrolled,    setScrolled]    = useState(false)
  const [dark,        setDark]        = useState<boolean>(() => {
    if (typeof window !== "undefined") return document.documentElement.classList.contains("dark")
    return true
  })
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [paletteIdx,  setPaletteIdx]  = useState(0)
  const [profileOpen, setProfileOpen] = useState(false)
  const [navReady,    setNavReady]    = useState(animateInDelay === 0)
  const profileRef = useRef<HTMLDivElement>(null)

  // Fade-in des liens nav après le délai (pour synchro avec l'animation typewriter du hero)
  useEffect(() => {
    if (animateInDelay <= 0) return
    const t = setTimeout(() => setNavReady(true), animateInDelay)
    return () => clearTimeout(t)
  }, [animateInDelay])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Listen for theme changes from other components (DashSidebar)
  useEffect(() => {
    const handler = ((e: CustomEvent) => { const d = e.detail?.dark; if (typeof d === "boolean") setDark(d) }) as EventListener
    window.addEventListener("momento-theme-change", handler)
    return () => window.removeEventListener("momento-theme-change", handler)
  }, [])

  // Observe <html> class changes (ThemeProvider, matchMedia system listener, etc.)
  // Garantit que l'état local `dark` reste aligné avec la classe appliquée, même
  // si le changement vient d'un autre path (ex. /settings theme switch, system OS change).
  useEffect(() => {
    if (typeof window === "undefined") return
    const html = document.documentElement
    // Sync immédiat si la classe a changé entre le useState initial et la première mount
    setDark(html.classList.contains("dark"))
    const obs = new MutationObserver(() => {
      const d = html.classList.contains("dark")
      setDark(prev => (prev === d ? prev : d))
    })
    obs.observe(html, { attributes: true, attributeFilter: ["class"] })
    return () => obs.disconnect()
  }, [])

  // Cross-tab sync via storage event (autre onglet change le thème → suit)
  useEffect(() => {
    if (typeof window === "undefined") return
    const onStorage = (e: StorageEvent) => {
      if (e.key === "momento_theme" || e.key === "momento_clone_dark_mode") {
        setDark(document.documentElement.classList.contains("dark"))
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  // Palette
  useEffect(() => {
    try {
      const saved = localStorage.getItem("momento_clone_palette")
      if (saved) {
        const p = JSON.parse(saved)
        const idx = PALETTES.findIndex(x => x.g1 === p.g1)
        if (idx >= 0) setPaletteIdx(idx)
      }
    } catch {}
  }, [])
  useEffect(() => {
    const p = PALETTES[paletteIdx]
    document.documentElement.style.setProperty("--g1", p.g1)
    document.documentElement.style.setProperty("--g2", p.g2)
    try { localStorage.setItem("momento_clone_palette", JSON.stringify({ g1: p.g1, g2: p.g2 })) } catch {}
  }, [paletteIdx])

  // Close profile dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // Nav stable pour tous les états d'auth — seul le href de "Dashboard" change.
  // Pour les prestataires, on remplace la CTA "Vous êtes prestataire ?" par le shortcut Espace pro.
  const dashboardHref = !isLoggedIn ? "/login" : isVendor ? "/vendor/dashboard" : "/accueil"
  const navLinks = NAV_LINKS_PUBLIC
    .filter(l => !(isVendor && l.label === "Vous êtes prestataire ?"))
    .map(l => (l.label === "Dashboard" ? { ...l, href: dashboardHref } : l))
  const dropdown = (isVendor ? DROPDOWN_VENDOR : DROPDOWN_CLIENT) as DropdownItem[]

  const bg      = dark
    ? scrolled ? "rgba(12,13,17,0.96)" : "rgba(12,13,17,0.82)"
    : scrolled ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.75)"
  const border  = scrolled
    ? dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(183,191,217,0.2)"
    : "1px solid transparent"
  const text    = dark ? "#d4d4de" : "#45474D"
  const heading = dark ? "#f0f0f5" : "#121317"
  const surf    = dark ? "rgba(18,19,23,0.98)" : "rgba(255,255,255,0.98)"
  const surfBorder = dark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(183,191,217,0.2)"

  function renderDropdownItems(items: DropdownItem[], onClose: () => void) {
    return items.map((item, i) => {
      if ("separator" in item && item.separator) {
        return <div key={i} style={{ height: 1, background: dark ? "rgba(255,255,255,0.06)" : "rgba(183,191,217,0.15)", margin: "4px 0" }} />
      }
      const it = item as { icon: string; label: string; href?: string; signout?: boolean }
      if (it.signout) {
        return (
          <button key={i}
            onClick={() => { onClose(); signOut({ callbackUrl: "/" }) }}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", width: "100%", background: "transparent", border: "none", cursor: "pointer", color: "#ef4444", fontFamily: "inherit" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <GsIcon icon={it.icon} size={16} color="#ef4444" />
            <span style={{ fontSize: 13 }}>{it.label}</span>
          </button>
        )
      }
      return (
        <Link key={i} href={it.href!} onClick={onClose}
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", textDecoration: "none", color: text }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
        >
          <GsIcon icon={it.icon} size={16} color={text} />
          <span style={{ fontSize: 13 }}>{it.label}</span>
        </Link>
      )
    })
  }

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{ backgroundColor: bg, backdropFilter: "blur(14px)", borderBottom: border }}
      >
        <div className="px-6 h-14 flex items-center gap-4" style={{ position: "relative" }}>

          {/* Logo — flex-1 desktop, shrink-only mobile en mode search */}
          <div className={hideLinks ? "flex-shrink-0 flex items-center min-w-0" : "flex-1 flex items-center min-w-0"}>
            <Link href="/" className="flex items-center gap-2">
              <MomentoLogo size={28} dark={dark} />
              <span className={hideLinks ? "hidden md:inline" : ""} style={{ fontSize: 14, fontWeight: 500, color: heading, letterSpacing: "-0.01em" }}>Momento</span>
            </Link>
          </div>

          {/* Center slot — centré absolument, indépendant de la largeur logo/controls */}
          {centerSlot && (
            <div style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              width: "min(600px, calc(100% - 180px))",
              display: "flex",
              justifyContent: "center",
              pointerEvents: "none",
            }}>
              <div style={{ width: "100%", pointerEvents: "auto" }}>
                {centerSlot}
              </div>
            </div>
          )}

          {/* Desktop nav — fade-in synchro avec l'animation hero si animateInDelay > 0 */}
          <nav
            className="hidden md:flex items-center gap-1 flex-shrink-0"
            style={{
              opacity: navReady ? 1 : 0,
              transform: navReady ? "translateY(0)" : "translateY(-4px)",
              transition: "opacity 0.5s ease, transform 0.5s ease",
              pointerEvents: navReady ? "auto" : "none",
            }}
          >
            {!hideLinks && navLinks.map(link => {
              const isProCta = link.label === "Vous êtes prestataire ?"
              if (isProCta) {
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all hover:opacity-90 ml-1 mr-2 whitespace-nowrap"
                    style={{ background: "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))", color: "#fff" }}
                  >
                    {link.label}
                  </Link>
                )
              }
              return (
                <Link key={link.label} href={link.href}
                  className="flex items-center px-3 py-1.5 rounded-full text-sm transition-colors whitespace-nowrap"
                  style={{ color: text }}
                  onMouseEnter={e => (e.currentTarget.style.background = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >{link.label}</Link>
              )
            })}
          </nav>

          {/* Right controls — flex-1 desktop, shrink-only mobile en mode search */}
          <div className={hideLinks ? "flex-shrink-0 flex items-center justify-end gap-2 ml-auto" : "flex-1 flex items-center justify-end gap-2"}>

            {/* Dark mode toggle */}
            {!hideDarkToggle && <button onClick={() => { const next = !dark; setDark(next); document.documentElement.classList.toggle("dark", next); document.documentElement.classList.toggle("clone-dark", next); try { localStorage.setItem("momento_clone_dark_mode", JSON.stringify(next)); localStorage.setItem("momento_theme", next ? "dark" : "light") } catch {}; window.dispatchEvent(new CustomEvent("momento-theme-change", { detail: { dark: next } })) }}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
              style={{ background: dark ? "rgba(255,255,255,0.08)" : "rgba(183,191,217,0.12)", border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(183,191,217,0.22)" }}
              title={dark ? "Mode clair" : "Mode sombre"}>
              <GsIcon icon={dark ? "light_mode" : "dark_mode"} size={15} color={text} />
            </button>}

            {/* Palette */}
            <div className="relative hidden md:block">
              <button onClick={() => setPaletteOpen(o => !o)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                style={{ background: dark ? "rgba(255,255,255,0.08)" : "rgba(183,191,217,0.12)", border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(183,191,217,0.22)" }}
                title="Palette de couleurs">
                <GsIcon icon="palette" size={15} color={text} />
              </button>
              {paletteOpen && (
                <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: surf, border: surfBorder, borderRadius: 12, padding: 12, backdropFilter: "blur(20px)", boxShadow: "0 8px 32px rgba(0,0,0,0.14)", zIndex: 100, minWidth: 164 }}>
                  <p style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10, color: dark ? "rgba(255,255,255,0.4)" : "#6a6a71" }}>Palette</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {PALETTES.map((p, i) => (
                      <button key={p.name} onClick={() => { setPaletteIdx(i); setPaletteOpen(false) }}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 8px", borderRadius: 8, width: "100%", background: i === paletteIdx ? (dark ? "rgba(255,255,255,0.08)" : "rgba(183,191,217,0.12)") : "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
                        <div style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, background: `linear-gradient(135deg, ${p.g1}, ${p.g2})` }} />
                        <span style={{ fontSize: 13, fontWeight: i === paletteIdx ? 600 : 400, color: text }}>{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Hamburger — mobile */}
            <button onClick={() => setMenuOpen(o => !o)}
              className="md:hidden w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: dark ? "rgba(255,255,255,0.08)" : "rgba(183,191,217,0.12)", border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(183,191,217,0.22)" }}>
              <GsIcon icon={menuOpen ? "close" : "menu"} size={16} color={text} />
            </button>

            {/* ── Auth zone ── */}
            {status === "loading" ? (
              /* Skeleton pendant chargement session */
              <div className="hidden md:block" style={{ width: 90, height: 30, borderRadius: 999, background: dark ? "rgba(255,255,255,0.06)" : "rgba(183,191,217,0.15)" }} />
            ) : isLoggedIn ? (
              /* Avatar + dropdown */
              <div ref={profileRef} className="relative hidden md:block">
                <button onClick={() => setProfileOpen(o => !o)}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 10px 4px 4px", borderRadius: 999, background: dark ? "rgba(255,255,255,0.08)" : "rgba(183,191,217,0.12)", border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(183,191,217,0.22)", cursor: "pointer" }}>
                  <Avatar name={session.user?.name} image={session.user?.image} size={24} />
                  <span style={{ fontSize: 12, fontWeight: 500, color: text, maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {session.user?.name?.split(" ")[0] ?? "Compte"}
                  </span>
                  <GsIcon icon="keyboard_arrow_down" size={14} color={text} />
                </button>

                {profileOpen && (
                  <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: surf, border: surfBorder, borderRadius: 16, padding: "8px 0", backdropFilter: "blur(20px)", boxShadow: "0 8px 40px rgba(0,0,0,0.18)", zIndex: 100, minWidth: 224 }}>
                    {/* User header */}
                    <div style={{ padding: "10px 16px 12px", borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(183,191,217,0.15)"}`, marginBottom: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar name={session.user?.name} image={session.user?.image} size={36} />
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: heading, margin: 0 }}>{session.user?.name ?? "Mon compte"}</p>
                            {!isVendor && (
                              <span
                                title={`Plan ${planLabel}`}
                                style={{
                                  fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                                  color: planColor, background: planBg,
                                  padding: "2px 7px", borderRadius: 99,
                                  border: plan === "free" ? `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(183,191,217,0.3)"}` : "none",
                                }}
                              >
                                {planLabel}
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: 11, color: dark ? "rgba(255,255,255,0.4)" : "#9a9aaa", margin: "2px 0 0" }}>{session.user?.email}</p>
                          {isVendor && (
                            <span style={{ display: "inline-block", marginTop: 4, fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#fff", background: "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))", padding: "2px 7px", borderRadius: 99 }}>
                              Prestataire
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {renderDropdownItems(dropdown, () => setProfileOpen(false))}
                  </div>
                )}
              </div>
            ) : (
              /* Non connecté */
              <>
                <Link href="/login" className="hidden md:flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all"
                  style={{ color: text, background: dark ? "rgba(255,255,255,0.07)" : "rgba(183,191,217,0.14)", border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(183,191,217,0.25)" }}>
                  Connexion
                </Link>
                <Link href="/signup" className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))", color: "#fff" }}>
                  S&apos;inscrire
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden" style={{ background: bg, borderTop: border, padding: "12px 24px 20px" }}>
            <div className="flex flex-col gap-1">
              {isLoggedIn && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px 14px", borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(183,191,217,0.15)"}`, marginBottom: 8 }}>
                  <Avatar name={session.user?.name} image={session.user?.image} size={32} />
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: heading, margin: 0 }}>{session.user?.name}</p>
                      {!isVendor && (
                        <span
                          style={{
                            fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                            color: planColor, background: planBg,
                            padding: "2px 7px", borderRadius: 99,
                            border: plan === "free" ? `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(183,191,217,0.3)"}` : "none",
                          }}
                        >
                          {planLabel}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 11, color: dark ? "rgba(255,255,255,0.4)" : "#9a9aaa", margin: 0 }}>{session.user?.email}</p>
                  </div>
                </div>
              )}
              {isLoggedIn
                ? renderDropdownItems(dropdown, () => setMenuOpen(false))
                : NAV_LINKS_PUBLIC.map(link => (
                    <Link key={link.label} href={link.href} onClick={() => setMenuOpen(false)}
                      style={{ display: "flex", alignItems: "center", padding: "10px 12px", borderRadius: 10, textDecoration: "none", color: text, fontSize: 13 }}>
                      {link.label}
                    </Link>
                  ))
              }
              {!isLoggedIn && (
                <>
                  <Link href="/login" onClick={() => setMenuOpen(false)}
                    className="mt-2 inline-flex items-center justify-center px-4 py-2.5 rounded-full text-sm font-medium"
                    style={{ color: text, background: dark ? "rgba(255,255,255,0.07)" : "rgba(183,191,217,0.14)", border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(183,191,217,0.25)" }}>
                    Connexion
                  </Link>
                  <Link href="/signup" onClick={() => setMenuOpen(false)}
                    className="mt-2 inline-flex items-center justify-center px-4 py-2.5 rounded-full text-sm font-medium"
                    style={{ background: "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))", color: "#fff" }}>
                    S&apos;inscrire
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── Global CSS (dark mode + palette) ── */}
      <style>{`
        .clone-dot-active { background: linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA)) !important; }
        .clone-check-done { background: linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA)) !important; border-color: transparent !important; }
        .clone-pill-active { background: linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA)) !important; color: #fff !important; border-color: transparent !important; }
        .clone-progress-fill { background: linear-gradient(90deg, var(--g1,#E11D48), var(--g2,#9333EA)) !important; }
        .clone-stat-num { background-image: linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .clone-filter-badge { background: linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA)) !important; color: #fff !important; }
        .clone-icon-accent { background: linear-gradient(140deg, rgba(225,29,72,0.10), rgba(147,51,234,0.10)) !important; }
        .clone-accent-line { background: linear-gradient(90deg, var(--g1,#E11D48), var(--g2,#9333EA)); height: 2px; border: none; }
        .clone-tab-underline { border-bottom: 2px solid var(--g1,#E11D48) !important; color: var(--g1,#E11D48) !important; }
        .clone-input:focus { border-color: var(--g1,#E11D48) !important; box-shadow: 0 0 0 3px rgba(225,29,72,0.12) !important; outline: none !important; }

        .clone-logo-dark { display: none; }
        .clone-dark .clone-logo-light { display: none !important; }
        .clone-dark .clone-logo-dark { display: inline-block !important; }
        .clone-dark body { background: #0c0d11 !important; }
        .clone-dark .ant-root { background: #0c0d11 !important; }
        .clone-dark section { background-color: #0c0d11 !important; }
        .clone-dark footer { background-color: #0c0d11 !important; border-top-color: rgba(255,255,255,0.07) !important; }
        .clone-dark .clone-video-bg { background-color: #0c0d11 !important; }
        .clone-dark .clone-surface { background: rgba(255,255,255,0.05) !important; border-color: rgba(255,255,255,0.09) !important; }
        .clone-dark .clone-surface-alt { background: rgba(255,255,255,0.09) !important; border-color: rgba(255,255,255,0.12) !important; }
        .clone-dark .clone-card-white { background: rgba(255,255,255,0.04) !important; border-color: rgba(255,255,255,0.09) !important; }
        .clone-dark input, .clone-dark select, .clone-dark textarea { background: rgba(255,255,255,0.07) !important; border-color: rgba(255,255,255,0.14) !important; color: #e0e0ea !important; }
        .clone-dark input::placeholder, .clone-dark textarea::placeholder { color: rgba(255,255,255,0.28) !important; }
        .clone-dark h1, .clone-dark h2, .clone-dark h3, .clone-dark h4 { color: #f0f0f5 !important; }
        .clone-dark p { color: #9a9aaa !important; }
        .clone-dark a { color: #9a9aaa; }
        .clone-dark .clone-heading { color: #f0f0f5 !important; }
        .clone-dark .clone-body { color: #9a9aaa !important; }
        .clone-dark .clone-muted { color: #6a6a80 !important; }
        .clone-dark .clone-label { color: #6a6a80 !important; }
        .clone-dark .clone-icon-item { background: rgba(255,255,255,0.06) !important; border-color: rgba(255,255,255,0.1) !important; }
        .clone-dark .ant-icon-wave { background: rgba(255,255,255,0.06) !important; border-color: rgba(255,255,255,0.1) !important; }
        .clone-dark .ant-icon-wave .gs-icon, .clone-dark .clone-icon-item .clone-gs-icon { color: #c8c8d8 !important; }
        .clone-dark .clone-card { background: rgba(255,255,255,0.04) !important; border-color: rgba(255,255,255,0.09) !important; }
        .clone-dark .clone-mockup { background: rgba(255,255,255,0.04) !important; border-color: rgba(255,255,255,0.08) !important; }
        .clone-dark .clone-mockup-surface { background: rgba(255,255,255,0.07) !important; border-color: rgba(255,255,255,0.08) !important; }
        .clone-dark .clone-mockup-text-h { color: #e0e0ea !important; }
        .clone-dark .clone-mockup-text { color: #9a9aaa !important; }
        .clone-dark .clone-mockup-muted { color: #6a6a80 !important; }
        .clone-dark .clone-border { border-color: rgba(255,255,255,0.09) !important; }
        .clone-dark .clone-cta-ghost { color: #d0d0e0 !important; background: rgba(255,255,255,0.07) !important; border-color: rgba(255,255,255,0.12) !important; }
        .clone-dark a.clone-body, .clone-dark a.clone-muted { color: #7a7a8a !important; }
        .clone-dark a.clone-body:hover, .clone-dark a.clone-muted:hover { color: #c8c8d8 !important; }
        .clone-dark button.clone-pill-inactive { background: rgba(255,255,255,0.07) !important; border-color: rgba(255,255,255,0.12) !important; color: #c0c0d0 !important; }
        .clone-dark footer .clone-heading { color: #f0f0f5 !important; }
        .clone-dark footer .clone-muted { color: #6a6a80 !important; }
        .clone-dark footer input { background: rgba(255,255,255,0.07) !important; border-color: rgba(255,255,255,0.14) !important; color: #e0e0ea !important; }
        .clone-dark .clone-filter-bar { background: rgba(12,13,17,0.97) !important; border-color: rgba(255,255,255,0.08) !important; box-shadow: 0 2px 16px rgba(0,0,0,0.4) !important; }
        .clone-dark .clone-tab-strip { background: rgba(255,255,255,0.05) !important; border-color: rgba(255,255,255,0.08) !important; }
        .clone-dark .clone-tab-strip-active { background: rgba(255,255,255,0.10) !important; }
        .clone-dark .clone-tab-panel { background: rgba(255,255,255,0.03) !important; border-color: rgba(255,255,255,0.08) !important; }
        .clone-dark .ant-icon-wave .gs-icon { color: #c8c8d8 !important; }
      `}</style>
    </>
  )
}
