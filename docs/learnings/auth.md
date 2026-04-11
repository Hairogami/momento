# Auth Patterns — Momento
~400 tokens

## Stack auth
- **JWT custom** via `jose` (PAS NextAuth / next-auth)
- Token stocké en cookie HTTP-only `session`
- Fichier principal : `src/lib/auth.ts`

## Vérifier une session côté serveur
```typescript
import { verifyToken } from '@/lib/auth'

// Dans un Route Handler ou Server Component
const user = await verifyToken(request) // ou verifyToken(cookies())
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
```

## Protection des routes (proxy.ts)
Le fichier `proxy.ts` (PAS middleware.ts) à la racine protège les routes :
```typescript
// proxy.ts — matcher pour routes protégées
export const config = {
  matcher: ['/(dashboard)/:path*', '/profile', '/settings', '/planner/:path*']
}
```

## Google OAuth (manuel, sans NextAuth)
- Route redirect : `GET /api/auth/google`
- Route callback : `GET /api/auth/google/callback`
- Colonne `googleId` dans la table `User` en DB
- Pas de dépendance next-auth — compatible avec le JWT custom

## Routes auth API
```
POST /api/auth/login              # Email + password
POST /api/auth/register           # Inscription
POST /api/auth/logout             # Clear cookie session
GET  /api/auth/me                 # User courant
GET  /api/auth/google             # Initier OAuth Google
GET  /api/auth/google/callback    # Callback OAuth Google
POST /api/auth/forgot-password    # Envoyer email reset
POST /api/auth/reset-password     # Appliquer nouveau MDP
POST /api/auth/verify-email       # Vérification email
POST /api/auth/resend-verification
PUT  /api/auth/update-profile     # Modifier profil
PUT  /api/auth/change-password    # Changer MDP
GET/DELETE /api/auth/account      # Infos / suppression compte
```

## Pattern route protégée
```typescript
export async function GET(request: Request) {
  const user = await verifyToken(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Toujours vérifier l'ownership
  const resource = await prisma.planner.findFirst({
    where: { id: params.id, userId: user.id }
  })
  if (!resource) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  // ...
}
```
