import { redirect } from "next/navigation"

/**
 * /prestataire/claim (sans slug) → redirige vers /signup
 * Les CTAs "Rejoindre" sur /prestataire et /prestataires pointent ici.
 * L'inscription prestataire passe par /signup (sélection rôle vendor).
 */
export default function ClaimRootPage() {
  redirect("/signup")
}
