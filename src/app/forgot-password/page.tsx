"use client"

import Link from "next/link"
import { useState, FormEvent } from "react"
import { C } from "@/lib/colors"
import { MomentoLogo } from "@/components/MomentoLogo"

export default function ForgotPasswordPage() {
  const [email, setEmail]       = useState("")
  const [loading, setLoading]   = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError]       = useState("")

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")

    if (!email) {
      setError("Saisis ton adresse e-mail.")
      return
    }

    setLoading(true)
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: C.ink, color: C.white }}
    >
      {/* Top wordmark */}
      <header className="w-full px-6 pt-8 pb-4 flex justify-center">
        <MomentoLogo iconSize={28} />
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-12">
        <div
          className="w-full max-w-md rounded-3xl p-8 sm:p-10"
          style={{
            backgroundColor: C.dark,
            border: `1px solid ${C.anthracite}`,
            boxShadow: "0 8px 48px rgba(26,18,8,0.08)",
          }}
        >
          {!submitted ? (
            <>
              {/* Heading */}
              <div className="text-center mb-8">
                <p
                  className="text-xs font-semibold tracking-widest uppercase mb-2"
                  style={{ color: C.mist }}
                >
                  Récupération
                </p>
                <h1
                  className="font-display italic text-4xl sm:text-5xl font-normal leading-tight"
                  style={{
                    fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                    color: C.accent,
                  }}
                >
                  Mot de passe oublié
                </h1>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: C.mist }}>
                  Saisis ton adresse e-mail et nous t&apos;enverrons un lien pour réinitialiser ton mot de passe.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="email"
                    className="text-xs font-semibold tracking-wide uppercase"
                    style={{ color: C.mist }}
                  >
                    Adresse e-mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="toi@exemple.com"
                    required
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                    style={{
                      backgroundColor: C.ink,
                      border: `1.5px solid ${C.anthracite}`,
                      color: C.white,
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = C.accent)}
                    onBlur={e => (e.currentTarget.style.borderColor = C.anthracite)}
                  />
                </div>

                {/* Error */}
                {error && (
                  <p
                    className="text-sm px-4 py-3 rounded-xl"
                    style={{ backgroundColor: "rgba(var(--momento-terra-rgb),0.1)", color: C.terra }}
                  >
                    {error}
                  </p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full font-bold text-sm py-3.5 rounded-xl transition-all hover:opacity-90 disabled:opacity-60 mt-1"
                  style={{ backgroundColor: C.terra, color: "#fff" }}
                >
                  {loading ? "Envoi en cours…" : "Envoyer le lien"}
                </button>
              </form>

              <p className="text-center text-sm mt-6" style={{ color: C.mist }}>
                <Link
                  href="/login"
                  className="font-semibold transition-opacity hover:opacity-70"
                  style={{ color: C.accent }}
                >
                  ← Retour à la connexion
                </Link>
              </p>
            </>
          ) : (
            /* Success state */
            <div className="text-center py-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: "rgba(var(--momento-terra-rgb),0.12)" }}
              >
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M5 14L11 20L23 8" stroke={C.terra} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2
                className="font-display italic text-3xl font-normal mb-3"
                style={{
                  fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                  color: C.accent,
                }}
              >
                E-mail envoyé !
              </h2>
              <p className="text-sm leading-relaxed mb-6" style={{ color: C.mist }}>
                Si un compte existe pour <strong style={{ color: C.white }}>{email}</strong>, tu recevras un lien de réinitialisation dans quelques minutes.
              </p>
              <p className="text-xs mb-6" style={{ color: C.steel }}>
                Vérifie également tes spams.
              </p>
              <Link
                href="/login"
                className="inline-block font-bold text-sm px-8 py-3 rounded-xl transition-all hover:opacity-90"
                style={{ backgroundColor: C.terra, color: "#fff" }}
              >
                Retour à la connexion
              </Link>
            </div>
          )}
        </div>
      </main>

      <footer className="text-center pb-8 px-6">
        <p className="text-xs" style={{ color: C.steel }}>
          © 2026 Momento. Tous droits réservés.
        </p>
      </footer>
    </div>
  )
}
