import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GitHub from "next-auth/providers/github";
import Facebook from "next-auth/providers/facebook";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const REMEMBER_ME_MAX_AGE = 30 * 24 * 60 * 60; // 30 jours
const SESSION_MAX_AGE     = 24 * 60 * 60;       // 1 jour (sans remember me)

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  debug: false,
  secret: process.env.AUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: REMEMBER_ME_MAX_AGE, // max possible — le JWT peut expirer plus tôt
    updateAge: 60 * 60,           // renouvelle le token toutes les heures
  },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      checks: ["state"],
    }),
    ...(process.env.GOOGLE_CLIENT_ID ? [
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        allowDangerousEmailAccountLinking: true,
        authorization: {
          params: {
            scope: "openid email profile https://www.googleapis.com/auth/calendar.readonly",
            access_type: "offline",
            prompt: "consent",
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
    Resend({
      apiKey: process.env.RESEND_API_KEY!,
      from: process.env.RESEND_FROM_EMAIL ?? "noreply@momentoevents.app",
    }),
    Credentials({
      credentials: {
        email:      { label: "Email",          type: "email"    },
        password:   { label: "Mot de passe",   type: "password" },
        rememberMe: { label: "Se souvenir",    type: "text"     },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          select: { id: true, name: true, email: true, image: true, passwordHash: true },
        });
        if (!user?.passwordHash) return null;
        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash,
        );
        if (!valid) return null;
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
    async jwt({ token, user, account }) {
      if (account) {
        token.provider = account.provider
        if (account.access_token) token.accessToken = account.access_token
        if (account.refresh_token) token.refreshToken = account.refresh_token
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

        const dbUser = await prisma.user.findUnique({
          where: { id: user.id! },
          select: { role: true, image: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          if (!token.picture) token.picture = dbUser.image;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as { id: string; role?: string; provider?: string }).role = token.role as string | undefined;
        (session.user as { id: string; role?: string; provider?: string; accessToken?: string }).provider = token.provider as string | undefined;
        (session.user as { id: string; role?: string; provider?: string; accessToken?: string }).accessToken = token.accessToken as string | undefined;
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      if (!user?.id || account?.type !== "oauth") return;
      try {
        const updates: { name?: string; image?: string } = {};
        if (profile?.name && profile.name !== user.name) updates.name = profile.name as string;
        const providerImage =
          (profile?.picture as string | undefined) ||
          (profile?.avatar_url as string | undefined) ||
          (profile?.image_url as string | undefined);
        if (providerImage && providerImage !== user.image) updates.image = providerImage;
        if (Object.keys(updates).length > 0) {
          await prisma.user.update({ where: { id: user.id }, data: updates });
        }
      } catch (err) {
        console.error("[auth] signIn event error:", err);
      }
    },
  },
});
