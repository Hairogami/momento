import { prisma } from "../src/lib/prisma"

async function main() {
  const v = await prisma.vendor.findUnique({ where: { slug: "dev-yazid" }, select: { id: true, userId: true, name: true } })
  console.log("vendor dev-yazid:", v)
  const c = await prisma.conversation.count({ where: { vendorSlug: "dev-yazid" } })
  console.log("convs dev-yazid:", c)
}
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) })
