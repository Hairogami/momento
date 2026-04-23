import { prisma } from "@/lib/prisma"

/**
 * Génère un slug URL-safe depuis un titre/nom, avec suffix aléatoire si collision.
 * Exemple : "Yousra & Ali 2026" → "yousra-ali-2026" (ou "yousra-ali-2026-x7k3" si pris)
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // retire accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
}

function randomSuffix(len = 4): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789"
  let s = ""
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}

/**
 * Génère un slug unique global pour EventSite.
 * Si base déjà pris, append un suffix random jusqu'à trouver libre.
 */
export async function generateUniqueSlug(base: string): Promise<string> {
  const root = slugify(base) || "event"
  let candidate = root
  for (let tries = 0; tries < 6; tries++) {
    const existing = await prisma.eventSite.findUnique({
      where: { slug: candidate },
      select: { id: true },
    })
    if (!existing) return candidate
    candidate = `${root}-${randomSuffix(4)}`
  }
  // Fallback ultra-defensive : base + timestamp
  return `${root}-${Date.now().toString(36)}`
}
