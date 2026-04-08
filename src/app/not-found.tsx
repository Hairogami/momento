import Link from "next/link";
import { C } from "@/lib/colors"

;

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: C.ink }}
    >
      <div className="text-center max-w-md">
        <h1
          className="text-8xl font-light italic mb-4"
          style={{
            fontFamily:
              "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
            color: C.terra,
          }}
        >
          404
        </h1>
        <h2
          className="text-2xl font-semibold mb-2"
          style={{ color: C.white }}
        >
          Page introuvable
        </h2>
        <p className="text-sm mb-8" style={{ color: C.mist }}>
          La page que vous cherchez n&apos;existe pas ou a ete deplacee.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: C.terra }}
          >
            Retour a l&apos;accueil
          </Link>
          <Link
            href="/explore"
            className="px-6 py-3 rounded-xl text-sm font-medium transition-all hover:opacity-80"
            style={{
              backgroundColor: "transparent",
              color: C.white,
              border: `1px solid ${C.anthracite}`,
            }}
          >
            Explorer
          </Link>
        </div>
      </div>
    </div>
  );
}
