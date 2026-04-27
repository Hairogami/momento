"use client"
/**
 * ProfileEditor — édition live du profil prestataire.
 *
 * - GET   /api/vendor/profile    → state initial
 * - PATCH /api/vendor/profile    → sauvegarde partielle (seuls les champs modifiés)
 * - GET   /api/vendor/completion → score + checklist (re-fetch après save)
 *
 * UX :
 *  - Score circulaire sticky en haut avec barre de progression
 *  - Sections ancrées (#description, #contact, #location, #prices, #social, #verify)
 *    pour que les CTAs de la checklist scrollent directement au bon champ
 *  - Dirty-tracking : le bouton Enregistrer ne s'active que si du change
 *  - Aperçu live → lien vers /vendor/[slug] (nouvel onglet)
 */
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"

type Vendor = {
  name: string
  slug: string
  category: string
  description: string | null
  city: string | null
  region: string | null
  address: string | null
  phone: string | null
  email: string | null
  website: string | null
  instagram: string | null
  facebook: string | null
  priceMin: number | null
  priceMax: number | null
  priceRange: string | null
  verified: boolean
  featured: boolean
}

type CompletionItem = {
  id: string
  label: string
  done: boolean
  weight: number
  cta: { label: string; href: string }
}

type Completion = {
  percent: number
  score: number
  maxScore: number
  itemsDone: number
  itemsTotal: number
  checklist: CompletionItem[]
}

const emptyVendor: Vendor = {
  name: "", slug: "", category: "", description: "",
  city: "", region: "", address: "",
  phone: "", email: "", website: "",
  instagram: "", facebook: "",
  priceMin: null, priceMax: null, priceRange: "",
  verified: false, featured: false,
}

// Normalise pour comparaison dirty
function norm(v: Vendor): Record<string, unknown> {
  return {
    name: v.name?.trim() ?? "",
    category: v.category?.trim() ?? "",
    description: (v.description ?? "").trim(),
    city: (v.city ?? "").trim(),
    region: (v.region ?? "").trim(),
    address: (v.address ?? "").trim(),
    phone: (v.phone ?? "").trim(),
    email: (v.email ?? "").trim(),
    website: (v.website ?? "").trim(),
    instagram: (v.instagram ?? "").trim(),
    facebook: (v.facebook ?? "").trim(),
    priceMin: v.priceMin,
    priceMax: v.priceMax,
    priceRange: (v.priceRange ?? "").trim(),
  }
}

export default function ProfileEditor() {
  const [vendor,     setVendor]     = useState<Vendor>(emptyVendor)
  const [original,   setOriginal]   = useState<Vendor>(emptyVendor)
  const [completion, setCompletion] = useState<Completion | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const [success,    setSuccess]    = useState<string | null>(null)

  async function loadAll() {
    setLoading(true)
    setError(null)
    try {
      const [pRes, cRes] = await Promise.all([
        fetch("/api/vendor/profile"),
        fetch("/api/vendor/completion"),
      ])
      if (!pRes.ok) throw new Error((await pRes.json()).error ?? "Profil introuvable")
      const pJson = await pRes.json()
      setVendor(pJson.vendor)
      setOriginal(pJson.vendor)
      if (cRes.ok) setCompletion(await cRes.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur")
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { loadAll() }, [])

  const dirty = useMemo(() => JSON.stringify(norm(vendor)) !== JSON.stringify(norm(original)), [vendor, original])

  async function save() {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      // On envoie tout le payload éditable — l'API ignore les undefined non passés
      const payload: Partial<Vendor> = {
        name: vendor.name.trim() || undefined,
        category: vendor.category.trim() || undefined,
        description: vendor.description,
        city: vendor.city,
        region: vendor.region,
        address: vendor.address,
        phone: vendor.phone,
        email: vendor.email,
        website: vendor.website,
        instagram: vendor.instagram,
        facebook: vendor.facebook,
        priceMin: vendor.priceMin,
        priceMax: vendor.priceMax,
        priceRange: vendor.priceRange,
      }
      const res = await fetch("/api/vendor/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? "Erreur sauvegarde")
      const data = await res.json()
      setVendor(data.vendor)
      setOriginal(data.vendor)
      setSuccess("Modifications enregistrées ✓")
      // Rafraîchit le score
      fetch("/api/vendor/completion").then(r => r.ok ? r.json() : null).then(c => c && setCompletion(c))
      setTimeout(() => setSuccess(null), 2500)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur")
    } finally {
      setSaving(false)
    }
  }

  // Reset
  function discard() {
    setVendor(original)
    setError(null)
    setSuccess(null)
  }

  const set = <K extends keyof Vendor>(k: K, v: Vendor[K]) => setVendor(s => ({ ...s, [k]: v }))

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center", color: "#9a9aaa", fontSize: "var(--text-sm)" }}>Chargement…</div>
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      {/* Header */}
      <header style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "#121317", margin: 0 }}>Mon profil</h1>
          <p style={{ fontSize: "var(--text-sm)", color: "#6b7280", margin: "4px 0 0" }}>
            Les informations visibles publiquement sur{" "}
            <Link href={`/vendor/${vendor.slug}`} target="_blank" style={{ color: "#E11D48", textDecoration: "none", fontWeight: 600 }}>
              /vendor/{vendor.slug} ↗
            </Link>
          </p>
        </div>
      </header>

      {/* Score sticky */}
      {completion && (
        <div style={{
          position: "sticky", top: 56, zIndex: 20,
          background: "rgba(247,247,251,0.92)", backdropFilter: "blur(8px)",
          padding: "10px 0", marginBottom: 16,
        }}>
          <ScoreHeader completion={completion} />
        </div>
      )}

      {/* Barre d'actions dirty/save */}
      {(dirty || success) && (
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "10px 14px", borderRadius: 10, marginBottom: 12,
          background: success ? "rgba(34,197,94,0.08)" : "rgba(245,158,11,0.08)",
          border: `1px solid ${success ? "rgba(34,197,94,0.25)" : "rgba(245,158,11,0.25)"}`,
        }}>
          <span style={{ fontSize: "var(--text-sm)", color: success ? "#166534" : "#B45309", fontWeight: 600 }}>
            {success ?? "Modifications non sauvegardées"}
          </span>
          {dirty && !success && (
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={discard}
                disabled={saving}
                style={{
                  padding: "7px 14px", borderRadius: 8, fontSize: "var(--text-xs)", fontWeight: 600,
                  background: "#fff", color: "#45474D",
                  border: "1px solid rgba(183,191,217,0.3)",
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Annuler
              </button>
              <button
                onClick={save}
                disabled={saving}
                style={{
                  padding: "7px 16px", borderRadius: 8, fontSize: "var(--text-xs)", fontWeight: 700,
                  background: saving ? "#d1d5db" : "linear-gradient(135deg,#E11D48,#9333EA)",
                  color: "#fff", border: "none",
                  cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit",
                }}
              >
                {saving ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div style={{
          padding: "10px 14px", borderRadius: 10, marginBottom: 12,
          background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)",
          color: "#991B1B", fontSize: "var(--text-sm)",
        }}>{error}</div>
      )}

      {/* Identité */}
      <Section title="Identité" icon="person">
        <Row>
          <Field label="Nom / Marque" col={2}>
            <input value={vendor.name} onChange={e => set("name", e.target.value)} style={inp} />
          </Field>
          <Field label="Catégorie">
            <input value={vendor.category} onChange={e => set("category", e.target.value)} style={inp} />
          </Field>
        </Row>
      </Section>

      {/* Description */}
      <Section id="description" title="Description" icon="description">
        <Field label="Votre histoire / ce qui vous rend unique">
          <textarea
            value={vendor.description ?? ""}
            onChange={e => set("description", e.target.value)}
            rows={6}
            placeholder="Décris ton activité, ton style, ton expérience… (100 caractères min pour valider le score)"
            style={{ ...inp, resize: "vertical", lineHeight: 1.5 }}
          />
          <div style={{ fontSize: "var(--text-xs)", color: "#9a9aaa", marginTop: 4, textAlign: "right" }}>
            {(vendor.description ?? "").length} caractères
            {(vendor.description ?? "").length < 100 && " (min. 100)"}
          </div>
        </Field>
      </Section>

      {/* Contact */}
      <Section id="contact" title="Contact" icon="call">
        <Row>
          <Field label="Téléphone">
            <input value={vendor.phone ?? ""} onChange={e => set("phone", e.target.value)} placeholder="+212 6 XX XX XX XX" style={inp} />
          </Field>
          <Field label="Email public">
            <input value={vendor.email ?? ""} onChange={e => set("email", e.target.value)} type="email" placeholder="contact@exemple.ma" style={inp} />
          </Field>
        </Row>
        <Field label="Site web">
          <input value={vendor.website ?? ""} onChange={e => set("website", e.target.value)} type="url" placeholder="https://…" style={inp} />
        </Field>
      </Section>

      {/* Localisation */}
      <Section id="location" title="Localisation" icon="location_on">
        <Row>
          <Field label="Ville">
            <input value={vendor.city ?? ""} onChange={e => set("city", e.target.value)} placeholder="Marrakech" style={inp} />
          </Field>
          <Field label="Région">
            <input value={vendor.region ?? ""} onChange={e => set("region", e.target.value)} placeholder="Marrakech-Safi" style={inp} />
          </Field>
        </Row>
        <Field label="Adresse (optionnel, visible publiquement)">
          <input value={vendor.address ?? ""} onChange={e => set("address", e.target.value)} style={inp} />
        </Field>
      </Section>

      {/* Prix */}
      <Section id="prices" title="Tarifs" icon="payments">
        <Row>
          <Field label="Prix min (Dhs)">
            <input
              type="number" inputMode="decimal" min="0"
              value={vendor.priceMin ?? ""}
              onChange={e => set("priceMin", e.target.value === "" ? null : Number(e.target.value))}
              style={inp}
            />
          </Field>
          <Field label="Prix max (Dhs)">
            <input
              type="number" inputMode="decimal" min="0"
              value={vendor.priceMax ?? ""}
              onChange={e => set("priceMax", e.target.value === "" ? null : Number(e.target.value))}
              style={inp}
            />
          </Field>
          <Field label="Gamme">
            <select
              value={vendor.priceRange ?? ""}
              onChange={e => set("priceRange", e.target.value)}
              style={inp}
            >
              <option value="">—</option>
              <option value="budget">Budget</option>
              <option value="mid">Milieu de gamme</option>
              <option value="premium">Premium</option>
            </select>
          </Field>
        </Row>
        <p style={{ fontSize: "var(--text-xs)", color: "#9a9aaa", marginTop: -4 }}>
          Renseignez au moins la gamme OU une fourchette pour valider le score.
        </p>
      </Section>

      {/* Réseaux */}
      <Section id="social" title="Réseaux sociaux" icon="share">
        <Row>
          <Field label="Instagram (@handle ou URL)">
            <input value={vendor.instagram ?? ""} onChange={e => set("instagram", e.target.value)} placeholder="@tonhandle ou https://instagram.com/…" style={inp} />
          </Field>
          <Field label="Facebook (URL)">
            <input value={vendor.facebook ?? ""} onChange={e => set("facebook", e.target.value)} placeholder="https://facebook.com/…" style={inp} />
          </Field>
        </Row>
      </Section>

      {/* Photos — Phase 2 (placeholder pour cibler l'ancre #photos) */}
      <Section id="photos" title="Galerie photos" icon="photo_library">
        <div style={{
          padding: 14, borderRadius: 10,
          background: "linear-gradient(135deg,#fdf2f8,#faf5ff)",
          border: "1px solid rgba(233,213,255,0.5)",
          fontSize: "var(--text-sm)", color: "#45474D",
          display: "flex", gap: 12, alignItems: "flex-start",
        }}>
          <span style={{ fontSize: "var(--text-lg)", lineHeight: 1 }}>📸</span>
          <div>
            <div style={{ fontWeight: 600, color: "#121317", marginBottom: 4 }}>Upload de photos : bientôt</div>
            <div>
              En attendant, ajoute quelques photos sur ton Instagram ou Facebook puis connecte-les
              dans la section <a href="#social" style={{ color: "#E11D48", textDecoration: "none", fontWeight: 500 }}>Réseaux sociaux</a>
              &nbsp;— elles apparaîtront sur ta fiche publique.
            </div>
          </div>
        </div>
      </Section>

      {/* Vérification */}
      <Section id="verify" title="Badge Vérifié" icon="verified">
        <div style={{
          padding: 12, borderRadius: 10,
          background: vendor.verified ? "rgba(34,197,94,0.08)" : "#fafbfd",
          border: `1px solid ${vendor.verified ? "rgba(34,197,94,0.25)" : "rgba(183,191,217,0.18)"}`,
          fontSize: "var(--text-sm)",
          color: vendor.verified ? "#166534" : "#45474D",
        }}>
          {vendor.verified
            ? "Votre compte est vérifié. Le badge est visible sur votre fiche publique."
            : "Non vérifié. Pour obtenir le badge, l'équipe Momento confirme votre Instagram/Facebook et votre activité. Contactez-nous via l'email de contact."}
        </div>
      </Section>

      {/* Checklist complétude en bas */}
      {completion && completion.checklist.length > 0 && (
        <Section title="Checklist de complétude" icon="checklist">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 10 }}>
            {completion.checklist.map(item => (
              <div key={item.id} style={{
                padding: 12, borderRadius: 10,
                background: item.done ? "rgba(34,197,94,0.06)" : "#fafbfd",
                border: `1px solid ${item.done ? "rgba(34,197,94,0.2)" : "rgba(183,191,217,0.18)"}`,
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: item.done ? "#166534" : "#d1d5db",
                  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "var(--text-sm)", fontWeight: 800, flexShrink: 0,
                }}>
                  {item.done ? "✓" : ""}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "#121317" }}>{item.label}</div>
                  <div style={{ fontSize: "var(--text-xs)", color: "#6b7280" }}>+{item.weight} pts</div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
//   UI primitives
// ═══════════════════════════════════════════════════════════════════════════

function ScoreHeader({ completion }: { completion: Completion }) {
  const pct = completion.percent
  const color = pct >= 80 ? "#166534" : pct >= 50 ? "#B45309" : "#991B1B"
  return (
    <div style={{
      background: "#fff", borderRadius: 12, padding: 14,
      border: "1px solid rgba(183,191,217,0.18)",
      display: "flex", alignItems: "center", gap: 14,
    }}>
      {/* Circular */}
      <div style={{ position: "relative", width: 56, height: 56, flexShrink: 0 }}>
        <svg width={56} height={56} viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="16" fill="none" stroke="#f0f1f6" strokeWidth="4" />
          <circle
            cx="20" cy="20" r="16" fill="none"
            stroke={color} strokeWidth="4" strokeLinecap="round"
            strokeDasharray={`${(pct / 100) * 2 * Math.PI * 16} ${2 * Math.PI * 16}`}
            transform="rotate(-90 20 20)"
            style={{ transition: "stroke-dasharray 400ms ease" }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          alignItems: "center", justifyContent: "center",
          fontSize: "var(--text-sm)", fontWeight: 800, color,
        }}>{pct}</div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "#121317" }}>
          Complétude du profil
        </div>
        <div style={{ fontSize: "var(--text-xs)", color: "#6b7280" }}>
          {completion.itemsDone}/{completion.itemsTotal} éléments validés · {completion.score}/{completion.maxScore} points
        </div>
      </div>
    </div>
  )
}

function Section({ id, title, icon, children }: {
  id?: string
  title: string
  icon?: string
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      style={{
        background: "#fff", borderRadius: 14, padding: 18,
        border: "1px solid rgba(183,191,217,0.18)",
        marginBottom: 14, scrollMarginTop: 120,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        {icon && (
          <span style={{
            fontFamily: "'Google Symbols','Material Symbols Outlined'",
            fontSize: "var(--text-md)", color: "#9333EA",
          }}>{icon}</span>
        )}
        <h2 style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "#121317", margin: 0 }}>{title}</h2>
      </div>
      {children}
    </section>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 10 }}>
      {children}
    </div>
  )
}

function Field({ label, children, col }: {
  label: string
  children: React.ReactNode
  col?: number
}) {
  return (
    <div style={{ gridColumn: col ? `span ${col}` : undefined, marginBottom: 10 }}>
      <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 600, color: "#6b7280", marginBottom: 4 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const inp: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: "1px solid rgba(183,191,217,0.3)",
  fontSize: "var(--text-sm)", fontFamily: "inherit", background: "#fff", color: "#121317",
}
