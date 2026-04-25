import { DashSidebarSkel, DashTopbarMobileSkel, SkelBlock, SkelLine, SkelPill, SkelCard } from "@/components/skeleton/Skeleton"

export default function FavoritesLoading() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--dash-bg, #f7f7fb)", fontFamily: "'Geist', sans-serif" }}>
      <DashSidebarSkel />
      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <DashTopbarMobileSkel />
        <div style={{ padding: "32px 28px 80px", display: "flex", flexDirection: "column", gap: 22 }}>
          <div>
            <SkelLine width={160} height={26} />
            <div style={{ height: 8 }} />
            <SkelLine width={240} height={12} delay={0.05} />
          </div>

          {/* Filter pills */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[80, 100, 90, 110, 95].map((w, i) => (
              <SkelPill key={i} width={w} height={32} delay={0.05 + i * 0.04} />
            ))}
          </div>

          {/* Cards grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <SkelCard key={i}>
                <SkelBlock style={{ height: 180, borderRadius: 0 }} delay={i * 0.05} />
                <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                  <SkelLine width="65%" height={14} delay={0.1 + i * 0.05} />
                  <SkelLine width="40%" height={10} delay={0.15 + i * 0.05} />
                  <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                    <SkelPill width={60} height={22} delay={0.2 + i * 0.05} />
                    <SkelPill width={70} height={22} delay={0.22 + i * 0.05} />
                  </div>
                </div>
              </SkelCard>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
