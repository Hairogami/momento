# Database Patterns — Momento
~400 tokens

## Stack DB
- **Prisma 7** avec adapter Neon (`@prisma/adapter-neon`)
- **Neon PostgreSQL** en production
- Schema : `prisma/schema.prisma`

## Connexion — règle critique
```
DATABASE_URL  = port 6543 (Transaction Pooler) → runtime uniquement
DIRECT_URL    = port 5432 (Session Pooler)     → migrations/DDL uniquement
```

**Ne JAMAIS utiliser DATABASE_URL pour prisma db push/migrate** — ça bloque.

```bash
# Correct pour migrations
DATABASE_URL=$DIRECT_URL npx prisma db push --accept-data-loss
# (déjà intégré dans npm run build)
```

## Client Prisma singleton
```typescript
// src/lib/prisma.ts — utiliser ce client partout
import { prisma } from '@/lib/prisma'
```

## Modèles principaux (schéma résumé)
```
User          → id, email, password, googleId, role (USER/VENDOR/ADMIN)
Planner       → id, userId, title, eventDate, steps[]
Step          → id, plannerId, title, order, tasks[], budgetItems[]
Task          → id, stepId, title, completed
BudgetItem    → id, stepId, label, amount, paid
Guest         → id, userId, name, email, rsvp
Vendor        → id, slug, name, category, description, images[]
Conversation  → id, participants[], messages[]
Message       → id, conversationId, senderId, content
```

## Patterns de query efficaces

### Éviter N+1
```typescript
// BIEN : include en une requête
const planner = await prisma.planner.findFirst({
  where: { id, userId: user.id },
  include: { steps: { include: { tasks: true, budgetItems: true }}}
})
```

### Select ciblé (performance)
```typescript
// BIEN : sélectionner uniquement les champs nécessaires
const vendors = await prisma.vendor.findMany({
  select: { id: true, slug: true, name: true, category: true }
})
```

### Pagination
```typescript
const vendors = await prisma.vendor.findMany({
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: 'desc' }
})
```

## Commandes utiles
```bash
npx prisma studio          # GUI (localhost:5555)
npx prisma generate        # Regénérer client après modif schema
npx prisma db pull         # Sync schema depuis DB existante
npx prisma format          # Formater schema.prisma
```
