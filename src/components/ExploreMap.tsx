"use client"

import { useEffect, useRef } from "react"

const CITY_COORDS: Record<string, [number, number]> = {
  "Casablanca":  [33.5731, -7.5898],
  "Rabat":       [34.0209, -6.8416],
  "Marrakech":   [31.6295, -7.9811],
  "Fès":         [34.0181, -5.0078],
  "Tanger":      [35.7595, -5.8340],
  "Agadir":      [30.4278, -9.5981],
  "Meknès":      [33.8935, -5.5473],
  "Oujda":       [34.6814, -1.9086],
  "Kénitra":     [34.2610, -6.5802],
  "El Jadida":   [33.2549, -8.5078],
  "Mohammedia":  [33.6866, -7.3834],
  "Tétouan":     [35.5785, -5.3684],
  "Salé":        [34.0378, -6.7975],
  "Laâyoune":    [27.1418, -13.1875],
}

// Category → color mapping
const CAT_COLORS: Record<string, string> = {
  "DJ":                              "#7C3AED", // violet
  "Chanteur / chanteuse":            "#7C3AED",
  "Orchestre":                       "#5B21B6",
  "Violoniste":                      "#6D28D9",
  "Dekka Marrakchia / Issawa":       "#4C1D95",
  "Traiteur":                        "#D97706", // amber
  "Pâtissier / Cake designer":       "#B45309",
  "Service de bar / mixologue":      "#92400E",
  "Photographe":                     "#1D4ED8", // blue
  "Vidéaste":                        "#1E40AF",
  "Lieu de réception":               "#059669", // emerald
  "Structures événementielles":      "#047857",
  "Décorateur":                      "#DB2777", // pink
  "Fleuriste événementiel":          "#BE185D",
  "Créateur d'ambiance lumineuse":   "#9D174D",
  "Hairstylist":                     "#DC2626", // red
  "Makeup Artist":                   "#B91C1C",
  "Neggafa":                         "#991B1B",
  "Robes de mariés":                 "#C2410C",
  "Spa / soins esthétiques":         "#E11D48",
  "Event planner":                   "#0891B2", // cyan
  "Wedding planner":                 "#0E7490",
  "Location de voiture de mariage":  "#64748B", // slate
  "VTC / Transport invités":         "#475569",
  "Sécurité événementielle":         "#374151",
  "Animateur enfants":               "#16A34A", // green
  "Magicien":                        "#15803D",
  "Structures gonflables":           "#166534",
  "Jeux & animations enfants":       "#14532D",
  "Créateur de cadeaux invités":     "#C4532A", // terra (default)
  "Créateur de faire-part":          "#9A3D1A",
}

function getCatColor(cat: string): string {
  return CAT_COLORS[cat] ?? "#C4532A"
}

interface Vendor {
  id: string
  name: string
  category: string
  city: string
  rating?: number
}

interface ExploreMapProps {
  vendors: Vendor[]
  activeCity?: string
  activeCategory?: string   // slug or category name — used to decide individual vs cluster
  onCityClick?: (city: string) => void
}

function starHtml(rating: number): string {
  return Array.from({ length: 5 })
    .map((_, i) => `<span style="color:${i < rating ? "#C4532A" : "#DDD4BC"};font-size:11px;">★</span>`)
    .join("")
}

export default function ExploreMap({ vendors, activeCity, activeCategory, onCityClick }: ExploreMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)

  // Show individual pins when filtering by category (≤120 vendors) or single city
  const useIndividualPins = (activeCategory && activeCategory !== "") || vendors.length <= 80

  // Group vendors by city for cluster mode
  const byCity = vendors.reduce<Record<string, Vendor[]>>((acc, v) => {
    if (!acc[v.city]) acc[v.city] = []
    acc[v.city].push(v)
    return acc
  }, {})

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    import("leaflet").then(L => {
      if (!mapRef.current || mapInstanceRef.current) return

      // @ts-expect-error leaflet default icon fix
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      })

      const map = L.map(mapRef.current!, {
        center: [32.5, -6.0],
        zoom: 5,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: true,
      })

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map)

      if (useIndividualPins) {
        // ── Individual pins per vendor, colored by category ──────────────────
        const shown = vendors.slice(0, 120) // cap for perf
        shown.forEach(v => {
          const coords = CITY_COORDS[v.city]
          if (!coords) return

          const color = getCatColor(v.category)
          // Slight random offset to avoid exact overlap in same city
          const jitter: [number, number] = [
            coords[0] + (Math.random() - 0.5) * 0.04,
            coords[1] + (Math.random() - 0.5) * 0.04,
          ]

          const icon = L.divIcon({
            className: "",
            html: `<div style="
              width:10px;height:10px;
              background:${color};
              border:2px solid #fff;
              border-radius:50%;
              box-shadow:0 1px 4px rgba(0,0,0,0.4);
              cursor:pointer;
            "></div>`,
            iconSize: [10, 10],
            iconAnchor: [5, 5],
            popupAnchor: [0, -8],
          })

          const marker = L.marker(jitter, { icon }).addTo(map)
          marker.bindPopup(`
            <div style="font-family:system-ui,sans-serif;min-width:150px;padding:2px 0;">
              <div style="font-weight:700;font-size:12px;color:#1A1208;margin-bottom:2px;">${v.name}</div>
              <div style="font-size:10px;color:${color};font-weight:600;margin-bottom:3px;">${v.category}</div>
              <div style="margin-bottom:3px;">${starHtml(v.rating ?? 4)}</div>
              <div style="font-size:10px;color:#6A5F4A;">📍 ${v.city}</div>
              <a href="/vendor/${v.id}" style="display:block;margin-top:6px;text-align:center;background:${color};color:#fff;font-size:10px;font-weight:600;padding:4px 8px;border-radius:6px;text-decoration:none;">
                Voir le profil →
              </a>
            </div>
          `, { maxWidth: 200 })
        })

        // Fit bounds to shown markers
        const validCoords = shown
          .map(v => CITY_COORDS[v.city])
          .filter(Boolean) as [number, number][]
        if (validCoords.length > 0) {
          try { map.fitBounds(validCoords, { padding: [40, 40], maxZoom: 8 }) } catch {}
        }

      } else {
        // ── City cluster pins ─────────────────────────────────────────────────
        Object.entries(byCity).forEach(([city, vList]) => {
          const coords = CITY_COORDS[city]
          if (!coords) return

          const count = vList.length
          const isActive = activeCity && activeCity !== "Toutes les villes" && activeCity === city
          const size = count >= 50 ? 52 : count >= 30 ? 44 : count >= 15 ? 38 : count >= 5 ? 32 : 26

          // Dominant category color for cluster
          const catFreq = vList.reduce<Record<string, number>>((acc, v) => {
            acc[v.category] = (acc[v.category] ?? 0) + 1; return acc
          }, {})
          const dominantCat = Object.entries(catFreq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? ""
          const clusterColor = isActive ? "#9A3D1A" : getCatColor(dominantCat)

          const icon = L.divIcon({
            className: "",
            html: `
              <div style="
                width:${size}px;height:${size}px;
                background:${clusterColor};
                border:2.5px solid #fff;
                border-radius:50%;
                display:flex;align-items:center;justify-content:center;
                color:#fff;font-weight:700;font-size:${size > 40 ? 13 : 11}px;
                box-shadow:0 2px 10px rgba(0,0,0,0.35);
                cursor:pointer;
              ">${count}</div>`,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
            popupAnchor: [0, -size / 2 - 4],
          })

          // Categories breakdown for popup
          const catLines = Object.entries(catFreq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([cat, n]) => `<div style="display:flex;justify-content:space-between;gap:12px;font-size:10px;color:#6A5F4A;padding:1px 0;">
              <span>${cat}</span><span style="font-weight:700;color:${getCatColor(cat)};">${n}</span>
            </div>`)
            .join("")

          const sample = vList.slice(0, 3).map(v => `<div style="font-size:10px;color:#6A5F4A;padding:1px 0;">• ${v.name}</div>`).join("")
          const more = vList.length > 3 ? `<div style="font-size:10px;color:#C4532A;margin-top:1px;">+${vList.length - 3} autres</div>` : ""

          const marker = L.marker(coords, { icon }).addTo(map)
          marker.bindPopup(`
            <div style="font-family:system-ui,sans-serif;min-width:160px;">
              <div style="font-weight:700;font-size:13px;color:#1A1208;margin-bottom:3px;">📍 ${city}</div>
              <div style="font-size:11px;color:#C4532A;font-weight:600;margin-bottom:6px;">${count} prestataire${count > 1 ? "s" : ""}</div>
              <div style="margin-bottom:6px;border-bottom:1px solid #EDE4CC;padding-bottom:6px;">${catLines}</div>
              ${sample}${more}
              <div style="margin-top:6px;text-align:center;">
                <span style="font-size:10px;color:#9A907A;">Cliquer pour filtrer</span>
              </div>
            </div>
          `, { maxWidth: 220 })

          marker.on("click", () => {
            onCityClick?.(city)
            marker.openPopup()
          })
        })
      }

      mapInstanceRef.current = map
    })

    return () => {
      if (mapInstanceRef.current) {
        ;(mapInstanceRef.current as { remove: () => void }).remove()
        mapInstanceRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={mapRef}
      style={{
        height: "100%",
        minHeight: 400,
        width: "100%",
        borderRadius: 0,
        overflow: "hidden",
        zIndex: 0,
      }}
    />
  )
}
