import { notFound } from "next/navigation"
import { IS_DEV } from "@/lib/devMock"
import PlaygroundClient from "./PlaygroundClient"

export const dynamic = "force-dynamic"

export default function EventSitePlaygroundPage() {
  // Guard: page accessible uniquement en dev local. Sur Vercel prod → 404.
  if (!IS_DEV) notFound()
  return <PlaygroundClient />
}
