import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Plus } from "lucide-react"
import { C } from "@/lib/colors"
import { MomentoLogo } from "@/components/MomentoLogo"
import { DarkModeToggle } from "@/components/DarkModeToggle"
import CalendarView from "@/components/CalendarView"

export default async function PlannerPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login?next=/planner")

  const workspace = await prisma.workspace.findUnique({
    where: { userId: session.user.id },
    include: { tasks: { orderBy: { dueDate: "asc" } } },
  })

  if (!workspace) redirect("/dashboard")

  const isGoogleUser = (session.user as { provider?: string }).provider === "google"

  const tasks = workspace.tasks.map(t => ({
    id: t.id,
    title: t.title,
    dueDate: t.dueDate ? t.dueDate.toISOString().slice(0, 10) : null,
    completed: t.completed,
    category: t.category,
  }))

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <nav className="border-b px-6 h-16 flex items-center justify-between sticky top-0 z-30"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}>
        <MomentoLogo iconSize={28} />
        <div className="flex items-center gap-3">
          <DarkModeToggle />
          <Link href={"/planner/" + workspace.id}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: C.terra, color: "var(--bg)" }}>
            <Plus size={15} /> Gérer les tâches
          </Link>
          <Link href="/dashboard" className="text-sm transition hover:opacity-70" style={{ color: C.mist }}>
            ← Mon espace
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="font-display text-4xl font-light mb-1"
            style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif", color: C.white, fontStyle: "italic" }}>
            Planning
          </h1>
          <p className="text-sm" style={{ color: C.mist }}>
            {tasks.filter(t => !t.completed).length} tâche{tasks.filter(t => !t.completed).length !== 1 ? "s" : ""} à venir
            {workspace.eventDate && " · Événement le " + new Date(workspace.eventDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
          </p>
        </div>

        <CalendarView
          tasks={tasks}
          eventDate={workspace.eventDate ? workspace.eventDate.toISOString() : null}
          eventName={workspace.eventName}
          isGoogleUser={isGoogleUser}
          workspaceId={workspace.id}
        />
      </div>
    </div>
  )
}
