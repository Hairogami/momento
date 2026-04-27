# Fix P3 — Legal Blockers (TODO_DECISION visibility)

**Date** : 27 avril 2026
**Goal** : Convertir tous les `{/* TODO_DECISION: ... */}` JSX cachés des pages légales en blocs d'avertissement visibles, afin que l'équipe ne puisse PAS publier les pages légales avec des placeholders silencieux.

---

## Files modifiés

| Fichier | TODOs JSX → blocs visibles | TODOs JS conservés (file-head) |
|---------|---------------------------|--------------------------------|
| `src/app/(legal)/cgu/page.tsx` | 2 | 1 (lignes 8-10, dev-only) |
| `src/app/(legal)/confidentialite/page.tsx` | 4 | 2 (lignes 8-9, dev-only) |
| `src/app/(legal)/mentions-legales/page.tsx` | 0 | 1 (lignes 8-13, dev-only) |

**Total** : 6 commentaires JSX cachés convertis en blocs `<div role="alert">` visibles.

---

## Détail des conversions JSX

### `cgu/page.tsx`

| Section | Sujet | Prose insérée |
|---------|-------|---------------|
| 16 — Responsabilité | Plafond contractuel | « Insérer le plafond contractuel de responsabilité (décision business à valider par l'avocat — ex. limitée à 12 mois d'abonnement effectivement versés). » |
| 20 — Droit applicable et litiges | Ville de juridiction | « Préciser la ville des tribunaux compétents (Casablanca par défaut, à confirmer selon le siège social effectif de la société). » |

### `confidentialite/page.tsx`

| Section | Sujet | Prose insérée |
|---------|-------|---------------|
| 1 — Responsable du traitement | Raison sociale + RC + ICE + adresse | « Compléter la raison sociale, le numéro RC, l'ICE et l'adresse du siège social après création de la société. » |
| 2 — Coordonnées et contact | DPO | « Trancher la désignation d'un DPO (recommandé par la CNDP campagne 2025, non obligatoire par la loi 09-08) — choisir entre Yazid Moumène ou un correspondant externe, puis publier ses coordonnées ici. » |
| 11 — Cookies et traceurs | Analytics tiers futurs | « Si des outils analytics ou de monitoring tiers sont ajoutés à l'avenir (Google Analytics, Plausible, Sentry, etc.), prévoir un bandeau cookies avec opt-out conforme aux pratiques CNDP avant déploiement. » |
| 13 — Déclaration CNDP | N° récépissé | « Insérer le numéro de récépissé CNDP et la date de délivrance après dépôt de la déclaration auprès de la Commission. » |

### `mentions-legales/page.tsx`

Aucun TODO_DECISION JSX caché — la page utilise déjà des `<Field label="…">À compléter…</Field>` qui rendent visiblement les placeholders. Seul le bloc JS file-head (lignes 8-13) reste, conservé volontairement.

---

## Composant utilisé (pattern uniforme)

```tsx
<div role="alert" style={{
  margin: "var(--space-md, 16px) 0",
  padding: "var(--space-md, 16px)",
  border: "2px dashed #f59e0b",
  borderRadius: 12,
  background: "rgba(245, 158, 11, 0.08)",
  color: "var(--dash-text, #121317)",
  fontSize: "var(--text-sm, 14px)",
  display: "flex",
  flexDirection: "column",
  gap: 6,
}}>
  <strong style={{ color: "#f59e0b", fontSize: "var(--text-sm, 14px)" }}>
    ⚠️ À compléter avant lancement
  </strong>
  <span>{prose explicative}</span>
</div>
```

- Couleur amber `#f59e0b` = warning status (autorisé par `brand-consistency.md` section 1).
- Tokens `--dash-text`, `--space-md`, `--text-sm` utilisés (avec fallback hex pour éviter blanc en cas de styles non chargés).
- Border 2px dashed = visuellement impossible à manquer pour relecteur ou QA.
- `role="alert"` = accessible aux screen readers.
- Bloc placé HORS du `<p>` parent (sinon HTML invalide : `<div>` dans `<p>`).

---

## Build status

- `npx tsc --noEmit` : **clean** (zéro erreur).
- `npx next build` : **pass**, zéro warning, zéro erreur.
- Pages légales toutes générées en statique (`○ /cgu`, `○ /confidentialite`, `○ /mentions-legales`).

---

## Checklist business — décisions encore à prendre avant lancement public

L'équipe doit fournir les informations suivantes (chaque bloc visible disparaîtra à mesure que les décisions sont prises) :

- [ ] **Raison sociale + forme juridique** (SARL Momento ?) — bloque cgu/confidentialite/mentions-legales
- [ ] **Capital social** — mentions-legales
- [ ] **Adresse du siège social** — mentions-legales / confidentialite / + détermine la ville des tribunaux compétents (CGU section 20)
- [ ] **Numéro RC, ICE, IF, TVA** — mentions-legales
- [ ] **Plafond contractuel de responsabilité** (CGU section 16) — décision business + validation avocat
- [ ] **Ville des tribunaux compétents** (CGU section 20) — par défaut Casablanca, à confirmer
- [ ] **Désignation d'un DPO** (Yazid Moumène ou externe ?) — confidentialite section 2
- [ ] **Numéro de récépissé CNDP** + date de délivrance — confidentialite section 13 + mentions-legales
- [ ] **Décision analytics/cookies** (si Google Analytics, Plausible ou Sentry sont ajoutés à l'avenir) — confidentialite section 11

Une fois ces 9 décisions prises et insérées, supprimer les blocs `<div role="alert">` correspondants.

---

## Pourquoi conserver les commentaires JS file-head

Les blocs `// TODO_DECISION: ...` en tête de fichier (avant le composant) restent en place car :
- Ils sont uniquement visibles par les développeurs lisant le code source.
- Ils servent d'index pour grep/recherche (`grep -r TODO_DECISION src/app/(legal)`).
- Ils ne peuvent PAS fuiter au public.
- Les blocs visibles ajoutés couvrent le risque de publication accidentelle (le seul risque réel).

---

## Garantie

Tant qu'un seul `<div role="alert">` est présent sur les pages `/cgu`, `/confidentialite` ou `/mentions-legales`, il est **impossible** de manquer le placeholder visuellement :
- Bordure orange 2px dashed
- Fond ambré
- Pictogramme ⚠️ + texte « À compléter avant lancement »

Aucune publication silencieuse possible.
