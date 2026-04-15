import { auth } from "@/lib/auth"
import { put } from "@vercel/blob"

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Non authentifié." }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  if (!file) return Response.json({ error: "Aucun fichier." }, { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type)) return Response.json({ error: "Type non supporté." }, { status: 400 })
  if (file.size > MAX_SIZE) return Response.json({ error: "Fichier trop lourd (max 5 Mo)." }, { status: 400 })

  const ext = file.name.split(".").pop() ?? "jpg"
  const blob = await put(`avatars/${session.user.id}-${Date.now()}.${ext}`, file, { access: "public" })

  return Response.json({ url: blob.url })
}
