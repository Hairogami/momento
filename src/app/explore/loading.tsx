export default function ExploreLoading() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--momento-ink)" }}>
      {/* Nav skeleton */}
      <div className="h-16 border-b flex items-center px-6 gap-6"
        style={{ borderColor: "var(--momento-anthracite)", backgroundColor: "var(--momento-ink)" }}>
        <div className="h-5 w-28 rounded-lg animate-pulse" style={{ backgroundColor: "var(--momento-anthracite)" }} />
        <div className="flex-1 h-10 rounded-xl animate-pulse" style={{ backgroundColor: "var(--momento-anthracite)" }} />
        <div className="h-8 w-20 rounded-lg animate-pulse" style={{ backgroundColor: "var(--momento-anthracite)" }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter bar skeleton */}
        <div className="flex gap-3 mb-8 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-9 w-28 flex-shrink-0 rounded-full animate-pulse"
              style={{ backgroundColor: "var(--momento-anthracite)", animationDelay: `${i * 80}ms` }} />
          ))}
        </div>

        {/* Vendor grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden animate-pulse"
              style={{ backgroundColor: "var(--momento-dark)", animationDelay: `${i * 50}ms` }}>
              {/* Photo carousel placeholder */}
              <div className="h-52 w-full" style={{ backgroundColor: "var(--momento-anthracite)" }} />
              <div className="p-4 space-y-3">
                <div className="h-4 w-3/4 rounded" style={{ backgroundColor: "var(--momento-anthracite)" }} />
                <div className="h-3 w-1/2 rounded" style={{ backgroundColor: "var(--momento-anthracite)" }} />
                <div className="flex justify-between items-center mt-2">
                  <div className="h-3 w-16 rounded" style={{ backgroundColor: "var(--momento-anthracite)" }} />
                  <div className="h-3 w-12 rounded" style={{ backgroundColor: "var(--momento-anthracite)" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
