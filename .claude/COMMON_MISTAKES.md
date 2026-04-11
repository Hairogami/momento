# Common Mistakes — Momento
~300 tokens | LIRE EN PRIORITÉ à chaque session

## 1. DIRECT_URL vs DATABASE_URL pour les migrations
**ERREUR** : `npx prisma db push` avec DATABASE_URL (port 6543 Transaction Pooler)
**CORRECT** : Toujours utiliser DIRECT_URL (port 5432) pour DDL
```bash
# Bon (déjà dans package.json build script)
DATABASE_URL=$DIRECT_URL npx prisma db push --accept-data-loss
```

## 2. middleware.ts → proxy.ts (Next.js 16)
**ERREUR** : Créer/éditer `middleware.ts` — fichier ignoré en Next.js 16
**CORRECT** : Le fichier s'appelle `proxy.ts` à la racine du projet

## 3. NextAuth interdit
**ERREUR** : Importer `next-auth` ou utiliser `getServerSession`
**CORRECT** : Auth JWT custom via `jose` dans `src/lib/auth.ts`
```typescript
// Bon
import { verifyToken } from '@/lib/auth'
const user = await verifyToken(request)
```

## 4. Logique métier dans les Client Components
**ERREUR** : Fetch/logique dans composants `'use client'`
**CORRECT** : Server Components + Server Actions pour la logique

## 5. N+1 Prisma avec includes imbriqués
**ERREUR** :
```typescript
const planners = await prisma.planner.findMany()
// puis pour chaque planner : prisma.step.findMany({ where: { plannerId: p.id }})
```
**CORRECT** :
```typescript
const planners = await prisma.planner.findMany({ include: { steps: true }})
```

## 6. IDOR — Ownership non vérifié
**ERREUR** : Route API qui modifie une ressource sans vérifier que l'utilisateur est propriétaire
**CORRECT** :
```typescript
const resource = await prisma.planner.findFirst({
  where: { id, userId: user.id }  // toujours filtrer par userId
})
if (!resource) return NextResponse.json({ error: 'Not found' }, { status: 404 })
```

## 7. Zod absent sur les routes API publiques
**ERREUR** : Faire confiance directement à `req.json()` sans validation
**CORRECT** :
```typescript
const body = await req.json()
const parsed = MySchema.safeParse(body)
if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })
```

## 8. Git push / deploy sans confirmation
**RÈGLE ABSOLUE** : Ne JAMAIS exécuter `git push` ou `vercel deploy` sans confirmation explicite du maître
