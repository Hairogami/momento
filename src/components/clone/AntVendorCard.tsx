"use client"
import Link from "next/link"
import { useState } from "react"

type Props = {
  id: string
  name: string
  category: string
  city: string
  rating: number
  photo?: string | null
}

const CAT_IMAGES: Record<string, string> = {
  "DJ":                            "https://images.unsplash.com/photo-1571266028243-d220c6a18571?w=600&h=400&fit=crop&q=75",
  "Chanteur / chanteuse":          "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&h=400&fit=crop&q=75",
  "Orchestre":                     "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop&q=75",
  "Violoniste":                    "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=600&h=400&fit=crop&q=75",
  "Traiteur":                      "https://images.unsplash.com/photo-1555244162-803834f70033?w=600&h=400&fit=crop&q=75",
  "Pâtissier / Cake designer":     "https://images.unsplash.com/photo-1535141192574-5f39a5847d0a?w=600&h=400&fit=crop&q=75",
  "Service de bar / mixologue":    "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=400&fit=crop&q=75",
  "Photographe":                   "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&h=400&fit=crop&q=75",
  "Vidéaste":                      "https://images.unsplash.com/photo-1601506521793-dc748fc80b67?w=600&h=400&fit=crop&q=75",
  "Lieu de réception":             "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop&q=75",
  "Fleuriste événementiel":        "https://images.unsplash.com/photo-1487530811015-780b63e1b5a7?w=600&h=400&fit=crop&q=75",
  "Décorateur":                    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&h=400&fit=crop&q=75",
  "Hairstylist":                   "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=400&fit=crop&q=75",
  "Makeup Artist":                 "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&h=400&fit=crop&q=75",
  "Neggafa":                       "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&h=400&fit=crop&q=75",
  "Robes de mariés":               "https://images.unsplash.com/photo-1594552072238-b8a33785b6cd?w=600&h=400&fit=crop&q=75",
  "Wedding planner":               "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&h=400&fit=crop&q=75",
  "Event planner":                 "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&h=400&fit=crop&q=75",
  "Magicien":                      "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=600&h=400&fit=crop&q=75",
  "Animateur enfants":             "https://images.unsplash.com/photo-1558171813-13b498fa0b47?w=600&h=400&fit=crop&q=75",
}

// Fallback gradients per keyword
const CAT_GRADIENT: Record<string, [string, string]> = {
  dj: ["#6D28D9", "#1D4ED8"],
  musique: ["#6D28D9", "#1D4ED8"],
  chanteur: ["#7C3AED", "#1D4ED8"],
  orchestre: ["#5B21B6", "#1E40AF"],
  photo: ["#DC2626", "#D97706"],
  vid: ["#1D4ED8", "#0891B2"],
  traiteur: ["#059669", "#0D9488"],
  pâtissier: ["#D97706", "#059669"],
  bar: ["#0369A1", "#0891B2"],
  décor: ["#BE185D", "#7C3AED"],
  fleur: ["#BE185D", "#F43F5E"],
  lumineuse: ["#7C3AED", "#4338CA"],
  hair: ["#7C3AED", "#C026D3"],
  makeup: ["#DB2777", "#9333EA"],
  maquillage: ["#DB2777", "#9333EA"],
  neggafa: ["#B45309", "#DC2626"],
  robe: ["#DB2777", "#7C3AED"],
  spa: ["#059669", "#0891B2"],
  planner: ["#0369A1", "#7C3AED"],
  animat: ["#D97706", "#DC2626"],
  magicien: ["#7C3AED", "#DB2777"],
  lieu: ["#0369A1", "#059669"],
  salle: ["#0369A1", "#059669"],
  villa: ["#059669", "#0369A1"],
  riad: ["#B45309", "#DC2626"],
  transport: ["#374151", "#1D4ED8"],
  sécurité: ["#374151", "#1F2937"],
}

function getGradient(category: string): [string, string] {
  const c = category.toLowerCase()
  for (const [key, val] of Object.entries(CAT_GRADIENT)) {
    if (c.includes(key)) return val
  }
  return ["#E11D48", "#9333EA"]
}

export default function AntVendorCard({ id, name, category, city, rating, photo }: Props) {
  const [fav, setFav] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const imgUrl = photo || CAT_IMAGES[category]
  const [g1, g2] = getGradient(category)

  return (
    <Link href={`/vendor/${id}`} style={{ textDecoration: "none", display: "block" }}>
      <div
        className="clone-card"
        style={{
          background: "#fff",
          border: "1px solid rgba(183,191,217,0.18)",
          borderRadius: 20,
          overflow: "hidden",
          transition: "box-shadow 0.22s, transform 0.22s",
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.boxShadow = "0 12px 40px rgba(0,0,0,0.11)"
          el.style.transform = "translateY(-3px)"
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.boxShadow = "none"
          el.style.transform = "translateY(0)"
        }}
      >
        {/* Image / gradient area */}
        <div
          style={{
            aspectRatio: "4 / 3",
            position: "relative",
            overflow: "hidden",
            background: `linear-gradient(140deg, ${g1}, ${g2})`,
          }}
        >
          {imgUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imgUrl}
              alt={category}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              style={{
                position: "absolute", inset: 0,
                width: "100%", height: "100%",
                objectFit: "cover",
                opacity: imgLoaded ? 1 : 0,
                transition: "opacity 0.4s ease",
              }}
            />
          )}

          {/* Gradient overlay for text readability */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 50%)",
          }} />

          {/* Fav button */}
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); setFav(f => !f) }}
            aria-label={fav ? "Retirer des favoris" : "Ajouter aux favoris"}
            style={{
              position: "absolute", top: 12, right: 12,
              width: 34, height: 34, borderRadius: "50%",
              background: fav ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.35)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15, transition: "transform 0.15s",
              zIndex: 2,
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.12)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            {fav ? "❤️" : "🤍"}
          </button>

          {/* Bottom info on image */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            padding: "10px 14px 12px",
            zIndex: 2,
          }}>
            <div style={{
              display: "inline-flex", alignItems: "center",
              background: "rgba(255,255,255,0.18)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: 20,
              padding: "3px 10px",
              fontSize: 11, fontWeight: 500, color: "#fff",
              maxWidth: "calc(100% - 28px)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {category}
            </div>
          </div>
        </div>

        {/* Card body */}
        <div style={{ padding: "13px 16px 16px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
            <p className="clone-heading" style={{
              fontWeight: 600, fontSize: 14, color: "#121317",
              margin: 0, lineHeight: 1.35,
              overflow: "hidden", textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              flex: 1,
            }}>
              {name}
            </p>
            <div style={{
              display: "flex", alignItems: "center", gap: 3,
              flexShrink: 0, marginTop: 1,
            }}>
              <span style={{ color: "#F59E0B", fontSize: 13, lineHeight: 1 }}>★</span>
              <span className="clone-heading" style={{ fontSize: 12, fontWeight: 600, color: "#121317" }}>
                {rating.toFixed(1)}
              </span>
            </div>
          </div>
          <p className="clone-muted" style={{
            fontSize: 12, color: "#6a6a71", margin: "5px 0 0",
            display: "flex", alignItems: "center", gap: 3,
          }}>
            <span>📍</span>{city}
          </p>
        </div>
      </div>
    </Link>
  )
}
