# Skills Reference — Momento

## Skill custom installé

### darwin-skill
**Path :** `C:/Users/moume/.claude/skills/darwin-skill/`
**Role :** optimiseur autonome de SKILL.md. Évalue un skill sur un rubric 8 dimensions (60pts structural + 40pts live test), lance une boucle hill-climbing avec git version control, et valide les améliorations via des test prompts. Retient seulement les changements qui améliorent strictement le score (ratchet mechanism).

**Quand l'invoquer** (triggers automatiques) :
- "optimise ce skill", "skill review", "évalue ce skill"
- "améliore mes skills en continu"
- "skill quality check", "score skill"
- "auto-optimise mes agents"

**Intégration Momento — cible prioritaire :**
Les 16 agents dans `.claude/AGENTS/` (analytics-engineer, content-marketer, landing-page-optimizer, payment-integration, postgres-pro, product-manager, react-specialist, security-auditor, seo-specialist, typescript-pro, ux-researcher, etc.) sont des candidats naturels pour une passe Darwin. Chacun est un SKILL.md potentiel à scorer + optimiser.

**Workflow recommandé :**
1. Invoque Darwin sur un agent : "Optimise .claude/AGENTS/landing-page-optimizer.md avec Darwin"
2. Darwin produit un score baseline + test prompts + propose 3 variations
3. Review des variations, garde celle au score le plus haut (ratchet)
4. Commit atomique par agent optimisé

**Risque à connaître :** Darwin génère des variations via LLM, donc chaque run coûte des tokens. Lance-le par batch de 1-2 agents à la fois, pas sur les 16 d'un coup.

---

## Routage skills intégrés par team (référence CLAUDE.md)

- **Team 1 Backend** (route/API/auth/DB/Prisma) → `vercel:nextjs`, `vercel:vercel-storage`, `vercel:auth`, `postgres-pro`
- **Team 2 Frontend** (UI/composants/Tailwind) → `vercel:shadcn`, `vercel:react-best-practices`, `frontend-design:frontend-design`, `ui-ux-pro-max`, `react-specialist`
- **Team 3 QA** (bug/test/review/sécurité) → `gsd-debug`, `gsd-code-review`, `superpowers:systematic-debugging`, `security-auditor`, `coderabbit:code-review`
- **Team 4 DevOps** (deploy/env/Vercel) → `vercel:deploy`, `vercel:env`, `vercel:deployments-cicd`, `push`, `pre-deploy`
- **Team 5 Docs** (doc/mémoire/SEO) → `gsd-docs-update`, `claude-seo-seo-audit`, `seo-specialist`, `content-marketer`

## Workflow skills recommandés

- **Planifier une feature multi-fichiers** → `megaplan` (4 étapes bloquantes : cadrage → brainstorm → shortlist → PLAN.md)
- **Exécuter un plan existant** → `superpowers:executing-plans` ou `gsd-execute-phase`
- **Brainstormer avant de coder** → `superpowers:brainstorming`
- **Debugger un bug complexe** → `superpowers:systematic-debugging` ou `gsd-debug`
- **TDD sur nouvelle feature** → `superpowers:test-driven-development`
- **Avant merge** → `superpowers:verification-before-completion`, `gsd-ship`
