"use client"
/**
 * PackagesEditor — gestion des formules d'un prestataire.
 *
 * - GET    /api/vendor/packages          → liste
 * - POST   /api/vendor/packages          → créer
 * - PATCH  /api/vendor/packages/[id]     → éditer
 * - DELETE /api/vendor/packages/[id]     → supprimer
 *
 * Best practice suggérée : 3 tiers Essentiel / Premium / Signature.
 * On propose des templates 1-clic pour démarrer rapidement.
 */
import { useEffect, useState } from "react"

type Package = {
  id: string
  name: string
  description: string | null
  price: number
  duration: string | null
  includes: string | null
  maxGuests: number | null
  available: boolean
}

type Draft = {
  id: string | null // null = création
  name: string
  description: string
  price: string
  duration: string
  includes: string
  maxGuests: string
  available: boolean
}

const EMPTY: Draft = {
  id: null, name: "", description: "", price: "",
  duration: "", includes: "", maxGuests: "", available: true,
}

const TEMPLATES: Array<{ tier: string; draft: Omit<Draft, "id"> }> = [
  {
    tier: "Essentiel",
    draft: {
      name: "Essentiel", description: "Formule de base pour un événement intimiste.",
      price: "3000", duration: "4h",
      includes: "• Prestation 4h\n• Déplacement local\n• Livrables de base",
      maxGuests: "50", available: true,
    },
  },
  {
    tier: "Premium",
    draft: {
      name: "Premium", description: "Formule recommandée — le meilleur rapport qualité/prix.",
      price: "6500", duration: "8h",
      includes: "• Prestation 8h\n• Déplacement Maroc\n• Livrables HD\n• 1 révision incluse",
      maxGuests: "150", available: true,
    },
  },
  {
    tier: "Signature",
    draft: {
      name: "Signature", description: "Formule haut de gamme tout inclus.",
      price: "12000", duration: "Journée complète",
      includes: "• Prestation journée\n• Déplacement international\n• Livrables premium\n• Révisions illimitées\n• Support prioritaire",
      maxGuests: "300", available: true,
    },
  },
]

export default function PackagesEditor() {
  const [packages, setPackages] = useState<Package[] | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)
  const [draft,    setDraft]    = useState<Draft | null>(null)
  const [saving,   setSaving]   = useState(false)

  async function reload() {
    setLoading(true)
    try {
      const res = await fetch("/api/vendor/packages")
      if (!res.ok) throw new Error((await res.json()).error ?? "Erreur")
      const data = await res.json()
      setPackages(data.packages ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { reload() }, [])

  function startEdit(p: Package) {
    setDraft({
      id: p.id,
      name: p.name,
      description: p.description ?? "",
      price: String(p.price),
      duration: p.duration ?? "",
      includes: p.includes ?? "",
      maxGuests: p.maxGuests != null ? String(p.maxGuests) : "",
      available: p.available,
    })
  }

  function startCreate(template?: typeof TEMPLATES[number]) {
    setDraft(template ? { id: null, ...template.draft } : { ...EMPTY })
  }

  async function save() {
    if (!draft) return
    setSaving(true)
    setError(null)
    try {
      const body = {
        name: draft.name.trim(),
        description: draft.description.trim() || null,
        price: Number(draft.price),
        duration: draft.duration.trim() || null,
        includes: draft.includes.trim() || null,
        maxGuests: draft.maxGuests ? Number(draft.maxGuests) : null,
        available: draft.available,
      }
      if (!body.name) throw new Error("Le nom est requis.")
      if (!Number.isFinite(body.price) || body.price < 0) throw new Error("Prix invalide.")

      const url = draft.id ? `/api/vendor/packages/${draft.id}` : "/api/vendor/packages"
      const method = draft.id ? "PATCH" : "POST"
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? "Erreur sauvegarde")
      setDraft(null)
      await reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur")
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    if (!confirm("Supprimer ce package ?")) return
    try {
      const res = await fetch(`/api/vendor/packages/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error((await res.json()).error ?? "Erreur")
      await reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur")
    }
  }

  async function toggleAvailable(p: Package) {
    // optimistic
    setPackages(prev => prev?.map(x => x.id === p.id ? { ...x, available: !x.available } : x) ?? null)
    try {
      const res = await fetch(`/api/vendor/packages/${p.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: !p.available }),
      })
      if (!res.ok) throw new Error()
    } catch {
      await reload()
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <header style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "#121317", margin: 0 }}>Packages & tarifs</h1>
          <p style={{ fontSize: "var(--text-sm)", color: "#6b7280", margin: "4px 0 0" }}>
            Proposez 2 à 3 formules claires — les clients choisissent plus vite et mieux.
          </p>
        </div>
        {packages && packages.length < 10 && (
          <button
            onClick={() => startCreate()}
            style={{
              padding: "9px 18px", borderRadius: 8, fontSize: "var(--text-sm)", fontWeight: 700,
              background: "linear-gradient(135deg,#E11D48,#9333EA)",
              color: "#fff", border: "none", cursor: "pointer", fontFamily: "inherit",
            }}
          >
            + Nouveau package
          </button>
        )}
      </header>

      {/* Templates 1-clic si aucun package */}
      {packages && packages.length === 0 && !draft && (
        <div style={{
          background: "#fff", borderRadius: 14, padding: 20, marginBottom: 16,
          border: "1px solid rgba(183,191,217,0.18)",
        }}>
          <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "#121317", marginBottom: 4 }}>
            Démarrer avec un modèle
          </div>
          <p style={{ fontSize: "var(--text-xs)", color: "#6b7280", margin: "0 0 14px" }}>
            Les prestataires avec 3 formules (Essentiel / Premium / Signature) reçoivent 2× plus de demandes qualifiées.
            Adaptez ensuite les prix à votre marché.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
            {TEMPLATES.map(t => (
              <button
                key={t.tier}
                onClick={() => startCreate(t)}
                style={{
                  padding: 14, borderRadius: 10, textAlign: "left",
                  background: "#fafbfd", border: "1px solid rgba(183,191,217,0.25)",
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "#121317" }}>{t.tier}</div>
                <div style={{ fontSize: "var(--text-xs)", color: "#6b7280", marginTop: 3 }}>
                  {t.draft.price} Dhs · {t.draft.duration}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div style={{
          padding: "10px 14px", borderRadius: 10, marginBottom: 12,
          background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)",
          color: "#991B1B", fontSize: "var(--text-sm)",
        }}>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && <div style={{ padding: 40, textAlign: "center", color: "#9a9aaa", fontSize: "var(--text-sm)" }}>Chargement…</div>}

      {/* Liste des packages */}
      {packages && packages.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          {packages.map(p => (
            <div
              key={p.id}
              style={{
                background: "#fff", borderRadius: 14,
                border: "1px solid rgba(183,191,217,0.18)",
                padding: 18,
                opacity: p.available ? 1 : 0.55,
                display: "flex", flexDirection: "column",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "var(--text-base)", fontWeight: 700, color: "#121317" }}>{p.name}</div>
                  {p.duration && (
                    <div style={{ fontSize: "var(--text-xs)", color: "#6b7280", marginTop: 2 }}>{p.duration}</div>
                  )}
                </div>
                <button
                  onClick={() => toggleAvailable(p)}
                  title={p.available ? "Désactiver" : "Activer"}
                  style={{
                    padding: "3px 8px", borderRadius: 99, fontSize: "var(--text-2xs)", fontWeight: 700,
                    background: p.available ? "rgba(34,197,94,0.12)" : "rgba(107,114,128,0.12)",
                    color: p.available ? "#166534" : "#6b7280",
                    border: "none", cursor: "pointer", fontFamily: "inherit",
                    textTransform: "uppercase", letterSpacing: "0.05em",
                  }}
                >
                  {p.available ? "Actif" : "Masqué"}
                </button>
              </div>

              <div style={{ fontSize: "var(--text-lg)", fontWeight: 800, color: "#121317", margin: "10px 0 6px" }}>
                {p.price.toLocaleString("fr-MA")} <span style={{ fontSize: "var(--text-xs)", color: "#6b7280", fontWeight: 500 }}>Dhs</span>
              </div>

              {p.description && (
                <p style={{ fontSize: "var(--text-sm)", color: "#45474D", margin: "0 0 10px", lineHeight: 1.5 }}>
                  {p.description}
                </p>
              )}

              {p.includes && (
                <div style={{
                  fontSize: "var(--text-xs)", color: "#45474D", whiteSpace: "pre-line", lineHeight: 1.6,
                  marginBottom: 10,
                }}>
                  {p.includes}
                </div>
              )}

              {p.maxGuests != null && (
                <div style={{ fontSize: "var(--text-xs)", color: "#6b7280", marginBottom: 10 }}>
                  Jusqu&apos;à {p.maxGuests} invités
                </div>
              )}

              <div style={{ display: "flex", gap: 6, marginTop: "auto" }}>
                <button
                  onClick={() => startEdit(p)}
                  style={{
                    flex: 1, padding: "7px 10px", borderRadius: 8, fontSize: "var(--text-xs)", fontWeight: 600,
                    background: "#fff", color: "#45474D",
                    border: "1px solid rgba(183,191,217,0.3)",
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  Modifier
                </button>
                <button
                  onClick={() => remove(p.id)}
                  style={{
                    padding: "7px 10px", borderRadius: 8, fontSize: "var(--text-xs)", fontWeight: 600,
                    background: "rgba(239,68,68,0.06)", color: "#991B1B",
                    border: "1px solid rgba(239,68,68,0.2)",
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor modal */}
      {draft && (
        <DraftEditor
          draft={draft}
          setDraft={setDraft}
          onCancel={() => setDraft(null)}
          onSave={save}
          saving={saving}
        />
      )}
    </div>
  )
}

// ── Modal d'édition ──────────────────────────────────────────────────────────
function DraftEditor({
  draft, setDraft, onCancel, onSave, saving,
}: {
  draft: Draft
  setDraft: (d: Draft) => void
  onCancel: () => void
  onSave: () => void
  saving: boolean
}) {
  const isNew = !draft.id
  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(11,13,18,0.55)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 560, maxHeight: "90vh", overflow: "auto",
          background: "#fff", borderRadius: 16, padding: 24,
          boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: "var(--text-md)", fontWeight: 700, margin: 0, color: "#121317" }}>
            {isNew ? "Nouveau package" : "Modifier le package"}
          </h2>
          <button onClick={onCancel} style={{
            background: "none", border: "none", fontSize: "var(--text-lg)", cursor: "pointer",
            color: "#9a9aaa", padding: 0, lineHeight: 1,
          }}>×</button>
        </div>

        <Field label="Nom du package *">
          <input
            value={draft.name}
            onChange={e => setDraft({ ...draft, name: e.target.value })}
            placeholder="Ex : Premium"
            style={inputStyle}
          />
        </Field>

        <Field label="Description courte">
          <textarea
            value={draft.description}
            onChange={e => setDraft({ ...draft, description: e.target.value })}
            rows={2}
            placeholder="Une phrase qui résume la formule"
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Prix (Dhs) *">
            <input
              type="number" inputMode="decimal" min="0"
              value={draft.price}
              onChange={e => setDraft({ ...draft, price: e.target.value })}
              placeholder="6500"
              style={inputStyle}
            />
          </Field>
          <Field label="Durée">
            <input
              value={draft.duration}
              onChange={e => setDraft({ ...draft, duration: e.target.value })}
              placeholder="Ex : 8h ou Journée complète"
              style={inputStyle}
            />
          </Field>
        </div>

        <Field label="Inclus (une ligne par élément)">
          <textarea
            value={draft.includes}
            onChange={e => setDraft({ ...draft, includes: e.target.value })}
            rows={5}
            placeholder={"• Prestation 8h\n• Déplacement\n• Livrables HD"}
            style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
          />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, alignItems: "center" }}>
          <Field label="Invités max">
            <input
              type="number" inputMode="numeric" min="0"
              value={draft.maxGuests}
              onChange={e => setDraft({ ...draft, maxGuests: e.target.value })}
              placeholder="Optionnel"
              style={inputStyle}
            />
          </Field>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--text-sm)", color: "#45474D", marginTop: 20 }}>
            <input
              type="checkbox"
              checked={draft.available}
              onChange={e => setDraft({ ...draft, available: e.target.checked })}
            />
            Visible sur la fiche publique
          </label>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
          <button
            onClick={onCancel}
            disabled={saving}
            style={{
              padding: "9px 16px", borderRadius: 8, fontSize: "var(--text-sm)", fontWeight: 600,
              background: "#fff", color: "#45474D",
              border: "1px solid rgba(183,191,217,0.3)",
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Annuler
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            style={{
              padding: "9px 18px", borderRadius: 8, fontSize: "var(--text-sm)", fontWeight: 700,
              background: saving ? "#d1d5db" : "linear-gradient(135deg,#E11D48,#9333EA)",
              color: "#fff", border: "none",
              cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit",
            }}
          >
            {saving ? "Enregistrement…" : isNew ? "Créer" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: "1px solid rgba(183,191,217,0.3)",
  fontSize: "var(--text-sm)", fontFamily: "inherit", background: "#fff", color: "#121317",
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 600, color: "#6b7280", marginBottom: 4 }}>
        {label}
      </label>
      {children}
    </div>
  )
}
