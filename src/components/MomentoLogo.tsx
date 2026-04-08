"use client"

import Image from "next/image"
import Link from "next/link"

interface MomentoLogoProps {
  /** icon = O mark only | badge = full circle badge | wordmark = icon + "Momento" text */
  variant?: "icon" | "badge" | "wordmark"
  iconSize?: number
  href?: string
  className?: string
}

/**
 * Official Momento logo component.
 * Uses transparent PNGs — no CSS blend-mode hacks needed.
 * logo-dark.png  = dark O on transparent bg (for light backgrounds)
 * logo-light.png = white O on transparent bg (for dark backgrounds)
 */
export function MomentoLogo({
  variant = "wordmark",
  iconSize = 32,
  href = "/",
  className = "",
}: MomentoLogoProps) {
  const isBadge = variant === "badge"
  const sz = isBadge ? iconSize : iconSize

  const icon = (
    <span className={`flex items-center gap-2.5 ${className}`}>
      {/* Light mode */}
      <Image
        src={isBadge ? "/logo-badge-dark.png" : "/logo-dark.png"}
        alt="Momento"
        width={sz}
        height={sz}
        className="dark:hidden"
        style={{ objectFit: "contain", width: sz, height: sz }}
        priority
      />
      {/* Dark mode */}
      <Image
        src={isBadge ? "/logo-badge-light.png" : "/logo-light.png"}
        alt="Momento"
        width={sz}
        height={sz}
        className="hidden dark:block"
        style={{ objectFit: "contain", width: sz, height: sz }}
        priority
      />
      {variant === "wordmark" && (
        <span
          style={{
            fontFamily: "var(--font-geist-sans), 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            fontWeight: 600,
            fontSize: "1.05rem",
            letterSpacing: "-0.01em",
            color: "var(--momento-white)",
            lineHeight: 1,
          }}
        >
          Momento
        </span>
      )}
    </span>
  )

  return href ? <Link href={href}>{icon}</Link> : icon
}
