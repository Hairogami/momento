"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function addBudgetItem(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return;

  const workspaceId = formData.get("workspaceId") as string;
  const label    = (formData.get("label") as string)?.trim().slice(0, 200);
  const category = (formData.get("category") as string)?.trim().slice(0, 100);
  const estimated = parseFloat(formData.get("estimated") as string);
  const raw = formData.get("plannerId") as string | null;
  const plannerId = raw && raw !== "__none__" ? raw : null;

  if (!workspaceId || !label || !category || !isFinite(estimated) || estimated < 0 || !plannerId) return;

  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId }, select: { userId: true } });
  if (!workspace || workspace.userId !== session.user.id) return;

  if (plannerId) {
    const planner = await prisma.planner.findUnique({ where: { id: plannerId }, select: { userId: true } });
    if (!planner || planner.userId !== session.user.id) return;
  }

  await prisma.budgetItem.create({
    data: { workspaceId, label, category, estimated, plannerId },
  });

  revalidatePath("/budget");
}

export async function togglePaid(id: string, paid: boolean) {
  const session = await auth();
  if (!session?.user?.id) return;

  const item = await prisma.budgetItem.findUnique({ where: { id }, select: { workspace: { select: { userId: true } } } });
  if (!item || item.workspace.userId !== session.user.id) return;

  await prisma.budgetItem.update({ where: { id }, data: { paid } });
  revalidatePath("/budget");
}

export async function updateBudget(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return;

  const workspaceId = formData.get("workspaceId") as string;
  const budget = parseFloat(formData.get("budget") as string);

  if (!workspaceId || !isFinite(budget) || budget < 0) return;

  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId }, select: { userId: true } });
  if (!workspace || workspace.userId !== session.user.id) return;

  await prisma.workspace.update({ where: { id: workspaceId }, data: { budget } });
  revalidatePath("/budget");
}
