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

// Tronque proprement à `max` chars sans couper un mot, et ajoute "…"
// si tronqué. Évite les meta descriptions hachées au milieu d'un mot.
function truncateForMeta(text: string, max: number = 160): string {
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  const lastSpace = cut.lastIndexOf(" ")
  return (lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trimEnd() + "…"
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const vendor = await getVendorBySlug(slug)
  if (!vendor) {
    return {
      title: "Prestataire introuvable",
      robots: { index: false, follow: false },
    }
  }

  const heroImg = vendor.heroImg ?? CAT_FALLBACK_IMAGE[vendor.category] ?? null
  const fallbackDesc = `${vendor.name}, ${vendor.category.toLowerCase()} de mariage à ${vendor.city}. Voir packages, photos et avis. Contact direct sur Momento.`
  const description = truncateForMeta(vendor.description?.trim() || fallbackDesc, 160)
  const title = `${vendor.name} — ${vendor.category} à ${vendor.city}`
  const canonical = `https://momentoevents.app/vendor/${slug}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${title} | Momento`,
      description,
      url: canonical,
      siteName: "Momento",
      locale: "fr_MA",
      type: "profile",
      images: heroImg ? [{ url: heroImg, alt: `${vendor.name} — ${vendor.category}` }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Momento`,
      description,
      images: heroImg ? [heroImg] : undefined,
    },
  }
}

export default async function VendorPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const vendor = await getVendorBySlug(slug)
  if (!vendor) notFound()

  const heroImg = vendor.heroImg ?? CAT_FALLBACK_IMAGE[vendor.category] ?? undefined
  const sameAs = [vendor.instagram, vendor.facebook, vendor.website].filter(
    (u): u is string => Boolean(u)
  )

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `https://momentoevents.app/vendor/${vendor.slug}`,
    name: vendor.name,
    url: `https://momentoevents.app/vendor/${vendor.slug}`,
    image: heroImg,
    address: { "@type": "PostalAddress", addressLocality: vendor.city, addressCountry: "MA" },
    description: vendor.description ?? `${vendor.category} à ${vendor.city}`,
    areaServed: vendor.city,
    priceRange: "$$",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: vendor.rating,
      reviewCount: Math.max(vendor.reviews.length, 1),
      bestRating: 5,
      worstRating: 1,
    },
    ...(vendor.reviews.length > 0 && {
      review: vendor.reviews.map(r => ({
        "@type": "Review",
        author: { "@type": "Person", name: r.author },
        reviewRating: { "@type": "Rating", ratingValue: r.stars, bestRating: 5 },
        reviewBody: r.note,
      })),
    }),
    ...(sameAs.length > 0 && { sameAs }),
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
