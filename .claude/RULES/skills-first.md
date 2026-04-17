# Règle — Skills first avant toute tâche non-triviale

**Règle absolue imposée par l'utilisateur :**
> Avant toute tâche non-triviale, identifier explicitement le skill à utiliser
> avant d'agir. Pas de skill-hop, pas de code à la main quand un skill existe.

## Déclencheurs (tâche non-triviale)

Je dois faire le check skill AVANT d'agir dès que la tâche tombe dans une de
ces catégories :

- **Nouvelle feature** (backend, UI, ou full-stack) → `megaplan` ou `gsd-plan-phase`
- **Refactor multi-fichiers** (3+ fichiers touchés) → `gsd-plan-phase` ou `write-plan`
- **Bug complexe** (pas un fix évident en 1 ligne) → `gsd-debug` ou `debug-mode`
- **Review de code** (diff > 50 lignes) → `gsd-code-review`
- **Deploy / ship** → `vercel:deploy` · `pre-deploy` · `gsd-secure-phase`
- **Migration DB / schema change** → `gsd-plan-phase` (avec contrainte DIRECT_URL)
- **UI / design majeur** (nouvelle page, refonte composant) → `gsd-ui-phase` · `ui-ux-pro-max`
- **Audit / sécurité** → `gsd-scan` · `gsd-secure-phase` · `gsd-forensics`
- **Exploration codebase** (plus de 3 fichiers à lire) → `gsd-explore` · `gsd-map-codebase`
- **SEO / marketing / copy** → `claude-seo-*` · `marketing-*`

## Ce que je dois faire

Avant la première action exécutante (Edit/Write/Bash non-lecture) :

1. **Annoncer le skill choisi** en une ligne :
   > "Skill : `gsd-plan-phase` — parce que c'est une feature multi-fichiers."
2. **Si aucun skill ne matche** — le dire explicitement :
   > "Aucun skill dédié, je code à la main parce que X."
3. **Ne jamais sauter l'étape** — même si la tâche paraît simple au premier coup d'œil.

## Tâches triviales (exemptes)

Pas besoin de check skill pour :
- Lecture simple d'un fichier
- Question "c'est quoi X ?" / explication
- Fix typo / renommage variable
- Changement CSS mineur (1 propriété)
- Ajout d'un log / commentaire

## Anti-patterns à bannir

- ❌ Partir direct dans Edit/Write quand un skill de planification existe
- ❌ Coder un plan à la main alors que `megaplan` ou `gsd-plan-phase` existe
- ❌ Débugger à tâtons sans spawner `gsd-debug` sur un vrai bug complexe
- ❌ Déployer sans `gsd-secure-phase` / `pre-deploy` pour check final
- ❌ Annoncer un skill et ne pas l'utiliser (placebo)

## Coût de ne pas respecter

- Plan incomplet → bug en prod → rollback coûteux
- Refactor partiel → dette technique → ralentissement futur
- Deploy sans check → incident → perte de confiance prestataires
- Duplication de travail déjà capturé dans un skill éprouvé

## Pourquoi cette règle existe

Les skills encodent des workflows testés. Les zapper = réinventer à chaque
fois + oublier des étapes (tests, sécurité, vérif E2E). Le coût d'annoncer
le skill = 1 ligne de texte. Le coût de le zapper = des heures de rework.
