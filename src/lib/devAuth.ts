/**
 * DEV ONLY helper — retourne le premier vrai user en DB en dev, auth réelle en prod.
 */
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { IS_DEV } from "@/lib/devMock"
import { redirect } from "next/navigation"

type SimpleSession = { user: { id: string; name: string | null; email: string } }

let _devUserId: string | null = null

export async function requireSession(): Promise<SimpleSession> {
  if (IS_DEV) {
    if (!_devUserId) {
      const u = await prisma.user.findFirst({
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true, email: true },
      })
      if (u) {
        _devUserId = u.id
        return { user: { id: u.id, name: u.name, email: u.email } }
      }
    } else {
      // ID déjà résolu
      const u = await prisma.user.findUnique({
        where: { id: _devUserId },
        select: { id: true, name: true, email: true },
      })
      if (u) return { user: { id: u.id, name: u.name, email: u.email } }
    }
    // Fallback si DB vide
    return { user: { id: "mock-user-id", name: "Dev User", email: "dev@localhost" } }
  }

  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  return session as SimpleSession
}
