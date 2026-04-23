"use client"

const PATTERNS = [
  { id: "arabesque",      label: "Arabesque" },
  { id: "losanges",       label: "Losanges" },
  { id: "cercles",        label: "Cercles" },
  { id: "hexagone",       label: "Hexagone" },
  { id: "florale",        label: "Florale" },
  { id: "zellige",        label: "Zellige" },
  { id: "fleurs-line",    label: "Fleurs" },
  { id: "constellations", label: "Étoiles" },
  { id: "vagues",         label: "Vagues" },
] as const

export type PatternId = (typeof PATTERNS)[number]["id"]

type Props = {
  current: PatternId | undefined
  onPick: (id: PatternId) => void
  accent?: string
}

/**
 * Grille de 9 mini-previews SVG cliquables pour choisir un pattern décoratif.
 * Chaque preview est une vignette 56x56 qui montre un petit aperçu du motif.
 */
export default function PatternPicker({ current, onPick, accent = "#8B3A3A" }: Props) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
      {PATTERNS.map(p => {
        const active = current === p.id
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onPick(p.id)}
            title={p.label}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              padding: "10px 6px 8px",
              borderRadius: 10,
              border: active ? `1.5px solid ${accent}` : "1px solid var(--dash-border,rgba(183,191,217,0.3))",
              background: active ? `color-mix(in srgb, ${accent} 10%, var(--dash-surface,#fff))` : "var(--dash-surface,#fff)",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 120ms ease",
            }}
          >
            <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden
              style={{ background: "color-mix(in srgb, " + accent + " 8%, #faf7f0)", borderRadius: 6 }}>
              <PatternPreview id={p.id} main={accent} accent={accent} />
            </svg>
            <span style={{ fontSize: 10, color: "var(--dash-text-2,#6a6a71)", fontWeight: active ? 600 : 500 }}>
              {p.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/* ── Mini previews SVG (52x52) ── */
function PatternPreview({ id, main, accent }: { id: PatternId; main: string; accent: string }) {
  switch (id) {
    case "arabesque":
      return (
        <g>
          <path d="M26,10 Q38,22 26,34 Q14,22 26,10 Z" fill="none" stroke={accent} strokeWidth="1.2" />
          <path d="M26,34 Q38,44 26,52 L26,34" fill="none" stroke={accent} strokeWidth="1.2" />
          <circle cx="26" cy="26" r="1.8" fill={main} />
        </g>
      )
    case "losanges":
      return (
        <g>
          <path d="M26,8 L44,26 L26,44 L8,26 Z" fill="none" stroke={accent} strokeWidth="1" />
          <path d="M26,16 L36,26 L26,36 L16,26 Z" fill={main} opacity="0.4" />
        </g>
      )
    case "cercles":
      return (
        <g>
          <circle cx="26" cy="26" r="14" fill="none" stroke={main} strokeWidth="1" />
          <circle cx="26" cy="26" r="7" fill="none" stroke={accent} strokeWidth="0.9" />
          <circle cx="26" cy="26" r="2" fill={accent} />
        </g>
      )
    case "hexagone":
      return (
        <g>
          <path d="M26,6 L44,16 L44,36 L26,46 L8,36 L8,16 Z" fill="none" stroke={main} strokeWidth="1" />
          <circle cx="26" cy="26" r="2.5" fill={accent} />
        </g>
      )
    case "florale":
      return (
        <g transform="translate(26,26)">
          {[0, 60, 120, 180, 240, 300].map(a => (
            <ellipse key={a} cx="0" cy="-10" rx="3.5" ry="8" fill={accent} opacity="0.55" transform={`rotate(${a})`} />
          ))}
          <circle r="2.4" fill={main} />
        </g>
      )
    case "zellige":
      return (
        <g transform="translate(26,26)">
          {[0, 45, 90, 135].map(a => (
            <rect key={a} x="-14" y="-1.5" width="28" height="3" fill={main} opacity="0.6" transform={`rotate(${a})`} rx="0.5" />
          ))}
          <circle r="4" fill={accent} opacity="0.9" />
        </g>
      )
    case "fleurs-line":
      return (
        <g>
          <path d="M14,46 Q16,30 18,18" stroke={accent} strokeWidth="1" fill="none" strokeLinecap="round" />
          <g transform="translate(18,14)">
            {[0, 72, 144, 216, 288].map(a => (
              <circle key={a} cx="0" cy="-3.5" r="2.4" stroke={main} strokeWidth="0.9" fill="none" transform={`rotate(${a})`} />
            ))}
            <circle r="1" fill={main} />
          </g>
          <path d="M34,6 Q32,22 38,38" stroke={accent} strokeWidth="1" fill="none" strokeLinecap="round" />
          <g transform="translate(39,38)">
            {[0, 72, 144, 216, 288].map(a => (
              <circle key={a} cx="0" cy="-2.8" r="1.9" stroke={main} strokeWidth="0.8" fill="none" transform={`rotate(${a})`} />
            ))}
          </g>
        </g>
      )
    case "constellations":
      return (
        <g>
          <path d="M10,14 L20,20 L36,12 M20,20 L30,30 L16,38 M30,30 L42,40" stroke={accent} strokeWidth="0.6" fill="none" opacity="0.6" />
          <circle cx="10" cy="14" r="1.6" fill={main} />
          <circle cx="20" cy="20" r="1.1" fill={main} />
          <circle cx="36" cy="12" r="1.9" fill={main} />
          <circle cx="30" cy="30" r="1.4" fill={main} />
          <circle cx="16" cy="38" r="1.6" fill={main} />
          <circle cx="42" cy="40" r="1.5" fill={main} />
        </g>
      )
    case "vagues":
      return (
        <g>
          {[12, 22, 32, 42].map((y, i) => (
            <path
              key={y}
              d={`M4,${y} Q14,${y - 4} 26,${y} T48,${y}`}
              stroke={i % 2 === 0 ? main : accent}
              strokeWidth={i % 2 === 0 ? 1 : 0.8}
              fill="none"
              strokeLinecap="round"
              opacity="0.75"
            />
          ))}
        </g>
      )
  }
}
