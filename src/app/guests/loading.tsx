import { DashSidebarSkel, DashTopbarMobileSkel, SkelBlock, SkelLine, SkelCircle, SkelPill, SkelCard } from "@/components/skeleton/Skeleton"

export default function GuestsLoading() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--dash-bg, #f7f7fb)", fontFamily: "'Geist', sans-serif" }}>
      <DashSidebarSkel />
      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <DashTopbarMobileSkel />
        <div style={{ padding: "32px 28px 80px", display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div>
              <SkelLine width={160} height={26} />
              <div style={{ height: 6 }} />
              <SkelLine width={220} height={11} delay={0.05} />
            </div>
            <SkelPill width={140} height={40} delay={0.1} />
          </div>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <SkelCard key={i} style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                <SkelLine width="50%" height={10} delay={i * 0.05} />
                <SkelLine width="35%" height={22} delay={0.05 + i * 0.05} />
              </SkelCard>
            ))}
          </div>

          {/* Search + filter */}
          <div style={{ display: "flex", gap: 10 }}>
            <SkelBlock style={{ flex: 1, height: 40, borderRadius: 99 }} />
            <SkelPill width={100} height={40} delay={0.05} />
          </div>

          {/* Guest list */}
          <SkelCard style={{ padding: 0, overflow: "hidden" }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 18px",
                  borderBottom: i < 6 ? "1px solid var(--dash-divider, rgba(183,191,217,0.10))" : "none",
                }}
              >
                <SkelCircle size={36} delay={i * 0.04} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                  <SkelLine width={`${30 + (i % 3) * 8}%`} height={12} delay={0.05 + i * 0.04} />
                  <SkelLine width={`${20 + (i % 4) * 6}%`} height={10} delay={0.08 + i * 0.04} />
                </div>
                <SkelPill width={70} height={26} delay={0.12 + i * 0.04} />
                <SkelBlock style={{ width: 26, height: 26, borderRadius: 6 }} delay={0.14 + i * 0.04} />
              </div>
            ))}
          </SkelCard>
        </div>
      </main>
    </div>
  )
}
