/**
 * Édition du profil prestataire — layout parent gère l'auth.
 * Le composant client lit /api/vendor/profile + /api/vendor/completion en parallèle.
 */
import ProfileEditor from "@/components/vendor/profile/ProfileEditor"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Mon profil — Espace prestataire",
  robots: { index: false, follow: false },
}

export default function VendorProfilePage() {
  return <ProfileEditor />
}
