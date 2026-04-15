/**
 * Gestionnaire de templates de réponse — FR / darija / AR.
 * Layout parent gère l'auth.
 */
import TemplatesManager from "@/components/vendor/templates/TemplatesManager"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Templates de réponse — Espace prestataire",
  robots: { index: false, follow: false },
}

export default function VendorTemplatesPage() {
  return <TemplatesManager />
}
