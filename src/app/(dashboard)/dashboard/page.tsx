import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { type DashboardData } from "@/components/DashboardWidgets";
import DashboardWidgets from "@/components/DashboardWidgets";
import EventCard from "@/components/EventCard";
import { IS_DEV, MOCK_NEEDED_CATEGORIES } from "@/lib/devMock";
import { requireSession } from "@/lib/devAuth";
import Link from "next/link";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  // ── DEV (vraies données DB via requireSession) ───────────────────────────
  if (IS_DEV) {
    const { id: devPlannerId } = await searchParams
    const devSession = await requireSession()
    const devUserId = devSession.user.id

    let devWorkspace = await prisma.workspace.findUnique({
      where: { userId: devUserId },
      include: {
        tasks:       { orderBy: { dueDate: "asc" }, take: 20 },
        budgetItems: true,
        bookings:    { include: { vendor: { select: { name: true, category: true } } }, take: 10 },
        guests:      true,
      },
    })
    if (!devWorkspace) {
      devWorkspace = await prisma.workspace.create({
        data: { userId: devUserId },
        include: {
          tasks:       { orderBy: { dueDate: "asc" }, take: 20 },
          budgetItems: true,
          bookings:    { include: { vendor: { select: { name: true, category: true } } }, take: 10 },
          guests:      true,
        },
      })
    }

    let devUnreadCount = 0
    try {
      devUnreadCount = await prisma.message.count({
        where: { read: false, senderId: { not: devUserId }, conversation: { clientId: devUserId } },
      })
    } catch { /* ignore */ }

    const devData: DashboardData = {
      firstName: devSession.user.name?.split(" ")[0] ?? null,
      eventName: devWorkspace.eventName,
      eventDate: devWorkspace.eventDate ? devWorkspace.eventDate.toISOString() : null,
      budget: devWorkspace.budget,
      guestCount: devWorkspace.guestCount,
      tasks: devWorkspace.tasks.map(t => ({
        id: t.id, title: t.title, category: t.category,
        dueDate: t.dueDate ? t.dueDate.toISOString() : null, completed: t.completed,
      })),
      budgetItems: devWorkspace.budgetItems.map(b => ({
        id: b.id, category: b.category, label: b.label, estimated: b.estimated, actual: b.actual,
      })),
      bookings: devWorkspace.bookings.map(b => ({
        id: b.id, status: b.status, vendor: b.vendor ?? null,
      })),
      guests: devWorkspace.guests.map(g => ({ id: g.id, rsvp: g.rsvp })),
      unreadCount: devUnreadCount,
    }

    // Si un planner est sélectionné, override eventName/budget
    const MOCK_PLANNERS = [
      { id: "mock-1", coupleNames: "Mariage Yasmine & Karim",   weddingDate: "2026-09-15", coverColor: "#e07b5a", budget: 120000, guestCount: 220 },
      { id: "mock-2", coupleNames: "Mariage Sara & Adam",       weddingDate: "2026-06-21", coverColor: "#7b5ea7", budget: 85000,  guestCount: 150 },
      { id: "mock-3", coupleNames: "Anniversaire 30 ans Leila", weddingDate: "2026-05-10", coverColor: "#e05a7b", budget: 30000,  guestCount: 60  },
      { id: "mock-4", coupleNames: "Mariage Nadia & Youssef",   weddingDate: "2026-11-08", coverColor: "#5a8ae0", budget: 200000, guestCount: 300 },
    ]
    const selected = MOCK_PLANNERS.find(p => p.id === devPlannerId)
    const eventName = selected?.coupleNames ?? devData.eventName
    const eventDate = selected?.weddingDate ?? devData.eventDate
    const budget    = selected?.budget ?? devData.budget
    const guestCount = selected?.guestCount ?? devData.guestCount
    const coverColor = selected?.coverColor ?? null
    const daysUntil = eventDate
      ? Math.max(0, Math.ceil((new Date(eventDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : null

    let devNeededCategories: string[] = MOCK_NEEDED_CATEGORIES
    try {
      const raw = await prisma.$queryRaw<{ neededCategories: string }[]>`
        SELECT "neededCategories" FROM "Workspace" WHERE "userId" = ${devUserId} LIMIT 1
      `
      if (raw[0]?.neededCategories) devNeededCategories = JSON.parse(raw[0].neededCategories)
    } catch { /* ignore */ }

    return (
      <DashboardContent
        data={{ ...devData, eventName, budget, guestCount }}
        eventName={eventName}
        eventDate={eventDate}
        daysUntil={daysUntil}
        neededCategories={devNeededCategories}
        budget={budget}
        guestCount={guestCount}
        coverColor={coverColor}
        plannerId={devPlannerId}
        workspaceId={devWorkspace.id}
      />
    )
  }

  // ── PRODUCTION ────────────────────────────────────────────────────────────
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id: plannerId } = await searchParams;
  const userId = session.user.id;

  const WORKSPACE_INCLUDE = {
    tasks:       { where: { completed: false } as const, orderBy: { dueDate: "asc" } as const, take: 10 },
    budgetItems: true as const,
    bookings:    { include: { vendor: { select: { name: true, category: true } } }, take: 10 },
    guests:      true as const,
  };

  // ── Toutes les requêtes DB en parallèle ─────────────────────────────────
  const [plannerRaw, workspaceRaw, user, unreadCount, neededCategoriesRaw] = await Promise.all([
    plannerId
      ? prisma.planner.findUnique({ where: { id: plannerId }, include: { budgetItems: true } }).catch(() => null)
      : Promise.resolve(null),
    prisma.workspace.findUnique({ where: { userId }, include: WORKSPACE_INCLUDE }),
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } }).catch(() => null),
    prisma.message.count({
      where: { read: false, senderId: { not: userId }, conversation: { clientId: userId } },
    }).catch(() => 0),
    prisma.$queryRaw<{ neededCategories: string }[]>`
      SELECT "neededCategories" FROM "Workspace" WHERE "userId" = ${userId} LIMIT 1
    `.catch(() => [] as { neededCategories: string }[]),
  ]);

  // ── Workspace (créer si absent) ─────────────────────────────────────────
  const workspace = workspaceRaw ?? await prisma.workspace.create({
    data: { userId },
    include: WORKSPACE_INCLUDE,
  });

  // ── Planner override (vérifier ownership) ────────────────────────────────
  let plannerOverride: {
    eventName: string
    eventDate: string | null
    budget: number | null
    budgetItems: DashboardData["budgetItems"]
    coverColor: string | null
  } | null = null

  if (plannerRaw && plannerRaw.userId === userId) {
    plannerOverride = {
      eventName: plannerRaw.coupleNames || plannerRaw.title || "Mon événement",
      eventDate: plannerRaw.weddingDate ? plannerRaw.weddingDate.toISOString() : null,
      budget: plannerRaw.budget,
      budgetItems: plannerRaw.budgetItems.map(b => ({
        id: b.id, category: b.category, label: b.label,
        estimated: b.estimated, actual: b.actual,
      })),
      coverColor: plannerRaw.coverColor,
    }
  }

  // ── Calcul des jours restants ────────────────────────────────────────────
  const rawDate = plannerOverride?.eventDate ?? (workspace.eventDate ? workspace.eventDate.toISOString() : null)
  const daysUntil = rawDate
    ? Math.max(0, Math.ceil((new Date(rawDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null

  const firstName = user?.name?.split(" ")[0] ?? null;

  let neededCategories: string[] = [];
  try {
    const raw = neededCategoriesRaw as { neededCategories: string }[]
    if (raw[0]?.neededCategories) neededCategories = JSON.parse(raw[0].neededCategories);
  } catch { /* ignore */ }

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
      workspaceId={workspace.id}
    />
  );
}

// ── Shared UI ────────────────────────────────────────────────────────────────

function DashboardContent({
  data, eventName, eventDate, daysUntil, neededCategories, budget, guestCount, coverColor, plannerId, workspaceId,
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
  workspaceId?: string
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
        plannerId={plannerId}
      />

<DashboardWidgets data={data} neededCategories={neededCategories} plannerId={plannerId} workspaceId={workspaceId} />
    </div>
  )
}
