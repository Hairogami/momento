import { test, expect } from "@playwright/test"

/**
 * Smoke tests auth — vérifie que les pages protégées redirigent bien
 * vers /login quand le user est anonyme.
 */
test.describe("Auth gating", () => {
  test("/dashboard redirige /login si anonyme", async ({ page }) => {
    await page.goto("/dashboard")
    await page.waitForURL(/\/login/, { timeout: 10_000 })
    expect(page.url()).toMatch(/\/login/)
  })

  test("/planner redirige /login si anonyme", async ({ page }) => {
    await page.goto("/planner")
    await page.waitForURL(/\/login/, { timeout: 10_000 })
    expect(page.url()).toMatch(/\/login/)
  })

  test("/budget redirige /login si anonyme", async ({ page }) => {
    await page.goto("/budget")
    await page.waitForURL(/\/login/, { timeout: 10_000 })
    expect(page.url()).toMatch(/\/login/)
  })

  test("/messages redirige /login si anonyme", async ({ page }) => {
    await page.goto("/messages")
    await page.waitForURL(/\/login/, { timeout: 10_000 })
    expect(page.url()).toMatch(/\/login/)
  })

  test("/dashboard/event-site redirige /login si anonyme", async ({ page }) => {
    await page.goto("/dashboard/event-site")
    await page.waitForURL(/\/login/, { timeout: 10_000 })
    expect(page.url()).toMatch(/\/login/)
  })
})
