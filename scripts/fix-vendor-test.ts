import { prisma } from "../src/lib/prisma"

async function main() {
  const moumene = await prisma.user.findUnique({ where: { email: "moumene486@gmail.com" }, select: { id: true } })
  const ghost   = await prisma.user.findUnique({ where: { email: "ghost-yazid-vendor@momento.local" }, select: { id: true } })
  if (!moumene) throw new Error("moumene486 not found")

  // 0. Le user moumene486 a déjà un vendor "dev-yazid" (sans conv) qui occupe la
  //    contrainte unique userId. On le supprime pour libérer la place.
  const devYazid = await prisma.vendor.findUnique({ where: { slug: "dev-yazid" }, select: { id: true } })
  if (devYazid) {
    await prisma.vendor.delete({ where: { id: devYazid.id } })
    console.log("✓ vendor dev-yazid supprimé (libère userId unique)")
  }

  // 1. Aligner moumene486 sur le slug du vendor test
  await prisma.user.update({ where: { id: moumene.id }, data: { vendorSlug: "yazid-moumene-test" } })
  console.log("✓ moumene486.vendorSlug = yazid-moumene-test")

  // 2. Reassign vendor → moumene486
  await prisma.vendor.update({ where: { slug: "yazid-moumene-test" }, data: { userId: moumene.id } })
  console.log("✓ vendor yazid-moumene-test.userId = moumene486")

  // 3. Reassign tous les messages envoyés par le ghost → moumene486
  if (ghost) {
    const upd = await prisma.message.updateMany({
      where: { senderId: ghost.id },
      data: { senderId: moumene.id },
    })
    console.log("✓ messages reassigned ghost → moumene486:", upd.count)
  }

  // 4. Supprimer la self-conv (clientId=moumene486 + vendorSlug pointing to him now)
  const selfConvs = await prisma.conversation.findMany({
    where: { clientId: moumene.id, vendorSlug: "yazid-moumene-test" },
    select: { id: true },
  })
  if (selfConvs.length) {
    await prisma.message.deleteMany({ where: { conversationId: { in: selfConvs.map(c => c.id) } } })
    await prisma.conversation.deleteMany({ where: { id: { in: selfConvs.map(c => c.id) } } })
    console.log("✓ self-convs deleted:", selfConvs.length)
  }

  // 5. Marquer la conv test (yazid.moumene@glovoapp.com → vendor) avec un message non-lu fresh
  const yazid = await prisma.user.findUnique({ where: { email: "yazid.moumene@glovoapp.com" }, select: { id: true } })
  if (yazid) {
    const conv = await prisma.conversation.findUnique({
      where: { clientId_vendorSlug: { clientId: yazid.id, vendorSlug: "yazid-moumene-test" } },
      select: { id: true },
    })
    if (conv) {
      // Message du CLIENT (yazid) au VENDOR (moumene486) → unread côté vendor
      await prisma.message.create({
        data: { conversationId: conv.id, senderId: yazid.id, content: "Bonjour, j'ai vu votre profil sur Momento, êtes-vous dispo le 14 juin ?", read: false },
      })
      await prisma.conversation.update({ where: { id: conv.id }, data: { updatedAt: new Date() } })
      console.log("✓ test message créé : yazid (client) → moumene486 (vendor)")
    }
  }

  // 6. Supprimer le ghost user (plus de refs)
  if (ghost) {
    await prisma.user.delete({ where: { id: ghost.id } })
    console.log("✓ ghost user deleted")
  }

  console.log("\n=== STATE FINAL ===")
  const convs = await prisma.conversation.findMany({
    where: { vendorSlug: "yazid-moumene-test" },
    select: { id: true, clientId: true,
      messages: { orderBy: { createdAt: "desc" }, take: 5, select: { senderId: true, content: true, read: true } },
    },
  })
  console.dir(convs, { depth: 4 })
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) })
