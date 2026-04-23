"use client"

type Props = {
  venueName: string
  mapsUrl?: string | null
  wazeUrl?: string | null
  label?: string
}

/**
 * Bouton de navigation — Google Maps + Waze.
 * Confidentialité : aucune adresse textuelle affichée. Seulement des liens.
 */
export default function MapLinks({ venueName, mapsUrl, wazeUrl, label = "Voir l'itinéraire" }: Props) {
  const hasMap = Boolean(mapsUrl)
  const hasWaze = Boolean(wazeUrl)
  if (!hasMap && !hasWaze) return null

  return (
    <div style={{ display: "inline-flex", gap: 10, flexWrap: "wrap" }}>
      {hasMap && (
        <a
          href={mapsUrl!}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${label} — ${venueName} sur Google Maps`}
          style={btnStyle}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
          </svg>
          Google Maps
        </a>
      )}
      {hasWaze && (
        <a
          href={wazeUrl!}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${label} — ${venueName} sur Waze`}
          style={btnStyle}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M20.54 6.63A9.59 9.59 0 0 0 12.27 2.7 9.26 9.26 0 0 0 2.5 11a8.82 8.82 0 0 0 1.78 5.29 1 1 0 0 1 .2.71 2.54 2.54 0 0 0 2.5 2.8 2.54 2.54 0 0 0 2.54-2.17A11.5 11.5 0 0 0 12 18a11.5 11.5 0 0 0 2.48-.27 2.54 2.54 0 0 0 5 0 2.54 2.54 0 0 0-.18-.81 8.87 8.87 0 0 0 1.73-4.94 8.51 8.51 0 0 0-.49-5.35zM9 12a1.25 1.25 0 1 1 1.25-1.25A1.25 1.25 0 0 1 9 12zm6 0a1.25 1.25 0 1 1 1.25-1.25A1.25 1.25 0 0 1 15 12z" />
          </svg>
          Waze
        </a>
      )}
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 16px",
  borderRadius: 999,
  border: "1px solid var(--evt-main, #C1713A)",
  background: "transparent",
  color: "var(--evt-main, #C1713A)",
  fontSize: 13,
  fontWeight: 500,
  textDecoration: "none",
  fontFamily: "var(--evt-font-body, inherit)",
  transition: "background 0.15s, color 0.15s",
}
