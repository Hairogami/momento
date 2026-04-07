import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Créer le workspace si première visite
  let workspace = await prisma.workspace.findUnique({
    where: { userId: session.user.id },
    include: {
      tasks: { where: { completed: false }, take: 5 },
      budgetItems: true,
      bookings: true,
    },
  });

  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: { userId: session.user.id },
      include: {
        tasks: { where: { completed: false }, take: 5 },
        budgetItems: true,
        bookings: true,
      },
    });
  }

  const budgetSpent = workspace.budgetItems.reduce(
    (sum, item) => sum + (item.actual ?? item.estimated),
    0
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{workspace.eventName}</h1>
        {workspace.eventDate && (
          <p className="text-muted-foreground text-sm mt-1">
            {new Date(workspace.eventDate).toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal">Budget dépensé</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{budgetSpent.toLocaleString("fr-FR")} €</p>
            {workspace.budget && (
              <p className="text-xs text-muted-foreground">/ {workspace.budget.toLocaleString("fr-FR")} €</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal">Tâches en cours</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{workspace.tasks.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal">Prestataires</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{workspace.bookings.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal">Invités</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{workspace.guestCount ?? "—"}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Prochaines tâches</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {workspace.tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune tâche pour le moment.</p>
          ) : (
            workspace.tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between py-1">
                <span className="text-sm">{task.title}</span>
                {task.category && (
                  <Badge variant="secondary" className="text-xs">{task.category}</Badge>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
