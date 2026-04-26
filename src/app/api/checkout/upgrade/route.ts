import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type UpgradePlan = "pro" | "pro_planner"
type PaymentMethod = "cmi" | "paypal"

const PRICING_MAD: Record<UpgradePlan, number> = {
  pro: 200,
  pro_planner: 500,
}

/**
 * POST /api/checkout/upgrade
 *
 * Initie un ordre de paiement pour passer Pro ou Pro+Planner.
 * - Crée un enregistrement d'intent de paiement côté serveur (à brancher plus tard)
 * - Redirige vers la passerelle (CMI ou PayPal)
 *
 * Tant que les providers ne sont pas branchés, répond 501 avec un message clair.
 * Côté UI, ce 501 est interprété comme "bientôt disponible".
 */
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await req.json().catch(() => null)) as {
    plan?: UpgradePlan
    method?: PaymentMethod
  } | null

  const plan = body?.plan
  const method = body?.method

  if (plan !== "pro" && plan !== "pro_planner") {
    return NextResponse.json({ error: "Plan invalide" }, { status: 400 })
  }
  if (method !== "cmi" && method !== "paypal") {
    return NextResponse.json({ error: "Méthode de paiement invalide" }, { status: 400 })
  }

  // Garantie que l'utilisateur existe
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, plan: true },
  })
  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 })
  }

  if (user.plan === "pro") {
    return NextResponse.json(
      { error: "Vous êtes déjà Pro." },
      { status: 409 },
    )
  }

  const amountMad = PRICING_MAD[plan]

  // ─────────────────────────────────────────────────────────────
  // TODO (phase paiement) : brancher CMI ou PayPal ici.
  //
  // CMI :
  //   - Créer un POST signé vers CMI (oid, amount, currency=Dhs, storetype=3D_PAY)
  //   - Renvoyer { redirectUrl: cmiPaymentUrl }
  //   - Webhook retour → /api/webhooks/cmi (vérifier signature HMAC)
  //     → prisma.user.update({ plan: "pro", planExpiresAt: +30j })
  //
  // PayPal :
  //   - Utiliser @paypal/checkout-server-sdk ou API REST directe
  //   - createOrder → { redirectUrl: paypalApproveUrl }
  //   - Webhook PAYMENT.CAPTURE.COMPLETED → /api/webhooks/paypal
  //     → prisma.user.update({ plan: "pro", planExpiresAt: +30j })
  // ─────────────────────────────────────────────────────────────

  const cmiEnabled = process.env.CMI_MERCHANT_ID && process.env.CMI_STORE_KEY
  const paypalEnabled = process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_SECRET

  if (method === "cmi" && !cmiEnabled) {
    return NextResponse.json(
      { error: "CMI pas encore disponible. Onboarding merchant en cours.", code: "PROVIDER_NOT_READY" },
      { status: 501 },
    )
  }
  if (method === "paypal" && !paypalEnabled) {
    return NextResponse.json(
      { error: "PayPal pas encore disponible.", code: "PROVIDER_NOT_READY" },
      { status: 501 },
    )
  }

  // Point d'entrée pour quand les providers seront branchés.
  // Pour l'instant, aucune branche n'est atteinte.
  return NextResponse.json(
    {
      error: "Paiement bientôt disponible.",
      code: "PROVIDER_NOT_READY",
      debug: { plan, method, amountMad },
    },
    { status: 501 },
  )
}
