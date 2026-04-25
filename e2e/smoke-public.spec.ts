import { test, expect } from "@playwright/test"

/**
 * Smoke tests sur les pages publiques — vérifie qu'elles chargent sans 500.
 */
test.describe("Pages publiques", () => {
  test("homepage charge", async ({ page }) => {
    const response = await page.goto("/")
    expect(response?.status()).toBeLessThan(400)
  })

  test("page signup charge", async ({ page }) => {
    const response = await page.goto("/signup")
    expect(response?.status()).toBeLessThan(400)
    // Le formulaire est dans des tabs (client/presta) — on vérifie juste que la page rend du contenu
    await expect(page.locator("body")).toContainText(/inscription|s'inscrire|signup|compte/i, { timeout: 10_000 })
  })

  test("page login affiche un formulaire", async ({ page }) => {
    await page.goto("/login")
    // .first() pour tolérer un input email dans le footer/newsletter
    await expect(page.locator('input[type="email"]').first()).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('input[type="password"]').first()).toBeVisible()
  })

  test("page explore charge", async ({ page }) => {
    const response = await page.goto("/explore")
    expect(response?.status()).toBeLessThan(400)
  })

  test("page legal CGU accessible", async ({ page }) => {
    const response = await page.goto("/cgu")
    expect(response?.status()).toBeLessThan(400)
  })

  test("page confidentialité accessible", async ({ page }) => {
    const response = await page.goto("/confidentialite")
    expect(response?.status()).toBeLessThan(400)
  })
})
