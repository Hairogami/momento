import { SkelBlock, SkelLine, SkelPill, SkelCard } from "@/components/skeleton/Skeleton"

/**
 * Skeleton explore — mime la sticky filter bar + grille de vendor cards.
 */
export default function ExploreLoading() {
  return (
    <div style={{ background: "var(--dash-bg, #f7f7fb)", minHeight: "100vh", fontFamily: "'Geist', sans-serif" }}>
      {/* Header / nav */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 28px",
          background: "var(--dash-surface, #fff)",
          borderBottom: "1px solid var(--dash-border, rgba(183,191,217,0.15))",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <SkelBlock style={{ width: 36, height: 36, borderRadius: 8 }} />
          <SkelLine width={120} height={14} delay={0.05} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <SkelPill width={80} height={32} delay={0.1} />
          <SkelPill width={100} height={32} delay={0.15} />
        </div>
      </div>

      {/* Sticky filter bar — pills catégories */}
      <div
        style={{
          padding: "16px 28px",
          background: "var(--dash-surface, #fff)",
          borderBottom: "1px solid var(--dash-border, rgba(183,191,217,0.15))",
          display: "flex",
          gap: 8,
          overflowX: "hidden",
        }}
      >
        {[90, 110, 80, 130, 95, 120, 85, 105, 90].map((w, i) => (
          <SkelPill key={i} width={w} height={36} delay={0.05 + i * 0.04} />
        ))}
      </div>

      {/* Result count + filter */}
      <div style={{ padding: "20px 28px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <SkelLine width={160} height={14} />
        <SkelPill width={120} height={32} delay={0.05} />
      </div>

      {/* Vendor cards grid */}
      <div
        style={{
          padding: "0 28px 60px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 18,
        }}
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <SkelCard key={i}>
            <SkelBlock style={{ height: 200, borderRadius: 0 }} delay={i * 0.05} />
            <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
              <SkelLine width="70%" height={15} delay={0.1 + i * 0.05} />
              <SkelLine width="45%" height={11} delay={0.15 + i * 0.05} />
              <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                <SkelPill width={60} height={22} delay={0.2 + i * 0.05} />
                <SkelPill width={70} height={22} delay={0.22 + i * 0.05} />
              </div>
            </div>
          </SkelCard>
        ))}
      </div>
    </div>
  )
}
