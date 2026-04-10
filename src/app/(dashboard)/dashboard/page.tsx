import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { type DashboardData } from "@/components/DashboardWidgets";
import DashboardWidgets from "@/components/DashboardWidgets";
import EventCard from "@/components/EventCard";
import { IS_DEV, MOCK_DASHBOARD_DATA, MOCK_NEEDED_CATEGORIES, MOCK_WORKSPACE } from "@/lib/devMock";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
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
        budget={MOCK_WORKSPACE.budget}
        guestCount={MOCK_WORKSPACE.guestCount}
        coverColor={null}
      />
    )
  }

  // ── PRODUCTION ────────────────────────────────────────────────────────────
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id: plannerId } = await searchParams;

  // ── Si un planner est sélectionné, charger ses données ──────────────────
  let plannerOverride: {
    eventName: string
    eventDate: string | null
    budget: number | null
    budgetItems: DashboardData["budgetItems"]
    coverColor: string | null
  } | null = null

  if (plannerId) {
    const planner = await prisma.planner.findUnique({
      where: { id: plannerId },
      include: { budgetItems: true },
    })
    if (planner && planner.userId === session.user.id) {
      plannerOverride = {
        eventName: planner.coupleNames || planner.title || "Mon événement",
        eventDate: planner.weddingDate ? planner.weddingDate.toISOString() : null,
        budget: planner.budget,
        budgetItems: planner.budgetItems.map(b => ({
          id: b.id, category: b.category, label: b.label,
          estimated: b.estimated, actual: b.actual,
        })),
        coverColor: planner.coverColor,
      }
    }
  }

  // ── Workspace (tâches, réservations, invités) ────────────────────────────
  let workspace = await prisma.workspace.findUnique({
    where: { userId: session.user.id },
    include: {
      tasks:    { where: { completed: false }, orderBy: { dueDate: "asc" }, take: 10 },
      budgetItems: true,
      bookings: { include: { vendor: { select: { name: true, category: true } } }, take: 10 },
      guests:   true,
    },
  });

  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: { userId: session.user.id },
      include: {
        tasks:    { where: { completed: false }, orderBy: { dueDate: "asc" }, take: 10 },
        budgetItems: true,
        bookings: { include: { vendor: { select: { name: true, category: true } } }, take: 10 },
        guests:   true,
      },
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true },
  }).catch(() => null);

  let unreadCount = 0;
  try {
    unreadCount = await prisma.message.count({
      where: {
        read: false,
        senderId: { not: session.user.id },
        conversation: { clientId: session.user.id },
      },
    });
  } catch (err) { console.error("[dashboard] unreadCount query failed:", err) }

  // ── Calcul des jours restants ────────────────────────────────────────────
  const rawDate = plannerOverride?.eventDate ?? (workspace.eventDate ? workspace.eventDate.toISOString() : null)
  let daysUntil: number | null = null
  if (rawDate) {
    daysUntil = Math.max(0, Math.ceil((new Date(rawDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
  }

  const firstName = user?.name?.split(" ")[0] ?? null;

  // ── Données agrégées — planner prioritaire, workspace en fallback ─────────
  const data: DashboardData = {
    firstName,
    eventName: plannerOverride?.eventName ?? workspace.eventName,
    eventDate: plannerOverride?.eventDate ?? (workspace.eventDate ? workspace.eventDate.toISOString() : null),
    budget: plannerOverride?.budget ?? workspace.budget,
    guestCount: workspace.guestCount,
    tasks: workspace.tasks.map((t) => ({
      id: t.id, title: t.title, category: t.category,
      dueDate: t.dueDate ? t.dueDate.toISOString() : null, completed: t.completed,
    })),
    budgetItems: plannerOverride?.budgetItems ?? workspace.budgetItems.map((b) => ({
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
  } catch (err) { console.error("[dashboard] neededCategories raw query failed:", err) }

  return (
    <DashboardContent
      data={data}
      eventName={plannerOverride?.eventName ?? workspace.eventName}
      eventDate={plannerOverride?.eventDate ?? (workspace.eventDate ? workspace.eventDate.toISOString() : null)}
      daysUntil={daysUntil}
      neededCategories={neededCategories}
      budget={plannerOverride?.budget ?? workspace.budget}
      guestCount={workspace.guestCount}
      coverColor={plannerOverride?.coverColor ?? null}
      plannerId={plannerId}
    />
  );
}

// ── Shared UI ────────────────────────────────────────────────────────────────

function DashboardContent({
  data, eventName, eventDate, daysUntil, neededCategories, budget, guestCount, coverColor, plannerId,
}: {
  data: DashboardData
  eventName: string
  eventDate: string | null
  daysUntil: number | null
  neededCategories: string[]
  budget: number | null
  guestCount: number | null
  coverColor: string | null
  plannerId?: string
}) {
  return (
    <div className="p-6 w-full max-w-none space-y-6">
      <EventCard
        eventName={eventName}
        eventDate={eventDate}
        daysUntil={daysUntil}
        budget={budget}
        guestCount={guestCount}
        coverColor={coverColor}
      />
      <DashboardWidgets data={data} neededCategories={neededCategories} plannerId={plannerId} />
    </div>
  )
}
