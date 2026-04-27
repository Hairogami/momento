const TESTIMONIALS = [
  {
    quote: "On a trouvé notre photographe en 20 minutes. Vérifié, réactif — le résultat était au-delà de nos attentes.",
    author: "Sara M.",
    event: "Mariage · Casablanca",
    initials: "SM",
    accent: "linear-gradient(135deg,#E11D48,#9333EA)",
  },
  {
    quote: "Contact direct avec les prestas. On a négocié nous-mêmes et économisé une fortune sur notre séminaire corporate.",
    author: "Youssef B.",
    event: "Séminaire · Rabat",
    initials: "YB",
    accent: "linear-gradient(135deg,#9333EA,#3B82F6)",
  },
  {
    quote: "Budget, timeline, tâches — tout au même endroit. Organiser des fiançailles n'a jamais été aussi serein.",
    author: "Nadia L.",
    event: "Fiançailles · Marrakech",
    initials: "NL",
    accent: "linear-gradient(135deg,#3B82F6,#10B981)",
  },
]

export default function AntTestimonials() {
  return (
    <section
      style={{ backgroundColor: "var(--dash-bg,#fff)", borderTop: "1px solid rgba(183,191,217,0.15)" }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24 lg:py-32">

        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <h2
            className="clone-heading"
            style={{
              fontSize: "clamp(1.8rem, 0.5rem + 3vw, 4rem)",
              fontWeight: 600,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              color: "var(--dash-text,#121317)",
            }}
          >
            Ils ont créé<br />
            <span style={{ color: "var(--dash-text-2,#6a6a71)", fontWeight: 400, fontStyle: "italic" }}>
              l&apos;événement parfait
            </span>
          </h2>
          <div style={{ paddingTop: 8 }}>
            <p className="clone-body" style={{ fontSize: "var(--text-base)", lineHeight: 1.7, color: "var(--dash-text-2,#45474D)" }}>
              2 300+ organisateurs ont déjà fait confiance à Momento pour leurs mariages,
              fiançailles et événements corporate au Maroc.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16 }}>
              <span style={{ color: "#F59E0B", fontSize: "var(--text-base)" }}>★★★★★</span>
              <span className="clone-body" style={{ fontSize: "var(--text-sm)", color: "var(--dash-text-2,#45474D)" }}>
                4.8 / 5 de moyenne · 2 300+ événements
              </span>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="clone-card flex flex-col gap-5 p-7 rounded-2xl"
              style={{
                background: "rgba(183,191,217,0.05)",
                border: "1px solid rgba(183,191,217,0.2)",
              }}
            >
              <span style={{ color: "#F59E0B", fontSize: "var(--text-sm)" }}>★★★★★</span>

              <p className="clone-body" style={{ fontSize: "var(--text-sm)", lineHeight: 1.75, color: "var(--dash-text-2,#45474D)", flex: 1 }}>
                &ldquo;{t.quote}&rdquo;
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: t.accent,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: "var(--text-xs)", fontWeight: 700, flexShrink: 0,
                }}>
                  {t.initials}
                </div>
                <div>
                  <div className="clone-heading" style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--dash-text,#121317)" }}>{t.author}</div>
                  <div className="clone-muted" style={{ fontSize: "var(--text-xs)", color: "var(--dash-text-2,#6a6a71)" }}>{t.event}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
