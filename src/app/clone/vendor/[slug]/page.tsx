import { VENDOR_BASIC } from "@/lib/vendorData"
import { VENDOR_DETAILS, CAT_PHOTOS } from "@/lib/vendorDetails"
import AntVendorProfile from "./AntVendorProfile"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

const CAT_IMAGES: Record<string, string> = {
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

export function generateStaticParams() {
  return Object.keys(VENDOR_DETAILS).map(slug => ({ slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const vendor = VENDOR_BASIC[slug]
  if (!vendor) return { title: "Prestataire introuvable — Momento" }
  return {
    title: `${vendor.name} — ${vendor.category} · ${vendor.city} | Momento`,
    description: `Découvrez ${vendor.name}, ${vendor.category.toLowerCase()} basé(e) à ${vendor.city}. Contactez ce prestataire directement sur Momento.`,
  }
}

export default async function CloneVendorPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const vendor = VENDOR_BASIC[slug]
  if (!vendor) notFound()

  const extra = VENDOR_DETAILS[slug]
  const catPhotos = CAT_PHOTOS[vendor.category] ?? []
  const photos: string[] = extra?.photos ?? catPhotos
  const heroImg = photos[0] ?? CAT_IMAGES[vendor.category] ?? null

  // Static reviews from vendor details
  const reviews: { author: string; event: string; note: string; stars: number }[] =
    (extra?.reviews as { author: string; event: string; note: string; stars: number }[] | undefined) ?? []

  return (
    <AntVendorProfile
      slug={slug}
      name={vendor.name}
      category={vendor.category}
      city={vendor.city}
      rating={vendor.rating}
      photos={photos}
      heroImg={heroImg}
      description={(extra as { description?: string } | undefined)?.description ?? null}
      instagram={vendor.instagram ?? null}
      facebook={vendor.facebook ?? null}
      reviews={reviews}
    />
  )
}
