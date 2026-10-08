"use client"

import { useEffect, useState } from "react"

const DEVICES = [
  { id: "iphone", label: "iPhone 14", w: 390, h: 844 },
  { id: "android", label: "Android compact", w: 360, h: 780 },
  { id: "iphone-max", label: "iPhone 14 Pro Max", w: 430, h: 932 },
]

/**
 * Cadre téléphone de taille fixe. L'iframe garde sa largeur mobile quelle que soit
 * la fenêtre ; elle est seulement réduite visuellement (scale) si l'écran est trop petit.
 */
export default function MobilePreviewClient() {
  const [path, setPath] = useState("/evt/yasmine-yazid")
  const [draft, setDraft] = useState(path)
  const [deviceId, setDeviceId] = useState(DEVICES[0]!.id)
  const [nonce, setNonce] = useState(0)
  const [scale, setScale] = useState(1)
  const device = DEVICES.find(d => d.id === deviceId) ?? DEVICES[0]!

  useEffect(() => {
    function fit() {
      const available = window.innerHeight - 120
      setScale(Math.min(1, available / (device.h + 24)))
    }
    fit()
    window.addEventListener("resize", fit)
    return () => window.removeEventListener("resize", fit)
  }, [device.h])

  /** Rejoue l'ouverture : efface le flag de session de la porte puis recharge l'iframe. */
  function replay() {
    try {
      for (const k of Object.keys(sessionStorage)) {
        if (k.startsWith("evt-door-opened:")) sessionStorage.removeItem(k)
      }
    } catch { /* stockage indisponible */ }
    setNonce(n => n + 1)
  }

  const btn: React.CSSProperties = {
    padding: "8px 16px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.06)", color: "#fff", cursor: "pointer",
    fontFamily: "inherit", fontSize: 13, fontWeight: 600,
  }

  return (
    <div style={{
      minHeight: "100dvh", background: "#0d0e12", color: "#fff",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "16px",
      fontFamily: "system-ui, sans-serif",
    }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", alignItems: "center" }}>
        <button type="button" onClick={replay} style={{ ...btn, background: "linear-gradient(135deg,#E11D48,#9333EA)", border: "none" }}>
          ↻ Rejouer l&apos;ouverture
        </button>
        <select
          value={deviceId}
          onChange={e => setDeviceId(e.target.value)}
          aria-label="Appareil"
          style={{ ...btn, appearance: "auto" }}
        >
          {DEVICES.map(d => <option key={d.id} value={d.id} style={{ color: "#000" }}>{d.label} · {d.w}×{d.h}</option>)}
        </select>
        <form
          onSubmit={e => { e.preventDefault(); setPath(draft.startsWith("/") ? draft : `/${draft}`); setNonce(n => n + 1) }}
          style={{ display: "flex", gap: 6 }}
        >
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            aria-label="Chemin de la page"
            style={{ ...btn, fontWeight: 400, width: 220, cursor: "text" }}
          />
          <button type="submit" style={btn}>Ouvrir</button>
        </form>
      </div>

      <div style={{
        width: device.w + 24, height: device.h + 24,
        transform: `scale(${scale})`, transformOrigin: "top center",
        borderRadius: 48, padding: 12, background: "#1c1d22",
        boxShadow: "0 30px 80px rgba(0,0,0,0.6), inset 0 0 0 2px #2c2d33",
        marginBottom: (scale - 1) * (device.h + 24),
      }}>
        <iframe
          key={`${path}-${deviceId}-${nonce}`}
          src={path}
          title="Aperçu mobile"
          style={{ width: device.w, height: device.h, border: 0, borderRadius: 36, background: "#fff", display: "block" }}
        />
      </div>
    </div>
  )
}
