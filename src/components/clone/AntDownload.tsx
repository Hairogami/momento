import AntConfetti from "./AntConfetti"

export default function AntDownload() {
  return (
    <section
      id="download"
      className="relative overflow-hidden"
      style={{ backgroundColor: "#000", minHeight: "90dvh", display: "flex", alignItems: "center" }}
    >
      <AntConfetti count={120} dark={true} />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 w-full">
        <h2
          style={{
            fontSize: "clamp(2rem, 0.5rem + 4.5vw, 5.5rem)",
            fontWeight: 600,
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            color: "#fff",
            maxWidth: 700,
          }}
        >
          Créez l&apos;événement<br />de vos rêves, gratuitement
        </h2>

        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", marginTop: 20, maxWidth: 480, lineHeight: 1.7 }}>
          Plus de 1 000 prestataires vérifiés. 41 villes au Maroc. Rejoignez Momento aujourd&apos;hui.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mt-10">
          <a
            href="/login"
            className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-medium transition-all hover:opacity-90"
            style={{ background: "var(--dash-surface,#fff)", color: "var(--dash-text,#121317)" }}
          >
            Trouver un prestataire
          </a>
          <a
            href="#pricing"
            className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-medium transition-all hover:opacity-80"
            style={{ background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}
          >
            Parler à un event planner
          </a>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
          <span style={{
            fontSize: 11, padding: "4px 12px", borderRadius: 99,
            background: "rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.6)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}>
            📱 Application mobile
          </span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
            En cours de développement · Soyez parmi les premiers
          </span>
        </div>
      </div>
    </section>
  )
}
