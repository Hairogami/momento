"use client"

import { useTheme, type Palette } from "@/components/ThemeProvider"

const PALETTES: { id: Palette; label: string; color: string; accent: string }[] = [
  { id: "creme",    label: "Crème",    color: "#F5EDD6", accent: "#C4532A" },
  { id: "ocean",    label: "Océan",    color: "#DDE9F5", accent: "#1A6BAD" },
  { id: "forest",   label: "Forêt",   color: "#DDE8DD", accent: "#2D7A3A" },
  { id: "ardoise",  label: "Ardoise",  color: "#E2E2E2", accent: "#3A3A3A" },
]

export function PaletteSelector() {
  const { palette, setPalette } = useTheme()

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
        Palette de couleurs
      </p>
      <div className="flex items-center gap-3 flex-wrap">
        {PALETTES.map(p => (
          <button
            key={p.id}
            onClick={() => setPalette(p.id)}
            title={p.label}
            aria-label={`Palette ${p.label}`}
            className="flex flex-col items-center gap-1.5 transition-all"
          >
            {/* Color swatch — two-tone circle */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
              style={{
                background: `linear-gradient(135deg, ${p.color} 50%, ${p.accent} 50%)`,
                outline: palette === p.id ? `3px solid ${p.accent}` : "3px solid transparent",
                outlineOffset: 2,
                boxShadow: palette === p.id ? `0 0 0 1px ${p.accent}` : "none",
              }}
            />
            <span
              className="text-xs font-medium"
              style={{ color: palette === p.id ? "var(--accent)" : "var(--text-muted)" }}
            >
              {p.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
