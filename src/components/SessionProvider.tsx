"use client";

import { SessionProvider as NextAuthProvider, useSession } from "next-auth/react";
import { createContext, useContext } from "react";
import ConsentApplier from "./ConsentApplier";
import EmailVerificationBanner from "./EmailVerificationBanner";

// Compatibility shim: exposes useSessionUser() used by Farah components
// Maps NextAuth session onto the shape Farah components expect

type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role?: string;
  provider?: string;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
} | null;

const SessionUserContext = createContext<SessionUser>(null);

function SessionUserBridge({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const user: SessionUser = session?.user
    ? {
        id: session.user.id as string,
        email: session.user.email ?? "",
        name: session.user.name,
        image: session.user.image,
        firstName: session.user.name?.split(" ")[0] ?? null,
        lastName: session.user.name?.split(" ").slice(1).join(" ") ?? null,
        username: session.user.email?.split("@")[0] ?? null,
        role: (session.user as { role?: string; provider?: string }).role ?? "client",
        provider: (session.user as { role?: string; provider?: string }).provider ?? undefined,
      }
    : null;

  return (
    <SessionUserContext.Provider value={user}>
      {children}
    </SessionUserContext.Provider>
  );
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthProvider>
      <ConsentApplier />
      <EmailVerificationBanner />
      <SessionUserBridge>{children}</SessionUserBridge>
    </NextAuthProvider>
  );
}

export function useSessionUser(): SessionUser {
  return useContext(SessionUserContext);
}
