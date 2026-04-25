import { SkelBlock, SkelLine, SkelCircle, SkelPill, SkelCard } from "@/components/skeleton/Skeleton"

/**
 * Skeleton fiche vendor — mime hero + meta + galerie + description + reviews.
 */
export default function VendorLoading() {
  return (
    <div style={{ background: "var(--dash-bg, #f7f7fb)", minHeight: "100vh", fontFamily: "'Geist', sans-serif" }}>
      {/* Hero */}
      <div style={{ position: "relative", width: "100%", height: 360, overflow: "hidden" }}>
        <SkelBlock style={{ width: "100%", height: "100%", borderRadius: 0 }} />
      </div>

      {/* Container */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px 80px" }}>
        {/* Meta header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 18, marginBottom: 28 }}>
          <SkelCircle size={88} style={{ marginTop: -56, border: "4px solid var(--dash-bg,#f7f7fb)" }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
            <SkelLine width="45%" height={26} delay={0.05} />
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <SkelLine width={120} height={12} delay={0.1} />
              <SkelLine width={80} height={12} delay={0.12} />
              <SkelLine width={100} height={12} delay={0.14} />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <SkelPill width={120} height={36} delay={0.18} />
              <SkelPill width={100} height={36} delay={0.2} />
              <SkelPill width={44} height={36} delay={0.22} />
            </div>
          </div>
        </div>

        {/* Layout 2 cols */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 320px", gap: 24 }}>
          {/* Left col */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Photos gallery */}
            <SkelCard style={{ padding: 18 }}>
              <SkelLine width={100} height={14} style={{ marginBottom: 14 }} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkelBlock key={i} style={{ aspectRatio: "1 / 1", borderRadius: 10 }} delay={i * 0.05} />
                ))}
              </div>
            </SkelCard>

            {/* Description */}
            <SkelCard style={{ padding: 18 }}>
              <SkelLine width={140} height={14} style={{ marginBottom: 14 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <SkelLine width="100%" height={11} delay={0.05} />
                <SkelLine width="95%" height={11} delay={0.08} />
                <SkelLine width="98%" height={11} delay={0.11} />
                <SkelLine width="60%" height={11} delay={0.14} />
              </div>
            </SkelCard>

            {/* Reviews */}
            <SkelCard style={{ padding: 18 }}>
              <SkelLine width={120} height={14} style={{ marginBottom: 16 }} />
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 12,
                    paddingBottom: 14,
                    marginBottom: 14,
                    borderBottom: i < 2 ? "1px solid var(--dash-divider, rgba(183,191,217,0.10))" : "none",
                  }}
                >
                  <SkelCircle size={40} delay={i * 0.08} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                    <SkelLine width="30%" height={11} delay={0.05 + i * 0.08} />
                    <SkelLine width="100%" height={10} delay={0.1 + i * 0.08} />
                    <SkelLine width="70%" height={10} delay={0.12 + i * 0.08} />
                  </div>
                </div>
              ))}
            </SkelCard>
          </div>

          {/* Right col — sticky contact card */}
          <div>
            <SkelCard style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
              <SkelLine width="60%" height={14} />
              <SkelBlock style={{ height: 44, borderRadius: 99 }} delay={0.05} />
              <SkelBlock style={{ height: 44, borderRadius: 99 }} delay={0.1} />
              <div style={{ height: 1, background: "var(--dash-divider, rgba(183,191,217,0.10))", margin: "6px 0" }} />
              <SkelLine width="80%" height={11} delay={0.15} />
              <SkelLine width="60%" height={11} delay={0.18} />
            </SkelCard>
          </div>
        </div>
      </div>
    </div>
  )
}
