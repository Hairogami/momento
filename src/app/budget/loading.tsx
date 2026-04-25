import { DashSidebarSkel, DashTopbarMobileSkel, SkelBlock, SkelLine, SkelPill, SkelCard } from "@/components/skeleton/Skeleton"

export default function BudgetLoading() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--dash-bg, #f7f7fb)", fontFamily: "'Geist', sans-serif" }}>
      <DashSidebarSkel />
      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <DashTopbarMobileSkel />
        <div style={{ padding: "32px 28px 80px", display: "flex", flexDirection: "column", gap: 22 }}>
          <div>
            <SkelLine width={150} height={26} />
            <div style={{ height: 8 }} />
            <SkelLine width={280} height={12} delay={0.05} />
          </div>

          {/* Total budget hero */}
          <SkelCard style={{ padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
              <SkelLine width={120} height={11} />
              <SkelLine width={160} height={28} delay={0.05} />
            </div>
            <SkelBlock style={{ width: "100%", height: 12, borderRadius: 99 }} delay={0.1} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
              <SkelLine width={80} height={10} delay={0.15} />
              <SkelLine width={100} height={10} delay={0.18} />
            </div>
          </SkelCard>

          {/* Per-category bars */}
          <SkelCard style={{ padding: 22 }}>
            <SkelLine width={170} height={14} style={{ marginBottom: 16 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <SkelLine width={`${25 + (i % 3) * 8}%`} height={11} delay={i * 0.05} />
                    <SkelLine width={70} height={11} delay={0.05 + i * 0.05} />
                  </div>
                  <SkelBlock
                    style={{ height: 10, borderRadius: 99, width: `${40 + (i * 11) % 50}%` }}
                    delay={0.1 + i * 0.05}
                  />
                </div>
              ))}
            </div>
          </SkelCard>

          {/* Action row */}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <SkelPill width={140} height={40} />
            <SkelPill width={120} height={40} delay={0.05} />
          </div>
        </div>
      </main>
    </div>
  )
}
