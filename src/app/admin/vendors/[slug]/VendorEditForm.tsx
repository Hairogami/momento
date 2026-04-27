"use client"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

const C = {
  bg:        "#0b0b10",
  panel:     "#15161d",
  panel2:    "#1c1d27",
  border:    "#252633",
  text:      "#f0f0f5",
  textMuted: "#9a9aaa",
  textDim:   "#6a6a78",
  accent:    "#9333EA",
  accent2:   "#E11D48",
  ok:        "#22c55e",
  err:       "#ef4444",
}

type VendorFormData = {
  id: string
  slug: string
  name: string
  category: string
  description: string | null
  city: string | null
  region: string | null
  address: string | null
  priceMin: number | null
  priceMax: number | null
  priceRange: string | null
  phone: string | null
  email: string | null
  website: string | null
  instagram: string | null
  facebook: string | null
  rating: number | null
  verified: boolean
  featured: boolean
}

export default function VendorEditForm({ vendor }: { vendor: VendorFormData }) {
  const router = useRouter()
  const [form, setForm]     = useState(vendor)
  const [isPending, start]  = useTransition()
  const [status, setStatus] = useState<{ type: "idle" | "ok" | "error"; msg?: string }>({ type: "idle" })

  function update<K extends keyof VendorFormData>(key: K, value: VendorFormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus({ type: "idle" })
    start(async () => {
      const res = await fetch(`/api/admin/vendors/${vendor.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Erreur inconnue" }))
        setStatus({ type: "error", msg: data.error ?? "Sauvegarde échouée" })
        return
      }
      setStatus({ type: "ok", msg: "Modifications enregistrées" })
      router.refresh()
    })
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Section title="Identité">
        <Grid>
          <Field label="Nom">
            <input type="text" value={form.name} onChange={e => update("name", e.target.value)} style={inputStyle} required />
          </Field>
          <Field label="Catégorie">
            <input type="text" value={form.category} onChange={e => update("category", e.target.value)} style={inputStyle} required />
          </Field>
        </Grid>
        <Field label="Description">
          <textarea
            value={form.description ?? ""}
            onChange={e => update("description", e.target.value || null)}
            rows={4}
            style={{ ...inputStyle, resize: "vertical", minHeight: 100, padding: 10, height: "auto" }}
          />
        </Field>
      </Section>

      <Section title="Localisation">
        <Grid>
          <Field label="Ville">
            <input type="text" value={form.city ?? ""} onChange={e => update("city", e.target.value || null)} style={inputStyle} />
          </Field>
          <Field label="Région">
            <input type="text" value={form.region ?? ""} onChange={e => update("region", e.target.value || null)} style={inputStyle} />
          </Field>
        </Grid>
        <Field label="Adresse">
          <input type="text" value={form.address ?? ""} onChange={e => update("address", e.target.value || null)} style={inputStyle} />
        </Field>
      </Section>

      <Section title="Contact">
        <Grid>
          <Field label="Téléphone">
            <input type="text" value={form.phone ?? ""} onChange={e => update("phone", e.target.value || null)} style={inputStyle} />
          </Field>
          <Field label="Email">
            <input type="email" value={form.email ?? ""} onChange={e => update("email", e.target.value || null)} style={inputStyle} />
          </Field>
          <Field label="Site web">
            <input type="url" value={form.website ?? ""} onChange={e => update("website", e.target.value || null)} style={inputStyle} />
          </Field>
          <Field label="Instagram">
            <input type="text" value={form.instagram ?? ""} onChange={e => update("instagram", e.target.value || null)} style={inputStyle} placeholder="handle ou URL" />
          </Field>
          <Field label="Facebook">
            <input type="text" value={form.facebook ?? ""} onChange={e => update("facebook", e.target.value || null)} style={inputStyle} placeholder="handle ou URL" />
          </Field>
        </Grid>
      </Section>

      <Section title="Tarifs">
        <Grid>
          <Field label="Prix min (Dhs)">
            <input type="number" value={form.priceMin ?? ""} onChange={e => update("priceMin", e.target.value ? Number(e.target.value) : null)} style={inputStyle} />
          </Field>
          <Field label="Prix max (Dhs)">
            <input type="number" value={form.priceMax ?? ""} onChange={e => update("priceMax", e.target.value ? Number(e.target.value) : null)} style={inputStyle} />
          </Field>
          <Field label="Fourchette">
            <select value={form.priceRange ?? ""} onChange={e => update("priceRange", e.target.value || null)} style={inputStyle}>
              <option value="">—</option>
              <option value="budget">Budget</option>
              <option value="mid">Milieu de gamme</option>
              <option value="premium">Premium</option>
              <option value="luxury">Luxe</option>
            </select>
          </Field>
        </Grid>
      </Section>

      <Section title="Statut">
        <Grid>
          <Field label="Note (0-5)">
            <input type="number" step="0.1" min="0" max="5" value={form.rating ?? ""} onChange={e => update("rating", e.target.value ? Number(e.target.value) : null)} style={inputStyle} />
          </Field>
          <Field label="Vérifié">
            <label style={{ display: "flex", alignItems: "center", gap: 8, height: 38 }}>
              <input type="checkbox" checked={form.verified} onChange={e => update("verified", e.target.checked)} style={{ accentColor: C.accent }} />
              <span style={{ fontSize: "var(--text-sm)", color: C.textMuted }}>Badge ✓ affiché</span>
            </label>
          </Field>
          <Field label="Mis en avant">
            <label style={{ display: "flex", alignItems: "center", gap: 8, height: 38 }}>
              <input type="checkbox" checked={form.featured} onChange={e => update("featured", e.target.checked)} style={{ accentColor: C.accent }} />
              <span style={{ fontSize: "var(--text-sm)", color: C.textMuted }}>Page d&apos;accueil</span>
            </label>
          </Field>
        </Grid>
      </Section>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 8 }}>
        <button
          type="submit"
          disabled={isPending}
          style={{
            padding: "10px 24px", borderRadius: 10,
            background: isPending ? C.textDim : `linear-gradient(135deg, ${C.accent2}, ${C.accent})`,
            color: "#fff", border: "none", fontSize: "var(--text-sm)", fontWeight: 600,
            cursor: isPending ? "wait" : "pointer", fontFamily: "inherit",
          }}
        >
          {isPending ? "Sauvegarde…" : "Enregistrer"}
        </button>
        {status.type === "ok" && (
          <span style={{ fontSize: "var(--text-xs)", color: C.ok }}>✓ {status.msg}</span>
        )}
        {status.type === "error" && (
          <span style={{ fontSize: "var(--text-xs)", color: C.err }}>✕ {status.msg}</span>
        )}
      </div>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{
      background: C.panel, padding: "20px 22px", borderRadius: 14,
      border: `1px solid ${C.border}`,
    }}>
      <h3 style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: C.text, marginBottom: 16, marginTop: 0, letterSpacing: "0.02em", textTransform: "uppercase" }}>
        {title}
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>{children}</div>
    </section>
  )
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </span>
      {children}
    </label>
  )
}

const inputStyle: React.CSSProperties = {
  height: 38, padding: "0 12px", borderRadius: 10,
  border: `1px solid ${C.border}`, background: C.bg,
  fontSize: "var(--text-sm)", color: C.text, outline: "none", fontFamily: "inherit",
  boxSizing: "border-box", width: "100%",
}
