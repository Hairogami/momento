import { getAllVendorsForExplore } from "@/lib/vendorQueries"
import ExploreClient from "./ExploreClient"

// Revalidation ISR : liste publique rafraîchie toutes les heures,
// ou immédiatement via revalidatePath depuis l'admin.
export const revalidate = 3600

export const metadata = {
  title: "Explorer les prestataires — Momento",
  description: "Découvrez 1000+ prestataires événementiels vérifiés au Maroc. Photographes, DJ, traiteurs, neggafa, décorateurs, wedding planners — 41 villes, contact direct.",
}

export default async function ExplorePage() {
  const vendors = await getAllVendorsForExplore()
  return <ExploreClient initialVendors={vendors} totalCount={vendors.length} />
}
