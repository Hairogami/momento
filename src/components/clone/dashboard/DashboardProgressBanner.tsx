"use client"

/**
 * Dashboard Progress Banner
 *
 * Affiche : « Votre [eventLabel] est organisé à [pct]% »
 * Sous la phrase : barre fluide animée (pas de jalons, pas de curseur typewriter).
 * Gradient = var(--g1) → var(--g2) — respecte la palette utilisateur.
 */
type Props = {
  eventLabel: string   // ex: "mariage traditionnel"
  completionPct: number // 0-100
  maxWidth?: number
}

export default function DashboardProgressBanner({ eventLabel, completionPct }: Props) {
  const pct = Math.max(0, Math.min(100, Math.round(completionPct)))

  return (
    <section style={{
      marginBottom: 0,
      width: "max-content",
      maxWidth: "100%",
      marginLeft: "auto",
      marginRight: "auto",
      textAlign: "center",
    }}>
      <h1
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(15px, 2.24vw, 21px)",
          fontWeight: 500,
          letterSpacing: "-0.015em",
          lineHeight: 1.2,
          color: "var(--dash-text, #121317)",
          margin: 0,
        }}
      >
        Votre{" "}
        <em style={{ fontStyle: "italic", backgroundImage: "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
          {eventLabel}
        </em>{" "}
        est organisé à{" "}
        <span style={{ fontVariantNumeric: "tabular-nums", backgroundImage: "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontStyle: "italic" }}>
          {pct}%
        </span>
      </h1>

      <div style={{ marginTop: 8, width: "100%" }}>
        <div style={{ position: "relative", height: 5, background: "var(--dash-faint-2, rgba(183,191,217,0.18))", borderRadius: 999, overflow: "hidden" }}>
          <div
            style={{
              position: "absolute", top: 0, left: 0, bottom: 0,
              width: `${pct}%`,
              background: "linear-gradient(90deg, var(--g1,#E11D48), var(--g2,#9333EA), var(--g1,#E11D48))",
              backgroundSize: "200% 100%",
              borderRadius: 999,
              boxShadow: "0 2px 8px color-mix(in srgb, var(--g1,#E11D48) 25%, transparent)",
              animation: "momento-fluid-sweep 3s linear infinite, momento-width-grow 1.4s cubic-bezier(.22,1,.36,1) both",
            }}
          >
            <span
              aria-hidden
              style={{
                position: "absolute", top: "50%", right: -4,
                width: 10, height: 10, borderRadius: "50%",
                transform: "translateY(-50%)",
                background: "radial-gradient(circle, rgba(255,255,255,0.8), transparent 70%)",
                animation: "momento-pulse-dot 1.8s ease-in-out infinite",
                pointerEvents: "none",
              }}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes momento-fluid-sweep {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes momento-width-grow {
          from { width: 0; }
        }
        @keyframes momento-pulse-dot {
          0%, 100% { opacity: 0.5; transform: translateY(-50%) scale(0.85); }
          50%      { opacity: 1;   transform: translateY(-50%) scale(1.15); }
        }
      `}</style>
    </section>
  )
}
