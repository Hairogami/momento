import { requireAuth } from "@/lib/requireAuth"

export default async function NotificationsLayout({ children }: { children: React.ReactNode }) {
  await requireAuth("/notifications")
  return <>{children}</>
}
