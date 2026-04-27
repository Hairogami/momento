"use client"
import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"

const VALUE_PROPS = [
  { icon: "account_balance_wallet", title: "Budget intelligent", desc: "Répartition automatique par catégorie" },
  { icon: "event_note",             title: "Checklist personnalisée", desc: "Tâches calculées selon votre date" },
  { icon: "chat_bubble",            title: "Messagerie directe", desc: "Contactez les prestas sans quitter Momento" },
  { icon: "celebration",            title: "100% gratuit", desc: "Aucune carte bancaire requise" },
]

function GIcon({ name, size = 18, color = "var(--dash-text, #eeeef5)" }: { name: string; size?: number; color?: string }) {
  return (
    <span style={{
      fontFamily: "'Google Symbols','Material Symbols Outlined'",
      fontSize: size, color, fontWeight: "normal", fontStyle: "normal",
      lineHeight: 1, userSelect: "none", display: "inline-block", verticalAlign: "middle",
      flexShrink: 0,
    }}>{name}</span>
  )
}

type Props = {
  open: boolean
  onClose: () => void
  vendorSlug?: string | null   // si présent → redirect après signup
  title?: React.ReactNode
  subtitle?: React.ReactNode
}

export default function SignupGateModal({ open, onClose, vendorSlug, title, subtitle }: Props) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [tos, setTos] = useState(false)
  const [marketing, setMarketing] = useState(true)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")

  // a11y — Escape closes the modal (WCAG 2.1.2 No keyboard trap)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr("")
    if (!tos) { setErr("Veuillez accepter les conditions générales."); return }
    if (!email || !password) { setErr("Email et mot de passe requis."); return }
    setLoading(true)
    try {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "client",
          email, password,
          firstName: firstName || undefined,
          lastName:  lastName  || undefined,
          marketingOptIn: marketing,
          agreedTos: true,
        }),
      })
      if (!r.ok) {
        const d = await r.json().catch(() => ({}))
        setErr(d.error || "Erreur lors de l'inscription")
        setLoading(false)
        return
      }
      const sr = await signIn("credentials", { email, password, redirect: false })
      setLoading(false)
      if (sr?.error) { router.push("/login"); return }
      router.push(vendorSlug ? `/vendor/${vendorSlug}` : "/accueil")
    } catch (e) {
      setErr("Erreur réseau. Réessayez.")
      setLoading(false)
    }
  }

  function persistPendingConsent() {
    try {
      localStorage.setItem("momento_pending_consent", JSON.stringify({
        agreedTos: true,
        marketingOptIn: marketing,
        ts: Date.now(),
      }))
    } catch {}
  }

  async function handleGoogle() {
    if (!tos) { setErr("Acceptez les conditions pour continuer."); return }
    persistPendingConsent()
    await signIn("google", { callbackUrl: vendorSlug ? `/vendor/${vendorSlug}` : "/accueil" })
  }

  async function handleFacebook() {
    if (!tos) { setErr("Acceptez les conditions pour continuer."); return }
    persistPendingConsent()
    await signIn("facebook", { callbackUrl: vendorSlug ? `/vendor/${vendorSlug}` : "/accueil" })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="signup-gate-title"
      aria-describedby="signup-gate-subtitle"
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(5,5,10,0.72)", backdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--dash-surface, #16171e)",
          border: "1px solid var(--dash-border, rgba(255,255,255,0.07))",
          borderRadius: 24, width: "100%", maxWidth: 480,
          maxHeight: "92vh", overflow: "auto",
          padding: "28px 32px", color: "var(--dash-text, #eeeef5)",
          fontFamily: "'Geist', sans-serif",
          boxShadow: "0 40px 90px rgba(0,0,0,0.6)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <h2 id="signup-gate-title" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "var(--text-xl)", fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
              {title ?? <>Créez votre compte <em style={{ fontStyle: "italic", backgroundImage: G, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", color: "transparent" }}>gratuit</em></>}
            </h2>
            <p id="signup-gate-subtitle" style={{ fontSize: "var(--text-sm)", color: "var(--dash-text-2, #b0b0cc)", marginTop: 6 }}>{subtitle ?? "30 secondes. Pas de carte bancaire."}</p>
          </div>
          <button type="button" aria-label="Fermer la fenêtre d'inscription" onClick={onClose} style={{ background: "transparent", border: "none", color: "var(--dash-text-3, #8888aa)", fontSize: "var(--text-lg)", cursor: "pointer", marginLeft: 10 }}>✕</button>
        </div>

        {/* Value props */}
        <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
          {VALUE_PROPS.map(v => (
            <div key={v.title} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "var(--dash-faint, rgba(255,255,255,0.04))", borderRadius: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, rgba(225,29,72,0.18), rgba(147,51,234,0.18))", flexShrink: 0 }}>
                <GIcon name={v.icon} size={18} color="var(--g1, #E11D48)" />
              </div>
              <div>
                <div style={{ fontSize: "var(--text-sm)", fontWeight: 700 }}>{v.title}</div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--dash-text-3, #8888aa)" }}>{v.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* OAuth providers */}
        <div style={{ marginTop: 18, display: "grid", gap: 8 }}>
          <button
            type="button"
            onClick={handleGoogle}
            disabled={!tos}
            title={!tos ? "Acceptez les conditions pour continuer" : ""}
            style={{
              width: "100%", padding: "13px",
              background: tos ? "#fff" : "rgba(255,255,255,0.35)",
              color: tos ? "#121317" : "rgba(18,19,23,0.4)",
              border: "none", borderRadius: 12, fontSize: "var(--text-sm)", fontWeight: 700,
              cursor: tos ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              fontFamily: "inherit",
              transition: "background 0.15s, color 0.15s",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 48 48" style={{ opacity: tos ? 1 : 0.4 }}><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            Continuer avec Google
          </button>

          <button
            type="button"
            onClick={handleFacebook}
            disabled={!tos}
            title={!tos ? "Acceptez les conditions pour continuer" : ""}
            style={{
              width: "100%", padding: "13px",
              background: tos ? "#1877F2" : "rgba(24,119,242,0.35)",
              color: tos ? "#fff" : "rgba(255,255,255,0.5)",
              border: "none", borderRadius: 12, fontSize: "var(--text-sm)", fontWeight: 700,
              cursor: tos ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              fontFamily: "inherit",
              transition: "background 0.15s, color 0.15s",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: tos ? 1 : 0.4 }}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Continuer avec Facebook
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0" }}>
          <div style={{ flex: 1, height: 1, background: "var(--dash-border, rgba(255,255,255,0.07))" }} />
          <span style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3, #8888aa)", letterSpacing: 1.2, fontWeight: 600 }}>OU EMAIL</span>
          <div style={{ flex: 1, height: 1, background: "var(--dash-border, rgba(255,255,255,0.07))" }} />
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <input placeholder="Prénom" value={firstName} onChange={e => setFirstName(e.target.value)} style={inputStyle} />
            <input placeholder="Nom" value={lastName} onChange={e => setLastName(e.target.value)} style={inputStyle} />
          </div>
          <input type="email" required placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ ...inputStyle, marginBottom: 8 }} />
          <input type="password" required placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />

          <label style={{ display: "flex", gap: 10, marginTop: 14, fontSize: "var(--text-xs)", color: "var(--dash-text-2, #b0b0cc)", cursor: "pointer", lineHeight: 1.5 }}>
            <input type="checkbox" checked={tos} onChange={e => setTos(e.target.checked)} style={{ marginTop: 2 }} />
            <span>J'accepte les <a href="/cgu" style={{ color: "var(--g1, #E11D48)", textDecoration: "underline" }}>conditions générales</a> et la <a href="/confidentialite" style={{ color: "var(--g1, #E11D48)", textDecoration: "underline" }}>politique de confidentialité</a>.</span>
          </label>
          <label style={{ display: "flex", gap: 10, marginTop: 8, fontSize: "var(--text-xs)", color: "var(--dash-text-2, #b0b0cc)", cursor: "pointer", lineHeight: 1.5 }}>
            <input type="checkbox" checked={marketing} onChange={e => setMarketing(e.target.checked)} style={{ marginTop: 2 }} />
            <span>Je souhaite recevoir les conseils & offres Momento (facultatif).</span>
          </label>

          {err && <div style={{ marginTop: 12, padding: "10px 12px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", fontSize: "var(--text-xs)", borderRadius: 10 }}>{err}</div>}

          <button
            type="submit"
            disabled={loading || !tos}
            aria-disabled={!tos}
            title={!tos ? "Acceptez les conditions pour continuer" : ""}
            style={{
              width: "100%", marginTop: 16, padding: "14px",
              background: tos ? G : "var(--dash-faint-2, rgba(255,255,255,0.08))",
              color: tos ? "#fff" : "var(--dash-text-3, #8888aa)",
              border: "none", borderRadius: 12, fontSize: "var(--text-sm)", fontWeight: 800,
              cursor: (loading || !tos) ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              boxShadow: tos ? "0 8px 24px color-mix(in srgb, var(--g1,#E11D48) 30%, transparent)" : "none",
              fontFamily: "inherit",
              transition: "background 0.15s, box-shadow 0.15s, color 0.15s",
            }}
          >
            {loading ? "Création…" : tos ? "Créer mon compte" : "Acceptez les conditions pour continuer"}
          </button>

          <p style={{ marginTop: 14, textAlign: "center", fontSize: "var(--text-xs)", color: "var(--dash-text-3, #8888aa)" }}>
            Déjà inscrit ? <a href="/login" style={{ color: "var(--g1, #E11D48)", fontWeight: 600 }}>Se connecter</a>
          </p>
        </form>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 14px",
  background: "var(--dash-input-bg, #1c1d25)",
  border: "1.5px solid var(--dash-border, rgba(255,255,255,0.07))",
  borderRadius: 12, fontSize: "var(--text-sm)", color: "var(--dash-text, #eeeef5)",
  outline: "none", fontFamily: "inherit", boxSizing: "border-box",
}
