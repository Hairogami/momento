"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Turnstile from "@/components/Turnstile"

type Role = "client" | "vendor" | null

const inputStyle: React.CSSProperties = {
  width: "100%", height: 46, padding: "0 14px", borderRadius: 12,
  border: "1px solid rgba(183,191,217,0.4)", background: "#fafafa",
  fontSize: "var(--text-sm)", color: "#121317", outline: "none",
  boxSizing: "border-box", fontFamily: "inherit", transition: "border-color 0.15s",
}

const GRADIENT = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"

function PasswordRequirements({ value }: { value: string }) {
  const checks = [
    { ok: value.length >= 8,         label: "8 caractères minimum" },
    { ok: /[A-Z]/.test(value),       label: "Une majuscule" },
    { ok: /[a-z]/.test(value),       label: "Une minuscule" },
    { ok: /\d/.test(value),          label: "Un chiffre" },
  ]
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: "-2px 0 2px", display: "flex", flexDirection: "column", gap: 4 }}>
      {checks.map((c, i) => {
        const color = !value ? "#9a9aaa" : c.ok ? "#16a34a" : "#dc2626"
        return (
          <li key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--text-xs)", color }}>
            <span aria-hidden="true" style={{ width: 14, display: "inline-block", textAlign: "center", fontWeight: 700 }}>{c.ok ? "✓" : "·"}</span>
            <span>{c.label}</span>
          </li>
        )
      })}
    </ul>
  )
}

const PWD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

export default function CloneSignupPage() {
  const router = useRouter()
  const [step, setStep]     = useState<1 | 2>(1)
  const [role, setRole]     = useState<Role>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState("")

  // Client fields
  const [nom, setNom]       = useState("")
  const [prenom, setPrenom] = useState("")
  const [email, setEmail]   = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm]   = useState("")

  // Vendor fields
  const [entreprise, setEntreprise] = useState("")
  const [categorie, setCategorie]   = useState("")
  const [telephone, setTelephone]   = useState("")
  const [vEmail, setVEmail]         = useState("")
  const [vPassword, setVPassword]   = useState("")
  const [vConfirm, setVConfirm]     = useState("")

  // CGU + marketing
  const [tos, setTos]               = useState(false)
  const [marketing, setMarketing]   = useState(true)
  const [turnstileToken, setTurnstileToken] = useState("")
  const turnstileRequired = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true)

    const pwd = role === "client" ? password : vPassword
    const cfm = role === "client" ? confirm : vConfirm

    if (pwd !== cfm) {
      setError("Les mots de passe ne correspondent pas."); setLoading(false); return
    }
    if (!PWD_RE.test(pwd)) {
      setError("Le mot de passe doit faire 8 caractères minimum, avec majuscule, minuscule et chiffre."); setLoading(false); return
    }
    if (!tos) {
      setError("Acceptez les conditions pour continuer."); setLoading(false); return
    }
    if (turnstileRequired && !turnstileToken) {
      setError("Veuillez compléter la vérification anti-bot."); setLoading(false); return
    }

    const body = role === "client"
      ? { role: "client", email, password, firstName: prenom || undefined, lastName: nom || undefined, marketingOptIn: marketing, agreedTos: true, turnstileToken: turnstileToken || undefined }
      : { role: "vendor", email: vEmail, password: vPassword, companyName: entreprise || undefined, phone: telephone || undefined, vendorCategory: categorie || undefined, marketingOptIn: marketing, agreedTos: true, turnstileToken: turnstileToken || undefined }

    const r = await fetch("/api/auth/register", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!r.ok) {
      const d = await r.json()
      setError(d.error || "Erreur lors de l'inscription"); setLoading(false); return
    }

    const res = await signIn("credentials", {
      email: role === "client" ? email : vEmail,
      password: role === "client" ? password : vPassword,
      rememberMe: "true", redirect: false,
    })
    setLoading(false)
    if (res?.error) {
      setError("Compte créé. Erreur de connexion automatique — connectez-vous manuellement.")
      return
    }
    router.push("/dashboard")
  }

  return (
    <div className="ant-root" style={{
      minHeight: "100vh", background: "#f7f7fb",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "48px 20px",
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: 480 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-icon.png" alt="Momento" width={28} height={28} style={{ objectFit: "contain", mixBlendMode: "multiply" }} />
            <span style={{ fontSize: "var(--text-base)", fontWeight: 700, color: "#121317" }}>Momento</span>
          </Link>
        </div>

        <div style={{
          background: "#fff", borderRadius: 24, padding: "36px 32px",
          border: "1px solid rgba(183,191,217,0.18)",
          boxShadow: "0 4px 32px rgba(0,0,0,0.06)",
        }}>

          {/* Step indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
            {[1, 2].map(s => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "var(--text-xs)", fontWeight: 700,
                  background: s <= step ? GRADIENT : "rgba(183,191,217,0.2)",
                  color: s <= step ? "#fff" : "#9a9aaa",
                  transition: "all 0.3s",
                }}>{s}</div>
                {s === 1 && (
                  <div style={{
                    width: 40, height: 2, borderRadius: 1,
                    background: step >= 2 ? "linear-gradient(90deg, #E11D48, #9333EA)" : "rgba(183,191,217,0.3)",
                    transition: "background 0.3s",
                  }} />
                )}
              </div>
            ))}
            <span style={{ fontSize: "var(--text-xs)", color: "#6a6a71", marginLeft: 4 }}>
              {step === 1 ? "Type de compte" : "Informations"}
            </span>
          </div>

          {/* Step 1 — Role selection */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "#121317", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
                Créer un compte
              </h2>
              <p style={{ fontSize: "var(--text-sm)", color: "#6a6a71", margin: "0 0 28px" }}>
                Tu es ici pour…
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {([
                  { value: "client" as Role, emoji: "🎉", title: "Organiser un événement", desc: "Trouver et contacter des prestataires pour mon mariage, anniversaire, etc." },
                  { value: "vendor" as Role, emoji: "🎧", title: "Proposer mes services", desc: "Créer mon profil prestataire et recevoir des demandes clients." },
                ] as { value: Role; emoji: string; title: string; desc: string }[]).map(opt => (
                  <button
                    key={opt.value!}
                    onClick={() => setRole(opt.value)}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 14,
                      padding: "16px 18px", borderRadius: 16, textAlign: "left",
                      border: role === opt.value
                        ? "2px solid #E11D48"
                        : "1px solid rgba(183,191,217,0.3)",
                      background: role === opt.value ? "rgba(225,29,72,0.04)" : "#fafafa",
                      cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit",
                    }}
                  >
                    <span style={{ fontSize: "var(--text-xl)", flexShrink: 0 }}>{opt.emoji}</span>
                    <div>
                      <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "#121317", margin: "0 0 4px" }}>{opt.title}</p>
                      <p style={{ fontSize: "var(--text-xs)", color: "#6a6a71", margin: 0, lineHeight: 1.5 }}>{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => role && setStep(2)}
                disabled={!role}
                style={{
                  width: "100%", height: 46, borderRadius: 12, border: "none",
                  background: role ? GRADIENT : "rgba(183,191,217,0.3)",
                  color: role ? "#fff" : "#9a9aaa",
                  fontSize: "var(--text-sm)", fontWeight: 600, cursor: role ? "pointer" : "not-allowed",
                  marginTop: 24, fontFamily: "inherit", transition: "all 0.2s",
                }}
              >
                Continuer →
              </button>
            </div>
          )}

          {/* Step 2 — Form */}
          {step === 2 && (
            <div>
              <button onClick={() => setStep(1)} style={{
                display: "flex", alignItems: "center", gap: 6,
                fontSize: "var(--text-sm)", color: "#6a6a71", background: "none",
                border: "none", cursor: "pointer", marginBottom: 20, fontFamily: "inherit",
              }}>
                ← Retour
              </button>

              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "#121317", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
                {role === "client" ? "Mon compte" : "Mon profil prestataire"}
              </h2>
              <p style={{ fontSize: "var(--text-sm)", color: "#6a6a71", margin: "0 0 20px" }}>
                {role === "client" ? "Quelques infos pour commencer." : "Quelques infos sur ton activité."}
              </p>

              {/* OAuth — client uniquement (vendor a besoin de companyName/category/phone via formulaire) */}
              {role === "client" && (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
                    <button
                      type="button"
                      onClick={() => {
                        if (!tos) { setError("Acceptez les conditions pour continuer."); return }
                        try {
                          localStorage.setItem("momento_pending_consent", JSON.stringify({ agreedTos: true, marketingOptIn: marketing, ts: Date.now() }))
                        } catch {}
                        signIn("google", { callbackUrl: "/accueil" })
                      }}
                      disabled={!tos}
                      title={!tos ? "Acceptez les conditions pour continuer" : ""}
                      style={{
                        width: "100%", height: 46, borderRadius: 12,
                        border: "1px solid rgba(183,191,217,0.4)",
                        background: tos ? "#fff" : "rgba(255,255,255,0.55)",
                        opacity: tos ? 1 : 0.55,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                        fontSize: "var(--text-sm)", fontWeight: 500, color: "#121317",
                        cursor: tos ? "pointer" : "not-allowed", fontFamily: "inherit",
                        transition: "opacity 0.15s, background 0.15s",
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Continuer avec Google
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!tos) { setError("Acceptez les conditions pour continuer."); return }
                        try {
                          localStorage.setItem("momento_pending_consent", JSON.stringify({ agreedTos: true, marketingOptIn: marketing, ts: Date.now() }))
                        } catch {}
                        signIn("facebook", { callbackUrl: "/accueil" })
                      }}
                      disabled={!tos}
                      title={!tos ? "Acceptez les conditions pour continuer" : ""}
                      style={{
                        width: "100%", height: 46, borderRadius: 12, border: "none",
                        background: tos ? "#1877F2" : "rgba(24,119,242,0.35)",
                        color: tos ? "#fff" : "rgba(255,255,255,0.5)",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                        fontSize: "var(--text-sm)", fontWeight: 500, cursor: tos ? "pointer" : "not-allowed",
                        fontFamily: "inherit", transition: "background 0.15s, color 0.15s",
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Continuer avec Facebook
                    </button>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "8px 0 12px" }}>
                    <div style={{ flex: 1, height: 1, background: "rgba(183,191,217,0.3)" }} />
                    <span style={{ fontSize: "var(--text-xs)", color: "#9a9aaa", letterSpacing: "0.06em", fontWeight: 600 }}>OU AVEC EMAIL</span>
                    <div style={{ flex: 1, height: 1, background: "rgba(183,191,217,0.3)" }} />
                  </div>
                </>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {role === "client" ? (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <input placeholder="Prénom *" value={prenom} onChange={e => setPrenom(e.target.value)} required style={inputStyle}
                        onFocus={e => (e.target.style.borderColor = "#E11D48")} onBlur={e => (e.target.style.borderColor = "rgba(183,191,217,0.4)")} />
                      <input placeholder="Nom *" value={nom} onChange={e => setNom(e.target.value)} required style={inputStyle}
                        onFocus={e => (e.target.style.borderColor = "#E11D48")} onBlur={e => (e.target.style.borderColor = "rgba(183,191,217,0.4)")} />
                    </div>
                    <input type="email" placeholder="Email *" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = "#E11D48")} onBlur={e => (e.target.style.borderColor = "rgba(183,191,217,0.4)")} />
                    <input type="password" placeholder="Mot de passe *" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = "#E11D48")} onBlur={e => (e.target.style.borderColor = "rgba(183,191,217,0.4)")} />
                    <PasswordRequirements value={password} />
                    <input type="password" placeholder="Confirmer le mot de passe *" value={confirm} onChange={e => setConfirm(e.target.value)} required style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = "#E11D48")} onBlur={e => (e.target.style.borderColor = "rgba(183,191,217,0.4)")} />
                    {confirm && password !== confirm && (
                      <p style={{ fontSize: "var(--text-xs)", color: "#dc2626", margin: "-4px 0 0" }}>Les mots de passe ne correspondent pas.</p>
                    )}
                  </>
                ) : (
                  <>
                    <input placeholder="Nom de l'entreprise *" value={entreprise} onChange={e => setEntreprise(e.target.value)} required style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = "#E11D48")} onBlur={e => (e.target.style.borderColor = "rgba(183,191,217,0.4)")} />
                    <input placeholder="Catégorie (ex: DJ, Photographe…) *" value={categorie} onChange={e => setCategorie(e.target.value)} required style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = "#E11D48")} onBlur={e => (e.target.style.borderColor = "rgba(183,191,217,0.4)")} />
                    <input type="email" placeholder="Email *" value={vEmail} onChange={e => setVEmail(e.target.value)} required style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = "#E11D48")} onBlur={e => (e.target.style.borderColor = "rgba(183,191,217,0.4)")} />
                    <input placeholder="Téléphone" value={telephone} onChange={e => setTelephone(e.target.value)} style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = "#E11D48")} onBlur={e => (e.target.style.borderColor = "rgba(183,191,217,0.4)")} />
                    <input type="password" placeholder="Mot de passe *" value={vPassword} onChange={e => setVPassword(e.target.value)} required minLength={8} style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = "#E11D48")} onBlur={e => (e.target.style.borderColor = "rgba(183,191,217,0.4)")} />
                    <PasswordRequirements value={vPassword} />
                    <input type="password" placeholder="Confirmer le mot de passe *" value={vConfirm} onChange={e => setVConfirm(e.target.value)} required style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = "#E11D48")} onBlur={e => (e.target.style.borderColor = "rgba(183,191,217,0.4)")} />
                    {vConfirm && vPassword !== vConfirm && (
                      <p style={{ fontSize: "var(--text-xs)", color: "#dc2626", margin: "-4px 0 0" }}>Les mots de passe ne correspondent pas.</p>
                    )}
                  </>
                )}

                {error && (
                  <p style={{
                    fontSize: "var(--text-sm)", padding: "10px 14px", borderRadius: 10,
                    background: "rgba(225,29,72,0.07)", color: "#E11D48",
                  }}>{error}</p>
                )}

                <Turnstile onToken={setTurnstileToken} onError={() => setTurnstileToken("")} />

                {/* CGU + marketing */}
                <label style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: "var(--text-xs)", color: "#45474D", cursor: "pointer", lineHeight: 1.5, marginTop: 4 }}>
                  <input type="checkbox" checked={tos} onChange={e => setTos(e.target.checked)} style={{ marginTop: 2 }} />
                  <span>J&apos;accepte les <a href="/cgu" target="_blank" style={{ color: "#E11D48", textDecoration: "underline" }}>conditions générales</a> et la <a href="/confidentialite" target="_blank" style={{ color: "#E11D48", textDecoration: "underline" }}>politique de confidentialité</a>.</span>
                </label>
                <label style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: "var(--text-xs)", color: "#6a6a71", cursor: "pointer", lineHeight: 1.5 }}>
                  <input type="checkbox" checked={marketing} onChange={e => setMarketing(e.target.checked)} style={{ marginTop: 2 }} />
                  <span>Je souhaite recevoir les conseils &amp; offres Momento (facultatif).</span>
                </label>

                <button type="submit" disabled={loading || !tos} aria-disabled={!tos}
                  title={!tos ? "Acceptez les conditions pour continuer" : ""}
                  style={{
                    height: 46, borderRadius: 12, border: "none",
                    background: tos ? GRADIENT : "rgba(183,191,217,0.25)",
                    color: tos ? "#fff" : "#9a9aaa",
                    fontSize: "var(--text-sm)", fontWeight: 600,
                    cursor: (loading || !tos) ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                    opacity: loading ? 0.7 : 1, marginTop: 4,
                    transition: "background 0.15s, color 0.15s",
                  }}>
                  {loading ? "Création…" : tos ? "Créer mon compte" : "Acceptez les conditions pour continuer"}
                </button>
              </form>
            </div>
          )}

          <p style={{ fontSize: "var(--text-xs)", color: "#9a9aaa", textAlign: "center", marginTop: 20 }}>
            Déjà un compte ?{" "}
            <Link href="/login" style={{ color: "#E11D48", fontWeight: 600, textDecoration: "none" }}>
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
