/**
 * Cloudflare Turnstile — CAPTCHA invisible/non-intrusif, gratuit illimité.
 *
 * Comment activer :
 * 1. Créer un site Turnstile sur https://dash.cloudflare.com/?to=/:account/turnstile
 *    → choisir "Managed" + ajouter le domaine momentoevents.app
 * 2. Récupérer Site Key + Secret Key
 * 3. Ajouter dans Vercel env (production + preview) :
 *      NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4...
 *      TURNSTILE_SECRET_KEY=0x4...
 *
 * Tant que `TURNSTILE_SECRET_KEY` n'est PAS définie côté serveur,
 * `verifyTurnstile()` retourne `true` (passthrough). Permet le dev local
 * et un rollout progressif sans casser le signup.
 */

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

export const turnstileEnabled = (): boolean => !!process.env.TURNSTILE_SECRET_KEY

export async function verifyTurnstile(token: string | undefined | null, ip?: string): Promise<boolean> {
  if (!turnstileEnabled()) return true
  if (!token || typeof token !== "string" || token.length > 2048) return false

  try {
    const body = new URLSearchParams()
    body.set("secret",   process.env.TURNSTILE_SECRET_KEY!)
    body.set("response", token)
    if (ip) body.set("remoteip", ip)

    const r = await fetch(VERIFY_URL, {
      method: "POST",
      body,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      // Cap au cas où Cloudflare rame
      signal: AbortSignal.timeout(5000),
    })
    if (!r.ok) return false
    const data = await r.json() as { success?: boolean }
    return !!data.success
  } catch (e) {
    console.error("[turnstile] verify error:", e)
    return false
  }
}
