/**
 * Set role=admin pour un user.
 * Usage: npx tsx scripts/set-admin.ts <email>
 */
import { config } from "dotenv"
import path from "path"
config({ path: path.resolve(process.cwd(), ".env.local") })

async function main() {
  const email = process.argv[2]
  if (!email) {
    console.error("❌ Usage: npx tsx scripts/set-admin.ts <email>")
    process.exit(1)
  }

  const { prisma } = await import("../src/lib/prisma")

  const before = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: { id: true, email: true, role: true, name: true },
  })

  if (!before) {
    console.error(`❌ User ${email} introuvable.`)
    await prisma.$disconnect()
    process.exit(1)
  }

  console.log(`📋 Avant : ${before.email} (${before.name ?? "no name"}) — role: ${before.role}`)

  if (before.role === "admin") {
    console.log("✓ Déjà admin, rien à faire.")
    await prisma.$disconnect()
    return
  }

  const after = await prisma.user.update({
    where: { id: before.id },
    data: { role: "admin" },
    select: { email: true, role: true },
  })

  console.log(`✅ Après : ${after.email} — role: ${after.role}`)
  await prisma.$disconnect()
}

main().catch((e) => { console.error("❌ Erreur :", e); process.exit(1) })
