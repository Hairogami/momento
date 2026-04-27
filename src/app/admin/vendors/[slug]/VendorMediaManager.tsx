"use client"

import { useRef, useState } from "react"
import { captureError } from "@/lib/observability"

const C = {
  bg:         "#0b0b10",
  panel:      "#15161d",
  panel2:     "#1c1d27",
  border:     "#252633",
  borderSoft: "rgba(255,255,255,0.08)",
  text:       "#f0f0f5",
  textMuted:  "#9a9aaa",
  textDim:    "#6a6a78",
  accent:     "#9333EA",
  accent2:    "#E11D48",
  ok:         "#22c55e",
  err:        "#ef4444",
}

type Media = { id: string; url: string; order: number }

export default function VendorMediaManager({ slug, initial }: { slug: string; initial: Media[] }) {
  const [items, setItems] = useState<Media[]>(initial)
  const [busy, setBusy]   = useState(false)
  const [msg, setMsg]     = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)

  async function uploadOne(file: File) {
    const fd = new FormData()
    fd.append("file", file)
    const r = await fetch(`/api/admin/vendors/${slug}/media`, { method: "POST", body: fd })
    if (!r.ok) {
      const d = await r.json().catch(() => ({}))
      throw new Error(d.error ?? `HTTP ${r.status}`)
    }
    const d = await r.json()
    return d.media as Media
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setBusy(true); setMsg(null)
    try {
      const uploaded: Media[] = []
      for (const f of Array.from(files)) {
        try {
          const m = await uploadOne(f)
          uploaded.push(m)
        } catch (e) {
          captureError(e, { component: "VendorMediaManager", action: "upload" })
          setMsg(`❌ ${f.name} — ${e instanceof Error ? e.message : "erreur"}`)
        }
      }
      if (uploaded.length > 0) {
        setItems(prev => [...prev, ...uploaded])
        setMsg(`✅ ${uploaded.length} photo${uploaded.length > 1 ? "s" : ""} uploadée${uploaded.length > 1 ? "s" : ""}`)
      }
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  async function remove(m: Media) {
    if (!confirm("Supprimer cette photo ? Le fichier blob est aussi supprimé. Action irréversible.")) return
    try {
      const r = await fetch(`/api/admin/vendors/${slug}/media/${m.id}`, { method: "DELETE" })
      if (!r.ok) {
        const d = await r.json().catch(() => ({}))
        setMsg(`❌ ${d.error ?? "Erreur suppression"}`)
        return
      }
      setItems(prev => prev.filter(x => x.id !== m.id))
      setMsg("✅ Photo supprimée")
    } catch (e) {
      captureError(e, { component: "VendorMediaManager", action: "delete" })
      setMsg("❌ Erreur réseau")
    }
  }

  return (
    <section style={{
      background: C.panel, padding: "20px 22px", borderRadius: 14,
      border: `1px solid ${C.border}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h3 style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: C.text, marginBottom: 2, marginTop: 0, letterSpacing: "0.02em", textTransform: "uppercase" }}>
            Photos · {items.length}
          </h3>
          <p style={{ fontSize: "var(--text-xs)", color: C.textMuted, margin: 0 }}>
            JPG / PNG / WebP · max 5 MB · 30 photos max. Reflété sur la fiche publique en quelques secondes.
          </p>
        </div>
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            style={{ display: "none" }}
            onChange={e => handleFiles(e.target.files)}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            style={{
              padding: "8px 16px", borderRadius: 10,
              background: busy ? C.textDim : `linear-gradient(135deg, ${C.accent2}, ${C.accent})`,
              color: "#fff", border: "none", fontSize: "var(--text-xs)", fontWeight: 700,
              cursor: busy ? "wait" : "pointer", fontFamily: "inherit",
            }}
          >
            {busy ? "Upload…" : "+ Ajouter des photos"}
          </button>
        </div>
      </div>

      {msg && (
        <div style={{
          background: C.panel2, border: `1px solid ${C.border}`,
          padding: "8px 12px", borderRadius: 8, fontSize: "var(--text-xs)",
          marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span>{msg}</span>
          <button onClick={() => setMsg(null)} style={{ background: "transparent", border: "none", color: C.textMuted, cursor: "pointer", fontSize: "var(--text-sm)" }}>×</button>
        </div>
      )}

      {items.length === 0 ? (
        <div style={{
          padding: 32, textAlign: "center", color: C.textDim, fontSize: "var(--text-xs)",
          border: `1px dashed ${C.border}`, borderRadius: 10,
        }}>
          Aucune photo. Clique sur &quot;+ Ajouter des photos&quot;.
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: 10,
        }}>
          {items.map(m => (
            <div key={m.id} style={{
              position: "relative", aspectRatio: "1 / 1",
              borderRadius: 10, overflow: "hidden",
              border: `1px solid ${C.border}`,
              background: C.bg,
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.url}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
              <button
                onClick={() => remove(m)}
                title="Supprimer"
                style={{
                  position: "absolute", top: 6, right: 6,
                  background: "rgba(0,0,0,0.7)", color: C.err,
                  border: `1px solid ${C.err}40`, padding: "4px 7px",
                  borderRadius: 6, fontSize: "var(--text-xs)", cursor: "pointer",
                  fontFamily: "inherit", lineHeight: 1,
                }}
              >🗑</button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
