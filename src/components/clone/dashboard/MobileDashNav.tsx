// src/components/clone/dashboard/MobileDashNav.tsx
"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"

const PRIMARY_ITEMS = [
  { icon: "home",        label: "Accueil",  href: "/accueil"   },
  { icon: "dashboard",   label: "Mon Planner",href: "/dashboard" },
  { icon: "chat_bubble", label: "Messages", href: "/messages"  },
  { icon: "search",      label: "Explorer", href: "/explore"   },
]

const ALL_ITEMS = [
  { icon: "home",                   label: "Accueil",      href: "/accueil"       },
  { icon: "dashboard",              label: "Mon Planner",    href: "/dashboard"     },
  { icon: "account_balance_wallet", label: "Budget",       href: "/budget"        },
  { icon: "groups",                 label: "Invités",      href: "/guests"        },
  { icon: "chat_bubble",            label: "Messages",     href: "/messages"      },
  { icon: "event_note",             label: "Planning",     href: "/planner"       },
  { icon: "favorite",               label: "Favoris",      href: "/favorites"     },
  { icon: "search",                 label: "Explorer",     href: "/explore"       },
  { icon: "person",                 label: "Profil",       href: "/profile"       },
  { icon: "settings",               label: "Paramètres",   href: "/settings"      },
  { icon: "notifications",          label: "Notifications",href: "/notifications" },
  { icon: "delete",                 label: "Corbeille",    href: "/accueil#corbeille" },
]

function GIcon({ name, size = 22, color }: { name: string; size?: number; color?: string }) {
  return (
    <span style={{
      fontFamily: "'Google Symbols','Material Symbols Outlined'",
      fontSize: size, color: color ?? "inherit", fontWeight: "normal", fontStyle: "normal",
      lineHeight: 1, userSelect: "none", display: "block",
    }}>{name}</span>
  )
}

export interface MobileDashNavEvent {
  id: string
  name: string
  color: string
}

export interface MobileDashNavProps {
  messageUnread?: number
  events?: MobileDashNavEvent[]
  activeEventId?: string
  onEventChange?: (id: string) => void
}

export default function MobileDashNav({ messageUnread = 0, events = [], activeEventId, onEventChange }: MobileDashNavProps) {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Portal cible = document.body (évite containing-block parent qui casse position:fixed sur iOS)
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  const node = (
    <>
      {/* Bottom nav bar — position fixed sur viewport (rendu au niveau body via portal) */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
        background: "var(--dash-surface,#fff)",
        borderTop: "1px solid var(--dash-border,rgba(183,191,217,0.2))",
        display: "flex", alignItems: "stretch",
        height: 64,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
      className="lg:!hidden"
      aria-label="Navigation mobile">
        {PRIMARY_ITEMS.map(item => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href} style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: 3, textDecoration: "none",
              position: "relative",
            }}>
              <div style={{ position: "relative" }}>
                <GIcon
                  name={item.icon} size={22}
                  color={active ? "var(--g1,#E11D48)" : "var(--dash-text-3,#9a9aaa)"}
                />
                {item.href === "/messages" && messageUnread > 0 && (
                  <span style={{
                    position: "absolute", top: -4, right: -6,
                    width: 14, height: 14, borderRadius: "50%",
                    background: G, color: "#fff",
                    fontSize: "var(--text-2xs)", fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{messageUnread}</span>
                )}
              </div>
              <span style={{
                fontSize: "var(--text-2xs)", fontWeight: active ? 600 : 400,
                color: active ? "var(--g1,#E11D48)" : "var(--dash-text-3,#9a9aaa)",
              }}>{item.label}</span>
              {active && (
                <div style={{
                  position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                  width: 24, height: 2, borderRadius: 99, background: G,
                }} />
              )}
            </Link>
          )
        })}

        {/* Menu button */}
        <button onClick={() => setDrawerOpen(true)} style={{
          flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: 3, background: "none", border: "none",
          cursor: "pointer", fontFamily: "inherit",
        }} aria-label="Ouvrir le menu de navigation">
          <GIcon name="menu" size={22} color="var(--dash-text-3,#9a9aaa)" />
          <span style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3,#9a9aaa)" }}>Menu</span>
        </button>
      </nav>

      {/* Drawer overlay */}
      {drawerOpen && (
        <>
          <div
            onClick={() => setDrawerOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200 }}
          />
          <div style={{
            position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 201,
            background: "var(--dash-surface,#fff)",
            borderRadius: "20px 20px 0 0",
            padding: "20px 0 calc(24px + env(safe-area-inset-bottom))",
            maxHeight: "80vh", overflowY: "auto",
          }}>
            <div style={{ width: 36, height: 4, borderRadius: 99, background: "var(--dash-border,rgba(183,191,217,0.4))", margin: "0 auto 20px" }} />

            {/* Event switcher (header) — visible si events fournis */}
            {events.length > 0 && onEventChange && (
              <div style={{ padding: "0 20px 14px", borderBottom: "1px solid var(--dash-divider,rgba(183,191,217,0.10))", marginBottom: 14 }}>
                <p style={{ fontSize: "var(--text-2xs)", fontWeight: 600, color: "var(--dash-text-3,#9a9aaa)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 8px" }}>Mes événements</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {events.map(e => {
                    const active = e.id === activeEventId
                    return (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => { onEventChange(e.id); setDrawerOpen(false) }}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "10px 12px", borderRadius: 10,
                          background: active ? "var(--dash-faint,rgba(183,191,217,0.09))" : "transparent",
                          border: "none", cursor: "pointer", fontFamily: "inherit",
                          textAlign: "left", width: "100%",
                        }}
                      >
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: e.color, flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: "var(--text-sm)", fontWeight: active ? 600 : 500, color: "var(--dash-text,#121317)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</span>
                        {active && <GIcon name="check" size={16} color="var(--g1,#E11D48)" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {ALL_ITEMS.map(item => {
              const active = pathname === item.href
              return (
                <Link key={item.href} href={item.href} onClick={() => setDrawerOpen(false)} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "13px 24px", textDecoration: "none",
                  background: active ? "linear-gradient(135deg,rgba(225,29,72,0.07),rgba(147,51,234,0.05))" : "transparent",
                }}>
                  <GIcon name={item.icon} size={20} color={active ? "var(--g1,#E11D48)" : "var(--dash-text-2,#6a6a71)"} />
                  <span style={{
                    fontSize: "var(--text-base)", fontWeight: active ? 600 : 400,
                    color: active ? "var(--dash-text,#121317)" : "var(--dash-text-2,#45474D)",
                  }}>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </>
  )

  return createPortal(node, document.body)
}
