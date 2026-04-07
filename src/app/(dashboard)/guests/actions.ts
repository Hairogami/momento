"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function addGuest(formData: FormData) {
  const workspaceId = formData.get("workspaceId") as string;
  const name = formData.get("name") as string;
  const email = (formData.get("email") as string) || null;
  const phone = (formData.get("phone") as string) || null;
  const plusOne = formData.get("plusOne") === "on";

  if (!workspaceId || !name) return;

  await prisma.guest.create({
    data: { workspaceId, name, email, phone, plusOne },
  });

  revalidatePath("/guests");
}

export async function updateRsvp(id: string, rsvp: string) {
  await prisma.guest.update({
    where: { id },
    data: { rsvp },
  });
  revalidatePath("/guests");
}
