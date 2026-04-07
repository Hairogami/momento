"use client"

import Image from "next/image"

interface MomentoLogoProps {
  size?: number
  variant?: "dark" | "light"
  showWordmark?: boolean
  className?: string
}

export function MomentoLogo({
  size = 36,
  className = "",
}: MomentoLogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="Momento"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: "contain", mixBlendMode: "screen", display: "block" }}
      priority
    />
  )
}
