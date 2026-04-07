"use client";

import { useTransition } from "react";
import { togglePaid } from "./actions";

export function TogglePaid({ id, paid }: { id: string; paid: boolean }) {
  const [, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => togglePaid(id, !paid))}
      className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors ${
        paid
          ? "bg-green-500 border-green-500 text-white"
          : "border-muted-foreground/30 hover:border-green-400"
      }`}
      title={paid ? "Marquer non payé" : "Marquer payé"}
    >
      {paid && (
        <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="2,6 5,9 10,3" />
        </svg>
      )}
    </button>
  );
}
