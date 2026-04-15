/**
 * Éditeur packages prestataire — 3 niveaux recommandés : Essentiel / Premium / Signature.
 * Layout parent gère l'auth.
 */
import PackagesEditor from "@/components/vendor/packages/PackagesEditor"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Packages & tarifs — Espace prestataire",
  robots: { index: false, follow: false },
}

export default function VendorPackagesPage() {
  return <PackagesEditor />
}
