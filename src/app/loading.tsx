import { SkelBlock, SkelLine } from "@/components/skeleton/Skeleton"

/**
 * Fallback racine — neutre. S'affiche uniquement pour les routes
 * sans loading.tsx propre. Préfère créer un loading.tsx scoped
 * qui mime la structure de chaque route plutôt que tomber sur ce fallback.
 */
export default function Loading() {
  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "var(--dash-bg, #f7f7fb)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        <SkelBlock style={{ width: 72, height: 72, borderRadius: "50%" }} />
        <SkelLine width={200} height={14} delay={0.1} />
        <SkelLine width={140} height={10} delay={0.2} />
      </div>
    </div>
  )
}
