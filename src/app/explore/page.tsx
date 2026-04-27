import type { Metadata } from "next"
import { getAllVendorsForExplore } from "@/lib/vendorQueries"
import ExploreClient from "./ExploreClient"

// Revalidation ISR : liste publique rafraîchie toutes les heures,
// ou immédiatement via revalidatePath depuis l'admin.
export const revalidate = 3600

export const metadata: Metadata = {
  title: "Tous les prestataires mariage au Maroc",
  description:
    "Découvrez 1000+ prestataires événementiels vérifiés au Maroc. Photographes, DJ, traiteurs, neggafa, décorateurs, wedding planners — 41 villes, contact direct.",
  alternates: { canonical: "https://momentoevents.app/explore" },
  openGraph: {
    title: "Tous les prestataires mariage au Maroc | Momento",
    description:
      "1000+ prestataires événementiels vérifiés au Maroc. Photographes, DJ, traiteurs, décorateurs, wedding planners.",
    url: "https://momentoevents.app/explore",
    siteName: "Momento",
    locale: "fr_MA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tous les prestataires mariage au Maroc | Momento",
    description:
      "1000+ prestataires événementiels vérifiés au Maroc.",
  },
}

export default async function ExplorePage() {
  const vendors = await getAllVendorsForExplore()
  return <ExploreClient initialVendors={vendors} totalCount={vendors.length} />
}
