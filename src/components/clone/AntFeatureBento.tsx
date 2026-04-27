"use client"
import Link from "next/link"

// ── Données features Momento ──────────────────────────────────────────────────
const FEATURES = [
  {
    title: "Site événement",
    href: "/dashboard/event-site",
    desc: "Ta page de mariage prête en 2 minutes.",
    preview: <SiteMockup />,
  },
  {
    title: "Prestataires",
    href: "/explore",
    desc: "1 000+ pros vérifiés, 41 villes.",
    preview: <VendorMockup />,
  },
  {
    title: "Invitations & RSVP",
    href: "/dashboard/event-site",
    desc: "Partage RSVP, programme et photos.",
    preview: <RsvpMockup />,
  },
  {
    title: "Invités",
    href: "/guests",
    desc: "RSVP, tables et régimes — tout en un.",
    preview: <GuestMockup />,
  },
  {
    title: "Budget",
    href: "/budget",
    desc: "Chaque dirham, sous contrôle.",
    preview: <BudgetMockup />,
  },
  {
    title: "Checklist",
    href: "/planner",
    desc: "Ne rate aucune étape du grand jour.",
    preview: <ChecklistMockup />,
  },
]

// ── Mockups CSS ───────────────────────────────────────────────────────────────
function SiteMockup() {
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: "12px 14px", boxShadow: "0 2px 16px rgba(0,0,0,0.10)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b" }} />
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
        <div style={{ flex: 1, height: 20, borderRadius: 6, background: "#f3f4f6", display: "flex", alignItems: "center", paddingLeft: 8 }}>
          <span style={{ fontSize: "var(--text-2xs)", color: "#9ca3af", fontFamily: "monospace" }}>yazid-sarah.momentoevents.app</span>
        </div>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: "linear-gradient(90deg,#E11D48,#9333EA)", width: "70%", marginBottom: 6 }} />
      <div style={{ height: 4, borderRadius: 99, background: "#e5e7eb", width: "50%", marginBottom: 4 }} />
      <div style={{ height: 4, borderRadius: 99, background: "#e5e7eb", width: "80%", marginBottom: 10 }} />
      <div style={{ height: 28, borderRadius: 8, background: "linear-gradient(90deg,#E11D48,#9333EA)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: "var(--text-2xs)", color: "#fff", fontWeight: 600 }}>RSVP →</span>
      </div>
    </div>
  )
}

function VendorMockup() {
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: "12px 14px", boxShadow: "0 2px 16px rgba(0,0,0,0.10)" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#E11D48,#9333EA)", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 8, borderRadius: 99, background: "#111", width: "60%", marginBottom: 4 }} />
          <div style={{ display: "flex", gap: 2 }}>
            {"★★★★★".split("").map((s, i) => <span key={i} style={{ fontSize: "var(--text-2xs)", color: "#f59e0b" }}>{s}</span>)}
          </div>
        </div>
        <div style={{ background: "rgba(225,29,72,0.1)", borderRadius: 6, padding: "2px 6px" }}>
          <span style={{ fontSize: "var(--text-2xs)", color: "#E11D48", fontWeight: 600 }}>Pro</span>
        </div>
      </div>
      <div style={{ height: 4, borderRadius: 99, background: "#e5e7eb", width: "90%", marginBottom: 4 }} />
      <div style={{ height: 4, borderRadius: 99, background: "#e5e7eb", width: "60%", marginBottom: 4 }} />
      <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
        <div style={{ flex: 1, height: 22, borderRadius: 6, background: "#f3f4f6" }} />
        <div style={{ flex: 1, height: 22, borderRadius: 6, background: "linear-gradient(90deg,#E11D48,#9333EA)" }} />
      </div>
    </div>
  )
}

function RsvpMockup() {
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: "12px 14px", boxShadow: "0 2px 16px rgba(0,0,0,0.10)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg,#E11D48,#9333EA)" }} />
        <div>
          <div style={{ height: 7, borderRadius: 99, background: "#111", width: 80, marginBottom: 3 }} />
          <div style={{ height: 5, borderRadius: 99, background: "#d1d5db", width: 60 }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
        {["Confirmé ✓", "En attente", "Décliné"].map((s, i) => (
          <div key={i} style={{ flex: 1, padding: "3px 0", borderRadius: 6, background: i === 0 ? "rgba(34,197,94,0.12)" : "#f3f4f6", textAlign: "center" }}>
            <span style={{ fontSize: "var(--text-2xs)", color: i === 0 ? "#16a34a" : "#6b7280" }}>{s}</span>
          </div>
        ))}
      </div>
      <div style={{ height: 4, borderRadius: 99, background: "#e5e7eb", overflow: "hidden" }}>
        <div style={{ height: "100%", width: "68%", background: "linear-gradient(90deg,#22c55e,#16a34a)" }} />
      </div>
    </div>
  )
}

function GuestMockup() {
  const guests = ["S","M","L","K","A"]
  const colors = ["#E11D48","#9333EA","#0EA5E9","#10B981","#F97316"]
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: "12px 14px", boxShadow: "0 2px 16px rgba(0,0,0,0.10)" }}>
      <div style={{ display: "flex", marginBottom: 10 }}>
        {guests.map((g, i) => (
          <div key={i} style={{ width: 28, height: 28, borderRadius: "50%", background: colors[i], border: "2px solid #fff", marginLeft: i === 0 ? 0 : -8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-2xs)", fontWeight: 700, color: "#fff" }}>{g}</div>
        ))}
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#f3f4f6", border: "2px solid #fff", marginLeft: -8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-2xs)", color: "#6b7280", fontWeight: 600 }}>+42</div>
      </div>
      <div style={{ height: 4, borderRadius: 99, background: "#e5e7eb", width: "90%", marginBottom: 4 }} />
      <div style={{ height: 4, borderRadius: 99, background: "#e5e7eb", width: "70%", marginBottom: 8 }} />
      <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(225,29,72,0.08)", borderRadius: 6, padding: "3px 8px" }}>
        <span style={{ fontSize: "var(--text-2xs)", color: "#E11D48", fontWeight: 600 }}>🔔 3 réponses en attente</span>
      </div>
    </div>
  )
}

function BudgetMockup() {
  const items = [
    { label: "Traiteur", pct: 65, color: "#E11D48" },
    { label: "Photos", pct: 42, color: "#9333EA" },
    { label: "Salle", pct: 88, color: "#0EA5E9" },
  ]
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: "12px 14px", boxShadow: "0 2px 16px rgba(0,0,0,0.10)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span style={{ fontSize: "var(--text-2xs)", color: "#6b7280" }}>Budget total</span>
        <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "#111" }}>120 000 Dhs</span>
      </div>
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ fontSize: "var(--text-2xs)", color: "#374151" }}>{item.label}</span>
            <span style={{ fontSize: "var(--text-2xs)", color: "#6b7280" }}>{item.pct}%</span>
          </div>
          <div style={{ height: 4, borderRadius: 99, background: "#f3f4f6", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${item.pct}%`, background: item.color, borderRadius: 99 }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function ChecklistMockup() {
  const tasks = [
    { done: true, label: "Réserver la salle" },
    { done: true, label: "Choisir le traiteur" },
    { done: false, label: "Envoyer les faire-part" },
    { done: false, label: "Confirmer le DJ" },
  ]
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: "12px 14px", boxShadow: "0 2px 16px rgba(0,0,0,0.10)" }}>
      {tasks.map((t, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: i < tasks.length - 1 ? 6 : 0, marginBottom: i < tasks.length - 1 ? 6 : 0, borderBottom: i < tasks.length - 1 ? "1px solid #f3f4f6" : "none" }}>
          <div style={{ width: 14, height: 14, borderRadius: 4, flexShrink: 0, border: t.done ? "none" : "1.5px solid #d1d5db", background: t.done ? "#22c55e" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {t.done && <span style={{ fontSize: "var(--text-2xs)", color: "#fff" }}>✓</span>}
          </div>
          <span style={{ fontSize: "var(--text-2xs)", color: t.done ? "#9ca3af" : "#111", textDecoration: t.done ? "line-through" : "none" }}>{t.label}</span>
        </div>
      ))}
    </div>
  )
}

// ── Composant principal ───────────────────────────────────────────────────────
export default function AntFeatureBento() {
  return (
    <section
      style={{
        background: "#0e0e0e",
        padding: "clamp(64px,8vw,96px) clamp(20px,5vw,80px)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: "clamp(40px,6vw,80px)",
          alignItems: "start",
        }}
        className="ant-bento-root"
      >
        {/* ── Texte gauche ── */}
        <div style={{ position: "sticky", top: 80 }}>
          <p
            style={{
              fontSize: "clamp(1.6rem, 0.6rem + 2.4vw, 3.4rem)",
              fontWeight: 500,
              lineHeight: 1.2,
              color: "#f5f5f5",
              margin: "0 0 16px",
              letterSpacing: "-0.02em",
            }}
          >
            Tout ce qu&apos;il te faut pour organiser{" "}
            <span
              style={{
                background: "linear-gradient(90deg,#E11D48,#9333EA)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              le mariage que tu veux.
            </span>
          </p>
          <p
            style={{
              fontSize: "clamp(0.9rem, 0.5rem + 0.9vw, 1.3rem)",
              color: "rgba(255,255,255,0.4)",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Pour chaque jour jusqu&apos;au grand jour.
          </p>
        </div>

        {/* ── Grille 3×2 ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}
          className="ant-bento-grid"
        >
          {FEATURES.map((f, i) => (
            <Link
              key={i}
              href={f.href}
              style={{ textDecoration: "none" }}
            >
              <div
                className="ant-bento-card"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 18,
                  padding: "18px 16px 14px",
                  cursor: "pointer",
                  transition: "background 0.2s, border-color 0.2s, transform 0.2s",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.background = "rgba(255,255,255,0.07)"
                  el.style.borderColor = "rgba(255,255,255,0.14)"
                  el.style.transform = "translateY(-2px)"
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.background = "rgba(255,255,255,0.04)"
                  el.style.borderColor = "rgba(255,255,255,0.07)"
                  el.style.transform = "translateY(0)"
                }}
              >
                {/* Titre + flèche */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span
                    style={{
                      fontSize: "clamp(0.85rem, 0.5rem + 0.85vw, 1.3rem)",
                      fontWeight: 600,
                      color: "#f5f5f5",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {f.title}
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "var(--text-sm)" }}>→</span>
                </div>

                {/* Description */}
                <p
                  style={{
                    fontSize: "clamp(0.7rem, 0.4rem + 0.65vw, 1.05rem)",
                    color: "rgba(255,255,255,0.4)",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {f.desc}
                </p>

                {/* Mockup preview */}
                <div style={{ marginTop: 4 }}>
                  {f.preview}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Responsive ── */}
      <style>{`
        @media (max-width: 860px) {
          .ant-bento-root { grid-template-columns: 1fr !important; }
          .ant-bento-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 520px) {
          .ant-bento-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
