"use client"

import CorporateTemplate from "./CorporateTemplate"
import type { MoodId, Palette } from "@/lib/eventSiteTokens"

/**
 * ConferenceTemplate = CorporateTemplate (même structure) pour la V1.
 * Les différences (sessions multi-jours, tabs par journée) arrivent en V2.
 * Pour l'instant : programme vertical + orateurs + partners = suffisant.
 */
export default function ConferenceTemplate(props: { slug: string; mood: MoodId; palette: Palette; content: Parameters<typeof CorporateTemplate>[0]["content"]; heroImageUrl?: string | null }) {
  return <CorporateTemplate {...props} />
}
