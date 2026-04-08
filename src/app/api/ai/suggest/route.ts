import Anthropic from "@anthropic-ai/sdk"
import { auth } from "@/lib/auth"
import { NextRequest } from "next/server"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Non authentifié." }, { status: 401 })
  }

  const { stepTitle, stepCategory, weddingLocation, budget } = await req.json()

  if (!stepTitle || typeof stepTitle !== "string" || stepTitle.length > 200) {
    return Response.json({ vendors: [] })
  }

  const prompt = `You are a wedding planning assistant. Suggest 3-5 vendor types or specific vendor categories for the following wedding planning step.

Step: "${stepTitle.slice(0, 200)}"
Category: ${String(stepCategory ?? "").slice(0, 100)}
Wedding location: ${weddingLocation ? String(weddingLocation).slice(0, 100) : "not specified"}
Budget: ${budget ? `$${Number(budget)}` : "not specified"}

Respond with a JSON array of vendor suggestions. Each item should have:
- name: vendor business name (realistic but fictional)
- category: vendor category
- description: brief description (1 sentence)
- priceRange: "budget" | "mid" | "premium"
- phone: example phone number
- address: example address near ${weddingLocation ? String(weddingLocation).slice(0, 100) : "the wedding location"}

Return ONLY valid JSON, no markdown, no extra text.`

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  })

  const text = message.content[0].type === "text" ? message.content[0].text : "[]"

  try {
    const vendors = JSON.parse(text)
    return Response.json({ vendors })
  } catch {
    return Response.json({ vendors: [] })
  }
}
