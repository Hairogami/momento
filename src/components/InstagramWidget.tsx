"use client"

import { useState } from "react"

interface InstagramWidgetProps {
  handle: string        // URL complète ex: https://www.instagram.com/merzougraphy/
  vendorName: string
  category?: string
  photos?: string[]     // photos réelles du vendeur pour les tiles
}

function IgIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="6" stroke="currentColor" strokeWidth="1.8"/>
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
    </svg>
  )
}

function HeartIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
  )
}

const CAT_LABELS: Record<string, string[]> = {
  "Photographe":        ["Portrait de couple",   "Cérémonie",         "Moments clés",     "Galerie mariés",    "Making-of",         "Souvenirs"],
  "Vidéaste":           ["Film de mariage",       "Teaser cinéma",     "Highlights",       "Ceremony recap",    "Drone shots",       "Love story"],
  "Makeup Artist":      ["Maquillage oriental",   "Look du jour",      "Avant/Après",      "Mariée de la sem.", "Tutoriel smoky",    "Soirée de noces"],
  "Neggafa":            ["Tenue traditionnelle",  "Caftans brodés",    "Cérémonie henné",  "Accessoires",       "Mariée du mois",    "Détails haute couture"],
  "DJ":                 ["Set mariage",           "Ambiance dancefloor","Requests playlist","Live mix",          "Soirée privée",     "Festival de noces"],
  "Orchestre":          ["Live performance",      "Musique andalouse", "Chaabi fusion",    "Soirée orchestre",  "En coulisses",      "Concert mariage"],
  "Traiteur":           ["Buffet marocain",       "Pièces montées",    "Pastilla royale",  "Dressage tables",   "Cocktail dînatoire","Couscous de noces"],
  "Décorateur":         ["Scénographie salle",    "Arches florales",   "Table d'honneur",  "Photobooth",        "Ambiance lumières", "Détails déco"],
  "Wedding planner":    ["Organisation J-1",      "Coordination",      "Mise en place",    "Bridal morning",    "Logistique",        "Happy couple"],
  "Fleuriste":          ["Bouquet de mariée",     "Centres de tables", "Arche fleurie",    "Boutonnière",       "Décoration florale","Pétales cérémonie"],
}

const DEFAULT_LABELS = ["Galerie mariage", "Réalisation récente", "Portrait", "Cérémonie", "Making-of", "Soirée"]

// Dégradés chauds — palette de la marque (terra / mist / steel)
const WARM_GRADIENTS = [
  "linear-gradient(145deg, #C4532A 0%, #8B3A1E 100%)",
  "linear-gradient(145deg, #6A5F4A 0%, #3D3528 100%)",
  "linear-gradient(145deg, #9A907A 0%, #6A5F4A 100%)",
  "linear-gradient(145deg, #8B3A1E 0%, #C4532A 100%)",
  "linear-gradient(145deg, #3D3528 0%, #9A907A 100%)",
  "linear-gradient(145deg, #C4532A 0%, #6A5F4A 100%)",
]

function getUsername(url: string): string {
  return url.replace(/\/$/, "").split("/").pop() ?? ""
}

export default function InstagramWidget({ handle, vendorName, category, photos = [] }: InstagramWidgetProps) {
  const username = getUsername(handle)
  const labels = (category && CAT_LABELS[category]) ? CAT_LABELS[category] : DEFAULT_LABELS
  // Track which photo indices failed to load
  const [brokenPhotos, setBrokenPhotos] = useState<Set<number>>(new Set())

  const markBroken = (i: number) => {
    setBrokenPhotos(prev => {
      const next = new Set(prev)
      next.add(i)
      return next
    })
  }

  return (
    <div className="mb-6">
      {/* Titre section */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold" style={{ color: "#1A1208" }}>
          Instagram
        </h2>
        <a
          href={handle}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all hover:opacity-75"
          style={{ backgroundColor: "#EDE4CC", color: "#6A5F4A", border: "1px solid #9A907A" }}
        >
          <IgIcon size={12} />
          @{username}
        </a>
      </div>

      {/* Carte widget */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid #DDD4BC", backgroundColor: "#F5EDD6" }}
      >
        {/* Header profil */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: "1px solid #EDE4CC" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-[2px] rounded-full shrink-0"
              style={{
                background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
              }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                style={{ backgroundColor: "#F5EDD6", color: "#C4532A" }}
              >
                {vendorName.charAt(0)}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold leading-tight" style={{ color: "#1A1208" }}>@{username}</p>
              <p className="text-[11px] leading-tight mt-0.5" style={{ color: "#9A907A" }}>{vendorName}</p>
            </div>
          </div>
          <IgIcon size={20} className="opacity-30" />
        </div>

        {/* Grille 3×2 */}
        <div className="grid grid-cols-3" style={{ gap: "2px", backgroundColor: "#DDD4BC" }}>
          {labels.map((label, i) => {
            const photoUrl = photos[i]
            const showPhoto = photoUrl && photoUrl.length > 0 && !brokenPhotos.has(i)
            return (
              <a
                key={i}
                href={handle}
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex flex-col items-center justify-end group overflow-hidden"
                style={{
                  height: "110px",
                  background: showPhoto ? "#EDE4CC" : WARM_GRADIENTS[i],
                }}
              >
                {/* Photo réelle si disponible et non cassée */}
                {showPhoto && (
                  <img
                    src={photoUrl}
                    alt={label}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    onError={() => markBroken(i)}
                  />
                )}

                {/* Overlay dégradé bas */}
                <div
                  className="absolute inset-0 transition-opacity duration-200"
                  style={{
                    background: showPhoto
                      ? "linear-gradient(to top, rgba(26,18,8,0.72) 0%, rgba(26,18,8,0.0) 55%)"
                      : "linear-gradient(to top, rgba(26,18,8,0.45) 0%, transparent 60%)",
                  }}
                />

                {/* Hover overlay */}
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ backgroundColor: "rgba(26,18,8,0.42)" }}
                >
                  <div className="flex items-center gap-1 text-white">
                    <HeartIcon size={15} />
                    <span className="text-xs font-semibold">Voir</span>
                  </div>
                </div>

                {/* Label contenu */}
                <span
                  className="relative z-10 text-[9px] font-semibold text-center leading-tight px-1.5 pb-1.5"
                  style={{ color: "rgba(255,255,255,0.92)", textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}
                >
                  {label}
                </span>
              </a>
            )
          })}
        </div>

        {/* CTA — bouton terra */}
        <a
          href={handle}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2.5 mx-4 my-4 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-85 active:scale-[0.98]"
          style={{ backgroundColor: "#C4532A", color: "#F5EDD6" }}
        >
          <IgIcon size={17} />
          Voir le profil Instagram · @{username}
        </a>
      </div>
    </div>
  )
}
