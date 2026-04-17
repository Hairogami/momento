/**
 * Server-only helpers qui lisent les vendors depuis la DB Postgres.
 * Remplacent les anciens fichiers statiques VENDOR_BASIC / VENDOR_DETAILS.
 *
 * À utiliser dans : page.tsx (vendor detail), explore (server component),
 * sitemap.ts, et les routes API qui valident l'existence d'un slug.
 */
import { prisma } from "@/lib/prisma"
import { getRankingWeights, sortByScore } from "@/lib/rankingScore"

// ─── Fallback images par catégorie (quand un vendor n'a aucune photo en DB) ──
// Garde ce mapping ici en server-only, réutilisé par plusieurs pages.
export const CAT_FALLBACK_IMAGE: Record<string, string> = {
  "DJ":                            "https://images.unsplash.com/photo-1571266028243-d220c6a18571?w=1200&h=630&fit=crop&q=80",
  "Chanteur / chanteuse":          "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1200&h=630&fit=crop&q=80",
  "Orchestre":                     "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=630&fit=crop&q=80",
  "Violoniste":                    "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=1200&h=630&fit=crop&q=80",
  "Traiteur":                      "https://images.unsplash.com/photo-1555244162-803834f70033?w=1200&h=630&fit=crop&q=80",
  "Pâtissier / Cake designer":     "https://images.unsplash.com/photo-1535141192574-5f39a5847d0a?w=1200&h=630&fit=crop&q=80",
  "Service de bar / mixologue":    "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1200&h=630&fit=crop&q=80",
  "Photographe":                   "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&h=630&fit=crop&q=80",
  "Vidéaste":                      "https://images.unsplash.com/photo-1601506521793-dc748fc80b67?w=1200&h=630&fit=crop&q=80",
  "Lieu de réception":             "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=630&fit=crop&q=80",
  "Fleuriste événementiel":        "https://images.unsplash.com/photo-1487530811015-780b63e1b5a7?w=1200&h=630&fit=crop&q=80",
  "Décorateur":                    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&h=630&fit=crop&q=80",
  "Hairstylist":                   "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&h=630&fit=crop&q=80",
  "Makeup Artist":                 "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200&h=630&fit=crop&q=80",
  "Neggafa":                       "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&h=630&fit=crop&q=80",
  "Robes de mariés":               "https://images.unsplash.com/photo-1594552072238-b8a33785b6cd?w=1200&h=630&fit=crop&q=80",
  "Wedding planner":               "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&h=630&fit=crop&q=80",
  "Event planner":                 "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&h=630&fit=crop&q=80",
  "Magicien":                      "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=1200&h=630&fit=crop&q=80",
  "Animateur enfants":             "https://images.unsplash.com/photo-1558171813-13b498fa0b47?w=1200&h=630&fit=crop&q=80",
}

// ─── Shape consommée par VendorProfileClient ─────────────────────────────────
export type VendorDetail = {
  slug: string
  name: string
  category: string
  city: string
  rating: number
  photos: string[]
  heroImg: string | null
  description: string | null
  instagram: string | null
  facebook: string | null
  website: string | null
  phone: string | null
  reviews: { author: string; event: string; note: string; stars: number }[]
}

export type VendorListItem = {
  id: string       // slug sert d'id frontend (cohérent avec l'ancien format)
  name: string
  category: string
  city: string
  rating: number
  instagram: string | null
  facebook: string | null
  hasPhoto: boolean
  photo: string | null
}

// ─── Queries ─────────────────────────────────────────────────────────────────

/**
 * Récupère un vendor par slug avec toutes les infos pour la fiche publique.
 * Retourne null si introuvable.
 */
export async function getVendorBySlug(slug: string): Promise<VendorDetail | null> {
  const v = await prisma.vendor.findUnique({
    where: { slug },
    select: {
      slug: true,
      name: true,
      category: true,
      city: true,
      rating: true,
      description: true,
      instagram: true,
      facebook: true,
      website: true,
      phone: true,
      media: {
        select: { url: true, order: true },
        orderBy: { order: "asc" },
        take: 20,
      },
      reviews: {
        select: {
          rating: true,
          comment: true,
          eventType: true,
          author: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  })

  if (!v) return null

  const photos = v.media.map(m => m.url)
  const heroImg = photos[0] ?? CAT_FALLBACK_IMAGE[v.category] ?? null

  return {
    slug: v.slug,
    name: v.name,
    category: v.category,
    city: v.city ?? "",
    rating: v.rating ?? 4,
    photos,
    heroImg,
    description: v.description,
    instagram: v.instagram,
    facebook: v.facebook,
    website: v.website,
    phone: v.phone,
    reviews: v.reviews.map(r => ({
      author: r.author?.name ?? "Anonyme",
      event: r.eventType ?? "Événement",
      note: r.comment ?? "",
      stars: r.rating,
    })),
  }
}

/**
 * Retourne tous les slugs existants — pour generateStaticParams + sitemap.
 */
export async function getAllVendorSlugs(): Promise<string[]> {
  const rows = await prisma.vendor.findMany({ select: { slug: true } })
  return rows.map(r => r.slug)
}

/**
 * Vérifie qu'un slug existe en DB — utilisé par les validations API (claim, etc.)
 */
export async function vendorSlugExists(slug: string): Promise<boolean> {
  const hit = await prisma.vendor.findUnique({ where: { slug }, select: { id: true } })
  return hit !== null
}

/**
 * Liste light pour la page /explore — tous les vendors avec le strict nécessaire
 * pour filtrage + affichage de card. `hasPhoto` remplace l'ancien VENDORS_WITH_PHOTO.
 */
export async function getAllVendorsForExplore(): Promise<VendorListItem[]> {
  const [weights, rows] = await Promise.all([
    getRankingWeights(),
    prisma.vendor.findMany({
      select: {
        slug: true,
        name: true,
        category: true,
        city: true,
        rating: true,
        reviewCount: true,
        featured: true,
        instagram: true,
        facebook: true,
        media: { select: { url: true }, orderBy: { order: "asc" }, take: 1 },
        _count: { select: { media: true } },
      },
    }),
  ])

  const scored = sortByScore(
    rows.map(r => ({ ...r, mediaCount: r._count.media })),
    weights
  )

  return scored.map(r => ({
    id: r.slug,
    name: r.name,
    category: r.category,
    city: r.city ?? "",
    rating: r.rating ?? 4,
    instagram: r.instagram,
    facebook: r.facebook,
    hasPhoto: r._count.media > 0,
    photo: r.media[0]?.url ?? null,
  }))
}
