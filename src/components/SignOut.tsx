"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { C } from "@/lib/colors"

export function SignOut() {
  const router = useRouter()

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:opacity-80"
      style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#EF4444" }}
    >
      <LogOut size={18} />
      <span className="font-medium text-sm">Se déconnecter</span>
    </button>
  )
}
