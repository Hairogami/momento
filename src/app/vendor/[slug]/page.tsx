import type { Metadata } from "next"
import { VENDOR_BASIC } from "@/lib/vendorData"
import { VENDOR_DETAILS } from "@/lib/vendorDetails"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import VendorPageClient from "./VendorPageClient"

// Pre-render vendors that have rich details (photos, descriptions)
export function generateStaticParams() {
  return Object.keys(VENDOR_DETAILS).map(slug => ({ slug }))
}

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

const APP_URL = process.env.NEXT_PUBLIC_APP_URL?.replace("localhost:3000", "momentoevents.app") ?? "https://momentoevents.app"

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const vendor = VENDOR_BASIC[slug]
  if (!vendor) {
    return { title: "Prestataire introuvable — Momento" }
  }

  const title = `${vendor.name} — ${vendor.category} à ${vendor.city} | Momento`
  const description = `Découvrez ${vendor.name}, ${vendor.category.toLowerCase()} basé(e) à ${vendor.city}. Contactez ce prestataire directement sur Momento, l'annuaire #1 des prestataires événementiels au Maroc.`
  const ogImage = CAT_IMAGES[vendor.category] ?? `${APP_URL}/og-default.jpg`
  const canonical = `${APP_URL}/vendor/${slug}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Momento",
      locale: "fr_MA",
      type: "profile",
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${vendor.name} — ${vendor.category}` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function VendorPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const vendor = VENDOR_BASIC[slug]
  const claimed = !!(await prisma.vendorProfile.findUnique({ where: { slug }, select: { id: true } }))

  // JSON-LD structured data (LocalBusiness)
  const jsonLd = vendor ? {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": vendor.name,
    "description": `${vendor.category} basé(e) à ${vendor.city}, Maroc. Disponible pour mariages, fiançailles et événements privés.`,
    "url": `${APP_URL}/vendor/${slug}`,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": vendor.city,
      "addressCountry": "MA"
    },
    "priceRange": "MAD",
    ...(vendor.instagram ? { "sameAs": [vendor.instagram] } : {}),
  } : null

  const session = await auth()
  const currentUserId = session?.user?.id ?? null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <VendorPageClient slug={slug} claimed={claimed} currentUserId={currentUserId} />
    </>
  )
}
