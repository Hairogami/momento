import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const ALLOWED_THEMES    = ["light", "dark", "auto"]
const ALLOWED_LANGUAGES = ["fr", "en", "ar"]

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Non authentifié." }, { status: 401 })

  const settings = await prisma.userSettings.upsert({
    where:  { userId: session.user.id },
    create: { userId: session.user.id },
    update: {},
  })
  return Response.json(settings)
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Non authentifié." }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const data: Record<string, unknown> = {}

  // Apparence
  if (typeof body.theme === "string" && ALLOWED_THEMES.includes(body.theme)) data.theme = body.theme
  if (typeof body.palette === "string" && body.palette.length <= 32)         data.palette = body.palette
  if (typeof body.language === "string" && ALLOWED_LANGUAGES.includes(body.language)) data.language = body.language

  // Notifications (JSON, validation shape minimale)
  if (body.notifEmail && typeof body.notifEmail === "object") data.notifEmail = body.notifEmail
  if (body.notifPush  && typeof body.notifPush  === "object") data.notifPush  = body.notifPush

  // Sécurité
  if (typeof body.twoFactorEnabled === "boolean") data.twoFactorEnabled = body.twoFactorEnabled

  // Vendor
  if (typeof body.isOnVacation === "boolean") data.isOnVacation = body.isOnVacation
  if (typeof body.vacationMessage === "string" && body.vacationMessage.length <= 500) data.vacationMessage = body.vacationMessage
  if (Array.isArray(body.serviceCities))    data.serviceCities = body.serviceCities.filter((c: unknown) => typeof c === "string").slice(0, 50)
  if (Array.isArray(body.unavailableDates)) {
    data.unavailableDates = body.unavailableDates
      .map((d: unknown) => (typeof d === "string" ? new Date(d) : null))
      .filter((d: Date | null): d is Date => d instanceof Date && !isNaN(d.getTime()))
      .slice(0, 365)
  }

  const updated = await prisma.userSettings.upsert({
    where:  { userId: session.user.id },
    create: { userId: session.user.id, ...data },
    update: data,
  })
  return Response.json(updated)
}
