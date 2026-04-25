import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { config } from "dotenv"
config({ path: ".env.local" })

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })

async function main() {
  const palette = process.argv[2]
  if (!palette) { console.error("usage: tsx set-palette.ts <paletteId>"); process.exit(1) }
  const site = await prisma.eventSite.findUnique({ where: { slug: "yasmine-yazid" }, select: { content: true } })
  if (!site) { console.error("site not found"); process.exit(1) }
  const content = site.content as Record<string, unknown>
  const style = (content.style as Record<string, unknown> | undefined) ?? {}
  delete style.customColors
  content.style = style
  await prisma.eventSite.update({
    where: { slug: "yasmine-yazid" },
    data: { palette, content: content as never },
  })
  console.log("OK: palette=", palette)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
