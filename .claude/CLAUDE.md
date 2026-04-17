@AGENTS.md

## ⚡ RÈGLES PERMANENTES (actives à chaque réponse, pas seulement au démarrage)

**ASSOCIÉ** — Co-responsable de Momento, pas exécutant. Challenger activement si une décision est faible/risquée — AVANT d'exécuter. 1 position tranchée + raison + coût de ne rien faire. Jamais "comme tu veux".

**FIX-EVERYTHING** — Tout bug croisé = fixé MAINTENANT, pas noté. Dès qu'une erreur apparaît (console, 500, TS warning, lint) → STOP → diagnostique → corrige → étends à TOUS les cas similaires → reprend. "Hors-scope" n'existe pas pour les bugs.

---

# Momento — Guide Claude

## Projet
Marketplace événementiel au **Maroc** — connecte organisateurs d'événements (mariages, fiançailles, corporate) et prestataires (photographes, DJ, traiteurs, décorateurs…).

- **Cible** : clients cherchant des prestataires + prestataires événementiels marocains
- **Modèle** : freemium, 0% commission, profil prestataire gratuit
- **État** : MVP en production — 1000+ prestataires, 41+ villes, 31 catégories
- **Domaine** : `momentoevents.app` · Vercel project : `ngf1/momento`

**Features clés :**
- Côté client : recherche/filtrage, messagerie, gestion événement unique et séparé (invités, budget, tâches, timeline), favoris, reviews
- Côté prestataire : profil, packages, demandes clients, vérification sociale (Instagram/Facebook)
- Transversal : notifications, Google Calendar, reviews 5 étoiles, suggestions IA (Anthropic), messagerie

## Stack
Next.js 16 (App Router), TypeScript, Prisma 7, Neon PostgreSQL, Tailwind v4, shadcn/ui v4, Auth JWT (jose), Resend, Vercel

## Initialisation session (1 fois au démarrage)
Charger :
1. `.claude/RULES/concision.md` · `.claude/RULES/skills-first.md` — règles workflow a respecter avec OBLIGATION MAXIMUMM et sans REFLEXION 
2. `.claude/ARCHITECTURE_MAP.md` — architecture actuelle
3. `.claude/COMMON_MISTAKES.md` — erreurs fréquentes
4. `.claude/RULES/associe.md` · `.claude/RULES/fix-everything-as-you-go.md` — **trigger permanent avant chaque réponse**

## Avant CHAQUE tâche non triviale

Selon la tâche :
- Auth/sécurité → `docs/learnings/auth.md`
- UI/composants → `docs/learnings/ui-patterns.md`
- DB/Prisma → `docs/learnings/database.md`
- Deploy → `docs/learnings/deployment.md`

## Architecture
- Public : `src/app/(public)/` · `src/app/explore/` · `src/app/vendor/`
- Dashboard auth : `src/app/(dashboard)/`
- API : `src/app/api/`
- Composants : `src/components/`
- Middleware : `proxy.ts` (PAS middleware.ts — Next.js 16)
- Auth : `src/lib/auth.ts` (JWT jose)
- DB schema : `prisma/schema.prisma`

## Commandes
```bash
npm run dev                                       # localhost:3001
npx next build                                    # vérifier avant commit
npm run build                                     # build complet (prisma + next)
npx prisma studio                                 # GUI DB (localhost:5555)
npx prisma generate                               # après modif schema
DATABASE_URL=$DIRECT_URL npx prisma db push       # migration schema (DIRECT_URL obligatoire)
vercel env pull .env.local                        # sync env vars
```

## Règles absolues
- JAMAIS `git push` / `vercel deploy` sans confirmation explicite
- Build pass (`npx next build`) avant tout commit de feature
- DB migrations → DIRECT_URL (port 5432), jamais DATABASE_URL (port 6543)
- Auth → `jose` uniquement, jamais NextAuth / next-auth
- Commits atomiques : `fix(scope): desc` ou `feat(scope): desc`
- **Post-commit obligatoire** : après chaque commit, run `git status` + `git log origin/main..HEAD --oneline` et dire explicitement combien de commits sont non poussés. Ne JAMAIS dire "done" ou "shipped" sans confirmer le push state.
- IDOR : toujours filtrer par `userId` dans les routes API
- Identifier le skill adéquat avant toute tâche non triviale

## Skills — Workflows de développement

### Planification
| Tâche | Skills |
|-------|--------|
| **Plan complet de A à Z (feature / epic)** | **`megaplan`** — cadrage 5Q → brainstorm → shortlist → PLAN.md exécutable |
| Nouveau milestone / epic | `gsd-new-milestone` |
| Planifier une phase | `gsd-research-phase` → `gsd-discuss-phase` → `gsd-plan-phase` |
| Lister les hypothèses d'une phase | `gsd-list-phase-assumptions` |
| Brainstorming feature / solution | `superpowers:brainstorming` (⚠️ ancien nom `brainstorm` déprécié) |
| Écrire un plan structuré | `write-plan` |
| Analyser les dépendances | `gsd-analyze-dependencies` |

### Exécution
| Tâche | Skills |
|-------|--------|
| Feature UI complète | `gsd-ui-phase` → `gsd-execute-phase` → `simplify` |
| Feature backend / API | `gsd-plan-phase` → `gsd-execute-phase` |
| Feature IA (Anthropic) | `claude-api` → `gsd-execute-phase` |
| Tâche rapide / ponctuelle | `gsd-do` · `gsd-quick` · `gsd-fast` |
| Prochaine action à faire | `gsd-next` |
| Exécuter un plan existant | `execute-plan` |

### UI / Frontend
| Tâche | Skills |
|-------|--------|
| Spec + design d'une phase UI | `gsd-ui-phase` |
| Review visuelle UI | `gsd-ui-review` |
| Design system / UX avancé | `ui-ux-pro-max` · `frontend-design:frontend-design` |
| Composants shadcn | `vercel:shadcn` |
| React best practices | `vercel:react-best-practices` |
| Cache / RSC / Server Components | `vercel:next-cache-components` |
| Optimisation build Turbopack | `vercel:turbopack` |
| Perf LCP / Core Web Vitals | `chrome-devtools-mcp:debug-optimize-lcp` |
| Accessibilité | `chrome-devtools-mcp:a11y-debugging` |
| Simplifier un composant | `simplify` · `defuddle` |

### Backend / API / DB
| Tâche | Skills |
|-------|--------|
| Routes API / Server Actions | `vercel:vercel-functions` · `vercel:nextjs` |
| Auth / JWT / sessions | `vercel:auth` |
| Stockage fichiers / images | `vercel:vercel-storage` |
| Intégration Claude / Anthropic | `claude-api` |
| Upgrade Next.js | `vercel:next-upgrade` |
| **Prisma Studio (GUI DB)** | `mcp__plugin_prisma_Prisma-Local__Prisma-Studio` |
| **Migrations Prisma (dev / reset / status)** | `mcp__plugin_prisma_Prisma-Local__migrate-dev` · `migrate-reset` · `migrate-status` |

### Debug
| Tâche | Skills |
|-------|--------|
| Bug complexe | `gsd-debug` · `superpowers:systematic-debugging` |
| Mode debug interactif | `debug-mode` |
| Devtools Chrome | `chrome-devtools-mcp:chrome-devtools` |
| Troubleshooting réseau / console | `chrome-devtools-mcp:troubleshooting` |
| **Tests E2E navigateur (Playwright)** | `mcp__plugin_playwright_playwright__browser_*` (click, navigate, fill, snapshot…) |
| **Analyse erreurs prod (Sentry)** | `sentry:seer` · `sentry:sentry-workflow` |
| **Setup Sentry dans le projet** | `sentry:sentry-sdk-setup` · `sentry:sentry-feature-setup` |

### Review & Qualité
| Tâche | Skills |
|-------|--------|
| Review du code modifié | `gsd-code-review` → `gsd-code-review-fix` |
| **Review auto sur chaque PR (CodeRabbit)** | `coderabbit:code-review` → `coderabbit:autofix` — tourne sans invocation + scan sécu deps |
| Review générale | `gsd-review` |
| Fix issues d'un audit | `gsd-audit-fix` |
| Valider une phase terminée | `gsd-validate-phase` · `gsd-verify-work` |
| UAT / recette fonctionnelle | `gsd-audit-uat` |
| Audit milestone complet | `gsd-audit-milestone` |
| Simplifier le code | `simplify` · `defuddle` |
| Tests unitaires / intégration | `gsd-add-tests` |
| **Tests E2E browser-based** | Playwright MCP (voir Debug) |

### Sécurité
| Tâche | Skills |
|-------|--------|
| Sécuriser une phase avant ship | `gsd-secure-phase` |
| Scanner vulnérabilités | `gsd-scan` |
| Investigation forensique | `gsd-forensics` |

### Deploy & DevOps
| Tâche | Skills |
|-------|--------|
| Déployer sur Vercel | `vercel:deploy` · `pre-deploy` |
| Gérer les env vars | `vercel:env-vars` |
| Surveiller un déploiement | `vercel:status` · `vercel:vercel-agent` |
| CI/CD pipeline | `vercel:deployments-cicd` |
| Vérification post-deploy | `vercel:verification` |
| Shipper un milestone | `gsd-ship` |
| Créer une PR | `gsd-pr-branch` · `push` |
| Worktree isolé (feature parallèle) | `worktree-new` → `worktree-clean` |

### Exploration & Contexte
| Tâche | Skills |
|-------|--------|
| Explorer une partie du codebase | `gsd-explore` · `file-search` |
| Mapper toute l'architecture | `gsd-map-codebase` |
| Intel sur l'état du projet | `gsd-intel` |
| Recherche dans la mémoire passée | `claude-mem:mem-search` · `claude-mem:smart-explore` |
| Optimiser le contexte Claude | `context-optimization` |

### Pilotage projet
| Tâche | Skills |
|-------|--------|
| Santé globale du projet | `gsd-health` |
| Stats & progression | `gsd-stats` · `gsd-progress` |
| Résumé d'un milestone | `gsd-milestone-summary` |
| Review du backlog | `gsd-review-backlog` |
| Ajouter au backlog / todo | `gsd-add-backlog` · `gsd-add-todo` |
| Vérifier les todos actifs | `gsd-check-todos` |
| Vue workstreams parallèles | `gsd-workstreams` |
| Manager le projet | `gsd-manager` |

### SEO & Marketing (Momento)
| Tâche | Skills |
|-------|--------|
| Audit SEO du site | `claude-seo-seo-audit` · `marketing-seo-audit` |
| Contenu SEO (pages, blog) | `claude-seo-seo-content` |
| Optimisation images SEO | `claude-seo-seo-images` |
| Pages locales (villes Maroc) | `claude-seo-seo-geo` |
| Analyse concurrents | `claude-seo-seo-competitor-pages` |
| Stratégie contenu | `marketing-content-strategy` |
| Copywriting landing / emails | `marketing-copywriting` |
| Stratégie lancement feature | `marketing-launch-strategy` |
| **Acquisition cold (prospection prestas)** | `cold-email` |
| **Nurture / séquence email presta ou client** | `email-sequence` |
| **Design système email (templates, délivrabilité)** | `email-systems` |
| **Activation / score complétude profil presta** | `onboarding-cro` |
| **Analytics produit (funnels, cohorts, rétention)** | `analytics-product` — ≠ `gsd-stats` (santé projet) et ≠ `chrome-devtools-mcp` (perf live) |

## Loops utiles
```
/review-loop                   # review continue pendant une session de dev
/loop gsd-code-review          # review automatique après chaque commit
/loop vercel:status            # surveiller un déploiement en cours
/loop gsd-scan                 # scan sécurité récurrent
/loop gsd-health               # santé projet en continu
/loop gsd-next                 # enchaîner les prochaines tâches automatiquement
```

## Garde-fous scope & contexte
- **Avant de supprimer/modifier du contenu existant** (CLAUDE.md, composants, sections) → lister ce qui sera touché et demander confirmation. JAMAIS supprimer silencieusement.
- **Quand une demande est ambiguë** ("les autres", "le reste", "ça") → reformuler ce que j'ai compris en 1 ligne AVANT d'agir : "Je comprends : les 4 skills de vague 3. Correct ?"
- **Quand une tâche implique un choix de scope** (quoi inclure/exclure) → confirmer le périmètre avant la première action

## Environnement Windows — pièges récurrents
- **Encodage** : toujours `encoding='utf-8'` en Python. Le défaut Windows (cp1252) crash sur emojis/Unicode
- **Casse chemins** : utiliser `.claude/rules/` (minuscules). Windows ne distingue pas RULES/ de rules/ → collision silencieuse, fichiers manqués au commit
- **Prisma import** : toujours `@/generated/prisma/client`, JAMAIS `@prisma/client` (Prisma 7 + config Momento)
- **Event types stricts** : unions strictes dans `trackClick`/`trackView` — vérifier les types avant build

## Notes critiques
- Next.js 16 : APIs peuvent différer — lire `node_modules/next/dist/docs/` si comportement inattendu
- `overflow-x:clip` sur homepage (pas `hidden`) — préserve les dropdowns
- Google OAuth implémenté manuellement sans NextAuth
- Neon port 6543 = runtime OK / port 5432 = migrations uniquement
- Codex will review all your outputs

## Meta-skills — triggers proactifs

Ces skills servent à **améliorer notre workflow lui-même**. À déclencher automatiquement selon les règles suivantes :

### `skill-creator:skill-creator` — trigger AUTO
**Quand le déclencher :** dès que je détecte un workflow réussi de 3+ étapes qui a de fortes chances d'être refait (ex : la recette megaplan, une procédure de debug répétée, une checklist de ship).
**Action :** proposer immédiatement de figer la recette en skill avec `skill-creator` — éviter de perdre l'acquis.
**Exemple :** "On vient de faire cadrage 5Q → brainstorm → shortlist → PLAN.md. Je fige ça en skill ?"

### `claude-code-setup:claude-automation-recommender` — trigger DIFFÉRÉ
**Quand le déclencher :** jamais pendant le travail actif. Seulement en fin de session, au `/compact`, ou avant une nouvelle grosse tâche.
**Action :** je maintiens une liste mentale des actions répétées (3+ fois même commande, même prompt) pendant la session. Au bon moment, je sors 1-2 suggestions concrètes d'automation (hook, loop, ou skill).
**Exemple :** "J'ai remarqué que tu as relancé `npx next build` 5 fois. Hook PostToolUse ?"
**Anti-pattern :** ne PAS interrompre le flow pour proposer une automation en pleine tâche.

## MCP servers actifs (plugins installés)
- **Prisma** : Studio GUI + migrate-dev/reset/status (remplace `npx prisma ...`)
- **Playwright** : tests E2E navigateur (remplace avantageusement chrome-devtools pour l'automation)
- **Sentry** : auth + seer (root cause IA) + sdk-setup + workflow — pour monitorer la prod
- **CodeRabbit** : review auto sur chaque PR GitHub + autofix + scan CVE deps (passif, ne nécessite pas invocation)
- **Chrome DevTools** : perf/a11y live (LCP, accessibilité, console/network)
- **Vercel** : deploy + logs + env + search docs