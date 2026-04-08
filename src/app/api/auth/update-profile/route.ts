import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 })
  }

  let body: Record<string, unknown>
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
  }

  const allowed = ["firstName", "lastName", "name", "username", "phone", "location", "companyName", "vendorCategory", "image"] as const
  type AllowedKey = typeof allowed[number]

  const updates: Partial<Record<AllowedKey, string | null>> = {}

  for (const key of allowed) {
    if (key in body) {
      const val = body[key]
      updates[key] = typeof val === "string"
        ? (key === "image" ? val || null : val.trim().slice(0, 200) || null)
        : null
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Aucun champ à mettre à jour." }, { status: 400 })
  }

  try {
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updates,
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        phone: true,
        location: true,
        companyName: true,
        vendorCategory: true,
        image: true,
      },
    })

    return NextResponse.json({ user })
  } catch (err) {
    console.error("[update-profile]", err)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
