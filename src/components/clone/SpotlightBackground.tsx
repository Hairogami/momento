/**
 * Décor animé pour panels brand (login, etc.) — 3 spotlights flottants.
 * Pure CSS keyframes : aucun JS d'animation au runtime, aucune dep externe.
 * (Avant : importait `framer-motion` ~80KB juste pour 3 motion.div décoratifs.)
 */
export default function SpotlightBackground({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: "relative", overflow: "hidden", width: "100%", flex: 1, display: "flex", flexDirection: "column" }}>
      {/* Spotlight 1 — top left, warm white */}
      <div
        aria-hidden="true"
        className="momento-spotlight-1"
        style={{
          position: "absolute",
          top: "30%", left: "30%",
          width: 600, height: 600,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(255,255,255,0.35) 0%, transparent 65%)",
          pointerEvents: "none",
          willChange: "transform",
        }}
      />
      {/* Spotlight 2 — bottom, cooler */}
      <div
        aria-hidden="true"
        className="momento-spotlight-2"
        style={{
          position: "absolute",
          top: "65%", left: "55%",
          width: 500, height: 500,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(200,150,255,0.25) 0%, transparent 65%)",
          pointerEvents: "none",
          willChange: "transform",
        }}
      />
      {/* Spotlight 3 — top right, pink */}
      <div
        aria-hidden="true"
        className="momento-spotlight-3"
        style={{
          position: "absolute",
          top: "5%", left: "65%",
          width: 450, height: 450,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(255,150,180,0.28) 0%, transparent 65%)",
          pointerEvents: "none",
          willChange: "transform",
        }}
      />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column" }}>
        {children}
      </div>
    </div>
  )
}
