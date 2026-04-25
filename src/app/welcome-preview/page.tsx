"use client"

/**
 * MOCKUP — /welcome-preview
 * Page statique de prévisualisation (non-fonctionnelle) pour valider la direction
 * "consent gate centralisé" post-login OAuth / magic link / email.
 *
 * Flux cible : premier login via Google/Facebook/Resend/email → redirect ici
 * si agreedTos=false en DB → user valide CGU + opt-in marketing → /accueil.
 */

import { useState } from "react"
import Link from "next/link"

const G = "linear-gradient(135deg, #E11D48, #9333EA)"

export default function WelcomePreview() {
  const [tos, setTos] = useState(false)
  const [marketing, setMarketing] = useState(true)

  const canSubmit = tos

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #f7f7fb 0%, #fefefe 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "32px 20px",
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: 520 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-icon.png" alt="Momento" width={32} height={32} style={{ objectFit: "contain", mixBlendMode: "multiply" }} />
            <span style={{ fontSize: 17, fontWeight: 700, color: "#121317", letterSpacing: "-0.01em" }}>Momento</span>
          </Link>
        </div>

        {/* Card */}
        <div style={{
          background: "#fff",
          borderRadius: 28,
          padding: "44px 40px",
          border: "1px solid rgba(183,191,217,0.22)",
          boxShadow: "0 12px 48px rgba(12,14,30,0.07)",
        }}>

          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "5px 11px", borderRadius: 999,
            background: "rgba(225,29,72,0.08)",
            color: "#E11D48", fontSize: 11, fontWeight: 700,
            letterSpacing: "0.04em", textTransform: "uppercase",
            marginBottom: 18,
          }}>
            <span>✨</span> Dernière étape
          </div>

          <h1 style={{
            fontSize: 30, fontWeight: 700, color: "#121317",
            margin: "0 0 10px", letterSpacing: "-0.025em", lineHeight: 1.15,
          }}>
            Bienvenue, <span style={{
              backgroundImage: G,
              WebkitBackgroundClip: "text", backgroundClip: "text",
              WebkitTextFillColor: "transparent", color: "transparent",
            }}>Sara</span> 👋
          </h1>
          <p style={{
            fontSize: 15, color: "#6a6a71",
            margin: "0 0 30px", lineHeight: 1.55,
          }}>
            Avant d&apos;accéder à ton espace, on a besoin de ton accord explicite —
            c&apos;est rapide, et c&apos;est important pour tes droits.
          </p>

          {/* Consent blocks */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* CGU — obligatoire */}
            <label style={{
              display: "flex", alignItems: "flex-start", gap: 14,
              padding: "16px 18px", borderRadius: 16,
              border: tos ? "1.5px solid #E11D48" : "1px solid rgba(183,191,217,0.28)",
              background: tos ? "rgba(225,29,72,0.03)" : "#fafafa",
              cursor: "pointer", transition: "all 0.15s",
            }}>
              <input type="checkbox" checked={tos} onChange={e => setTos(e.target.checked)}
                style={{ marginTop: 3, width: 18, height: 18, accentColor: "#E11D48", cursor: "pointer" }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#121317", marginBottom: 4 }}>
                  J&apos;accepte les conditions <span style={{ color: "#E11D48" }}>*</span>
                </div>
                <div style={{ fontSize: 13, color: "#6a6a71", lineHeight: 1.5 }}>
                  Je reconnais avoir lu les <a href="/cgu" target="_blank" style={{ color: "#E11D48", fontWeight: 600 }}>conditions générales d&apos;utilisation</a> et
                  la <a href="/confidentialite" target="_blank" style={{ color: "#E11D48", fontWeight: 600 }}>politique de confidentialité</a>.
                </div>
              </div>
            </label>

            {/* Marketing — optionnel */}
            <label style={{
              display: "flex", alignItems: "flex-start", gap: 14,
              padding: "16px 18px", borderRadius: 16,
              border: marketing ? "1.5px solid #9333EA" : "1px solid rgba(183,191,217,0.28)",
              background: marketing ? "rgba(147,51,234,0.03)" : "#fafafa",
              cursor: "pointer", transition: "all 0.15s",
            }}>
              <input type="checkbox" checked={marketing} onChange={e => setMarketing(e.target.checked)}
                style={{ marginTop: 3, width: 18, height: 18, accentColor: "#9333EA", cursor: "pointer" }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#121317", marginBottom: 4 }}>
                  Conseils &amp; offres Momento <span style={{ fontSize: 11, fontWeight: 500, color: "#9a9aaa", marginLeft: 4 }}>facultatif</span>
                </div>
                <div style={{ fontSize: 13, color: "#6a6a71", lineHeight: 1.5 }}>
                  Recevoir les bons plans prestataires, tips organisation et promos Pro (1 email / semaine max).
                </div>
              </div>
            </label>
          </div>

          {/* CTA */}
          <button
            disabled={!canSubmit}
            style={{
              width: "100%", height: 52, marginTop: 24,
              borderRadius: 14, border: "none",
              background: canSubmit ? G : "rgba(183,191,217,0.25)",
              color: canSubmit ? "#fff" : "#9a9aaa",
              fontSize: 15, fontWeight: 700, fontFamily: "inherit",
              cursor: canSubmit ? "pointer" : "not-allowed",
              boxShadow: canSubmit ? "0 8px 24px color-mix(in srgb, var(--g1,#E11D48) 25%, transparent)" : "none",
              transition: "all 0.2s",
              letterSpacing: "-0.005em",
            }}>
            {canSubmit ? "Accéder à mon espace →" : "Accepte les conditions pour continuer"}
          </button>

          {/* Reassurance */}
          <div style={{
            marginTop: 22, padding: "14px 16px",
            background: "rgba(22,101,52,0.04)",
            border: "1px solid rgba(22,101,52,0.12)",
            borderRadius: 12,
            display: "flex", alignItems: "flex-start", gap: 10,
          }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>🔒</span>
            <p style={{ fontSize: 12, color: "#4a5a4a", margin: 0, lineHeight: 1.55 }}>
              Ton consentement est horodaté et stocké de façon sécurisée.
              Tu peux le retirer à tout moment depuis <strong>Profil → Confidentialité</strong>.
            </p>
          </div>

          {/* Logout escape */}
          <p style={{
            fontSize: 12, color: "#9a9aaa", textAlign: "center",
            marginTop: 18, lineHeight: 1.5,
          }}>
            Pas d&apos;accord ? <a href="#" style={{ color: "#6a6a71", textDecoration: "underline" }}>Se déconnecter</a> —
            aucune donnée ne sera conservée.
          </p>
        </div>

        {/* Mockup note */}
        <div style={{
          marginTop: 20, textAlign: "center",
          fontSize: 11, color: "#c0c0ca", letterSpacing: "0.03em",
        }}>
          MOCKUP — /welcome-preview · non-fonctionnel
        </div>
      </div>
    </div>
  )
}
