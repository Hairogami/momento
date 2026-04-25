import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import VendorEditForm from "./VendorEditForm"
import VendorDeleteButton from "./VendorDeleteButton"
import CalendarWidget from "@/components/vendor/calendar/CalendarWidget"

export const dynamic = "force-dynamic"

const C = {
  bg:         "#0b0b10",
  panel:      "#15161d",
  panelHover: "#1c1d27",
  border:     "#252633",
  borderSoft: "rgba(255,255,255,0.06)",
  text:       "#f0f0f5",
  textMuted:  "#9a9aaa",
  textDim:    "#6a6a78",
  accent:     "#9333EA",
  accent2:    "#E11D48",
  err:        "#ef4444",
}

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
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "28px 24px 80px", color: C.text, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: 12, color: C.textDim, marginBottom: 12 }}>
        <Link href="/admin/vendors" style={{ color: C.textDim, textDecoration: "none" }}>
          ← Prestataires
        </Link>
        <span style={{ margin: "0 8px" }}>/</span>
        <span style={{ color: C.textMuted }}>{vendor.slug}</span>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, margin: 0, letterSpacing: "-0.02em" }}>
            {vendor.name}
          </h1>
          <p style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>
            {vendor.category}{vendor.city ? ` · ${vendor.city}` : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link
            href={`/vendor/${vendor.slug}`}
            target="_blank"
            style={{
              padding: "8px 16px", borderRadius: 10,
              background: C.panel, border: `1px solid ${C.border}`,
              color: C.text, fontSize: 12, fontWeight: 500, textDecoration: "none",
            }}
          >
            Voir fiche publique ↗
          </Link>
          <VendorDeleteButton slug={vendor.slug} name={vendor.name} />
        </div>
      </div>

      <VendorEditForm vendor={vendor} />

      {/* Calendrier — édition admin (bloque/débloque pour le compte du prestataire) */}
      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 10 }}>
          Calendrier du prestataire
        </h2>
        <p style={{ fontSize: 12, color: C.textMuted, marginBottom: 12 }}>
          Toute modification est auditée (AdminAuditLog). Utilise ceci quand le prestataire
          t&apos;appelle pour ajouter/retirer une date.
        </p>
        <CalendarWidget slugOverride={vendor.slug} isAdminMode />
      </section>

      {/* Audit log */}
      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 10 }}>
          Historique des modifications
        </h2>
        {recentLogs.length === 0 ? (
          <p style={{ fontSize: 12, color: C.textDim }}>Aucune action enregistrée.</p>
        ) : (
          <div style={{ background: C.panel, borderRadius: 12, border: `1px solid ${C.border}` }}>
            {recentLogs.map(log => (
              <div key={log.id} style={{ padding: "12px 16px", borderBottom: `1px solid ${C.borderSoft}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: C.text, fontWeight: 600 }}>{log.action}</span>
                  <span style={{ color: C.textDim }}>
                    {new Date(log.createdAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{log.adminEmail}</div>
                {log.changes && typeof log.changes === "object" && (
                  <pre style={{
                    fontSize: 11, color: C.textMuted,
                    background: C.bg, padding: 8, borderRadius: 6,
                    marginTop: 6, overflow: "auto", maxHeight: 120,
                    fontFamily: "ui-monospace, monospace",
                    border: `1px solid ${C.borderSoft}`,
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
