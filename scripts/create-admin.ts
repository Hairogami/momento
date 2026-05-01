/**
 * Crée (ou remet à jour) un compte admin dans la DB.
 * Usage : npx tsx scripts/create-admin.ts <email>
 * Le mot de passe est demandé de façon interactive (jamais dans la commande).
 */
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import * as dotenv from "dotenv"
import bcrypt from "bcryptjs"
import * as readline from "readline"

dotenv.config({ path: ".env.local" })

const [,, email] = process.argv

if (!email) {
  console.error("Usage: npx tsx scripts/create-admin.ts <email>")
  process.exit(1)
}

function askPassword(prompt: string): Promise<string> {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    // Masquer la saisie
    const stdin = process.openStdin()
    process.stdout.write(prompt)
    process.stdin.setRawMode?.(true)
    let password = ""
    process.stdin.on("data", (char: Buffer) => {
      const c = char.toString()
      if (c === "\r" || c === "\n") {
        process.stdin.setRawMode?.(false)
        process.stdout.write("\n")
        rl.close()
        resolve(password)
      } else if (c === "") {
        process.exit()
      } else if (c === "") {
        password = password.slice(0, -1)
      } else {
        password += c
        process.stdout.write("*")
      }
    })
    process.stdin.resume()
  })
}

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! })
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0])

async function main() {
  const password = await askPassword(`Mot de passe pour ${email} : `)

  if (password.length < 8) {
    console.error("❌ Mot de passe trop court (min 8 caractères).")
    process.exit(1)
  }

  const hash = await bcrypt.hash(password, 12)

  const user = await prisma.user.upsert({
    where: { email_role: { email: email.toLowerCase().trim(), role: "admin" } },
    create: {
      email: email.toLowerCase().trim(),
      role: "admin",
      passwordHash: hash,
      name: "Admin",
      emailVerified: new Date(),
    },
    update: { passwordHash: hash },
    select: { id: true, email: true, role: true },
  })

  console.log(`✅ Compte admin créé/mis à jour :`)
  console.log(`   email : ${user.email}`)
  console.log(`   → Connecte-toi sur /admin/login`)
}

main().catch(e => { console.error("❌", e); process.exit(1) }).finally(() => prisma.$disconnect())
