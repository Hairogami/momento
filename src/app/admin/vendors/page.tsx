import { prisma } from "@/lib/prisma"
import Link from "next/link"

export const dynamic = "force-dynamic"

type SearchParams = Promise<{ q?: string; page?: string; cat?: string }>

const PAGE_SIZE = 25

export default async function AdminVendorsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams
  const q        = (sp.q ?? "").trim()
  const category = (sp.cat ?? "").trim()
  const page     = Math.max(1, parseInt(sp.page ?? "1", 10) || 1)

  const where = {
    AND: [
      q
        ? {
            OR: [
              { name:     { contains: q, mode: "insensitive" as const } },
              { slug:     { contains: q, mode: "insensitive" as const } },
              { category: { contains: q, mode: "insensitive" as const } },
              { city:     { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {},
      category ? { category } : {},
    ],
  }

  const [total, rows, categories] = await Promise.all([
    prisma.vendor.count({ where }),
    prisma.vendor.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true, slug: true, name: true, category: true, city: true,
        rating: true, verified: true, phone: true, instagram: true,
        _count: { select: { media: true } },
      },
    }),
    prisma.vendor.findMany({
      distinct: ["category"],
      select: { category: true },
      orderBy: { category: "asc" },
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <main style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 24px 64px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "#121317", margin: 0 }}>Prestataires</h1>
          <p style={{ fontSize: 13, color: "#6a6a71", marginTop: 4 }}>
            {total} résultat{total > 1 ? "s" : ""} · page {page}/{totalPages}
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <form method="GET" style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Rechercher nom, slug, catégorie, ville…"
          style={{
            flex: 1, height: 38, padding: "0 14px", borderRadius: 10,
            border: "1px solid rgba(183,191,217,0.35)", background: "#fff",
            fontSize: 13, outline: "none", fontFamily: "inherit",
          }}
        />
        <select
          name="cat"
          defaultValue={category}
          style={{
            height: 38, padding: "0 14px", borderRadius: 10,
            border: "1px solid rgba(183,191,217,0.35)", background: "#fff",
            fontSize: 13, fontFamily: "inherit", minWidth: 180,
          }}
        >
          <option value="">Toutes catégories</option>
          {categories.map(c => (
            <option key={c.category} value={c.category}>{c.category}</option>
          ))}
        </select>
        <button
          type="submit"
          style={{
            height: 38, padding: "0 20px", borderRadius: 10,
            background: "linear-gradient(135deg,#E11D48,#9333EA)", color: "#fff",
            border: "none", fontSize: 13, fontWeight: 500, cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Filtrer
        </button>
        {(q || category) && (
          <Link
            href="/admin/vendors"
            style={{
              height: 38, padding: "0 16px", borderRadius: 10,
              border: "1px solid rgba(225,29,72,0.3)", color: "#E11D48",
              fontSize: 12, display: "flex", alignItems: "center",
              textDecoration: "none", fontFamily: "inherit",
            }}
          >
            ✕ Reset
          </Link>
        )}
      </form>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid rgba(183,191,217,0.2)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f4f4f8", borderBottom: "1px solid rgba(183,191,217,0.2)" }}>
              <th style={thStyle}>Nom</th>
              <th style={thStyle}>Catégorie</th>
              <th style={thStyle}>Ville</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Note</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Photos</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Contact</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Vérifié</th>
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: "40px 20px", textAlign: "center", color: "#9a9aaa" }}>
                  Aucun prestataire
                </td>
              </tr>
            ) : rows.map(v => (
              <tr key={v.id} style={{ borderBottom: "1px solid rgba(183,191,217,0.14)" }}>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 500, color: "#121317" }}>{v.name}</div>
                  <div style={{ fontSize: 11, color: "#9a9aaa", marginTop: 2 }}>{v.slug}</div>
                </td>
                <td style={tdStyle}>{v.category}</td>
                <td style={tdStyle}>{v.city ?? "—"}</td>
                <td style={{ ...tdStyle, textAlign: "center" }}>{v.rating?.toFixed(1) ?? "—"}</td>
                <td style={{ ...tdStyle, textAlign: "center" }}>{v._count.media}</td>
                <td style={{ ...tdStyle, textAlign: "center" }}>
                  <span style={{ color: v.phone     ? "#22c55e" : "#e4e4eb", marginRight: 6 }} title="Téléphone">☎</span>
                  <span style={{ color: v.instagram ? "#22c55e" : "#e4e4eb" }}                      title="Instagram">Ⓘ</span>
                </td>
                <td style={{ ...tdStyle, textAlign: "center" }}>
                  {v.verified ? <span style={{ color: "#22c55e" }}>✓</span> : <span style={{ color: "#e4e4eb" }}>—</span>}
                </td>
                <td style={{ ...tdStyle, textAlign: "right" }}>
                  <Link
                    href={`/admin/vendors/${v.slug}`}
                    style={{
                      padding: "6px 14px", borderRadius: 8,
                      background: "#f4f4f8", color: "#121317",
                      fontSize: 12, fontWeight: 500, textDecoration: "none",
                    }}
                  >
                    Éditer →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 20 }}>
          <PageLink q={q} cat={category} page={Math.max(1, page - 1)} disabled={page === 1}>←</PageLink>
          <span style={{ padding: "8px 14px", fontSize: 13, color: "#6a6a71" }}>
            {page} / {totalPages}
          </span>
          <PageLink q={q} cat={category} page={Math.min(totalPages, page + 1)} disabled={page === totalPages}>→</PageLink>
        </div>
      )}
    </main>
  )
}

function PageLink({ q, cat, page, disabled, children }: {
  q: string; cat: string; page: number; disabled: boolean; children: React.ReactNode
}) {
  const params = new URLSearchParams()
  if (q) params.set("q", q)
  if (cat) params.set("cat", cat)
  params.set("page", String(page))
  const href = `/admin/vendors?${params.toString()}`
  const style = {
    padding: "8px 14px", borderRadius: 8, fontSize: 13,
    background: "#fff", border: "1px solid rgba(183,191,217,0.3)",
    color: disabled ? "#cfd3dc" : "#121317",
    textDecoration: "none",
    pointerEvents: disabled ? ("none" as const) : ("auto" as const),
  }
  return disabled ? <span style={style}>{children}</span> : <Link href={href} style={style}>{children}</Link>
}

const thStyle: React.CSSProperties = {
  padding: "10px 14px", textAlign: "left", fontSize: 11,
  fontWeight: 600, color: "#6a6a71", textTransform: "uppercase", letterSpacing: "0.04em",
}
const tdStyle: React.CSSProperties = {
  padding: "12px 14px", color: "#45474D", verticalAlign: "middle",
}
