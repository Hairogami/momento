import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { C } from "@/lib/colors";
import DashboardWidgets, { type DashboardData } from "@/components/DashboardWidgets";
import EditEventInfo from "@/components/EditEventInfo";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Ensure workspace exists
  let workspace = await prisma.workspace.findUnique({
    where: { userId: session.user.id },
    include: {
      tasks: {
        where: { completed: false },
        orderBy: { dueDate: "asc" },
        take: 10,
      },
      budgetItems: true,
      bookings: {
        include: { vendor: { select: { name: true, category: true } } },
        take: 10,
      },
      guests: true,
    },
  });

  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: { userId: session.user.id },
      include: {
        tasks: {
          where: { completed: false },
          orderBy: { dueDate: "asc" },
          take: 10,
        },
        budgetItems: true,
        bookings: {
          include: { vendor: { select: { name: true, category: true } } },
          take: 10,
        },
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

  // Days until event
  let daysUntil: number | null = null;
  if (workspace.eventDate) {
    const diff = new Date(workspace.eventDate).getTime() - Date.now();
    daysUntil = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  const firstName =
    user?.firstName ??
    user?.name?.split(" ")[0] ??
    null;

  // Serialize data for client component (Dates → strings)
  const data: DashboardData = {
    firstName,
    eventName: workspace.eventName,
    eventDate: workspace.eventDate ? workspace.eventDate.toISOString() : null,
    budget: workspace.budget,
    guestCount: workspace.guestCount,
    tasks: workspace.tasks.map((t) => ({
      id: t.id,
      title: t.title,
      category: t.category,
      dueDate: t.dueDate ? t.dueDate.toISOString() : null,
      completed: t.completed,
    })),
    budgetItems: workspace.budgetItems.map((b) => ({
      id: b.id,
      category: b.category,
      label: b.label,
      estimated: b.estimated,
      actual: b.actual,
    })),
    bookings: workspace.bookings.map((b) => ({
      id: b.id,
      status: b.status,
      vendor: b.vendor ?? null,
    })),
    guests: workspace.guests.map((g) => ({
      id: g.id,
      rsvp: g.rsvp,
    })),
    unreadCount,
  };

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: C.white }}
          >
            Bonjour {firstName ?? "toi"} 👋
          </h1>
          <p className="text-sm mt-0.5 capitalize" style={{ color: C.mist }}>
            {today}
          </p>
          {workspace.eventDate && (
            <p className="text-sm mt-1" style={{ color: C.mist }}>
              📅{" "}
              <span style={{ color: C.terra }} className="font-medium">
                {workspace.eventName}
              </span>
              {daysUntil !== null && daysUntil > 0 && (
                <> — dans <span className="font-semibold" style={{ color: C.terra }}>{daysUntil} jour{daysUntil > 1 ? "s" : ""}</span></>
              )}
              {daysUntil === 0 && (
                <> — <span className="font-semibold" style={{ color: C.terra }}>c&apos;est aujourd&apos;hui !</span></>
              )}
            </p>
          )}
          <div className="mt-2">
            <EditEventInfo
              eventName={workspace.eventName}
              eventDate={workspace.eventDate ? workspace.eventDate.toISOString() : null}
              budget={workspace.budget}
              guestCount={workspace.guestCount}
            />
          </div>
        </div>

        {/* Event date badge */}
        {workspace.eventDate && (
          <div
            className="flex-shrink-0 rounded-2xl px-4 py-2 text-center hidden sm:block"
            style={{
              backgroundColor: `${C.terra}15`,
              border: `1px solid ${C.terra}30`,
            }}
          >
            <p className="text-xs font-medium" style={{ color: C.mist }}>
              Date
            </p>
            <p className="text-sm font-bold mt-0.5" style={{ color: C.terra }}>
              {new Date(workspace.eventDate).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
              })}
            </p>
            <p className="text-xs" style={{ color: C.mist }}>
              {new Date(workspace.eventDate).getFullYear()}
            </p>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px" style={{ backgroundColor: C.anthracite }} />

      {/* Widgets grid */}
      <DashboardWidgets data={data} />
    </div>
  );
}
