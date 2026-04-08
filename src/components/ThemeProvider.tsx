"use client"

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react"

export type Theme = "light" | "dark"
export type Palette = "creme" | "ocean" | "forest" | "ardoise"

interface ThemeContextValue {
  theme: Theme
  palette: Palette
  toggleTheme: () => void
  setPalette: (p: Palette) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  palette: "creme",
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

function applyTheme(theme: Theme, palette: Palette) {
  const html = document.documentElement
  // Theme
  if (theme === "dark") {
    html.classList.add("dark")
  } else {
    html.classList.remove("dark")
  }
  // Palette — remove all palette classes first
  html.classList.remove("palette-ocean", "palette-forest", "palette-ardoise")
  const cls = PALETTE_CLASSES[palette]
  if (cls) html.classList.add(cls)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light")
  const [palette, setPaletteState] = useState<Palette>("creme")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const savedTheme = (localStorage.getItem("momento_theme") as Theme) ?? "light"
    const savedPalette = (localStorage.getItem("momento_palette") as Palette) ?? "creme"
    setTheme(savedTheme)
    setPaletteState(savedPalette)
    applyTheme(savedTheme, savedPalette)
    setMounted(true)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next: Theme = prev === "light" ? "dark" : "light"
      localStorage.setItem("momento_theme", next)
      applyTheme(next, palette)
      return next
    })
  }, [palette])

  const setPalette = useCallback((p: Palette) => {
    setPaletteState(p)
    localStorage.setItem("momento_palette", p)
    applyTheme(theme, p)
  }, [theme])

  if (!mounted) return <>{children}</>

  return (
    <ThemeContext.Provider value={{ theme, palette, toggleTheme, setPalette }}>
      {children}
    </ThemeContext.Provider>
  )
}

// ── ThemeToggle ──────────────────────────────────────────────────────────────

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
      className={`w-9 h-9 flex items-center justify-center rounded-full transition-all hover:opacity-70 ${className}`}
      style={{ color: "var(--text)" }}
      title={theme === "dark" ? "Mode clair" : "Mode sombre"}
    >
      {theme === "dark" ? (
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
