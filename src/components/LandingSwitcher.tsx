"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

// Pages clone existantes — mettre à jour au fur et à mesure
const CLONE_PAGES = new Set([
  "/",
  "/explore",
  "/vendor",      // prefix — matchera /vendor/[slug]
  "/login",
  "/signup",
  "/prestataires",
  "/prestataire",
  "/accueil",
  "/dashboard",
])

function getAlternateHref(pathname: string): string {
  if (pathname.startsWith("/clone")) {
    const v1 = pathname.slice("/clone".length) || "/"
    return v1
  }
  // Vérifier si la page clone existe (exact ou par préfixe)
  const hasClone =
    CLONE_PAGES.has(pathname) ||
    [...CLONE_PAGES].some(p => p !== "/" && pathname.startsWith(p))
  if (hasClone) {
    return "/clone" + (pathname === "/" ? "" : pathname)
  }
  // Page sans équivalent clone → pointer vers /clone (landing)
  return "/clone"
}

function isOnClone(pathname: string): boolean {
  return pathname.startsWith("/clone")
}

export default function LandingSwitcher() {
  const pathname = usePathname()
  const onClone = isOnClone(pathname)
  const alternate = getAlternateHref(pathname)

  const pages = [
    { label: "1", active: !onClone, href: onClone ? alternate : "#" },
    { label: "2", active: onClone,  href: onClone ? "#"       : alternate },
  ]

  return (
    <div style={{
      position: "fixed",
      left: 10,
      top: "50%",
      transform: "translateY(-50%)",
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      gap: 6,
    }}>
      {pages.map(({ label, href, active }) => (
        <Link
          key={label}
          href={href}
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 700,
            background: active
              ? "linear-gradient(135deg, #E11D48, #9333EA)"
              : "rgba(255,255,255,0.85)",
            color: active ? "#fff" : "#6a6a71",
            border: active ? "none" : "1px solid rgba(183,191,217,0.4)",
            textDecoration: "none",
            backdropFilter: "blur(8px)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            transition: "all 0.2s",
            pointerEvents: active ? "none" : "auto",
            opacity: active ? 1 : 0.85,
          }}
        >
          {label}
        </Link>
      ))}
    </div>
  )
}
