"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_RSVP = ["PENDING", "CONFIRMED", "DECLINED"] as const

export async function addGuest(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return;

  const workspaceId = formData.get("workspaceId") as string;
  const name  = (formData.get("name") as string)?.trim().slice(0, 100);
  const email = (formData.get("email") as string)?.trim().slice(0, 200) || null;
  const phone = (formData.get("phone") as string)?.trim().slice(0, 20)  || null;
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

  if (!(VALID_RSVP as readonly string[]).includes(rsvp)) return;

  const guest = await prisma.guest.findUnique({ where: { id }, select: { workspace: { select: { userId: true } } } });
  if (!guest || guest.workspace.userId !== session.user.id) return;

  await prisma.guest.update({
    where: { id },
    data: { rsvp },
  });
  revalidatePath("/guests");
}
