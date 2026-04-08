"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function registerAction({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  if (!email || !password || password.length < 8) {
    return { error: "Mot de passe trop court (8 caractères minimum)." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Un compte existe déjà avec cet email." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { name: name || null, email, passwordHash },
  });

  return { success: true };
}
