/**
 * Promeut moumene486@gmail.com au role "admin".
 * Idempotent. Utile après chaque reset DB.
 */
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import * as dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

const TARGET_EMAIL = process.argv[2] ?? "moumene486@gmail.com"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0])

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: TARGET_EMAIL },
    select: { id: true, email: true, role: true },
  })
  if (!user) {
    console.error(`❌ User ${TARGET_EMAIL} introuvable. Inscris-toi d'abord sur /signup.`)
    process.exit(1)
  }
  if (user.role === "admin") {
    console.log(`✓ ${user.email} est déjà admin.`)
    return
  }
  await prisma.user.update({ where: { id: user.id }, data: { role: "admin" } })
  console.log(`✅ ${user.email} promu : ${user.role} → admin.`)
  console.log(`   → se déconnecter puis reconnecter pour que le JWT prenne en compte le nouveau role.`)
}

main().catch(e => { console.error("❌", e); process.exit(1) }).finally(() => prisma.$disconnect())
