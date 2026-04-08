"use client"

import Link from "next/link"
import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { C } from "@/lib/colors"
import { MomentoLogo } from "@/components/MomentoLogo"

const VENDOR_CATEGORIES = [
  "DJ","Traiteur","Photo/Vidéo","Salle","Fleurs","Gâteau","Animation","Transport",
]

type UserType = "client" | "vendor" | null

interface ClientForm {
  nom: string; prenom: string; email: string; password: string; confirm: string
}
interface VendorForm {
  entreprise: string; categorie: string; email: string; telephone: string; password: string
}

function InputField({
  id, label, type = "text", value, onChange, placeholder, required, autoComplete,
}: {
  id: string; label: string; type?: string; value: string
  onChange: (v: string) => void; placeholder?: string; required?: boolean; autoComplete?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold tracking-wide uppercase" style={{ color: C.mist }}>
        {label}
      </label>
      <input
        id={id} type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} required={required} autoComplete={autoComplete}
        className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
        style={{ backgroundColor: C.ink, border: `1.5px solid ${C.anthracite}`, color: C.white }}
        onFocus={e => (e.currentTarget.style.borderColor = C.accent)}
        onBlur={e => (e.currentTarget.style.borderColor = C.anthracite)}
      />
    </div>
  )
}

function SelectField({
  id, label, value, onChange, options,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void; options: string[]
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold tracking-wide uppercase" style={{ color: C.mist }}>
        {label}
      </label>
      <select
        id={id} value={value} onChange={e => onChange(e.target.value)}
        className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all appearance-none cursor-pointer"
        style={{
          backgroundColor: C.ink, border: `1.5px solid ${C.anthracite}`,
          color: value ? C.white : C.steel,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1L6 7L11 1' stroke='%236A5F4A' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", paddingRight: "38px",
        }}
        onFocus={e => (e.currentTarget.style.borderColor = C.accent)}
        onBlur={e => (e.currentTarget.style.borderColor = C.anthracite)}
      >
        <option value="" disabled style={{ color: C.steel }}>Choisir une catégorie</option>
        {options.map(opt => (
          <option key={opt} value={opt} style={{ color: C.white, backgroundColor: C.dark }}>{opt}</option>
        ))}
      </select>
    </div>
  )
}

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep]           = useState<1 | 2>(1)
  const [userType, setUserType]   = useState<UserType>(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState("")

  const [client, setClient] = useState<ClientForm>({ nom:"", prenom:"", email:"", password:"", confirm:"" })
  const [vendor, setVendor] = useState<VendorForm>({ entreprise:"", categorie:"", email:"", telephone:"", password:"" })

  function updateClient(k: keyof ClientForm, v: string) { setClient(prev => ({ ...prev, [k]: v })) }
  function updateVendor(k: keyof VendorForm, v: string) { setVendor(prev => ({ ...prev, [k]: v })) }

  function handleTypeSelect(type: UserType) { setUserType(type); setError(""); setStep(2) }
  function handleBack() { setError(""); setStep(1); setUserType(null) }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")

    if (userType === "client") {
      const { nom, prenom, email, password, confirm } = client
      if (!nom || !prenom || !email || !password || !confirm) {
        setError("Veuillez remplir tous les champs."); return
      }
      if (password !== confirm) { setError("Les mots de passe ne correspondent pas."); return }
      if (password.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères."); return }
    } else {
      const { entreprise, categorie, email, telephone, password } = vendor
      if (!entreprise || !categorie || !email || !telephone || !password) {
        setError("Veuillez remplir tous les champs."); return
      }
      if (password.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères."); return }
    }

    setLoading(true)
    const payload = userType === "client"
      ? { role: "client", email: client.email, password: client.password, firstName: client.prenom, lastName: client.nom }
      : { role: "vendor", email: vendor.email, password: vendor.password, companyName: vendor.entreprise, vendorCategory: vendor.categorie, phone: vendor.telephone }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) { setError(data.error ?? "Une erreur est survenue."); return }

    router.refresh()
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: C.ink, color: C.white }}>
      <header className="w-full px-6 pt-8 pb-4 flex justify-center">
        <MomentoLogo iconSize={28} />
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-12">

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div className="w-full max-w-2xl">
            <div className="text-center mb-10">
              <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: C.mist }}>Inscription</p>
              <h1 className="font-display italic text-4xl sm:text-5xl font-normal leading-tight" style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif", color: C.accent }}>
                Vous êtes…
              </h1>
              <p className="mt-3 text-sm" style={{ color: C.mist }}>Choisissez votre profil pour commencer</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { type: "client" as const, icon: "🎉", title: "Je cherche des prestataires", desc: "Planifiez votre événement et trouvez les meilleurs prestataires — DJ, traiteur, photographe et plus.", cta: "Commencer" },
                { type: "vendor" as const, icon: "🎵", title: "Je suis prestataire", desc: "Rejoignez la plateforme, présentez vos services et recevez des demandes d'événements qualifiés.", cta: "Rejoindre" },
              ].map(card => (
                <button
                  key={card.type}
                  onClick={() => handleTypeSelect(card.type)}
                  className="group flex flex-col items-start gap-4 p-8 rounded-3xl text-left transition-all hover:-translate-y-1"
                  style={{ backgroundColor: C.dark, border: `1.5px solid ${C.anthracite}`, boxShadow: "0 4px 24px rgba(26,18,8,0.06)" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.boxShadow = "0 8px 40px rgba(44,26,14,0.12)" }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.anthracite; e.currentTarget.style.boxShadow = "0 4px 24px rgba(26,18,8,0.06)" }}
                >
                  <span className="text-4xl">{card.icon}</span>
                  <div>
                    <h2 className="font-bold text-lg mb-1" style={{ color: C.white }}>{card.title}</h2>
                    <p className="text-sm leading-relaxed" style={{ color: C.mist }}>{card.desc}</p>
                  </div>
                  <div className="mt-auto text-xs font-semibold flex items-center gap-1.5 transition-opacity group-hover:opacity-100 opacity-60" style={{ color: C.terra }}>
                    {card.cta} →
                  </div>
                </button>
              ))}
            </div>

            <p className="text-center text-sm mt-8" style={{ color: C.mist }}>
              Déjà un compte ?{" "}
              <Link href="/login" className="font-semibold transition-opacity hover:opacity-70" style={{ color: C.accent }}>Se connecter</Link>
            </p>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && userType && (
          <div className="w-full max-w-md rounded-3xl p-8 sm:p-10" style={{ backgroundColor: C.dark, border: `1px solid ${C.anthracite}`, boxShadow: "0 8px 48px rgba(26,18,8,0.08)" }}>
            <div className="flex items-center gap-2 mb-6">
              <div className="flex-1 h-1 rounded-full" style={{ backgroundColor: C.anthracite }}>
                <div className="h-1 rounded-full transition-all" style={{ backgroundColor: C.terra, width: "100%" }} />
              </div>
            </div>

            <button onClick={handleBack} className="flex items-center gap-1.5 text-xs font-semibold mb-6 transition-opacity hover:opacity-70" style={{ color: C.mist }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Retour
            </button>

            <div className="text-center mb-8">
              <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: C.mist }}>
                {userType === "client" ? "Compte client" : "Compte prestataire"}
              </p>
              <h1 className="font-display italic text-4xl sm:text-5xl font-normal leading-tight" style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif", color: C.accent }}>
                {userType === "client" ? "Créer mon compte" : "Rejoindre Momento"}
              </h1>
            </div>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              {userType === "client" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <InputField id="prenom" label="Prénom" value={client.prenom} onChange={v => updateClient("prenom", v)} placeholder="Yasmine" required autoComplete="given-name" />
                    <InputField id="nom" label="Nom" value={client.nom} onChange={v => updateClient("nom", v)} placeholder="Benali" required autoComplete="family-name" />
                  </div>
                  <InputField id="email-c" label="Adresse e-mail" type="email" value={client.email} onChange={v => updateClient("email", v)} placeholder="vous@exemple.com" required autoComplete="email" />
                  <InputField id="password-c" label="Mot de passe" type="password" value={client.password} onChange={v => updateClient("password", v)} placeholder="Min. 8 caractères" required autoComplete="new-password" />
                  <InputField id="confirm-c" label="Confirmer le mot de passe" type="password" value={client.confirm} onChange={v => updateClient("confirm", v)} placeholder="••••••••" required autoComplete="new-password" />
                </>
              )}

              {userType === "vendor" && (
                <>
                  <InputField id="entreprise" label="Nom de l'entreprise" value={vendor.entreprise} onChange={v => updateVendor("entreprise", v)} placeholder="Studio Lumière" required autoComplete="organization" />
                  <SelectField id="categorie" label="Catégorie" value={vendor.categorie} onChange={v => updateVendor("categorie", v)} options={VENDOR_CATEGORIES} />
                  <InputField id="email-v" label="Adresse e-mail" type="email" value={vendor.email} onChange={v => updateVendor("email", v)} placeholder="contact@entreprise.com" required autoComplete="email" />
                  <InputField id="telephone" label="Téléphone" type="tel" value={vendor.telephone} onChange={v => updateVendor("telephone", v)} placeholder="+212 6 00 00 00 00" required autoComplete="tel" />
                  <InputField id="password-v" label="Mot de passe" type="password" value={vendor.password} onChange={v => updateVendor("password", v)} placeholder="Min. 8 caractères" required autoComplete="new-password" />
                </>
              )}

              {error && (
                <p className="text-sm px-4 py-3 rounded-xl" style={{ backgroundColor: "rgba(var(--momento-terra-rgb),0.1)", color: C.terra }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full font-bold text-sm py-3.5 rounded-xl transition-all hover:opacity-90 disabled:opacity-60 mt-1"
                style={{ backgroundColor: C.terra, color: "#fff" }}
              >
                {loading ? "Création en cours…" : userType === "client" ? "Créer mon compte" : "Rejoindre la plateforme"}
              </button>
            </form>

            <p className="text-center text-sm mt-6" style={{ color: C.mist }}>
              Déjà un compte ?{" "}
              <Link href="/login" className="font-semibold transition-opacity hover:opacity-70" style={{ color: C.accent }}>Se connecter</Link>
            </p>
          </div>
        )}

      </main>

      <footer className="text-center pb-8 px-6">
        <p className="text-xs" style={{ color: C.steel }}>© 2026 Momento. Tous droits réservés.</p>
      </footer>
    </div>
  )
}
