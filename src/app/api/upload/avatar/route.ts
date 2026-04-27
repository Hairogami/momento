import { auth } from "@/lib/auth"
import { put } from "@vercel/blob"
import { requireVerifiedEmail } from "@/lib/auth-guards"

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Non authentifié." }, { status: 401 })

  // Hard-gate : pas d'upload tant que l'email n'est pas vérifié
  const verifyGate = await requireVerifiedEmail(session.user.id)
  if (verifyGate) return verifyGate

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  if (!file) return Response.json({ error: "Aucun fichier." }, { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type)) return Response.json({ error: "Type non supporté." }, { status: 400 })
  if (file.size > MAX_SIZE) return Response.json({ error: "Fichier trop lourd (max 5 Mo)." }, { status: 400 })

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json(
      { error: "Stockage Vercel Blob non configuré (BLOB_READ_WRITE_TOKEN manquant)." },
      { status: 500 },
    )
  }

  const ext = file.name.split(".").pop() ?? "jpg"
  try {
    const blob = await put(`avatars/${session.user.id}-${Date.now()}.${ext}`, file, { access: "public" })
    return Response.json({ url: blob.url })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "erreur inconnue"
    return Response.json({ error: `Upload Blob échoué : ${msg}` }, { status: 502 })
  }
}
