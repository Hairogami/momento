import { prisma } from "../src/lib/prisma"
async function main() {
  const users = await prisma.user.findMany({ where: { email: { contains: "moumene" } }, select: { id: true, email: true, role: true } })
  console.log("USERS:", users.length)
  users.forEach(u => console.log(" ", u.email, "→", u.id, "(role:", u.role, ")"))
  for (const u of users) {
    const convs = await prisma.conversation.findMany({ where: { clientId: u.id }, select: { id: true, vendorSlug: true, plannerId: true, _count: { select: { messages: true } } } })
    const unread = await prisma.message.count({ where: { read: false, senderId: { not: u.id }, conversation: { clientId: u.id } } })
    console.log("USER", u.email, "→ convs:", convs.length, "unread:", unread)
    convs.forEach(c => console.log("   conv:", c.id, "vendor:", c.vendorSlug, "plannerId:", c.plannerId, "msgs:", c._count.messages))
  }
}
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) })
