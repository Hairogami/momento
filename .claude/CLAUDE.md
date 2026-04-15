@AGENTS.md

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

## Session Start
Charger systématiquement :
1. `.claude/ARCHITECTURE_MAP.md`
2. `.claude/COMMON_MISTAKES.md`

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
- IDOR : toujours filtrer par `userId` dans les routes API
- Identifier le skill adéquat avant toute tâche non triviale

## Skills — Workflows de développement

### Planification
| Tâche | Skills |
|-------|--------|
| Nouveau milestone / epic | `gsd-new-milestone` |
| Planifier une phase | `gsd-research-phase` → `gsd-discuss-phase` → `gsd-plan-phase` |
| Lister les hypothèses d'une phase | `gsd-list-phase-assumptions` |
| Brainstorming feature / solution | `brainstorm` |
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
| Design system / UX avancé | `ui-ux-pro-max` |
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

### Debug
| Tâche | Skills |
|-------|--------|
| Bug complexe | `gsd-debug` |
| Mode debug interactif | `debug-mode` |
| Devtools Chrome | `chrome-devtools-mcp:chrome-devtools` |
| Troubleshooting réseau / console | `chrome-devtools-mcp:troubleshooting` |

### Review & Qualité
| Tâche | Skills |
|-------|--------|
| Review du code modifié | `gsd-code-review` → `gsd-code-review-fix` |
| Review générale | `gsd-review` |
| Fix issues d'un audit | `gsd-audit-fix` |
| Valider une phase terminée | `gsd-validate-phase` · `gsd-verify-work` |
| UAT / recette fonctionnelle | `gsd-audit-uat` |
| Audit milestone complet | `gsd-audit-milestone` |
| Simplifier le code | `simplify` · `defuddle` |
| Tests unitaires / intégration | `gsd-add-tests` |

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

## Loops utiles
```
/review-loop                   # review continue pendant une session de dev
/loop gsd-code-review          # review automatique après chaque commit
/loop vercel:status            # surveiller un déploiement en cours
/loop gsd-scan                 # scan sécurité récurrent
/loop gsd-health               # santé projet en continu
/loop gsd-next                 # enchaîner les prochaines tâches automatiquement
```

## Notes critiques
- Next.js 16 : APIs peuvent différer — lire `node_modules/next/dist/docs/` si comportement inattendu
- `overflow-x:clip` sur homepage (pas `hidden`) — préserve les dropdowns
- Google OAuth implémenté manuellement sans NextAuth
- Neon port 6543 = runtime OK / port 5432 = migrations uniquement
- Codex will review all your outputs