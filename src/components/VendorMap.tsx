"use client"

import { useState } from "react"
import { MapPin, ExternalLink } from "lucide-react"

interface VendorMapProps {
  vendorId?: string
  city: string
  vendorName: string
  category: string
  rating?: number
}

export default function VendorMap({ city, vendorName, category }: VendorMapProps) {
  const [loaded, setLoaded] = useState(false)

  // Google Maps Embed search — no API key needed, shows real business if on Google Maps
  const query = encodeURIComponent(`${vendorName} ${city} Maroc`)
  const embedUrl = `https://maps.google.com/maps?q=${query}&output=embed&hl=fr&z=15`
  const mapsUrl = `https://www.google.com/maps/search/${query}`

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold flex items-center gap-2" style={{ color: "var(--momento-white)" }}>
          <MapPin size={15} style={{ color: "var(--momento-terra)" }} />
          Localisation
        </h2>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70"
          style={{ color: "var(--momento-terra)" }}
        >
          Ouvrir dans Maps <ExternalLink size={11} />
        </a>
      </div>

      <div
        className="relative w-full overflow-hidden"
        style={{
          height: 280,
          borderRadius: 14,
          border: "1px solid var(--momento-anthracite)",
          backgroundColor: "var(--momento-dark)",
        }}
      >
        {/* Loading placeholder */}
        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10"
            style={{ backgroundColor: "var(--momento-dark)" }}>
            <MapPin size={24} style={{ color: "var(--momento-terra)" }} />
            <p className="text-xs font-medium" style={{ color: "var(--momento-mist)" }}>
              {vendorName} · {city}
            </p>
          </div>
        )}

        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0, display: "block" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => setLoaded(true)}
          title={`Localisation de ${vendorName}`}
        />
      </div>

      <p className="text-xs mt-2 flex items-center gap-1.5" style={{ color: "var(--momento-mist)" }}>
        <MapPin size={10} style={{ color: "var(--momento-terra)" }} />
        {vendorName} · {category} · {city}, Maroc
      </p>
    </div>
  )
}
