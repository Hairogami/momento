import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const schema = z.object({ email: z.string().email() })

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Email invalide" }, { status: 400 })

  try {
    await prisma.waitlist.create({ data: { email: parsed.data.email } })
  } catch {
    // unique constraint — already registered, don't reveal
  }

  return NextResponse.json({ ok: true })
}
