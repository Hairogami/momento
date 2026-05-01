# Règle — Security by Design

## ⚡ TRIGGER PERMANENT — Avant CHAQUE feature, route API, formulaire ou modif data

Avant d'écrire ou de valider du code qui touche : auth, données utilisateur, route API, input formulaire, upload, paiement, messagerie, admin.

Scanner mentalement les **8 principes**. Si UN principe n'est pas respecté → STOP, corriger, puis continuer.

---

## Les 8 principes (OWASP + NIST + ANSSI condensés)

### 1. Least Privilege (moindre privilège)
- Chaque route API filtre par `userId` (ou `vendorId`) issu de la session, **jamais** d'un param/body.
- Champs admin (`isVerified`, `role`, `priority`) → jamais éditables par le client final.
- Prisma : utiliser `select` explicite, pas `include` global qui leak des champs.

### 2. Defense in Depth (défense en profondeur)
- Auth check côté **proxy.ts** + **route handler** + **DB query** (3 couches).
- Pas de "le frontend filtre déjà" — le serveur ne fait jamais confiance au client.
- Rate-limit Upstash sur toute route mutative (POST/PATCH/DELETE).

### 3. Input Validation aux frontières
- Tout `request.json()` → validé via **Zod schema** (`safeParse`), pas `parse` direct.
- Sanitization HTML côté serveur si rendu dans un message/profil (DOMPurify ou strip).
- Pas de string SQL/Prisma raw sans `Prisma.sql` paramétré.

### 4. IDOR-by-default (Insecure Direct Object Reference)
- **TOUTE** lecture/écriture d'une ressource utilisateur → `where: { id, userId: session.user.id }`.
- Lister les routes API à risque : `/api/messages/[id]`, `/api/events/[id]`, `/api/vendors/[id]/*`, `/api/notes/[id]`, `/api/budget/*`, `/api/tasks/*`, `/api/contacts/*`, `/api/contracts/*`.
- Test mental : "si je passe l'ID d'un autre user, ça renvoie 200 ou 403/404 ?"

### 5. Secrets & PII (Personally Identifiable Information)
- Aucune clé/secret en clair dans le code, les commits, ni les logs serveur.
- `.env.local` jamais commité — vérifier `.gitignore`.
- Pas de `console.log(user)` ou `console.log(payload)` en prod (leak email/phone/password hash).
- Mots de passe : bcrypt cost ≥ 10. Tokens session : NextAuth JWT (déjà OK).

### 6. CSRF / SameSite / Headers
- Toute mutation (POST/PATCH/DELETE) → check session NextAuth (qui implémente CSRF via SameSite cookies).
- Headers sécurité dans `proxy.ts` : `Content-Security-Policy`, `X-Frame-Options: DENY`, `Strict-Transport-Security`.
- Pas de redirect open : valider que `redirectTo` est interne (`startsWith('/')` + pas de `//`).

### 7. Audit & Logs sur actions sensibles
- Toute action sensible (changement password, contact presta, paiement, suppression compte, action admin) → log structuré (Sentry breadcrumb ou table `AuditLog`).
- Erreurs auth/autorisation → log côté serveur, **réponse générique** côté client (pas de "user not found" qui leak existence email).

### 8. Fail Secure
- Erreur DB / 500 → **deny par défaut**, jamais "on continue sans le check".
- `try/catch` autour des permissions → si throw, retourner 403, pas 500 silent.
- Pas de fallback admin → user (ex : `if (!isAdmin) treat as user`) — c'est l'inverse : `if (!isAdmin) return 403`.

---

## Comportement attendu

1. **Pendant l'écriture d'une feature** : appliquer les 8 principes au fur et à mesure, pas en post-review.
2. **Pendant une review** : si je vois une violation, la corriger MAINTENANT (cf. `fix-everything-as-you-go.md`).
3. **Avant un commit feature** : annoncer en 1 ligne quels principes ont été respectés.
4. **Sur demande utilisateur** : déclencher SAST (analyse statique) ou DAST (analyse dynamique runtime) via l'agent `momento-secscan` (cf. `.claude/agents/momento-secscan.md`).

## Anti-patterns à bannir

- ❌ `where: { id }` sans `userId` — IDOR garantie
- ❌ `request.json()` puis utiliser direct sans Zod — injection garantie
- ❌ "Le frontend bloque déjà ce champ" — non, le serveur valide TOUT
- ❌ Logger `user.email` ou `body` complet en prod — fuite PII
- ❌ Renvoyer 500 avec stack trace en prod — leak architecture
- ❌ Différencier message "email inconnu" vs "mot de passe faux" sur login — leak existence

## Coût de ne pas respecter

- IDOR sur messagerie → un client lit les conversations d'un autre → fin de la confiance prestataires au lancement
- Leak email scraping → spam massif → perte d'inscriptions
- Faille XSS dans profil presta → vol session admin → bascule totale du contrôle
- Stripe webhook non signé → faux paiements → revenus frauduleux

## Référence agent

- **SAST** (analyse statique du code) : `momento-secscan --mode sast`
- **DAST** (analyse dynamique runtime, requêtes contre `localhost:3001`) : `momento-secscan --mode dast`
- **Audit complet** : `momento-secscan --mode full`

L'agent applique les 8 principes ci-dessus comme grille d'évaluation et produit un rapport `SECURITY-AUDIT.md` avec sévérité (CRITICAL / HIGH / MEDIUM / LOW) et fix proposé pour chaque finding.
