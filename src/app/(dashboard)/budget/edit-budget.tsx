"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { C } from "@/lib/colors";
import { updateBudget } from "./actions";

export function EditBudget({ workspaceId, current }: { workspaceId: string; current: number }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await updateBudget(formData);
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <button
          className="p-1.5 rounded-lg transition-all hover:opacity-70"
          title="Modifier le budget total"
          style={{ color: C.terra }}
        />
      }>
        <Pencil size={14} />
      </DialogTrigger>
      <DialogContent style={{ backgroundColor: C.dark, borderColor: C.anthracite }}>
        <DialogHeader>
          <DialogTitle style={{ color: "#fff" }}>Modifier le budget total</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="workspaceId" value={workspaceId} />
          <div className="space-y-1.5">
            <Label style={{ color: C.mist }}>Budget total (MAD)</Label>
            <Input
              name="budget"
              type="number"
              min="0"
              step="1000"
              defaultValue={current > 0 ? current : ""}
              placeholder="ex: 150000"
              required
              style={{ backgroundColor: C.ink, borderColor: C.anthracite, color: C.mist }}
            />
          </div>
          <Button
            type="submit"
            disabled={pending}
            className="w-full border-0"
            style={{ backgroundColor: C.terra, color: "#fff" }}
          >
            {pending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
