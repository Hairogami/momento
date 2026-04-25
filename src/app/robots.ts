import type { MetadataRoute } from "next";

// Allowlist explicite — ne PAS énumérer les routes protégées (free recon
// pour un attaquant). On bloque tout par défaut puis on autorise les
// routes publiques indexables.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/explore", "/vendor/", "/login", "/signup", "/cgu", "/confidentialite", "/mentions-legales", "/coming-soon", "/pro"],
        disallow: "/",
      },
    ],
    sitemap: "https://momentoevents.app/sitemap.xml",
  };
}
