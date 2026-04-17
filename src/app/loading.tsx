import PageSkeleton from "@/components/clone/PageSkeleton"

export default function Loading() {
  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 800, width: "100%" }}>
        <PageSkeleton variant="cards" />
      </div>
    </div>
  )
}
