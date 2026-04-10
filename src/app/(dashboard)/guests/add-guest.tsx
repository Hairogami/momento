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
import { C } from "@/lib/colors";

const fieldStyle = { backgroundColor: C.ink, borderColor: C.anthracite, color: C.mist } as const;

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
      <DialogTrigger render={<Button size="sm" className="gap-1 border-0" style={{ backgroundColor: C.terra, color: "#fff" }} />}>
        <Plus className="h-4 w-4" />
        Ajouter
      </DialogTrigger>
      <DialogContent style={{ backgroundColor: C.dark, borderColor: C.anthracite }}>
        <DialogHeader>
          <DialogTitle style={{ color: "#fff" }}>Nouvel invité</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="workspaceId" value={workspaceId} />
          <div className="space-y-1.5">
            <Label style={{ color: C.mist }}>Nom complet</Label>
            <Input name="name" placeholder="ex: Fatima Benali" required style={fieldStyle} />
          </div>
          <div className="space-y-1.5">
            <Label style={{ color: C.mist }}>Email (optionnel)</Label>
            <Input name="email" type="email" placeholder="fatima@exemple.com" style={fieldStyle} />
          </div>
          <div className="space-y-1.5">
            <Label style={{ color: C.mist }}>Téléphone (optionnel)</Label>
            <Input name="phone" placeholder="+212 6 00 00 00 00" style={fieldStyle} />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="plusOne"
              id="plusOne"
              className="rounded"
              style={{ accentColor: C.terra }}
            />
            <Label htmlFor="plusOne" className="font-normal cursor-pointer" style={{ color: C.mist }}>
              Accompagnateur (+1)
            </Label>
          </div>
          <Button type="submit" className="w-full border-0" disabled={pending}
            style={{ backgroundColor: C.terra, color: "#fff" }}>
            {pending ? "Ajout..." : "Ajouter"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
