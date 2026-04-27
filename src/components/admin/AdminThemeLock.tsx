"use client"

import { useEffect } from "react"

/**
 * Force dark mode sur toute la zone /admin et restore le thème user au unmount.
 * Aucun toggle clear/light ne doit apparaître dans cette section — l'admin est
 * une UI dense et data-heavy, optimisée pour le dark.
 */
export default function AdminThemeLock() {
  useEffect(() => {
    const html = document.documentElement
    const hadDark = html.classList.contains("dark")
    const hadCloneDark = html.classList.contains("clone-dark")
    const prevColorScheme = html.style.colorScheme

    html.classList.add("dark", "clone-dark")
    html.style.colorScheme = "dark"

    return () => {
      if (!hadDark) html.classList.remove("dark")
      if (!hadCloneDark) html.classList.remove("clone-dark")
      // Restore user's previous color-scheme (light/dark) au lieu de tout effacer,
      // sinon retour à /dashboard = flash UA controls (FOUC).
      html.style.colorScheme = prevColorScheme
    }
  }, [])

  return null
}
