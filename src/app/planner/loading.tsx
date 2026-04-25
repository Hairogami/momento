import { DashSidebarSkel, DashTopbarMobileSkel, SkelBlock, SkelLine, SkelPill } from "@/components/skeleton/Skeleton"

export default function PlannerLoading() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--dash-bg, #f7f7fb)", fontFamily: "'Geist', sans-serif" }}>
      <DashSidebarSkel />
      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <DashTopbarMobileSkel />

        {/* Calendar header */}
        <div
          style={{
            padding: "16px 24px",
            background: "var(--dash-surface, #fff)",
            borderBottom: "1px solid var(--dash-border, rgba(183,191,217,0.15))",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <SkelPill width={36} height={36} />
            <SkelLine width={180} height={20} delay={0.05} />
            <SkelPill width={36} height={36} delay={0.08} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <SkelPill width={70} height={32} delay={0.1} />
            <SkelPill width={70} height={32} delay={0.13} />
            <SkelPill width={70} height={32} delay={0.16} />
          </div>
        </div>

        {/* Calendar grid month view (7 cols × 6 rows) */}
        <div style={{ flex: 1, padding: 18, display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Day labels */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <SkelLine key={i} width="40%" height={10} delay={i * 0.02} />
            ))}
          </div>
          {/* Cells */}
          {Array.from({ length: 6 }).map((_, row) => (
            <div key={row} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, flex: 1 }}>
              {Array.from({ length: 7 }).map((_, col) => (
                <SkelBlock
                  key={col}
                  style={{ minHeight: 80, borderRadius: 10 }}
                  delay={row * 0.04 + col * 0.02}
                />
              ))}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
