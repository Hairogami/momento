"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"

type Role = "client" | "vendor" | null

const inputStyle: React.CSSProperties = {
  width: "100%", height: 46, padding: "0 14px", borderRadius: 12,
  border: "1px solid rgba(183,191,217,0.4)", background: "#fafafa",
  fontSize: 14, color: "#121317", outline: "none",
  boxSizing: "border-box", fontFamily: "inherit", transition: "border-color 0.15s",
}

const GRADIENT = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"

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

  // CGU + marketing
  const [tos, setTos]               = useState(false)
  const [marketing, setMarketing]   = useState(true)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true)

    if (role === "client" && password !== confirm) {
      setError("Les mots de passe ne correspondent pas."); setLoading(false); return
    }

    if (!tos) {
      setError("Acceptez les conditions pour continuer."); setLoading(false); return
    }

    const body = role === "client"
      ? { role: "client", email, password, firstName: prenom || undefined, lastName: nom || undefined, marketingOptIn: marketing, agreedTos: true }
      : { role: "vendor", email: vEmail, password: vPassword, companyName: entreprise || undefined, phone: telephone || undefined, vendorCategory: categorie || undefined, marketingOptIn: marketing, agreedTos: true }

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
    if (res?.error) { setError("Compte créé ! Connectez-vous."); router.push("/login") }
    else router.push("/accueil")
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
            <span style={{ fontSize: 16, fontWeight: 700, color: "#121317" }}>Momento</span>
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
                  fontSize: 12, fontWeight: 700,
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
            <span style={{ fontSize: 12, color: "#6a6a71", marginLeft: 4 }}>
              {step === 1 ? "Type de compte" : "Informations"}
            </span>
          </div>

          {/* Step 1 — Role selection */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "#121317", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
                Créer un compte
              </h2>
              <p style={{ fontSize: 14, color: "#6a6a71", margin: "0 0 28px" }}>
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
                    <span style={{ fontSize: 28, flexShrink: 0 }}>{opt.emoji}</span>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#121317", margin: "0 0 4px" }}>{opt.title}</p>
                      <p style={{ fontSize: 12, color: "#6a6a71", margin: 0, lineHeight: 1.5 }}>{opt.desc}</p>
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
                  fontSize: 14, fontWeight: 600, cursor: role ? "pointer" : "not-allowed",
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
                fontSize: 13, color: "#6a6a71", background: "none",
                border: "none", cursor: "pointer", marginBottom: 20, fontFamily: "inherit",
              }}>
                ← Retour
              </button>

              <h2 style={{ fontSize: 22, fontWeight: 700, color: "#121317", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
                {role === "client" ? "Mon compte" : "Mon profil prestataire"}
              </h2>
              <p style={{ fontSize: 14, color: "#6a6a71", margin: "0 0 24px" }}>
                {role === "client" ? "Quelques infos pour commencer." : "Quelques infos sur ton activité."}
              </p>

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
                    <input type="password" placeholder="Mot de passe (8+ car.) *" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = "#E11D48")} onBlur={e => (e.target.style.borderColor = "rgba(183,191,217,0.4)")} />
                    <input type="password" placeholder="Confirmer le mot de passe *" value={confirm} onChange={e => setConfirm(e.target.value)} required style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = "#E11D48")} onBlur={e => (e.target.style.borderColor = "rgba(183,191,217,0.4)")} />
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
                    <input type="password" placeholder="Mot de passe (8+ car.) *" value={vPassword} onChange={e => setVPassword(e.target.value)} required minLength={8} style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = "#E11D48")} onBlur={e => (e.target.style.borderColor = "rgba(183,191,217,0.4)")} />
                  </>
                )}

                {error && (
                  <p style={{
                    fontSize: 13, padding: "10px 14px", borderRadius: 10,
                    background: "rgba(225,29,72,0.07)", color: "#E11D48",
                  }}>{error}</p>
                )}

                {/* CGU + marketing */}
                <label style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 12, color: "#45474D", cursor: "pointer", lineHeight: 1.5, marginTop: 4 }}>
                  <input type="checkbox" checked={tos} onChange={e => setTos(e.target.checked)} style={{ marginTop: 2 }} />
                  <span>J&apos;accepte les <a href="/cgu" target="_blank" style={{ color: "#E11D48", textDecoration: "underline" }}>conditions générales</a> et la <a href="/confidentialite" target="_blank" style={{ color: "#E11D48", textDecoration: "underline" }}>politique de confidentialité</a>.</span>
                </label>
                <label style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 12, color: "#6a6a71", cursor: "pointer", lineHeight: 1.5 }}>
                  <input type="checkbox" checked={marketing} onChange={e => setMarketing(e.target.checked)} style={{ marginTop: 2 }} />
                  <span>Je souhaite recevoir les conseils &amp; offres Momento (facultatif).</span>
                </label>

                <button type="submit" disabled={loading || !tos} aria-disabled={!tos}
                  title={!tos ? "Acceptez les conditions pour continuer" : ""}
                  style={{
                    height: 46, borderRadius: 12, border: "none",
                    background: tos ? GRADIENT : "rgba(183,191,217,0.25)",
                    color: tos ? "#fff" : "#9a9aaa",
                    fontSize: 14, fontWeight: 600,
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

          <p style={{ fontSize: 12, color: "#9a9aaa", textAlign: "center", marginTop: 20 }}>
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
