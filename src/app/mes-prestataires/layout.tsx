import { requireProPlan } from "@/lib/requirePro"

export default async function MesPrestatairesLayout({ children }: { children: React.ReactNode }) {
  await requireProPlan({ from: "/mes-prestataires", reason: "vendors.contact" })
  return <>{children}</>
}
