"use client"
/**
 * Sidebar de l'espace prestataire — esthétique SaaS pro (Linear/Stripe).
 * Active state : gradient brand + texte blanc.
 * Lien externe "Voir ma fiche" en bas.
 */
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMemo } from "react"

type NavItem = {
  href: string
  label: string
  icon: string // Google Symbols character / emoji fallback
  badge?: number
}

type NavSection = { title?: string; items: NavItem[] }

const SECTIONS: NavSection[] = [
  {
    items: [
      { href: "/vendor/dashboard",           label: "Accueil",     icon: "home" },
      { href: "/vendor/dashboard/inbox",     label: "Inbox",       icon: "inbox" },
      { href: "/vendor/dashboard/stats",     label: "Statistiques", icon: "analytics" },
    ],
  },
  {
    title: "Fiche publique",
    items: [
      { href: "/vendor/dashboard/profil",    label: "Profil",      icon: "person" },
      { href: "/vendor/dashboard/packages",  label: "Packages",    icon: "sell" },
      { href: "/vendor/dashboard/templates", label: "Templates",   icon: "mail" },
    ],
  },
  {
    title: "Compte",
    items: [
      { href: "/vendor/dashboard/settings",  label: "Paramètres",  icon: "settings" },
    ],
  },
]

export default function VendorSidebar({ publicSlug }: { publicSlug: string | null }) {
  const pathname = usePathname()

  const isActive = useMemo(() => (href: string) => {
    if (href === "/vendor/dashboard") return pathname === href
    return pathname?.startsWith(href) ?? false
  }, [pathname])

  return (
    <aside
      style={{
        width: 240, flexShrink: 0,
        background: "#ffffff",
        borderRight: "1px solid rgba(183,191,217,0.22)",
        display: "flex", flexDirection: "column",
        position: "sticky", top: 56, height: "calc(100vh - 56px)",
        overflowY: "auto",
      }}
    >
      <nav style={{ padding: "16px 10px", display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
        {SECTIONS.map((section, idx) => (
          <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {section.title && (
              <div style={{
                fontSize: 10.5, fontWeight: 600, color: "#8a8f9c",
                textTransform: "uppercase", letterSpacing: "0.06em",
                padding: "8px 12px 4px",
              }}>
                {section.title}
              </div>
            )}
            {section.items.map(item => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 12px", borderRadius: 8,
                    fontSize: 13, fontWeight: active ? 600 : 500,
                    color: active ? "#fff" : "#2b2d33",
                    background: active
                      ? "linear-gradient(135deg,#E11D48,#9333EA)"
                      : "transparent",
                    textDecoration: "none",
                    transition: "background 120ms ease",
                  }}
                >
                  <Icon name={item.icon} size={18} color={active ? "#fff" : "#6a6a71"} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {typeof item.badge === "number" && item.badge > 0 && (
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      padding: "2px 7px", borderRadius: 999,
                      background: active ? "rgba(255,255,255,0.25)" : "#E11D48",
                      color: "#fff",
                    }}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Public profile link — distinct bottom card */}
      {publicSlug && (
        <div style={{ padding: 10, borderTop: "1px solid rgba(183,191,217,0.22)" }}>
          <Link
            href={`/vendor/${publicSlug}`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 8,
              background: "#f4f5f9",
              textDecoration: "none",
              fontSize: 12, color: "#2b2d33",
            }}
          >
            <Icon name="open_in_new" size={16} color="#6a6a71" />
            <span style={{ flex: 1 }}>Voir ma fiche publique</span>
          </Link>
        </div>
      )}
    </aside>
  )
}

function Icon({ name, size = 18, color }: { name: string; size?: number; color?: string }) {
  return (
    <span
      style={{
        fontFamily: "'Google Symbols','Material Symbols Outlined'",
        fontWeight: "normal", fontStyle: "normal",
        fontSize: size, color: color ?? "inherit",
        lineHeight: 1, userSelect: "none",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: size, height: size,
      }}
    >
      {name}
    </span>
  )
}
