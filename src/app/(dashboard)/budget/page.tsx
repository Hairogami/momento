import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AddBudgetItem } from "./add-budget-item";
import { TogglePaid } from "./toggle-paid";

const CATEGORIES: Record<string, string> = {
  venue: "Salle",
  catering: "Traiteur",
  music: "Musique",
  photo: "Photo / Vidéo",
  deco: "Décoration",
  makeup: "Beauté",
  admin: "Administratif",
  other: "Autre",
};

export default async function BudgetPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const workspace = await prisma.workspace.findUnique({
    where: { userId: session.user.id },
    include: {
      budgetItems: {
        orderBy: { createdAt: "asc" },
        include: { vendor: { select: { name: true } } },
      },
    },
  });

  if (!workspace) redirect("/dashboard");

  const items = workspace.budgetItems;
  const totalEstimated = items.reduce((s, i) => s + i.estimated, 0);
  const totalActual = items.reduce((s, i) => s + (i.actual ?? i.estimated), 0);
  const totalPaid = items.filter((i) => i.paid).reduce((s, i) => s + (i.actual ?? i.estimated), 0);
  const budget = workspace.budget ?? 0;
  const overBudget = budget > 0 && totalActual > budget;
  const pct = budget > 0 ? Math.min(100, (totalActual / budget) * 100) : 0;

  // Group by category
  const grouped = Object.entries(CATEGORIES).map(([key, label]) => ({
    key,
    label,
    items: items.filter((i) => i.category === key),
  })).filter((g) => g.items.length > 0);

  // Uncategorized
  const known = Object.keys(CATEGORIES);
  const other = items.filter((i) => !known.includes(i.category));
  if (other.length > 0) grouped.push({ key: "other", label: "Autre", items: other });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Budget</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {items.length} poste{items.length !== 1 ? "s" : ""}
          </p>
        </div>
        <AddBudgetItem workspaceId={workspace.id} />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground font-normal">Budget total</CardTitle>
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
              <span className="text-muted-foreground">Utilisation du budget</span>
              <span className={overBudget ? "text-destructive font-medium" : "font-medium"}>
                {Math.round(pct)}%
                {overBudget && ` (+${(totalActual - budget).toLocaleString("fr-FR")} MAD)`}
              </span>
            </div>
            <Progress value={pct} className={overBudget ? "[&>div]:bg-destructive" : ""} />
          </CardContent>
        </Card>
      )}

      {/* Items by category */}
      {grouped.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-sm text-muted-foreground">Aucun poste budgétaire.</p>
            <p className="text-xs text-muted-foreground mt-1">Cliquez sur « Ajouter » pour commencer.</p>
          </CardContent>
        </Card>
      ) : (
        grouped.map(({ key, label, items: catItems }) => (
          <Card key={key}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{label}</CardTitle>
                <span className="text-xs text-muted-foreground">
                  {catItems.reduce((s, i) => s + (i.actual ?? i.estimated), 0).toLocaleString("fr-FR")} MAD
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {catItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 py-2 border-b last:border-0"
                >
                  <TogglePaid id={item.id} paid={item.paid} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${item.paid ? "line-through text-muted-foreground" : ""}`}>
                      {item.label}
                    </p>
                    {item.vendor && (
                      <p className="text-xs text-muted-foreground">{item.vendor.name}</p>
                    )}
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
        ))
      )}
    </div>
  );
}
