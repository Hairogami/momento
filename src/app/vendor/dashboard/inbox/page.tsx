/**
 * Inbox prestataire — liste des demandes avec filtres par statut, recherche,
 * transitions (new → read → replied → won/lost) et modal de réponse avec templates.
 * Server component thin : layout parent a déjà validé role=vendor.
 */
import InboxClient from "@/components/vendor/inbox/InboxClient"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Inbox — Espace prestataire",
  robots: { index: false, follow: false },
}

export default function VendorInboxPage() {
  return <InboxClient />
}
