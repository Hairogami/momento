"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { addBudgetItem } from "./actions";

const CATEGORIES = [
  { value: "venue", label: "Salle" },
  { value: "catering", label: "Traiteur" },
  { value: "music", label: "Musique" },
  { value: "photo", label: "Photo / Vidéo" },
  { value: "deco", label: "Décoration" },
  { value: "makeup", label: "Beauté" },
  { value: "admin", label: "Administratif" },
  { value: "other", label: "Autre" },
];

export function AddBudgetItem({ workspaceId }: { workspaceId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await addBudgetItem(formData);
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" className="gap-1" />}>
        <Plus className="h-4 w-4" />
        Ajouter
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouveau poste budgétaire</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="workspaceId" value={workspaceId} />
          <div className="space-y-1.5">
            <Label>Libellé</Label>
            <Input name="label" placeholder="ex: Photographe" required />
          </div>
          <div className="space-y-1.5">
            <Label>Catégorie</Label>
            <Select name="category" defaultValue="other">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Budget estimé (MAD)</Label>
            <Input name="estimated" type="number" min="0" step="100" placeholder="0" required />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Ajout..." : "Ajouter"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
