# UI Patterns — Momento
~350 tokens

## Stack UI
- **Tailwind CSS v4** (postcss config, pas tailwind.config.js)
- **shadcn/ui v4** via `shadcn` package (composants dans `src/components/ui/`)
- **lucide-react** pour les icônes
- **next-themes** pour le thème clair/sombre
- **sonner** pour les toasts/notifications

## Palette Momento
Définie dans `src/app/globals.css` via CSS variables :
```css
--background: oklch(...)
--foreground: oklch(...)
--primary: oklch(...)    /* Couleur principale Momento */
--muted: oklch(...)
--border: oklch(...)
```
Consulter `globals.css` pour les valeurs exactes.

## Composants shadcn utilisés
```
Button, Card, Input, Label, Dialog, Sheet, Tabs, 
Badge, Avatar, Separator, Skeleton, Select,
DropdownMenu, Popover, Calendar, Form
```

## Patterns Tailwind récurrents
```tsx
// Container responsive
<div className="container mx-auto px-4 max-w-7xl">

// Card standard
<div className="rounded-lg border bg-card p-6 shadow-sm">

// Flex center
<div className="flex items-center justify-between gap-4">

// Loading skeleton
<div className="animate-pulse rounded-md bg-muted h-4 w-full">

// Responsive grid prestataires
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
```

## Règle overflow homepage
```css
/* UTILISER clip, PAS hidden — preserve les dropdowns absolus */
overflow-x: clip;  /* Bon */
overflow-x: hidden; /* PROBLÈME : cache les menus déroulants */
```

## Ajouter un composant shadcn
```bash
npx shadcn@latest add <component-name>
# ou via le package shadcn
```

## Patterns Client vs Server
```tsx
// Server Component (défaut) — pas de 'use client'
export default async function Page() {
  const data = await fetchData() // fetch direct côté serveur
  return <Component data={data} />
}

// Client Component — seulement si hooks React nécessaires
'use client'
export function InteractiveButton() {
  const [state, setState] = useState(...)
}
```

## Toast / notifications
```typescript
import { toast } from 'sonner'
toast.success('Action réussie')
toast.error('Une erreur est survenue')
```
