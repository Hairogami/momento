import Link from "next/link"
import AntLoginForm, { AntLoginGreeting } from "./AntLoginForm"
import LoginActions from "./LoginActions"
import SpotlightBackground from "@/components/clone/SpotlightBackground"

export default function CloneLoginPage() {
  return (
    <div className="ant-root" style={{ minHeight: "100vh", display: "flex", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

      {/* ── Left panel — brand ── */}
      <div
        className="hidden lg:flex flex-col justify-between"
        style={{
          width: 460, flexShrink: 0,
          background: "linear-gradient(145deg, var(--g1,#E11D48) 0%, var(--g2,#9333EA) 100%)",
          padding: 0,
          position: "relative",
        }}
      >
      <SpotlightBackground>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", padding: "48px 52px" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-light.png" alt="Momento" width={32} height={32} style={{ objectFit: "contain" }} />
          <span style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>Momento</span>
        </div>

        {/* Middle — tagline */}
        <div>
          <h1 style={{
            fontSize: "clamp(2rem,3.5vw,2.8rem)", fontWeight: 700, color: "#fff",
            lineHeight: 1.15, letterSpacing: "-0.03em", margin: "0 0 16px",
          }}>
            L&apos;événement parfait<br />commence ici.
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.72)", lineHeight: 1.65, margin: 0 }}>
            1 000+ prestataires vérifiés · 41 villes · Contact direct.
          </p>

          {/* Social proof */}
          <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { quote: "\"Trouvé mon photographe en 10 minutes. Incroyable.\"", author: "Sara M. · Mariage Casablanca" },
              { quote: "\"Mon séminaire organisé sans stress. Merci Momento !\"", author: "Youssef B. · Corporate Rabat" },
            ].map(t => (
              <div key={t.author} style={{
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(10px)",
                borderRadius: 16, padding: "16px 20px",
                border: "1px solid rgba(255,255,255,0.18)",
              }}>
                <p style={{ fontSize: 13, color: "#fff", margin: "0 0 8px", lineHeight: 1.5 }}>{t.quote}</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", margin: 0 }}>{t.author}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0 }}>
          © 2025 Momento Events
        </p>
      </div>
      </SpotlightBackground>
      </div>

      {/* ── Right panel — form ── */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "48px 24px", background: "var(--dash-bg,#fff)",
      }}>
        <div style={{ width: "100%", maxWidth: 400 }}>

          {/* Back */}
          <Link href="/" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 13, color: "var(--dash-text-2,#6a6a71)", textDecoration: "none", marginBottom: 32,
          }}>
            ← Accueil
          </Link>

          <AntLoginGreeting />
          <p style={{ fontSize: 14, color: "var(--dash-text-2,#6a6a71)", margin: "0 0 28px" }}>
            Connecte-toi pour organiser ton événement
          </p>

          {/* OAuth + magic link — checkbox consent obligatoire gérée dans LoginActions */}
          <LoginActions />

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(183,191,217,0.3)" }} />
            <span style={{ fontSize: 12, color: "var(--dash-text-3,#9a9aaa)" }}>ou email</span>
            <div style={{ flex: 1, height: 1, background: "rgba(183,191,217,0.3)" }} />
          </div>

          {/* Credentials form (login/register) — CGU embarquée dans AntLoginForm mode register */}
          <AntLoginForm />

          <p style={{ fontSize: 12, color: "var(--dash-text-3,#9a9aaa)", textAlign: "center", marginTop: 24 }}>
            Besoin d&apos;aide ? <Link href="/help" style={{ color: "var(--dash-text-2,#6a6a71)" }}>Centre d&apos;aide</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
