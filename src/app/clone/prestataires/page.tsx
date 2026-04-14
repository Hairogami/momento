import AntNav from "@/components/clone/AntNav"
import AntFooter from "@/components/clone/AntFooter"
import Link from "next/link"

const BENEFITS = [
  { emoji: "📈", title: "Plus de visibilité", desc: "Ton profil vu par des milliers d'organisateurs d'événements au Maroc chaque mois." },
  { emoji: "✓",  title: "Badge vérifié",      desc: "Un badge de confiance qui rassure tes clients et te distingue de la concurrence." },
  { emoji: "⭐", title: "Avis clients",        desc: "Collecte des avis authentiques et construis ta réputation en ligne." },
  { emoji: "📋", title: "Gestion simplifiée",  desc: "Gère tes demandes, disponibilités et messages depuis un tableau de bord." },
  { emoji: "💰", title: "0% de commission",    desc: "Aucune commission sur tes contrats. Ce que tu gagnes, c'est à toi." },
  { emoji: "🌍", title: "41 villes couvertes", desc: "Présent dans toutes les grandes villes du Maroc : Casablanca, Rabat, Marrakech…" },
]

const PLANS = [
  {
    name: "Standard",
    price: "Gratuit",
    sub: "Pour toujours",
    features: ["Profil public visible", "Jusqu'à 5 photos", "Recevoir des demandes", "Messagerie clients", "Support email"],
    cta: "Créer mon profil",
    href: "/clone/signup",
    highlight: false,
  },
  {
    name: "Pro",
    price: "299 MAD",
    sub: "/ mois",
    features: ["Tout Standard inclus", "Photos illimitées", "Badge Pro vérifié", "Priorité dans les résultats", "Stats détaillées", "Support prioritaire"],
    cta: "Démarrer Pro",
    href: "/clone/signup",
    highlight: true,
    badge: "Populaire",
  },
]

const STATS = [
  { n: "1 000+", l: "Prestataires" },
  { n: "2 300+", l: "Événements organisés" },
  { n: "41",     l: "Villes au Maroc" },
  { n: "0%",     l: "Commission" },
]

const TESTIMONIALS = [
  { quote: "\"En 2 semaines sur Momento, j'ai reçu 15 demandes. C'est devenu mon principal canal de clients.\"", author: "DJ AZZ", cat: "DJ · Marrakech" },
  { quote: "\"Le badge vérifié a changé la donne. Les clients me font davantage confiance avant même de me contacter.\"", author: "Prestige Photo", cat: "Photographe · Rabat" },
  { quote: "\"Simple, efficace. Mon profil est en ligne en 10 minutes et les demandes arrivent directement sur l'app.\"", author: "La Perle Events", cat: "Event Planner · Marrakech" },
]

const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"

export default function ClonePrestatairesPage() {
  return (
    <div className="ant-root" style={{ minHeight: "100vh", background: "#fff", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <AntNav />

      {/* ── Hero ── */}
      <section style={{ paddingTop: 100, paddingBottom: 80, textAlign: "center", background: "#fff" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px" }}>
          <p className="clone-label" style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6a6a71", marginBottom: 16 }}>
            Pour les prestataires événementiels
          </p>
          <h1 className="clone-heading" style={{
            fontSize: "clamp(2.4rem, 5vw, 4rem)", fontWeight: 700, color: "#121317",
            lineHeight: 1.1, letterSpacing: "-0.03em", margin: "0 0 20px",
          }}>
            Développe ta clientèle<br />
            <span style={{ backgroundImage: G, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              au Maroc, sans commission
            </span>
          </h1>
          <p className="clone-body" style={{ fontSize: 16, color: "#6a6a71", lineHeight: 1.7, margin: "0 0 36px" }}>
            Rejoins 1 000+ prestataires vérifiés sur Momento et reçois des demandes qualifiées directement dans ton tableau de bord.
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <Link href="/clone/signup" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 32px", borderRadius: 999,
              background: G, color: "#fff",
              fontSize: 15, fontWeight: 600, textDecoration: "none",
              boxShadow: "0 4px 24px rgba(225,29,72,0.3)",
            }}>
              Créer mon profil gratuitement →
            </Link>
            <Link href="/clone/explore" className="clone-cta-ghost" style={{
              display: "inline-flex", alignItems: "center",
              padding: "14px 28px", borderRadius: 999,
              background: "rgba(183,191,217,0.1)",
              border: "1px solid rgba(183,191,217,0.3)",
              color: "#45474D", fontSize: 15, textDecoration: "none",
            }}>
              Voir l&apos;annuaire
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ background: "#f7f7fb", borderTop: "1px solid rgba(183,191,217,0.15)", borderBottom: "1px solid rgba(183,191,217,0.15)", padding: "32px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }} className="grid grid-cols-2 sm:grid-cols-4">
          {STATS.map(s => (
            <div key={s.l} style={{ textAlign: "center" }}>
              <p style={{ fontSize: "clamp(1.8rem,4vw,2.4rem)", fontWeight: 700, color: "#121317", margin: 0,
                backgroundImage: G, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {s.n}
              </p>
              <p className="clone-muted" style={{ fontSize: 12, color: "#6a6a71", margin: "4px 0 0", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {s.l}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Benefits ── */}
      <section style={{ padding: "72px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 className="clone-heading" style={{ fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 700, color: "#121317", letterSpacing: "-0.02em", margin: "0 0 12px" }}>
              Tout pour développer ton activité
            </h2>
            <p className="clone-body" style={{ fontSize: 15, color: "#6a6a71" }}>Gratuit, sans commission, sans engagement.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: 20 }}>
            {BENEFITS.map(b => (
              <div key={b.title} className="clone-card" style={{
                background: "#fff", border: "1px solid rgba(183,191,217,0.2)",
                borderRadius: 20, padding: "24px 24px",
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, marginBottom: 16,
                  background: "linear-gradient(140deg, rgba(225,29,72,0.08), rgba(147,51,234,0.08))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20,
                }}>
                  {b.emoji}
                </div>
                <h3 className="clone-heading" style={{ fontSize: 15, fontWeight: 700, color: "#121317", margin: "0 0 8px" }}>{b.title}</h3>
                <p className="clone-body" style={{ fontSize: 13, color: "#6a6a71", margin: 0, lineHeight: 1.65 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section style={{ background: "#f7f7fb", padding: "72px 24px", borderTop: "1px solid rgba(183,191,217,0.15)" }} id="pricing">
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 className="clone-heading" style={{ fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 700, color: "#121317", letterSpacing: "-0.02em", margin: "0 0 12px" }}>
              Simple &amp; transparent
            </h2>
            <p className="clone-body" style={{ fontSize: 15, color: "#6a6a71" }}>Commence gratuitement, passe Pro quand tu es prêt.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 20 }} className="grid grid-cols-1 md:grid-cols-2">
            {PLANS.map(p => (
              <div key={p.name} className="clone-card" style={{
                background: p.highlight ? "#121317" : "#fff",
                border: p.highlight ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(183,191,217,0.2)",
                borderRadius: 24, padding: "32px 28px",
                position: "relative", overflow: "hidden",
                transform: p.highlight ? "scale(1.02)" : "none",
                boxShadow: p.highlight ? "0 20px 60px rgba(0,0,0,0.18)" : "none",
              }}>
                {p.highlight && <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(225,29,72,0.2), transparent)", pointerEvents: "none" }} />}
                {p.badge && (
                  <div style={{
                    display: "inline-flex", marginBottom: 12,
                    padding: "3px 12px", borderRadius: 999,
                    background: "rgba(225,29,72,0.15)", border: "1px solid rgba(225,29,72,0.3)",
                    fontSize: 11, fontWeight: 600, color: "#F87171",
                  }}>{p.badge}</div>
                )}
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 11, color: p.highlight ? "rgba(255,255,255,0.45)" : "#6a6a71", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 6px" }}>{p.sub}</p>
                  <div className="clone-heading" style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 700, color: p.highlight ? "#fff" : "#121317", lineHeight: 1 }}>{p.price}</div>
                  <div style={{ fontSize: 13, color: p.highlight ? "rgba(255,255,255,0.5)" : "#6a6a71", marginTop: 2 }}>{p.name}</div>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {p.features.map(f => (
                    <li key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: p.highlight ? "rgba(255,255,255,0.75)" : "#45474D" }}>
                      <span style={{ color: p.highlight ? "#E11D48" : "#16A34A", fontWeight: 700, flexShrink: 0 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={p.href} style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "12px 24px", borderRadius: 999,
                  background: p.highlight ? "#fff" : G,
                  color: p.highlight ? "#121317" : "#fff",
                  fontSize: 14, fontWeight: 600, textDecoration: "none",
                }}>{p.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ padding: "72px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 className="clone-heading" style={{ fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 700, color: "#121317", textAlign: "center", margin: "0 0 40px", letterSpacing: "-0.02em" }}>
            Ils ont rejoint Momento
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 }}>
            {TESTIMONIALS.map(t => (
              <div key={t.author} className="clone-card" style={{
                background: "#fff", border: "1px solid rgba(183,191,217,0.2)",
                borderRadius: 20, padding: "24px",
              }}>
                <div style={{ display: "flex", gap: 2, marginBottom: 14 }}>
                  {[1,2,3,4,5].map(i => <span key={i} style={{ color: "#F59E0B", fontSize: 14 }}>★</span>)}
                </div>
                <p className="clone-body" style={{ fontSize: 14, color: "#45474D", margin: "0 0 16px", lineHeight: 1.65, fontStyle: "italic" }}>{t.quote}</p>
                <div>
                  <p className="clone-heading" style={{ fontSize: 13, fontWeight: 700, color: "#121317", margin: 0 }}>{t.author}</p>
                  <p className="clone-muted" style={{ fontSize: 11, color: "#6a6a71", margin: "2px 0 0" }}>{t.cat}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA bottom ── */}
      <section style={{ background: "#121317", padding: "72px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(1.8rem,4vw,3rem)", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", margin: "0 0 16px" }}>
            Prêt à développer ton activité ?
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", margin: "0 0 32px", lineHeight: 1.65 }}>
            Rejoins plus de 1 000 prestataires qui reçoivent déjà des clients via Momento.
          </p>
          <Link href="/clone/signup" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "14px 36px", borderRadius: 999,
            background: G, color: "#fff",
            fontSize: 15, fontWeight: 600, textDecoration: "none",
          }}>
            Créer mon profil gratuitement →
          </Link>
        </div>
      </section>

      <AntFooter />
    </div>
  )
}
