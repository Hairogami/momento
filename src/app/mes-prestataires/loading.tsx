import { DashSidebarSkel, DashTopbarMobileSkel, SkelBlock, SkelLine, SkelCircle, SkelPill, SkelCard } from "@/components/skeleton/Skeleton"

export default function MesPrestatairesLoading() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--dash-bg, #f7f7fb)", fontFamily: "'Geist', sans-serif" }}>
      <DashSidebarSkel />
      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <DashTopbarMobileSkel />
        <div style={{ padding: "32px 28px 80px", display: "flex", flexDirection: "column", gap: 22 }}>
          <div>
            <SkelLine width={200} height={26} />
            <div style={{ height: 8 }} />
            <SkelLine width={300} height={12} delay={0.05} />
          </div>

          {/* Status tabs */}
          <div style={{ display: "flex", gap: 8 }}>
            {[100, 110, 90, 120].map((w, i) => (
              <SkelPill key={i} width={w} height={36} delay={0.05 + i * 0.04} />
            ))}
          </div>

          {/* Booked vendor list cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <SkelCard key={i} style={{ padding: 16, display: "flex", gap: 14, alignItems: "center" }}>
                <SkelBlock style={{ width: 72, height: 72, borderRadius: 12, flexShrink: 0 }} delay={i * 0.05} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                  <SkelLine width="40%" height={14} delay={0.05 + i * 0.05} />
                  <SkelLine width="25%" height={11} delay={0.1 + i * 0.05} />
                  <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                    <SkelPill width={70} height={22} delay={0.15 + i * 0.05} />
                    <SkelPill width={90} height={22} delay={0.18 + i * 0.05} />
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                  <SkelLine width={80} height={12} delay={0.2 + i * 0.05} />
                  <SkelCircle size={36} delay={0.25 + i * 0.05} />
                </div>
              </SkelCard>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
