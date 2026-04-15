import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import VendorEditForm from "./VendorEditForm"

export const dynamic = "force-dynamic"

export default async function AdminVendorEditPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const vendor = await prisma.vendor.findUnique({
    where: { slug },
    select: {
      id: true, slug: true, name: true, category: true, description: true,
      city: true, region: true, address: true,
      priceMin: true, priceMax: true, priceRange: true,
      phone: true, email: true, website: true, instagram: true, facebook: true,
      rating: true, verified: true, featured: true,
      media: { select: { id: true, url: true, order: true }, orderBy: { order: "asc" } },
    },
  })
  if (!vendor) notFound()

  const recentLogs = await prisma.adminAuditLog.findMany({
    where: { targetType: "Vendor", targetId: vendor.slug },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, adminEmail: true, action: true, changes: true, createdAt: true },
  })

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "28px 24px 80px" }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: 12, color: "#6a6a71", marginBottom: 12 }}>
        <Link href="/admin/vendors" style={{ color: "#6a6a71", textDecoration: "none" }}>
          ← Prestataires
        </Link>
        <span style={{ margin: "0 8px" }}>/</span>
        <span>{vendor.slug}</span>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "#121317", margin: 0 }}>
            {vendor.name}
          </h1>
          <p style={{ fontSize: 13, color: "#6a6a71", marginTop: 4 }}>
            {vendor.category}{vendor.city ? ` · ${vendor.city}` : ""}
          </p>
        </div>
        <Link
          href={`/vendor/${vendor.slug}`}
          target="_blank"
          style={{
            padding: "8px 16px", borderRadius: 10,
            background: "#fff", border: "1px solid rgba(183,191,217,0.3)",
            color: "#121317", fontSize: 12, fontWeight: 500, textDecoration: "none",
          }}
        >
          Voir fiche publique ↗
        </Link>
      </div>

      <VendorEditForm vendor={vendor} />

      {/* Audit log */}
      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "#121317", marginBottom: 10 }}>
          Historique des modifications
        </h2>
        {recentLogs.length === 0 ? (
          <p style={{ fontSize: 12, color: "#9a9aaa" }}>Aucune action enregistrée.</p>
        ) : (
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid rgba(183,191,217,0.2)" }}>
            {recentLogs.map(log => (
              <div key={log.id} style={{ padding: "12px 16px", borderBottom: "1px solid rgba(183,191,217,0.12)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "#121317", fontWeight: 500 }}>{log.action}</span>
                  <span style={{ color: "#9a9aaa" }}>
                    {new Date(log.createdAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "#6a6a71", marginTop: 2 }}>{log.adminEmail}</div>
                {log.changes && typeof log.changes === "object" && (
                  <pre style={{
                    fontSize: 11, color: "#45474D",
                    background: "#f7f7fb", padding: 8, borderRadius: 6,
                    marginTop: 6, overflow: "auto", maxHeight: 120,
                    fontFamily: "ui-monospace, monospace",
                  }}>
                    {JSON.stringify(log.changes, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
