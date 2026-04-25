import { requireAuth } from "@/lib/requireAuth"

export default async function FavoritesLayout({ children }: { children: React.ReactNode }) {
  await requireAuth("/favorites")
  return <>{children}</>
}
