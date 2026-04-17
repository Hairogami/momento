"use client"

/**
 * Skeleton de chargement unifié — même animation pulse que le calendrier.
 * Variantes : "cards" (grille de cartes), "list" (lignes), "profile" (avatar + lignes).
 */
export default function PageSkeleton({ variant = "cards" }: { variant?: "cards" | "list" | "profile" }) {
  return (
    <div style={{ padding: "20px 0" }}>
      {variant === "profile" && <ProfileSkeleton />}
      {variant === "list" && <ListSkeleton />}
      {variant === "cards" && <CardsSkeleton />}
      <style>{skelCSS}</style>
    </div>
  )
}

function CardsSkeleton() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{
          background: "var(--dash-surface,#fff)", borderRadius: 16,
          border: "1px solid var(--dash-border,rgba(183,191,217,0.15))",
          overflow: "hidden",
        }}>
          <div className="mo-skel" style={{ height: 140, background: "var(--dash-faint-2,rgba(183,191,217,0.12))", animationDelay: `${i * 0.08}s` }} />
          <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="mo-skel" style={{ height: 14, width: "65%", borderRadius: 6, background: "var(--dash-faint-2,rgba(183,191,217,0.18))", animationDelay: `${i * 0.08 + 0.1}s` }} />
            <div className="mo-skel" style={{ height: 10, width: "40%", borderRadius: 4, background: "var(--dash-faint-2,rgba(183,191,217,0.12))", animationDelay: `${i * 0.08 + 0.2}s` }} />
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <div className="mo-skel" style={{ height: 24, width: 60, borderRadius: 99, background: "var(--dash-faint-2,rgba(183,191,217,0.15))", animationDelay: `${i * 0.08 + 0.3}s` }} />
              <div className="mo-skel" style={{ height: 24, width: 80, borderRadius: 99, background: "var(--dash-faint-2,rgba(183,191,217,0.10))", animationDelay: `${i * 0.08 + 0.35}s` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ListSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
          background: "var(--dash-surface,#fff)", borderRadius: 12,
          border: "1px solid var(--dash-border,rgba(183,191,217,0.15))",
        }}>
          <div className="mo-skel" style={{ width: 40, height: 40, borderRadius: 10, background: "var(--dash-faint-2,rgba(183,191,217,0.18))", flexShrink: 0, animationDelay: `${i * 0.1}s` }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
            <div className="mo-skel" style={{ height: 12, width: "55%", borderRadius: 4, background: "var(--dash-faint-2,rgba(183,191,217,0.18))", animationDelay: `${i * 0.1 + 0.05}s` }} />
            <div className="mo-skel" style={{ height: 10, width: "35%", borderRadius: 4, background: "var(--dash-faint-2,rgba(183,191,217,0.10))", animationDelay: `${i * 0.1 + 0.1}s` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "20px 0" }}>
      <div className="mo-skel" style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--dash-faint-2,rgba(183,191,217,0.18))" }} />
      <div className="mo-skel" style={{ height: 16, width: 160, borderRadius: 6, background: "var(--dash-faint-2,rgba(183,191,217,0.18))", animationDelay: "0.1s" }} />
      <div className="mo-skel" style={{ height: 10, width: 120, borderRadius: 4, background: "var(--dash-faint-2,rgba(183,191,217,0.10))", animationDelay: "0.2s" }} />
      <div style={{ width: "100%", marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{
            padding: "16px 18px", background: "var(--dash-surface,#fff)", borderRadius: 12,
            border: "1px solid var(--dash-border,rgba(183,191,217,0.15))",
          }}>
            <div className="mo-skel" style={{ height: 12, width: `${50 + (i * 10) % 30}%`, borderRadius: 4, background: "var(--dash-faint-2,rgba(183,191,217,0.15))", animationDelay: `${i * 0.08}s` }} />
          </div>
        ))}
      </div>
    </div>
  )
}

const skelCSS = `
@keyframes moPulse { 0%,100% { opacity: 1 } 50% { opacity: 0.4 } }
.mo-skel { animation: moPulse 1.4s ease-in-out infinite; }
`
