import Link from "next/link"
import { signIn } from "@/lib/auth"
import AntLoginForm, { AntLoginGreeting } from "./AntLoginForm"
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
            1 000+ prestataires vérifiés · 41 villes · 0% commission.
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

          {/* OAuth buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {/* Google */}
            <form action={async () => { "use server"; await signIn("google", { redirectTo: "/accueil" }) }}>
              <button type="submit" style={{
                width: "100%", height: 46, borderRadius: 12, cursor: "pointer",
                border: "1px solid var(--dash-border,rgba(183,191,217,0.4))", background: "var(--dash-surface,#fff)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                fontSize: 14, fontWeight: 500, color: "var(--dash-text,#121317)", fontFamily: "inherit",
                transition: "background 0.15s",
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continuer avec Google
              </button>
            </form>

            {/* Facebook */}
            <form action={async () => { "use server"; await signIn("facebook", { redirectTo: "/accueil" }) }}>
              <button type="submit" style={{
                width: "100%", height: 46, borderRadius: 12, cursor: "pointer",
                border: "1px solid var(--dash-border,rgba(183,191,217,0.4))", background: "var(--dash-surface,#fff)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                fontSize: 14, fontWeight: 500, color: "var(--dash-text,#121317)", fontFamily: "inherit",
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Continuer avec Facebook
              </button>
            </form>
          </div>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(183,191,217,0.3)" }} />
            <span style={{ fontSize: 12, color: "var(--dash-text-3,#9a9aaa)" }}>ou</span>
            <div style={{ flex: 1, height: 1, background: "rgba(183,191,217,0.3)" }} />
          </div>

          {/* Credentials form */}
          <AntLoginForm />

          {/* Divider magic link */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(183,191,217,0.3)" }} />
            <span style={{ fontSize: 12, color: "var(--dash-text-3,#9a9aaa)" }}>lien magique</span>
            <div style={{ flex: 1, height: 1, background: "rgba(183,191,217,0.3)" }} />
          </div>

          {/* Magic link */}
          <form action={async (fd: FormData) => {
            "use server"
            await signIn("resend", { email: fd.get("email") as string, redirectTo: "/accueil" })
          }} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input name="email" type="email" placeholder="toi@exemple.com" required style={{
              width: "100%", height: 46, padding: "0 14px", borderRadius: 12,
              border: "1px solid var(--dash-border,rgba(183,191,217,0.4))", background: "var(--dash-input-bg,#fafafa)",
              fontSize: 14, color: "var(--dash-text,#121317)", outline: "none",
              boxSizing: "border-box", fontFamily: "inherit",
            }} />
            <button type="submit" style={{
              height: 46, borderRadius: 12, border: "1px solid var(--dash-border,rgba(183,191,217,0.3))",
              background: "transparent", color: "var(--dash-text-2,#6a6a71)", fontSize: 13,
              cursor: "pointer", fontFamily: "inherit",
            }}>
              Recevoir un lien par email
            </button>
          </form>

          <p style={{ fontSize: 12, color: "var(--dash-text-3,#9a9aaa)", textAlign: "center", marginTop: 24 }}>
            En continuant, tu acceptes nos{" "}
            <a href="/legal/cgv" style={{ color: "var(--dash-text-2,#6a6a71)" }}>conditions d&apos;utilisation</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
