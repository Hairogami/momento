"use client"

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react"

/**
 * Theme = choix utilisateur ("system" | "light" | "dark")
 * Resolved = rendu réel en CSS ("light" | "dark"). Si theme="system", lu depuis prefers-color-scheme.
 * Nouveau défaut : "system" (suit l'OS).
 */
export type Theme = "system" | "light" | "dark"
export type ResolvedTheme = "light" | "dark"
export type Palette = "creme" | "ocean" | "forest" | "ardoise"

interface ThemeContextValue {
  theme: Theme
  resolved: ResolvedTheme
  palette: Palette
  setTheme: (t: Theme) => void
  toggleTheme: () => void
  setPalette: (p: Palette) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  resolved: "light",
  palette: "creme",
  setTheme: () => {},
  toggleTheme: () => {},
  setPalette: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

const PALETTE_CLASSES: Record<Palette, string> = {
  creme: "",
  ocean: "palette-ocean",
  forest: "palette-forest",
  ardoise: "palette-ardoise",
}

function systemPrefersDark(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false
}

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === "system") return systemPrefersDark() ? "dark" : "light"
  return theme
}

function applyTheme(resolved: ResolvedTheme, palette: Palette) {
  const html = document.documentElement
  if (resolved === "dark") {
    html.classList.add("dark")
    html.classList.add("clone-dark")
  } else {
    html.classList.remove("dark")
    html.classList.remove("clone-dark")
  }
  html.classList.remove("palette-ocean", "palette-forest", "palette-ardoise")
  const cls = PALETTE_CLASSES[palette]
  if (cls) html.classList.add(cls)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system")
  const [resolved, setResolved] = useState<ResolvedTheme>("light")
  const [palette, setPaletteState] = useState<Palette>("creme")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem("momento_theme")
    // Migration : anciennes valeurs "auto" (settings) → "system"
    const saved: Theme =
      raw === "auto" ? "system"
      : raw === "light" || raw === "dark" || raw === "system" ? raw
      : "system"
    const savedPalette = (localStorage.getItem("momento_palette") as Palette) ?? "creme"
    setThemeState(saved)
    setPaletteState(savedPalette)
    const r = resolveTheme(saved)
    setResolved(r)
    applyTheme(r, savedPalette)
    setMounted(true)

    // Écoute les changements OS quand le mode est "system"
    if (typeof window === "undefined") return
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => {
      const current = localStorage.getItem("momento_theme")
      if (current === "system" || current === null) {
        const nr: ResolvedTheme = mq.matches ? "dark" : "light"
        setResolved(nr)
        applyTheme(nr, (localStorage.getItem("momento_palette") as Palette) ?? "creme")
      }
    }
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    localStorage.setItem("momento_theme", next)
    const r = resolveTheme(next)
    setResolved(r)
    applyTheme(r, palette)
  }, [palette])

  const toggleTheme = useCallback(() => {
    // Cycle : system → light → dark → system
    setThemeState(prev => {
      const next: Theme = prev === "system" ? "light" : prev === "light" ? "dark" : "system"
      localStorage.setItem("momento_theme", next)
      const r = resolveTheme(next)
      setResolved(r)
      applyTheme(r, palette)
      return next
    })
  }, [palette])

  const setPalette = useCallback((p: Palette) => {
    setPaletteState(p)
    localStorage.setItem("momento_palette", p)
    applyTheme(resolved, p)
  }, [resolved])

  if (!mounted) return <>{children}</>

  return (
    <ThemeContext.Provider value={{ theme, resolved, palette, setTheme, toggleTheme, setPalette }}>
      {children}
    </ThemeContext.Provider>
  )
}

// ── ThemeToggle ──────────────────────────────────────────────────────────────

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, resolved, toggleTheme } = useTheme()

  const labelMap: Record<Theme, string> = {
    system: "Préférence système (clic : passer en clair)",
    light: "Mode clair (clic : passer en sombre)",
    dark: "Mode sombre (clic : suivre le système)",
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={labelMap[theme]}
      title={labelMap[theme]}
      className={`w-9 h-9 flex items-center justify-center rounded-full transition-all hover:opacity-70 ${className}`}
      style={{ color: "var(--text)" }}
    >
      {theme === "system" ? (
        /* Monitor icon — suit le système */
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ) : resolved === "dark" ? (
        /* Sun icon */
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        /* Moon icon */
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  )
}
