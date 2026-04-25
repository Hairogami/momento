import { DashSidebarSkel, DashTopbarMobileSkel, SkelLine, SkelCircle, SkelPill, SkelCard } from "@/components/skeleton/Skeleton"

export default function NotificationsLoading() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--dash-bg, #f7f7fb)", fontFamily: "'Geist', sans-serif" }}>
      <DashSidebarSkel />
      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <DashTopbarMobileSkel />
        <div style={{ padding: "32px 28px 80px", maxWidth: 720, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <SkelLine width={160} height={26} />
            <SkelPill width={120} height={32} delay={0.05} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <SkelCard key={i} style={{ padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                <SkelCircle size={40} delay={i * 0.05} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <SkelLine width={`${50 + (i % 3) * 10}%`} height={12} delay={0.05 + i * 0.05} />
                    <SkelLine width={48} height={9} delay={0.08 + i * 0.05} />
                  </div>
                  <SkelLine width="80%" height={10} delay={0.1 + i * 0.05} />
                </div>
              </SkelCard>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
