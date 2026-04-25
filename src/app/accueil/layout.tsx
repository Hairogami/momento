import { requireAuth } from "@/lib/requireAuth"

export default async function AccueilLayout({ children }: { children: React.ReactNode }) {
  await requireAuth("/accueil")
  return <>{children}</>
}
