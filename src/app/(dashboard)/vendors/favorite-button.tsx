"use client"

import { useEffect, useState } from "react"
import { Heart } from "lucide-react"
import { C } from "@/lib/colors"

const STORAGE_KEY = "momento_favorites"

function readFavorites(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function FavoriteButton({ vendorId }: { vendorId: string }) {
  const [active, setActive] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setActive(readFavorites().includes(vendorId))
  }, [vendorId])

  function toggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const current = readFavorites()
    const next = current.includes(vendorId)
      ? current.filter((id) => id !== vendorId)
      : [...current, vendorId]
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // ignore
    }
    setActive(next.includes(vendorId))
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={active ? "Retirer des favoris" : "Ajouter aux favoris"}
      title={active ? "Retirer des favoris" : "Ajouter aux favoris"}
      className="w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110 shrink-0"
      style={{
        backgroundColor: "rgba(255,255,255,0.92)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
      }}
    >
      <Heart
        size={16}
        fill={mounted && active ? C.terra : "transparent"}
        color={C.terra}
        strokeWidth={2}
      />
    </button>
  )
}
