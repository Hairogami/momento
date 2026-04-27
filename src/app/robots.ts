import type { MetadataRoute } from "next";

// Pattern standard : on autorise tout par défaut, on liste explicitement les
// chemins privés/techniques à exclure. Plus simple et plus robuste qu'une
// allowlist (qui casse silencieusement à chaque nouvelle route publique).
//
// Les routes auth-protégées sont déjà bloquées par le proxy/middleware côté
// runtime — ici on évite juste leur indexation Google (free recon attaquant
// minimisée et résultats de recherche propres).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin",
          "/admin/",
          "/dashboard",
          "/dashboard/",
          "/dev/",
          "/_next/",
          "/budget",
          "/guests",
          "/messages",
          "/notifications",
          "/favorites",
          "/mes-prestataires",
          "/profile",
          "/settings",
          "/upgrade",
          "/planner",
          "/vendor/dashboard",
          "/forgot-password",
          "/reset-password",
          "/welcome-preview",
          "/evt/preview/",
        ],
      },
    ],
    sitemap: "https://momentoevents.app/sitemap.xml",
    host: "https://momentoevents.app",
  };
}
