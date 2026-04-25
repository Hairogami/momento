"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { signIn } from "next-auth/react"
import Turnstile from "@/components/Turnstile"

export function AntLoginGreeting() {
  const [returning, setReturning] = useState<boolean | null>(null)

  useEffect(() => {
    try {
      setReturning(!!localStorage.getItem("momento_has_logged_in"))
    } catch { setReturning(false) }
  }, [])

  if (returning === null) return null // évite le flash

  return (
    <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--dash-text,#121317)", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
      {returning ? "Bon retour 👋" : "Bienvenue 👋"}
    </h2>
  )
}

const inputStyle: React.CSSProperties = {
  width: "100%", height: 46, padding: "0 14px",
  borderRadius: 12, border: "1px solid var(--dash-border,rgba(183,191,217,0.4))",
  background: "var(--dash-input-bg,#fafafa)", fontSize: 14, color: "var(--dash-text,#121317)",
  outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  transition: "border-color 0.15s",
}

const PWD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

function PasswordRequirements({ value }: { value: string }) {
  const checks = [
    { ok: value.length >= 8,   label: "8 caractères minimum" },
    { ok: /[A-Z]/.test(value), label: "Une majuscule" },
    { ok: /[a-z]/.test(value), label: "Une minuscule" },
    { ok: /\d/.test(value),    label: "Un chiffre" },
  ]
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: "-2px 0 2px", display: "flex", flexDirection: "column", gap: 4 }}>
      {checks.map((c, i) => {
        const color = !value ? "var(--dash-text-3,#9a9aaa)" : c.ok ? "#16a34a" : "#dc2626"
        return (
          <li key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color }}>
            <span aria-hidden="true" style={{ width: 14, display: "inline-block", textAlign: "center", fontWeight: 700 }}>{c.ok ? "✓" : "·"}</span>
            <span>{c.label}</span>
          </li>
        )
      })}
    </ul>
  )
}

export default function AntLoginForm() {
  const [mode, setMode]       = useState<"login" | "register">("login")
  const [email, setEmail]     = useState("")
  const [password, setPassword] = useState("")
  const [name, setName]       = useState("")
  const [confirm, setConfirm] = useState("")
  const [tos, setTos]         = useState(false)
  const [marketing, setMarketing] = useState(true)
  const [error, setError]     = useState("")
  const [loading, setLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState("")
  const turnstileRequired = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true)
    const res = await signIn("credentials", { email, password, rememberMe: "true", redirect: false })
    setLoading(false)
    if (res?.error) setError("Email ou mot de passe incorrect.")
    else { try { localStorage.setItem("momento_has_logged_in", "1") } catch {} ; window.location.href = "/accueil" }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!tos) { setError("Veuillez accepter les conditions générales pour créer un compte."); return }
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas."); return }
    if (!PWD_RE.test(password)) { setError("Le mot de passe doit faire 8 caractères minimum, avec majuscule, minuscule et chiffre."); return }
    if (turnstileRequired && !turnstileToken) { setError("Veuillez compléter la vérification anti-bot."); return }
    setError(""); setLoading(true)
    const r = await fetch("/api/auth/register", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: "client",
        firstName: name,
        email,
        password,
        agreedTos: true,
        marketingOptIn: marketing,
        turnstileToken: turnstileToken || undefined,
      }),
    })
    if (!r.ok) { const d = await r.json(); setError(d.error || "Erreur inscription"); setLoading(false); return }
    const res = await signIn("credentials", { email, password, rememberMe: "true", redirect: false })
    setLoading(false)
    if (res?.error) { setError("Compte créé. Erreur de connexion automatique — connectez-vous manuellement."); setMode("login"); return }
    try { localStorage.setItem("momento_has_logged_in", "1") } catch {}
    window.location.href = "/dashboard"
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Mode toggle */}
      <div style={{
        display: "flex", background: "var(--dash-faint-2,#f0f0f8)", borderRadius: 12, padding: 4, gap: 4,
      }}>
        {(["login", "register"] as const).map(m => (
          <button key={m} onClick={() => { setMode(m); setError("") }}
            style={{
              flex: 1, height: 36, borderRadius: 9, border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: mode === m ? 600 : 400, fontFamily: "inherit",
              background: mode === m ? "var(--dash-surface,#fff)" : "transparent",
              color: mode === m ? "var(--dash-text,#121317)" : "var(--dash-text-2,#6a6a71)",
              boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.15s",
            }}>
            {m === "login" ? "Se connecter" : "S'inscrire"}
          </button>
        ))}
      </div>

      <form onSubmit={mode === "login" ? handleLogin : handleRegister}
        style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {mode === "register" && (
          <input placeholder="Prénom" value={name} onChange={e => setName(e.target.value)}
            required style={inputStyle}
            onFocus={e => (e.target.style.borderColor = "#E11D48")}
            onBlur={e => (e.target.style.borderColor = "rgba(183,191,217,0.4)")} />
        )}
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
          required style={inputStyle}
          onFocus={e => (e.target.style.borderColor = "#E11D48")}
          onBlur={e => (e.target.style.borderColor = "rgba(183,191,217,0.4)")} />
        <input type="password" placeholder="Mot de passe" value={password}
          onChange={e => setPassword(e.target.value)} required minLength={8} style={inputStyle}
          onFocus={e => (e.target.style.borderColor = "#E11D48")}
          onBlur={e => (e.target.style.borderColor = "rgba(183,191,217,0.4)")} />

        {mode === "register" && (
          <>
            <PasswordRequirements value={password} />
            <input type="password" placeholder="Confirmer le mot de passe" value={confirm}
              onChange={e => setConfirm(e.target.value)} required style={inputStyle}
              onFocus={e => (e.target.style.borderColor = "#E11D48")}
              onBlur={e => (e.target.style.borderColor = "rgba(183,191,217,0.4)")} />
            {confirm && password !== confirm && (
              <p style={{ fontSize: 12, color: "#dc2626", margin: "-4px 0 0" }}>Les mots de passe ne correspondent pas.</p>
            )}
          </>
        )}

        {mode === "login" && (
          <div style={{ textAlign: "right" }}>
            <Link href="/forgot-password" style={{ fontSize: 12, color: "var(--dash-text-3,#9a9aaa)", textDecoration: "none" }}>
              Mot de passe oublié ?
            </Link>
          </div>
        )}

        {mode === "register" && (
          <div style={{ marginTop: 2 }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 12, color: "var(--dash-text-2,#45474D)", cursor: "pointer", lineHeight: 1.5 }}>
              <input type="checkbox" checked={tos} onChange={e => setTos(e.target.checked)} style={{ marginTop: 2, accentColor: "#E11D48" }} />
              <span>
                J&apos;accepte les <a href="/cgu" target="_blank" rel="noopener noreferrer" style={{ color: "#E11D48", fontWeight: 500, textDecoration: "underline" }}>conditions générales</a> et
                la <a href="/confidentialite" target="_blank" rel="noopener noreferrer" style={{ color: "#E11D48", fontWeight: 500, textDecoration: "underline" }}>politique de confidentialité</a>.
              </span>
            </label>
            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 6, fontSize: 12, color: "var(--dash-text-3,#6a6a71)", cursor: "pointer", lineHeight: 1.5 }}>
              <input type="checkbox" checked={marketing} onChange={e => setMarketing(e.target.checked)} style={{ marginTop: 2, accentColor: "#9333EA" }} />
              <span>Je souhaite recevoir les conseils &amp; offres Momento (facultatif).</span>
            </label>
          </div>
        )}

        {mode === "register" && (
          <Turnstile onToken={setTurnstileToken} onError={() => setTurnstileToken("")} />
        )}

        {error && (
          <p style={{
            fontSize: 13, padding: "10px 14px", borderRadius: 10,
            background: "rgba(225,29,72,0.07)", color: "#E11D48",
          }}>{error}</p>
        )}

        <button type="submit" disabled={loading || (mode === "register" && !tos)}
          title={mode === "register" && !tos ? "Acceptez les conditions pour créer un compte" : ""}
          style={{
          height: 46, borderRadius: 12, border: "none",
          cursor: loading ? "wait" : (mode === "register" && !tos ? "not-allowed" : "pointer"),
          background: (mode === "register" && !tos)
            ? "rgba(183,191,217,0.3)"
            : "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))",
          color: (mode === "register" && !tos) ? "#9a9aaa" : "#fff",
          fontSize: 14, fontWeight: 600, fontFamily: "inherit",
          opacity: loading ? 0.7 : 1, transition: "opacity 0.15s, background 0.15s, color 0.15s",
        }}>
          {loading ? "Chargement…" : mode === "login" ? "Se connecter" : (tos ? "Créer mon compte" : "Acceptez les conditions pour continuer")}
        </button>
      </form>
    </div>
  )
}
