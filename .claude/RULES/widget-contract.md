# Règle — Contrat widget dashboard

## ⚡ TRIGGER PERMANENT — Avant de créer ou modifier un widget dashboard

Tout widget de `src/app/dashboard/DashboardClient.tsx` (ou affiché via `WidgetCard`) DOIT répondre aux 5 questions suivantes AVANT d'écrire le code. Si une réponse manque → STOP, on ne crée pas le widget.

## Les 5 questions obligatoires

### 1. Quelle data le widget consomme ?
- Liste les props avec types stricts (pas de `any`)
- Si data composée (objet imbriqué), définir le type côté front ET côté API
- Source de vérité : aligné sur le modèle Prisma (un widget Budget consomme un format dérivé de `BudgetItem`, pas une invention)

### 2. D'où vient cette data ?
Une seule réponse parmi :
- **DB** → via `/api/planners/[id]/dashboard-data` (route consolidée, 1 round trip pour tout le dashboard)
- **localStorage** → seulement pour préférences UI (notes locales, moodboard) — JAMAIS pour des données métier qui existent en DB
- **Computed** → dérivé d'une autre source déjà chargée (ex: `daysLeft` à partir de `event.date`)
- **Static** → constante (citation du jour, etc)

**Interdit** : déclarer `const guests: Guest[] = []` ou tout autre stub vide en attendant. Si la source n'est pas prête, le widget n'est pas prêt.

### 3. Quel empty state si data vide ?
Tout widget DOIT afficher un message clair quand `data.length === 0` ou équivalent. Format minimal :
```tsx
{items.length === 0 && (
  <p style={{ fontSize: "var(--text-xs)", color: "var(--dash-text-3)" }}>
    Aucun X enregistré
  </p>
)}
```
Suivi idéalement d'un CTA `Link` vers la page dédiée pour ajouter.

### 4. Loading state si data async ?
- Si la data vient d'un fetch et peut être `null` au mount → skeleton ou texte "Chargement…"
- Si la data vient d'un état déjà hydraté (depuis `dashboardData` qui inclut `null` initial) → l'empty state suffit, pas besoin de loader

### 5. Le widget peut-il écrire ? Si oui, où ?
Si le widget a un bouton "Ajouter" / "Modifier" / "Supprimer" :
- Action POST/PATCH/DELETE → endpoint API dédié (jamais juste localStorage si la data existe en DB)
- Optimistic update : mettre à jour `dashboardData` localement AVANT la réponse API
- Rollback en cas d'erreur réseau
- IDOR : la route API DOIT filtrer par `userId` (ou ownership planner)

## Anti-patterns à bannir

- ❌ `const data: T[] = []` comme placeholder permanent
- ❌ Consommer une data différente en lecture (DB) qu'en écriture (localStorage) → désync garantie après refresh
- ❌ Fetch direct depuis le widget : tous les fetches passent par le `useEffect` central de `DashboardClient` qui hydrate `dashboardData`
- ❌ Skipper l'empty state — un widget qui affiche `0 / 0` sans contexte donne une impression de bug
- ❌ Ajouter une data au widget sans étendre `/api/planners/[id]/dashboard-data` en cohérence

## Pattern recommandé

```tsx
// 1. Type côté front (aligné avec ce que dashboard-data renvoie)
type FooItem = { id: string; label: string; ... }

// 2. Widget reçoit les données en props (pas de fetch interne)
function FooWidget({ items }: { items: FooItem[] }) {
  if (items.length === 0) {
    return <EmptyState text="Aucun foo" cta="/foo" />
  }
  return <ul>...</ul>
}

// 3. DashboardClient passe les données via dashboardData
case "foo": return <FooWidget items={dashboardData?.foos ?? []} />
```

## Référence

- Bug pré-existant qui a motivé cette règle : commit `853ec54` (les widgets RSVP/Budget/Messages/Bookings recevaient `[]` en dur — coquilles vides malgré données saisies en DB).
- Pattern dashboard-data : `src/app/api/planners/[id]/dashboard-data/route.ts`.
- Hydration côté front : `src/app/dashboard/DashboardClient.tsx` — useEffect qui charge planner+vendors+dashboard-data en 1 round trip.
