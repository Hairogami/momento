import { test, expect } from "@playwright/test"

/**
 * Smoke tests proxy.ts — verifie que le proxy (auth gate) redirige correctement
 * les routes protegees vers /login et laisse les routes publiques tranquilles.
 *
 * Note : ces tests couvrent specifiquement le comportement du fichier
 * `src/proxy.ts` (Next.js 16 — anciennement middleware.ts), pas la logique
 * d'authentification interne. Ils sont la pour detecter une regression si
 * NextAuth change le nom du cookie de session entre versions.
 */
test.describe("Proxy auth gate", () => {
  test("/dashboard anonyme -> redirige vers /login", async ({ page }) => {
    await page.goto("/dashboard")
    await page.waitForURL(/\/login/, { timeout: 10_000 })
    expect(page.url()).toMatch(/\/login/)
  })

  test("/admin anonyme -> redirige vers /login", async ({ page }) => {
    await page.goto("/admin")
    await page.waitForURL(/\/login/, { timeout: 10_000 })
    expect(page.url()).toMatch(/\/login/)
  })

  test("/explore anonyme -> reste sur /explore (route publique)", async ({ page }) => {
    const response = await page.goto("/explore")
    expect(response?.status()).toBeLessThan(400)
    // Ne doit PAS avoir ete redirige vers /login
    expect(page.url()).not.toMatch(/\/login/)
    expect(page.url()).toMatch(/\/explore/)
  })
})
