"use client"

import { useEffect, useRef } from "react"
import type { Map as LeafletMap } from "leaflet"

type Props = {
  lat: number
  lng: number
  venueName?: string
  zoom?: number
  height?: number | string
  /** Couleur du pin (hex) — par défaut var CSS --evt-main résolue au mount */
  accentColor?: string
}

/**
 * Carte interactive minimaliste avec un pin custom au centre.
 * Design éditorial : tuiles OSM en light, pin rond avec pulse, fallback clean si load fail.
 * Chargement manuel de Leaflet pour éviter les soucis SSR/hydration (pas react-leaflet).
 */
export default function LocationMap({
  lat, lng, venueName, zoom = 15, height = 360, accentColor,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<LeafletMap | null>(null)

  useEffect(() => {
    let cancelled = false

    async function init() {
      if (!containerRef.current || cancelled) return
      const L = (await import("leaflet")).default
      // CSS Leaflet injecté via <link> — chargé dans le wrapper page (ou dynamique ci-dessous)
      if (typeof document !== "undefined" && !document.querySelector('link[data-leaflet-css]')) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        link.setAttribute("data-leaflet-css", "1")
        link.crossOrigin = ""
        document.head.appendChild(link)
      }

      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }

      const computedAccent = accentColor
        || (typeof window !== "undefined"
            ? getComputedStyle(containerRef.current).getPropertyValue("--evt-main").trim() || "#8B3A3A"
            : "#8B3A3A")

      const map = L.map(containerRef.current, {
        center: [lat, lng],
        zoom,
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: false, // évite de bloquer le scroll de la page
      })
      mapRef.current = map

      // Tuiles light — Carto positron (lisible, éditorial)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">Carto</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map)

      // Pin SVG inline — rond + pulse, couleur du thème
      const html = `
        <div class="lm-pin">
          <div class="lm-pulse" style="background:${computedAccent}33"></div>
          <div class="lm-dot" style="background:${computedAccent}; box-shadow:0 4px 14px ${computedAccent}66"></div>
        </div>
      `
      const icon = L.divIcon({
        html,
        className: "lm-pin-wrap",
        iconSize: [42, 42],
        iconAnchor: [21, 21],
      })

      const marker = L.marker([lat, lng], { icon, title: venueName ?? "" }).addTo(map)
      if (venueName) {
        marker.bindPopup(`<div style="font-family:var(--evt-font-body,sans-serif);font-size:13px;color:#111;padding:2px 4px;max-width:200px;">${escapeHtml(venueName)}</div>`, { closeButton: false })
      }
    }

    init()

    return () => {
      cancelled = true
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [lat, lng, zoom, venueName, accentColor])

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: typeof height === "number" ? `${height}px` : height,
        borderRadius: 18,
        overflow: "hidden",
        border: "1px solid color-mix(in srgb, var(--evt-main) 20%, transparent)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.12)",
        background: "var(--evt-secondary, #f5f0ea)",
      }}
    >
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      <style>{`
        .lm-pin-wrap { background: transparent; border: none; }
        .lm-pin {
          position: relative;
          width: 42px; height: 42px;
          display: flex; align-items: center; justify-content: center;
        }
        .lm-pulse {
          position: absolute; inset: 0;
          border-radius: 50%;
          animation: lm-pulse 2s ease-out infinite;
        }
        .lm-dot {
          position: relative;
          width: 18px; height: 18px;
          border-radius: 50%;
          border: 3px solid #fff;
        }
        @keyframes lm-pulse {
          0%   { transform: scale(0.6); opacity: 0.8; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        /* Attribution discrète */
        .leaflet-control-attribution { font-size: 9px; opacity: 0.7; }
      `}</style>
    </div>
  )
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[c]!))
}
