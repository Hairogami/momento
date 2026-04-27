import { prisma } from "../src/lib/prisma"

async function main() {
  await prisma.user.update({ where: { email: "moumene486@gmail.com" }, data: { role: "client" } })
  console.log("✓ moumene486 → role client")

  const targetUser = await prisma.user.findUnique({ where: { email: "yazid.moumene@glovoapp.com" }, select: { id: true } })
  if (!targetUser) { console.log("Target user introuvable"); return }
  const planner = await prisma.planner.findFirst({ where: { userId: targetUser.id }, select: { id: true } })
  const vendor = await prisma.vendor.upsert({
    where: { slug: "yazid-moumene-test" },
    create: { slug: "yazid-moumene-test", name: "Yazid Moumene", category: "Photographe", city: "Rabat" },
    update: {},
    select: { userId: true, slug: true },
  })
  let realSender = vendor.userId
  if (!realSender || realSender === targetUser.id) {
    const ghost = await prisma.user.upsert({
      where: { email: "ghost-yazid-vendor@momento.local" },
      create: { email: "ghost-yazid-vendor@momento.local", name: "Yazid Moumene", role: "vendor" },
      update: {},
      select: { id: true },
    })
    await prisma.vendor.update({ where: { slug: "yazid-moumene-test" }, data: { userId: ghost.id } })
    realSender = ghost.id
  }
  const conv = await prisma.conversation.upsert({
    where: { clientId_vendorSlug: { clientId: targetUser.id, vendorSlug: "yazid-moumene-test" } },
    create: { clientId: targetUser.id, vendorSlug: "yazid-moumene-test", plannerId: planner?.id ?? null },
    update: { plannerId: planner?.id ?? null },
    select: { id: true },
  })
  const msg = await prisma.message.create({
    data: { conversationId: conv.id, senderId: realSender, content: "salut", read: false },
    select: { id: true },
  })
  console.log("✓ Conv+msg créés pour user", targetUser.id, "msg:", msg.id, "planner:", planner?.id ?? "null")
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) })
