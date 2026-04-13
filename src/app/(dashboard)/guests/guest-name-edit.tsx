"use client"
import { InlineEdit } from "@/components/InlineEdit"

export function GuestNameEdit({ id, name }: { id: string; name: string }) {
  return (
    <InlineEdit
      value={name}
      endpoint="/api/guests"
      id={id}
      field="name"
      placeholder="Nom de l'invité"
    />
  )
}
