import { requireAuth } from "@/lib/requireAuth"

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  await requireAuth("/settings")
  return <>{children}</>
}
