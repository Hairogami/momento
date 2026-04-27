"use client"

type Props = {
  viewCount: number
  confirmed: number
  plusOnes: number
}

export function StatsBar({ viewCount, confirmed, plusOnes }: Props) {
  return (
    <div
      style={{
        display: "flex",
        gap: "var(--space-5)",
        padding: "var(--space-4) var(--space-5)",
        background: "var(--dash-surface-2)",
        borderRadius: "var(--radius-lg)",
        flexWrap: "wrap",
      }}
    >
      <Stat label="vues" value={viewCount} />
      <Stat label="confirmés" value={confirmed} />
      <Stat label="+1" value={plusOnes} />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: "var(--text-2xl)", fontWeight: 700, color: "var(--dash-text-1)" }}>{value}</span>
      <span style={{ fontSize: "var(--text-xs)", color: "var(--dash-text-3)" }}>{label}</span>
    </div>
  )
}
