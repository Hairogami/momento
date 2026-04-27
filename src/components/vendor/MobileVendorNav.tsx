// src/components/vendor/MobileVendorNav.tsx
"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"

function GIcon({ name, size = 22, color }: { name: string; size?: number; color?: string }) {
  return (
    <span style={{
      fontFamily: "'Google Symbols','Material Symbols Outlined'",
      fontSize: size, color: color ?? "inherit", fontWeight: "normal", fontStyle: "normal",
      lineHeight: 1, userSelect: "none", display: "block",
    }}>{name}</span>
  )
}

const PRIMARY = [
  { icon: "home",        label: "Accueil",    href: "/vendor/dashboard"           },
  { icon: "chat_bubble", label: "Demandes",   href: "/vendor/dashboard/inbox"     },
  { icon: "inventory_2", label: "Packages",   href: "/vendor/dashboard/packages"  },
  { icon: "person",      label: "Profil",     href: "/vendor/dashboard/profil"    },
]

const ALL = [
  { icon: "home",        label: "Accueil",      href: "/vendor/dashboard"           },
  { icon: "chat_bubble", label: "Demandes",     href: "/vendor/dashboard/inbox"     },
  { icon: "inventory_2", label: "Packages",     href: "/vendor/dashboard/packages"  },
  { icon: "description", label: "Templates",    href: "/vendor/dashboard/templates" },
  { icon: "person",      label: "Mon profil",   href: "/vendor/dashboard/profil"    },
  { icon: "explore",     label: "Explorer",     href: "/explore"                    },
]

export default function MobileVendorNav() {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
        background: "var(--dash-surface,#fff)",
        borderTop: "1px solid var(--dash-border,rgba(183,191,217,0.2))",
        display: "flex", alignItems: "stretch", height: 64,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}>
        {PRIMARY.map(item => {
          const active = pathname === item.href
          return (
            <Link key={item.href + item.label} href={item.href} style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: 3, textDecoration: "none", position: "relative",
            }}>
              <GIcon name={item.icon} size={22} color={active ? "var(--g1,#E11D48)" : "var(--dash-text-3,#9a9aaa)"} />
              <span style={{ fontSize: "var(--text-2xs)", fontWeight: active ? 600 : 400, color: active ? "var(--g1,#E11D48)" : "var(--dash-text-3,#9a9aaa)" }}>{item.label}</span>
              {active && <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 24, height: 2, borderRadius: 99, background: G }} />}
            </Link>
          )
        })}
        <button onClick={() => setDrawerOpen(true)} style={{
          flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: 3, background: "none", border: "none",
          cursor: "pointer", fontFamily: "inherit",
        }}>
          <GIcon name="menu" size={22} color="var(--dash-text-3,#9a9aaa)" />
          <span style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3,#9a9aaa)" }}>Menu</span>
        </button>
      </nav>

      {drawerOpen && (
        <>
          <div onClick={() => setDrawerOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200 }} />
          <div style={{
            position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 201,
            background: "var(--dash-surface,#fff)",
            borderRadius: "20px 20px 0 0",
            padding: "20px 0 calc(24px + env(safe-area-inset-bottom))",
            maxHeight: "80vh", overflowY: "auto",
          }}>
            <div style={{ width: 36, height: 4, borderRadius: 99, background: "var(--dash-border,rgba(183,191,217,0.4))", margin: "0 auto 20px" }} />
            {ALL.map(item => {
              const active = pathname === item.href
              return (
                <Link key={item.href + item.label} href={item.href} onClick={() => setDrawerOpen(false)} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "13px 24px", textDecoration: "none",
                  background: active ? "linear-gradient(135deg,rgba(225,29,72,0.07),rgba(147,51,234,0.05))" : "transparent",
                }}>
                  <GIcon name={item.icon} size={20} color={active ? "var(--g1,#E11D48)" : "var(--dash-text-2,#6a6a71)"} />
                  <span style={{ fontSize: "var(--text-base)", fontWeight: active ? 600 : 400, color: active ? "var(--dash-text,#121317)" : "var(--dash-text-2,#45474D)" }}>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </>
  )
}
