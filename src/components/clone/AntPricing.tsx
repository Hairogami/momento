import AntConfetti from "./AntConfetti"

const ESSENTIAL = [
  "Recherche & filtres avancés",
  "Messagerie directe illimitée",
  "Gestion invités & budget",
  "Tâches & timeline événement",
  "Favoris & comparaison",
]

const PREMIUM_EXTRA = [
  "Tableau de bord premium",
  "Intégration Google Calendar",
  "Rappels & notifications push",
  "Outils de planification IA",
  "Export PDF & partage invités",
]

const PLATINE_EXTRA = [
  "Tout le plan Premium",
  "Accompagnement event planner dédié",
  "Appels de suivi & conseils terrain",
  "Accès réseau prestataires triés sur le volet",
  "Révisions budget & négociation tarifs",
  "Checklist personnalisée J-180 à J-1",
]

export default function AntPricing() {
  return (
    <section
      id="pricing"
      className="relative overflow-hidden"
      style={{ backgroundColor: "#fff", borderTop: "1px solid rgba(183,191,217,0.15)" }}
    >
      <AntConfetti count={80} dark={false} />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 lg:py-32">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="clone-label" style={{ fontSize: 12, color: "#6a6a71", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
            Pour les organisateurs uniquement
          </p>
          <h2 className="clone-heading" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 600, lineHeight: 1.1, letterSpacing: "-0.03em", color: "#121317" }}>
            Simple, transparent,<br />
            <span style={{ color: "#6a6a71", fontWeight: 400, fontStyle: "italic" }}>sans surprise</span>
          </h2>
          <p className="clone-body" style={{ fontSize: 15, color: "#6a6a71", marginTop: 16, maxWidth: 480, marginInline: "auto", lineHeight: 1.7 }}>
            Utiliser Momento, c&apos;est gratuit. Pour aller plus loin, on a pensé à tout.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">

          {/* Essentiel — gratuit */}
          <div
            className="clone-card flex flex-col gap-5 p-7 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(183,191,217,0.25)", backdropFilter: "blur(8px)" }}
          >
            <div>
              <p style={{ fontSize: 11, color: "#6a6a71", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Gratuit · Pour toujours</p>
              <div className="clone-heading" style={{ fontSize: "clamp(1.4rem, 2.5vw, 2rem)", fontWeight: 700, lineHeight: 1.1, color: "#121317" }}>Essentiel</div>
              <p className="clone-muted" style={{ fontSize: 13, color: "#6a6a71", marginTop: 6 }}>Tout pour trouver le bon prestataire</p>
            </div>
            <ul className="clone-body" style={{ fontSize: 13, color: "#45474D", lineHeight: 2.2, listStyle: "none", padding: 0, flex: 1 }}>
              {ESSENTIAL.map(f => (
                <li key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#16A34A", fontWeight: 700 }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <a
              href="/signup"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-medium transition-all hover:opacity-80"
              style={{ background: "linear-gradient(135deg, var(--g1, #E11D48), var(--g2, #9333EA))", color: "#fff" }}
            >
              Commencer gratuitement
            </a>
          </div>

          {/* Premium — featured */}
          <div
            className="clone-card flex flex-col gap-5 p-7 rounded-2xl relative overflow-hidden"
            style={{
              background: "#121317",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(8px)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
              transform: "translateY(-8px)",
            }}
          >
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(225,29,72,0.22), transparent)",
            }} />
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Freemium · Été 2025</p>
                <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: "rgba(225,29,72,0.2)", color: "#F87171", border: "1px solid rgba(225,29,72,0.3)" }}>Été 2025</span>
              </div>
              <div style={{ fontSize: "clamp(1.4rem, 2.5vw, 2rem)", fontWeight: 700, lineHeight: 1.1, color: "#fff" }}>Premium</div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 6 }}>Outils avancés pour grands événements</p>
            </div>
            <ul className="relative" style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 2.2, listStyle: "none", padding: 0, flex: 1 }}>
              {[...ESSENTIAL, ...PREMIUM_EXTRA].map(f => (
                <li key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#E11D48", fontWeight: 700 }}>✓</span>
                  <span style={{ color: PREMIUM_EXTRA.includes(f) ? "#fff" : "rgba(255,255,255,0.55)" }}>{f}</span>
                </li>
              ))}
            </ul>
            <a
              href="/signup"
              className="relative inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-medium transition-all hover:opacity-90"
              style={{ background: "#fff", color: "#121317" }}
            >
              Rejoindre la liste d&apos;attente
            </a>
          </div>

          {/* Platine — event planner */}
          <div
            className="clone-card flex flex-col gap-5 p-7 rounded-2xl relative overflow-hidden"
            style={{
              background: "linear-gradient(145deg, rgba(147,51,234,0.07), rgba(225,29,72,0.05))",
              border: "1px solid rgba(147,51,234,0.25)",
              backdropFilter: "blur(8px)",
            }}
          >
            <div style={{
              position: "absolute", top: 0, right: 0, width: 80, height: 80,
              background: "radial-gradient(circle at top right, rgba(147,51,234,0.15), transparent)",
              pointerEvents: "none",
            }} />
            <div className="relative">
              <p style={{ fontSize: 11, color: "#9333EA", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Sur mesure · Disponible maintenant</p>
              <div className="clone-heading" style={{ fontSize: "clamp(1.4rem, 2.5vw, 2rem)", fontWeight: 700, lineHeight: 1.1, color: "#121317" }}>Platine</div>
              <p className="clone-muted" style={{ fontSize: 13, color: "#6a6a71", marginTop: 6 }}>Un event planner dédié, pour vous</p>
            </div>
            <ul className="clone-body relative" style={{ fontSize: 13, color: "#45474D", lineHeight: 2.2, listStyle: "none", padding: 0, flex: 1 }}>
              {PLATINE_EXTRA.map(f => (
                <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ color: "#9333EA", fontWeight: 700, marginTop: 2, flexShrink: 0 }}>✦</span>
                  <span style={{ fontWeight: f === "Tout le plan Premium" ? 600 : 400 }}>{f}</span>
                </li>
              ))}
            </ul>
            <a
              href="/signup"
              className="relative inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-medium transition-all hover:opacity-80"
              style={{ background: "linear-gradient(135deg, var(--g1, #E11D48), var(--g2, #9333EA))", color: "#fff" }}
            >
              Réserver mon planner
            </a>
          </div>

        </div>
      </div>
    </section>
  )
}
