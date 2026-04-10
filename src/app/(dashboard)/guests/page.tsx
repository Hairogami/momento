import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddGuest } from "./add-guest";
import { RsvpToggle } from "./rsvp-toggle";
import Link from "next/link";
import { C } from "@/lib/colors";

const RSVP_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  yes: { label: "Confirmé", variant: "default" },
  no: { label: "Décliné", variant: "destructive" },
  pending: { label: "En attente", variant: "outline" },
};

export default async function GuestsPage({
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
        guests: { orderBy: { createdAt: "asc" } },
      },
    }),
    prisma.planner.findMany({
      where: { userId: session.user.id },
      select: { id: true, coupleNames: true, title: true, coverColor: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!workspace) redirect("/dashboard");

  // ── Gate : aucun événement créé ──────────────────────────────────────────
  if (planners.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center gap-6">
        <div className="text-5xl">📅</div>
        <div>
          <h1 className="text-xl font-semibold mb-2">Ton mariage n&apos;est pas encore créé</h1>
          <p className="text-sm text-muted-foreground max-sm">
            Crée ton événement pour commencer ta liste d&apos;invités.
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

  const activePlanner = eventFilter ? planners.find(p => p.id === eventFilter) ?? null : null;

  const guests = workspace.guests;
  const confirmed = guests.filter((g) => g.rsvp === "yes").length;
  const declined = guests.filter((g) => g.rsvp === "no").length;
  const pending = guests.filter((g) => g.rsvp === "pending").length;
  const plusOnes = guests.filter((g) => g.plusOne && g.rsvp === "yes").length;
  const totalAttending = confirmed + plusOnes;

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
            href="/guests"
            className="text-xs opacity-60 hover:opacity-100"
            style={{ color: activePlanner.coverColor ?? C.terra }}
          >
            ✕ Voir tout
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Invités</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {guests.length} invité{guests.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Pattern D — lien contextuel vers budget */}
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
          <AddGuest workspaceId={workspace.id} />
        </div>
      </div>

      {/* Pattern D — Event filter strip (pills) */}
      {planners.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Link
            href="/guests"
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              backgroundColor: !eventFilter ? C.terra : `${C.anthracite}80`,
              color: !eventFilter ? "#fff" : C.mist,
            }}
          >
            Tous
          </Link>
          {planners.map(p => {
            const label = p.coupleNames || p.title || "Événement";
            const active = eventFilter === p.id;
            return (
              <Link
                key={p.id}
                href={active ? "/guests" : `/guests?id=${p.id}`}
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground font-normal">Total présents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{totalAttending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground font-normal">Confirmés</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold text-green-600">{confirmed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground font-normal">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold text-amber-500">{pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground font-normal">Déclinés</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold text-muted-foreground">{declined}</p>
          </CardContent>
        </Card>
      </div>

      {/* Guest table */}
      <Card>
        {guests.length === 0 ? (
          <CardContent className="py-10 text-center">
            <p className="text-sm text-muted-foreground">Ta liste est encore vide — hâte de la remplir !</p>
            <p className="text-xs text-muted-foreground mt-1">Ajoute ton premier invité →</p>
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>+1</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>RSVP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guests.map((guest) => (
                <TableRow key={guest.id}>
                  <TableCell className="font-medium">{guest.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {guest.email ?? guest.phone ?? "—"}
                  </TableCell>
                  <TableCell>
                    {guest.plusOne ? (
                      <Badge variant="secondary" className="text-xs">+1</Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {guest.tableNumber != null ? (
                      <span className="text-sm">Table {guest.tableNumber}</span>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <RsvpToggle id={guest.id} rsvp={guest.rsvp} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
