import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Momento — Prestataires événementiels au Maroc", template: "%s | Momento" },
  description: "Trouvez et réservez les meilleurs DJ, traiteurs, photographes et prestataires pour votre mariage, anniversaire ou événement au Maroc. Casablanca, Marrakech, Rabat.",
  metadataBase: new URL("https://momentoevents.app"),
  keywords: ["prestataires événementiels Maroc", "mariage Maroc", "DJ Marrakech", "traiteur Casablanca", "photographe mariage Maroc", "décoration événement Maroc", "organisateur événement Maroc"],
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  icons: {
    icon: [{ url: "/logo-dark.png", type: "image/png" }],
    apple: "/logo-badge-dark.png",
  },
  openGraph: {
    title: "Momento — Prestataires événementiels au Maroc",
    description: "Trouvez et réservez les meilleurs DJ, traiteurs, photographes pour votre événement au Maroc.",
    url: "https://momentoevents.app",
    siteName: "Momento",
    locale: "fr_MA",
    type: "website",
    images: [{ url: "https://momentoevents.app/logo-badge-dark.png", width: 361, height: 359, alt: "Momento — Plateforme événementielle Maroc" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Momento — Prestataires événementiels au Maroc",
    description: "Trouvez et réservez les meilleurs prestataires pour votre événement au Maroc.",
    images: ["https://momentoevents.app/logo-badge-dark.png"],
  },
  alternates: {
    canonical: "https://momentoevents.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "Momento",
                url: "https://momentoevents.app",
                description: "Plateforme de prestataires événementiels au Maroc",
                potentialAction: {
                  "@type": "SearchAction",
                  target: "https://momentoevents.app/explore?q={search_term_string}",
                  "query-input": "required name=search_term_string",
                },
              },
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "Momento",
                url: "https://momentoevents.app",
                logo: "https://momentoevents.app/logo-badge-dark.png",
                sameAs: [],
                contactPoint: {
                  "@type": "ContactPoint",
                  contactType: "customer service",
                  availableLanguage: ["French", "Arabic"],
                  areaServed: "MA",
                },
              },
              {
                "@context": "https://schema.org",
                "@type": "LocalBusiness",
                name: "Momento",
                url: "https://momentoevents.app",
                description: "Marketplace de prestataires pour événements au Maroc : mariages, anniversaires, fiançailles, corporate.",
                image: "https://momentoevents.app/logo-badge-dark.png",
                priceRange: "$$",
                areaServed: {
                  "@type": "Country",
                  name: "Maroc",
                },
                hasOfferCatalog: {
                  "@type": "OfferCatalog",
                  name: "Prestataires événementiels",
                  itemListElement: [
                    { "@type": "Offer", itemOffered: { "@type": "Service", name: "DJ & Musique" } },
                    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Traiteur" } },
                    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Photographe & Vidéaste" } },
                    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Décoration & Lumières" } },
                    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Lieu de réception" } },
                  ],
                },
              },
            ]),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <SessionProvider>{children}</SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
