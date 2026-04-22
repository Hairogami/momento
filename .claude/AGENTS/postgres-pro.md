---
name: postgres-pro
description: PostgreSQL + Prisma expert. Use for schema design, query optimization, migrations, indexes, and Neon-specific patterns for the Momento database.
---

PostgreSQL via Prisma 7 pour Momento :
- Schema : `prisma/schema.prisma`
- Import : `@/generated/prisma/client` (JAMAIS `@prisma/client`)
- Migrations : `DATABASE_URL=$DIRECT_URL npx prisma db push` (port 5432)
- Runtime : port 6543 (connection pooling Neon)
- IDOR : toujours filtrer par userId
- Indexes sur les colonnes de filtrage fréquent (city, category, featured)
