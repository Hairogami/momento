import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { IS_DEV } from "@/lib/devMock"
import MobilePreviewClient from "./MobilePreviewClient"

export const dynamic = "force-dynamic"

/**
 * Aperçu téléphone (local uniquement) : affiche une page du site dans un cadre
 * mobile de taille fixe, indépendant de la largeur de la fenêtre.
 * Disponible en `next dev` ET en `next start` local (pour juger la fluidité réelle
 * d'un build de prod). Garde sur l'hôte et non sur `VERCEL` : `vercel env pull`
 * recopie VERCEL dans les .env locaux. En prod (momentoevents.app) → 404.
 * La page n'expose aucune donnée : elle encadre seulement une page publique du site.
 */
export default async function MobilePreviewPage() {
  const host = (await headers()).get("host") ?? ""
  const isLocalHost = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)
  if (!IS_DEV && !isLocalHost) notFound()
  return <MobilePreviewClient />
}
