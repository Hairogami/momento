import { SkelBlock, SkelLine, SkelCircle, SkelPill, SkelCard } from "@/components/skeleton/Skeleton"

/**
 * Skeleton dashboard — mime la structure réelle :
 * sidebar gauche (lg+) + topbar pills + grille widgets 12 cols.
 */
export default function DashboardLoading() {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--dash-bg, #f7f7fb)",
        fontFamily: "'Geist', sans-serif",
      }}
    >
      {/* Sidebar (desktop only, mime DashSidebar) */}
      <aside
        className="hidden lg:flex"
        style={{
          width: 260,
          flexShrink: 0,
          flexDirection: "column",
          gap: 14,
          padding: "20px 16px",
          background: "var(--dash-sidebar, #ffffff)",
          borderRight: "1px solid var(--dash-border, rgba(183,191,217,0.15))",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <SkelCircle size={36} />
          <SkelLine width={120} height={14} delay={0.05} />
        </div>
        <SkelBlock style={{ height: 64, borderRadius: 14 }} delay={0.1} />
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 6px" }}>
            <SkelBlock style={{ width: 18, height: 18, borderRadius: 6 }} delay={0.12 + i * 0.04} />
            <SkelLine width={`${50 + (i % 3) * 12}%`} height={11} delay={0.14 + i * 0.04} />
          </div>
        ))}
      </aside>

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {/* Topbar mobile */}
        <div
          className="flex lg:hidden"
          style={{
            alignItems: "center",
            gap: 12,
            padding: "12px 16px",
            background: "var(--dash-surface, #fff)",
            borderBottom: "1px solid var(--dash-border, rgba(183,191,217,0.15))",
          }}
        >
          <SkelBlock style={{ width: 32, height: 32, borderRadius: 8 }} />
          <SkelLine width={140} height={14} delay={0.05} />
        </div>

        <div style={{ padding: "24px 26px 80px", display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Header — greeting */}
          <div>
            <SkelLine width={180} height={12} />
            <div style={{ height: 8 }} />
            <SkelLine width={300} height={26} delay={0.05} />
          </div>

          {/* Pills nav */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[80, 96, 110, 70, 90, 130].map((w, i) => (
              <SkelPill key={i} width={w} height={32} delay={0.1 + i * 0.04} />
            ))}
          </div>

          {/* Widget grid 12 cols */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(12, 1fr)",
              gridAutoRows: "minmax(220px, auto)",
              gap: 14,
            }}
            className="dash-widget-grid"
          >
            {[
              { col: 4, rows: 1 },
              { col: 4, rows: 1 },
              { col: 4, rows: 1 },
              { col: 8, rows: 2 },
              { col: 4, rows: 1 },
              { col: 4, rows: 1 },
              { col: 6, rows: 1 },
              { col: 6, rows: 1 },
            ].map((w, i) => (
              <SkelCard
                key={i}
                style={{
                  gridColumn: `span ${w.col}`,
                  gridRow: `span ${w.rows}`,
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <SkelCircle size={28} delay={i * 0.05} />
                  <SkelLine width="55%" height={12} delay={0.05 + i * 0.05} />
                </div>
                <SkelLine width="80%" height={20} delay={0.1 + i * 0.05} />
                <SkelBlock style={{ flex: 1, minHeight: 80, borderRadius: 10 }} delay={0.15 + i * 0.05} />
                <div style={{ display: "flex", gap: 6 }}>
                  <SkelPill width={70} height={22} delay={0.2 + i * 0.05} />
                  <SkelPill width={50} height={22} delay={0.25 + i * 0.05} />
                </div>
              </SkelCard>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
