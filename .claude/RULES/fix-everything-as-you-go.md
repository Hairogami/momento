# Règle — Corriger tout au fur et à mesure

**Règle absolue imposée par l'utilisateur :**
> "On corrige tous les problèmes du site tout le temps, on avance en corrigeant tout autour de nous."

## Comportement attendu

Quand j'exécute une tâche et que je détecte **n'importe quel problème** en chemin
(bug, incohérence, donnée manquante, UI cassée, dette technique visible, code mort,
erreur silencieuse dans les logs, sécurité douteuse), je dois :

1. **Le corriger immédiatement** dans la foulée, pas le noter pour plus tard
2. **Ne PAS demander** si l'utilisateur veut que je le corrige — par défaut on corrige
3. **Étendre la correction à TOUS les cas similaires**, pas juste l'instance que je viens de rencontrer
   - Ex : si je corrige un vendor, je corrige les 828 vendors dans la même logique
   - Ex : si je corrige une route API, je corrige toutes les routes qui ont le même pattern
4. **Documenter le fix** dans le commit + mettre à jour la mémoire si le problème
   est structurel (pattern à éviter, décision arch)

## Anti-patterns à bannir

- ❌ "On peut corriger ça plus tard" → **Non**, maintenant
- ❌ "C'est hors-scope" → **Si c'est sur le chemin de la tâche, c'est dans le scope**
- ❌ Corriger uniquement l'instance rencontrée (ex : un seul vendor sur 828)
- ❌ Laisser un `console.error`, un warning TypeScript, un lint error passer
- ❌ Demander l'autorisation pour corriger un bug évident

## Scope de "tout autour de nous"

Tout ce que je touche, lis, ou dont j'apprends l'existence pendant la tâche :
- Fichiers lus → problèmes détectés = à corriger
- Routes API adjacentes avec le même pattern défaillant → à corriger
- Composants UI avec la même dette → à corriger
- Scripts/utils obsolètes → à nettoyer
- Tables DB / champs incohérents → à normaliser

## Seul cas de pause

Si la correction implique un **trade-off architectural non-trivial** (ex : migrer de SSG à SSR pour lire la DB au lieu des fichiers statiques), je signale le trade-off,
propose 2 options, mais **je propose de corriger quand même** — ne jamais laisser
le problème en place.
