"use client"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import AntNav from "@/components/clone/AntNav"
import AntFooter from "@/components/clone/AntFooter"

// ── Compteur animé (de 0 à `to` sur `duration` ms quand visible) ──
function Counter({ to, duration = 1600, suffix = "", prefix = "" }: { to: number; duration?: number; suffix?: string; prefix?: string }) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement | null>(null)
  const started = useRef(false)

  useEffect(() => {
    if (!ref.current) return
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !started.current) {
          started.current = true
          const start = performance.now()
          const tick = (now: number) => {
            const p = Math.min(1, (now - start) / duration)
            const eased = 1 - Math.pow(1 - p, 3) // easeOutCubic
            setValue(Math.round(to * eased))
            if (p < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      })
    }, { threshold: 0.3 })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [to, duration])

  return (
    <span ref={ref} style={{ fontVariantNumeric: "tabular-nums" }}>
      {prefix}{value.toLocaleString("fr-FR")}{suffix}
    </span>
  )
}

const STATS = [
  { value: 1000, suffix: "+", label: "Prestataires vérifiés",         color: "#E11D48" },
  { value: 41,   suffix: "",  label: "Villes couvertes",              color: "#9333EA" },
  { value: 31,   suffix: "",  label: "Catégories de services",        color: "#EC4899" },
  { value: 2300, suffix: "+", label: "Événements organisés",          color: "#F59E0B" },
  { value: 100,  suffix: " %", label: "De vos revenus vous reviennent",  color: "#A855F7" },
  { value: 48,   suffix: " h", label: "Réponse moyenne aux demandes", color: "#6366F1" },
]

const BENEFITS = [
  { icon: "verified",       title: "Vérification sociale",   body: "Badge vérifié via Instagram/Facebook. Les clients savent qui vous êtes avant de vous contacter." },
  { icon: "payments",       title: "Paiement direct",         body: "Vous signez en direct avec le client. Momento n'entre jamais dans la transaction." },
  { icon: "insights",       title: "Tableau de bord pro",    body: "Vos demandes, messages, packages et statistiques centralisés. Tout piloter en 5 minutes par jour." },
  { icon: "chat_bubble",    title: "Messagerie intégrée",    body: "Les clients vous contactent directement. Notifications mail + in-app pour ne rien manquer." },
  { icon: "language",       title: "Visibilité nationale",   body: "41 villes marocaines, 31 catégories. Référencement SEO natif, pas besoin d'Ads." },
  { icon: "star",           title: "Reviews vérifiées",      body: "Notes 5 étoiles post-événement uniquement. La qualité remonte naturellement." },
]

const STEPS = [
  { n: 1, title: "Inscription gratuite",   body: "Créez votre profil en 3 minutes. Photos, packages, zones de service." },
  { n: 2, title: "Vérification",           body: "Liez votre Instagram ou Facebook. Badge vérifié affiché sur votre fiche." },
  { n: 3, title: "Premières demandes",     body: "Les clients vous trouvent via /explore et vous contactent en messagerie directe." },
  { n: 4, title: "Signez en direct",       body: "Vous gérez le contrat et le paiement, en direct avec votre client." },
]

export default function ProPage() {
  return (
    <div className="ant-root" style={{ background: "var(--dash-bg,#fff)", minHeight: "100vh" }}>
      <AntNav />

      {/* ── HERO ── */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-4"
        style={{ minHeight: "72vh", paddingTop: 120, paddingBottom: 80 }}
      >
        <span
          style={{
            display: "inline-block",
            fontSize: "var(--text-xs)",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "6px 14px",
            borderRadius: 999,
            color: "#fff",
            background: "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))",
            marginBottom: 20,
          }}
        >
          Momento Pro
        </span>
        <h1
          style={{
            fontSize: "clamp(2.2rem, 5.5vw, 4.8rem)",
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            maxWidth: 900,
            color: "var(--dash-text,#121317)",
          }}
        >
          Votre savoir-faire mérite <span style={{
            background: "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>une meilleure vitrine.</span>
        </h1>
        <p
          className="clone-body"
          style={{
            fontSize: "clamp(1rem, 1.6vw, 1.25rem)",
            maxWidth: 680,
            marginTop: 22,
            lineHeight: 1.55,
            color: "var(--dash-text-2,#45474D)",
          }}
        >
          Rejoignez le plus grand annuaire des prestataires événementiels du Maroc.
          Profil gratuit, paiement direct client → prestataire.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-8">
          <Link
            href="/signup?role=vendor"
            className="flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))", color: "#fff" }}
          >
            Créer mon profil prestataire
          </Link>
          <Link
            href="/explore"
            className="clone-cta-ghost flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-medium transition-all hover:opacity-80"
            style={{
              backgroundColor: "rgba(183,191,217,0.12)",
              color: "var(--dash-text,#121317)",
              border: "1px solid rgba(183,191,217,0.3)",
            }}
          >
            Voir les prestataires actifs
          </Link>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding: "80px 24px", borderTop: "1px solid rgba(183,191,217,0.15)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <p className="clone-label" style={{ fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--dash-text-2,#6a6a71)", textAlign: "center", marginBottom: 40 }}>
            Momento en chiffres
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 28,
            }}
          >
            {STATS.map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "clamp(2.5rem, 5vw, 4rem)",
                    fontWeight: 800,
                    lineHeight: 1,
                    letterSpacing: "-0.04em",
                    color: s.color,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  <Counter to={s.value} suffix={s.suffix} />
                </div>
                <p className="clone-body" style={{ fontSize: "var(--text-sm)", marginTop: 10, color: "var(--dash-text-2,#45474D)" }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section style={{ padding: "100px 24px", borderTop: "1px solid rgba(183,191,217,0.15)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 className="clone-heading" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--dash-text,#121317)" }}>
              Pourquoi les prestataires nous choisissent
            </h2>
            <p className="clone-body" style={{ fontSize: "var(--text-base)", color: "var(--dash-text-2,#45474D)", marginTop: 14, maxWidth: 580, marginInline: "auto" }}>
              Pas de frais cachés, pas d&apos;intermédiaire sur votre contrat. Juste de la visibilité et des outils.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="clone-card-white"
                style={{ padding: 28, borderRadius: 20, border: "1px solid rgba(183,191,217,0.2)", background: "#fff" }}
              >
                <div
                  className="clone-icon-accent"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Google Symbols','Material Symbols Outlined'",
                      fontSize: "var(--text-lg)",
                      background: "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {b.icon}
                  </span>
                </div>
                <h3 style={{ fontSize: "var(--text-md)", fontWeight: 700, margin: "0 0 8px", color: "var(--dash-text,#121317)" }}>{b.title}</h3>
                <p className="clone-body" style={{ fontSize: "var(--text-sm)", lineHeight: 1.55, color: "var(--dash-text-2,#45474D)", margin: 0 }}>
                  {b.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STEPS ── */}
      <section style={{ padding: "100px 24px", borderTop: "1px solid rgba(183,191,217,0.15)", background: "rgba(183,191,217,0.04)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 className="clone-heading" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 700, letterSpacing: "-0.02em" }}>
              4 étapes, 15 minutes
            </h2>
            <p className="clone-body" style={{ fontSize: "var(--text-base)", color: "var(--dash-text-2,#45474D)", marginTop: 14 }}>
              Votre fiche peut être en ligne et recevoir ses premières demandes aujourd&apos;hui.
            </p>
          </div>
          <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 18 }}>
            {STEPS.map((s) => (
              <li
                key={s.n}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 20,
                  padding: 24,
                  borderRadius: 16,
                  border: "1px solid rgba(183,191,217,0.2)",
                  background: "#fff",
                }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "var(--text-base)",
                    fontWeight: 800,
                    color: "#fff",
                    background: "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))",
                  }}
                >
                  {s.n}
                </div>
                <div>
                  <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, margin: "4px 0 6px", color: "var(--dash-text,#121317)" }}>{s.title}</h3>
                  <p className="clone-body" style={{ fontSize: "var(--text-sm)", lineHeight: 1.55, color: "var(--dash-text-2,#45474D)", margin: 0 }}>{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ padding: "100px 24px", textAlign: "center", borderTop: "1px solid rgba(183,191,217,0.15)" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <h2 className="clone-heading" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 700, letterSpacing: "-0.02em" }}>
            Prêt à rejoindre les 1 000&nbsp;+ ?
          </h2>
          <p className="clone-body" style={{ fontSize: "var(--text-md)", color: "var(--dash-text-2,#45474D)", marginTop: 16, lineHeight: 1.55 }}>
            Profil gratuit à vie. Paiement direct, pour toujours.
          </p>
          <Link
            href="/signup?role=vendor"
            className="inline-flex items-center gap-2 mt-10 px-8 py-4 rounded-full text-base font-semibold transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))", color: "#fff" }}
          >
            Créer mon profil gratuit
          </Link>
        </div>
      </section>

      <AntFooter />
    </div>
  )
}
