import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateBookingSchema = z.object({
  vendorId:    z.string().min(1).max(100),
  workspaceId: z.string().min(1).max(100),
  plannerId:   z.string().optional(),
  status:      z.enum(["inquiry", "interested", "confirmed", "cancelled"]).default("inquiry"),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Non authentifié." }, { status: 401 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return Response.json({ error: "Corps invalide." }, { status: 400 });
  }

  const parsed = CreateBookingSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Données invalides.", details: parsed.error.flatten() }, { status: 400 });
  }

  const { vendorId, workspaceId, plannerId, status } = parsed.data;

  // Vérifier que le workspace appartient à l'utilisateur
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { userId: true },
  });
  if (!workspace || workspace.userId !== session.user.id) {
    return Response.json({ error: "Workspace introuvable." }, { status: 403 });
  }

  // Vérifier que le vendor existe
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: { id: true },
  });
  if (!vendor) {
    return Response.json({ error: "Prestataire introuvable." }, { status: 404 });
  }

  // Éviter les doublons (même workspace + vendor)
  const existing = await prisma.booking.findFirst({
    where: { workspaceId, vendorId },
    select: { id: true, status: true },
  });
  if (existing) {
    return Response.json({ id: existing.id, status: existing.status, duplicate: true });
  }

  const booking = await prisma.booking.create({
    data: {
      workspaceId,
      vendorId,
      plannerId: plannerId ?? null,
      status,
    },
    select: { id: true, status: true, vendorId: true },
  });

  return Response.json(booking, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { searchParams } = await Promise.resolve(req.nextUrl);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "id requis." }, { status: 400 });

  const booking = await prisma.booking.findUnique({
    where: { id },
    select: { workspace: { select: { userId: true } } },
  });
  if (!booking || booking.workspace.userId !== session.user.id) {
    return Response.json({ error: "Non autorisé." }, { status: 403 });
  }

  await prisma.booking.delete({ where: { id } });
  return Response.json({ ok: true });
}
