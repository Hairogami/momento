"use client"
/**
 * Sidebar de l'espace prestataire — esthétique SaaS pro (Linear/Stripe).
 * Active state : gradient brand + texte blanc.
 * Lien externe "Voir ma fiche" en bas.
 */
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

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
      { href: "/vendor/dashboard/inbox",     label: "Messages",    icon: "chat_bubble" },
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
  const [messageUnread, setMessageUnread] = useState<number>(0)

  const isActive = useMemo(() => (href: string) => {
    if (href === "/vendor/dashboard") return pathname === href
    return pathname?.startsWith(href) ?? false
  }, [pathname])

  // Polling 30s + listener "momento-unread-changed" pour décrément immédiat
  // à l'ouverture d'une conversation. Cohérent avec DashSidebar côté client.
  useEffect(() => {
    let cancelled = false
    async function refresh() {
      try {
        const r = await fetch("/api/unread", { cache: "no-store" })
        if (r.ok) {
          const d = await r.json()
          if (!cancelled && typeof d?.messages === "number") setMessageUnread(d.messages)
        }
      } catch {}
    }
    // Page Visibility : 5s actif (perçu temps réel), 60s caché.
    let id: ReturnType<typeof setInterval> | null = null
    function startPolling() {
      if (id) clearInterval(id)
      const interval = typeof document !== "undefined" && document.visibilityState === "visible" ? 5000 : 60000
      id = setInterval(refresh, interval)
    }
    function onVisibility() {
      startPolling()
      if (document.visibilityState === "visible") void refresh()
    }
    void refresh()
    startPolling()
    document.addEventListener("visibilitychange", onVisibility)
    const onChanged = () => { void refresh() }
    window.addEventListener("momento-unread-changed", onChanged)
    return () => {
      cancelled = true
      if (id) clearInterval(id)
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("momento-unread-changed", onChanged)
    }
  }, [])

  return (
    <aside
      style={{
        width: 240, flexShrink: 0,
        background: "var(--dash-surface)",
        borderRight: "1px solid var(--dash-border)",
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
                fontSize: "var(--text-2xs)", fontWeight: 600, color: "var(--dash-text-3)",
                textTransform: "uppercase", letterSpacing: "0.06em",
                padding: "8px 12px 4px",
              }}>
                {section.title}
              </div>
            )}
            {section.items.map(item => {
              const active = isActive(item.href)
              const liveBadge = item.href === "/vendor/dashboard/inbox" ? messageUnread : (item.badge ?? 0)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 12px", borderRadius: 8,
                    fontSize: "var(--text-sm)", fontWeight: active ? 600 : 500,
                    color: active ? "#fff" : "var(--dash-text)",
                    background: active
                      ? "linear-gradient(135deg,#E11D48,#9333EA)"
                      : "transparent",
                    textDecoration: "none",
                    transition: "background 120ms ease",
                  }}
                >
                  <Icon name={item.icon} size={18} color={active ? "#fff" : "var(--dash-text-2)"} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {liveBadge > 0 && (
                    <span style={{
                      fontSize: "var(--text-2xs)", fontWeight: 700,
                      padding: "2px 7px", borderRadius: 999,
                      background: active ? "rgba(255,255,255,0.25)" : "#E11D48",
                      color: "#fff",
                    }}>
                      {liveBadge}
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
        <div style={{ padding: 10, borderTop: "1px solid var(--dash-border)" }}>
          <Link
            href={`/vendor/${publicSlug}`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 8,
              background: "var(--dash-faint-2)",
              textDecoration: "none",
              fontSize: "var(--text-xs)", color: "var(--dash-text)",
            }}
          >
            <Icon name="open_in_new" size={16} color="var(--dash-text-2)" />
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
