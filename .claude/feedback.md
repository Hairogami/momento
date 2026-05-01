# Feedback — Sessions Momento

> Auto-chargé par chaque session Claude (référencé dans `.claude/CLAUDE.md`).
> Extrait des corrections explicites, préférences et leçons gagnées au fil des sessions.
> Dernière mise à jour : 2026-04-28

---

## 1. Communication & ton

### Concision = règle absolue (cf. `.claude/rules/concision.md`)
- **Par défaut** : 2-3 paragraphes courts OU 3-5 bullets max. Pas plus.
- **Pas de tableaux exhaustifs** ni H3 empilés dans la première réponse.
- **Expansion seulement sur 2e demande explicite** ("développe", "pourquoi").
- **Format de décision préféré** : `1 position tranchée + raison + coût de ne rien faire`.

### Validation patterns du user
- Shorthand fréquents : `go push`, `go fix`, `go merge`, `oui`, `Top`, `lets go on continue`, `continue`.
- "Bravo" / "Top" → continue exactement dans la même direction.
- Max 2-3 options à proposer, jamais un menu de 5+.
- Quand user demande "tape `X` pour valider" puis tape autre chose → proposer une nouvelle décision tranchée, ne pas re-lister tout.

### Anti-patterns à bannir absolument
- ❌ Capituler sur pression sociale sans fait nouveau (`anti-capitulation.md`).
- ❌ Lister "2 options honnêtes" quand j'avais déjà tranché — c'est une capitulation déguisée.
- ❌ Sur-expliquer l'évident.
- ❌ "Tu as raison" vague sans citer ce qui change dans mon raisonnement.
- ❌ Re-lire un fichier déjà lu sans modif intermédiaire.

---

## 2. Sécurité — leçons CRITIQUES

### 🚨 Manipulation de credentials (incident vécu cette session)
**Erreur commise** : utilisé `diff <fichier1> <fichier2>` pour comparer .env.local — a leaké l'ANCIEN ET le NOUVEAU password Supabase dans le chat. User a dû rotate 2× ce soir.

**Règles absolues** :
- ❌ **NEVER** `diff`, `cat`, `head`, `tail`, `echo` sur fichier contenant un secret.
- ✅ Comparaison silencieuse : `cmp -s file1 file2 && echo IDENTICAL || echo DIFFERENT` (ne montre PAS le contenu).
- ✅ Hash comparison : `sha256sum file | cut -c1-12` (un hash, pas le contenu).
- ✅ Test connexion DB : `prisma db pull --print > /dev/null 2>&1 && echo OK` (silence l'output).
- ✅ Avant tout `Edit` sur `.claude/settings.json` ou similaire : grep proactif pour patterns `postgresql://`, `secret=`, `token=`, `api_key=`, `password=`.

### Procédure rotation password si leak détecté
1. Alerter immédiatement, ne pas continuer la tâche.
2. User : Reset password (Supabase Dashboard).
3. User : Update `.env.local` (sans me dire le password).
4. User : Update Vercel env vars Production + Preview.
5. User : Trigger Redeploy (sinon cache de l'ancien build).
6. Moi : Tester silencieusement la connexion (output redirigé vers /dev/null).

---

## 3. Architecture & infrastructure Momento

### Stack confirmée
- **Next.js 16** (App Router) — middleware = `proxy.ts` (PAS `middleware.ts`)
- **Prisma 7** — import `@/generated/prisma/client` JAMAIS `@prisma/client`
- **Supabase Postgres** — pooler `aws-0-eu-west-1.pooler.supabase.com`
- **NextAuth v5 beta** — strategy JWT, callbacks dans `src/lib/auth.ts`
- **Vercel** — projet `ngf1/momento`, repo GitHub `Hairogami/momento`
- **Domaine** : `momentoevents.app`

### Supabase — règle DATABASE_URL (CRITIQUE, vécue)
- `DATABASE_URL` : **port 6543** + `?pgbouncer=true&connection_limit=1` (pooler transaction mode)
- `DIRECT_URL` : **port 5432** sans paramètres (migrations uniquement)
- **Free tier** = 15 sessions max si pas en pool transaction → DOIT être pooler avec connection_limit=1
- Symptôme du bug : `(EMAXCONNSESSION) max clients reached in session mode - max clients are limited to pool_size: 15`

### Build script obligatoire (Prisma 7+ pas de postinstall)
```json
"build": "prisma generate && next build"
```
Sans `prisma generate` → build fail avec `Module not found '@/generated/prisma/client'`.

### Webhook GitHub→Vercel peut sauter silencieusement
- Symptôme : push réussit côté GitHub, aucun nouveau deploy sur Vercel Deployments.
- Diagnostic : Vercel Settings → Git → si bouton "GitHub | GitLab | Bitbucket" affiché sans repo → integration cassée.
- Fix : reconnect (Connect Git Repository → Hairogami/momento → main).
- Astuce : push commit vide pour réveiller le webhook après reconnect.

### Coming-soon mode (proxy.ts) — routes à exempter
- SEO statique : `/sitemap.xml`, `/robots.txt`, `/manifest.json`
- Next.js metadata dynamiques : `/opengraph-image`, `/twitter-image`, `/icon`, `/apple-icon`
- Standard : `/api/`, `/_next/`, `/favicon`, `/.well-known/`
- Matcher level : exclure aussi `.xml`, `.txt`, `.json` à la racine.

---

## 4. Workflow validé (à reproduire)

### Pour gros chantiers (refactor multi-fichiers)
- Branche dédiée nommée (ex: `phase1-multirole-pending`) pour wip non destiné prod immédiate.
- **Pas de stash sur Windows** (fragile, perdu sur reboot/erreur disque).
- Vague-based delivery : Phase 1 isolée + commit + checkpoint user avant Phase 2-N.
- Atomic commits (1 logique = 1 commit), jamais bundling.

### Avant tout edit sur fichier global (`.claude/`, `~/.claude/skills/`)
1. Backup `.bak.YYYYMMDD` (récupération même hors git).
2. Lecture complète puis edit ciblé (Edit tool > Write si possible).
3. Vérification post-edit : grep pour patterns sensibles, validation JSON/syntax.

### Position d'associé sur décisions ambiguës
Format attendu (apprécié plusieurs fois) :
```
**Position tranchée** : [position en 1 phrase]
Raison : [argument logique]
Coût de ne rien faire : [conséquence concrète]
**Tape `X` pour valider, ou `Y` pour [alternative].**
```

### Audit étendu après tout fix
La règle FIX-EVERYTHING-AS-YOU-GO impose :
- Trouver TOUS les cas similaires au bug rapporté, pas juste le rapporté.
- Exemple session : user signale `/sitemap.xml` redirect → audit étendu trouve aussi `/robots.txt`, `/manifest.json`, `/opengraph-image`, `/twitter-image`, `/icon`, `/apple-icon`.
- Tester systématiquement les endpoints SEO + auth + DB après tout deploy.

---

## 5. Préférences user concrètes

### Outils
- **Vercel CLI installée et linkée** — utiliser `vercel ls`, `vercel logs <url>`, `vercel rollback` au lieu de curl/dashboard.
- Skills appréciés : `gsd-plan-phase`, `gsd-debug`, `compactreview`, `megaplan`, `pressuretest`, `marketbreakdown`.
- User a une vraie discipline TDD/security (Vitest 101 tests, SAST audit, security-by-design.md).

### Décisions d'architecture validées
- **1 email = 3 comptes distincts** (Client/Vendor/Admin) — composite unique `[email, role]`. Variante A confirmée après challenge associé.
- **Admin gating** : whitelist email dans `.env` (`ADMIN_EMAILS=...`).
- **Vendor signup** : modération obligatoire (`vendorStatus pending → active` par admin).
- **Impersonation admin** : audit log table `AdminImpersonation`, banner indélébile UI, auto-expire 30min, mutations destructives bloquées.

### Décisions reportées (à reprendre)
- **Phase 2-8 multi-rôle auth** : sur branche `phase1-multirole-pending` (commit `d6a511d`), à reprendre en session dédiée frais.
- **Sentry setup** : skipped pre-launch, à add quand des vrais users sont en prod.
- **Pages legal en coming-soon** : on attend que le contenu juridique soit FINAL avant de décider exempt ou pas du proxy.
- **Bug `/budget` POST item ne save pas** : diagnostiqué (route POST manque + addExpense() est stub local), fix complet 2-4h pour demain.

---

## 6. Personnages & contexte

- **Yazid Moumene** : fondateur Momento, dev principal, travaille la nuit. Compte `Hairogami` sur GitHub.
- **Anass** : associé, peut prendre le clavier à la place de Yazid (ne pas présumer toujours Yazid au clavier).
- **Mehdi, Omar** : associés, pas vus directement cette session.
- **Bootstrap** : 0 user en prod actuellement. Site en coming-soon mode (`LAUNCH_PUBLIC=false`).
- **Cible** : marché mariage Maroc, 50K+ mariages/an, marketplace + outils gestion.

---

## 7. Choses que je ferais différemment

1. **Vercel CLI dès le début** — pas attendre que le user me suggère, pour avoir `vercel ls/logs/rollback` accessible direct.
2. **Audit endpoints proactif après chaque deploy** — tester `/api/vendors`, `/api/me`, `/sitemap.xml`, etc. systématiquement, pas attendre que le user signale un bug.
3. **Scan credentials AVANT edit** sur `.claude/settings.json` (et tout fichier potentiellement commit).
4. **Comparaisons silencieuses par défaut** — jamais `diff` sur quoi que ce soit potentiellement secret.
5. **Vague-based confirmation** sur gros chantiers (Darwin 30 skills, Phase 2-8 auth, etc.) — proposer Vague 1 baseline, attendre validation avant Vague 2 optim.
6. **Confirmer scope explicite** avant de lancer (e.g., "30 skills" vs "700 skills installés") — ne pas présumer.
7. **Ne pas re-lire** un fichier déjà chargé sans modif (le hook le bloque, mais c'est un signal que je dois utiliser ce qui est en mémoire).
8. **Stash avant modifs sensibles** seulement si Windows + git stable. Préférer branche dédiée pour wip.

---

## 8. Stratégie de gestion du contexte

- Suggérer `/compact` proactivement quand statusline > 30 min ou > 40% utilisé.
- Avant `/compact`, présenter 2 sections "GARDÉ / PERDU" via skill `compactreview`.
- Pour fichiers récurrents (CLAUDE.md, rules/, learnings/), s'appuyer sur l'auto-load au lieu de re-lire.
- Préférer l'outil dédié (Read, Edit, Grep) à Bash inline pour économiser les tokens.

---

**Note d'évolution** : ce fichier est mis à jour à la demande du user (`/feedback update` ou similaire). Il doit rester sous 250 lignes pour ne pas exploser le budget tokens d'init de session.
