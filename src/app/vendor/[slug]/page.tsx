import { getVendorBySlug, getAllVendorSlugs, CAT_FALLBACK_IMAGE } from "@/lib/vendorQueries"
import VendorProfileClient from "./VendorProfileClient"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

// Revalidation ISR : fiche publique mise à jour toutes les heures
// OU immédiatement via revalidatePath depuis l'admin / dashboard
export const revalidate = 3600

// ISR on-demand : pas de pre-render au build (évite saturation DB Neon
// avec 827 vendors). Chaque page est générée à la première visite
// et cachée 1h. Gain build time + connexions DB.
export async function generateStaticParams() {
  return []
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const vendor = await getVendorBySlug(slug)
  if (!vendor) return { title: "Prestataire introuvable — Momento" }

  const heroImg = vendor.heroImg ?? CAT_FALLBACK_IMAGE[vendor.category]
  return {
    title: `${vendor.name} — ${vendor.category} · ${vendor.city} | Momento`,
    description: vendor.description
      ?? `Découvrez ${vendor.name}, ${vendor.category.toLowerCase()} basé(e) à ${vendor.city}. Contactez ce prestataire directement sur Momento.`,
    openGraph: {
      title: `${vendor.name} — ${vendor.category} · ${vendor.city}`,
      description: vendor.description ?? `${vendor.category} à ${vendor.city}`,
      images: heroImg ? [heroImg] : undefined,
    },
    alternates: { canonical: `https://momentoevents.app/vendor/${slug}` },
  }
}

export default async function VendorPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const vendor = await getVendorBySlug(slug)
  if (!vendor) notFound()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: vendor.name,
    image: vendor.heroImg ?? undefined,
    address: { "@type": "PostalAddress", addressLocality: vendor.city, addressCountry: "MA" },
    description: vendor.description ?? `${vendor.category} à ${vendor.city}`,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: vendor.rating,
      reviewCount: Math.max(vendor.reviews.length, 1),
    },
    ...(vendor.reviews.length > 0 && {
      review: vendor.reviews.map(r => ({
        "@type": "Review",
        author: { "@type": "Person", name: r.author },
        reviewRating: { "@type": "Rating", ratingValue: r.stars, bestRating: 5 },
        reviewBody: r.note,
      })),
    }),
  }

  return (
    <>
      {/* JSON-LD : on échappe `<` en `<` pour empêcher un break-out via une
          description vendor contenant `</script>` (champ user-controlled depuis /api/vendor/profile). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <VendorProfileClient
        slug={vendor.slug}
        name={vendor.name}
        category={vendor.category}
        city={vendor.city}
        rating={vendor.rating}
        photos={vendor.photos}
        heroImg={vendor.heroImg}
        description={vendor.description}
        instagram={vendor.instagram}
        facebook={vendor.facebook}
        website={vendor.website}
        reviews={vendor.reviews}
      />
    </>
  )
}
