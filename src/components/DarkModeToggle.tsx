"use client"

import { useTheme } from "./ThemeProvider"
import { useEffect, useState } from "react"

export function DarkModeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [animating, setAnimating] = useState(false)

  useEffect(() => setMounted(true), [])

  function handleToggle() {
    setAnimating(true)
    toggleTheme()
    setTimeout(() => setAnimating(false), 600)
  }

  if (!mounted) return <div className="w-14 h-7" />

  const isDark = theme === "dark"

  return (
    <button
      onClick={handleToggle}
      aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      title={isDark ? "Bonjour ☀️" : "Bonne nuit 🌙"}
      className={`relative w-14 h-7 rounded-full transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${className}`}
      style={{
        backgroundColor: isDark ? "var(--bg)" : "var(--momento-anthracite)",
        border: `1.5px solid var(--border)`,
        boxShadow: isDark
          ? "0 0 12px rgba(255,220,100,0.15), inset 0 1px 3px rgba(0,0,0,0.4)"
          : "0 0 8px rgba(255,180,0,0.1), inset 0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      {/* Track stars (dark mode only) */}
      {isDark && (
        <>
          <span className="absolute top-1 left-2 w-0.5 h-0.5 rounded-full bg-white opacity-60" style={{ transition: "opacity 0.3s" }} />
          <span className="absolute top-2.5 left-3.5 w-0.5 h-0.5 rounded-full bg-white opacity-40" />
          <span className="absolute top-1.5 left-5 w-px h-px rounded-full bg-white opacity-50" />
        </>
      )}

      {/* Thumb */}
      <span
        className="absolute top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-sm transition-all duration-500"
        style={{
          left: isDark ? "calc(100% - 1.75rem)" : "2px",
          backgroundColor: isDark ? "var(--bg-card)" : "var(--bg)",
          boxShadow: isDark
            ? "0 2px 8px rgba(0,0,0,0.5), 0 0 6px rgba(255,200,50,0.2)"
            : "0 2px 6px rgba(0,0,0,0.15)",
          transform: animating ? "scale(0.85)" : "scale(1)",
        }}
      >
        {/* Sun rays (light mode) */}
        {!isDark ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ color: "var(--g1, #E11D48)" }}>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
        ) : (
          /* Moon (dark mode) */
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#F5C842" stroke="#F5C842" strokeWidth="1">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </span>
    </button>
  )
}
