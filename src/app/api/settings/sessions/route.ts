import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Note: en stratégie JWT (config actuelle), il n'y a pas de Session DB persistée.
// On retourne la liste des Account providers comme proxy "appareils connectés OAuth".
// Si l'app passe un jour en stratégie database, on lit prisma.session directement.

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Non authentifié." }, { status: 401 })

  // Sessions DB (si existantes — strategy database)
  const dbSessions = await prisma.session.findMany({
    where:   { userId: session.user.id },
    orderBy: { expires: "desc" },
    select:  { id: true, expires: true, sessionToken: true },
  }).catch(() => [])

  // Comptes OAuth liés (toujours utiles à voir)
  const accounts = await prisma.account.findMany({
    where:  { userId: session.user.id },
    select: { id: true, provider: true, type: true },
  })

  return Response.json({
    sessions: dbSessions.map(s => ({
      id: s.id,
      expires: s.expires,
      // Ne jamais exposer le sessionToken complet
      preview: s.sessionToken.slice(0, 6) + "…",
    })),
    accounts,
  })
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Non authentifié." }, { status: 401 })

  const url = new URL(req.url)
  const id  = url.searchParams.get("id")
  const all = url.searchParams.get("all") === "true"

  if (all) {
    await prisma.session.deleteMany({ where: { userId: session.user.id } })
    return Response.json({ ok: true, all: true })
  }
  if (id) {
    await prisma.session.deleteMany({ where: { id, userId: session.user.id } })
    return Response.json({ ok: true, id })
  }
  return Response.json({ error: "id ou all=true requis." }, { status: 400 })
}
