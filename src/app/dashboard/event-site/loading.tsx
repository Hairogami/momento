export default function Loading() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--background, #0a0a0a)" }}>
      <aside
        style={{
          width: 420,
          flexShrink: 0,
          borderRight: "1px solid rgba(255,255,255,0.08)",
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Line width={60} height={12} />
          <Line width={180} height={22} />
          <Line width={220} height={14} />
        </div>

        <Block height={44} />

        <div style={{ display: "flex", gap: 8 }}>
          <Block flex={1} height={38} />
          <Block flex={1} height={38} />
          <Block flex={1} height={38} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 8 }}>
          <Line width={90} height={10} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Block height={56} />
            <Block height={56} />
            <Block height={56} />
            <Block height={56} />
          </div>

          <Line width={140} height={10} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Block height={44} />
            <Block height={44} />
            <Block height={44} />
            <Block height={44} />
            <Block height={44} />
            <Block height={44} />
          </div>

          <Line width={120} height={10} />
          <Block height={48} />
          <Block height={48} />
          <Block height={48} />
        </div>
      </aside>

      <main
        style={{
          flex: 1,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 900,
            aspectRatio: "3 / 4",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.4)",
            fontSize: 14,
            letterSpacing: "0.05em",
          }}
        >
          Chargement du site…
        </div>
      </main>
    </div>
  )
}

function Block({ height, flex }: { height: number; flex?: number }) {
  return (
    <div
      style={{
        flex,
        height,
        borderRadius: 10,
        background: "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.6s ease-in-out infinite",
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
        background: "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.6s ease-in-out infinite",
      }}
    />
  )
}
