import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * POST /api/user/consent
 * Applique le consentement (CGU + marketing) sur le user connecté.
 * Utilisé après OAuth callback pour persister les cases cochées côté client
 * avant le redirect OAuth.
 */
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const body = (await req.json().catch(() => null)) as { agreedTos?: boolean; marketingOptIn?: boolean } | null
  if (!body?.agreedTos) {
    return NextResponse.json({ error: "Acceptation CGU requise." }, { status: 400 })
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      agreedTosAt:    new Date(),
      marketingOptIn: body.marketingOptIn !== false,
    },
    select: { id: true, agreedTosAt: true, marketingOptIn: true },
  })

  return NextResponse.json(updated)
}
