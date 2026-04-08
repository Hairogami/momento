import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { type DashboardData } from "@/components/DashboardWidgets";
import EventsDashboard from "@/components/EventsDashboard";

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

  const neededCategories: string[] = workspace.neededCategories
    ? (() => { try { return JSON.parse(workspace.neededCategories) } catch { return [] } })()
    : []

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <EventsDashboard
        data={data}
        eventName={workspace.eventName}
        eventDate={workspace.eventDate ? workspace.eventDate.toISOString() : null}
        budget={workspace.budget}
        guestCount={workspace.guestCount}
        daysUntil={daysUntil}
        neededCategories={neededCategories}
      />
    </div>
  );
}
