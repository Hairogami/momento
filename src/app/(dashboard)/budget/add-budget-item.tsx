"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { addBudgetItem } from "./actions";
import { C } from "@/lib/colors";

const CATEGORIES = [
  { value: "venue",    label: "Salle" },
  { value: "catering", label: "Traiteur" },
  { value: "music",    label: "Musique" },
  { value: "photo",    label: "Photo / Vidéo" },
  { value: "deco",     label: "Décoration" },
  { value: "makeup",   label: "Beauté" },
  { value: "admin",    label: "Administratif" },
  { value: "other",    label: "Autre" },
];

type Planner = { id: string; coupleNames: string | null; title: string | null };

const fieldStyle = { backgroundColor: C.ink, borderColor: C.anthracite, color: C.mist } as const;

export function AddBudgetItem({
  workspaceId,
  planners,
  defaultPlannerId,
}: {
  workspaceId: string;
  planners: Planner[];
  defaultPlannerId?: string;
}) {
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
      <DialogTrigger render={
        <Button size="sm" className="gap-1 border-0" style={{ backgroundColor: C.terra, color: "#fff" }} />
      }>
        <Plus className="h-4 w-4" />
        Ajouter
      </DialogTrigger>

      <DialogContent style={{ backgroundColor: C.dark, borderColor: C.anthracite }}>
        <DialogHeader>
          <DialogTitle style={{ color: "#fff" }}>Nouveau poste budgétaire</DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="workspaceId" value={workspaceId} />

          <div className="space-y-1.5">
            <Label style={{ color: C.mist }}>Libellé</Label>
            <Input name="label" placeholder="ex: Photographe" required style={fieldStyle} />
          </div>

          {planners.length > 0 && (
            <div className="space-y-1.5">
              <Label style={{ color: C.mist }}>Événement</Label>
              <Select name="plannerId" defaultValue={defaultPlannerId ?? planners[0]?.id} required>
                <SelectTrigger style={fieldStyle}>
                  <SelectValue placeholder="Choisir un événement" />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: C.dark, borderColor: C.anthracite }}>
                  {planners.map(p => (
                    <SelectItem key={p.id} value={p.id} style={{ color: C.mist }}>
                      {p.coupleNames || p.title || "Événement"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label style={{ color: C.mist }}>Catégorie</Label>
            <Select name="category" defaultValue="other">
              <SelectTrigger style={fieldStyle}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: C.dark, borderColor: C.anthracite }}>
                {CATEGORIES.map(c => (
                  <SelectItem key={c.value} value={c.value} style={{ color: C.mist }}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label style={{ color: C.mist }}>Budget estimé (MAD)</Label>
            <Input
              name="estimated"
              type="number"
              min="0"
              step="100"
              placeholder="0"
              required
              style={fieldStyle}
            />
          </div>

          <Button
            type="submit"
            className="w-full border-0"
            disabled={pending}
            style={{ backgroundColor: C.terra, color: "#fff" }}
          >
            {pending ? "Ajout..." : "Ajouter"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
