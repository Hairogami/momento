import { prisma } from "../src/lib/prisma"

async function main() {
  const userEmail = "moumene486@gmail.com"
  const user = await prisma.user.findUnique({ where: { email: userEmail }, select: { id: true } })
  if (!user) { console.error("User not found:", userEmail); process.exit(1) }

  const vendorName = "Yazid Moumene"
  const vendorSlug = "yazid-moumene-test"

  const vendor = await prisma.vendor.upsert({
    where: { slug: vendorSlug },
    create: { slug: vendorSlug, name: vendorName, category: "Photographe", city: "Rabat" },
    update: {},
    select: { id: true, slug: true, userId: true },
  })

  let realSender = vendor.userId
  if (!realSender || realSender === user.id) {
    const ghost = await prisma.user.upsert({
      where: { email: "ghost-yazid-vendor@momento.local" },
      create: { email: "ghost-yazid-vendor@momento.local", name: vendorName, role: "vendor" },
      update: {},
      select: { id: true },
    })
    await prisma.vendor.update({ where: { id: vendor.id }, data: { userId: ghost.id } })
    realSender = ghost.id
  }

  const conv = await prisma.conversation.upsert({
    where: { clientId_vendorSlug: { clientId: user.id, vendorSlug } },
    create: { clientId: user.id, vendorSlug },
    update: {},
    select: { id: true },
  })

  const msg = await prisma.message.create({
    data: { conversationId: conv.id, senderId: realSender, content: "salut", read: false },
    select: { id: true, createdAt: true },
  })
  console.log(`✓ Message non-lu créé`)
  console.log(`  De: ${vendorName} (${realSender})`)
  console.log(`  Vers: ${userEmail} (${user.id})`)
  console.log(`  Conv: ${conv.id}`)
  console.log(`  Msg:  ${msg.id} à ${msg.createdAt.toISOString()}`)
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) })
