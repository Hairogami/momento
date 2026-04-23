"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import AntNav from "@/components/clone/AntNav"
import AntFooter from "@/components/clone/AntFooter"

const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"

const REASON_COPY: Record<string, { title: string; subtitle: string }> = {
  messages: {
    title: "Échangez avec vos prestataires en direct",
    subtitle: "Une seule inbox, toutes vos conversations. Pas de numéros perdus dans WhatsApp.",
  },
  "vendors.contact": {
    title: "Contactez les prestataires qui vous plaisent",
    subtitle: "Passez Pro pour envoyer un message, demander un devis, et réserver.",
  },
  "vendor-contact": {
    title: "Contactez les prestataires qui vous plaisent",
    subtitle: "Passez Pro pour envoyer un message, demander un devis, et réserver.",
  },
  favorites: {
    title: "Mettez vos prestas préférés de côté",
    subtitle: "Favoris, comparaison, décision sans stress.",
  },
  guests: {
    title: "Votre liste d'invités, sans galère",
    subtitle: "RSVP, tables, menus — tout en un endroit.",
  },
  checklist: {
    title: "La bonne tâche au bon moment",
    subtitle: "Checklist temporelle personnalisée selon votre date d'événement.",
  },
  planner: {
    title: "Votre planner, c'est Momento",
    subtitle: "Toutes les étapes orchestrées pour vous. Finies les nuits à faire des listes.",
  },
  theme: {
    title: "Votre thème, votre identité",
    subtitle: "Palette, ambiance, moodboard — l'app s'adapte à votre événement.",
  },
  "events-multiple": {
    title: "Plusieurs événements à gérer ?",
    subtitle: "Mariage + henné + EVJG — tout gérer depuis un seul espace.",
  },
  "events.multiple": {
    title: "Plusieurs événements à gérer ?",
    subtitle: "Mariage + henné + EVJG — tout gérer depuis un seul espace.",
  },
  "budget-detailed": {
    title: "Budget détaillé + verdict IA",
    subtitle: "Répartition par poste, alertes dépassement, avis Momento sur votre enveloppe.",
  },
  "tasks.timeline": {
    title: "La bonne tâche au bon moment",
    subtitle: "Checklist temporelle personnalisée selon votre date d'événement.",
  },
  "guests.manage": {
    title: "Votre liste d'invités, sans galère",
    subtitle: "RSVP, tables, menus — tout en un endroit.",
  },
  "messages.direct": {
    title: "Échangez avec vos prestataires en direct",
    subtitle: "Une seule inbox, toutes vos conversations.",
  },
  "vendors.favorites": {
    title: "Mettez vos prestas préférés de côté",
    subtitle: "Favoris, comparaison, décision sans stress.",
  },
  "theme.custom": {
    title: "Votre thème, votre identité",
    subtitle: "Palette, ambiance, moodboard — l'app s'adapte à votre événement.",
  },
  "budget.breakdown": {
    title: "Budget détaillé + verdict IA",
    subtitle: "Répartition par poste, alertes dépassement, avis Momento sur votre enveloppe.",
  },
}

type Plan = "pro" | "pro_planner"

type PricingCard = {
  id: Plan
  badge?: string
  name: string
  priceMad: number
  priceSuffix: string
  tagline: string
  features: string[]
  cta: string
  featured?: boolean
}

const PRICING: PricingCard[] = [
  {
    id: "pro",
    name: "Pro",
    priceMad: 200,
    priceSuffix: "/ mois",
    tagline: "Tous les outils pour organiser votre événement, sans aide humaine.",
    features: [
      "Messagerie directe avec les prestataires",
      "Événements illimités (mariage, henné, EVJG…)",
      "Checklist temporelle personnalisée",
      "Gestion invités + RSVP illimités",
      "Favoris + comparaison prestataires",
      "Budget détaillé + verdict IA",
      "Thème visuel personnalisé",
      "Export PDF des listes et contrats",
    ],
    cta: "Passer Pro",
    featured: true,
    badge: "Le plus choisi",
  },
  {
    id: "pro_planner",
    name: "Pro + Planner",
    priceMad: 500,
    priceSuffix: "/ mois",
    tagline: "Pro + un wedding planner humain et un agent IA à votre service.",
    features: [
      "Tout Momento Pro",
      "Wedding planner dédié (humain)",
      "Agent IA Momento — réponses 24/7",
      "Recherche et shortlist prestataires faite pour vous",
      "Coordination jour J incluse",
      "Accompagnement contrat & négociation",
    ],
    cta: "Choisir Pro + Planner",
  },
]

type PaymentMethod = "cmi" | "paypal"

export default function UpgradeClient({
  currentPlan,
  planExpiresAt,
  from,
  reason,
}: {
  currentPlan: "free" | "pro"
  planExpiresAt: string | null
  from: string | null
  reason: string | null
}) {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<Plan>("pro")
  const [method, setMethod] = useState<PaymentMethod>("cmi")
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const copy = reason && REASON_COPY[reason]

  async function handleUpgrade() {
    setLoading(true); setErr(null)
    try {
      // Étape 1 : initier l'ordre de paiement côté serveur.
      // Tant que l'intégration CMI/PayPal n'est pas en place, la route répond 402.
      const r = await fetch("/api/checkout/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan, method }),
      })

      if (r.status === 402 || r.status === 501) {
        setErr("Paiement bientôt disponible. Contactez-nous pour activer votre Pro manuellement.")
        return
      }

      if (!r.ok) {
        const data = await r.json().catch(() => ({}))
        setErr(data.error ?? "Impossible de démarrer le paiement. Réessayez.")
        return
      }

      const data = await r.json() as { redirectUrl?: string }
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl
        return
      }
      // Fallback : rafraîchir l'état local
      if (from) router.push(from)
      else router.push("/dashboard")
    } catch {
      setErr("Erreur réseau. Réessayez dans un instant.")
    } finally {
      setLoading(false)
    }
  }

  const isCurrentlyPro = currentPlan === "pro"

  return (
    <div className="ant-root" style={{ background: "var(--dash-bg,#fff)", minHeight: "100vh" }}>
      <AntNav />

      {/* ── HERO ── */}
      <section
        style={{
          minHeight: "60vh",
          paddingTop: 120,
          paddingBottom: 60,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "120px 20px 60px",
        }}
      >
        <span
          style={{
            display: "inline-block",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "6px 14px",
            borderRadius: 999,
            color: "#fff",
            background: G,
            marginBottom: 20,
          }}
        >
          Momento Pro
        </span>

        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 3.8rem)",
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            maxWidth: 820,
            color: "var(--dash-text,#121317)",
          }}
        >
          {copy ? copy.title : "Votre événement mérite les bons outils."}
        </h1>

        <p
          style={{
            fontSize: "clamp(1rem, 1.5vw, 1.15rem)",
            maxWidth: 620,
            marginTop: 18,
            lineHeight: 1.55,
            color: "var(--dash-text-2,#45474D)",
          }}
        >
          {copy
            ? copy.subtitle
            : "Momento Pro débloque la messagerie, la gestion invités, la checklist temporelle et le budget détaillé. À partir de 200 MAD par mois, sans engagement."}
        </p>

        {isCurrentlyPro && (
          <div
            style={{
              marginTop: 28,
              padding: "12px 20px",
              borderRadius: 12,
              background: "rgba(34,197,94,0.1)",
              border: "1px solid rgba(34,197,94,0.3)",
              color: "#15803d",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Vous êtes déjà Pro
            {planExpiresAt &&
              ` — valide jusqu'au ${new Date(planExpiresAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`}
          </div>
        )}
      </section>

      {/* ── PRICING ── */}
      <section style={{ padding: "20px 20px 80px" }}>
        <div
          style={{
            maxWidth: 980,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
          }}
        >
          {PRICING.map((p) => {
            const isSelected = selectedPlan === p.id
            return (
              <div
                key={p.id}
                onClick={() => setSelectedPlan(p.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedPlan(p.id) }}
                style={{
                  position: "relative",
                  padding: "32px 28px",
                  borderRadius: 20,
                  background: p.featured
                    ? "linear-gradient(180deg, rgba(225,29,72,0.03), rgba(147,51,234,0.02))"
                    : "#fff",
                  border: isSelected
                    ? "2px solid transparent"
                    : "1px solid rgba(183,191,217,0.25)",
                  backgroundImage: isSelected
                    ? `linear-gradient(#fff, #fff), ${G}`
                    : undefined,
                  backgroundOrigin: isSelected ? "border-box" : undefined,
                  backgroundClip: isSelected ? "padding-box, border-box" : undefined,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  transform: isSelected ? "translateY(-2px)" : "none",
                  boxShadow: isSelected
                    ? "0 18px 40px rgba(225,29,72,0.15)"
                    : "0 4px 12px rgba(0,0,0,0.02)",
                }}
              >
                {p.badge && (
                  <span
                    style={{
                      position: "absolute",
                      top: -12,
                      left: 24,
                      padding: "4px 12px",
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      borderRadius: 99,
                      background: G,
                      color: "#fff",
                    }}
                  >
                    {p.badge}
                  </span>
                )}

                <h3 style={{ fontSize: 22, fontWeight: 700, color: "var(--dash-text,#121317)", margin: 0 }}>
                  {p.name}
                </h3>

                <div style={{ marginTop: 14, display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 48,
                      fontWeight: 600,
                      letterSpacing: "-0.02em",
                      backgroundImage: G,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {p.priceMad}
                  </span>
                  <span style={{ fontSize: 14, color: "var(--dash-text-3,#8888aa)", fontWeight: 600 }}>MAD</span>
                  <span style={{ fontSize: 14, color: "var(--dash-text-3,#8888aa)" }}>{p.priceSuffix}</span>
                </div>

                <p style={{ fontSize: 14, color: "var(--dash-text-2,#45474D)", marginTop: 10, lineHeight: 1.5 }}>
                  {p.tagline}
                </p>

                <ul style={{ listStyle: "none", padding: 0, margin: "20px 0 0" }}>
                  {p.features.map((f) => (
                    <li
                      key={f}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        fontSize: 13,
                        padding: "6px 0",
                        color: "var(--dash-text,#121317)",
                      }}
                    >
                      <span style={{ color: "#22c55e", flexShrink: 0, marginTop: 2 }}>✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── PAYMENT ── */}
      <section style={{ padding: "0 20px 100px" }}>
        <div
          style={{
            maxWidth: 560,
            margin: "0 auto",
            padding: "28px 28px 24px",
            borderRadius: 20,
            background: "#fff",
            border: "1px solid rgba(183,191,217,0.25)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
          }}
        >
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "var(--dash-text,#121317)" }}>
            Mode de paiement
          </h3>
          <p style={{ fontSize: 13, color: "var(--dash-text-2,#45474D)", marginTop: 6 }}>
            Paiement sécurisé. Annulation en 1 clic depuis votre compte. Sans engagement.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 18 }}>
            {([
              { id: "cmi" as const,    label: "Carte bancaire (CMI)", hint: "CIH • BMCE • Attijari • AWB" },
              { id: "paypal" as const, label: "PayPal",                hint: "Paiement international" },
            ]).map((m) => {
              const selected = method === m.id
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  style={{
                    padding: "14px 14px",
                    borderRadius: 12,
                    textAlign: "left",
                    cursor: "pointer",
                    background: selected ? "rgba(225,29,72,0.05)" : "#fff",
                    border: selected ? "1.5px solid #E11D48" : "1px solid rgba(183,191,217,0.35)",
                    transition: "all 0.15s ease",
                    fontFamily: "inherit",
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--dash-text,#121317)" }}>
                    {m.label}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--dash-text-3,#8888aa)", marginTop: 3 }}>
                    {m.hint}
                  </div>
                </button>
              )
            })}
          </div>

          {err && (
            <div
              role="alert"
              style={{
                marginTop: 16,
                padding: "10px 12px",
                borderRadius: 10,
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "#b91c1c",
                fontSize: 13,
              }}
            >
              {err}
            </div>
          )}

          <button
            type="button"
            onClick={handleUpgrade}
            disabled={loading || isCurrentlyPro}
            style={{
              marginTop: 20,
              width: "100%",
              padding: "15px",
              background: isCurrentlyPro ? "#c4c4d4" : G,
              color: "#fff",
              border: "none",
              borderRadius: 14,
              fontSize: 15,
              fontWeight: 800,
              cursor: (loading || isCurrentlyPro) ? "default" : "pointer",
              opacity: loading ? 0.7 : 1,
              fontFamily: "inherit",
              boxShadow: isCurrentlyPro ? "none" : "0 8px 24px rgba(225,29,72,0.25)",
            }}
          >
            {isCurrentlyPro
              ? "Déjà Pro"
              : loading
                ? "Redirection…"
                : `Passer ${selectedPlan === "pro" ? "Pro" : "Pro + Planner"} — ${selectedPlan === "pro" ? 200 : 500} MAD / mois`}
          </button>

          <p style={{ fontSize: 11, color: "var(--dash-text-3,#8888aa)", marginTop: 14, textAlign: "center", lineHeight: 1.5 }}>
            Vous serez redirigé vers la page sécurisée de votre mode de paiement.<br />
            En continuant vous acceptez les <Link href="/cgu" style={{ color: "#E11D48" }}>CGU</Link> et la <Link href="/confidentialite" style={{ color: "#E11D48" }}>politique de confidentialité</Link>.
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: "60px 20px", borderTop: "1px solid rgba(183,191,217,0.15)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--dash-text,#121317)", textAlign: "center", marginBottom: 30 }}>
            Questions fréquentes
          </h2>

          {[
            {
              q: "Je peux annuler quand ?",
              a: "À tout moment depuis votre compte. Vous gardez Momento Pro jusqu'à la fin de la période payée, puis vous repassez automatiquement en plan Free.",
            },
            {
              q: "Momento prend une commission sur mes prestataires ?",
              a: "Non. Momento Pro est un abonnement fixe. Les contrats et paiements se font en direct entre vous et vos prestataires, sans passage par Momento.",
            },
            {
              q: "La carte bancaire CMI, c'est sûr ?",
              a: "Oui. CMI est le Centre Monétique Interbancaire du Maroc, utilisé par toutes les banques marocaines. Aucune donnée carte ne transite par Momento.",
            },
            {
              q: "Et si mon événement est dans 18 mois ?",
              a: "Vous pouvez ne prendre Pro que pour les mois d'organisation active. Certains membres activent Pro 3-4 mois avant le jour J, ça suffit amplement.",
            },
          ].map((item) => (
            <details
              key={item.q}
              style={{
                padding: "16px 18px",
                borderRadius: 12,
                background: "#fff",
                border: "1px solid rgba(183,191,217,0.25)",
                marginBottom: 10,
              }}
            >
              <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: 14, color: "var(--dash-text,#121317)" }}>
                {item.q}
              </summary>
              <p style={{ marginTop: 10, fontSize: 13, color: "var(--dash-text-2,#45474D)", lineHeight: 1.6 }}>
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      <AntFooter />
    </div>
  )
}
