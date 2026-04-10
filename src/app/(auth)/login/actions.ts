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
  if (!email || !password) {
    return { error: "Email et mot de passe requis." };
  }
  if (password.length < 8) {
    return { error: "Mot de passe trop court (8 caractères minimum)." };
  }
  const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!strongPassword.test(password)) {
    return { error: "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre." };
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    // C03: generic message to prevent email enumeration
    return { error: "Une erreur est survenue. Veuillez réessayer." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { name: name || null, email: normalizedEmail, passwordHash },
  });

  return { success: true };
}
