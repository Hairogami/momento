"use client"

import Link from "next/link"
import { C } from "@/lib/colors"

type PlannerData = {
  id: string
  title: string
  coupleNames: string
  weddingDate: Date | null
  budget: number | null
  location: string | null
  coverColor: string
  createdAt: Date
  steps: { status: string }[]
}

export default function ProjectsTab({ planners }: { planners: PlannerData[] }) {
  if (planners.length === 0) {
    return (
      <div
        className="rounded-2xl p-10 text-center"
        style={{ backgroundColor: C.dark, border: `1px solid ${C.anthracite}` }}
      >
        <p className="text-3xl mb-4">🗂️</p>
        <h3 className="font-bold text-base mb-2" style={{ color: C.white }}>Aucun projet</h3>
        <p className="text-sm mb-6" style={{ color: C.mist }}>
          Vous n'avez pas encore créé de projet. Commencez à planifier votre événement.
        </p>
        <Link
          href="/dashboard"
          className="inline-block font-bold text-sm px-6 py-3 rounded-xl transition-all hover:opacity-90"
          style={{ backgroundColor: C.terra, color: "#fff" }}
        >
          Créer un projet
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-bold" style={{ color: C.white }}>
          Mes projets ({planners.length})
        </h2>
        <Link
          href="/dashboard"
          className="text-xs font-semibold transition-opacity hover:opacity-70"
          style={{ color: C.terra }}
        >
          Voir le dashboard →
        </Link>
      </div>

      {planners.map(planner => {
        const done  = planner.steps.filter(s => s.status === "done").length
        const total = planner.steps.length
        const pct   = total > 0 ? Math.round((done / total) * 100) : 0

        return (
          <Link
            key={planner.id}
            href={`/planner/${planner.id}`}
            className="flex items-start gap-4 p-5 rounded-2xl transition-all hover:-translate-y-0.5"
            style={{
              backgroundColor: C.dark,
              border: `1px solid ${C.anthracite}`,
              boxShadow: "0 2px 12px rgba(26,18,8,0.06)",
              textDecoration: "none",
            }}
          >
            {/* Color dot */}
            <div
              className="w-10 h-10 rounded-xl flex-shrink-0 mt-0.5"
              style={{ backgroundColor: planner.coverColor }}
            />

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm mb-0.5 truncate" style={{ color: C.white }}>
                {planner.title}
              </h3>
              <p className="text-xs mb-2" style={{ color: C.mist }}>
                {planner.coupleNames}
                {planner.weddingDate && (
                  <> · {new Date(planner.weddingDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</>
                )}
              </p>

              {total > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: C.anthracite }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: C.terra }}
                    />
                  </div>
                  <span className="text-xs flex-shrink-0" style={{ color: C.steel }}>
                    {done}/{total}
                  </span>
                </div>
              )}
            </div>

            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 mt-1">
              <path d="M5 2L11 8L5 14" stroke={C.steel} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        )
      })}
    </div>
  )
}
