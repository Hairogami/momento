import { DashSidebarSkel, DashTopbarMobileSkel, SkelBlock, SkelLine, SkelCircle, SkelCard } from "@/components/skeleton/Skeleton"

export default function SettingsLoading() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--dash-bg, #f7f7fb)", fontFamily: "'Geist', sans-serif" }}>
      <DashSidebarSkel />
      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <DashTopbarMobileSkel />
        <div style={{ padding: "32px 28px 80px", maxWidth: 820, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: 22 }}>
          <div>
            <SkelLine width={140} height={26} />
            <div style={{ height: 8 }} />
            <SkelLine width={300} height={12} delay={0.05} />
          </div>

          {/* Apparence — theme + palette */}
          <SkelCard style={{ padding: 22 }}>
            <SkelLine width={120} height={14} style={{ marginBottom: 6 }} />
            <SkelLine width={240} height={10} style={{ marginBottom: 18 }} delay={0.05} />

            {/* Theme tiles */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 22 }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <SkelBlock key={i} style={{ height: 80, borderRadius: 14 }} delay={i * 0.05} />
              ))}
            </div>

            {/* Palette tiles */}
            <SkelLine width={80} height={11} style={{ marginBottom: 10 }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <SkelBlock style={{ height: 60, borderRadius: 12 }} delay={0.05 + i * 0.04} />
                  <SkelLine width="60%" height={10} delay={0.08 + i * 0.04} />
                </div>
              ))}
            </div>
          </SkelCard>

          {/* Notifications */}
          <SkelCard style={{ padding: 22 }}>
            <SkelLine width={150} height={14} style={{ marginBottom: 14 }} />
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: i < 3 ? "1px solid var(--dash-divider, rgba(183,191,217,0.10))" : "none",
                }}
              >
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                  <SkelLine width="40%" height={12} delay={i * 0.05} />
                  <SkelLine width="60%" height={10} delay={0.05 + i * 0.05} />
                </div>
                <SkelBlock style={{ width: 44, height: 24, borderRadius: 99 }} delay={0.1 + i * 0.05} />
              </div>
            ))}
          </SkelCard>

          {/* Account */}
          <SkelCard style={{ padding: 22 }}>
            <SkelLine width={100} height={14} style={{ marginBottom: 14 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <SkelCircle size={52} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <SkelLine width="40%" height={13} delay={0.05} />
                <SkelLine width="55%" height={10} delay={0.1} />
              </div>
            </div>
          </SkelCard>

          {/* Danger */}
          <SkelCard style={{ padding: 22, borderColor: "rgba(239,68,68,0.2)" }}>
            <SkelLine width={120} height={14} style={{ marginBottom: 10 }} />
            <SkelLine width="80%" height={10} style={{ marginBottom: 14 }} delay={0.05} />
            <SkelBlock style={{ width: 180, height: 38, borderRadius: 99 }} delay={0.1} />
          </SkelCard>
        </div>
      </main>
    </div>
  )
}
