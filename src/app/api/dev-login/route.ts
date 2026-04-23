/**
 * DEV-ONLY route — crée une session Auth.js pour le premier user en DB.
 * Bloqué en production (NODE_ENV !== "development" → 404).
 */
import { NextResponse } from "next/server"
import { encode } from "next-auth/jwt"
import { prisma } from "@/lib/prisma"

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return new Response(null, { status: 404 })
  }

  // Dev-login cible en priorité moumene486 (owner), fallback sur premier user créé
  const user =
    (await prisma.user.findUnique({
      where: { email: "moumene486@gmail.com" },
      select: { id: true, email: true, name: true, image: true, role: true },
    })) ??
    (await prisma.user.findFirst({
      orderBy: { createdAt: "asc" },
      select: { id: true, email: true, name: true, image: true, role: true },
    }))

  if (!user) {
    return Response.json({ error: "Aucun user en DB" }, { status: 500 })
  }

  const secret = process.env.AUTH_SECRET
  if (!secret) return Response.json({ error: "AUTH_SECRET manquant" }, { status: 500 })

  const token = await encode({
    token: {
      sub: user.id,
      email: user.email,
      name: user.name,
      picture: user.image,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24h
    },
    secret,
    salt: "authjs.session-token",
  })

  const res = NextResponse.redirect(new URL("/dashboard", process.env.NEXTAUTH_URL ?? "http://localhost:3000"))

  res.cookies.set("authjs.session-token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  })

  return res
}
