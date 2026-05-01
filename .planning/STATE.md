# State — Momento

## Active milestone

**v1.0 — Pre-launch readiness**

## Current phase

**04 — budget-fix-complet** (en cours de planning)

## Recent activity

- 2026-04-27 → 2026-04-28 : Sprint debug pre-launch (26 commits, 7 vagues : sécurité CVE, Vitest 101 tests, dark mode centralized, vendor scaling, a11y WCAG AA, bundle -104KB, etc.)
- 2026-04-28 : Migration DB vendor scaling (rankingScore + 3 indexes), 830 vendors backfill
- 2026-04-28 : 6 fixes SEO proxy (sitemap, robots, manifest, og-image, twitter-image, icon, apple-icon)
- 2026-04-28 : Pool exhaustion Supabase fix (DATABASE_URL pooler 6543 + pgbouncer + connection_limit=1)
- 2026-04-28 : Phase 1 multi-rôle auth foundation (commit `d6a511d` sur branche `phase1-multirole-pending`, NON en prod, attendant Phases 2-8)

## Blockers known

- **Bug `/budget`** : route POST `/api/budget-items` manquante, addExpense() stub local sans persistance DB, widget non sync. Voir Phase 04.
- **Phase 2-8 multi-rôle auth** : login/signup pages séparées Vendor/Admin, modération vendor, impersonation admin. À reprendre en session dédiée.
- **Pages legal** : CGU, Mentions Légales, Politique Confidentialité — attente contenu juridique final.

## Conventions actives

- Toutes décisions tracées dans `.claude/feedback.md`
- Règles permanentes dans `.claude/CLAUDE.md` + `.claude/rules/*.md`
- Migrations DB via DIRECT_URL port 5432 (jamais 6543)
- Commits atomiques `feat(scope): desc` ou `fix(scope): desc`
- Build pass `npx next build` avant tout commit feature
