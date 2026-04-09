"use client"

import { useState, FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircle, Star, MapPin, ArrowRight, Loader2, Mail } from "lucide-react"
import { C } from "@/lib/colors"

const CAT_ICONS: Record<string, string> = {
  "DJ": "🎧", "Traiteur": "🍽️", "Photographe": "📸", "Vidéaste": "🎬",
  "Orchestre": "🎺", "Neggafa": "👑", "Makeup Artist": "💄", "Hairstylist": "💇",
  "Lieu de réception": "🏛️", "Décorateur": "✨", "Fleuriste événementiel": "💐",
  "Pâtissier / Cake designer": "🎂", "Wedding planner": "💍", "Event planner": "📋",
  "Magicien": "🎩", "Animateur enfants": "🎪", "Location de voiture de mariage": "🚗",
}

function Input({ id, label, type = "text", value, onChange, placeholder, required, autoComplete }: {
  id: string; label: string; type?: string; value: string
  onChange: (v: string) => void; placeholder?: string; required?: boolean; autoComplete?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold tracking-wide uppercase" style={{ color: C.mist }}>
        {label}{required && <span style={{ color: C.terra }}> *</span>}
      </label>
      <input
        id={id} type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} required={required} autoComplete={autoComplete}
        className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
        style={{ backgroundColor: C.dark, borderColor: C.steel, color: C.white }}
      />
    </div>
  )
}

type Vendor = { name: string; category: string; city: string; rating: number }

export default function ClaimPageClient({
  slug, vendor, alreadyClaimed, loggedInEmail, loggedInUserId,
}: {
  slug: string
  vendor: Vendor
  alreadyClaimed: boolean
  loggedInEmail: string | null
  loggedInUserId: string | null
}) {
  const router = useRouter()
  const icon = CAT_ICONS[vendor.category] ?? "🏢"

  const [step, setStep]       = useState<"form" | "verify_email" | "claimed">("form")
  const [tab, setTab]         = useState<"register" | "login">("register")
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")

  // Register form
  const [firstName, setFirstName] = useState("")
  const [lastName,  setLastName]  = useState("")
  const [email,     setEmail]     = useState("")
  const [phone,     setPhone]     = useState("")
  const [password,  setPassword]  = useState("")
  const [confirm,   setConfirm]   = useState("")

  // Login form
  const [loginEmail,    setLoginEmail]    = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  async function handleLoggedInClaim() {
    setLoading(true)
    setError("")
    const res  = await fetch("/api/vendor/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, mode: "logged_in" }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error ?? "Erreur."); return }
    router.push("/prestataire/dashboard?claimed=1")
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault()
    setError("")
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas."); return }
    if (password.length < 8)  { setError("Mot de passe trop court (8 caractères min)."); return }

    setLoading(true)
    const res  = await fetch("/api/vendor/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, mode: "register", firstName, lastName, email, phone, password }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error ?? "Erreur."); return }
    setStep("verify_email")
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Login first
    const loginRes = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: loginEmail, password: loginPassword }),
    })
    const loginData = await loginRes.json()
    if (!loginRes.ok) { setLoading(false); setError(loginData.error ?? "Identifiants incorrects."); return }

    // Then claim
    const claimRes = await fetch("/api/vendor/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, mode: "logged_in" }),
    })
    const claimData = await claimRes.json()
    setLoading(false)
    if (!claimRes.ok) { setError(claimData.error ?? "Erreur lors de la revendication."); return }
    router.push("/prestataire/dashboard?claimed=1")
  }

  // ── Vendor card ──────────────────────────────────────────────────────────
  const VendorCard = () => (
    <div
      className="flex items-center gap-4 p-4 rounded-2xl mb-6"
      style={{ backgroundColor: C.dark, border: `1px solid ${C.steel}` }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ backgroundColor: C.ink }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-base truncate" style={{ color: C.white }}>{vendor.name}</p>
        <p className="text-sm" style={{ color: C.mist }}>{vendor.category}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="flex items-center gap-1 text-xs" style={{ color: C.steel }}>
            <MapPin size={11} /> {vendor.city}
          </span>
          <span className="flex items-center gap-1 text-xs" style={{ color: C.steel }}>
            <Star size={11} className="fill-current" style={{ color: "#D4AC0D" }} /> {vendor.rating}/5
          </span>
        </div>
      </div>
      <div
        className="px-2 py-1 rounded-full text-xs font-medium"
        style={{ backgroundColor: "#1a3320", color: "#6fcf97" }}
      >
        Gratuit
      </div>
    </div>
  )

  // ── Already claimed ──────────────────────────────────────────────────────
  if (alreadyClaimed) return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: C.ink }}>
      <div className="w-full max-w-md text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-xl font-bold mb-2" style={{ color: C.white }}>Profil déjà revendiqué</h1>
        <p className="text-sm mb-6" style={{ color: C.mist }}>
          Ce profil a déjà été revendiqué par son propriétaire.
        </p>
        <Link href={`/vendor/${slug}`}
          className="inline-block px-6 py-3 rounded-2xl text-sm font-semibold"
          style={{ backgroundColor: C.terra, color: "#FFF8EF" }}
        >
          Retour au profil
        </Link>
      </div>
    </div>
  )

  // ── Verify email step ────────────────────────────────────────────────────
  if (step === "verify_email") return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: C.ink }}>
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: "#1a3320" }}>
          <Mail size={28} style={{ color: "#6fcf97" }} />
        </div>
        <h1 className="text-xl font-bold mb-2" style={{ color: C.white }}>Vérifiez votre boîte mail</h1>
        <p className="text-sm mb-4" style={{ color: C.mist }}>
          Un lien de confirmation a été envoyé à <strong>{email}</strong>.
          Cliquez dessus pour activer votre compte et accéder à votre dashboard.
        </p>
        <div
          className="rounded-2xl p-4 text-sm text-left mb-6"
          style={{ backgroundColor: C.dark, border: `1px solid ${C.steel}` }}
        >
          <p className="font-semibold mb-2" style={{ color: C.white }}>Ce que vous obtenez :</p>
          {[
            "Votre profil prestataire sur Momento",
            "Accès à votre dashboard (contacts, stats)",
            "Modifier vos infos, photos, tarifs",
            "Badge ✅ Profil revendiqué sur votre page",
          ].map(item => (
            <div key={item} className="flex items-center gap-2 py-1" style={{ color: C.mist }}>
              <CheckCircle size={14} style={{ color: "#6fcf97" }} /> {item}
            </div>
          ))}
        </div>
        <Link href={`/vendor/${slug}`} className="text-sm underline" style={{ color: C.steel }}>
          Retour au profil
        </Link>
      </div>
    </div>
  )

  // ── Main form ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen py-12 px-4" style={{ backgroundColor: C.ink }}>
      <div className="w-full max-w-md mx-auto">

        {/* Back */}
        <Link href={`/vendor/${slug}`} className="inline-flex items-center gap-1 text-sm mb-6 transition-opacity hover:opacity-70" style={{ color: C.mist }}>
          ← Retour au prestataire
        </Link>

        {/* Logo */}
        <Link href="/" className="block text-center mb-8">
          <span className="text-2xl font-bold tracking-tight" style={{ color: C.terra }}>momento</span>
        </Link>

        <h1 className="text-2xl font-bold text-center mb-2" style={{ color: C.white }}>
          Cette page vous appartient ?
        </h1>
        <p className="text-sm text-center mb-6" style={{ color: C.mist }}>
          Revendiquez votre profil gratuitement et prenez le contrôle de votre présence en ligne.
        </p>

        <VendorCard />

        {/* Logged-in shortcut */}
        {loggedInEmail ? (
          <div className="space-y-4">
            <div
              className="rounded-2xl p-4 text-sm"
              style={{ backgroundColor: C.dark, border: `1px solid ${C.steel}` }}
            >
              <p style={{ color: C.mist }}>
                Connecté en tant que <strong style={{ color: C.white }}>{loggedInEmail}</strong>
              </p>
            </div>
            {error && (
              <p className="text-sm text-center" style={{ color: C.terra }}>{error}</p>
            )}
            <button
              onClick={handleLoggedInClaim}
              disabled={loading}
              className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: C.terra, color: "#FFF8EF" }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
              Revendiquer ce profil
            </button>
            <p className="text-xs text-center" style={{ color: C.steel }}>
              Pas vous ?{" "}
              <Link href="/api/auth/logout" className="underline">Se déconnecter</Link>
            </p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div
              className="flex rounded-2xl p-1 mb-6"
              style={{ backgroundColor: C.dark }}
            >
              {(["register", "login"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setError("") }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    backgroundColor: tab === t ? C.ink : "transparent",
                    color: tab === t ? C.white : C.steel,
                    boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                  }}
                >
                  {t === "register" ? "Créer un compte" : "J'ai déjà un compte"}
                </button>
              ))}
            </div>

            {/* Register */}
            {tab === "register" && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input id="firstName" label="Prénom" value={firstName} onChange={setFirstName} required autoComplete="given-name" />
                  <Input id="lastName"  label="Nom"    value={lastName}  onChange={setLastName}  required autoComplete="family-name" />
                </div>
                <Input id="email"    label="Email"      type="email"    value={email}    onChange={setEmail}    required autoComplete="email" />
                <Input id="phone"    label="Téléphone"  type="tel"      value={phone}    onChange={setPhone}    placeholder="+212 6..." />
                <Input id="password" label="Mot de passe" type="password" value={password} onChange={setPassword} required autoComplete="new-password" placeholder="8 caractères min" />
                <Input id="confirm"  label="Confirmer"  type="password" value={confirm}  onChange={setConfirm}  required autoComplete="new-password" />

                {error && <p className="text-sm text-center" style={{ color: C.terra }}>{error}</p>}

                <button
                  type="submit" disabled={loading}
                  className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: C.terra, color: "#FFF8EF" }}
                >
                  {loading
                    ? <Loader2 size={18} className="animate-spin" />
                    : <ArrowRight size={18} />
                  }
                  Créer mon compte et revendiquer
                </button>

                <p className="text-xs text-center" style={{ color: C.steel }}>
                  Gratuit · Pas de carte bancaire · Annulable à tout moment
                </p>
              </form>
            )}

            {/* Login */}
            {tab === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <Input id="loginEmail"    label="Email"         type="email"    value={loginEmail}    onChange={setLoginEmail}    required autoComplete="email" />
                <Input id="loginPassword" label="Mot de passe"  type="password" value={loginPassword} onChange={setLoginPassword} required autoComplete="current-password" />

                {error && <p className="text-sm text-center" style={{ color: C.terra }}>{error}</p>}

                <button
                  type="submit" disabled={loading}
                  className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: C.terra, color: "#FFF8EF" }}
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                  Se connecter et revendiquer
                </button>

                <p className="text-xs text-center">
                  <Link href="/forgot-password" className="underline" style={{ color: C.steel }}>
                    Mot de passe oublié ?
                  </Link>
                </p>
              </form>
            )}
          </>
        )}

        {/* Benefits */}
        <div className="mt-8 space-y-2">
          {[
            ["✅", "Profil revendiqué visible sur votre page"],
            ["📊", "Dashboard : contacts, vues, statistiques"],
            ["✏️", "Modifiez vos infos, photos et tarifs"],
            ["🆓", "100% gratuit — toujours"],
          ].map(([icon, text]) => (
            <div key={text} className="flex items-center gap-3 text-sm" style={{ color: C.mist }}>
              <span>{icon}</span> {text}
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
