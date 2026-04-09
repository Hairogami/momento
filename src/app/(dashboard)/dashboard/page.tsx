import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { type DashboardData } from "@/components/DashboardWidgets";
import DashboardWidgets from "@/components/DashboardWidgets";
import EventCard from "@/components/EventCard";
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
        budget={MOCK_WORKSPACE.budget}
        guestCount={MOCK_WORKSPACE.guestCount}
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
      budget={workspace.budget}
      guestCount={workspace.guestCount}
    />
  );
}

// ── Shared UI ────────────────────────────────────────────────────────────────

function DashboardContent({
  data, eventName, eventDate, daysUntil, neededCategories, budget, guestCount,
}: {
  data: DashboardData
  eventName: string
  eventDate: string | null
  daysUntil: number | null
  neededCategories: string[]
  budget: number | null
  guestCount: number | null
}) {
  return (
    <div className="p-6 w-full max-w-none space-y-6">
      <EventCard eventName={eventName} eventDate={eventDate} daysUntil={daysUntil} budget={budget} guestCount={guestCount} />

      <DashboardWidgets data={data} neededCategories={neededCategories} />
    </div>
  )
}
