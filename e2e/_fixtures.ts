import { test as base, expect, type APIRequestContext, type BrowserContext, type Page } from "@playwright/test"

/**
 * Fixtures partagees pour les E2E qui ont besoin d'une session authentifiee.
 *
 * Strategie en mode dev :
 *   GET /api/dev-login --> definit le cookie `authjs.session-token` pour le
 *   premier user en DB (priorite a moumene486@gmail.com). NextAuth v5 + JWT
 *   strategy. La route renvoie une redirection 302 vers /dashboard, donc on
 *   suit la redirection puis on extrait les cookies.
 *
 *   Hors dev, la route renvoie 404 et les tests authentifies sont skip.
 *
 * Pour simuler "user B" pour les tests IDOR, on combine cette session avec
 * un id de planner volontairement faux ou appartenant a un autre user. Le
 * vrai test "deux comptes distincts" demande de seeder un second user en DB,
 * ce qui sort du perimetre des smoke tests — on utilise donc un id arbitraire
 * (cuid format) qui doit toujours etre rejete par les routes IDOR-safe.
 */

export type AuthenticatedFixtures = {
  authedContext: BrowserContext
  authedPage: Page
  authedRequest: APIRequestContext
}

/**
 * Tente d'authentifier un context Playwright via /api/dev-login.
 * Renvoie `true` si la session est posee, `false` si la route renvoie 404
 * (= environnement non-dev, on doit skip le test).
 */
export async function tryDevLogin(context: BrowserContext, baseURL: string): Promise<boolean> {
  const url = `${baseURL.replace(/\/$/, "")}/api/dev-login`
  const response = await context.request.get(url, { maxRedirects: 0 })

  // 200 (json error en cas de DB vide), 302 (redirect /dashboard) ou 307 = OK
  // 404 = route bloquee en prod
  if (response.status() === 404) return false
  if (response.status() >= 500) return false

  const cookies = await context.cookies()
  return cookies.some(c => c.name === "authjs.session-token")
}

export const test = base.extend<AuthenticatedFixtures>({
  authedContext: async ({ browser, baseURL }, use) => {
    const context = await browser.newContext()
    const ok = await tryDevLogin(context, baseURL ?? "http://localhost:3000")
    if (!ok) {
      await context.close()
      base.skip(true, "/api/dev-login indisponible (non-dev) — test authentifie skip")
      return
    }
    await use(context)
    await context.close()
  },
  authedPage: async ({ authedContext }, use) => {
    const page = await authedContext.newPage()
    await use(page)
    await page.close()
  },
  authedRequest: async ({ authedContext }, use) => {
    await use(authedContext.request)
  },
})

export { expect }
