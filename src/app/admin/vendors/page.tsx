"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"

type AdminVendor = {
  id:        string
  slug:      string
  name:      string
  category:  string
  city:      string | null
  rating:    number | null
  verified:  boolean
  featured:  boolean
  phone:     string | null
  email:     string | null
  instagram: string | null
  priceMin:  number | null
  priceMax:  number | null
  _count:    { media: number; reviews: number }
}

const C = {
  bg:         "#0b0b10",
  panel:      "#15161d",
  panelHover: "#1c1d27",
  border:     "#252633",
  borderSoft: "rgba(255,255,255,0.06)",
  text:       "#f0f0f5",
  textMuted:  "#9a9aaa",
  textDim:    "#6a6a78",
  accent:     "#9333EA",
  accent2:    "#E11D48",
  ok:         "#22c55e",
  warn:       "#f59e0b",
  err:        "#ef4444",
  star:       "#facc15",
}

export default function AdminVendorsPage() {
  const [vendors, setVendors]       = useState<AdminVendor[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [limit]                     = useState(50)
  const [q, setQ]                   = useState("")
  const [cat, setCat]               = useState("")
  const [loading, setLoading]       = useState(true)
  const [err, setErr]               = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true); setErr(null)
    try {
      const url = new URL("/api/admin/vendors", window.location.origin)
      url.searchParams.set("page",  String(page))
      url.searchParams.set("limit", String(limit))
      if (q.trim()) url.searchParams.set("q",   q.trim())
      if (cat)      url.searchParams.set("cat", cat)
      const r = await fetch(url.toString(), { cache: "no-store" })
      if (!r.ok) throw new Error((await r.json()).error ?? "Erreur chargement.")
      const data = await r.json()
      setVendors(data.vendors ?? [])
      setTotal(data.total ?? 0)
      setCategories(data.categories ?? [])
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur inconnue.")
    } finally {
      setLoading(false)
    }
  }, [page, limit, q, cat])

  useEffect(() => { load() }, [load])

  // Debounce search
  const [qInput, setQInput] = useState("")
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); setQ(qInput) }, 350)
    return () => clearTimeout(t)
  }, [qInput])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      padding: "32px 24px",
    }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
              Prestataires
            </h1>
            <p style={{ fontSize: 13, color: C.textMuted, margin: 0 }}>
              {total} résultat{total > 1 ? "s" : ""} · page {page}/{totalPages}
            </p>
          </div>
          <Link href="/admin/users" style={{ fontSize: 13, color: C.textMuted, textDecoration: "none" }}>
            Users →
          </Link>
        </div>

        {/* Filter bar */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <input
            value={qInput}
            onChange={e => setQInput(e.target.value)}
            placeholder="Rechercher nom, slug, ville…"
            style={{
              flex: 1, minWidth: 220, padding: "11px 14px", borderRadius: 10,
              background: C.panel, color: C.text, fontSize: 14,
              border: `1px solid ${C.border}`, outline: "none",
              fontFamily: "inherit",
            }}
          />
          <select
            value={cat}
            onChange={e => { setCat(e.target.value); setPage(1) }}
            style={{
              minWidth: 200, padding: "11px 14px", borderRadius: 10,
              background: C.panel, color: C.text, fontSize: 14,
              border: `1px solid ${C.border}`, outline: "none",
              fontFamily: "inherit", cursor: "pointer",
            }}
          >
            <option value="">Toutes catégories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {(qInput || cat) && (
            <button
              onClick={() => { setQInput(""); setCat(""); setPage(1) }}
              style={{
                padding: "11px 16px", borderRadius: 10,
                background: "transparent", color: C.accent2,
                border: `1px solid ${C.accent2}40`, fontSize: 13,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              ✕ Reset
            </button>
          )}
        </div>

        {/* Table */}
        <div style={{
          background: C.panel, borderRadius: 14,
          border: `1px solid ${C.border}`, overflow: "hidden",
        }}>
          {loading ? (
            <div style={{ padding: 60, textAlign: "center", color: C.textMuted, fontSize: 14 }}>Chargement…</div>
          ) : err ? (
            <div style={{ padding: 60, textAlign: "center", color: C.err, fontSize: 14 }}>{err}</div>
          ) : vendors.length === 0 ? (
            <div style={{ padding: 60, textAlign: "center", color: C.textMuted, fontSize: 14 }}>Aucun prestataire.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: C.panelHover, borderBottom: `1px solid ${C.border}` }}>
                    {["Prestataire", "Catégorie", "Ville", "Note", "Prix", "Médias", "Avis", "Contact", "Statut", ""].map(h => (
                      <th key={h} style={th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vendors.map(v => <VendorRow key={v.id} v={v} />)}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={pagBtn(page === 1)}>← Préc</button>
            <span style={{ padding: "8px 14px", fontSize: 13, color: C.textMuted }}>{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={pagBtn(page === totalPages)}>Suiv →</button>
          </div>
        )}
      </div>
    </div>
  )
}

function VendorRow({ v }: { v: AdminVendor }) {
  const price =
    v.priceMin && v.priceMax ? `${v.priceMin.toLocaleString("fr-FR")} – ${v.priceMax.toLocaleString("fr-FR")} MAD`
    : v.priceMin            ? `dès ${v.priceMin.toLocaleString("fr-FR")} MAD`
    : "—"

  return (
    <tr style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
      <td style={td}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontWeight: 600 }}>{v.name}</span>
          <span style={{ color: C.textDim, fontSize: 11 }}>{v.slug}</span>
        </div>
      </td>
      <td style={{ ...td, color: C.textMuted }}>{v.category}</td>
      <td style={{ ...td, color: C.textMuted }}>{v.city ?? "—"}</td>
      <td style={td}>
        {v.rating ? (
          <span style={{ color: C.star, fontWeight: 600 }}>★ {v.rating.toFixed(1)}</span>
        ) : <span style={{ color: C.textDim }}>—</span>}
      </td>
      <td style={{ ...td, color: C.textMuted, whiteSpace: "nowrap", fontSize: 12 }}>{price}</td>
      <td style={{ ...td, color: C.textMuted, textAlign: "center" }}>{v._count.media}</td>
      <td style={{ ...td, color: C.textMuted, textAlign: "center" }}>{v._count.reviews}</td>
      <td style={td}>
        <div style={{ display: "flex", gap: 6 }}>
          <span style={{ color: v.phone     ? C.ok : C.textDim, fontSize: 14 }} title={v.phone     ?? "Pas de téléphone"}>☎</span>
          <span style={{ color: v.email     ? C.ok : C.textDim, fontSize: 14 }} title={v.email     ?? "Pas d'email"}>✉</span>
          <span style={{ color: v.instagram ? C.ok : C.textDim, fontSize: 14 }} title={v.instagram ?? "Pas d'Instagram"}>📸</span>
        </div>
      </td>
      <td style={td}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {v.verified && <span style={badge("ok")}>✓ vérifié</span>}
          {v.featured && <span style={badge("accent")}>★ partenaire</span>}
          {!v.verified && !v.featured && <span style={{ color: C.textDim, fontSize: 11 }}>—</span>}
        </div>
      </td>
      <td style={{ ...td, textAlign: "right" }}>
        <Link href={`/admin/vendors/${v.slug}`} style={editBtn}>
          Éditer →
        </Link>
      </td>
    </tr>
  )
}

const th: React.CSSProperties = {
  textAlign: "left", padding: "12px 16px", fontWeight: 600, color: C.textMuted,
  fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em",
}
const td: React.CSSProperties = { padding: "12px 16px", verticalAlign: "middle" }
const pagBtn = (disabled: boolean): React.CSSProperties => ({
  background: C.panel, color: disabled ? C.textDim : C.text,
  border: `1px solid ${C.border}`, padding: "8px 14px", borderRadius: 8,
  fontSize: 13, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
  fontFamily: "inherit",
})
const editBtn: React.CSSProperties = {
  display: "inline-block", padding: "6px 12px", borderRadius: 8,
  background: `linear-gradient(135deg, ${C.accent2}, ${C.accent})`,
  color: "#fff", fontSize: 12, fontWeight: 600, textDecoration: "none",
  whiteSpace: "nowrap",
}
const badge = (variant: "ok" | "accent"): React.CSSProperties => {
  const color = variant === "ok" ? C.ok : C.star
  return {
    background: `${color}15`, color, fontSize: 10, fontWeight: 700,
    padding: "3px 8px", borderRadius: 99, whiteSpace: "nowrap",
    border: `1px solid ${color}30`,
  }
}
