"use client"

import Link from "next/link"
import { useState, FormEvent, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { C } from "@/lib/colors"
import { MomentoLogo } from "@/components/MomentoLogo"

function ResetForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""

  const [newPassword, setNewPassword] = useState("")
  const [confirm, setConfirm]         = useState("")
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState("")
  const [done, setDone]               = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")

    if (!newPassword || !confirm) { setError("Veuillez remplir tous les champs."); return }
    if (newPassword !== confirm) { setError("Les mots de passe ne correspondent pas."); return }
    if (newPassword.length < 8) { setError("Minimum 8 caractères."); return }
    if (!token) { setError("Lien invalide."); return }

    setLoading(true)
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) { setError(data.error ?? "Une erreur est survenue."); return }

    setDone(true)
    setTimeout(() => router.push("/login"), 2500)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: C.ink, color: C.white }}>
      <header className="w-full px-6 pt-8 pb-4 flex justify-center">
        <MomentoLogo iconSize={28} />
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-3xl p-8 sm:p-10" style={{ backgroundColor: C.dark, border: `1px solid ${C.anthracite}`, boxShadow: "0 8px 48px rgba(26,18,8,0.08)" }}>
          {done ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "rgba(196,83,42,0.12)" }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M5 14L11 20L23 8" stroke={C.terra} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <h2 className="font-display italic text-3xl font-normal mb-3" style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif", color: C.accent }}>
                Mot de passe modifié !
              </h2>
              <p className="text-sm" style={{ color: C.mist }}>Redirection vers la connexion…</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: C.mist }}>Nouveau mot de passe</p>
                <h1 className="font-display italic text-4xl sm:text-5xl font-normal leading-tight" style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif", color: C.accent }}>
                  Réinitialiser
                </h1>
              </div>

              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                {["newPassword", "confirm"].map(field => (
                  <div key={field} className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: C.mist }}>
                      {field === "newPassword" ? "Nouveau mot de passe" : "Confirmer"}
                    </label>
                    <input
                      type="password"
                      value={field === "newPassword" ? newPassword : confirm}
                      onChange={e => field === "newPassword" ? setNewPassword(e.target.value) : setConfirm(e.target.value)}
                      placeholder="Min. 8 caractères"
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                      style={{ backgroundColor: C.ink, border: `1.5px solid ${C.anthracite}`, color: C.white }}
                      onFocus={e => (e.currentTarget.style.borderColor = C.accent)}
                      onBlur={e => (e.currentTarget.style.borderColor = C.anthracite)}
                    />
                  </div>
                ))}

                {error && (
                  <p className="text-sm px-4 py-3 rounded-xl" style={{ backgroundColor: "rgba(196,83,42,0.1)", color: C.terra }}>
                    {error}
                  </p>
                )}

                <button type="submit" disabled={loading} className="w-full font-bold text-sm py-3.5 rounded-xl transition-all hover:opacity-90 disabled:opacity-60 mt-1" style={{ backgroundColor: C.terra, color: "#fff" }}>
                  {loading ? "Modification…" : "Changer le mot de passe"}
                </button>
              </form>

              <p className="text-center text-sm mt-6">
                <Link href="/login" className="font-semibold transition-opacity hover:opacity-70" style={{ color: C.accent }}>
                  ← Retour à la connexion
                </Link>
              </p>
            </>
          )}
        </div>
      </main>

      <footer className="text-center pb-8 px-6">
        <p className="text-xs" style={{ color: C.steel }}>© 2026 Momento. Tous droits réservés.</p>
      </footer>
    </div>
  )
}

export default function ResetPasswordPage() {
  return <Suspense><ResetForm /></Suspense>
}
