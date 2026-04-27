"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function VendorDeleteButton({ slug, name }: { slug: string; name: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm(`⚠️ Supprimer définitivement "${name}" (${slug}) ?\nCascade : médias, reviews, packages, etc. IRRÉVERSIBLE.`)) return
    if (!confirm(`Confirme une dernière fois : SUPPRIMER ${name} ?`)) return
    setLoading(true)
    try {
      const r = await fetch(`/api/admin/vendors/${slug}`, { method: "DELETE" })
      if (!r.ok) {
        const d = await r.json().catch(() => ({}))
        alert(`❌ ${d.error ?? "Erreur"}`)
        setLoading(false)
        return
      }
      router.push("/admin/vendors")
    } catch (e) {
      console.error("[admin vendor delete]", e)
      alert("❌ Erreur réseau")
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      style={{
        padding: "8px 16px", borderRadius: 10,
        background: "transparent", color: "#ef4444",
        border: "1px solid #ef444466", fontSize: "var(--text-xs)", fontWeight: 600,
        cursor: loading ? "wait" : "pointer", fontFamily: "inherit",
        opacity: loading ? 0.6 : 1,
      }}
    >
      {loading ? "Suppression…" : "🗑 Supprimer"}
    </button>
  )
}
