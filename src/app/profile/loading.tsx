import { DashSidebarSkel, DashTopbarMobileSkel, SkelBlock, SkelLine, SkelCircle, SkelPill, SkelCard } from "@/components/skeleton/Skeleton"

export default function ProfileLoading() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--dash-bg, #f7f7fb)", fontFamily: "'Geist', sans-serif" }}>
      <DashSidebarSkel />
      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <DashTopbarMobileSkel />
        <div style={{ padding: "32px 28px 80px", maxWidth: 760, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Header */}
          <div>
            <SkelLine width={160} height={26} />
            <div style={{ height: 8 }} />
            <SkelLine width={260} height={12} delay={0.05} />
          </div>

          {/* Avatar + identity */}
          <SkelCard style={{ padding: 22, display: "flex", alignItems: "center", gap: 18 }}>
            <SkelCircle size={88} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              <SkelLine width="50%" height={16} delay={0.05} />
              <SkelLine width="35%" height={11} delay={0.1} />
              <SkelPill width={120} height={32} delay={0.15} />
            </div>
          </SkelCard>

          {/* Form sections */}
          {Array.from({ length: 3 }).map((_, sec) => (
            <SkelCard key={sec} style={{ padding: 22 }}>
              <SkelLine width={140} height={14} style={{ marginBottom: 16 }} delay={sec * 0.05} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <SkelLine width={80} height={10} delay={sec * 0.05 + i * 0.04} />
                    <SkelBlock style={{ height: 40, borderRadius: 10 }} delay={sec * 0.05 + i * 0.04 + 0.05} />
                  </div>
                ))}
              </div>
            </SkelCard>
          ))}

          {/* Save row */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <SkelPill width={100} height={40} />
            <SkelPill width={140} height={40} delay={0.05} />
          </div>
        </div>
      </main>
    </div>
  )
}
