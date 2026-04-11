# Documentation Index — Momento
~200 tokens | Navigation par tâche

## Charger selon la tâche

| Tâche | Fichier | Tokens estimés |
|-------|---------|----------------|
| Auth, sessions, protection routes | `docs/learnings/auth.md` | ~400 |
| UI, composants, Tailwind, palette | `docs/learnings/ui-patterns.md` | ~350 |
| Prisma, Supabase/Neon, migrations | `docs/learnings/database.md` | ~400 |
| Deploy Vercel, env vars, domaine | `docs/learnings/deployment.md` | ~350 |

## Session start obligatoire (~600 tokens)
1. `.claude/ARCHITECTURE_MAP.md` — structure complète
2. `.claude/COMMON_MISTAKES.md` — erreurs à éviter
3. `.claude/QUICK_START.md` — commandes du quotidien

## Ne JAMAIS auto-charger
- `.claude/completions/**` — historique des tâches (0 token sauf besoin)
- `.claude/sessions/**` — sessions archivées (0 token sauf besoin)
- `docs/archive/**` — docs obsolètes

## Avant vs Après optimisation

| Métrique | Avant | Après |
|----------|-------|-------|
| Session start | ~8 000 tokens | ~800 tokens |
| Tâche typique | ~10 000 tokens | ~1 500 tokens |
| Économie | — | ~85% |
