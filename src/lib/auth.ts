import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Facebook from "next-auth/providers/facebook";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const REMEMBER_ME_MAX_AGE = 30 * 24 * 60 * 60; // 30 jours
const SESSION_MAX_AGE     = 24 * 60 * 60;       // 1 jour (sans remember me)

const IS_DEV = process.env.NODE_ENV === "development";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  debug: false,
  secret: process.env.AUTH_SECRET,
  // DEV: no DB adapter → pure JWT, no Prisma connection needed locally
  ...(IS_DEV ? {} : { adapter: PrismaAdapter(prisma) }),
  session: {
    strategy: "jwt",
    maxAge: REMEMBER_ME_MAX_AGE, // max possible — le JWT peut expirer plus tôt
    updateAge: 60 * 60,           // renouvelle le token toutes les heures
  },
  // Forcer le cookie à persister 30j (sinon NextAuth v5 peut créer un session cookie)
  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: REMEMBER_ME_MAX_AGE,
      },
    },
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID ? [
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        allowDangerousEmailAccountLinking: true,
        authorization: {
          params: {
            // Scopes non-sensitives uniquement — pas de warning "app non vérifiée".
            // calendar.readonly est un scope restricted qui nécessite la vérification
            // Google officielle (process 2-6 semaines). Aucune feature Momento ne l'utilise.
            scope: "openid email profile",
          },
        },
      }),
    ] : []),
    ...(process.env.FACEBOOK_CLIENT_ID ? [
      Facebook({
        clientId: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      }),
    ] : []),
    // Resend is an "email" provider — requires an adapter (PrismaAdapter).
    // In dev mode, IS_DEV disables the adapter, so Resend would cause a
    // MissingAdapter error on every /api/auth/session call (500 on all pages).
    ...(IS_DEV ? [] : [Resend({
      apiKey: process.env.RESEND_API_KEY!,
      from: process.env.RESEND_FROM_EMAIL ?? "noreply@momentoevents.app",
    })]),
    Credentials({
      credentials: {
        email:      { label: "Email",          type: "email"    },
        password:   { label: "Mot de passe",   type: "password" },
        rememberMe: { label: "Se souvenir",    type: "text"     },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        // C-N02: cap password length before bcrypt.compare to prevent DoS via oversized input
        if ((credentials.password as string).length > 128) return null;
        const user = await prisma.user.findUnique({
          where: { email: (credentials.email as string).toLowerCase().trim() },
          select: { id: true, name: true, email: true, image: true, passwordHash: true, emailVerified: true },
        });
        if (!user?.passwordHash) return null;
        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash,
        );
        if (!valid) return null;
        // W13: Enforce email verification before allowing login
        if (!user.emailVerified) return null;
        // On passe rememberMe à travers le user pour le JWT callback
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          rememberMe: credentials.rememberMe === "true",
        } as any;
      },
    }),
  ],
  pages: { signIn: "/login" },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Relative URL → prefix with baseUrl
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Same origin → allow
      if (url.startsWith(baseUrl)) return url
      // External or unknown → fallback to /accueil
      return `${baseUrl}/accueil`
    },
    async jwt({ token, user, account, trigger, session: sessionUpdate }) {
      // Sync JWT after profile update (useSession().update())
      if (trigger === "update" && sessionUpdate) {
        if (sessionUpdate.name)    token.name    = sessionUpdate.name
        if (sessionUpdate.picture) token.picture = sessionUpdate.picture
        if (sessionUpdate.role)    token.role    = sessionUpdate.role
      }
      if (account) {
        token.provider = account.provider
        // C01: access_token/refresh_token are stored in the DB via PrismaAdapter (Account table).
        // They are intentionally NOT stored in the JWT to avoid exposure if AUTH_SECRET leaks.
        // The calendar route reads them directly via prisma.account.findFirst().
      }
      if (user) {
        token.id = user.id;
        // OAuth → toujours 30 jours
        // Credentials → dépend de rememberMe
        const isCredentials = !account || account.type === "credentials";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rememberMe = (user as any).rememberMe;
        if (isCredentials && rememberMe === false) {
          token.exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
        } else {
          token.exp = Math.floor(Date.now() / 1000) + REMEMBER_ME_MAX_AGE;
        }

        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id! },
            select: { role: true, image: true },
          });
          if (dbUser) {
            token.role = dbUser.role;
            if (!token.picture) token.picture = dbUser.image;
          }
        } catch {
          // DB lookup failed — non-blocking, sign-in proceeds anyway
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as { id: string; role?: string; provider?: string }).role = token.role as string | undefined;
        (session.user as { id: string; role?: string; provider?: string }).provider = token.provider as string | undefined;
        // accessToken intentionally NOT exposed to client (security)
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      if (!user?.id || account?.type !== "oauth") return;
      try {
        const updates: { name?: string; image?: string } = {};
        // W-N06: cap lengths to prevent oversized OAuth profile data being written to DB
        if (profile?.name && profile.name !== user.name) updates.name = (profile.name as string).slice(0, 200);
        const providerImage =
          (profile?.picture as string | undefined) ||
          (profile?.avatar_url as string | undefined) ||
          (profile?.image_url as string | undefined);
        // W05: validate OAuth image URL against the same allowlist as update-profile
        if (providerImage && providerImage !== user.image) {
          try {
            const parsed = new URL(providerImage)
            const ALLOWED_IMAGE_HOSTS = [
              /^.*\.googleusercontent\.com$/,
              /^.*\.fbcdn\.net$/,
              /^.*\.facebook\.com$/,
              /^.*\.cloudinary\.com$/,
              /^.*\.githubusercontent\.com$/,
              /^.*\.vercel-storage\.com$/,
              /^momentoevents\.app$/,
              /^.*\.momentoevents\.app$/,
            ]
            if (["http:", "https:"].includes(parsed.protocol) && ALLOWED_IMAGE_HOSTS.some(r => r.test(parsed.hostname))) {
              updates.image = providerImage.slice(0, 2000)
            }
          } catch {
            // invalid URL — skip image update
          }
        }
        if (Object.keys(updates).length > 0) {
          await prisma.user.update({ where: { id: user.id }, data: updates });
        }
      } catch (err) {
        console.error("[auth] signIn event error:", err);
      }
    },
  },
});
