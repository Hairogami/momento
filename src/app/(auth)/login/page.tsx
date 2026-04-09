import { signIn } from "@/lib/auth";
import Image from "next/image";
import { C } from "@/lib/colors";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { Input } from "@/components/ui/input";
import { CredentialsForm } from "./CredentialsForm";

export default function LoginPage() {
  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: C.ink }}
    >
      <div className="absolute top-4 left-4">
        <a href="/" className="text-sm transition-opacity hover:opacity-70" style={{ color: C.mist }}>← Accueil</a>
      </div>
      <div className="absolute top-4 right-4">
        <DarkModeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-3">
            <Image src="/logo-light.png" alt="Momento" width={100} height={100} className="invert dark:invert-0" style={{ objectFit: "contain" }} priority />
          </div>
          <p className="text-sm" style={{ color: C.mist }}>
            Organisez votre evenement sans stress
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 space-y-5 shadow-lg dark:shadow-none bg-white dark:bg-[var(--momento-dark)]"
          style={{
            border: `1px solid ${C.anthracite}`,
          }}
        >
          <div className="text-center mb-2">
            <h2 className="text-xl font-semibold" style={{ color: C.white }}>
              Bienvenue
            </h2>
            <p className="text-sm mt-1" style={{ color: C.mist }}>
              Connectez-vous pour continuer
            </p>
          </div>

          {/* OAuth providers */}
          <div className="space-y-2.5">
            <form
              action={async () => {
                "use server";
                await signIn("github", { redirectTo: "/dashboard" });
              }}
            >
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all hover:opacity-90 bg-white dark:bg-[var(--momento-ink)]"
                style={{
                  color: C.white,
                  border: `1px solid ${C.anthracite}`,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Continuer avec GitHub
              </button>
            </form>

            {process.env.GOOGLE_CLIENT_ID && (
              <form
                action={async () => {
                  "use server";
                  await signIn("google", { redirectTo: "/dashboard" });
                }}
              >
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all hover:opacity-90 bg-white dark:bg-[var(--momento-ink)]"
                  style={{
                    color: C.white,
                    border: `1px solid ${C.anthracite}`,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continuer avec Google
                </button>
              </form>
            )}

            {process.env.FACEBOOK_CLIENT_ID && (
              <form
                action={async () => {
                  "use server";
                  await signIn("facebook", { redirectTo: "/dashboard" });
                }}
              >
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all hover:opacity-90 bg-white dark:bg-[var(--momento-ink)]"
                  style={{
                    color: C.white,
                    border: `1px solid ${C.anthracite}`,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Continuer avec Facebook
                </button>
              </form>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ backgroundColor: C.anthracite }} />
            <span className="text-xs" style={{ color: C.mist }}>ou</span>
            <div className="flex-1 h-px" style={{ backgroundColor: C.anthracite }} />
          </div>

          {/* Email / Password + Register */}
          <CredentialsForm />

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ backgroundColor: C.anthracite }} />
            <span className="text-xs" style={{ color: C.mist }}>lien magique</span>
            <div className="flex-1 h-px" style={{ backgroundColor: C.anthracite }} />
          </div>

          {/* Magic link */}
          <form
            action={async (formData: FormData) => {
              "use server";
              await signIn("resend", {
                email: formData.get("email") as string,
                redirectTo: "/dashboard",
              });
            }}
            className="space-y-3"
          >
            <Input
              name="email"
              type="email"
              placeholder="toi@exemple.com"
              required
              className="rounded-xl py-3 px-4 text-sm bg-white dark:bg-[var(--momento-ink)]"
              style={{
                border: `1px solid ${C.anthracite}`,
                color: C.white,
              }}
            />
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-medium text-sm transition-all hover:opacity-90"
              style={{
                backgroundColor: "transparent",
                color: C.mist,
                border: `1px solid ${C.anthracite}`,
              }}
            >
              Recevoir un lien par email
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: C.mist }}>
          En continuant, vous acceptez nos conditions d&apos;utilisation.
        </p>
      </div>
    </div>
  );
}
