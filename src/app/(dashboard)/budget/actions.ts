"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function addBudgetItem(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return;

  const workspaceId = formData.get("workspaceId") as string;
  const label = formData.get("label") as string;
  const category = formData.get("category") as string;
  const estimated = parseFloat(formData.get("estimated") as string);

  if (!workspaceId || !label || isNaN(estimated)) return;

  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId }, select: { userId: true } });
  if (!workspace || workspace.userId !== session.user.id) return;

  await prisma.budgetItem.create({
    data: { workspaceId, label, category, estimated },
  });

  revalidatePath("/budget");
}

export async function togglePaid(id: string, paid: boolean) {
  const session = await auth();
  if (!session?.user?.id) return;

  const item = await prisma.budgetItem.findUnique({ where: { id }, select: { workspace: { select: { userId: true } } } });
  if (!item || item.workspace.userId !== session.user.id) return;

  await prisma.budgetItem.update({
    where: { id },
    data: { paid },
  });
  revalidatePath("/budget");
}
