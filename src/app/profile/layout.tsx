import { requireAuth } from "@/lib/requireAuth"

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  await requireAuth("/profile")
  return <>{children}</>
}
