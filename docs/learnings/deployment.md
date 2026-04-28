# Deployment — Momento

> Source de vérité pour TOUT travail deploy. Toute future session lit ce fichier
> avant de toucher à Vercel, Supabase, env vars ou git push.

---

## Infra réelle

- **Hébergeur** : Vercel — projet `ngf1/momento`
- **Domaine** : `momentoevents.app`
- **DB** : **Supabase** (Postgres) — pooler `aws-0-eu-west-1.pooler.supabase.com`
  - Free tier : 15 sessions max en mode "session", ~200 connexions multiplex via PgBouncer transaction mode
- **Email** : Resend
- **Rate-limit** : Upstash Redis
- **Auth** : NextAuth v5 beta (JWT strategy)
- **Repo** : `Hairogami/momento` (GitHub) — Vercel auto-deploy via webhook sur push `main`

---

## ⚠️ Règle deploy

**JAMAIS `git push` ni `vercel deploy --prod` sans confirmation explicite du maître.**
Toujours présenter ce qui va être fait + attendre `go push` ou équivalent.

---

## 🔥 LEÇON CRITIQUE — Pool exhaustion Supabase ("session limit reached 15")

**Symptôme** : build Vercel fail avec `(EMAXCONNSESSION) max clients reached in session mode - max clients are limited to pool_size: 15` OU runtime 500 sur les routes API DB sous charge.

**Cause** : `DATABASE_URL` Vercel pointe vers le **port 5432** (direct mode) au lieu du **pooler 6543**, OU manque les paramètres `?pgbouncer=true&connection_limit=1`. Chaque fonction serverless ouvre alors sa propre connexion Postgres directe → saturation 15 sessions Supabase Free très vite.

**Fix obligatoire** — décomposer l'URL par champ (jamais coller credentials en clair en doc) :

| Champ | DATABASE_URL (runtime) | DIRECT_URL (migrations) |
|---|---|---|
| Protocole | `postgresql` | `postgresql` |
| User | `postgres.<project-ref>` | identique |
| Password | depuis Supabase Settings → Database | identique |
| Host | `aws-0-eu-west-1.pooler.supabase.com` | identique |
| Port | **`6543`** (pooler) | **`5432`** (direct) |
| DB | `postgres` | `postgres` |
| Query | **`?pgbouncer=true&connection_limit=1`** | **(vide)** |

**Règles absolues** :
- `DATABASE_URL` = port **6543** + `?pgbouncer=true&connection_limit=1` (TOUJOURS)
- `DIRECT_URL` = port **5432** sans paramètres (TOUJOURS, et seulement pour `prisma db push` / `prisma migrate`)
- Identique en local (`.env.local`), Production, Preview

**Vérification** : sur Vercel Settings → Environment Variables, copier la fin de `DATABASE_URL` → doit finir par `:6543/postgres?pgbouncer=true&connection_limit=1`. Sinon → bug.

---

## 🔥 LEÇON CRITIQUE — Build script Vercel doit inclure `prisma generate`

**Symptôme** : build fail avec `Module not found: Can't resolve '@/generated/prisma/client'` ou `./src/lib/prisma.ts:1:1`.

**Cause** : `src/generated/prisma/` est dans `.gitignore` (jamais commité). Prisma v7 n'a plus de postinstall implicite → si le build script ne contient pas `prisma generate`, Vercel ne crée jamais le client.

**Fix** dans `package.json` :
```json
"build": "prisma generate && next build"
```
(Ne PAS chaîner `prisma db push` au build — c'est dangereux, ça touche la DB à chaque build.)

---

## 🔥 LEÇON CRITIQUE — Webhook GitHub→Vercel peut sauter

**Symptôme** : tu push sur `main`, le commit est sur GitHub, mais aucun nouveau deploy n'apparaît dans Vercel Deployments. Le dernier deploy reste figé à un commit ancien.

**Cause** : l'integration GitHub Vercel a été disconnect (manuellement ou suite à un événement), ou les permissions GitHub App ont changé.

**Diagnostic** : aller sur https://vercel.com/ngf1/momento/settings/git → si la page affiche les boutons "GitHub | GitLab | Bitbucket" sans repo connecté, ET que la section "Deploy Hooks" en bas dit "This Project is not connected to a Git repository" → integration cassée.

**Fix** :
1. Vercel Settings → Git → cliquer **GitHub** → choisir `Hairogami/momento` → branche `main` → Save
2. Pousser un commit vide pour réveiller le webhook : `git commit --allow-empty -m "chore: trigger vercel deploy" && git push origin main`
3. Vérifier dans Deployments qu'un nouveau deploy "Building" apparaît avec le bon hash

---

## Vercel CLI (52.0.0+)

Installation : `npm i -g vercel` puis `vercel login` puis `vercel link` (choisir `ngf1/momento`).

| Commande | Utilité |
|---|---|
| `vercel ls` | Liste deploys récents (status, age, URL) |
| `vercel logs <url>` | Stream runtime logs d'un deploy spécifique |
| `vercel inspect <url>` | Détails build + size + functions |
| `vercel env ls` | Liste env vars (sans valeurs sensibles) |
| `vercel env add <NAME>` | Ajouter une env var |
| `vercel env pull .env.local` | Sync env Vercel → local (⚠️ écrase `.env.local`) |
| `vercel --prod` | Force deploy le repo local en prod (bypass git) |
| `vercel rollback <url>` | Rollback instant à un deploy précédent |
| `vercel alias list` | Vérifier les alias domaine |

---

## Variables d'environnement Vercel (critiques)

| Variable | Environnement | Format/source |
|---|---|---|
| `DATABASE_URL` | Production + Preview | Supabase pooler 6543 + `?pgbouncer=true&connection_limit=1` |
| `DIRECT_URL` | Production + Preview | Supabase direct 5432 (migrations) |
| `AUTH_SECRET` | All | `openssl rand -hex 32` |
| `GOOGLE_CLIENT_ID` | All | OAuth Google credentials web prod |
| `GOOGLE_CLIENT_SECRET` | All | OAuth Google |
| `RESEND_API_KEY` | All | resend.com |
| `RESEND_FROM_EMAIL` | All | `noreply@momentoevents.app` |
| `CRON_SECRET` | All | `openssl rand -hex 32` (auth des routes /api/cron/*) |
| `SENTRY_DSN` | All (optional) | sentry.io project DSN |
| `NEXT_PUBLIC_SENTRY_DSN` | All (optional) | même DSN exposé browser |
| `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` | All (optional) | Source maps upload |
| `UPSTASH_REDIS_REST_URL` | All | rate-limit |
| `UPSTASH_REDIS_REST_TOKEN` | All | rate-limit |
| `NEXT_PUBLIC_APP_URL` | All | `https://momentoevents.app` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | All | Cloudflare CAPTCHA |
| `TURNSTILE_SECRET_KEY` | All | Cloudflare CAPTCHA |
| `LAUNCH_PUBLIC` | Production | `true` quand site public (off coming-soon) |

---

## 🔐 Sécurité credentials — règles absolues

- **JAMAIS** mettre un mot de passe DB en clair dans `.claude/settings.json` (Bash allow list, hooks, scripts). Cette file est tracké git → leak permanent.
- **JAMAIS** committer `.env.local` (déjà gitignored, vérifier).
- **JAMAIS** afficher un password DB en sortie shell (`diff`, `cat`, `echo`) — tout output passe en logs Claude.
- Pour comparer 2 fichiers .env : `cmp -s file1 file2 && echo IDENTICAL || echo DIFFERENT` (ne montre pas le contenu).
- Pour tester une connexion DB : `prisma db pull --print > /dev/null 2>&1 && echo OK` (silence l'output).

**Procédure rotation password Supabase** (si leak ou suspicion) :
1. Supabase Dashboard → Settings → Database → Reset password (génère nouveau)
2. Update `.env.local` (main repo + tous worktrees) — utiliser `cp` silencieux entre eux
3. Update Vercel Production + Preview env vars (`DATABASE_URL` et `DIRECT_URL`)
4. **Trigger un Redeploy** Vercel sinon l'ancien build cache l'ancien password
5. Vérifier `npx prisma db pull --print > /dev/null 2>&1 && echo OK` localement

---

## Migrations DB Prisma

```bash
# Toujours via DIRECT_URL (port 5432), JAMAIS DATABASE_URL (6543)
DATABASE_URL=$DIRECT_URL npx prisma db push                    # Sync schema → DB
DATABASE_URL=$DIRECT_URL npx prisma db push --accept-data-loss # Si destructif (rare)
npx prisma generate                                            # Régénère client (après modif schema)
npx prisma studio                                              # GUI localhost:5555
```

**Avant `db push`** : faire un `npx prisma db pull --print | grep -i <new_thing>` pour vérifier l'état actuel DB et anticiper les warnings.

---

## Diagnostic build qui fail

```bash
# 1. Tester en local d'abord (mêmes commandes que Vercel)
npx tsc --noEmit                              # Type-check
npx next build                                # Build complet

# 2. Si pass local mais fail Vercel → différence env
vercel env ls                                 # Vérifier env vars présentes
vercel logs <deployment-url>                  # Logs build du deploy fail
```

Build communs qui fail :
- `Module not found '@/generated/prisma/client'` → manque `prisma generate` dans build script
- `EMAXCONNSESSION pool_size: 15` → `DATABASE_URL` pas en mode pooler 6543
- `Cannot find module '...'` après upgrade → `npm install` pas refait localement avant push

---

## Domaine momentoevents.app — dépannage

```bash
vercel alias list                # Doit afficher momentoevents.app
vercel ls                        # Voir les derniers déploiements
```

Si alias vide → Vercel Dashboard → projet ngf1/momento → Settings → Domains.

DNS manuel (si "Configure Automatically" échoue) :
- A record : `@` → `216.198.79.1`
- CNAME : `www` → `cname.vercel-dns.com`

---

## Workflow deploy standard

1. **Local** : `npx tsc --noEmit && npx next build` → green
2. **Confirm** explicite du maître → "go push" ou équivalent
3. **Commit** atomique : `feat(scope): desc` ou `fix(scope): desc`
4. **Push** : `git push origin main`
5. **Monitor** : `vercel ls` (attendre le nouveau deploy "Building" → "Ready", ~2-3 min)
6. **Validate prod** : `curl -s -o /dev/null -w "%{http_code}\n" https://momentoevents.app/api/vendors` → doit être `200`
7. **Si fail** : `vercel logs <last-url>` pour debug, ou `vercel rollback <previous-url>` en urgence

**Post-commit obligatoire** : `git status` + `git log origin/main..HEAD --oneline` — annoncer combien de commits non poussés.
