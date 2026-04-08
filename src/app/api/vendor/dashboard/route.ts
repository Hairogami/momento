import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, vendorSlug: true, vendorProfile: true },
  })

  if (!user || user.role !== "vendor" || !user.vendorSlug) {
    return NextResponse.json({ error: "Accès réservé aux prestataires." }, { status: 403 })
  }

  const slug = user.vendorSlug

  const [contacts, conversations, vendorProfile] = await Promise.all([
    prisma.contactRequest.findMany({
      where: { vendorSlug: slug },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.conversation.findMany({
      where: { vendorSlug: slug },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        client: { select: { id: true, name: true, email: true, image: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    user.vendorProfile,
  ])

  // Response time stats from conversations
  const totalConversations = conversations.length
  const respondedConversations = conversations.filter(c => {
    const msgs = c.messages
    // Check if vendor replied (has a message from a different sender than the client)
    return msgs.length > 0
  }).length

  const responseRate = totalConversations > 0
    ? Math.round((respondedConversations / totalConversations) * 100)
    : 0

  return NextResponse.json({
    slug,
    plan: vendorProfile?.plan ?? "free",
    contacts: contacts.map(c => ({
      id: c.id,
      clientName: c.clientName,
      clientEmail: c.clientEmail,
      clientPhone: c.clientPhone,
      eventType: c.eventType,
      eventDate: c.eventDate,
      message: c.message,
      status: c.status,
      createdAt: c.createdAt.toISOString(),
    })),
    stats: {
      totalContacts: contacts.length,
      pendingContacts: contacts.filter(c => c.status === "pending").length,
      confirmedContacts: contacts.filter(c => c.status === "confirmed").length,
      totalConversations,
      responseRate,
    },
  })
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, vendorSlug: true },
  })

  if (!user || user.role !== "vendor" || !user.vendorSlug) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 })
  }

  let body: Record<string, unknown>
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
  }

  const { contactId, status } = body
  if (typeof contactId !== "string" || !["pending", "confirmed", "declined"].includes(status as string)) {
    return NextResponse.json({ error: "Paramètres invalides." }, { status: 400 })
  }

  // Verify contact belongs to this vendor
  const contact = await prisma.contactRequest.findUnique({
    where: { id: contactId },
    select: { vendorSlug: true },
  })

  if (!contact || contact.vendorSlug !== user.vendorSlug) {
    return NextResponse.json({ error: "Contact introuvable." }, { status: 404 })
  }

  const updated = await prisma.contactRequest.update({
    where: { id: contactId },
    data: { status: status as string },
  })

  return NextResponse.json({ id: updated.id, status: updated.status })
}
