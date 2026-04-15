import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import * as dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0])

async function main() {
  const slug = "prestige-photo"

  const [total, byType, recent, contacts] = await Promise.all([
    prisma.vendorEvent.count({ where: { vendorSlug: slug } }),
    prisma.vendorEvent.groupBy({
      by: ["type"],
      where: { vendorSlug: slug },
      _count: { _all: true },
    }),
    prisma.vendorEvent.findMany({
      where: { vendorSlug: slug },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { type: true, sessionId: true, referrer: true, createdAt: true },
    }),
    prisma.contactRequest.findMany({
      where: { vendorSlug: slug },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { clientName: true, eventType: true, message: true, status: true, createdAt: true },
    }),
  ])

  console.log(`\n━━━━ VendorEvent pour ${slug} ━━━━\n`)
  console.log(`Total events : ${total}\n`)

  console.log(`Par type :`)
  for (const row of byType) console.log(`  ${row.type.padEnd(20)} → ${row._count._all}`)

  console.log(`\n10 derniers events :`)
  for (const e of recent) {
    const t = e.createdAt.toISOString().slice(11, 19)
    const sid = (e.sessionId ?? "—").slice(0, 16).padEnd(16)
    const ref = (e.referrer ?? "—").slice(0, 40)
    console.log(`  ${t}  ${e.type.padEnd(20)}  sid=${sid}  ref=${ref}`)
  }

  console.log(`\n━━━━ ContactRequest pour ${slug} ━━━━\n`)
  console.log(`Total : ${contacts.length}\n`)
  for (const c of contacts) {
    const t = c.createdAt.toISOString().slice(0, 19).replace("T", " ")
    console.log(`  ${t}  ${c.clientName.padEnd(20)}  ${(c.eventType ?? "—").padEnd(14)}  [${c.status}]`)
    console.log(`     → "${c.message.slice(0, 80)}"${c.message.length > 80 ? "…" : ""}`)
  }
  console.log()
}

main()
  .catch(e => { console.error("❌", e); process.exit(1) })
  .finally(() => prisma.$disconnect())
