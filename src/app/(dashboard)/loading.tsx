export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header skeleton */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-lg animate-pulse" style={{ backgroundColor: "var(--momento-anthracite)" }} />
          <div className="h-4 w-32 rounded animate-pulse" style={{ backgroundColor: "var(--momento-anthracite)" }} />
        </div>
        <div className="h-14 w-20 rounded-2xl animate-pulse hidden sm:block" style={{ backgroundColor: "var(--momento-anthracite)" }} />
      </div>

      <div className="h-px" style={{ backgroundColor: "var(--momento-anthracite)" }} />

      {/* Widget grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i}
            className="rounded-2xl p-5 animate-pulse"
            style={{
              backgroundColor: "var(--momento-dark)",
              border: "1px solid var(--momento-anthracite)",
              animationDelay: `${i * 80}ms`,
              minHeight: i < 2 ? 160 : 120,
            }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-4 w-4 rounded" style={{ backgroundColor: "var(--momento-anthracite)" }} />
              <div className="h-4 w-24 rounded" style={{ backgroundColor: "var(--momento-anthracite)" }} />
            </div>
            <div className="space-y-2">
              <div className="h-8 w-20 rounded" style={{ backgroundColor: "var(--momento-anthracite)" }} />
              <div className="h-3 w-32 rounded" style={{ backgroundColor: "var(--momento-anthracite)" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
