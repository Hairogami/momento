import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Non authentifié." }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  if (body.confirm !== "SUPPRIMER") {
    return Response.json({ error: "Confirmation invalide. Tape SUPPRIMER pour confirmer." }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: { id: true, passwordHash: true },
  })
  if (!user) return Response.json({ error: "Compte introuvable." }, { status: 404 })

  // Si compte credentials → vérification mot de passe
  if (user.passwordHash) {
    if (!body.password || typeof body.password !== "string") {
      return Response.json({ error: "Mot de passe requis." }, { status: 400 })
    }
    if ((body.password as string).length > 128) {
      return Response.json({ error: "Mot de passe invalide." }, { status: 400 })
    }
    const valid = await bcrypt.compare(body.password, user.passwordHash)
    if (!valid) return Response.json({ error: "Mot de passe incorrect." }, { status: 401 })
  }

  // Cascade automatique via Prisma onDelete: Cascade
  await prisma.user.delete({ where: { id: user.id } })
  return Response.json({ ok: true })
}
