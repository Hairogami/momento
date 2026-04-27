"use client"

import { useState } from "react"
import Link from "next/link"
import AntNav from "@/components/clone/AntNav"

/**
 * Page /upgrade — tableau comparatif 3 tiers : Free / Pro / Max.
 * Design straight to the point, respecte dark/light via les variables --dash-*.
 * Max = "sur devis" (pricing à arbitrer, CTA mailto contact).
 */

type Plan = "free" | "pro" | "max"

type Feature = {
  label: string
  free: boolean | string
  pro:  boolean | string
  max:  boolean | string
}

const FEATURES: Feature[] = [
  { label: "Exploration illimitée de l'annuaire",          free: true,  pro: true,               max: true },
  { label: "Favoris",                                       free: true,  pro: true,               max: true },
  { label: "Mes prestataires sélectionnés",                 free: true,  pro: true,               max: true },
  { label: "Création d'événement",                          free: "1",   pro: "Illimité",         max: "Illimité" },
  { label: "Budget total",                                  free: true,  pro: true,               max: true },
  { label: "Notes & compte à rebours",                      free: true,  pro: true,               max: true },
  { label: "Messagerie directe avec prestataires",          free: false, pro: true,               max: true },
  { label: "Checklist temporelle (calculée par date)",      free: false, pro: true,               max: true },
  { label: "Gestion des invités & RSVP",                    free: false, pro: true,               max: true },
  { label: "Budget détaillé + verdict IA par catégorie",    free: false, pro: true,               max: true },
  { label: "Thème & palette personnalisables",              free: false, pro: true,               max: true },
  { label: "Wedding planner humain dédié",                  free: false, pro: false,              max: true },
  { label: "Agent IA d'organisation",                       free: false, pro: false,              max: true },
  { label: "Accompagnement sur-mesure",                     free: false, pro: false,              max: true },
]

export default function UpgradeClient({
  currentPlan,
  planExpiresAt,
  from,
  reason,
}: {
  currentPlan: Plan | string
  planExpiresAt: string | null
  from: string | null
  reason: string | null
}) {
  const [selected, setSelected] = useState<Plan>(currentPlan === "pro" ? "max" : "pro")

  const expiry = planExpiresAt ? new Date(planExpiresAt) : null

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--dash-bg,#f7f7fb)",
      color: "var(--dash-text,#121317)",
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    }}>
      <AntNav />

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "96px 24px 80px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <p style={kickerStyle}>✨ Votre abonnement</p>
          <h1 style={h1Style}>
            Choisissez le plan qui vous va.
          </h1>
          <p style={{ fontSize: "var(--text-base)", color: "var(--dash-text-2,#6a6a71)", margin: "0 auto", maxWidth: 560, lineHeight: 1.6 }}>
            Résiliable à tout moment. Droit de rétractation 7 jours (loi 31-08).
            {currentPlan === "pro" && " Vous êtes actuellement en Pro."}
            {currentPlan === "max" && " Vous êtes actuellement en Max."}
            {expiry && currentPlan !== "free" && ` Expiration : ${expiry.toLocaleDateString("fr-MA")}.`}
          </p>
          {reason === "pro-required" && (
            <div style={noticeStyle}>
              Cette fonctionnalité est réservée aux abonnés Pro. Choisissez Pro pour la débloquer immédiatement.
              {from && <span style={{ opacity: 0.7 }}> (depuis <code style={{ fontSize: "var(--text-xs)" }}>{from}</code>)</span>}
            </div>
          )}
        </div>

        {/* Tableau comparatif 3 tiers */}
        <div style={{
          background: "var(--dash-surface,#fff)",
          border: "1px solid var(--dash-border,rgba(183,191,217,0.22))",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 4px 24px rgba(12,14,30,0.04)",
        }}>
          {/* En-tête 4 colonnes */}
          <div style={gridHeaderStyle}>
            <div />
            <PlanHeaderCell
              name="Free"
              price="0 Dhs"
              tagline="Pour commencer"
              highlighted={false}
              current={currentPlan === "free"}
              onSelect={() => setSelected("free")}
              selected={selected === "free"}
            />
            <PlanHeaderCell
              name="Pro"
              price="200 Dhs"
              priceSuffix="/ mois"
              tagline="Le couteau suisse"
              highlighted
              current={currentPlan === "pro"}
              onSelect={() => setSelected("pro")}
              selected={selected === "pro"}
            />
            <PlanHeaderCell
              name="Max"
              price="Sur devis"
              tagline="Tout inclus + planner"
              highlighted={false}
              current={currentPlan === "max"}
              onSelect={() => setSelected("max")}
              selected={selected === "max"}
            />
          </div>

          {/* Lignes features */}
          <div>
            {FEATURES.map((f, i) => (
              <div
                key={f.label}
                style={{
                  ...gridRowStyle,
                  background: i % 2 === 0 ? "transparent" : "var(--dash-faint,rgba(183,191,217,0.05))",
                }}
              >
                <div style={{
                  padding: "14px 20px",
                  fontSize: "var(--text-sm)",
                  fontWeight: 500,
                  color: "var(--dash-text,#121317)",
                }}>
                  {f.label}
                </div>
                <Cell value={f.free} />
                <Cell value={f.pro} highlighted />
                <Cell value={f.max} />
              </div>
            ))}
          </div>

          {/* Footer CTA */}
          <div style={gridFooterStyle}>
            <div />
            <FooterCell
              label="Rester Free"
              href="/accueil"
              variant="ghost"
              disabled={currentPlan === "free"}
              disabledLabel="Plan actuel"
            />
            <FooterCell
              label="Passer Pro"
              href="/api/checkout/upgrade?plan=pro&method=cmi"
              variant="primary"
              disabled={currentPlan === "pro"}
              disabledLabel="Plan actuel"
            />
            <FooterCell
              label="Passer Max"
              href="mailto:contact@momentoevents.app?subject=Demande%20de%20devis%20Momento%20Max"
              variant="outline"
              disabled={currentPlan === "max"}
              disabledLabel="Plan actuel"
            />
          </div>
        </div>

        {/* Infos paiement */}
        <div style={{
          marginTop: 28,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 14,
        }}>
          {[
            { icon: "credit_card", title: "Paiement CMI",    desc: "Carte bancaire marocaine, agréé BAM. Visa, Mastercard, CMI." },
            { icon: "shield",      title: "Sécurisé",        desc: "3D Secure obligatoire, aucun numéro de carte ne transite par Momento." },
            { icon: "refresh",     title: "Résiliable",      desc: "Annulez en 1 clic depuis vos paramètres. Aucun engagement de durée." },
            { icon: "support",     title: "Rétractation 7 j", desc: "Conformément à l'article 36 de la loi 31-08." },
          ].map(b => (
            <div key={b.title} style={infoCardStyle}>
              <span style={{
                fontFamily: "'Google Symbols','Material Symbols Outlined'",
                fontSize: "var(--text-lg)", color: "#E11D48", lineHeight: 1, display: "inline-block", marginBottom: 8,
              }}>{b.icon}</span>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--dash-text,#121317)", marginBottom: 4 }}>{b.title}</div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--dash-text-2,#6a6a71)", lineHeight: 1.55 }}>{b.desc}</div>
            </div>
          ))}
        </div>

        <p style={{ textAlign: "center", fontSize: "var(--text-xs)", color: "var(--dash-text-3,#9a9aaa)", marginTop: 28 }}>
          Questions ? <a href="mailto:contact@momentoevents.app" style={{ color: "#E11D48" }}>contact@momentoevents.app</a>
          {" · "}
          <Link href="/cgu" style={{ color: "var(--dash-text-2,#6a6a71)" }}>CGU</Link>
          {" · "}
          <Link href="/confidentialite" style={{ color: "var(--dash-text-2,#6a6a71)" }}>Confidentialité</Link>
        </p>
      </main>
    </div>
  )
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function PlanHeaderCell({
  name, price, priceSuffix, tagline, highlighted, current, onSelect, selected,
}: {
  name: string
  price: string
  priceSuffix?: string
  tagline: string
  highlighted: boolean
  current: boolean
  onSelect: () => void
  selected: boolean
}) {
  return (
    <button
      onClick={onSelect}
      style={{
        padding: "24px 18px 20px",
        display: "flex", flexDirection: "column", alignItems: "center",
        textAlign: "center", cursor: "pointer",
        background: highlighted ? "linear-gradient(180deg, rgba(225,29,72,0.06) 0%, transparent 80%)" : "transparent",
        border: "none",
        borderLeft: selected ? "2px solid #E11D48" : "1px solid var(--dash-border,rgba(183,191,217,0.15))",
        fontFamily: "inherit",
        transition: "background 0.15s",
        position: "relative",
      }}
    >
      {highlighted && (
        <span style={{
          position: "absolute", top: 10, right: 10,
          fontSize: "var(--text-2xs)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
          padding: "3px 7px", borderRadius: 99,
          background: "linear-gradient(135deg, #E11D48, #9333EA)", color: "#fff",
        }}>Populaire</span>
      )}
      {current && (
        <span style={{
          position: "absolute", top: 10, left: 10,
          fontSize: "var(--text-2xs)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
          padding: "3px 7px", borderRadius: 99,
          background: "rgba(22,101,52,0.1)", color: "#15803d",
          border: "1px solid rgba(22,101,52,0.2)",
        }}>Actuel</span>
      )}
      <div style={{ fontSize: "var(--text-md)", fontWeight: 700, color: "var(--dash-text,#121317)", marginTop: highlighted || current ? 14 : 0, marginBottom: 6 }}>{name}</div>
      <div style={{ fontSize: "var(--text-lg)", fontWeight: 800, color: "var(--dash-text,#121317)", lineHeight: 1 }}>
        {price}
        {priceSuffix && <span style={{ fontSize: "var(--text-xs)", fontWeight: 500, color: "var(--dash-text-2,#6a6a71)", marginLeft: 4 }}>{priceSuffix}</span>}
      </div>
      <div style={{ fontSize: "var(--text-xs)", color: "var(--dash-text-2,#6a6a71)", marginTop: 6 }}>{tagline}</div>
    </button>
  )
}

function Cell({ value, highlighted = false }: { value: boolean | string; highlighted?: boolean }) {
  const isBool = typeof value === "boolean"
  const yes = isBool && value === true
  const no  = isBool && value === false
  return (
    <div style={{
      padding: "14px 20px",
      textAlign: "center",
      fontSize: "var(--text-sm)",
      background: highlighted ? "rgba(225,29,72,0.03)" : "transparent",
      borderLeft: "1px solid var(--dash-border,rgba(183,191,217,0.12))",
    }}>
      {yes && (
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: "50%", background: "rgba(22,101,52,0.1)", color: "#15803d" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </span>
      )}
      {no && (
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: "50%", background: "var(--dash-faint-2,rgba(183,191,217,0.15))", color: "var(--dash-text-3,#9a9aaa)" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </span>
      )}
      {!isBool && (
        <span style={{ fontWeight: 600, color: "var(--dash-text,#121317)" }}>{value as string}</span>
      )}
    </div>
  )
}

function FooterCell({
  label, href, variant, disabled, disabledLabel,
}: {
  label: string
  href: string
  variant: "ghost" | "primary" | "outline"
  disabled: boolean
  disabledLabel: string
}) {
  if (disabled) {
    return (
      <div style={{
        padding: "18px 20px", textAlign: "center",
        background: "var(--dash-faint,rgba(183,191,217,0.06))",
        borderLeft: "1px solid var(--dash-border,rgba(183,191,217,0.12))",
      }}>
        <span style={{
          display: "inline-block",
          padding: "10px 20px",
          borderRadius: 10,
          fontSize: "var(--text-sm)", fontWeight: 600,
          color: "var(--dash-text-2,#6a6a71)",
          background: "transparent",
          border: "1px dashed var(--dash-border,rgba(183,191,217,0.3))",
        }}>
          ✓ {disabledLabel}
        </span>
      </div>
    )
  }
  const styles: Record<typeof variant, React.CSSProperties> = {
    ghost: {
      display: "inline-block", padding: "10px 20px", borderRadius: 10,
      fontSize: "var(--text-sm)", fontWeight: 600,
      color: "var(--dash-text,#121317)",
      background: "transparent",
      border: "1px solid var(--dash-border,rgba(183,191,217,0.4))",
      textDecoration: "none",
    },
    primary: {
      display: "inline-block", padding: "10px 22px", borderRadius: 10,
      fontSize: "var(--text-sm)", fontWeight: 700,
      color: "#fff",
      background: "linear-gradient(135deg, #E11D48, #9333EA)",
      boxShadow: "0 6px 20px color-mix(in srgb, var(--g1,#E11D48) 30%, transparent)",
      textDecoration: "none",
    },
    outline: {
      display: "inline-block", padding: "10px 20px", borderRadius: 10,
      fontSize: "var(--text-sm)", fontWeight: 600,
      color: "var(--dash-text,#121317)",
      background: "transparent",
      border: "1.5px solid var(--dash-text,#121317)",
      textDecoration: "none",
    },
  }
  return (
    <div style={{
      padding: "18px 20px", textAlign: "center",
      borderLeft: "1px solid var(--dash-border,rgba(183,191,217,0.12))",
    }}>
      <a href={href} style={styles[variant]}>{label}</a>
    </div>
  )
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const kickerStyle: React.CSSProperties = {
  fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: "0.14em",
  textTransform: "uppercase", color: "#E11D48", margin: "0 0 10px",
}

const h1Style: React.CSSProperties = {
  fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
  fontWeight: 700,
  color: "var(--dash-text,#121317)",
  letterSpacing: "-0.025em",
  lineHeight: 1.15,
  margin: "0 0 14px",
}

const noticeStyle: React.CSSProperties = {
  marginTop: 20,
  padding: "12px 18px",
  background: "rgba(234,179,8,0.08)",
  border: "1px solid rgba(234,179,8,0.2)",
  borderRadius: 12,
  fontSize: "var(--text-sm)",
  color: "var(--dash-text,#121317)",
  display: "inline-block",
}

const gridHeaderStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.6fr 1fr 1fr 1fr",
  borderBottom: "1px solid var(--dash-border,rgba(183,191,217,0.22))",
}

const gridRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.6fr 1fr 1fr 1fr",
  alignItems: "center",
  borderBottom: "1px solid var(--dash-border,rgba(183,191,217,0.1))",
}

const gridFooterStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.6fr 1fr 1fr 1fr",
  borderTop: "1px solid var(--dash-border,rgba(183,191,217,0.22))",
  background: "var(--dash-faint,rgba(183,191,217,0.04))",
}

const infoCardStyle: React.CSSProperties = {
  padding: "18px 18px",
  background: "var(--dash-surface,#fff)",
  border: "1px solid var(--dash-border,rgba(183,191,217,0.22))",
  borderRadius: 14,
}
