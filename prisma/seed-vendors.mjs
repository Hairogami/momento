/**
 * seed-vendors.mjs — Script de seed ESM pur (pas de TypeScript)
 * Run: node --env-file=.env prisma/seed-vendors.mjs
 *   ou: node -r dotenv/config prisma/seed-vendors.mjs
 */

import { createRequire } from "module"
import { readFileSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load env manually if --env-file not supported
try {
  const { config } = await import("dotenv")
  config({ path: join(__dirname, "../.env") })
  config({ path: join(__dirname, "../.env.local") })
} catch {}

// Dynamic import of Prisma client
const { PrismaClient } = await import("../src/generated/prisma/client.js").catch(() =>
  import("../src/generated/prisma/client.ts")
)

const { PrismaNeon } = await import("@prisma/adapter-neon")

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error("ERROR: DATABASE_URL manquant")
  process.exit(1)
}

const adapter = new PrismaNeon({ connectionString })
const prisma = new PrismaClient({ adapter })

// ─── VENDOR_BASIC inlined (parsed from vendorData.ts at runtime) ─────────────
// On importe le fichier TS via une regex simple pour éviter de compiler TS
const vendorDataPath = join(__dirname, "../src/lib/vendorData.ts")
const vendorDataRaw = readFileSync(vendorDataPath, "utf-8")

// Extract VENDOR_BASIC object using regex — parse slug/name/category/city/rating lines
const VENDOR_BASIC = {}
const lineRe = /^\s+"([^"]+)":\s+\{\s*name:\s*"([^"]+)",\s*category:\s*"([^"]+)",\s*city:\s*"([^"]+)",\s*rating:\s*(\d)/gm
let match
while ((match = lineRe.exec(vendorDataRaw)) !== null) {
  const [, slug, name, category, city, rating] = match
  VENDOR_BASIC[slug] = { name, category, city, rating: parseInt(rating) }
}

const entries = Object.entries(VENDOR_BASIC)
console.log(`Found ${entries.length} vendors to seed...`)

let seeded = 0
let errors = 0

for (const [slug, v] of entries) {
  try {
    await prisma.vendor.upsert({
      where: { slug },
      create: {
        slug,
        name: v.name,
        category: v.category,
        city: v.city,
        rating: v.rating,
      },
      update: {},
    })
    seeded++
  } catch (err) {
    console.error(`[ERROR] ${slug}: ${err?.message ?? err}`)
    errors++
  }
}

console.log(`\n${seeded} vendors seedés, ${errors} erreurs`)
await prisma.$disconnect()
