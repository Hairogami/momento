import { requireAuth } from "@/lib/requireAuth"

export default async function BudgetLayout({ children }: { children: React.ReactNode }) {
  await requireAuth("/budget")
  return <>{children}</>
}
