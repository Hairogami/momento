import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard", "/profile", "/planner", "/budget", "/guests", "/messages", "/notifications", "/favorites", "/prestataire/dashboard"],
      },
    ],
    sitemap: "https://momentoevents.app/sitemap.xml",
  };
}
