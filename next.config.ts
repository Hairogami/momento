import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "cdn.discordapp.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "platform-lookaside.fbsbx.com" },
      { protocol: "https", hostname: "i.zafaf.net" },
      { protocol: "https", hostname: "**" }, // vendor media URLs (domaines variés)
    ],
    minimumCacheTTL: 2592000, // 30 jours — réduit les transformations Vercel
  },
  async headers() {
    // CSP base (réutilisée partout sauf pour /evt/preview qui doit s'iframe)
    const baseCspParts = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://images.unsplash.com https://avatars.githubusercontent.com https://cdn.discordapp.com https://lh3.googleusercontent.com https://platform-lookaside.fbsbx.com https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com https://unpkg.com https://cdnjs.cloudflare.com https://i.zafaf.net https://*.public.blob.vercel-storage.com",
      "connect-src 'self' https://*.supabase.co https://aws-0-eu-west-1.pooler.supabase.com https://maps.googleapis.com https://nominatim.openstreetmap.org",
      "frame-src 'self' https://maps.google.com https://www.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ]
    const commonHeaders = [
      { key: "X-Content-Type-Options",  value: "nosniff" },
      { key: "Referrer-Policy",         value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy",      value: "camera=(), microphone=(), geolocation=()" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
    ]
    return [
      // Catch-all d'abord → blocage total iframe par défaut
      {
        source: "/(.*)",
        headers: [
          ...commonHeaders,
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: [...baseCspParts, "frame-ancestors 'none'"].join("; ") },
        ],
      },
      // Override APRÈS pour la preview iframe (Next.js : la dernière règle gagne)
      {
        source: "/evt/preview/:path*",
        headers: [
          ...commonHeaders,
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: [...baseCspParts, "frame-ancestors 'self'"].join("; ") },
        ],
      },
    ];
  },
};

export default nextConfig;
