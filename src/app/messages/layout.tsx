import { requireProPlan } from "@/lib/requirePro"

export default async function MessagesLayout({ children }: { children: React.ReactNode }) {
  await requireProPlan({ from: "/messages", reason: "messages" })
  return <>{children}</>
}
