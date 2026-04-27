# P2 — getUserId() helper extraction

## Goal

Dédupliquer le branchement `IS_DEV ? requireSession() : auth()` répété dans
15+ routes API. Risque : oublier le branche dans une nouvelle route =
bug en local (auth fail) ou bypass en prod (si inversé).

## Helper signature + location

**Fichier** : `src/lib/api-auth.ts`

```ts
import { auth } from "@/lib/auth"
import { requireSession } from "@/lib/devAuth"
import { IS_DEV } from "@/lib/devMock"

export async function getUserId(): Promise<string | null> {
  if (IS_DEV) {
    const s = await requireSession()
    return s.user.id
  }
  const session = await auth()
  return session?.user?.id ?? null
}
```

Une seule fonction (pas de `getUserIdOrThrow` — chaque route choisit son
status code/format de réponse, donc thrower aurait demandé un middleware
de catch dédié, complexité injustifiée pour 1 ligne de check).

## Routes refactorées (17 routes)

Pattern A — `IS_DEV ? requireSession() : auth()` inline (planners family) :
1. `src/app/api/planners/[id]/route.ts` — 3 handlers (GET + PATCH + DELETE)
2. `src/app/api/planners/[id]/dashboard-data/route.ts`
3. `src/app/api/planners/[id]/steps/route.ts`
4. `src/app/api/planners/[id]/events/route.ts`

Pattern B — `let userId; if (IS_DEV) { ... } else { ... }` block :
5. `src/app/api/me/route.ts`
6. `src/app/api/unread/route.ts`
7. `src/app/api/notifications/route.ts`
8. `src/app/api/notifications/[id]/read/route.ts`
9. `src/app/api/budget-items/[id]/route.ts`
10. `src/app/api/tasks/[id]/route.ts` — 2 handlers (PATCH + DELETE)
11. `src/app/api/steps/[id]/route.ts` — 2 handlers (PATCH + DELETE)
12. `src/app/api/guests/[id]/route.ts` — 2 handlers (PATCH + DELETE)
13. `src/app/api/planners/[id]/rsvps/route.ts`
14. `src/app/api/planners/[id]/guests/export/route.ts` (avec `requireVerifiedEmail` simplifié — bypass déjà géré par `auth-guards.ts` en IS_DEV)

Pattern C — fichiers avec un local `getUserId` helper dupliqué (remplacé par import) :
15. `src/app/api/guests/route.ts`
16. `src/app/api/guests/[id]/link/route.ts`
17. `src/app/api/rsvps/[id]/route.ts`

## Routes laissées intactes (par design, pattern différent)

- `src/app/api/favorites/route.ts` — pattern « auth d'abord, fallback admin user en dev ». Logique différente.
- `src/app/api/vendor/[slug]/favorite/route.ts` — idem (auth puis fallback admin).
- `src/app/api/stats/route.ts` — IS_DEV utilisé pour data fallback (mock data si DB vide), pas pour brancher l'auth.
- `src/app/api/event-site/[id]/route.ts` — IS_DEV utilisé pour bypass paywall plan-gating, pas pour brancher l'auth.
- `src/app/api/planners/route.ts` — GET a un code path complètement différent en IS_DEV (skip purge, simpler select). Pas un simple branch d'auth.

## Lignes économisées

```
17 files changed, 64 insertions(+), 223 deletions(-)
```

= **~159 lignes nettes supprimées** (les 64 insertions incluent les nouveaux
imports `getUserId`, donc le delta brut est ~6-9 lignes par route × 17 routes).

Helper créé : `src/lib/api-auth.ts` = 41 lignes (avec doc commentée).

## Verification

- `npx tsc --noEmit` → EXIT=0
- `npx next build` → build pass (toutes les routes API listées dans le manifest)
- Grep `IS_DEV` dans `src/app/api` : passé de 22 fichiers → 6 fichiers (les 6
  intentionnellement exclus, pour data/paywall logic)
- Grep `requireSession` dans `src/app/api` : passé de 18 fichiers → 1 fichier
  (`planners/route.ts` GET, code path différent)

## Pourquoi ça compte

Avant : pour ajouter une nouvelle route auth, le dev devait recopier
~9 lignes de boilerplate à chaque fois. Risque d'oubli ou d'inversion
(prod qui appelle requireSession = bypass auth).

Après : 1 ligne `const userId = await getUserId()` + 1 ligne de check.
Logique centralisée. Toute évolution future de la stratégie d'auth
(ex: ajouter rate limiting par user, logging, instrumentation) se fait
dans 1 seul fichier.
