"use client"
import { useState } from "react"
import Link from "next/link"
import AntNav from "@/components/clone/AntNav"

type Review = { author: string; event: string; note: string; stars: number }

type Props = {
  slug: string
  name: string
  category: string
  city: string
  rating: number
  photos: string[]
  heroImg: string | null
  description?: string | null
  instagram?: string | null
  facebook?: string | null
  website?: string | null
  phone?: string | null
  reviews: Review[]
}

function StarRow({ count, size = 14 }: { count: number; size?: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= count ? "#F59E0B" : "rgba(183,191,217,0.3)", fontSize: size, lineHeight: 1 }}>★</span>
      ))}
    </span>
  )
}

export default function VendorProfileClient({
  slug, name, category, city, rating, photos, heroImg,
  description, instagram, facebook, website, phone, reviews,
}: Props) {
  const [activePhoto, setActivePhoto] = useState(0)
  const [contactOpen, setContactOpen] = useState(false)
  const [shareDone, setShareDone] = useState(false)
  const [favorited, setFavorited] = useState(false)

  const allPhotos = photos.length > 0 ? photos : (heroImg ? [heroImg] : [])
  const displayHero = allPhotos[activePhoto] ?? heroImg

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : ""
    const shareData = { title: `${name} — Momento`, text: `${category} à ${city}`, url }
    try {
      if (typeof navigator !== "undefined" && (navigator as Navigator & { share?: (d: ShareData) => Promise<void> }).share) {
        await (navigator as Navigator & { share: (d: ShareData) => Promise<void> }).share(shareData)
      } else {
        await navigator.clipboard.writeText(url)
        setShareDone(true)
        setTimeout(() => setShareDone(false), 1800)
      }
    } catch {}
  }

  return (
    <div className="ant-root" style={{ minHeight: "100vh", background: "var(--dash-bg,#f7f7fb)" }}>
      <AntNav />

      {/* ── Hero ── */}
      <div style={{ position: "relative", height: "clamp(300px, 50vh, 520px)", overflow: "hidden" }}>
        {displayHero ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={displayHero} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{
            width: "100%", height: "100%",
            background: "linear-gradient(140deg, var(--g1,#E11D48), var(--g2,#9333EA))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 80, opacity: 0.4,
          }}>✨</div>
        )}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)",
        }} />
        {/* Back link */}
        <div style={{ position: "absolute", top: 72, left: 0, right: 0, padding: "0 24px" }}>
          <Link href="/explore" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "7px 14px", borderRadius: 999,
            background: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.25)",
            color: "#fff", fontSize: 13, textDecoration: "none", fontFamily: "inherit",
          }}>
            ← Retour aux prestataires
          </Link>
        </div>
        {/* Floating actions (top right) */}
        <div style={{ position: "absolute", top: 72, right: 24, display: "flex", gap: 8 }}>
          <button onClick={() => setFavorited(v => !v)} aria-label="Ajouter aux favoris" style={{
            width: 38, height: 38, borderRadius: "50%",
            background: "rgba(255,255,255,0.18)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.25)", color: "#fff",
            fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {favorited ? "♥" : "♡"}
          </button>
          <button onClick={handleShare} aria-label="Partager" style={{
            width: 38, height: 38, borderRadius: "50%",
            background: "rgba(255,255,255,0.18)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.25)", color: "#fff",
            fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {shareDone ? "✓" : "↗"}
          </button>
        </div>
        {/* Hero info */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 24px 28px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{
              display: "inline-flex", alignItems: "center",
              background: "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))",
              borderRadius: 20, padding: "3px 12px",
              fontSize: 11, fontWeight: 600, color: "#fff", marginBottom: 10,
              letterSpacing: "0.04em",
            }}>
              {category}
            </div>
            <h1 style={{
              fontSize: "clamp(1.6rem, 4vw, 3rem)",
              fontWeight: 700, color: "#fff",
              margin: "0 0 10px",
              lineHeight: 1.15, letterSpacing: "-0.02em",
            }}>
              {name}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 14 }}>📍 {city}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <StarRow count={Math.round(rating)} size={14} />
                <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 600 }}>{rating.toFixed(1)}</span>
              </div>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                background: "rgba(22,163,74,0.25)", border: "1px solid rgba(22,163,74,0.4)",
                borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 500, color: "#86efac",
              }}>
                ✓ Vérifié
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 64px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr min(340px, 35%)", gap: 32, alignItems: "start" }}
          className="flex flex-col lg:grid">

          {/* ── Left col ── */}
          <div style={{ minWidth: 0 }}>

            {/* Description */}
            {description && (
              <section style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--dash-text,#121317)", marginBottom: 12 }}>À propos</h2>
                <p style={{
                  fontSize: 14, color: "var(--dash-text-2,#45474D)", lineHeight: 1.75,
                  background: "var(--dash-surface,#fff)", borderRadius: 16, padding: 20,
                  border: "1px solid var(--dash-border,rgba(183,191,217,0.18))",
                  margin: 0,
                }}>
                  {description}
                </p>
              </section>
            )}

            {/* Photo gallery */}
            {allPhotos.length > 1 && (
              <section style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--dash-text,#121317)", marginBottom: 12 }}>
                  Photos ({allPhotos.length})
                </h2>
                <div style={{
                  aspectRatio: "16/9", borderRadius: 16, overflow: "hidden", marginBottom: 10,
                  border: "1px solid var(--dash-border,rgba(183,191,217,0.18))",
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={allPhotos[activePhoto]}
                    alt={`${name} photo ${activePhoto + 1}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "opacity 0.3s" }}
                  />
                </div>
                <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none" }}>
                  {allPhotos.map((url, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={url}
                      alt={`thumb ${i + 1}`}
                      onClick={() => setActivePhoto(i)}
                      style={{
                        width: 80, height: 60, objectFit: "cover", flexShrink: 0,
                        borderRadius: 10, cursor: "pointer",
                        border: i === activePhoto ? "2px solid var(--g1,#E11D48)" : "2px solid transparent",
                        opacity: i === activePhoto ? 1 : 0.7,
                        transition: "all 0.15s",
                      }}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Reviews */}
            <section>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--dash-text,#121317)", marginBottom: 16 }}>
                Avis clients {reviews.length > 0 && `(${reviews.length})`}
              </h2>
              {reviews.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {reviews.map((r, i) => (
                    <div key={i} style={{
                      background: "var(--dash-surface,#fff)", borderRadius: 16, padding: "16px 20px",
                      border: "1px solid var(--dash-border,rgba(183,191,217,0.18))",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                            background: "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#fff", fontWeight: 700, fontSize: 13,
                          }}>
                            {r.author.charAt(0)}
                          </div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--dash-text,#121317)", margin: 0 }}>{r.author}</p>
                            <p style={{ fontSize: 11, color: "var(--dash-text-3,#6a6a71)", margin: "2px 0 0" }}>{r.event}</p>
                          </div>
                        </div>
                        <StarRow count={r.stars} size={13} />
                      </div>
                      <p style={{ fontSize: 13, color: "var(--dash-text-2,#45474D)", margin: 0, lineHeight: 1.6 }}>{r.note}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  background: "var(--dash-surface,#fff)", borderRadius: 16, padding: "28px 20px",
                  border: "1px solid var(--dash-border,rgba(183,191,217,0.18))",
                  textAlign: "center",
                }}>
                  <p style={{ fontSize: 13, color: "var(--dash-text-3,#6a6a71)", margin: 0 }}>
                    Pas encore d&apos;avis. Soyez le premier à laisser votre avis après votre événement.
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* ── Right col — Contact card ── */}
          <div style={{ position: "sticky", top: 120 }}>
            <div style={{
              background: "var(--dash-surface,#fff)", borderRadius: 24, padding: 24,
              border: "1px solid var(--dash-border,rgba(183,191,217,0.18))",
              boxShadow: "0 4px 32px rgba(0,0,0,0.07)",
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--dash-text,#121317)", margin: "0 0 6px" }}>
                Contacter {name.split(" ")[0]}
              </h3>
              <p style={{ fontSize: 13, color: "var(--dash-text-3,#6a6a71)", margin: "0 0 20px" }}>
                Réponse habituelle en moins de 2h
              </p>

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                {[
                  { label: "Note", value: `${rating.toFixed(1)} / 5` },
                  { label: "Ville", value: city },
                  { label: "Catégorie", value: category.length > 18 ? category.slice(0, 16) + "…" : category },
                  { label: "Commission", value: "0%" },
                ].map(({ label, value }) => (
                  <div key={label} style={{
                    background: "var(--dash-faint,#f7f7fb)", borderRadius: 12, padding: "10px 12px",
                    border: "1px solid var(--dash-border,rgba(183,191,217,0.15))",
                  }}>
                    <p style={{ fontSize: 10, color: "var(--dash-text-3,#9a9aaa)", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--dash-text,#121317)", margin: "3px 0 0" }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={() => setContactOpen(true)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "13px 20px", borderRadius: 999, width: "100%",
                  background: "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))",
                  color: "#fff", fontSize: 14, fontWeight: 600,
                  border: "none", cursor: "pointer", fontFamily: "inherit", marginBottom: 10,
                }}
              >
                ✉ Envoyer un message
              </button>
              {phone && (
                <a href={`tel:${phone}`} style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "11px 20px", borderRadius: 999,
                  background: "var(--dash-faint,rgba(183,191,217,0.1))",
                  color: "var(--dash-text-2,#45474D)", fontSize: 13,
                  textDecoration: "none", fontWeight: 500,
                  border: "1px solid var(--dash-border,rgba(183,191,217,0.3))",
                }}>
                  📞 {phone}
                </a>
              )}

              {/* Social / web links */}
              {(instagram || facebook || website) && (
                <div style={{ marginTop: 16, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                  {instagram && (
                    <a
                      href={`https://instagram.com/${instagram.replace("@", "")}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{
                        padding: "6px 14px", borderRadius: 999,
                        background: "var(--dash-faint,rgba(183,191,217,0.1))",
                        border: "1px solid var(--dash-border,rgba(183,191,217,0.25))",
                        color: "var(--dash-text-2,#45474D)", fontSize: 12, textDecoration: "none",
                        display: "flex", alignItems: "center", gap: 5,
                      }}
                    >
                      <span>📸</span> Instagram
                    </a>
                  )}
                  {facebook && (
                    <a
                      href={`https://facebook.com/${facebook}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{
                        padding: "6px 14px", borderRadius: 999,
                        background: "var(--dash-faint,rgba(183,191,217,0.1))",
                        border: "1px solid var(--dash-border,rgba(183,191,217,0.25))",
                        color: "var(--dash-text-2,#45474D)", fontSize: 12, textDecoration: "none",
                        display: "flex", alignItems: "center", gap: 5,
                      }}
                    >
                      <span>👥</span> Facebook
                    </a>
                  )}
                  {website && (
                    <a
                      href={website.startsWith("http") ? website : `https://${website}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{
                        padding: "6px 14px", borderRadius: 999,
                        background: "var(--dash-faint,rgba(183,191,217,0.1))",
                        border: "1px solid var(--dash-border,rgba(183,191,217,0.25))",
                        color: "var(--dash-text-2,#45474D)", fontSize: 12, textDecoration: "none",
                        display: "flex", alignItems: "center", gap: 5,
                      }}
                    >
                      <span>🌐</span> Site
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Contact modal ── */}
      {contactOpen && (
        <ContactModal
          slug={slug}
          vendorName={name}
          onClose={() => setContactOpen(false)}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Contact modal — inline pour éviter un fichier séparé
// ─────────────────────────────────────────────────────────────────────────────
function ContactModal({ slug, vendorName, onClose }: { slug: string; vendorName: string; onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    clientName: "", clientEmail: "", clientPhone: "",
    eventDate: "", eventType: "Mariage", message: "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const payload: Record<string, string> = {
        vendorSlug: slug,
        clientName: form.clientName,
        clientEmail: form.clientEmail,
        eventType: form.eventType,
        message: form.message,
      }
      if (form.clientPhone) payload.clientPhone = form.clientPhone
      if (form.eventDate) payload.eventDate = form.eventDate

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? "Envoi impossible")
      }
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur réseau")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--dash-surface,#fff)", borderRadius: 20,
          padding: 28, maxWidth: 440, width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          border: "1px solid var(--dash-border,rgba(183,191,217,0.18))",
        }}
      >
        {sent ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--dash-text,#121317)", margin: "0 0 8px" }}>
              Message envoyé
            </h3>
            <p style={{ fontSize: 13, color: "var(--dash-text-3,#6a6a71)", margin: "0 0 20px" }}>
              {vendorName} vous répondra sous peu.
            </p>
            <button onClick={onClose} style={{
              padding: "10px 20px", borderRadius: 999,
              background: "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))",
              color: "#fff", fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit",
            }}>
              Fermer
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 4 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--dash-text,#121317)", margin: 0 }}>
                Contacter {vendorName}
              </h3>
              <button onClick={onClose} aria-label="Fermer" style={{
                background: "transparent", border: "none", fontSize: 22, cursor: "pointer",
                color: "var(--dash-text-3,#6a6a71)", padding: 0, lineHeight: 1,
              }}>×</button>
            </div>
            <p style={{ fontSize: 12, color: "var(--dash-text-3,#6a6a71)", margin: "0 0 18px" }}>
              Décrivez votre projet — le prestataire vous contactera directement.
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Field label="Votre nom" required>
                <input required value={form.clientName} onChange={e => setForm(p => ({ ...p, clientName: e.target.value }))} style={inputStyle} />
              </Field>
              <Field label="Email" required>
                <input required type="email" value={form.clientEmail} onChange={e => setForm(p => ({ ...p, clientEmail: e.target.value }))} style={inputStyle} />
              </Field>
              <Field label="Téléphone (optionnel)">
                <input type="tel" value={form.clientPhone} onChange={e => setForm(p => ({ ...p, clientPhone: e.target.value }))} style={inputStyle} />
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field label="Type d'événement">
                  <select value={form.eventType} onChange={e => setForm(p => ({ ...p, eventType: e.target.value }))} style={inputStyle}>
                    <option>Mariage</option>
                    <option>Fiançailles</option>
                    <option>Anniversaire</option>
                    <option>Corporate</option>
                    <option>Autre</option>
                  </select>
                </Field>
                <Field label="Date prévue">
                  <input type="date" value={form.eventDate} onChange={e => setForm(p => ({ ...p, eventDate: e.target.value }))} style={inputStyle} />
                </Field>
              </div>
              <Field label="Message" required>
                <textarea required rows={4} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  style={{ ...inputStyle, resize: "vertical", minHeight: 90 }} />
              </Field>

              {error && (
                <div style={{
                  fontSize: 12, color: "#ef4444", background: "rgba(239,68,68,0.08)",
                  padding: "8px 12px", borderRadius: 8,
                }}>{error}</div>
              )}

              <button type="submit" disabled={loading} style={{
                padding: "12px 20px", borderRadius: 999,
                background: loading ? "#9a9aaa" : "linear-gradient(135deg, var(--g1,#E11D48), var(--g2,#9333EA))",
                color: "#fff", fontWeight: 600, border: "none",
                cursor: loading ? "wait" : "pointer", fontFamily: "inherit", marginTop: 4,
              }}>
                {loading ? "Envoi…" : "Envoyer le message"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{
        fontSize: 11, fontWeight: 600,
        color: "var(--dash-text-3,#6a6a71)",
        textTransform: "uppercase", letterSpacing: "0.05em",
      }}>
        {label}{required && <span style={{ color: "#ef4444", marginLeft: 3 }}>*</span>}
      </span>
      {children}
    </label>
  )
}

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid var(--dash-border,rgba(183,191,217,0.3))",
  background: "var(--dash-faint,#f7f7fb)",
  color: "var(--dash-text,#121317)",
  fontSize: 13,
  fontFamily: "inherit",
  outline: "none",
}
