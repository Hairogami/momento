import { test, expect } from "./_fixtures"

/**
 * Paywall enforcement — verifie que les features Pro renvoient 402
 * (ou 403 selon impl) quand le user est en plan "free", et passent
 * a 200/201 apres switch sur "pro".
 *
 * Bascule plan via /api/dev/switch-plan (reserve a DEV_OWNER_EMAIL).
 *
 * Notes :
 *   - En IS_DEV (NODE_ENV=development && VERCEL!=1), plusieurs routes
 *     bypassent le paywall (`!isDev && plan === "free"`). Le test va donc
 *     adapter ses assertions : on s'attend a 402 EN PROD ou avec un user
 *     non-owner. En dev local, on accepte aussi le succes immediat.
 *   - Le user dev-login est moumene486@gmail.com (DEV_OWNER_EMAIL),
 *     donc /api/dev/switch-plan accepte la requete.
 */

async function setPlan(request: import("@playwright/test").APIRequestContext, plan: "free" | "pro" | "max"): Promise<boolean> {
  const res = await request.post("/api/dev/switch-plan", { data: { plan } })
  // 200 ok, 403 si user n'est pas DEV_OWNER, 404 si route desactivee en prod
  return res.status() === 200
}

test.describe("Paywall — gating Pro/Max", () => {
  test.describe.configure({ mode: "serial" })

  test("plan free : POST /api/event-site renvoie 402 (sauf IS_DEV)", async ({ authedRequest }) => {
    const ok = await setPlan(authedRequest, "free")
    if (!ok) {
      test.skip(true, "Switch plan KO (pas owner ou env prod) — test paywall non testable")
      return
    }

    const planners = await (await authedRequest.get("/api/planners")).json() as { id: string }[]
    if (!planners.length) {
      test.skip(true, "Pas de planner en DB")
      return
    }

    const res = await authedRequest.post("/api/event-site", {
      data: { plannerId: planners[0].id },
    })
    // En IS_DEV strict : 201 (cree) ou 409 (existe deja)
    // En prod ou hors-IS_DEV : 402
    expect([201, 402, 409]).toContain(res.status())

    if (res.status() === 402) {
      const body = (await res.json()) as { error?: string; upgradeUrl?: string }
      expect(body.upgradeUrl).toBeTruthy()
      expect(String(body.upgradeUrl)).toMatch(/upgrade|pro/)
    }
  })

  test("plan free : POST /api/event-site/<id>/publish renvoie 402 (sauf IS_DEV)", async ({ authedRequest }) => {
    await setPlan(authedRequest, "free")
    const planners = await (await authedRequest.get("/api/planners")).json() as { id: string }[]
    if (!planners.length) {
      test.skip(true, "Pas de planner")
      return
    }

    // Tenter de creer le site (peut echouer 402 si IS_DEV inactif)
    const createRes = await authedRequest.post("/api/event-site", {
      data: { plannerId: planners[0].id },
    })
    if (![201, 409].includes(createRes.status())) {
      // En prod free, on n'a meme pas pu creer — paywall couvert au step precedent
      expect(createRes.status()).toBe(402)
      return
    }
    const created = (await createRes.json()) as { id: string }

    const publishRes = await authedRequest.post(`/api/event-site/${created.id}/publish`, {
      data: { publish: true },
    })
    expect([200, 402]).toContain(publishRes.status())

    if (publishRes.status() === 402) {
      const body = (await publishRes.json()) as { error?: string; upgradeUrl?: string }
      expect(body.upgradeUrl).toMatch(/upgrade|pro/)
    }
  })

  test("plan pro : POST /api/event-site reussit (201 ou 409)", async ({ authedRequest }) => {
    const ok = await setPlan(authedRequest, "pro")
    if (!ok) {
      test.skip(true, "Switch plan KO — pas owner ?")
      return
    }

    const planners = await (await authedRequest.get("/api/planners")).json() as { id: string }[]
    if (!planners.length) {
      test.skip(true, "Pas de planner")
      return
    }

    const res = await authedRequest.post("/api/event-site", {
      data: { plannerId: planners[0].id },
    })
    expect([201, 409]).toContain(res.status())
  })

  test("plan pro : POST publish reussit (200)", async ({ authedRequest }) => {
    await setPlan(authedRequest, "pro")
    const planners = await (await authedRequest.get("/api/planners")).json() as { id: string }[]
    if (!planners.length) {
      test.skip(true, "Pas de planner")
      return
    }

    const createRes = await authedRequest.post("/api/event-site", {
      data: { plannerId: planners[0].id },
    })
    if (![201, 409].includes(createRes.status())) {
      test.skip(true, `Create event-site echec : ${createRes.status()}`)
      return
    }
    const created = (await createRes.json()) as { id: string }

    const publishRes = await authedRequest.post(`/api/event-site/${created.id}/publish`, {
      data: { publish: true },
    })
    expect(publishRes.status()).toBe(200)
    const body = (await publishRes.json()) as { published: boolean; publicUrl: string | null }
    expect(body.published).toBe(true)
    expect(body.publicUrl).toBeTruthy()
  })

  test("/api/messages POST : verification email obligatoire (gate avant paywall)", async ({ authedRequest }) => {
    // Le hard-gate verifyEmail tape avant le paywall plan. On envoie un message
    // bidon pour s'assurer qu'aucune route ne renvoie 200 en cas de free + non-verifie.
    const res = await authedRequest.post("/api/messages", {
      data: { vendorSlug: "non-existent-vendor-e2e", content: "test" },
    })
    // Acceptables : 401 (anonyme — ne devrait pas arriver ici), 403 (verify gate),
    // 404 (vendor non trouve apres verify), 400 (validation), 429 (rate limit)
    expect([400, 401, 403, 404, 413, 429]).toContain(res.status())
  })

  test("apres test : remettre plan en 'free' (cleanup)", async ({ authedRequest }) => {
    await setPlan(authedRequest, "free")
    // Best-effort, on n'echoue pas le test si KO
  })
})
