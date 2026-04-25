"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { signOut, useSession } from "next-auth/react"
import { useIsMobile } from "@/hooks/useIsMobile"
import MobileDashNav from "./MobileDashNav"
import CreateEventModal from "./CreateEventModal"
import ProUpgradeModal from "@/components/ProUpgradeModal"
import { usePlan } from "@/hooks/usePlan"
import { DEV_OWNER_EMAIL } from "@/lib/adminConstants"

// Dev-mode : cet email a accès au switcher Client ↔ Prestataire
// DEV_OWNER_EMAIL importé depuis @/lib/adminAuth (DEV_OWNER_EMAIL)

const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"

const NAV_ITEMS: { icon: string; label: string; href: string; pro?: boolean }[] = [
  { icon: "home",                    label: "Accueil",          href: "/accueil"          },
  { icon: "dashboard",               label: "Mon Planner",      href: "/dashboard"        },
  { icon: "account_balance_wallet",  label: "Budget",           href: "/budget"           },
  { icon: "groups",                  label: "Invités",          href: "/guests",     pro: true },
  { icon: "chat_bubble",             label: "Messages",         href: "/messages",   pro: true },
  { icon: "event_note",              label: "Planning",         href: "/planner",    pro: true },
  { icon: "favorite",                label: "Favoris",          href: "/favorites"           },
  { icon: "handshake",               label: "Mes Prestataires", href: "/mes-prestataires" },
  { icon: "share",                   label: "Site événement",   href: "/dashboard/event-site", pro: true },
]

function itemToReason(href: string): "messages" | "guests" | "checklist" | "favorites" | "events-multiple" | "event-site" {
  if (href === "/messages") return "messages"
  if (href === "/guests")   return "guests"
  if (href === "/planner")  return "checklist"
  if (href === "/favorites")return "favorites"
  if (href === "/dashboard/event-site") return "event-site"
  return "events-multiple"
}

type Event = { id: string; name: string; date: string; color: string }

interface DashSidebarProps {
  events: Event[]
  activeEventId: string
  onEventChange: (id: string) => void
  firstName?: string
  messageUnread?: number
}

function GIcon({ name, size = 18, color = "var(--dash-text-2,#6a6a71)" }: { name: string; size?: number; color?: string }) {
  return (
    <span style={{
      fontFamily: "'Google Symbols','Material Symbols Outlined'",
      fontSize: size, color, fontWeight: "normal", fontStyle: "normal",
      lineHeight: 1, userSelect: "none", display: "inline-block", verticalAlign: "middle",
      flexShrink: 0,
    }}>{name}</span>
  )
}

export default function DashSidebar({ events, activeEventId, onEventChange, firstName: firstNameProp, messageUnread = 0 }: DashSidebarProps) {
  const pathname   = usePathname()
  const { data: session } = useSession()
  const { plan } = usePlan()
  const [upsellOpen, setUpsellOpen] = useState(false)
  const [upsellReason, setUpsellReason] = useState<"messages" | "guests" | "checklist" | "favorites" | "events-multiple" | "vendor-contact" | "theme" | "event-site">("messages")
  const canSwitch = session?.user?.email === DEV_OWNER_EMAIL
  const firstName = firstNameProp || session?.user?.name?.split(" ")[0] || "U"
  const [eventOpen, setEventOpen] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const router = useRouter()
  const [darkMode,  setDarkMode]  = useState<boolean>(() => {
    if (typeof window !== "undefined") return document.documentElement.classList.contains("dark")
    return true
  })
  const [menuOpen,  setMenuOpen]  = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const activeEvent = events.find(e => e.id === activeEventId) ?? events[0]
  const isMobile = useIsMobile()

  if (isMobile) {
    return <MobileDashNav messageUnread={messageUnread} />
  }

  // Listen for theme changes from other components (AntNav)
  useEffect(() => {
    const handler = ((e: CustomEvent) => { const d = e.detail?.dark; if (typeof d === "boolean") setDarkMode(d) }) as EventListener
    window.addEventListener("momento-theme-change", handler)
    return () => window.removeEventListener("momento-theme-change", handler)
  }, [])

  // Observer html class — catch ThemeProvider + system listener changes
  useEffect(() => {
    if (typeof window === "undefined") return
    const html = document.documentElement
    setDarkMode(html.classList.contains("dark"))
    const obs = new MutationObserver(() => {
      const d = html.classList.contains("dark")
      setDarkMode(prev => (prev === d ? prev : d))
    })
    obs.observe(html, { attributes: true, attributeFilter: ["class"] })
    return () => obs.disconnect()
  }, [])

  // Fermer le menu sur clic extérieur
  useEffect(() => {
    if (!menuOpen) return
    function onOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener("mousedown", onOutside)
    return () => document.removeEventListener("mousedown", onOutside)
  }, [menuOpen])

  function toggleDark() {
    const next = !darkMode
    setDarkMode(next)
    document.documentElement.classList.toggle("dark", next)
    document.documentElement.classList.toggle("clone-dark", next)
    try {
      localStorage.setItem("momento_clone_dark_mode", JSON.stringify(next))
      localStorage.setItem("momento_theme", next ? "dark" : "light")
    } catch {}
    window.dispatchEvent(new CustomEvent("momento-theme-change", { detail: { dark: next } }))
  }

  return (
    <>
    <aside style={{
      width: 240, flexShrink: 0,
      height: "100vh", position: "sticky", top: 0,
      display: "flex", flexDirection: "column",
      background: "var(--dash-surface, #fff)",
      borderRight: "1px solid var(--dash-border, rgba(183,191,217,0.15))",
      zIndex: 30,
    }}>

      {/* Logo + dark mode toggle */}
      <div style={{ padding: "18px 20px 16px", borderBottom: "1px solid var(--dash-divider, rgba(183,191,217,0.1))", display: "flex", alignItems: "center", gap: 10 }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9, background: G,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, boxShadow: "0 2px 10px color-mix(in srgb, var(--g1,#E11D48) 30%, transparent)",
          }}>
            <span style={{ color: "#fff", fontSize: 13, fontWeight: 800, letterSpacing: "-0.03em" }}>M</span>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--dash-text,#121317)", letterSpacing: "-0.03em", lineHeight: 1.1 }}>Momento</div>
            <div style={{ fontSize: 9, color: "var(--dash-text-3,#9a9aaa)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Espace client</div>
          </div>
        </Link>
        {/* Dark mode toggle pill — toujours visible */}
        <button
          onClick={toggleDark}
          title={darkMode ? "Mode clair" : "Mode sombre"}
          style={{
            width: 34, height: 20, borderRadius: 99, border: "none", cursor: "pointer",
            background: darkMode ? "var(--g1,#E11D48)" : "var(--dash-faint-2, rgba(183,191,217,0.25))",
            position: "relative", flexShrink: 0, transition: "background 0.2s", padding: 0,
          }}
        >
          <div style={{
            position: "absolute", top: 3, left: darkMode ? 17 : 3,
            width: 14, height: 14, borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            transition: "left 0.2s",
          }} />
        </button>
      </div>

      {/* Event switcher */}
      <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--dash-divider, rgba(183,191,217,0.08))", position: "relative" }}>
        <button
          onClick={() => events.length > 0 && setEventOpen(o => !o)}
          style={{
            width: "100%", padding: "9px 12px",
            background: "var(--dash-faint, rgba(183,191,217,0.07))",
            border: "1px solid var(--dash-border, rgba(183,191,217,0.18))",
            borderRadius: 11,
            display: "flex", alignItems: "center", gap: 9,
            cursor: events.length > 0 ? "pointer" : "default", fontFamily: "inherit", textAlign: "left",
          }}
        >
          <div style={{
            width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
            background: activeEvent?.color ?? "#E11D48",
            boxShadow: `0 0 6px ${activeEvent?.color ?? "#E11D48"}80`,
          }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--dash-text,#121317)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {events.length === 0
                ? <span style={{ display: "inline-block", width: 90, height: 10, borderRadius: 4, background: "var(--dash-border,rgba(183,191,217,0.25))" }} />
                : (activeEvent?.name || "Mon événement")
              }
            </div>
            <div style={{ fontSize: 9, color: "var(--dash-text-3,#9a9aaa)", marginTop: 1 }}>Événement actif</div>
          </div>
          <GIcon name="expand_more" size={14} color="var(--dash-text-3,#9a9aaa)" />
        </button>

        {eventOpen && (
          <div style={{
            position: "absolute", top: "calc(100% - 4px)", left: 14, right: 14,
            background: "var(--dash-surface, #fff)",
            border: "1px solid var(--dash-border, rgba(183,191,217,0.2))",
            borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            zIndex: 50, overflow: "hidden",
          }}>
            {events.map(e => (
              <div
                key={e.id}
                style={{
                  display: "flex", alignItems: "stretch",
                  background: e.id === activeEventId ? "var(--dash-faint, rgba(183,191,217,0.09))" : "transparent",
                }}
              >
                <button
                  onClick={() => { onEventChange(e.id); setEventOpen(false) }}
                  style={{
                    flex: 1, padding: "9px 14px",
                    display: "flex", alignItems: "center", gap: 9,
                    background: "transparent",
                    border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                  }}
                >
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: e.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 500, color: "var(--dash-text,#121317)", flex: 1 }}>{e.name}</span>
                  {e.id === activeEventId && <GIcon name="check" size={14} color="var(--g1,#E11D48)" />}
                </button>
                {/* Bouton supprimer inline — soft delete (corbeille 15j) */}
                <button
                  onClick={async (ev) => {
                    ev.stopPropagation()
                    if (!confirm(`Mettre "${e.name}" à la corbeille ? Vous pourrez le restaurer pendant 15 jours.`)) return
                    try {
                      const r = await fetch(`/api/planners/${e.id}`, { method: "DELETE" })
                      if (r.ok) {
                        try { if (localStorage.getItem("momento_active_event") === e.id) localStorage.removeItem("momento_active_event") } catch {}
                        setEventOpen(false)
                        // Reload pour rafraîchir la liste d'events dans tout le dashboard
                        window.location.href = "/accueil"
                      }
                    } catch {}
                  }}
                  title="Mettre à la corbeille"
                  style={{
                    width: 32, display: "flex", alignItems: "center", justifyContent: "center",
                    background: "transparent", border: "none", cursor: "pointer",
                    color: "var(--dash-text-3,#9a9aaa)",
                    transition: "color 0.15s, background 0.15s",
                  }}
                  onMouseEnter={ev => { (ev.currentTarget as HTMLElement).style.color = "#ef4444"; (ev.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.06)" }}
                  onMouseLeave={ev => { (ev.currentTarget as HTMLElement).style.color = "var(--dash-text-3,#9a9aaa)"; (ev.currentTarget as HTMLElement).style.background = "transparent" }}
                >
                  <GIcon name="delete" size={14} color="currentColor" />
                </button>
              </div>
            ))}
            <div style={{ borderTop: "1px solid var(--dash-divider, rgba(183,191,217,0.12))", padding: "8px 14px" }}>
              <button
                onClick={() => { setEventOpen(false); setShowCreateModal(true) }}
                style={{ fontSize: 11, color: "var(--dash-text-3,#9a9aaa)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, padding: 0, fontFamily: "inherit" }}
              >
                <GIcon name="add" size={13} color="var(--dash-text-3,#9a9aaa)" />
                Créer un événement
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "8px 10px", overflowY: "auto", scrollbarWidth: "none" }}>
        {NAV_ITEMS.map(item => {
          const isCurrent = pathname === item.href
          const isLocked = Boolean(item.pro && plan === "free")
          const rowStyle: React.CSSProperties = {
            display: "flex", alignItems: "center", gap: 10,
            padding: "8px 12px", borderRadius: 10, marginBottom: 1,
            textDecoration: "none",
            background: isCurrent
              ? "linear-gradient(135deg, rgba(225,29,72,0.07), rgba(147,51,234,0.05))"
              : "transparent",
            position: "relative", transition: "background 0.15s",
            opacity: isLocked ? 0.6 : 1,
          }
          const inner = (
            <>
              {isCurrent && (
                <div style={{
                  position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                  width: 3, height: 18, borderRadius: 99, background: G,
                }} />
              )}
              <GIcon name={item.icon} size={18} color={isCurrent ? "var(--g1,#E11D48)" : "var(--dash-text-2,#6a6a71)"} />
              <span style={{ fontSize: 13, fontWeight: isCurrent ? 600 : 400, color: isCurrent ? "var(--dash-text,#121317)" : "var(--dash-text-2,#45474D)", flex: 1 }}>
                {item.label}
              </span>
              {item.href === "/messages" && messageUnread > 0 && !isLocked && (
                <span style={{ fontSize: 10, fontWeight: 700, background: G, color: "#fff", padding: "1px 6px", borderRadius: 99, minWidth: 18, textAlign: "center" }}>
                  {messageUnread}
                </span>
              )}
              {isLocked && (
                <GIcon name="lock" size={13} color="var(--dash-text-3,#9a9aaa)" />
              )}
            </>
          )
          if (isLocked) {
            return (
              <button
                key={item.href}
                type="button"
                onClick={() => { setUpsellReason(itemToReason(item.href)); setUpsellOpen(true) }}
                style={{ ...rowStyle, border: "none", cursor: "pointer", fontFamily: "inherit", width: "100%", textAlign: "left" }}
              >
                {inner}
              </button>
            )
          }
          return (
            <Link key={item.href} href={item.href} style={rowStyle}>
              {inner}
            </Link>
          )
        })}
      </nav>

      {/* Dev tools — moumene486@gmail.com uniquement */}
      {canSwitch && <DevTools currentPlan={plan} />}

      {/* CTA */}
      <div style={{ padding: "10px 14px", borderTop: "1px solid var(--dash-divider, rgba(183,191,217,0.1))" }}>
        <Link href="/explore" style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          padding: "10px 14px", borderRadius: 11, background: G, color: "#fff",
          fontSize: 12, fontWeight: 600, textDecoration: "none",
          boxShadow: "0 3px 16px color-mix(in srgb, var(--g1,#E11D48) 25%, transparent)", transition: "opacity 0.15s",
        }}>
          <GIcon name="search" size={15} color="#fff" />
          Trouver un prestataire
        </Link>
      </div>

      {/* User profile + menu montant */}
      <div ref={menuRef} style={{ position: "relative", borderTop: "1px solid var(--dash-divider, rgba(183,191,217,0.1))" }}>

        {/* Popover menu — monte vers le haut */}
        {menuOpen && (
          <div style={{
            position: "absolute", bottom: "calc(100% + 8px)", left: 10, right: 10,
            background: "var(--dash-surface,#fff)",
            border: "1px solid var(--dash-border,rgba(183,191,217,0.2))",
            borderRadius: 16,
            boxShadow: "0 -8px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)",
            overflow: "hidden", zIndex: 50,
          }}>
            {/* Header utilisateur */}
            <Link href="/profile" onClick={() => setMenuOpen(false)} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, padding: "14px 14px 10px" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: G, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff" }}>
                {firstName[0]?.toUpperCase() ?? "U"}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--dash-text,#121317)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{firstName}</div>
                <div style={{ fontSize: 11, color: "var(--g1,#E11D48)", fontWeight: 500 }}>Voir mon profil →</div>
              </div>
            </Link>

            <div style={{ height: 1, background: "var(--dash-border,rgba(183,191,217,0.12))", margin: "0 10px" }} />

            {/* Liens rapides */}
            {[
              { icon: "person",        label: "Profil",        href: "/profile"       },
              { icon: "settings",      label: "Paramètres",    href: "/settings"      },
              { icon: "notifications", label: "Notifications", href: "/notifications" },
              { icon: "favorite",      label: "Favoris",       href: "/favorites"     },
              { icon: "chat_bubble",   label: "Messages",      href: "/messages"      },
              { icon: "delete",        label: "Corbeille",     href: "/accueil#corbeille" },
            ].map(item => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", textDecoration: "none",
                  background: pathname === item.href ? "rgba(225,29,72,0.06)" : "transparent",
                  color: pathname === item.href ? "var(--g1,#E11D48)" : "var(--dash-text,#121317)",
                  fontSize: 13, fontWeight: pathname === item.href ? 600 : 400,
                  transition: "background 0.1s",
                }}
                onMouseEnter={e => { if (pathname !== item.href) (e.currentTarget as HTMLElement).style.background = "var(--dash-faint-2,#f4f4f8)" }}
                onMouseLeave={e => { if (pathname !== item.href) (e.currentTarget as HTMLElement).style.background = "transparent" }}
              >
                <GIcon name={item.icon} size={16} color={pathname === item.href ? "var(--g1,#E11D48)" : "var(--dash-text-2,#6a6a71)"} />
                {item.label}
              </Link>
            ))}

            {/* Déconnexion */}
            <button onClick={() => signOut({ callbackUrl: "/" })}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px 14px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, color: "#ef4444", textAlign: "left" }}>
              <GIcon name="logout" size={16} color="#ef4444" />
              Se déconnecter
            </button>
          </div>
        )}

        {/* Bouton déclencheur */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          style={{
            width: "100%", padding: "10px 14px",
            display: "flex", alignItems: "center", gap: 10,
            background: menuOpen ? "var(--dash-faint-2,rgba(183,191,217,0.08))" : "transparent",
            border: "none", cursor: "pointer", fontFamily: "inherit",
            transition: "background 0.15s",
          }}
        >
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: G, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>
            {firstName[0]?.toUpperCase() ?? "U"}
          </div>
          <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--dash-text,#121317)" }}>{firstName}</div>
            <div style={{ fontSize: 10, color: "var(--dash-text-3,#9a9aaa)" }}>Mon compte</div>
          </div>
          <GIcon name={menuOpen ? "expand_more" : "expand_less"} size={16} color="var(--dash-text-3,#9a9aaa)" />
        </button>
      </div>
    </aside>

    <CreateEventModal
      open={showCreateModal}
      onClose={() => setShowCreateModal(false)}
      onCreated={(planner) => {
        setShowCreateModal(false)
        try { localStorage.setItem("momento_active_event", planner.id) } catch {}
        router.push("/dashboard")
        router.refresh()
      }}
    />

    <ProUpgradeModal
      open={upsellOpen}
      onClose={() => setUpsellOpen(false)}
      reason={upsellReason}
      onUpgraded={() => window.location.reload()}
    />
  </>
  )
}

// ─── Dev tools — moumene486@gmail.com uniquement ─────────────────────────────
function DevTools({ currentPlan }: { currentPlan: string }) {
  const [switching, setSwitching] = useState(false)
  const [changingPlan, setChangingPlan] = useState<string | null>(null)

  async function switchRole() {
    setSwitching(true)
    try {
      const r = await fetch("/api/dev/switch-role", { method: "POST" })
      if (r.ok) {
        const data = await r.json() as { role: string; redirect: string }
        window.location.href = data.redirect
      }
    } finally {
      setSwitching(false)
    }
  }

  async function switchPlan(plan: string) {
    setChangingPlan(plan)
    try {
      const r = await fetch("/api/dev/switch-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })
      if (r.ok) window.location.reload()
    } finally {
      setChangingPlan(null)
    }
  }

  return (
    <div style={{ padding: "10px 14px 0", display: "flex", flexDirection: "column", gap: 8 }}>
      {/* Switch role */}
      <button
        onClick={switchRole}
        disabled={switching}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
          padding: "9px 12px", borderRadius: 10,
          background: "var(--dash-faint, rgba(183,191,217,0.08))",
          border: "1px dashed var(--g1,#E11D48)",
          color: "var(--dash-text,#121317)",
          fontSize: 11, fontWeight: 600, cursor: switching ? "wait" : "pointer",
          fontFamily: "inherit", width: "100%", textAlign: "left",
        }}
        title="Bascule entre dashboard client et prestataire"
      >
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <GIcon name="swap_horiz" size={15} color="var(--g1,#E11D48)" />
          <span>{switching ? "Bascule…" : "Basculer client ↔ prestataire"}</span>
        </span>
        <span style={{
          fontSize: 8, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
          color: "var(--g1,#E11D48)", background: "rgba(225,29,72,0.1)",
          padding: "2px 5px", borderRadius: 4,
        }}>DEV</span>
      </button>

      {/* Plan selector */}
      <div style={{
        padding: "8px 12px", borderRadius: 10,
        background: "var(--dash-faint, rgba(183,191,217,0.08))",
        border: "1px dashed var(--g1,#E11D48)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--dash-text-2,#6a6a71)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Plan : {currentPlan}
          </span>
          <span style={{
            fontSize: 8, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
            color: "var(--g1,#E11D48)", background: "rgba(225,29,72,0.1)",
            padding: "2px 5px", borderRadius: 4,
          }}>DEV</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4 }}>
          {(["free", "pro", "max"] as const).map(p => (
            <button
              key={p}
              onClick={() => switchPlan(p)}
              disabled={changingPlan !== null || currentPlan === p}
              style={{
                padding: "6px 4px", borderRadius: 7,
                border: currentPlan === p ? "1.5px solid var(--g1,#E11D48)" : "1px solid var(--dash-border,rgba(183,191,217,0.3))",
                background: currentPlan === p ? "rgba(225,29,72,0.08)" : "var(--dash-surface,#fff)",
                color: currentPlan === p ? "var(--g1,#E11D48)" : "var(--dash-text,#121317)",
                fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                cursor: (changingPlan !== null || currentPlan === p) ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                opacity: changingPlan === p ? 0.5 : 1,
              }}
            >
              {changingPlan === p ? "…" : p}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
