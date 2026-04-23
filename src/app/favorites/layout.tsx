import { requireProPlan } from "@/lib/requirePro"

export default async function FavoritesLayout({ children }: { children: React.ReactNode }) {
  await requireProPlan({ from: "/favorites", reason: "favorites" })
  return <>{children}</>
}
