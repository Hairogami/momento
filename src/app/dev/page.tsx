import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import DevPanelClient from "./DevPanelClient"

const ADMIN_EMAIL = "moumene486@gmail.com"

export default async function DevPanelPage() {
  const session = await auth()
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    redirect("/")
  }
  return <DevPanelClient />
}
