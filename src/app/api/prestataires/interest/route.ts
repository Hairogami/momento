import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextRequest } from "next/server"

const TEMPLATES: Record<string, string> = {
  fr:     "Bonjour, je suis intéressé(e) par vos services pour mon événement. Pouvez-vous me contacter pour plus d'informations ?",
  darija: "Salam, bghit n3ref aktar 3la khadamatek. Wach imken tnessni ?",
  ar:     "مرحباً، أنا مهتم بخدماتكم لحفلي. هل يمكنكم التواصل معي للمزيد من المعلومات؟",
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch {
    return Response.json({ error: "Requête invalide." }, { status: 400 })
  }

  const b = body as Record<string, unknown>
  const vendorSlug = typeof b.vendorSlug === "string" ? b.vendorSlug.trim().slice(0, 100) : null
  const plannerId  = typeof b.plannerId  === "string" ? b.plannerId.trim()                : null
  const lang       = typeof b.lang       === "string" && b.lang in TEMPLATES ? b.lang : "fr"

  if (!vendorSlug) return Response.json({ error: "vendorSlug requis." }, { status: 400 })
  if (!plannerId)  return Response.json({ error: "plannerId requis."  }, { status: 400 })

  // IDOR: verify planner belongs to user
  const planner = await prisma.planner.findUnique({
    where: { id: plannerId },
    select: { userId: true },
  })
  if (!planner || planner.userId !== session.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  // Fetch vendor
  const vendor = await prisma.vendor.findUnique({
    where: { slug: vendorSlug },
    select: { slug: true, featured: true, phone: true },
  })
  if (!vendor) return Response.json({ error: "Prestataire introuvable." }, { status: 404 })

  // Create PlannerVendor link (upsert — idempotent)
  await prisma.plannerVendor.upsert({
    where: { plannerId_vendorSlug: { plannerId, vendorSlug } },
    create: { plannerId, vendorSlug, status: "contacted" },
    update: {},
  })

  // Partner: send auto-message via internal messaging
  if (vendor.featured) {
    const content = TEMPLATES[lang] ?? TEMPLATES.fr

    const conversation = await prisma.conversation.upsert({
      where: { clientId_vendorSlug: { clientId: session.user.id, vendorSlug } },
      create: { clientId: session.user.id, vendorSlug },
      update: {},
    })

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: session.user.id,
        content,
      },
    })

    return Response.json({ type: "message", conversationId: conversation.id })
  }

  // Non-partner: return phone for WhatsApp redirect (client handles it)
  return Response.json({ type: "whatsapp", phone: vendor.phone ?? null })
}
