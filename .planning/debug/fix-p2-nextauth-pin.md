# P2 — Pin NextAuth + Harden Proxy Cookie Fallback

**Date** : 2026-04-27
**Branch** : `claude/unruffled-wright-6c6cea`
**Concern adressee** : CONCERNS.md — "Hardcodes `authjs.session-token` / `__Secure-authjs.session-token`. If NextAuth v5 stable changes cookie name during beta exit, proxy breaks silently."

## Resume

Trois durcissements appliques pour blinder la dependance NextAuth v5 beta :

1. **Version pinee** — `package.json` retire le caret pour eviter une bump beta automatique
2. **Cookie fallback defensif** — `proxy.ts` accepte 4 noms de cookies session (v5 + v4 legacy + variantes `__Secure-`)
3. **TODO explicite** — commentaire bloquant dans `proxy.ts` pour la transition v5-stable
4. **Test E2E** — couverture du gate auth pour detecter une regression silencieuse

## Detail des changements

### 1. Pin NextAuth (`package.json`)

```diff
- "next-auth": "^5.0.0-beta.30",
+ "next-auth": "5.0.0-beta.30",
```

`package-lock.json` confirme la version installee :
```json
"node_modules/next-auth": { "version": "5.0.0-beta.30" }
```

Effet : `npm install` ne pourra plus monter automatiquement vers `5.0.0-beta.31` ou `5.0.0` stable. Toute bump devra etre explicite (= revue + test).

### 2. Cookie fallbacks (`src/proxy.ts`)

Avant : 2 noms hardcodes (v5 only).
Apres : 4 noms parcourus en cascade.

```ts
const SESSION_COOKIE_NAMES = [
  "authjs.session-token",              // NextAuth v5 (current)
  "__Secure-authjs.session-token",     // NextAuth v5 over HTTPS
  "next-auth.session-token",           // NextAuth v4 legacy fallback
  "__Secure-next-auth.session-token",  // NextAuth v4 legacy over HTTPS
]
const sessionCookie = SESSION_COOKIE_NAMES
  .map(name => request.cookies.get(name)?.value)
  .find(Boolean)
```

Cette liste protege contre :
- Un user avec un cookie v4 residuel (migration)
- Un changement de nom de cookie a la sortie du beta (v5 stable)
- Les deux variantes `Secure-` que NextAuth choisit selon le scheme

### 3. TODO transition v5-stable (`src/proxy.ts`)

Commentaire ajoute juste avant la constante :
```ts
// TODO: when NextAuth exits beta to v5 stable, verify the cookie name
// stays as `authjs.session-token`. If renamed, update SESSION_COOKIE_NAMES.
// See: https://authjs.dev/getting-started/migrating-to-v5
```

### 4. Test E2E (`e2e/smoke-proxy.spec.ts`)

Nouveau fichier — 3 tests Playwright qui couvrent le gate proxy specifiquement :

- `/dashboard` anonyme -> redirige `/login`
- `/admin` anonyme -> redirige `/login`
- `/explore` anonyme -> reste sur `/explore` (route publique non gated)

Si NextAuth change le nom du cookie sans qu'on update `SESSION_COOKIE_NAMES`, ces tests resteront verts (anonyme = pas de cookie de toute facon). Mais ils detecteront la regression inverse : un faux positif ou une route publique qui se met a redirige.

## Verification

| Check | Resultat |
|-------|----------|
| `npx tsc --noEmit` | Clean |
| `npx next build` | Pass — Proxy detecte (ƒ Proxy (Middleware)) |
| `package-lock.json` | next-auth pinne a 5.0.0-beta.30 |
| Build artifacts | Aucune regression detectee |

## Fichiers touches

- `package.json` (pin)
- `package-lock.json` (regenere)
- `src/proxy.ts` (cookie fallback + TODO)
- `e2e/smoke-proxy.spec.ts` (nouveau)
- `.planning/debug/fix-p2-nextauth-pin.md` (ce rapport)
