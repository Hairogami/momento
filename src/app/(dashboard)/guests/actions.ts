"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function addGuest(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return;

  const workspaceId = formData.get("workspaceId") as string;
  const name = formData.get("name") as string;
  const email = (formData.get("email") as string) || null;
  const phone = (formData.get("phone") as string) || null;
  const plusOne = formData.get("plusOne") === "on";

  if (!workspaceId || !name) return;

  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId }, select: { userId: true } });
  if (!workspace || workspace.userId !== session.user.id) return;

  await prisma.guest.create({
    data: { workspaceId, name, email, phone, plusOne },
  });

  revalidatePath("/guests");
}

export async function updateRsvp(id: string, rsvp: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  const guest = await prisma.guest.findUnique({ where: { id }, select: { workspace: { select: { userId: true } } } });
  if (!guest || guest.workspace.userId !== session.user.id) return;

  await prisma.guest.update({
    where: { id },
    data: { rsvp },
  });
  revalidatePath("/guests");
}
