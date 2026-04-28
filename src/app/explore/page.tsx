import type { Metadata } from "next"
import { getAllVendorsForExplore } from "@/lib/vendorQueries"
import ExploreClient from "./ExploreClient"

// Dynamic rendering : Supabase pooler en session mode (port 5432) cap à 15
// connexions, et le prerender Vercel parallèle saturait le pool en build.
// Cache Upstash 5min dans /api/vendors compense côté runtime perf.
// À ré-évaluer si on passe à un pool size > 50 (Supabase Pro tier).
export const dynamic = "force-dynamic"

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
