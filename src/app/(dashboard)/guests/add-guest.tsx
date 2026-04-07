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
import { Plus } from "lucide-react";
import { addGuest } from "./actions";

export function AddGuest({ workspaceId }: { workspaceId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await addGuest(formData);
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
          <DialogTitle>Nouvel invité</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="workspaceId" value={workspaceId} />
          <div className="space-y-1.5">
            <Label>Nom complet</Label>
            <Input name="name" placeholder="ex: Fatima Benali" required />
          </div>
          <div className="space-y-1.5">
            <Label>Email (optionnel)</Label>
            <Input name="email" type="email" placeholder="fatima@exemple.com" />
          </div>
          <div className="space-y-1.5">
            <Label>Téléphone (optionnel)</Label>
            <Input name="phone" placeholder="+212 6 00 00 00 00" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="plusOne" id="plusOne" className="rounded" />
            <Label htmlFor="plusOne" className="font-normal cursor-pointer">
              Accompagnateur (+1)
            </Label>
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Ajout..." : "Ajouter"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
