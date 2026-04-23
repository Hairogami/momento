"use client"

type Props = { variant?: "ornament" | "leaf" | "dot-line" }

/**
 * Séparateur décoratif entre sections — motifs SVG épurés.
 * Se colore automatiquement via var(--evt-main).
 */
export default function SectionDivider({ variant = "ornament" }: Props) {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "36px 24px 12px", pointerEvents: "none" }}>
      <svg
        width="160"
        height="28"
        viewBox="0 0 160 28"
        fill="none"
        style={{ color: "var(--evt-main)", opacity: 0.55 }}
      >
        {variant === "ornament" && (
          <>
            <line x1="6" y1="14" x2="60" y2="14" stroke="currentColor" strokeWidth="0.8" />
            <line x1="100" y1="14" x2="154" y2="14" stroke="currentColor" strokeWidth="0.8" />
            {/* diamant central */}
            <g transform="translate(80,14)">
              <path d="M0,-7 L7,0 L0,7 L-7,0 Z" fill="none" stroke="currentColor" strokeWidth="0.9" />
              <circle r="1.8" fill="currentColor" />
            </g>
          </>
        )}
        {variant === "leaf" && (
          <>
            <line x1="6" y1="14" x2="66" y2="14" stroke="currentColor" strokeWidth="0.8" />
            <line x1="94" y1="14" x2="154" y2="14" stroke="currentColor" strokeWidth="0.8" />
            <path d="M72,14 Q80,6 88,14 Q80,22 72,14 Z" fill="currentColor" opacity="0.65" />
          </>
        )}
        {variant === "dot-line" && (
          <>
            {[10, 30, 80, 130, 150].map((x, i) => (
              <circle key={i} cx={x} cy="14" r={i === 2 ? 2.4 : 1.4} fill="currentColor" />
            ))}
            <line x1="40" y1="14" x2="70" y2="14" stroke="currentColor" strokeWidth="0.6" />
            <line x1="90" y1="14" x2="120" y2="14" stroke="currentColor" strokeWidth="0.6" />
          </>
        )}
      </svg>
    </div>
  )
}
