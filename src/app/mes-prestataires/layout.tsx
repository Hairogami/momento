import { requireAuth } from "@/lib/requireAuth"

export default async function MesPrestatairesLayout({ children }: { children: React.ReactNode }) {
  await requireAuth("/mes-prestataires")
  return <>{children}</>
}
