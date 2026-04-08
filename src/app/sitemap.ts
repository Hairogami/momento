import type { MetadataRoute } from "next";
import { VENDOR_BASIC } from "@/lib/vendorData";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://momentoevents.app";

  const categories = [
    "musique-dj", "traiteur", "photo-video", "lieu", "decor-lumieres",
    "beaute", "neggafa", "planification", "animation", "transport",
    "securite", "cadeaux",
  ];

  const vendorEntries = Object.keys(VENDOR_BASIC).map((slug) => ({
    url: `${base}/vendor/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/explore`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    ...categories.map((slug) => ({
      url: `${base}/explore/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...vendorEntries,
  ];
}
