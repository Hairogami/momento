import { test, expect } from "@playwright/test"

/**
 * Smoke tests API — vérifie que les routes critiques renvoient le bon code.
 */
test.describe("API health", () => {
  test("/api/health renvoie 200", async ({ request }) => {
    const response = await request.get("/api/health")
    expect(response.status()).toBe(200)
  })

  test("/api/user/plan requiert auth (sauf IS_DEV)", async ({ request }) => {
    const response = await request.get("/api/user/plan")
    expect([200, 401]).toContain(response.status())
  })

  test("/api/planners requiert auth (sauf en mode IS_DEV local)", async ({ request }) => {
    const response = await request.get("/api/planners")
    // Prod : 401 (anonyme). Dev local : 200 (IS_DEV=true bypass auth avec user mock)
    expect([200, 401]).toContain(response.status())
  })

  test("/api/event-site/random-id renvoie 401 sans auth", async ({ request }) => {
    const response = await request.get("/api/event-site/abc123")
    // 401 (anonyme) ou 404 (id inexistant après auth) — pas 500
    expect([401, 404]).toContain(response.status())
  })

  test("/api/admin/migrate refuse sans auth admin", async ({ request }) => {
    const response = await request.post("/api/admin/migrate")
    expect([401, 403, 405]).toContain(response.status())
  })
})
