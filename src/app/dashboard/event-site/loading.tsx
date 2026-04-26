export default function Loading() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--dash-bg,#f7f7fb)" }}>
      {/* DashSidebar skeleton — 240px, desktop only */}
      <aside
        style={{
          width: 240,
          flexShrink: 0,
          borderRight: "1px solid rgba(183,191,217,0.25)",
          padding: "20px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
        className="hidden lg:flex"
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <Block width={30} height={30} radius={9} />
          <Line width={80} height={14} />
        </div>

        {/* Nav items */}
        {[100, 90, 110, 95, 80].map((w, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px" }}>
            <Block width={16} height={16} radius={4} />
            <Line width={w} height={12} />
          </div>
        ))}

        <div style={{ flex: 1 }} />

        {/* User avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px" }}>
          <Block width={36} height={36} radius={999} />
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <Line width={90} height={11} />
            <Line width={60} height={9} />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          padding: "clamp(16px,4vw,32px)",
          overflowY: "auto",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Header */}
          <div
            style={{
              marginBottom: 32,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Line width={200} height={28} />
              <Line width={160} height={13} />
            </div>
            <Block width={110} height={34} radius={99} />
          </div>

          {/* Section label */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <Line width={80} height={16} />
            <Block width={52} height={20} radius={99} />
          </div>

          {/* Cards grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            {[0, 1, 2].map(i => (
              <SiteCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

function SiteCardSkeleton() {
  return (
    <div
      style={{
        borderRadius: 16,
        overflow: "hidden",
        background: "var(--dash-surface,#fff)",
        border: "1px solid rgba(183,191,217,0.25)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      {/* Hero area 16/10 */}
      <div
        style={{
          width: "100%",
          aspectRatio: "16/10",
          background:
            "linear-gradient(90deg, var(--dash-faint,rgba(183,191,217,0.07)) 0%, var(--dash-faint-2,rgba(183,191,217,0.12)) 50%, var(--dash-faint,rgba(183,191,217,0.07)) 100%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.6s ease-in-out infinite",
        }}
      />

      {/* Card body */}
      <div style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: 7 }}>
        <Block width={70} height={20} radius={99} />
        <Line width={130} height={11} />
      </div>
    </div>
  )
}

function Block({
  width,
  height,
  radius = 10,
}: {
  width: number | string
  height: number
  radius?: number
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background:
          "linear-gradient(90deg, var(--dash-faint,rgba(183,191,217,0.07)) 0%, var(--dash-faint-2,rgba(183,191,217,0.12)) 50%, var(--dash-faint,rgba(183,191,217,0.07)) 100%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.6s ease-in-out infinite",
        flexShrink: 0,
      }}
    />
  )
}

function Line({ width, height }: { width: number; height: number }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 999,
        background:
          "linear-gradient(90deg, var(--dash-faint,rgba(183,191,217,0.07)) 0%, var(--dash-faint-2,rgba(183,191,217,0.12)) 50%, var(--dash-faint,rgba(183,191,217,0.07)) 100%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.6s ease-in-out infinite",
        flexShrink: 0,
      }}
    />
  )
}
