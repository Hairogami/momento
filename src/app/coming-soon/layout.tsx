import type { Metadata } from "next";

/**
 * Override per-segment metadata pour /coming-soon.
 * - canonical pointe sur /coming-soon (Lighthouse SEO valide).
 * - title court adapté au pré-lancement.
 * Le robots/keywords/og hérité du root layout reste actif.
 */
export const metadata: Metadata = {
  title: "Bientôt disponible — Momento",
  description: "La marketplace des prestataires événementiels au Maroc — lancement le 1ᵉʳ juin 2026. Inscris-toi à la liste d'attente.",
  alternates: {
    canonical: "https://momentoevents.app/coming-soon",
  },
};

export default function ComingSoonLayout({ children }: { children: React.ReactNode }) {
  return children;
}
