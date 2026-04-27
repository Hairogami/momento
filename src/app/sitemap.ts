import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE = "https://momentoevents.app";

// Routes statiques publiques indexables. Toute nouvelle page publique doit
// être ajoutée ici (sinon Google ne la voit pas via le sitemap).
const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/",                   changeFrequency: "weekly",  priority: 1.0 },
  { path: "/accueil",            changeFrequency: "weekly",  priority: 0.9 },
  { path: "/explore",            changeFrequency: "daily",   priority: 0.9 },
  { path: "/a-propos",           changeFrequency: "monthly", priority: 0.6 },
  { path: "/pro",                changeFrequency: "monthly", priority: 0.7 },
  { path: "/signup",             changeFrequency: "monthly", priority: 0.5 },
  { path: "/login",              changeFrequency: "monthly", priority: 0.4 },
  { path: "/cgu",                changeFrequency: "yearly",  priority: 0.2 },
  { path: "/confidentialite",    changeFrequency: "yearly",  priority: 0.2 },
  { path: "/mentions-legales",   changeFrequency: "yearly",  priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Vendors publiés — `updatedAt` réel pour signaler à Google quand
  // recrawler. On filtre verified (qualité) mais pas obligatoire — les fiches
  // non vérifiées restent indexables, juste avec priorité plus basse.
  const vendors = await prisma.vendor.findMany({
    select: { slug: true, updatedAt: true, verified: true },
  });

  const vendorEntries: MetadataRoute.Sitemap = vendors.map((v) => ({
    url: `${BASE}/vendor/${v.slug}`,
    lastModified: v.updatedAt,
    changeFrequency: "monthly",
    priority: v.verified ? 0.7 : 0.5,
  }));

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${BASE}${r.path}`,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  return [...staticEntries, ...vendorEntries];
}
