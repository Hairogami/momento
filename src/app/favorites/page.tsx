"use client"
import { useState } from "react"
import Link from "next/link"
import DashSidebar from "@/components/clone/dashboard/DashSidebar"
import AntNav from "@/components/clone/AntNav"
import { usePlanners } from "@/hooks/usePlanners"

const G = "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))"

type Fav = { id: string; name: string; category: string; city: string; rating: number; priceMin?: number }

const MOCK_FAVS: Fav[] = [
  { id: "studio-lumiere",    name: "Studio Lumière",     category: "Photographe",  city: "Casablanca", rating: 4.9, priceMin: 3000 },
  { id: "dj-karim",         name: "DJ Karim Beat",       category: "DJ",           city: "Marrakech",  rating: 4.8, priceMin: 2500 },
  { id: "traiteur-elbab",   name: "Traiteur El Bab",     category: "Traiteur",     city: "Fès",        rating: 4.7, priceMin: 180  },
  { id: "fleurs-art",       name: "Fleurs & Art",        category: "Fleuriste",    city: "Rabat",      rating: 4.6, priceMin: 800  },
  { id: "cine-mariage",     name: "Ciné Mariage",        category: "Vidéographe",  city: "Casablanca", rating: 4.8, priceMin: 4500 },
]

const CATEGORY_COLORS: Record<string, string> = {
  "Photographe": "#818cf8",
  "DJ":          "#a855f7",
  "Traiteur":    "#f59e0b",
  "Fleuriste":   "#f472b6",
  "Vidéographe": "#60a5fa",
}

export default function CloneFavoritesPage() {
  const { events, activeEventId } = usePlanners()
  const [favs, setFavs] = useState<Fav[]>(MOCK_FAVS)

  function remove(id: string) {
    setFavs(fs => fs.filter(f => f.id !== id))
  }

  return (
    <div className="ant-root" style={{ display: "flex", minHeight: "100vh", background: "#f7f7fb" }}>
      <div className="hidden lg:flex">
        <DashSidebar events={events} activeEventId={activeEventId} onEventChange={() => {}} />
      </div>
      <div className="lg:hidden"><AntNav /></div>

      <main style={{ flex: 1, padding: "32px 28px 64px", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: "clamp(1.3rem,2vw,1.7rem)", fontWeight: 800, color: "#121317", letterSpacing: "-0.03em", margin: "0 0 4px" }}>
              Favoris
            </h1>
            <p style={{ fontSize: 13, color: "#6a6a71", margin: 0 }}>
              {favs.length} prestataire{favs.length !== 1 ? "s" : ""} sauvegardé{favs.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link href="/explore" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: 999,
            background: G, color: "#fff",
            fontSize: 12, fontWeight: 600, textDecoration: "none",
          }}>
            <span style={{ fontFamily: "'Google Symbols','Material Symbols Outlined'", fontSize: 14 }}>search</span>
            Explorer
          </Link>
        </div>

        {favs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💔</div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#121317", margin: "0 0 8px" }}>Aucun favori</h2>
            <p style={{ fontSize: 13, color: "#9a9aaa", marginBottom: 24 }}>
              Explorez l&apos;annuaire et cliquez ♥ pour sauvegarder des prestataires
            </p>
            <Link href="/explore" style={{
              padding: "10px 24px", borderRadius: 999,
              background: G, color: "#fff",
              fontSize: 13, fontWeight: 600, textDecoration: "none",
              display: "inline-block",
            }}>Explorer l&apos;annuaire</Link>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
          }}>
            {favs.map(fav => {
              const color = CATEGORY_COLORS[fav.category] ?? "#9a9aaa"
              return (
                <div key={fav.id} style={{
                  background: "#fff", borderRadius: 18,
                  border: "1px solid rgba(183,191,217,0.15)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  overflow: "hidden",
                  transition: "box-shadow 0.2s",
                }} className="clone-card-white">
                  {/* Color band */}
                  <div style={{ height: 4, background: color }} />
                  <div style={{ padding: "18px 18px 16px" }}>
                    {/* Avatar + name */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: "50%",
                        background: `${color}20`,
                        border: `1.5px solid ${color}30`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 14, fontWeight: 700, color, flexShrink: 0,
                      }}>
                        {fav.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#121317", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {fav.name}
                        </div>
                        <div style={{ fontSize: 11, color: "#9a9aaa" }}>{fav.category} · {fav.city}</div>
                      </div>
                    </div>

                    {/* Rating + price */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700,
                        background: "rgba(245,158,11,0.1)", color: "#f59e0b",
                        padding: "3px 8px", borderRadius: 99,
                      }}>★ {fav.rating.toFixed(1)}</span>
                      {fav.priceMin && (
                        <span style={{ fontSize: 11, color: "#9a9aaa" }}>
                          dès {fav.priceMin.toLocaleString("fr-MA")} MAD
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 8 }}>
                      <Link href={`/vendor/${fav.id}`} style={{
                        flex: 1, padding: "8px", borderRadius: 99, textAlign: "center",
                        background: G, color: "#fff",
                        fontSize: 11, fontWeight: 600, textDecoration: "none",
                      }}>Voir le profil</Link>
                      <button
                        onClick={() => remove(fav.id)}
                        style={{
                          width: 34, height: 34, borderRadius: "50%",
                          border: "1px solid rgba(239,68,68,0.25)",
                          background: "rgba(239,68,68,0.05)",
                          color: "#ef4444", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontFamily: "'Google Symbols','Material Symbols Outlined'",
                          fontSize: 16, fontWeight: "normal",
                        }}
                        title="Retirer des favoris"
                      >favorite</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
