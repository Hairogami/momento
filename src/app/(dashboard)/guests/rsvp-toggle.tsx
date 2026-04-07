"use client";

import { useTransition } from "react";
import { updateRsvp } from "./actions";
import { Badge } from "@/components/ui/badge";

const RSVP_CYCLE: Record<string, string> = {
  pending: "yes",
  yes: "no",
  no: "pending",
};

const RSVP_STYLE: Record<string, string> = {
  yes: "bg-green-100 text-green-700 border-green-200 hover:bg-green-200",
  no: "bg-red-100 text-red-700 border-red-200 hover:bg-red-200",
  pending: "bg-muted text-muted-foreground hover:bg-muted/80",
};

const RSVP_LABEL: Record<string, string> = {
  yes: "Confirmé",
  no: "Décliné",
  pending: "En attente",
};

export function RsvpToggle({ id, rsvp }: { id: string; rsvp: string }) {
  const [, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => updateRsvp(id, RSVP_CYCLE[rsvp] ?? "pending"))}
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors cursor-pointer ${RSVP_STYLE[rsvp] ?? RSVP_STYLE.pending}`}
    >
      {RSVP_LABEL[rsvp] ?? rsvp}
    </button>
  );
}
