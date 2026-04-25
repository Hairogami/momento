"use client"
import { useState } from "react"
import Link from "next/link"

const LANGS = [
  { value: "fr",     label: "FR" },
  { value: "darija", label: "Darija" },
  { value: "ar",     label: "ع" },
]

export type DiscoverVendor = {
  slug: string
  name: string
  category: string
  city?: string | null
  rating?: number | null
  reviewCount?: number
  featured: boolean
  instagram?: string | null
  facebook?: string | null
  website?: string | null
  media?: { url: string }[]
}

type Props = {
  vendor: DiscoverVendor
  plannerId: string
  onInterest?: (result: { type: "message"; conversationId: string } | { type: "whatsapp"; phone: string | null }) => void
}

export default function VendorDiscoverCard({ vendor, plannerId, onInterest }: Props) {
  const [lang, setLang] = useState("fr")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [photoIdx, setPhotoIdx] = useState(0)

  const photos = vendor.media?.map(m => m.url).filter(Boolean) ?? []
  const hasPhotos = photos.length > 0

  async function handleInterest() {
    if (loading || done) return
    setLoading(true)
    try {
      const res = await fetch("/api/prestataires/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorSlug: vendor.slug, plannerId, lang }),
      })
      const data = await res.json()
      if (res.ok) {
        setDone(true)
        onInterest?.(data)
        if (data.type === "whatsapp" && data.phone) {
          const phone = data.phone.replace(/\D/g, "")
          window.open(`https://wa.me/${phone}`, "_blank")
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: "var(--dash-surface,#fff)", borderRadius: 20, overflow: "hidden",
      border: "1px solid var(--dash-border,rgba(183,191,217,0.2))",
      boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
    }}>
      {/* Photo area */}
      <div style={{ position: "relative", height: 180, background: "var(--dash-border,#f0f0f5)", overflow: "hidden" }}>
        {hasPhotos ? (
          <>
            <img
              src={photos[photoIdx]}
              alt={vendor.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            {photos.length > 1 && (
              <>
                <button
                  onClick={() => setPhotoIdx(i => (i - 1 + photos.length) % photos.length)}
                  style={navBtnStyle("left")}
                >‹</button>
                <button
                  onClick={() => setPhotoIdx(i => (i + 1) % photos.length)}
                  style={navBtnStyle("right")}
                >›</button>
                <div style={{ position: "absolute", bottom: 8, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 4 }}>
                  {photos.map((_, i) => (
                    <div key={i} style={{
                      width: i === photoIdx ? 16 : 6, height: 6, borderRadius: 99,
                      background: i === photoIdx ? "#fff" : "rgba(255,255,255,0.5)",
                      transition: "width 0.2s",
                    }} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, background: "linear-gradient(135deg,#1a0533,#3d0b6e)" }}>
            📷
          </div>
        )}
        {/* Partner badge */}
        {vendor.featured && (
          <div style={{
            position: "absolute", top: 10, left: 10,
            background: "linear-gradient(135deg,#E11D48,#9333EA)",
            color: "#fff", fontSize: 10, fontWeight: 700,
            padding: "3px 9px", borderRadius: 99,
            letterSpacing: "0.05em",
          }}>⭐ Partenaire</div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "14px 16px 16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: "var(--dash-text,#121317)", margin: "0 0 2px" }}>{vendor.name}</p>
            <p style={{ fontSize: 11, color: "var(--dash-text-3,#9a9aaa)", margin: 0 }}>{vendor.category}{vendor.city ? ` · ${vendor.city}` : ""}</p>
          </div>
          {vendor.rating && (
            <span style={{
              fontSize: 11, fontWeight: 700, color: "#E11D48",
              background: "rgba(225,29,72,0.08)", padding: "2px 8px", borderRadius: 99,
              whiteSpace: "nowrap",
            }}>★ {vendor.rating.toFixed(1)}{vendor.reviewCount ? ` (${vendor.reviewCount})` : ""}</span>
          )}
        </div>

        {/* Social badges */}
        <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
          {vendor.instagram && (
            <a href={`https://instagram.com/${vendor.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" style={socialBadge("#E4405F")}>
              📸 Instagram
            </a>
          )}
          {vendor.facebook && (
            <a href={vendor.facebook.startsWith("http") ? vendor.facebook : `https://facebook.com/${vendor.facebook}`} target="_blank" rel="noopener noreferrer" style={socialBadge("#1877F2")}>
              👍 Facebook
            </a>
          )}
          {vendor.website && (
            <a href={vendor.website} target="_blank" rel="noopener noreferrer" style={socialBadge("#6366F1")}>
              🌐 Site web
            </a>
          )}
          {/* Phone retiré du listing public (PII Loi 09-08). Accessible après "Demander le contact" → /api/prestataires/interest */}
        </div>

        {/* Lang selector + CTA */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Language selector — only relevant for partners */}
          {vendor.featured && (
            <div style={{ display: "flex", gap: 4 }}>
              {LANGS.map(l => (
                <button
                  key={l.value}
                  onClick={() => setLang(l.value)}
                  style={{
                    padding: "5px 9px", borderRadius: 7, fontSize: 10, fontWeight: 600,
                    border: "1px solid",
                    borderColor: lang === l.value ? "#9333EA" : "rgba(183,191,217,0.35)",
                    background: lang === l.value ? "rgba(147,51,234,0.07)" : "transparent",
                    color: lang === l.value ? "#9333EA" : "var(--dash-text-3,#9a9aaa)",
                    cursor: "pointer",
                  }}
                >{l.label}</button>
              ))}
            </div>
          )}

          <button
            onClick={handleInterest}
            disabled={loading || done}
            style={{
              flex: 1, padding: "10px 14px", borderRadius: 12, border: "none",
              background: done
                ? "rgba(34,197,94,0.12)"
                : "linear-gradient(135deg,#E11D48,#9333EA)",
              color: done ? "#22c55e" : "#fff",
              fontSize: 12, fontWeight: 700, cursor: done ? "default" : "pointer",
              fontFamily: "inherit", transition: "all 0.2s",
            }}
          >
            {done
              ? vendor.featured ? "✓ Message envoyé" : "✓ Contact ouvert"
              : loading ? "…"
              : vendor.featured ? "Je suis intéressé(e) 🎉" : "Contacter via WhatsApp 💬"
            }
          </button>

          <Link
            href={`/vendor/${vendor.slug}`}
            target="_blank"
            style={{
              width: 36, height: 36, borderRadius: 10,
              border: "1px solid rgba(183,191,217,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              textDecoration: "none", fontSize: 14, color: "var(--dash-text-3,#9a9aaa)",
              flexShrink: 0,
            }}
          >↗</Link>
        </div>
      </div>
    </div>
  )
}

function navBtnStyle(side: "left" | "right"): React.CSSProperties {
  return {
    position: "absolute", top: "50%", transform: "translateY(-50%)",
    [side]: 6,
    width: 28, height: 28, borderRadius: "50%",
    background: "rgba(0,0,0,0.45)", border: "none",
    color: "#fff", fontSize: 18, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    lineHeight: 1,
  }
}

function socialBadge(color: string): React.CSSProperties {
  return {
    fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 99,
    background: `${color}14`, color, textDecoration: "none",
    border: `1px solid ${color}30`, whiteSpace: "nowrap",
  }
}
