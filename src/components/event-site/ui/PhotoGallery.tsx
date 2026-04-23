"use client"

export type PhotoItem = {
  id: string
  url: string
  caption?: string | null
}

type Props = {
  photos: PhotoItem[]
  layout?: "grid" | "masonry"
}

/**
 * Galerie photos — grille responsive ou masonry.
 * Click = lightbox (implémenté en V2). Pour l'instant, cover fit + hover scale.
 */
export default function PhotoGallery({ photos, layout = "grid" }: Props) {
  if (photos.length === 0) return null

  if (layout === "masonry") {
    return (
      <section style={{ padding: "60px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{
          columnCount: 3,
          columnGap: 14,
        }}>
          {photos.map(p => (
            <figure key={p.id} style={{ margin: "0 0 14px", breakInside: "avoid", borderRadius: 12, overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={p.caption ?? ""} style={{ width: "100%", display: "block", borderRadius: 12 }} loading="lazy" />
            </figure>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section style={{ padding: "60px 24px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 14,
      }}>
        {photos.map(p => (
          <figure key={p.id} style={{
            margin: 0, borderRadius: 12, overflow: "hidden",
            aspectRatio: "4 / 3", background: "var(--evt-secondary)",
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.url}
              alt={p.caption ?? ""}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              loading="lazy"
            />
          </figure>
        ))}
      </div>
    </section>
  )
}
