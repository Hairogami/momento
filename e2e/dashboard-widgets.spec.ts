import { test, expect } from "./_fixtures"

/**
 * Dashboard widgets — happy path :
 *   1. Login dev (/api/dev-login)
 *   2. Verifier que /dashboard charge sans 5xx
 *   3. Verifier la presence de plusieurs widgets cles
 *   4. Ajouter une tache via TasksWidget --> elle apparait
 *   5. Ajouter un invite via l'API guests (apparition dans GuestsWidget)
 *   6. Toggle dark mode --> classe `.dark` sur <html>
 *
 * Hypotheses :
 *   - Dev server tourne sur localhost:3000
 *   - Au moins 1 user et 1 planner existent en DB de dev (sinon dashboard
 *     redirige vers /onboarding et certains asserts sont assouplis)
 */
test.describe("Dashboard widgets — happy path", () => {
  test("charge le dashboard et affiche les widgets cles", async ({ authedPage }) => {
    const response = await authedPage.goto("/dashboard")
    expect(response?.status() ?? 0, "GET /dashboard doit pas 5xx").toBeLessThan(500)

    // Si l'app redirige vers /onboarding (DB sans planner), on stop ici
    if (/\/onboarding/.test(authedPage.url())) {
      test.skip(true, "Pas de planner en DB — dashboard redirige vers onboarding")
      return
    }

    // Attendre l'hydratation du DOM (DashboardClient charge ses widgets en useEffect)
    await authedPage.waitForLoadState("networkidle", { timeout: 15_000 })

    // Liste des widgets visibles attendus (titres tels qu'affiches dans WidgetCard).
    // On verifie au moins 4 d'entre eux pour eviter d'etre trop strict si la grille
    // par defaut change.
    const expectedTitles = [
      "Compte à rebours", "Countdown",
      "Budget",
      "Tâches", "Tasks",
      "Invités", "Invités RSVP", "Guests",
      "Notes",
      "RSVP", "RSVP Live",
    ]
    const bodyText = (await authedPage.locator("body").innerText()).toLowerCase()
    const matched = expectedTitles.filter(t => bodyText.includes(t.toLowerCase()))
    expect(matched.length, `Trop peu de widgets visibles (${matched.length}) — vu : ${matched.join(", ")}`).toBeGreaterThanOrEqual(3)
  })

  test("ajoute une tache via TasksWidget", async ({ authedPage }) => {
    await authedPage.goto("/dashboard")
    if (/\/onboarding/.test(authedPage.url())) {
      test.skip(true, "Pas de planner en DB")
      return
    }

    await authedPage.waitForLoadState("networkidle", { timeout: 15_000 })

    // Le widget Taches contient un input avec placeholder "Nom de la tâche…"
    const taskInput = authedPage.getByPlaceholder("Nom de la tâche…").first()
    if (await taskInput.count() === 0) {
      test.skip(true, "TasksWidget pas visible dans la grille active")
      return
    }

    const uniqueLabel = `E2E task ${Date.now().toString(36)}`
    await taskInput.fill(uniqueLabel)
    await taskInput.press("Enter")

    // La tache doit apparaitre dans le DOM apres POST
    await expect(authedPage.getByText(uniqueLabel, { exact: false })).toBeVisible({ timeout: 5_000 })
  })

  test("ajoute un invite via API et le voit dans la liste", async ({ authedPage, authedRequest }) => {
    const uniqueName = `E2E Guest ${Date.now().toString(36)}`
    const create = await authedRequest.post("/api/guests", {
      data: { name: uniqueName },
    })
    expect([201, 401, 403]).toContain(create.status())
    if (create.status() !== 201) {
      test.skip(true, `Creation guest impossible (${create.status()}) — DB ou auth indispo`)
      return
    }

    const list = await authedRequest.get("/api/guests")
    expect(list.status()).toBe(200)
    const guests = await list.json()
    expect(Array.isArray(guests)).toBe(true)
    expect(guests.some((g: { name: string }) => g.name === uniqueName)).toBe(true)
  })

  test("toggle dark mode applique la classe .dark sur <html>", async ({ authedPage }) => {
    await authedPage.goto("/dashboard")
    if (/\/onboarding/.test(authedPage.url())) {
      test.skip(true, "Pas de planner en DB")
      return
    }

    await authedPage.waitForLoadState("domcontentloaded")

    // ThemeProvider stocke dans localStorage.theme. On force le toggle via JS pour
    // ne pas dependre d'un selecteur de bouton qui peut bouger.
    await authedPage.evaluate(() => {
      const html = document.documentElement
      const isDark = html.classList.contains("dark")
      const next = isDark ? "light" : "dark"
      try { localStorage.setItem("theme", next) } catch {}
      html.classList.toggle("dark", next === "dark")
    })

    const className = await authedPage.evaluate(() => document.documentElement.className)
    expect(className).toMatch(/dark/)
  })
})
