# Roadmap Phase 1 — Ordre d'exécution complet

> **À LIRE EN PRIORITÉ après chaque /compact.**
> Contient l'ordre strict des tâches + rappel du pivot architectural.

---

## Contexte

Pendant T3 on a découvert que **`/vendor/[slug]` ne lit pas la DB** mais deux
fichiers TS statiques (`src/lib/vendorData.ts` + `src/lib/vendorDetails.ts`).
Conséquence : admin DB + dashboard prestataire = zéro effet visible sur le site.

Pivot validé par l'utilisateur (2026-04-15 19:15) :
> "On doit créer un admin où on pourra implémenter toutes ces informations
> et qu'elles devront être affichées sur l'app/site directement après,
> donc tu peux aller dans ce sens avant d'avancer dans le dashboard prestataire."

---

## Ordre d'exécution strict

### 🔧 Pré-requis (bloque tout le reste)

- [x] T0 — Link dev user → Vendor "prestige-photo" (commit a3c6198)
- [x] T1 — Schéma Prisma : VendorEvent + VendorTemplate (commit a3c6198)
- [x] T2 — Route `/api/track` (commit b9976f0)
- [x] T3 — Hook `useTrack` + instrumentation VendorProfileClient (commit a6c52ce)

### 🔁 Migration DB (CURRENT)

- [ ] **M1** — Backfill DB depuis fichiers statiques
  - Script `scripts/backfill-vendors-from-static.ts`
  - Upsert 828 vendors + VendorProfile depuis VENDOR_BASIC + VENDOR_DETAILS
  - Idempotent, rejouable
  - Valider : `prisma.vendor.count() >= 828`

- [x] **M2** — Refactor `/vendor/[slug]/page.tsx` → DB (commit e02d6c8)
- [x] **M3** — Supprimer fichiers statiques (commit e02d6c8)
- [x] **M4** — Route admin `/admin/vendors` (commit 5b4b264)
- [x] **M5** — Promotion admin (commit 5b4b264) — moumene486@gmail.com = admin ✅

### 📊 Dashboard prestataire (APRÈS MIGRATION)

- [ ] T4 — API `/api/vendor/stats` (KPIs 30j, delta, sparkline, funnel, donut)
- [ ] T5 — API `/api/vendor/completion` (score + checklist)
- [ ] T6 — API `/api/vendor/packages` CRUD
- [ ] T7 — API `/api/vendor/templates` CRUD
- [ ] T8 — API `/api/vendor/requests/[id]` status transition
- [ ] T9 — Layout dashboard + VendorSidebar
- [ ] T10 — Home dashboard (KPIStrip + Sparkline + Funnel + Donut + ScoreCard + Preview)
- [ ] T11 — Inbox page + InboxTable + ReplyWithTemplate modal
- [ ] T12 — Packages page + PackageEditor
- [ ] T13 — Templates page + TemplateManager
- [ ] T14 — Profil page (édition live) — lit/écrit la DB (cohérent avec M2)
- [ ] T15 — Polish + build + commits finaux

### 🧹 Dette restante à commit avant M1

- [ ] `src/lib/rateLimiter.ts` — fallback "dev-local" en NODE_ENV!=="production"
- [ ] `scripts/check-vendor-events.ts` — outil diag
- [ ] `scripts/check-vendor-contact.ts` — outil diag
- [ ] `scripts/enrich-dev-vendor.ts` — enrichit prestige-photo en DB
- [ ] `src/lib/vendorDetails.ts` — phone/facebook/website ajoutés à prestige-photo (temporaire, sera supprimé en M3)
- [ ] `.claude/RULES/fix-everything-as-you-go.md` — règle "corriger tout au fur et à mesure"
- [ ] `.claude/CLAUDE.md` — ajout lecture RULES

---

## Règles actives (rappel)

### `.claude/RULES/fix-everything-as-you-go.md`
- Tout problème détecté en chemin = corrigé immédiatement
- Correction étendue à TOUS les cas similaires, pas juste l'instance
- Pas de "plus tard", pas de "hors-scope" si c'est sur le chemin
- Pas demander l'autorisation pour fixer un bug évident

### Checklist avant chaque tâche
1. Lire `.claude/RULES/*.md`
2. Lire `.planning/phases/01-vendor-dashboard/ROADMAP.md` (ce fichier)
3. Vérifier l'ordre : pré-requis → migration → dashboard

---

## Post /compact — relecture obligatoire

Après tout compact, relire :
1. Ce fichier (`ROADMAP.md`)
2. `.planning/phases/01-vendor-dashboard/PLAN.md` (détail tâches)
3. `.claude/RULES/*.md`
