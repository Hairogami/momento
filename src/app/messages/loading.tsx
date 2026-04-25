import { SkelBlock, SkelLine, SkelCircle } from "@/components/skeleton/Skeleton"

/**
 * Skeleton messages — mime sidebar + colonne threads + zone conversation.
 */
export default function MessagesLoading() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--dash-bg, #f7f7fb)", fontFamily: "'Geist', sans-serif" }}>
      {/* Sidebar (lg+) */}
      <aside
        className="hidden lg:flex"
        style={{
          width: 260,
          flexShrink: 0,
          flexDirection: "column",
          gap: 14,
          padding: "20px 16px",
          background: "var(--dash-sidebar, #fff)",
          borderRight: "1px solid var(--dash-border, rgba(183,191,217,0.15))",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <SkelCircle size={36} />
          <SkelLine width={120} height={14} delay={0.05} />
        </div>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 6px" }}>
            <SkelBlock style={{ width: 18, height: 18, borderRadius: 6 }} delay={0.1 + i * 0.04} />
            <SkelLine width={`${50 + (i % 3) * 12}%`} height={11} delay={0.12 + i * 0.04} />
          </div>
        ))}
      </aside>

      {/* Threads column */}
      <div
        style={{
          width: 320,
          flexShrink: 0,
          borderRight: "1px solid var(--dash-border, rgba(183,191,217,0.15))",
          background: "var(--dash-surface, #fff)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: "18px 16px", borderBottom: "1px solid var(--dash-border, rgba(183,191,217,0.15))" }}>
          <SkelLine width={120} height={16} />
        </div>
        <div style={{ flex: 1, overflowY: "hidden", padding: "8px 0" }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 12,
                padding: "12px 16px",
                borderBottom: "1px solid var(--dash-divider, rgba(183,191,217,0.06))",
              }}
            >
              <SkelCircle size={44} delay={i * 0.05} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <SkelLine width="55%" height={12} delay={0.05 + i * 0.05} />
                  <SkelLine width={32} height={9} delay={0.08 + i * 0.05} />
                </div>
                <SkelLine width="80%" height={10} delay={0.1 + i * 0.05} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conversation zone */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Header */}
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid var(--dash-border, rgba(183,191,217,0.15))",
            background: "var(--dash-surface, #fff)",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <SkelCircle size={40} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <SkelLine width={140} height={13} delay={0.05} />
            <SkelLine width={80} height={10} delay={0.1} />
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { side: "left", w: 220 },
            { side: "right", w: 180 },
            { side: "left", w: 280 },
            { side: "right", w: 140 },
            { side: "left", w: 200 },
          ].map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: m.side === "left" ? "flex-start" : "flex-end",
              }}
            >
              <SkelBlock style={{ width: m.w, height: 40, borderRadius: 16 }} delay={i * 0.07} />
            </div>
          ))}
        </div>

        {/* Composer */}
        <div
          style={{
            padding: "14px 24px",
            borderTop: "1px solid var(--dash-border, rgba(183,191,217,0.15))",
            background: "var(--dash-surface, #fff)",
            display: "flex",
            gap: 10,
          }}
        >
          <SkelBlock style={{ flex: 1, height: 44, borderRadius: 99 }} />
          <SkelBlock style={{ width: 44, height: 44, borderRadius: "50%" }} delay={0.05} />
        </div>
      </div>
    </div>
  )
}
