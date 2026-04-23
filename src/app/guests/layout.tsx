import { requireProPlan } from "@/lib/requirePro"

export default async function GuestsLayout({ children }: { children: React.ReactNode }) {
  await requireProPlan({ from: "/guests", reason: "guests" })
  return <>{children}</>
}
