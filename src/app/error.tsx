"use client";

import { C } from "@/lib/colors"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: C.ink }}
    >
      <div className="text-center max-w-md">
        <h1
          className="text-6xl font-light italic mb-4"
          style={{
            fontFamily:
              "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
            color: C.terra,
          }}
        >
          Oups
        </h1>
        <h2
          className="text-xl font-semibold mb-2"
          style={{ color: C.white }}
        >
          Une erreur est survenue
        </h2>
        <p className="text-sm mb-8" style={{ color: C.mist }}>
          {error.message || "Quelque chose s'est mal passe. Veuillez reessayer."}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: C.terra }}
          >
            Reessayer
          </button>
          <a
            href="/"
            className="px-6 py-3 rounded-xl text-sm font-medium transition-all hover:opacity-80"
            style={{
              color: C.white,
              border: `1px solid ${C.anthracite}`,
            }}
          >
            Retour a l&apos;accueil
          </a>
        </div>
      </div>
    </div>
  );
}
