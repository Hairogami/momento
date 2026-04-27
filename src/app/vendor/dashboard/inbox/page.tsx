/**
 * Messages prestataire — vue chat 2-panneaux miroir de /messages côté client.
 * Server component thin : layout parent a déjà validé role=vendor.
 * NB: l'ancien InboxClient (vue tableau par statuts) reste disponible mais
 * n'est plus utilisé ici — pourra être réintégré dans une page funnel séparée.
 */
import VendorMessagesClient from "@/components/vendor/messages/VendorMessagesClient"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Messages — Espace prestataire",
  robots: { index: false, follow: false },
}

export default function VendorMessagesPage() {
  return <VendorMessagesClient />
}
