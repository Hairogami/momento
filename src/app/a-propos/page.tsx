"use client"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import AntNav from "@/components/clone/AntNav"
import AntFooter from "@/components/clone/AntFooter"

// ── Hook : révèle les éléments au scroll ──
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setVisible(true)),
      { threshold: 0.2 }
    )
    io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  return { ref, visible }
}

// ── Founders data (à ajuster avec les vrais noms quand tu veux) ──
const FOUNDERS = [
  { initials: "YM", name: "Yazid",     role: "CEO — Produit & Vision",        city: "Casablanca", color: "#E11D48" },
  { initials: "AB", name: "Amine",     role: "CTO — Tech & Infrastructure",   city: "Rabat",      color: "#9333EA" },
  { initials: "SK", name: "Salma",     role: "CMO — Marketing & Growth",      city: "Marrakech",  color: "#EC4899" },
  { initials: "HR", name: "Hamza",     role: "COO — Opérations & Partenaires", city: "Tanger",    color: "#F59E0B" },
]

const VALUES = [
  { icon: "handshake",  title: "Direct",      body: "Pas d'intermédiaire entre vous et vos clients. Vous négociez et signez en direct." },
  { icon: "verified",   title: "Honnête",     body: "Vérification sociale de chaque prestataire. Reviews post-événement uniquement." },
  { icon: "public",     title: "Marocain",    body: "Conçu au Maroc pour le Maroc. 41 villes, de Tanger à Dakhla, des villages aux métropoles." },
  { icon: "rocket_launch", title: "Ambitieux", body: "On construit l'infrastructure événementielle qui n'existait pas dans ce pays." },
]

export default function AProposPage() {
  const storyA = useReveal<HTMLDivElement>()
  const storyB = useReveal<HTMLDivElement>()
  const storyC = useReveal<HTMLDivElement>()
  const teamReveal = useReveal<HTMLDivElement>()

  return (
    <div className="ant-root" style={{ background: "var(--dash-bg,#fff)", minHeight: "100vh" }}>
      <AntNav />

      {/* ── HERO ── */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-4 overflow-hidden"
        style={{ minHeight: "80vh", paddingTop: 120, paddingBottom: 80 }}
      >
        {/* Blobs d'ambiance animés */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "10%",
            left: "-10%",
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(225,29,72,0.18), transparent 70%)",
            filter: "blur(60px)",
            animation: "blob-float-a 18s ease-in-out infinite",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: "5%",
            right: "-8%",
            width: 380,
            height: 380,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(147,51,234,0.18), transparent 70%)",
            filter: "blur(60px)",
            animation: "blob-float-b 22s ease-in-out infinite",
          }}
        />

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
            marginBottom: 22,
            zIndex: 2,
          }}
        >
          Notre histoire
        </span>
        <h1
          style={{
            fontSize: "clamp(2.2rem, 6vw, 5rem)",
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            maxWidth: 950,
            zIndex: 2,
            color: "var(--dash-text,#121317)",
          }}
        >
          4 jeunes marocains. <br />
          <span
            style={{
              background: "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Un marché qui n&apos;existait pas.
          </span>
        </h1>
        <p
          className="clone-body"
          style={{
            fontSize: "clamp(1rem, 1.8vw, 1.3rem)",
            maxWidth: 680,
            marginTop: 26,
            lineHeight: 1.55,
            color: "var(--dash-text-2,#45474D)",
            zIndex: 2,
          }}
        >
          Momento est née en 2025 d&apos;une frustration commune : organiser un mariage au Maroc,
          c&apos;est passer des semaines à traquer des numéros WhatsApp de photographes et des
          recommandations de belle-mère. On a décidé que ça suffisait.
        </p>
      </section>

      {/* ── STORY ── Alternance de blocs animés au scroll ── */}
      <section style={{ padding: "80px 24px", borderTop: "1px solid rgba(183,191,217,0.15)" }}>
        <div style={{ maxWidth: 820, margin: "0 auto", display: "flex", flexDirection: "column", gap: 80 }}>

          {/* Bloc 1 — Le constat */}
          <div
            ref={storyA.ref}
            style={{
              opacity: storyA.visible ? 1 : 0,
              transform: storyA.visible ? "translateY(0)" : "translateY(30px)",
              transition: "opacity 0.8s ease, transform 0.8s ease",
            }}
          >
            <p className="clone-label" style={{ fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--g1,#E11D48)", marginBottom: 12 }}>
              Chapitre 1 — Le constat
            </p>
            <h2 className="clone-heading" style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.4rem)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 18 }}>
              Aucune infrastructure n&apos;existait.
            </h2>
            <p className="clone-body" style={{ fontSize: "var(--text-md)", lineHeight: 1.7, color: "var(--dash-text-2,#45474D)" }}>
              Au Maroc, l&apos;événementiel pèse des milliards de dirhams — mariages, henné, fiançailles,
              anniversaires, galas, séminaires d&apos;entreprise. Et pourtant, aucun annuaire sérieux,
              aucun outil de planification, aucun moyen simple de comparer trois photographes avant de
              se décider. Les familles se passaient des contacts de vive voix, les prestataires
              dépendaient du bouche-à-oreille. Un marché énorme, opéré comme en 1995.
            </p>
          </div>

          {/* Bloc 2 — Le déclic */}
          <div
            ref={storyB.ref}
            style={{
              opacity: storyB.visible ? 1 : 0,
              transform: storyB.visible ? "translateY(0)" : "translateY(30px)",
              transition: "opacity 0.8s ease 0.1s, transform 0.8s ease 0.1s",
            }}
          >
            <p className="clone-label" style={{ fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--g2,#9333EA)", marginBottom: 12 }}>
              Chapitre 2 — Le déclic
            </p>
            <h2 className="clone-heading" style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.4rem)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 18 }}>
              On a ouvert un tableur. Un soir d&apos;été 2024.
            </h2>
            <p className="clone-body" style={{ fontSize: "var(--text-md)", lineHeight: 1.7, color: "var(--dash-text-2,#45474D)" }}>
              Quatre amis, quatre villes, un Google Sheet vide. On a listé tous les prestataires
              événementiels qu&apos;on connaissait — photographes, DJ, traiteurs, décorateurs,
              fleuristes, vidéastes. On est arrivés à 200 noms en une nuit. Deux semaines plus tard,
              on en avait 600. On s&apos;est dit : si on est capables de lister 600 prestataires
              depuis un canapé, c&apos;est que le marché existe. Il attend juste une plateforme.
            </p>
          </div>

          {/* Bloc 3 — La construction */}
          <div
            ref={storyC.ref}
            style={{
              opacity: storyC.visible ? 1 : 0,
              transform: storyC.visible ? "translateY(0)" : "translateY(30px)",
              transition: "opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s",
            }}
          >
            <p className="clone-label" style={{ fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#EC4899", marginBottom: 12 }}>
              Chapitre 3 — La construction
            </p>
            <h2 className="clone-heading" style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.4rem)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 18 }}>
              1&nbsp;000&nbsp;+ prestataires. 41 villes. Contact direct.
            </h2>
            <p className="clone-body" style={{ fontSize: "var(--text-md)", lineHeight: 1.7, color: "var(--dash-text-2,#45474D)" }}>
              On a refusé le modèle classique — capter 15 à 30 % sur chaque contrat comme les
              plateformes occidentales. Ce n&apos;est pas soutenable au Maroc, et ce n&apos;est pas
              juste. On s&apos;est financés autrement : abonnement Pro optionnel pour les prestataires
              qui veulent plus de visibilité. Les clients : gratuit, toujours. Les prestataires qui
              veulent juste être listés : gratuit, toujours. Et le contrat se signe en direct entre
              les deux parties — Momento n&apos;est jamais au milieu.
            </p>
          </div>
        </div>
      </section>

      {/* ── FOUNDERS ── */}
      <section
        ref={teamReveal.ref}
        style={{
          padding: "100px 24px",
          borderTop: "1px solid rgba(183,191,217,0.15)",
          background: "rgba(183,191,217,0.04)",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p className="clone-label" style={{ fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--dash-text-2,#6a6a71)", marginBottom: 12 }}>
              L&apos;équipe fondatrice
            </p>
            <h2 className="clone-heading" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 700, letterSpacing: "-0.02em" }}>
              Les 4 qui ont dit &ldquo;pourquoi pas nous ?&rdquo;
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 24,
            }}
          >
            {FOUNDERS.map((f, i) => (
              <div
                key={f.name}
                className="clone-card-white"
                style={{
                  padding: 28,
                  borderRadius: 20,
                  border: "1px solid rgba(183,191,217,0.2)",
                  background: "#fff",
                  textAlign: "center",
                  opacity: teamReveal.visible ? 1 : 0,
                  transform: teamReveal.visible ? "translateY(0)" : "translateY(20px)",
                  transition: `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`,
                }}
              >
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    margin: "0 auto 18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: "var(--text-lg)",
                    letterSpacing: "0.02em",
                    background: `linear-gradient(135deg, ${f.color}, var(--g2,#9333EA))`,
                  }}
                >
                  {f.initials}
                </div>
                <h3 style={{ fontSize: "var(--text-md)", fontWeight: 700, margin: "0 0 4px", color: "var(--dash-text,#121317)" }}>{f.name}</h3>
                <p className="clone-body" style={{ fontSize: "var(--text-sm)", margin: "0 0 8px", color: "var(--dash-text-2,#45474D)" }}>{f.role}</p>
                <p className="clone-muted" style={{ fontSize: "var(--text-xs)", margin: 0, color: "var(--dash-text-2,#6a6a71)" }}>{f.city}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALEURS ── */}
      <section style={{ padding: "100px 24px", borderTop: "1px solid rgba(183,191,217,0.15)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 className="clone-heading" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 700, letterSpacing: "-0.02em" }}>
              Ce qui nous tient éveillés la nuit
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 24,
            }}
          >
            {VALUES.map((v) => (
              <div
                key={v.title}
                style={{
                  padding: 26,
                  borderRadius: 18,
                  border: "1px solid rgba(183,191,217,0.2)",
                  background: "#fff",
                }}
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
                    {v.icon}
                  </span>
                </div>
                <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, margin: "0 0 8px", color: "var(--dash-text,#121317)" }}>{v.title}</h3>
                <p className="clone-body" style={{ fontSize: "var(--text-sm)", lineHeight: 1.55, color: "var(--dash-text-2,#45474D)", margin: 0 }}>
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "100px 24px", textAlign: "center", borderTop: "1px solid rgba(183,191,217,0.15)" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <h2 className="clone-heading" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 700, letterSpacing: "-0.02em" }}>
            On construit ça avec vous.
          </h2>
          <p className="clone-body" style={{ fontSize: "var(--text-md)", color: "var(--dash-text-2,#45474D)", marginTop: 16, lineHeight: 1.55 }}>
            Client, prestataire, ou juste curieux — rejoignez l&apos;aventure.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
            <Link
              href="/login"
              className="flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))", color: "#fff" }}
            >
              Créer mon événement
            </Link>
            <Link
              href="/pro"
              className="clone-cta-ghost flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-medium transition-all hover:opacity-80"
              style={{
                backgroundColor: "rgba(183,191,217,0.12)",
                color: "var(--dash-text,#121317)",
                border: "1px solid rgba(183,191,217,0.3)",
              }}
            >
              Je suis prestataire
            </Link>
          </div>
        </div>
      </section>

      <AntFooter />

      {/* Animations blobs */}
      <style>{`
        @keyframes blob-float-a {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(40px, 30px) scale(1.08); }
        }
        @keyframes blob-float-b {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(-30px, -40px) scale(1.1); }
        }
      `}</style>
    </div>
  )
}
