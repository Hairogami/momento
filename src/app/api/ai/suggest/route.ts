import Anthropic from "@anthropic-ai/sdk"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { rateLimitAsync } from "@/lib/rateLimiter"
import { NextRequest } from "next/server"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })


const VendorSuggestionSchema = z.array(z.object({
  name:        z.string().max(200),
  category:    z.string().max(100),
  description: z.string().max(500).optional(),
  priceRange:  z.enum(["budget", "mid", "premium"]).optional(),
  phone:       z.string().max(30).optional(),
  address:     z.string().max(300).optional(),
})).max(10)

export async function POST(req: NextRequest) {
  // I-N05: body size guard — consistent with other POST routes
  const contentLength = parseInt(req.headers.get("content-length") ?? "0", 10)
  if (contentLength > 16_384) {
    return Response.json({ error: "Requête trop volumineuse." }, { status: 413 })
  }

  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Non authentifié." }, { status: 401 })
  }

  const rl = await rateLimitAsync(`ai-suggest:${session.user.id}`, 10, 60 * 60_000)
  if (!rl.ok) {
    return Response.json({ error: "Trop de requêtes. Réessayez dans une heure." }, { status: 429 })
  }

  const { stepTitle, stepCategory, weddingLocation, budget } = await req.json()

  if (!stepTitle || typeof stepTitle !== "string" || stepTitle.length > 200) {
    return Response.json({ vendors: [] })
  }

  // Sanitize user inputs to prevent prompt injection via newlines/quotes
  function sanitizePromptVar(s: string, max: number): string {
    return s.replace(/[\n\r"\\<>/]/g, " ").trim().slice(0, max)
  }

  const safeTitle    = sanitizePromptVar(stepTitle, 200)
  const safeCategory = sanitizePromptVar(String(stepCategory ?? ""), 100)
  const safeLocation = weddingLocation ? sanitizePromptVar(String(weddingLocation), 100) : "not specified"
  const safeBudget   = budget ? `$${Math.abs(Number(budget))}` : "not specified"

  const prompt = `You are a wedding planning assistant. Suggest 3-5 vendor types or specific vendor categories for the following wedding planning step.

Step: <step_title>${safeTitle}</step_title>
Category: <category>${safeCategory}</category>
Wedding location: <location>${safeLocation}</location>
Budget: <budget>${safeBudget}</budget>

Respond with a JSON array of vendor suggestions. Each item should have:
- name: vendor business name (realistic but fictional)
- category: vendor category
- description: brief description (1 sentence)
- priceRange: "budget" | "mid" | "premium"
- phone: example phone number
- address: example address near ${safeLocation}

Return ONLY valid JSON, no markdown, no extra text.`

  try {
    // W04: model ID via env var so it can be updated without a redeploy
    const model = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5"
    const message = await anthropic.messages.create({
      model,
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    })

    const text = message.content[0]?.type === "text" ? message.content[0].text : "[]"

    try {
      const raw = JSON.parse(text)
      // W-N02: validate LLM output structure before forwarding to client
      const parsed = VendorSuggestionSchema.safeParse(raw)
      const vendors = parsed.success ? parsed.data : []
      return Response.json({ vendors })
    } catch {
      return Response.json({ vendors: [] })
    }
  } catch (err) {
    console.error("[ai/suggest] Anthropic error:", err)
    return Response.json({ vendors: [] })
  }
}
