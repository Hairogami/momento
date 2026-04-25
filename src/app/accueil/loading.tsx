import { SkelBlock, SkelLine, SkelCircle, SkelPill, SkelCard } from "@/components/skeleton/Skeleton"

/**
 * Skeleton accueil — pas de DashSidebar (page connectée mais layout AntNav top).
 * Mime nav top + grille events + grille actions / steps.
 */
export default function AccueilLoading() {
  return (
    <div style={{ background: "var(--dash-bg, #f7f7fb)", minHeight: "100vh", fontFamily: "'Geist', sans-serif" }}>
      {/* Top nav */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 32px",
          background: "var(--dash-surface, #fff)",
          borderBottom: "1px solid var(--dash-border, rgba(183,191,217,0.15))",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <SkelBlock style={{ width: 36, height: 36, borderRadius: 8 }} />
          <SkelLine width={120} height={14} delay={0.05} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <SkelPill width={80} height={36} delay={0.1} />
          <SkelPill width={100} height={36} delay={0.13} />
          <SkelCircle size={36} delay={0.16} />
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 80px", display: "flex", flexDirection: "column", gap: 30 }}>
        {/* Greeting */}
        <div>
          <SkelLine width={280} height={28} />
          <div style={{ height: 10 }} />
          <SkelLine width={360} height={13} delay={0.05} />
        </div>

        {/* Events grid */}
        <div>
          <SkelLine width={160} height={14} style={{ marginBottom: 14 }} />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 12,
            }}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <SkelCard key={i} style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                <SkelBlock style={{ width: 40, height: 40, borderRadius: 12 }} delay={i * 0.05} />
                <SkelLine width="70%" height={12} delay={0.05 + i * 0.05} />
                <SkelLine width="50%" height={10} delay={0.08 + i * 0.05} />
              </SkelCard>
            ))}
          </div>
        </div>

        {/* Steps / actions grid */}
        <div>
          <SkelLine width={200} height={14} style={{ marginBottom: 14 }} />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 16,
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <SkelCard key={i} style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <SkelCircle size={36} delay={i * 0.05} />
                  <SkelLine width="55%" height={13} delay={0.05 + i * 0.05} />
                </div>
                <SkelLine width="90%" height={10} delay={0.1 + i * 0.05} />
                <SkelLine width="70%" height={10} delay={0.13 + i * 0.05} />
                <SkelPill width={120} height={32} delay={0.18 + i * 0.05} />
              </SkelCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
