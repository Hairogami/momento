import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AddBudgetItem } from "./add-budget-item";
import { TogglePaid } from "./toggle-paid";
import { EditBudget } from "./edit-budget";
import Link from "next/link";
import { C } from "@/lib/colors";

const CATEGORIES: Record<string, string> = {
  venue:    "Salle",
  catering: "Traiteur",
  music:    "Musique",
  photo:    "Photo / Vidéo",
  deco:     "Décoration",
  makeup:   "Beauté",
  admin:    "Administratif",
  other:    "Autre",
};

function catLabel(key: string) {
  return CATEGORIES[key] ?? key;
}

export default async function BudgetPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { event: eventFilter } = await searchParams;

  const [workspace, planners] = await Promise.all([
    prisma.workspace.findUnique({
      where: { userId: session.user.id },
      include: {
        budgetItems: {
          orderBy: { createdAt: "asc" },
          include: {
            vendor:  { select: { name: true } },
            planner: { select: { id: true, coupleNames: true, title: true, coverColor: true } },
          },
        },
      },
    }),
    prisma.planner.findMany({
      where: { userId: session.user.id },
      select: { id: true, coupleNames: true, title: true, coverColor: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!workspace) redirect("/dashboard");

  // ── Gate : aucun événement créé ──────────────────────────────────────────
  if (planners.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center gap-6">
        <div className="text-5xl">📅</div>
        <div>
          <h1 className="text-xl font-semibold mb-2">Ton événement n&apos;est pas encore créé</h1>
          <p className="text-sm text-muted-foreground max-w-sm">
            Crée d&apos;abord ton événement — ton budget suivra.
            Chaque dépense sera rattachée à ton grand jour.
          </p>
        </div>
        <a
          href="/event/new"
          className="px-5 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
          style={{ backgroundColor: "var(--momento-terra)", color: "#fff" }}
        >
          Créer mon premier événement →
        </a>
      </div>
    )
  }

  // Filtrage
  const items = eventFilter
    ? workspace.budgetItems.filter(i => i.plannerId === eventFilter)
    : workspace.budgetItems;

  const totalEstimated = items.reduce((s, i) => s + i.estimated, 0);
  const totalActual    = items.reduce((s, i) => s + (i.actual ?? i.estimated), 0);
  const totalPaid      = items.filter(i => i.paid).reduce((s, i) => s + (i.actual ?? i.estimated), 0);
  const budget         = workspace.budget ?? 0;
  const overBudget     = budget > 0 && totalActual > budget;
  const pct            = budget > 0 ? Math.min(100, (totalActual / budget) * 100) : 0;

  const activePlanner  = eventFilter ? planners.find(p => p.id === eventFilter) : null;
  const activeColor    = activePlanner?.coverColor ?? null;

  // ── Groupements ─────────────────────────────────────────────────────────

  type GroupedSection = {
    key: string;
    label: string;
    color: string | null;
    categories: { key: string; label: string; items: typeof items }[];
  }

  let sections: GroupedSection[];

  if (eventFilter) {
    // Vue filtrée → groupement par catégorie uniquement
    const known = Object.keys(CATEGORIES);
    const cats = Object.entries(CATEGORIES)
      .map(([k, l]) => ({ key: k, label: l, items: items.filter(i => i.category === k) }))
      .filter(g => g.items.length > 0)
    const uncat = items.filter(i => !known.includes(i.category))
    if (uncat.length > 0) cats.push({ key: "other", label: "Autre", items: uncat })
    sections = [{
      key: eventFilter,
      label: activePlanner ? (activePlanner.coupleNames || activePlanner.title || "Événement") : "Événement",
      color: activeColor,
      categories: cats,
    }]
  } else {
    // Vue globale → grouper par planner d'abord, puis catégorie
    const plannerGroups: GroupedSection[] = planners.map(p => {
      const pItems = items.filter(i => i.plannerId === p.id)
      if (pItems.length === 0) return null
      const known = Object.keys(CATEGORIES)
      const cats = Object.entries(CATEGORIES)
        .map(([k, l]) => ({ key: k, label: l, items: pItems.filter(i => i.category === k) }))
        .filter(g => g.items.length > 0)
      const uncat = pItems.filter(i => !known.includes(i.category))
      if (uncat.length > 0) cats.push({ key: "other", label: "Autre", items: uncat })
      return {
        key: p.id,
        label: p.coupleNames || p.title || "Événement",
        color: p.coverColor,
        categories: cats,
      }
    }).filter(Boolean) as GroupedSection[]

    // Items sans planner → section "Non assigné"
    const unassigned = items.filter(i => !i.plannerId)
    if (unassigned.length > 0) {
      const known = Object.keys(CATEGORIES)
      const cats = Object.entries(CATEGORIES)
        .map(([k, l]) => ({ key: k, label: l, items: unassigned.filter(i => i.category === k) }))
        .filter(g => g.items.length > 0)
      const uncat = unassigned.filter(i => !known.includes(i.category))
      if (uncat.length > 0) cats.push({ key: "other", label: "Autre", items: uncat })
      plannerGroups.push({ key: "__none__", label: "Non assigné", color: null, categories: cats })
    }

    sections = plannerGroups
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {eventFilter && activePlanner
              ? (activePlanner.coupleNames || activePlanner.title || "Événement")
              : "Budget — Tous les événements"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {items.length} poste{items.length !== 1 ? "s" : ""}
            {!eventFilter && planners.length > 0 && ` · ${planners.length} événement${planners.length > 1 ? "s" : ""}`}
          </p>
        </div>
        <AddBudgetItem
          workspaceId={workspace.id}
          planners={planners}
          defaultPlannerId={eventFilter}
        />
      </div>

      {/* Event filter strip */}
      {planners.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Link
            href="/budget"
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              backgroundColor: !eventFilter ? C.terra : `${C.anthracite}80`,
              color: !eventFilter ? "#fff" : C.mist,
            }}
          >
            Tous
          </Link>
          {planners.map(p => {
            const label = p.coupleNames || p.title || "Événement";
            const active = eventFilter === p.id;
            return (
              <Link
                key={p.id}
                href={active ? "/budget" : `/budget?event=${p.id}`}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  backgroundColor: active ? (p.coverColor ?? C.terra) : `${C.anthracite}80`,
                  color: active ? "#fff" : C.mist,
                  border: active ? "none" : `1px solid ${C.anthracite}`,
                }}
              >
                {label}
              </Link>
            );
          })}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground font-normal flex items-center gap-2">
              Budget total
              <EditBudget workspaceId={workspace.id} current={budget} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">
              {budget > 0 ? `${budget.toLocaleString("fr-FR")} MAD` : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground font-normal">Prévu</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{totalEstimated.toLocaleString("fr-FR")} MAD</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground font-normal">Réel / dépensé</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-xl font-semibold ${overBudget ? "text-destructive" : ""}`}>
              {totalActual.toLocaleString("fr-FR")} MAD
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground font-normal">Payé</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold text-green-600">
              {totalPaid.toLocaleString("fr-FR")} MAD
            </p>
          </CardContent>
        </Card>
      </div>

      {budget > 0 && (
        <Card>
          <CardContent className="pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Budget utilisé</span>
              <span className={overBudget ? "text-destructive font-medium" : "font-medium"}>
                {Math.round(pct)}%
                {overBudget && ` (+${(totalActual - budget).toLocaleString("fr-FR")} MAD)`}
              </span>
            </div>
            <Progress value={pct} className={overBudget ? "[&>div]:bg-destructive" : ""} />
          </CardContent>
        </Card>
      )}

      {/* Sections */}
      {sections.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-sm text-muted-foreground">Aucune dépense pour l&apos;instant.</p>
            <p className="text-xs text-muted-foreground mt-1">Ajoute ton premier poste — DJ, traiteur, décor... →</p>
          </CardContent>
        </Card>
      ) : (
        sections.map(section => (
          <div key={section.key}>
            {/* En-tête de section planner (mode global uniquement) */}
            {!eventFilter && (
              <div
                className="flex items-center justify-between px-1 mb-3"
              >
                <div className="flex items-center gap-2">
                  {section.color && (
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: section.color }} />
                  )}
                  <h2 className="text-sm font-semibold" style={{ color: section.color ?? C.mist }}>
                    {section.label}
                  </h2>
                </div>
                <span className="text-xs" style={{ color: C.mist }}>
                  {section.categories.reduce((s, c) => s + c.items.reduce((ss, i) => ss + (i.actual ?? i.estimated), 0), 0).toLocaleString("fr-FR")} MAD
                </span>
              </div>
            )}

            {/* Catégories dans la section */}
            {section.categories.map(({ key, label, items: catItems }) => (
              <Card key={key} className="mb-3">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{catLabel(label)}</CardTitle>
                    <span className="text-xs text-muted-foreground">
                      {catItems.reduce((s, i) => s + (i.actual ?? i.estimated), 0).toLocaleString("fr-FR")} MAD
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {catItems.map(item => (
                    <div key={item.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                      <TogglePaid id={item.id} paid={item.paid} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${item.paid ? "line-through text-muted-foreground" : ""}`}>
                          {item.label}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {item.vendor && (
                            <span className="text-xs text-muted-foreground">{item.vendor.name}</span>
                          )}
                          {/* Badge planner uniquement en vue globale */}
                          {!eventFilter && item.planner && (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                              style={{
                                backgroundColor: `${item.planner.coverColor ?? C.terra}25`,
                                color: item.planner.coverColor ?? C.terra,
                              }}
                            >
                              {item.planner.coupleNames || item.planner.title || "Événement"}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-medium">
                          {(item.actual ?? item.estimated).toLocaleString("fr-FR")} MAD
                        </p>
                        {item.actual && item.actual !== item.estimated && (
                          <p className="text-xs text-muted-foreground line-through">
                            {item.estimated.toLocaleString("fr-FR")}
                          </p>
                        )}
                      </div>
                      {item.paid && (
                        <Badge variant="secondary" className="text-xs text-green-600 shrink-0">
                          Payé
                        </Badge>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
