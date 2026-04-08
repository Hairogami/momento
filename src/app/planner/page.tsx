import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Plus, CalendarDays, Clock, CheckCircle2 } from "lucide-react"
import { DarkModeToggle } from "@/components/DarkModeToggle"
import { C } from "@/lib/colors"
import { MomentoLogo } from "@/components/MomentoLogo"

export default async function PlannerIndexPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login?next=/planner")

  const workspace = await prisma.workspace.findUnique({
    where: { userId: session.user.id },
    include: {
      tasks: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  })

  if (!workspace) redirect("/dashboard")

  const tasks = workspace.tasks
  const done = tasks.filter(t => t.completed)
  const todo = tasks.filter(t => !t.completed)

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.ink }}>
      <nav
        className="border-b px-6 h-16 flex items-center justify-between"
        style={{ borderColor: C.anthracite, backgroundColor: C.ink }}
      >
        <MomentoLogo iconSize={28} />
        <div className="flex items-center gap-3">
          <DarkModeToggle />
          <Link href="/dashboard" className="text-sm" style={{ color: C.mist }}>
            ← Mon espace
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: C.white }}>Planning</h1>
            <p className="text-sm" style={{ color: C.mist }}>
              {tasks.length} tâche{tasks.length !== 1 ? "s" : ""} · {done.length} terminée{done.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href={`/planner/${workspace.id}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: C.terra, color: "#fff" }}
          >
            <Plus size={15} /> Gérer les tâches
          </Link>
        </div>

        {tasks.length === 0 ? (
          <div
            className="rounded-2xl p-12 text-center"
            style={{ backgroundColor: C.dark, border: `1px solid ${C.anthracite}` }}
          >
            <CalendarDays size={40} className="mx-auto mb-4" style={{ color: C.mist }} />
            <p className="font-semibold text-base mb-2" style={{ color: C.white }}>Aucune tâche pour l&apos;instant</p>
            <p className="text-sm mb-6" style={{ color: C.mist }}>
              Commencez à organiser votre événement étape par étape.
            </p>
            <Link
              href={`/planner/${workspace.id}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: C.terra, color: "#fff" }}
            >
              <Plus size={15} /> Créer ma première tâche
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {/* À faire */}
            <div className="rounded-2xl p-5" style={{ backgroundColor: C.dark, border: `1px solid ${C.anthracite}` }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: C.terra }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.mist }}>
                  À faire ({todo.length})
                </span>
              </div>
              <div className="space-y-2">
                {todo.slice(0, 8).map(t => (
                  <div key={t.id} className="flex items-start gap-2 py-1.5">
                    <Clock size={14} className="mt-0.5 shrink-0" style={{ color: C.mist }} />
                    <div>
                      <p className="text-sm" style={{ color: C.white }}>{t.title}</p>
                      {t.category && (
                        <p className="text-xs mt-0.5" style={{ color: C.mist }}>{t.category}</p>
                      )}
                    </div>
                  </div>
                ))}
                {todo.length === 0 && (
                  <p className="text-xs italic py-2" style={{ color: C.mist }}>Toutes les tâches sont terminées 🎉</p>
                )}
              </div>
            </div>

            {/* Terminées */}
            <div className="rounded-2xl p-5" style={{ backgroundColor: C.dark, border: `1px solid ${C.anthracite}` }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#10B981" }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.mist }}>
                  Terminées ({done.length})
                </span>
              </div>
              <div className="space-y-2">
                {done.slice(0, 8).map(t => (
                  <div key={t.id} className="flex items-start gap-2 py-1.5">
                    <CheckCircle2 size={14} className="mt-0.5 shrink-0" style={{ color: "#10B981" }} />
                    <p className="text-sm line-through opacity-60" style={{ color: C.white }}>{t.title}</p>
                  </div>
                ))}
                {done.length === 0 && (
                  <p className="text-xs italic py-2" style={{ color: C.mist }}>Aucune tâche terminée</p>
                )}
              </div>
            </div>
          </div>
        )}

        {tasks.length > 0 && (
          <div className="mt-6 text-center">
            <Link
              href={`/planner/${workspace.id}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: C.terra, color: "#fff" }}
            >
              <CalendarDays size={15} /> Ouvrir le planning complet
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
