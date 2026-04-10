import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { C } from "@/lib/colors";
import { FavoriteButton } from "./favorite-button";

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

const STATUS_META: Record<string, { label: string; bg: string; fg: string; border: string }> = {
  confirmed: {
    label: "Confirmé",
    bg: "rgba(34,197,94,0.15)",
    fg: "#22c55e",
    border: "rgba(34,197,94,0.4)",
  },
  inquiry: {
    label: "En attente",
    bg: "rgba(245,158,11,0.15)",
    fg: "#f59e0b",
    border: "rgba(245,158,11,0.4)",
  },
  cancelled: {
    label: "Annulé",
    bg: "rgba(148,163,184,0.15)",
    fg: "#94a3b8",
    border: "rgba(148,163,184,0.4)",
  },
};

function formatDate(date: Date | null | undefined): string | null {
  if (!date) return null;
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return null;
  }
}

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id: eventFilter } = await searchParams;

  const [workspace, planners] = await Promise.all([
    prisma.workspace.findUnique({
      where: { userId: session.user.id },
      include: {
        bookings: {
          orderBy: { createdAt: "desc" },
          include: {
            vendor: {
              include: {
                media: {
                  where: { type: "image" },
                  orderBy: { order: "asc" },
                  take: 1,
                },
              },
            },
            package: { select: { name: true, price: true } },
          },
        },
      },
    }),
    prisma.planner.findMany({
      where: { userId: session.user.id },
      select: { id: true, coupleNames: true, title: true, coverColor: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!workspace) redirect("/dashboard");

  // ── Pattern B — Gate : aucun événement créé ─────────────────────────────
  if (planners.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center gap-6">
        <div className="text-5xl">🤝</div>
        <div>
          <h1 className="text-xl font-semibold mb-2">Aucun événement actif</h1>
          <p className="text-sm text-muted-foreground max-w-sm">
            Créez d&apos;abord un événement pour gérer vos prestataires.
          </p>
        </div>
        <a
          href="/event/new"
          className="px-5 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
          style={{ backgroundColor: "var(--momento-terra)", color: "#fff" }}
        >
          Créer mon premier événement →
        </a>
      </div>
    );
  }

  const activePlanner = eventFilter
    ? planners.find((p) => p.id === eventFilter) ?? null
    : null;

  // Note: Booking n'a pas de relation directe avec Planner dans le schéma.
  // Le filtre ?id=xxx est conservé pour cohérence nav (Pattern A/D)
  // mais la liste affichée reste celle du workspace.
  const bookings = workspace.bookings;

  const totalBookings = bookings.length;
  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
  const pendingCount = bookings.filter((b) => b.status === "inquiry").length;

  return (
    <div className="p-6 space-y-6">
      {/* Pattern A — Context Strip */}
      {activePlanner && (
        <div
          className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm"
          style={{
            backgroundColor: `${activePlanner.coverColor ?? C.terra}15`,
            border: `1px solid ${activePlanner.coverColor ?? C.terra}40`,
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: activePlanner.coverColor ?? C.terra }}
            />
            <span style={{ color: activePlanner.coverColor ?? C.terra }}>
              Vous consultez : {activePlanner.coupleNames || activePlanner.title || "Événement"}
            </span>
          </div>
          <Link
            href="/vendors"
            className="text-xs opacity-60 hover:opacity-100"
            style={{ color: activePlanner.coverColor ?? C.terra }}
          >
            ✕ Voir tout
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: C.white }}>
            Mes prestataires
          </h1>
          <p className="text-sm mt-1" style={{ color: C.mist }}>
            {totalBookings} prestataire{totalBookings !== 1 ? "s" : ""}
            {totalBookings > 0 && ` · ${confirmedCount} confirmé${confirmedCount !== 1 ? "s" : ""}`}
            {pendingCount > 0 && ` · ${pendingCount} en attente`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Pattern D — nav contextuelle */}
          {eventFilter && (
            <Link
              href={`/budget?event=${eventFilter}`}
              className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg transition hover:opacity-80"
              style={{
                color: C.terra,
                border: `1px solid ${C.terra}40`,
                backgroundColor: `${C.terra}10`,
              }}
            >
              Voir le budget →
            </Link>
          )}
          <Link
            href="/prestataires"
            className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold transition hover:opacity-90"
            style={{
              backgroundColor: C.terra,
              color: "#fff",
            }}
          >
            + Trouver un prestataire
          </Link>
        </div>
      </div>

      {/* Pattern D — Event filter strip (pills) */}
      {planners.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Link
            href="/vendors"
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              backgroundColor: !eventFilter ? C.terra : `${C.anthracite}80`,
              color: !eventFilter ? "#fff" : C.mist,
            }}
          >
            Tous
          </Link>
          {planners.map((p) => {
            const label = p.coupleNames || p.title || "Événement";
            const active = eventFilter === p.id;
            return (
              <Link
                key={p.id}
                href={active ? "/vendors" : `/vendors?id=${p.id}`}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  backgroundColor: active ? (p.coverColor ?? C.terra) : `${C.anthracite}80`,
                  color: active ? "#fff" : C.mist,
                  border: active ? "none" : `1px solid ${C.anthracite}`,
                }}
              >
                {label}
              </Link>
            );
          })}
        </div>
      )}

      {/* Bookings */}
      {bookings.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-2xl gap-4"
          style={{
            backgroundColor: C.dark,
            border: `1px solid ${C.anthracite}`,
          }}
        >
          <div className="text-4xl">🎯</div>
          <div>
            <p className="text-base font-semibold mb-1" style={{ color: C.white }}>
              Aucun prestataire réservé
            </p>
            <p className="text-sm max-w-sm" style={{ color: C.mist }}>
              Parcourez l&apos;annuaire pour trouver et réserver vos prestataires d&apos;événement.
            </p>
          </div>
          <Link
            href="/prestataires"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: C.terra, color: "#fff" }}
          >
            Explorer les prestataires →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookings.map((booking) => {
            const vendor = booking.vendor;
            const cover = vendor.media[0]?.url ?? null;
            const status = STATUS_META[booking.status] ?? STATUS_META.inquiry;
            const dateLabel = formatDate(booking.eventDate);
            const price = booking.totalPrice ?? booking.package?.price ?? null;
            const initial =
              CATEGORIES[vendor.category]?.[0] ??
              vendor.category?.[0]?.toUpperCase() ??
              "?";

            return (
              <Link
                key={booking.id}
                href={`/prestataire/${vendor.id}`}
                className="group relative flex flex-col rounded-2xl overflow-hidden transition-all hover:scale-[1.01] hover:shadow-lg"
                style={{
                  backgroundColor: C.dark,
                  border: `1px solid ${C.anthracite}`,
                }}
              >
                {/* Cover */}
                <div className="relative h-40 overflow-hidden">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cover}
                      alt={vendor.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${C.anthracite}, ${C.dark})`,
                      }}
                    >
                      <span className="text-5xl font-bold" style={{ color: `${C.terra}40` }}>
                        {initial}
                      </span>
                    </div>
                  )}

                  {/* Status badge top-left */}
                  <div className="absolute top-2.5 left-2.5">
                    <span
                      className="text-[10px] font-semibold px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: status.bg,
                        color: status.fg,
                        border: `1px solid ${status.border}`,
                        backdropFilter: "blur(6px)",
                      }}
                    >
                      {status.label}
                    </span>
                  </div>

                  {/* Favorite button top-right */}
                  <div className="absolute top-2.5 right-2.5">
                    <FavoriteButton vendorId={vendor.id} />
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 p-4 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className="text-sm font-bold leading-tight line-clamp-2"
                      style={{ color: C.white }}
                    >
                      {vendor.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-xs" style={{ color: C.mist }}>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                      style={{
                        backgroundColor: `${C.anthracite}80`,
                        color: C.mist,
                      }}
                    >
                      {CATEGORIES[vendor.category] ?? vendor.category}
                    </span>
                    {vendor.city && <span>· {vendor.city}</span>}
                  </div>

                  <div
                    className="flex items-center justify-between gap-2 mt-auto pt-3 border-t"
                    style={{ borderColor: `${C.anthracite}80` }}
                  >
                    {price != null ? (
                      <span className="text-sm font-semibold" style={{ color: C.white }}>
                        {price.toLocaleString("fr-FR")} MAD
                      </span>
                    ) : (
                      <span className="text-xs" style={{ color: C.steel }}>
                        Prix à confirmer
                      </span>
                    )}
                    {dateLabel && (
                      <span className="text-xs" style={{ color: C.mist }}>
                        {dateLabel}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
