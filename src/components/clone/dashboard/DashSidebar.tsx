"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"

const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"

const NAV_ITEMS = [
  { icon: "home",                    label: "Accueil",  href: "/clone/accueil"   },
  { icon: "dashboard",               label: "Dashboard",href: "/clone/dashboard" },
  { icon: "account_balance_wallet",  label: "Budget",   href: "/clone/budget"    },
  { icon: "groups",                  label: "Invités",  href: "/clone/guests"    },
  { icon: "chat_bubble",             label: "Messages", href: "/clone/messages"  },
  { icon: "event_note",              label: "Planning", href: "/clone/planner"   },
  { icon: "favorite",                label: "Favoris",  href: "/clone/favorites" },
]

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

export default function DashSidebar({ events, activeEventId, onEventChange, firstName = "Y", messageUnread = 0 }: DashSidebarProps) {
  const pathname   = usePathname()
  const [eventOpen, setEventOpen] = useState(false)
  const [darkMode,  setDarkMode]  = useState(false)
  const activeEvent = events.find(e => e.id === activeEventId) ?? events[0]

  // Lire dark mode depuis localStorage au montage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("momento_clone_dark_mode")
      if (saved && JSON.parse(saved)) setDarkMode(true)
    } catch {}
  }, [])

  function toggleDark() {
    const next = !darkMode
    setDarkMode(next)
    document.documentElement.classList.toggle("dark", next)
    try { localStorage.setItem("momento_clone_dark_mode", JSON.stringify(next)) } catch {}
  }

  return (
    <aside style={{
      width: 240, flexShrink: 0,
      height: "100vh", position: "sticky", top: 0,
      display: "flex", flexDirection: "column",
      background: "var(--dash-surface, #fff)",
      borderRight: "1px solid var(--dash-border, rgba(183,191,217,0.15))",
      zIndex: 30,
    }}>

      {/* Logo */}
      <div style={{ padding: "18px 20px 16px", borderBottom: "1px solid var(--dash-divider, rgba(183,191,217,0.1))" }}>
        <Link href="/clone" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9, background: G,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, boxShadow: "0 2px 10px rgba(225,29,72,0.3)",
          }}>
            <span style={{ color: "#fff", fontSize: 13, fontWeight: 800, letterSpacing: "-0.03em" }}>M</span>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--dash-text,#121317)", letterSpacing: "-0.03em", lineHeight: 1.1 }}>Momento</div>
            <div style={{ fontSize: 9, color: "var(--dash-text-3,#9a9aaa)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Espace client</div>
          </div>
        </Link>
      </div>

      {/* Event switcher */}
      <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--dash-divider, rgba(183,191,217,0.08))", position: "relative" }}>
        <button
          onClick={() => setEventOpen(o => !o)}
          style={{
            width: "100%", padding: "9px 12px",
            background: "var(--dash-faint, rgba(183,191,217,0.07))",
            border: "1px solid var(--dash-border, rgba(183,191,217,0.18))",
            borderRadius: 11,
            display: "flex", alignItems: "center", gap: 9,
            cursor: "pointer", fontFamily: "inherit", textAlign: "left",
          }}
        >
          <div style={{
            width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
            background: activeEvent?.color ?? "#E11D48",
            boxShadow: `0 0 6px ${activeEvent?.color ?? "#E11D48"}80`,
          }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--dash-text,#121317)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {activeEvent?.name ?? "Mon événement"}
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
              <button
                key={e.id}
                onClick={() => { onEventChange(e.id); setEventOpen(false) }}
                style={{
                  width: "100%", padding: "9px 14px",
                  display: "flex", alignItems: "center", gap: 9,
                  background: e.id === activeEventId ? "var(--dash-faint, rgba(183,191,217,0.09))" : "transparent",
                  border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                }}
              >
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: e.color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--dash-text,#121317)", flex: 1 }}>{e.name}</span>
                {e.id === activeEventId && <GIcon name="check" size={14} color="var(--g1,#E11D48)" />}
              </button>
            ))}
            <div style={{ borderTop: "1px solid var(--dash-divider, rgba(183,191,217,0.12))", padding: "8px 14px" }}>
              <Link href="/clone/planner" style={{ fontSize: 11, color: "var(--dash-text-3,#9a9aaa)", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
                <GIcon name="add" size={13} color="var(--dash-text-3,#9a9aaa)" />
                Créer un événement
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "8px 10px", overflowY: "auto", scrollbarWidth: "none" }}>
        {NAV_ITEMS.map(item => {
          const isCurrent = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 12px", borderRadius: 10, marginBottom: 1,
                textDecoration: "none",
                background: isCurrent
                  ? "linear-gradient(135deg, rgba(225,29,72,0.07), rgba(147,51,234,0.05))"
                  : "transparent",
                position: "relative", transition: "background 0.15s",
              }}
            >
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
              {item.href === "/clone/messages" && messageUnread > 0 && (
                <span style={{ fontSize: 10, fontWeight: 700, background: G, color: "#fff", padding: "1px 6px", borderRadius: 99, minWidth: 18, textAlign: "center" }}>
                  {messageUnread}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* CTA */}
      <div style={{ padding: "10px 14px", borderTop: "1px solid var(--dash-divider, rgba(183,191,217,0.1))" }}>
        <Link href="/clone/explore" style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          padding: "10px 14px", borderRadius: 11, background: G, color: "#fff",
          fontSize: 12, fontWeight: 600, textDecoration: "none",
          boxShadow: "0 3px 16px rgba(225,29,72,0.25)", transition: "opacity 0.15s",
        }}>
          <GIcon name="search" size={15} color="#fff" />
          Trouver un prestataire
        </Link>
      </div>

      {/* User profile + dark mode toggle */}
      <div style={{
        padding: "10px 14px",
        display: "flex", alignItems: "center", gap: 10,
        borderTop: "1px solid var(--dash-divider, rgba(183,191,217,0.1))",
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%", background: G, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 700, color: "#fff",
        }}>{firstName[0]?.toUpperCase() ?? "U"}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--dash-text,#121317)" }}>{firstName}</div>
          <div style={{ fontSize: 10, color: "var(--dash-text-3,#9a9aaa)" }}>Pro · Casablanca</div>
        </div>
        {/* Dark mode toggle pill */}
        <button
          onClick={toggleDark}
          title={darkMode ? "Mode clair" : "Mode sombre"}
          style={{
            width: 34, height: 20, borderRadius: 99, border: "none", cursor: "pointer",
            background: darkMode ? "var(--g1,#E11D48)" : "var(--dash-faint-2, rgba(183,191,217,0.2))",
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
        <Link href="/clone/dashboard" style={{ textDecoration: "none", display: "flex" }}>
          <GIcon name="settings" size={18} color="var(--dash-text-3,#9a9aaa)" />
        </Link>
      </div>
    </aside>
  )
}
