/**
 * Suppression complète d'un user par email — PROD-SAFE
 *
 * Usage :
 *   npx tsx scripts/delete-user.ts <email>           → dry-run (affiche, ne touche rien)
 *   CONFIRM=YES npx tsx scripts/delete-user.ts <email>  → exécute le delete
 *
 * Gère les FK non-cascade : Message.sender, Vendor.user.
 */
import { config } from "dotenv"
import path from "path"
config({ path: path.resolve(process.cwd(), ".env.local") })

async function main() {
  const email = process.argv[2]
  if (!email) {
    console.error("Usage: npx tsx scripts/delete-user.ts <email> [CONFIRM=YES]")
    process.exit(1)
  }

  const { prisma } = await import("../src/lib/prisma")
  const confirm = process.env.CONFIRM === "YES"

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      _count: {
        select: {
          accounts: true,
          sessions: true,
          planners: true,
          emailVerifications: true,
          clientConversations: true,
          sentMessages: true,
          reviews: true,
          vendorClaimRequests: true,
          favorites: true,
          notifications: true,
          vendorTemplates: true,
        },
      },
      vendor: { select: { id: true, slug: true, name: true } },
      vendorProfile: { select: { id: true } },
      workspace: { select: { id: true } },
      settings: { select: { id: true } },
    },
  })

  if (!user) {
    console.log(`✗ Aucun user trouvé avec email = ${email}`)
    await prisma.$disconnect()
    return
  }

  console.log("\n═══════════════════════════════════════════════════════════════")
  console.log(`USER TROUVÉ : ${user.email}`)
  console.log("═══════════════════════════════════════════════════════════════")
  console.log(`  id           : ${user.id}`)
  console.log(`  name         : ${user.name ?? "—"}`)
  console.log(`  role         : ${user.role}`)
  console.log(`  plan         : ${user.plan}`)
  console.log(`  createdAt    : ${user.createdAt.toISOString()}`)
  console.log(`  emailVerified: ${user.emailVerified ? user.emailVerified.toISOString() : "non"}`)
  console.log(`  googleId     : ${user.googleId ?? "—"}`)

  console.log("\nDONNÉES LIÉES (cascade auto sauf indication) :")
  for (const [k, v] of Object.entries(user._count)) {
    console.log(`  ${k.padEnd(22)} : ${v}`)
  }
  console.log(`  workspace              : ${user.workspace ? "1" : "0"}`)
  console.log(`  vendorProfile          : ${user.vendorProfile ? "1" : "0"}`)
  console.log(`  settings               : ${user.settings ? "1" : "0"}`)
  console.log(`  vendor (lien)          : ${user.vendor ? `${user.vendor.slug} (${user.vendor.name})` : "0"}`)

  console.log("\n⚠️  GESTION SPÉCIALE :")
  console.log(`  - Messages envoyés (${user._count.sentMessages}) : DELETE manuel (FK non-cascade)`)
  console.log(`  - Vendor lié : ${user.vendor ? "DÉTACHE userId=null (Vendor préservé)" : "n/a"}`)
  console.log(`  - AdminAuditLog : préservé (snapshot email)`)

  if (!confirm) {
    console.log("\n📋 DRY-RUN — rien n'a été supprimé.")
    console.log("Pour exécuter : CONFIRM=YES npx tsx scripts/delete-user.ts " + email)
    await prisma.$disconnect()
    return
  }

  console.log("\n🔥 EXÉCUTION DU DELETE...")

  await prisma.$transaction(async (tx) => {
    // 1. Détache le Vendor (préserve le vendor public)
    if (user.vendor) {
      await tx.vendor.update({
        where: { id: user.vendor.id },
        data: { userId: null },
      })
      console.log(`  ✓ Vendor ${user.vendor.slug} détaché (userId=null)`)
    }

    // 2. Delete messages envoyés (FK strict)
    if (user._count.sentMessages > 0) {
      const msgDel = await tx.message.deleteMany({ where: { senderId: user.id } })
      console.log(`  ✓ ${msgDel.count} messages supprimés`)
    }

    // 3. Delete user (cascade le reste)
    await tx.user.delete({ where: { id: user.id } })
    console.log(`  ✓ User ${user.email} supprimé (cascade : sessions, accounts, planners, conversations, reviews, favorites, notifications, etc.)`)
  })

  console.log("\n✅ Suppression terminée.")
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error("\n❌ Erreur :", e)
  process.exit(1)
})
