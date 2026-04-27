# P3 — Cleanup: dead dependencies

Date : 2026-04-27
Branche : `claude/unruffled-wright-6c6cea`

## Contexte

Audit `.planning/codebase/CONCERNS.md` (item #15-16) signalait deux dépendances
installées mais jamais utilisées dans `src/`, plus un champ Prisma orphelin :

- `@neondatabase/serverless` ^1.0.2
- `@prisma/adapter-neon` ^7.7.0
- `User.googleId` — non écrit par NextAuth (utilise table `Account` via PrismaAdapter)

Le driver actif est `@prisma/adapter-pg` (`PrismaPg`) dans `src/lib/prisma.ts`.

## Vérification d'usage (avant uninstall)

### `@neondatabase/serverless`
```
src/ → 0 imports
prisma/schema.prisma → 0 référence
src/lib/prisma.ts → 0 référence (utilise PrismaPg)
```
Seules occurrences : `package.json`, `package-lock.json`, fichiers de doc
(`.planning/`, `docs/learnings/database.md`, `.claude/Scale.md`).

### `@prisma/adapter-neon`
```
src/ → 0 imports
prisma/schema.prisma → 0 référence
src/lib/prisma.ts → 0 référence
```

### `googleId`
```
prisma/schema.prisma:19 → définition User.googleId String? @unique
scripts/delete-user.ts:64 → console.log de diagnostic (lecture)
src/ → 0 lecture / 0 écriture
docs/learnings/auth.md, database.md → mention documentaire
```

## Actions

### Dépendances : SUPPRIMÉES

```bash
npm uninstall @neondatabase/serverless @prisma/adapter-neon --ignore-scripts
```

`--ignore-scripts` requis suite à un échec du postinstall hook Prisma sur
Windows (ENOENT spawn cmd.exe). Le postinstall (`prisma generate`) n'est pas
nécessaire pour cette opération — la suppression de deps n'affecte pas le
client Prisma déjà généré.

### `googleId` : CONSERVÉ (avec raison)

Le champ est lu par `scripts/delete-user.ts:64` (utilitaire de purge admin) :
```ts
console.log(`  googleId     : ${user.googleId ?? "—"}`)
```
La règle utilisateur (« si seul le schéma a le champ, c'est safe à enlever »)
n'est PAS satisfaite — un script applicatif l'utilise. Le retirer casserait la
compilation TypeScript de `delete-user.ts`.

**Décision** : conservé tel quel. Si on veut vraiment le supprimer plus tard,
faire les 2 modifs en cohérence (schéma + script) dans une PR dédiée +
migration `ALTER TABLE "User" DROP COLUMN "googleId"`.

## Verification post-uninstall

| Check | Résultat |
|-------|----------|
| `package.json` ne référence plus les 2 deps | ✅ 0 occurrence |
| `package-lock.json` ne référence plus les 2 deps | ✅ 0 occurrence |
| `npx tsc --noEmit` | ✅ pass (aucune sortie) |
| `npx next build` | ✅ pass (toutes les routes compilées) |

## Migration DB nécessaire ?

**Non**. Aucune modification de `prisma/schema.prisma`. `googleId` reste en place
côté schéma ET côté DB.

## TODO futurs (hors scope ici)

- Si décision de supprimer `googleId` : PR séparée qui (1) retire `googleId`
  du schema, (2) retire la ligne `console.log` de `scripts/delete-user.ts`,
  (3) `DATABASE_URL=$DIRECT_URL npx prisma db push` pour exécuter la migration,
  (4) update `docs/learnings/auth.md` et `docs/learnings/database.md`.
- Update `.planning/codebase/STACK.md` lignes 61, 110 pour retirer mention
  des deps supprimées (deviennent fausses).
- Update `.planning/codebase/CONCERNS.md` items #15 et #46-49 (cocher fait).

## Statut commit

La suppression des deps a déjà été committée précédemment dans **`c8ffd33`** :

```
fix(security): migrate xlsx to exceljs (CVE GHSA-4r6h-8v6p-xvw6)
[...]
Also drops unused @neondatabase/serverless and @prisma/adapter-neon
from package.json (already not referenced anywhere in src/, npm pruned
them during the install/uninstall cycle).
```

À l'arrivée de cet agent, `HEAD:package.json` ne contenait déjà plus les deux
deps. Ce document de planification certifie la vérification post-suppression
(grep `src/` = 0, tsc pass, next build pass) et trace la décision sur `googleId`.

Pas de nouveau commit `chore(deps): ...` nécessaire — le scope demandé est
déjà inclus dans `c8ffd33`. Cet agent commit uniquement le présent rapport
de vérification.
