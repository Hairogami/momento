"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"

/**
 * Bloc OAuth (Google / Facebook) + lien magique pour /login.
 * Consent CGU obligatoire avant toute action d'authentification.
 * Réutilise le pattern `persistPendingConsent` déjà en place dans SignupGateModal
 * pour que `ConsentApplier` flushe l'acceptation en DB au retour du callback OAuth.
 */

function persistPendingConsent(marketing: boolean) {
  try {
    localStorage.setItem(
      "momento_pending_consent",
      JSON.stringify({ agreedTos: true, marketingOptIn: marketing, ts: Date.now() }),
    )
  } catch {}
}

export default function LoginActions() {
  const [tos, setTos] = useState(false)
  const [marketing, setMarketing] = useState(true)
  const [email, setEmail] = useState("")
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState<"google" | "facebook" | "magic" | null>(null)

  const disabled = !tos

  async function handleGoogle() {
    if (disabled) return
    setErr("")
    setLoading("google")
    persistPendingConsent(marketing)
    await signIn("google", { callbackUrl: "/accueil" })
  }

  async function handleFacebook() {
    if (disabled) return
    setErr("")
    setLoading("facebook")
    persistPendingConsent(marketing)
    await signIn("facebook", { callbackUrl: "/accueil" })
  }

  async function handleMagic(e: React.FormEvent) {
    e.preventDefault()
    if (disabled) { setErr("Acceptez les conditions pour continuer."); return }
    if (!email) { setErr("Email requis."); return }
    setErr("")
    setLoading("magic")
    persistPendingConsent(marketing)
    const res = await signIn("resend", { email, redirect: false, callbackUrl: "/accueil" })
    setLoading(null)
    if (res?.error) setErr("Impossible d'envoyer le lien magique. Réessayez.")
    else setErr("")
  }

  return (
    <>
      {/* Consent obligatoire — commun aux 3 méthodes */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 12, color: "var(--dash-text-2,#45474D)", cursor: "pointer", lineHeight: 1.5 }}>
          <input type="checkbox" checked={tos} onChange={e => setTos(e.target.checked)} style={{ marginTop: 2, accentColor: "#E11D48" }} />
          <span>
            J&apos;accepte les <a href="/cgu" target="_blank" rel="noopener noreferrer" style={legalLinkStyle}>conditions générales</a> et
            la <a href="/confidentialite" target="_blank" rel="noopener noreferrer" style={legalLinkStyle}>politique de confidentialité</a>.
          </span>
        </label>
        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 6, fontSize: 12, color: "var(--dash-text-3,#6a6a71)", cursor: "pointer", lineHeight: 1.5 }}>
          <input type="checkbox" checked={marketing} onChange={e => setMarketing(e.target.checked)} style={{ marginTop: 2, accentColor: "#9333EA" }} />
          <span>Je souhaite recevoir les conseils &amp; offres Momento (facultatif).</span>
        </label>
      </div>

      {err && (
        <p style={{ fontSize: 12, padding: "9px 12px", borderRadius: 10, background: "rgba(225,29,72,0.07)", color: "#E11D48", marginBottom: 10 }}>
          {err}
        </p>
      )}

      {/* OAuth buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {/* Google */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={disabled || loading !== null}
          title={disabled ? "Acceptez les conditions pour continuer" : ""}
          style={{
            width: "100%", height: 46, borderRadius: 12, cursor: disabled ? "not-allowed" : "pointer",
            border: "1px solid var(--dash-border,rgba(183,191,217,0.4))",
            background: disabled ? "rgba(255,255,255,0.5)" : "var(--dash-surface,#fff)",
            opacity: disabled ? 0.55 : 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            fontSize: 14, fontWeight: 500, color: "var(--dash-text,#121317)", fontFamily: "inherit",
            transition: "opacity 0.15s, background 0.15s",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {loading === "google" ? "Redirection…" : "Continuer avec Google"}
        </button>

        {/* Facebook */}
        <button
          type="button"
          onClick={handleFacebook}
          disabled={disabled || loading !== null}
          title={disabled ? "Acceptez les conditions pour continuer" : ""}
          style={{
            width: "100%", height: 46, borderRadius: 12, cursor: disabled ? "not-allowed" : "pointer",
            border: "1px solid var(--dash-border,rgba(183,191,217,0.4))",
            background: disabled ? "rgba(255,255,255,0.5)" : "var(--dash-surface,#fff)",
            opacity: disabled ? 0.55 : 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            fontSize: 14, fontWeight: 500, color: "var(--dash-text,#121317)", fontFamily: "inherit",
            transition: "opacity 0.15s, background 0.15s",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          {loading === "facebook" ? "Redirection…" : "Continuer avec Facebook"}
        </button>
      </div>

      {/* Divider magic link */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
        <div style={{ flex: 1, height: 1, background: "rgba(183,191,217,0.3)" }} />
        <span style={{ fontSize: 12, color: "var(--dash-text-3,#9a9aaa)" }}>lien magique</span>
        <div style={{ flex: 1, height: 1, background: "rgba(183,191,217,0.3)" }} />
      </div>

      <form onSubmit={handleMagic} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input
          type="email"
          placeholder="toi@exemple.com"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{
            width: "100%", height: 46, padding: "0 14px", borderRadius: 12,
            border: "1px solid var(--dash-border,rgba(183,191,217,0.4))",
            background: "var(--dash-input-bg,#fafafa)",
            fontSize: 14, color: "var(--dash-text,#121317)", outline: "none",
            boxSizing: "border-box", fontFamily: "inherit",
          }}
        />
        <button
          type="submit"
          disabled={disabled || loading !== null}
          title={disabled ? "Acceptez les conditions pour continuer" : ""}
          style={{
            height: 46, borderRadius: 12,
            border: "1px solid var(--dash-border,rgba(183,191,217,0.3))",
            background: "transparent",
            color: disabled ? "var(--dash-text-3,#9a9aaa)" : "var(--dash-text-2,#6a6a71)",
            fontSize: 13,
            cursor: disabled ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            opacity: disabled ? 0.6 : 1,
          }}
        >
          {loading === "magic" ? "Envoi…" : "Recevoir un lien par email"}
        </button>
      </form>
    </>
  )
}

const legalLinkStyle: React.CSSProperties = {
  color: "#E11D48", textDecoration: "underline", textUnderlineOffset: 2, fontWeight: 500,
}
