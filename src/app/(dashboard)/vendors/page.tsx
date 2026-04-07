import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, CheckCircle, Phone, Globe, AtSign } from "lucide-react";

const CATEGORIES: Record<string, string> = {
  dj: "DJ",
  catering: "Traiteur",
  photo: "Photo",
  video: "Vidéo",
  venue: "Salle",
  deco: "Décoration",
  makeup: "Maquillage",
  music: "Musique live",
};

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  const { category, q } = params;

  const vendors = await prisma.vendor.findMany({
    where: {
      ...(category ? { category } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { city: { contains: q } },
              { description: { contains: q } },
            ],
          }
        : {}),
    },
    include: {
      verification: true,
      packages: { where: { available: true }, take: 1 },
      media: { where: { type: "image" }, orderBy: { order: "asc" }, take: 1 },
    },
    orderBy: [{ featured: "desc" }, { rating: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Prestataires</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {vendors.length} prestataire{vendors.length !== 1 ? "s" : ""} disponible{vendors.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <a href="/vendors">
          <Badge
            variant={!category ? "default" : "outline"}
            className="cursor-pointer"
          >
            Tous
          </Badge>
        </a>
        {Object.entries(CATEGORIES).map(([key, label]) => (
          <a key={key} href={`/vendors?category=${key}`}>
            <Badge
              variant={category === key ? "default" : "outline"}
              className="cursor-pointer"
            >
              {label}
            </Badge>
          </a>
        ))}
      </div>

      {/* Vendor Grid */}
      {vendors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground text-sm">
              Aucun prestataire pour le moment.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              La base de données se remplit progressivement.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendors.map((vendor) => (
            <Card key={vendor.id} className="overflow-hidden hover:shadow-md transition-shadow">
              {/* Cover image */}
              {vendor.media[0] ? (
                <div className="h-40 bg-muted overflow-hidden">
                  <img
                    src={vendor.media[0].url}
                    alt={vendor.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-40 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                  <span className="text-4xl text-muted-foreground/30">
                    {CATEGORIES[vendor.category]?.[0] ?? "?"}
                  </span>
                </div>
              )}

              <CardHeader className="pb-2 pt-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <CardTitle className="text-base">{vendor.name}</CardTitle>
                      {vendor.verified && (
                        <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {CATEGORIES[vendor.category] ?? vendor.category}
                      </Badge>
                      {vendor.featured && (
                        <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-200">
                          Mis en avant
                        </Badge>
                      )}
                    </div>
                  </div>
                  {vendor.rating && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium">{vendor.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {vendor.city && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {vendor.city}{vendor.region ? `, ${vendor.region}` : ""}
                  </div>
                )}

                {vendor.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {vendor.description}
                  </p>
                )}

                {(vendor.priceMin || vendor.priceMax) && (
                  <p className="text-sm font-medium">
                    {vendor.priceMin && vendor.priceMax
                      ? `${vendor.priceMin.toLocaleString("fr-FR")} – ${vendor.priceMax.toLocaleString("fr-FR")} MAD`
                      : vendor.priceMin
                      ? `À partir de ${vendor.priceMin.toLocaleString("fr-FR")} MAD`
                      : `Jusqu'à ${vendor.priceMax!.toLocaleString("fr-FR")} MAD`}
                  </p>
                )}

                {/* Social verification */}
                {vendor.verification && (
                  <div className="flex items-center gap-2 text-xs">
                    {vendor.verification.instagramHandle && (
                      <span
                        className={`flex items-center gap-1 ${vendor.verification.instagramOk ? "text-pink-500" : "text-muted-foreground"}`}
                      >
                        <AtSign className="h-3 w-3" />
                        @{vendor.verification.instagramHandle}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  {vendor.phone && (
                    <a href={`tel:${vendor.phone}`}>
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
                        <Phone className="h-3 w-3" />
                        Appeler
                      </Button>
                    </a>
                  )}
                  {vendor.website && (
                    <a href={vendor.website} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
                        <Globe className="h-3 w-3" />
                        Site
                      </Button>
                    </a>
                  )}
                  <Button size="sm" className="h-8 text-xs ml-auto">
                    Contacter
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
