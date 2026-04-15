const STEPS = [
  {
    number: "01",
    icon: "search",
    title: "Recherchez",
    desc: "Filtrez par catégorie, ville et budget — trouvez le prestataire parfait en quelques clics.",
    proof: "1 000+ prestataires · 41 villes",
    cta: "Explorer les prestataires",
    href: "/explore",
    accent: "linear-gradient(135deg, #E11D48, #9333EA)",
  },
  {
    number: "02",
    icon: "chat",
    title: "Contactez",
    desc: "Échangez directement avec vos prestataires, comparez les devis et confirmez votre événement — zéro commission.",
    proof: "Devis en moyenne < 2h",
    cta: "Voir comment ça marche",
    href: "#",
    accent: "linear-gradient(135deg, #9333EA, #3B82F6)",
  },
  {
    number: "03",
    icon: "celebration",
    title: "Célébrez",
    desc: "Vivez votre événement l'esprit tranquille, entouré de prestataires de confiance choisis sur mesure.",
    proof: "4.8/5 · 2 300 événements réussis",
    cta: "Commencer gratuitement",
    href: "/signup",
    accent: "linear-gradient(135deg, #3B82F6, #10B981)",
  },
]

export default function AntUseCases() {
  return (
    <section
      id="comment-ca-marche"
      style={{ backgroundColor: "var(--dash-bg,#fff)", borderTop: "1px solid rgba(183,191,217,0.15)" }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24 lg:py-32">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <h2
            style={{
              fontSize: "clamp(2rem, 4.5vw, 4rem)",
              fontWeight: 600,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              color: "var(--dash-text,#121317)",
            }}
          >
            Comment ça<br />
            <span style={{ color: "var(--dash-text-2,#6a6a71)", fontWeight: 400, fontStyle: "italic" }}>marche ?</span>
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--dash-text-2,#45474D)", paddingTop: 8 }}>
            En trois étapes simples, trouvez et réservez le prestataire parfait pour votre événement au Maroc —
            sans frais cachés, sans intermédiaire, sans stress.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STEPS.map((step, i) => (
            <div
              key={step.number}
              className="relative flex flex-col gap-5 p-7 rounded-2xl transition-all hover:scale-[1.01]"
              style={{
                background: "rgba(183,191,217,0.06)",
                border: "1px solid rgba(183,191,217,0.2)",
              }}
            >
              {/* Step number + connector */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: step.accent }}
                >
                  <span
                    style={{
                      fontFamily: "'Google Symbols','Material Symbols Outlined'",
                      fontSize: 18, color: "#fff",
                      fontWeight: "normal", fontStyle: "normal",
                      lineHeight: 1, userSelect: "none",
                    }}
                  >
                    {step.icon}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "clamp(2rem, 3vw, 3rem)",
                    fontWeight: 700,
                    color: "rgba(183,191,217,0.25)",
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                  }}
                >
                  {step.number}
                </span>

                {/* Connector line between steps */}
                {i < STEPS.length - 1 && (
                  <div
                    className="hidden md:block absolute"
                    style={{
                      right: "-2rem",
                      top: "2.2rem",
                      width: "3.5rem",
                      height: 1,
                      background: "linear-gradient(90deg, rgba(183,191,217,0.4), transparent)",
                      zIndex: 10,
                    }}
                  />
                )}
              </div>

              <h3 style={{ fontSize: 22, fontWeight: 600, color: "var(--dash-text,#121317)" }}>{step.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--dash-text-2,#6a6a71)" }}>{step.desc}</p>
              <span style={{
                fontSize: 12, fontWeight: 600,
                padding: "3px 10px", borderRadius: 99,
                background: "rgba(225,29,72,0.08)",
                border: "1px solid rgba(225,29,72,0.15)",
                color: "#E11D48",
                display: "inline-block", alignSelf: "flex-start",
              }}>
                {step.proof}
              </span>
              <a
                href={step.href}
                className="clone-cta-ghost mt-auto inline-flex items-center gap-1 text-sm font-medium transition-opacity hover:opacity-60 px-4 py-2 rounded-full"
                style={{ color: "var(--dash-text,#121317)" }}
              >
                {step.cta} →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
