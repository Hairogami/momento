"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function addBudgetItem(formData: FormData) {
  const workspaceId = formData.get("workspaceId") as string;
  const label = formData.get("label") as string;
  const category = formData.get("category") as string;
  const estimated = parseFloat(formData.get("estimated") as string);

  if (!workspaceId || !label || isNaN(estimated)) return;

  await prisma.budgetItem.create({
    data: { workspaceId, label, category, estimated },
  });

  revalidatePath("/budget");
}

export async function togglePaid(id: string, paid: boolean) {
  await prisma.budgetItem.update({
    where: { id },
    data: { paid },
  });
  revalidatePath("/budget");
}
