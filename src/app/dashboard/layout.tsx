import { requireAuth } from "@/lib/requireAuth"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireAuth("/dashboard")
  return <>{children}</>
}
