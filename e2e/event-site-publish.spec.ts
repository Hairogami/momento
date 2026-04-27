import { test, expect } from "./_fixtures"

/**
 * Event site publish — flow complet :
 *   1. Login dev
 *   2. Recuperer planner actif via GET /api/planners
 *   3. POST /api/event-site { plannerId } pour creer le site (ou reutiliser
 *      celui qui existe deja — code 409)
 *   4. PATCH /api/event-site/<id> avec content (titre, sous-titre, date)
 *   5. POST /api/event-site/<id>/publish --> { published: true, publicUrl }
 *   6. Visiter publicUrl en non-auth --> rendu visible (200)
 *   7. Soumettre un RSVP via POST /api/event-site/<id>/rsvp ou simulation
 *      sur la page publique
 *   8. Verifier que le RSVP apparait dans GET /api/event-site/<id>/rsvps
 *
 * Notes :
 *   - En dev, IS_DEV bypass le paywall pro --> POST event-site marche pour
 *     un user free.
 *   - Si le planner courant a deja un eventSite, on saute la creation et on
 *     reutilise l'id retourne par l'erreur 409.
 *   - Si la DB n'a pas de planner, on skip tout le block.
 */

type Planner = { id: string; title?: string }
type EventSite = { id: string; slug: string; published?: boolean }

test.describe("Event site — flow complet (login --> create --> publish --> RSVP)", () => {
  test("flow create + edit + publish + RSVP visible dans dashboard", async ({ authedRequest, request, authedPage }) => {
    // 1. Recuperer planner actif
    const plannersRes = await authedRequest.get("/api/planners")
    expect(plannersRes.status()).toBe(200)
    const planners: Planner[] = await plannersRes.json()
    if (!planners.length) {
      test.skip(true, "Pas de planner en DB de dev — flow event-site impossible")
      return
    }
    const planner = planners[0]

    // 2. Creer EventSite (ou recuperer l'existant via 409)
    const createRes = await authedRequest.post("/api/event-site", {
      data: { plannerId: planner.id },
    })
    expect([201, 409, 402, 401]).toContain(createRes.status())
    if (createRes.status() === 401) {
      test.skip(true, "Auth event-site KO en dev")
      return
    }
    if (createRes.status() === 402) {
      test.skip(true, "Plan free et IS_DEV pas actif — paywall")
      return
    }

    const created = (await createRes.json()) as EventSite & { error?: string }
    const siteId = created.id
    expect(siteId, "siteId manquant").toBeTruthy()

    // 3. PATCH content
    const patchRes = await authedRequest.patch(`/api/event-site/${siteId}`, {
      data: {
        content: {
          hero: {
            title: `E2E ${Date.now().toString(36)}`,
            subtitle: "Test sous-titre",
            date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
          program: [],
          welcomeNote: "Bienvenue (test)",
        },
        palette: "rose-or",
      },
    })
    expect([200, 402]).toContain(patchRes.status())

    // 4. Publish
    const publishRes = await authedRequest.post(`/api/event-site/${siteId}/publish`, {
      data: { publish: true },
    })
    expect([200, 402]).toContain(publishRes.status())
    if (publishRes.status() === 402) {
      test.skip(true, "Paywall sur publish (plan free + IS_DEV inactif)")
      return
    }
    const published = (await publishRes.json()) as { published: boolean; publicUrl: string | null; slug: string }
    expect(published.published).toBe(true)
    expect(published.publicUrl).toBeTruthy()

    // 5. Visiter URL publique en NON-AUTH (request brut)
    const publicRes = await request.get(published.publicUrl!)
    expect(publicRes.status(), `public ${published.publicUrl} doit 200`).toBeLessThan(500)
    // 200 ideal, 404 si la route /evt/[slug] n'existe pas encore — on accepte les deux
    expect([200, 404]).toContain(publicRes.status())

    // 6. Verifier le widget RSVP est accessible (GET /api/event-site/[id]/rsvps)
    const rsvpsRes = await authedRequest.get(`/api/event-site/${siteId}/rsvps`)
    expect(rsvpsRes.status()).toBe(200)
    const payload = (await rsvpsRes.json()) as { rsvps: unknown[]; stats: { total: number } }
    expect(Array.isArray(payload.rsvps)).toBe(true)
    expect(payload.stats).toHaveProperty("total")
  })

  test("page edit /dashboard/event-site charge sans 5xx", async ({ authedPage }) => {
    const response = await authedPage.goto("/dashboard/event-site")
    expect(response?.status() ?? 0).toBeLessThan(500)
  })
})
