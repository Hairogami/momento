/**
 * PATCH /api/vendor/requests/[id] — transition de statut sur une demande client
 *
 * Statuts autorisés : new | read | replied | won | lost
 * Side-effects :
 *   - → read    : set readAt = now() si null
 *   - → replied : set readAt = now() si null, repliedAt = now() si null
 *   - → won     : terminal (garde les timestamps)
 *   - → lost    : terminal (garde les timestamps)
 *
 * Guard : un statut terminal (won/lost) ne redescend PAS vers new/read/replied.
 * Auth : role="vendor" + vendorSlug. IDOR-safe : contact.vendorSlug === user.vendorSlug.
 *
 * Exposé (plus tard) côté client : le planner verra readAt/repliedAt dans sa
 * messagerie (effet "vu/répondu" type WhatsApp).
 */
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const STATUSES = ["new", "read", "replied", "won", "lost"] as const
const TERMINAL = new Set<string>(["won", "lost"])

const BodySchema = z.object({
  status: z.enum(STATUSES),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // ── Auth ─────────────────────────────────────────────────────────────────
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 })
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, vendorSlug: true },
  })
  if (!user || user.role !== "vendor" || !user.vendorSlug) {
    return NextResponse.json({ error: "Accès réservé aux prestataires." }, { status: 403 })
  }

  // ── Parse body ───────────────────────────────────────────────────────────
  const body = await req.json().catch(() => null)
  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Statut invalide." },
      { status: 400 }
    )
  }
  const nextStatus = parsed.data.status

  // ── Ownership + current state ────────────────────────────────────────────
  const current = await prisma.contactRequest.findUnique({
    where: { id },
    select: {
      id: true, vendorSlug: true, status: true,
      readAt: true, repliedAt: true,
    },
  })
  if (!current) {
    return NextResponse.json({ error: "Demande introuvable." }, { status: 404 })
  }
  if (current.vendorSlug !== user.vendorSlug) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 })
  }

  // ── Guard : pas de retour en arrière depuis un statut terminal ───────────
  if (TERMINAL.has(current.status) && !TERMINAL.has(nextStatus)) {
    return NextResponse.json(
      { error: "Une demande gagnée/perdue ne peut pas repasser à 'nouvelle'." },
      { status: 409 }
    )
  }

  // ── Side-effects sur les timestamps ──────────────────────────────────────
  const now = new Date()
  const data: {
    status: string
    readAt?: Date
    repliedAt?: Date
  } = { status: nextStatus }

  if (nextStatus === "read" && !current.readAt) {
    data.readAt = now
  }
  if (nextStatus === "replied") {
    if (!current.readAt)    data.readAt    = now
    if (!current.repliedAt) data.repliedAt = now
  }
  // won/lost : on garde les timestamps tels quels (ou null s'ils n'ont jamais été read/replied)

  const updated = await prisma.contactRequest.update({
    where: { id: current.id },
    data,
    select: {
      id: true, status: true, readAt: true, repliedAt: true,
    },
  })

  return NextResponse.json({ request: updated })
}
