import "dotenv/config"
import { prisma } from "../src/lib/prisma"

async function main() {
  const result = await prisma.user.updateMany({
    data: {
      plan: "pro",
      planExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  })
  console.log(`Updated ${result.count} users → pro`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
