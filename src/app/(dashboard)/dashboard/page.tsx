import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { type DashboardData } from "@/components/DashboardWidgets";
import DashboardWidgets from "@/components/DashboardWidgets";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { C } from "@/lib/colors";
import { IS_DEV, MOCK_DASHBOARD_DATA, MOCK_NEEDED_CATEGORIES, MOCK_WORKSPACE } from "@/lib/devMock";

export default async function DashboardPage() {
  // ── DEV MOCK (local only, never runs in production) ──────────────────────
  if (IS_DEV) {
    const daysUntil = Math.max(0, Math.ceil(
      (new Date(MOCK_WORKSPACE.eventDate!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    ))
    return (
      <DashboardContent
        data={MOCK_DASHBOARD_DATA}
        eventName={MOCK_WORKSPACE.eventName}
        eventDate={MOCK_WORKSPACE.eventDate}
        daysUntil={daysUntil}
        neededCategories={MOCK_NEEDED_CATEGORIES}
      />
    )
  }

  // ── PRODUCTION ────────────────────────────────────────────────────────────
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  let workspace = await prisma.workspace.findUnique({
    where: { userId: session.user.id },
    include: {
      tasks: { where: { completed: false }, orderBy: { dueDate: "asc" }, take: 10 },
      budgetItems: true,
      bookings: { include: { vendor: { select: { name: true, category: true } } }, take: 10 },
      guests: true,
    },
  });

  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: { userId: session.user.id },
      include: {
        tasks: { where: { completed: false }, orderBy: { dueDate: "asc" }, take: 10 },
        budgetItems: true,
        bookings: { include: { vendor: { select: { name: true, category: true } } }, take: 10 },
        guests: true,
      },
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { firstName: true, name: true },
  });

  const unreadCount = await prisma.message.count({
    where: {
      read: false,
      senderId: { not: session.user.id },
      conversation: { clientId: session.user.id },
    },
  });

  let daysUntil: number | null = null;
  if (workspace.eventDate) {
    const diff = new Date(workspace.eventDate).getTime() - Date.now();
    daysUntil = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  const firstName = user?.firstName ?? user?.name?.split(" ")[0] ?? null;

  const data: DashboardData = {
    firstName,
    eventName: workspace.eventName,
    eventDate: workspace.eventDate ? workspace.eventDate.toISOString() : null,
    budget: workspace.budget,
    guestCount: workspace.guestCount,
    tasks: workspace.tasks.map((t) => ({
      id: t.id, title: t.title, category: t.category,
      dueDate: t.dueDate ? t.dueDate.toISOString() : null, completed: t.completed,
    })),
    budgetItems: workspace.budgetItems.map((b) => ({
      id: b.id, category: b.category, label: b.label, estimated: b.estimated, actual: b.actual,
    })),
    bookings: workspace.bookings.map((b) => ({
      id: b.id, status: b.status, vendor: b.vendor ?? null,
    })),
    guests: workspace.guests.map((g) => ({ id: g.id, rsvp: g.rsvp })),
    unreadCount,
  };

  let neededCategories: string[] = [];
  try {
    const raw = await prisma.$queryRaw<{ neededCategories: string }[]>`
      SELECT "neededCategories" FROM "Workspace" WHERE "userId" = ${session.user.id} LIMIT 1
    `;
    if (raw[0]?.neededCategories) neededCategories = JSON.parse(raw[0].neededCategories);
  } catch { /* migration pending */ }

  return (
    <DashboardContent
      data={data}
      eventName={workspace.eventName}
      eventDate={workspace.eventDate ? workspace.eventDate.toISOString() : null}
      daysUntil={daysUntil}
      neededCategories={neededCategories}
    />
  );
}

// ── Shared UI ────────────────────────────────────────────────────────────────

function DashboardContent({
  data, eventName, eventDate, daysUntil, neededCategories,
}: {
  data: DashboardData
  eventName: string
  eventDate: string | null
  daysUntil: number | null
  neededCategories: string[]
}) {
  const hasEvent = !!eventDate || eventName !== "Mon événement"

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {hasEvent ? (
        <div className="rounded-2xl px-6 py-5 flex items-center justify-between"
          style={{ backgroundColor: "var(--bg-card)", border: `1px solid var(--border)` }}>
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: C.terra }}>
              ✦ Votre événement
            </p>
            <h1 className="text-2xl font-bold" style={{ color: C.white }}>{eventName}</h1>
            {eventDate && (
              <p className="text-sm flex items-center gap-1.5 mt-1" style={{ color: C.mist }}>
                <Calendar size={13} />
                {new Date(eventDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                {daysUntil !== null && daysUntil > 0 && (
                  <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${C.terra}25`, color: C.terra }}>
                    J-{daysUntil}
                  </span>
                )}
                {daysUntil === 0 && (
                  <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${C.terra}25`, color: C.terra }}>
                    Aujourd&apos;hui !
                  </span>
                )}
              </p>
            )}
          </div>
          <Link href="/event/new"
            className="text-xs px-4 py-2 rounded-xl font-semibold transition hover:opacity-80"
            style={{ backgroundColor: `${C.terra}18`, color: C.terra, border: `1px solid ${C.terra}40` }}>
            + Nouvel événement
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl px-6 py-8 flex flex-col items-center text-center"
          style={{ backgroundColor: "var(--bg-card)", border: `1px solid var(--border)` }}>
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: C.terra }}>
            ✦ Mes Événements ✦
          </p>
          <h1 className="text-2xl font-bold mb-2" style={{ color: C.white }}>
            {data.firstName ? `Bonjour, ${data.firstName}` : "Bienvenue sur Momento"}
          </h1>
          <p className="text-sm mb-5" style={{ color: C.mist }}>Créez votre premier événement pour commencer.</p>
          <Link href="/event/new"
            className="flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-xl transition hover:opacity-90"
            style={{ backgroundColor: C.terra, color: "#fff" }}>
            Créer mon événement →
          </Link>
        </div>
      )}

      <DashboardWidgets data={data} neededCategories={neededCategories} />
    </div>
  )
}
