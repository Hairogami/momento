import { requireSession } from "@/lib/devAuth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import CalendarView from "@/components/CalendarView"

export default async function PlannerPage() {
  const session = await requireSession()

  const [workspace, planners] = await Promise.all([
    prisma.workspace.findUnique({
      where: { userId: session.user.id },
      include: { tasks: { orderBy: { dueDate: "asc" } } },
    }),
    prisma.planner.findMany({
      where: { userId: session.user.id },
      select: { id: true, coverColor: true },
    }),
  ])

  if (!workspace) {
    await prisma.workspace.create({ data: { userId: session.user.id } })
    redirect("/planner")
  }

  // Map plannerId → color pour les bullets
  const colorMap = Object.fromEntries(planners.map(p => [p.id, p.coverColor]))

  const tasks = workspace.tasks.map(t => ({
    id: t.id,
    title: t.title,
    dueDate: t.dueDate ? t.dueDate.toISOString().slice(0, 10) : null,
    completed: t.completed,
    category: t.category,
    color: t.plannerId ? (colorMap[t.plannerId] ?? null) : null,
  }))

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Planning</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {tasks.filter(t => !t.completed).length} tâche{tasks.filter(t => !t.completed).length !== 1 ? "s" : ""} à venir
        </p>
      </div>

      <CalendarView
        tasks={tasks}
        eventDate={workspace.eventDate ? workspace.eventDate.toISOString() : null}
        eventName={workspace.eventName}
        isGoogleUser={false}
        workspaceId={workspace.id}
      />
    </div>
  )
}
