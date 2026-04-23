import { requireProPlan } from "@/lib/requirePro"

export default async function PlannerLayout({ children }: { children: React.ReactNode }) {
  await requireProPlan({ from: "/planner", reason: "planner" })
  return <>{children}</>
}
