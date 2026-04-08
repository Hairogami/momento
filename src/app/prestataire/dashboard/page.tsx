"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import {
  LayoutDashboard, User, ClipboardList, Star, BarChart2,
  Menu, X, LogOut, Eye, MessageSquare, Calendar, MapPin,
  TrendingUp, Check, Clock, ChevronRight, Edit3, Bell,
  Phone, Mail, Globe, Wallet, Users
} from "lucide-react"
import { C } from "@/lib/colors"
import { DarkModeToggle } from "@/components/DarkModeToggle"
import { MomentoLogo } from "@/components/MomentoLogo"

type VendorSession = {
  id: string
  name: string
  category: string
  city: string
  email: string
  phone: string
  rating: number
  reviewCount: number
  plan: "standard" | "pro"
  description: string
  priceFrom: number
}

type Booking = {
  id: string
  clientName: string
  eventType: string
  eventDate: string
  guestCount: number
  location: string
  budget: string
  message: string
  status: "pending" | "confirmed" | "declined"
  createdAt: string
}

const DEMO_BOOKINGS: Booking[] = [
  {
    id: "b1",
    clientName: "Yasmine & Karim",
    eventType: "Mariage",
    eventDate: "2025-09-14",
    guestCount: 250,
    location: "Marrakech",
    budget: "60 000 – 100 000 MAD",
    message: "Bonjour, nous planifions notre mariage pour septembre et nous avons adoré votre profil. Pouvez-vous nous envoyer votre disponibilité et vos tarifs ?",
    status: "pending",
    createdAt: "2025-04-03T10:22:00Z",
  },
  {
    id: "b2",
    clientName: "Société ALTEC",
    eventType: "Corporate",
    eventDate: "2025-05-20",
    guestCount: 80,
    location: "Casablanca",
    budget: "30 000 – 60 000 MAD",
    message: "Nous organisons notre séminaire annuel et cherchons un prestataire de qualité. Merci de nous contacter.",
    status: "confirmed",
    createdAt: "2025-03-28T14:05:00Z",
  },
  {
    id: "b3",
    clientName: "Leila Benali",
    eventType: "Anniversaire",
    eventDate: "2025-06-07",
    guestCount: 50,
    location: "Rabat",
    budget: "10 000 – 30 000 MAD",
    message: "Anniversaire surprise pour mon mari. J'ai besoin de vos services pour la soirée. Disponible ce weekend ?",
    status: "pending",
    createdAt: "2025-04-01T09:10:00Z",
  },
  {
    id: "b4",
    clientName: "Famille Tazi",
    eventType: "Fiançailles",
    eventDate: "2025-07-19",
    guestCount: 120,
    location: "Fès",
    budget: "30 000 – 60 000 MAD",
    message: "Fiançailles en famille, environ 120 personnes. Nous souhaitons quelque chose d'élégant et authentique.",
    status: "declined",
    createdAt: "2025-03-15T17:30:00Z",
  },
  {
    id: "b5",
    clientName: "Nadia Idrissi",
    eventType: "Baby shower",
    eventDate: "2025-05-03",
    guestCount: 30,
    location: "Casablanca",
    budget: "< 10 000 MAD",
    message: "Petite fête pour bébé, ambiance douce et chaleureuse. Budget limité mais on veut quelque chose de beau.",
    status: "confirmed",
    createdAt: "2025-03-20T11:00:00Z",
  },
]

const DEMO_REVIEWS = [
  { author: "Yasmine M.", rating: 5, comment: "Prestations exceptionnelles, très professionnel et ponctuel. Nos invités ont adoré !", date: "2025-03-10" },
  { author: "Karim B.",   rating: 4, comment: "Très bon travail, communication fluide. Je recommande vivement.", date: "2025-02-25" },
  { author: "Sofia R.",   rating: 5, comment: "Parfait du début à la fin. Le mariage de mes rêves grâce à vous !", date: "2025-02-14" },
  { author: "Hassan T.",  rating: 4, comment: "Bonne prestation, quelques petits détails à peaufiner mais dans l'ensemble excellent.", date: "2025-01-30" },
]

const MONTHLY_VIEWS = [120, 185, 210, 170, 290, 340, 420, 380, 450, 510, 480, 560]
const MONTHS = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"]

type Section = "overview" | "profile" | "bookings" | "reviews" | "stats" | "performance"

const NAV_ITEMS: { id: Section; label: string; icon: React.ReactNode; badge?: number }[] = [
  { id: "overview",     label: "Vue d'ensemble", icon: <LayoutDashboard size={16} /> },
  { id: "profile",      label: "Mon profil",      icon: <User size={16} /> },
  { id: "bookings",     label: "Demandes",        icon: <ClipboardList size={16} />, badge: 2 },
  { id: "reviews",      label: "Avis clients",    icon: <Star size={16} /> },
  { id: "stats",        label: "Statistiques",    icon: <BarChart2 size={16} /> },
  { id: "performance",  label: "Performances",    icon: <TrendingUp size={16} /> },
]

// Simulated performance data
const PERF_DAILY_CLICKS = [4, 9, 7, 12, 8, 15, 11] // last 7 days
const PERF_DAILY_IG     = [2, 5, 3,  7, 4,  8,  5]
const PERF_DAILY_FB     = [0, 2, 1,  3, 1,  4,  2]
const PERF_DAILY_WEB    = [1, 2, 2,  4, 2,  5,  3]
const WEEK_DAYS         = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"]

export default function VendorDashboard() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [vendor, setVendor] = useState<VendorSession | null>(null)
  const [section, setSection] = useState<Section>("overview")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [dashStats, setDashStats] = useState({ totalContacts: 0, pendingContacts: 0, confirmedContacts: 0, totalConversations: 0, responseRate: 0 })

  // Profile edit state
  const [editMode, setEditMode] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: "", category: "", city: "", phone: "", email: "", description: "", priceFrom: "" })

  const loadDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/vendor/dashboard")
      if (res.status === 401 || res.status === 403) { router.push("/prestataire"); return }
      const data = await res.json()
      setDashStats(data.stats ?? dashStats)
      setBookings(data.contacts?.map((c: Booking & { clientEmail?: string; clientPhone?: string }) => ({
        id: c.id,
        clientName: c.clientName,
        eventType: c.eventType || "Événement",
        eventDate: c.eventDate || "",
        guestCount: 0,
        location: "",
        budget: "",
        message: c.message,
        status: c.status as Booking["status"],
        createdAt: c.createdAt,
      })) ?? [])
    } catch { /* silently fail, keep DEMO_BOOKINGS as fallback */ }
  }, [router]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login?next=/prestataire/dashboard"); return }
    if (status === "loading") return
    if (!session?.user) return

    // Build vendor info from session user
    const u = session.user as { name?: string | null; email?: string | null; image?: string | null; vendorSlug?: string }
    const vendorData: VendorSession = {
      id: u.vendorSlug ?? "",
      name: u.name ?? "Prestataire",
      category: "",
      city: "",
      email: u.email ?? "",
      phone: "",
      rating: 4.8,
      reviewCount: 0,
      plan: "standard",
      description: "",
      priceFrom: 0,
    }
    setVendor(vendorData)
    setProfileForm({ name: vendorData.name, category: "", city: "", phone: "", email: vendorData.email, description: "", priceFrom: "" })
    loadDashboard()
  }, [status, session, router, loadDashboard])

  function logout() {
    signOut({ callbackUrl: "/" })
  }

  async function saveProfile() {
    if (!vendor) return
    const updated: VendorSession = { ...vendor, ...profileForm, priceFrom: parseFloat(profileForm.priceFrom) || 0 }
    setVendor(updated)
    setEditMode(false)
  }

  async function updateBooking(id: string, newStatus: Booking["status"]) {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b))
    await fetch("/api/vendor/dashboard", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId: id, status: newStatus }),
    }).catch(() => { /* ignore */ })
  }

  if (status === "loading" || !vendor) return <div className="min-h-screen" style={{ backgroundColor: C.ink }} />

  const pendingCount = bookings.filter(b => b.status === "pending").length
  const confirmedCount = bookings.filter(b => b.status === "confirmed").length

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: C.ink, color: C.white }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`flex flex-col flex-shrink-0 h-full z-50
        fixed md:static transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        style={{ width: 256, backgroundColor: C.dark, borderRight: `1px solid ${C.anthracite}` }}>

        {/* Logo + close */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <MomentoLogo iconSize={28} />
          <div className="flex items-center gap-2">
            <DarkModeToggle />
            <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
              <X size={18} style={{ color: C.mist }} />
            </button>
          </div>
        </div>

        {/* Vendor identity */}
        <div className="mx-4 mb-4 p-3 rounded-xl" style={{ backgroundColor: C.anthracite }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
              style={{ backgroundColor: C.terra, color: "#fff" }}>
              {vendor.name[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate" style={{ color: C.white }}>{vendor.name}</p>
              <p className="text-xs truncate" style={{ color: C.mist }}>{vendor.category} · {vendor.city}</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2.5">
            <span className="flex items-center gap-1 text-xs font-bold" style={{ color: C.terra }}>
              <Star size={11} fill="currentColor" /> {vendor.rating} ({vendor.reviewCount} avis)
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold"
              style={{ backgroundColor: vendor.plan === "pro" ? `${C.terra}20` : C.steel, color: vendor.plan === "pro" ? C.terra : C.ink }}>
              {vendor.plan === "pro" ? "Pro ✓" : "Standard"}
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 flex flex-col gap-0.5">
          {NAV_ITEMS.map(item => (
            <button key={item.id}
              onClick={() => { setSection(item.id); setSidebarOpen(false) }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all"
              style={{
                backgroundColor: section === item.id ? C.terra : "transparent",
                color: section === item.id ? "#fff" : C.mist,
              }}>
              <span className="flex items-center gap-2.5">
                {item.icon} {item.label}
              </span>
              {item.id === "bookings" && pendingCount > 0 && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: section === item.id ? "rgba(255,255,255,0.3)" : C.terra, color: "#fff" }}>
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Messaging link */}
        <div className="px-3 pb-1">
          <Link href="/prestataire/messages"
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80"
            style={{ color: C.mist }}>
            <MessageSquare size={16} /> Messagerie
          </Link>
        </div>

        {/* View public profile */}
        <div className="px-3 pb-2">
          <Link href={`/vendor/${vendor.id}`} target="_blank"
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium"
            style={{ backgroundColor: C.anthracite, color: C.silver }}>
            <Eye size={13} /> Voir mon profil public
          </Link>
        </div>

        {/* Logout */}
        <div className="px-3 pb-5">
          <button onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all hover:opacity-80"
            style={{ color: C.mist }}>
            <LogOut size={13} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 flex-shrink-0"
          style={{ borderBottom: `1px solid ${C.anthracite}` }}>
          <div className="flex items-center gap-3">
            <button className="md:hidden p-1.5 rounded-lg" onClick={() => setSidebarOpen(true)}
              style={{ backgroundColor: C.anthracite }}>
              <Menu size={18} style={{ color: C.white }} />
            </button>
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: C.terra }}>
                {NAV_ITEMS.find(n => n.id === section)?.label}
              </p>
              <h1 className="text-lg font-bold" style={{ color: C.white }}>
                {section === "overview" && "Bonjour 👋"}
                {section === "profile" && "Mon profil"}
                {section === "bookings" && "Demandes de réservation"}
                {section === "reviews" && "Avis clients"}
                {section === "stats" && "Statistiques"}
                {section === "performance" && "Performances"}
              </h1>
            </div>
          </div>
          <button className="p-2 rounded-xl relative" style={{ backgroundColor: C.dark }}>
            <Bell size={16} style={{ color: C.mist }} />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs font-bold flex items-center justify-center"
                style={{ backgroundColor: C.terra, color: "#fff" }}>
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">

          {/* ── OVERVIEW ── */}
          {section === "overview" && (
            <div>
              {/* Stats cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                {[
                  { label: "Contacts reçus",   value: String(dashStats.totalContacts), sub: `${dashStats.confirmedContacts} confirmés`, icon: <MessageSquare size={16} />, color: "#10B981" },
                  { label: "Demandes en cours",value: String(pendingCount), sub: `${confirmedCount} confirmées`, icon: <ClipboardList size={16} />, color: C.terra },
                  { label: "Taux de réponse",  value: `${dashStats.responseRate}%`, sub: `${dashStats.totalConversations} conversations`, icon: <Eye size={16} />, color: "#0EA5E9" },
                  { label: "Note moyenne",     value: `${vendor.rating}⭐`, sub: `${vendor.reviewCount} avis`, icon: <Star size={16} />,  color: "#F59E0B" },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl p-4" style={{ backgroundColor: C.dark, border: `1px solid ${C.anthracite}` }}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs" style={{ color: C.mist }}>{s.label}</p>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${s.color}20`, color: s.color }}>
                        {s.icon}
                      </div>
                    </div>
                    <p className="text-2xl font-bold" style={{ color: C.white }}>{s.value}</p>
                    <p className="text-xs mt-1" style={{ color: C.mist }}>{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* Plan banner for standard users */}
              {vendor.plan === "standard" && (
                <div className="rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-3"
                  style={{ backgroundColor: `${C.terra}12`, border: `1.5px solid ${C.terra}30` }}>
                  <div>
                    <p className="font-bold text-sm" style={{ color: C.terra }}>🚀 Passez au plan Pro</p>
                    <p className="text-xs mt-0.5" style={{ color: C.mist }}>Badge vérifié, priorité dans les résultats, photos illimitées — 299 MAD/mois.</p>
                  </div>
                  <Link href="/prestataires"
                    className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
                    style={{ backgroundColor: C.terra, color: "#fff" }}>
                    Voir les offres <ChevronRight size={14} />
                  </Link>
                </div>
              )}

              {/* Pending requests */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-bold" style={{ color: C.white }}>Demandes en attente</p>
                  <button onClick={() => setSection("bookings")} className="text-xs font-medium flex items-center gap-1" style={{ color: C.terra }}>
                    Voir toutes <ChevronRight size={13} />
                  </button>
                </div>
                {bookings.filter(b => b.status === "pending").slice(0, 3).map(b => (
                  <BookingCard key={b.id} booking={b} onUpdate={updateBooking} compact />
                ))}
                {bookings.filter(b => b.status === "pending").length === 0 && (
                  <div className="rounded-xl py-8 text-center" style={{ backgroundColor: C.dark }}>
                    <p className="text-sm" style={{ color: C.mist }}>Aucune demande en attente.</p>
                  </div>
                )}
              </div>

              {/* Recent reviews */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-bold" style={{ color: C.white }}>Derniers avis</p>
                  <button onClick={() => setSection("reviews")} className="text-xs font-medium flex items-center gap-1" style={{ color: C.terra }}>
                    Voir tous <ChevronRight size={13} />
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {DEMO_REVIEWS.slice(0, 2).map(r => (
                    <ReviewCard key={r.author} review={r} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── PROFILE ── */}
          {section === "profile" && (
            <div className="max-w-2xl">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm" style={{ color: C.mist }}>Informations visibles sur votre profil public.</p>
                <button onClick={() => editMode ? saveProfile() : setEditMode(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-80"
                  style={{ backgroundColor: editMode ? C.terra : C.dark, color: editMode ? "#fff" : C.white, border: `1px solid ${editMode ? C.terra : C.anthracite}` }}>
                  {editMode ? <><Check size={14} /> Enregistrer</> : <><Edit3 size={14} /> Modifier</>}
                </button>
              </div>

              {/* Profile photo placeholder */}
              <div className="rounded-2xl p-6 mb-4" style={{ backgroundColor: C.dark, border: `1px solid ${C.anthracite}` }}>
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
                    style={{ backgroundColor: C.terra, color: "#fff" }}>
                    {vendor.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-lg" style={{ color: C.white }}>{vendor.name}</p>
                    <p className="text-sm" style={{ color: C.mist }}>{vendor.category} · {vendor.city}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold mt-1 inline-block"
                      style={{ backgroundColor: `${C.terra}20`, color: C.terra }}>
                      {vendor.plan === "pro" ? "✓ Pro" : "Standard"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {[
                    { label: "Nom / Raison sociale", key: "name", icon: <User size={13} /> },
                    { label: "Catégorie", key: "category", icon: <ClipboardList size={13} /> },
                    { label: "Ville", key: "city", icon: <MapPin size={13} /> },
                    { label: "Téléphone", key: "phone", icon: <Phone size={13} /> },
                    { label: "Email", key: "email", icon: <Mail size={13} /> },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5" style={{ color: C.silver }}>
                        {f.icon} {f.label}
                      </label>
                      {editMode ? (
                        <input
                          value={profileForm[f.key as keyof typeof profileForm]}
                          onChange={e => setProfileForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                          style={{ backgroundColor: C.ink, border: `1.5px solid ${C.terra}`, color: C.white }}
                        />
                      ) : (
                        <p className="text-sm px-3 py-2.5 rounded-xl"
                          style={{ backgroundColor: C.ink, color: profileForm[f.key as keyof typeof profileForm] ? C.white : C.steel }}>
                          {profileForm[f.key as keyof typeof profileForm] || "Non renseigné"}
                        </p>
                      )}
                    </div>
                  ))}

                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5" style={{ color: C.silver }}>
                      <Wallet size={13} /> Tarif à partir de (MAD)
                    </label>
                    {editMode ? (
                      <input type="number" value={profileForm.priceFrom}
                        onChange={e => setProfileForm(prev => ({ ...prev, priceFrom: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                        style={{ backgroundColor: C.ink, border: `1.5px solid ${C.terra}`, color: C.white }} />
                    ) : (
                      <p className="text-sm px-3 py-2.5 rounded-xl"
                        style={{ backgroundColor: C.ink, color: profileForm.priceFrom ? C.white : C.steel }}>
                        {profileForm.priceFrom ? `${parseInt(profileForm.priceFrom).toLocaleString("fr-FR")} MAD` : "Non renseigné"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5" style={{ color: C.silver }}>
                      <Edit3 size={13} /> Description
                    </label>
                    {editMode ? (
                      <textarea value={profileForm.description} rows={4}
                        onChange={e => setProfileForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                        style={{ backgroundColor: C.ink, border: `1.5px solid ${C.terra}`, color: C.white }}
                        placeholder="Décrivez vos services, votre expérience, vos atouts…" />
                    ) : (
                      <p className="text-sm px-3 py-2.5 rounded-xl min-h-16"
                        style={{ backgroundColor: C.ink, color: profileForm.description ? C.white : C.steel }}>
                        {profileForm.description || "Aucune description — ajoutez une présentation pour attirer plus de clients."}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {editMode && (
                <div className="flex gap-3">
                  <button onClick={() => setEditMode(false)}
                    className="px-5 py-3 rounded-xl text-sm font-medium"
                    style={{ backgroundColor: C.dark, color: C.white, border: `1px solid ${C.anthracite}` }}>
                    Annuler
                  </button>
                  <button onClick={saveProfile}
                    className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                    style={{ backgroundColor: C.terra, color: "#fff" }}>
                    <Check size={14} /> Enregistrer les modifications
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── BOOKINGS ── */}
          {section === "bookings" && (
            <div>
              {/* Tabs */}
              <div className="flex gap-2 mb-6 flex-wrap">
                {(["all", "pending", "confirmed", "declined"] as const).map(status => {
                  const count = status === "all" ? bookings.length : bookings.filter(b => b.status === status).length
                  const labels = { all: "Toutes", pending: "En attente", confirmed: "Confirmées", declined: "Refusées" }
                  const colors = { all: C.white, pending: C.terra, confirmed: "#10B981", declined: C.steel }
                  return (
                    <span key={status} className="text-xs font-semibold px-3 py-1.5 rounded-full"
                      style={{ backgroundColor: `${colors[status]}15`, color: colors[status], border: `1px solid ${colors[status]}30` }}>
                      {labels[status]} · {count}
                    </span>
                  )
                })}
              </div>
              <div className="flex flex-col gap-4">
                {bookings.map(b => (
                  <BookingCard key={b.id} booking={b} onUpdate={updateBooking} />
                ))}
              </div>
            </div>
          )}

          {/* ── REVIEWS ── */}
          {section === "reviews" && (
            <div>
              {/* Rating summary */}
              <div className="rounded-2xl p-5 mb-6 flex items-center gap-6"
                style={{ backgroundColor: C.dark, border: `1px solid ${C.anthracite}` }}>
                <div className="text-center">
                  <p className="text-5xl font-bold" style={{ color: C.terra }}>{vendor.rating}</p>
                  <div className="flex justify-center gap-0.5 my-1">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} size={14} fill={i <= Math.round(vendor.rating) ? C.terra : "none"}
                        style={{ color: C.terra }} />
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: C.mist }}>{vendor.reviewCount} avis</p>
                </div>
                <div className="flex-1">
                  {[5,4,3,2,1].map(n => {
                    const cnt = DEMO_REVIEWS.filter(r => r.rating === n).length
                    const pct = Math.round((cnt / DEMO_REVIEWS.length) * 100)
                    return (
                      <div key={n} className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs w-4" style={{ color: C.mist }}>{n}</span>
                        <div className="flex-1 rounded-full h-1.5" style={{ backgroundColor: C.anthracite }}>
                          <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: C.terra }} />
                        </div>
                        <span className="text-xs w-6" style={{ color: C.mist }}>{cnt}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {DEMO_REVIEWS.map(r => (
                  <ReviewCard key={r.author} review={r} full />
                ))}
              </div>
            </div>
          )}

          {/* ── PERFORMANCE ── */}
          {section === "performance" && (
            <PerformanceSection vendor={vendor} onGoToProfile={() => setSection("profile")} />
          )}

          {/* ── STATS ── */}
          {section === "stats" && (
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {[
                  { label: "Vues totales",         value: "4 823",  icon: <Eye size={15} />,         color: "#0EA5E9" },
                  { label: "Contacts reçus",       value: "143",    icon: <MessageSquare size={15} />,color: "#10B981" },
                  { label: "Réservations",         value: "28",     icon: <Calendar size={15} />,     color: C.terra },
                  { label: "Taux de conversion",   value: "19.6%",  icon: <TrendingUp size={15} />,   color: "#F59E0B" },
                  { label: "Clients servis",       value: "47",     icon: <Users size={15} />,         color: "#7C3AED" },
                  { label: "Revenu estimé",        value: "142k MAD",icon: <Wallet size={15} />,      color: "#A855F7" },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl p-4" style={{ backgroundColor: C.dark, border: `1px solid ${C.anthracite}` }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2"
                      style={{ backgroundColor: `${s.color}20`, color: s.color }}>
                      {s.icon}
                    </div>
                    <p className="text-xl font-bold" style={{ color: C.white }}>{s.value}</p>
                    <p className="text-xs mt-0.5" style={{ color: C.mist }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Bar chart */}
              <div className="rounded-2xl p-5" style={{ backgroundColor: C.dark, border: `1px solid ${C.anthracite}` }}>
                <p className="font-bold mb-4" style={{ color: C.white }}>Vues par mois — 2025</p>
                <div className="flex items-end gap-2 h-32">
                  {MONTHLY_VIEWS.map((v, i) => {
                    const max = Math.max(...MONTHLY_VIEWS)
                    const pct = (v / max) * 100
                    const isCurrentMonth = i === new Date().getMonth()
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full rounded-t-md transition-all"
                          style={{ height: `${pct}%`, backgroundColor: isCurrentMonth ? C.terra : C.anthracite, minHeight: 4 }} />
                        <span className="text-xs" style={{ color: isCurrentMonth ? C.terra : C.steel }}>
                          {MONTHS[i]}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}

// ── Sub-components ──

function BookingCard({ booking: b, onUpdate, compact }: {
  booking: Booking
  onUpdate: (id: string, status: Booking["status"]) => void
  compact?: boolean
}) {
  const statusColors = { pending: "#F59E0B", confirmed: "#10B981", declined: "#9A907A" }
  const statusLabels = { pending: "En attente", confirmed: "Confirmée", declined: "Refusée" }
  const eventIcons: Record<string, string> = {
    "Mariage": "💍", "Corporate": "🏢", "Anniversaire": "🎂",
    "Fiançailles": "💒", "Baby shower": "👶",
  }

  return (
    <div className="rounded-2xl p-4 sm:p-5" style={{ backgroundColor: C.dark, border: `1px solid ${C.anthracite}` }}>
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{eventIcons[b.eventType] ?? "🎉"}</span>
          <div>
            <p className="font-bold text-sm" style={{ color: C.white }}>{b.clientName}</p>
            <p className="text-xs" style={{ color: C.mist }}>{b.eventType}</p>
          </div>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ backgroundColor: `${statusColors[b.status]}20`, color: statusColors[b.status] }}>
          {b.status === "pending" && <Clock size={10} className="inline mr-1" />}
          {b.status === "confirmed" && <Check size={10} className="inline mr-1" />}
          {statusLabels[b.status]}
        </span>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
        <span className="flex items-center gap-1 text-xs" style={{ color: C.mist }}>
          <Calendar size={11} /> {new Date(b.eventDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
        </span>
        <span className="flex items-center gap-1 text-xs" style={{ color: C.mist }}>
          <MapPin size={11} /> {b.location}
        </span>
        <span className="flex items-center gap-1 text-xs" style={{ color: C.mist }}>
          <Users size={11} /> {b.guestCount} invités
        </span>
        <span className="flex items-center gap-1 text-xs" style={{ color: C.mist }}>
          <Wallet size={11} /> {b.budget}
        </span>
      </div>

      {!compact && (
        <p className="text-xs mb-4 px-3 py-2.5 rounded-xl italic"
          style={{ backgroundColor: C.ink, color: C.silver }}>
          &ldquo;{b.message}&rdquo;
        </p>
      )}

      {b.status === "pending" && (
        <div className="flex gap-2">
          <button onClick={() => onUpdate(b.id, "confirmed")}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-80"
            style={{ backgroundColor: "#10B98120", color: "#10B981", border: "1px solid #10B98140" }}>
            <Check size={12} /> Accepter
          </button>
          <button onClick={() => onUpdate(b.id, "declined")}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-80"
            style={{ backgroundColor: C.anthracite, color: C.mist }}>
            <X size={12} /> Décliner
          </button>
        </div>
      )}
    </div>
  )
}

function ReviewCard({ review: r, full }: { review: { author: string; rating: number; comment: string; date: string }; full?: boolean }) {
  return (
    <div className="rounded-2xl p-4" style={{ backgroundColor: C.dark, border: `1px solid ${C.anthracite}` }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: C.anthracite, color: C.white }}>
            {r.author[0]}
          </div>
          <p className="font-bold text-sm" style={{ color: C.white }}>{r.author}</p>
        </div>
        <div className="flex gap-0.5">
          {[1,2,3,4,5].map(i => (
            <Star key={i} size={11} fill={i <= r.rating ? C.terra : "none"} style={{ color: C.terra }} />
          ))}
        </div>
      </div>
      <p className="text-xs" style={{ color: C.silver }}>{r.comment}</p>
      {full && <p className="text-xs mt-2" style={{ color: C.steel }}>
        {new Date(r.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
      </p>}
    </div>
  )
}

// ── PERFORMANCE SECTION ──

function PerformanceSection({
  vendor,
  onGoToProfile,
}: {
  vendor: { name: string; category: string; city: string; description: string; priceFrom: number; phone: string; reviewCount: number }
  onGoToProfile: () => void
}) {
  // Badge Top Prestataire criteria
  const hasPhoto       = true // simulated: always has avatar initial
  const hasDescription = vendor.description && vendor.description.length > 100
  const hasPrice       = vendor.priceFrom > 0
  const hasPhone       = !!vendor.phone
  const hasSocial      = true // simulated: has Instagram link
  const hasReview      = vendor.reviewCount > 0

  const criteria = [
    { label: "Photo de profil",          ok: hasPhoto },
    { label: "Description (> 100 car.)", ok: !!hasDescription },
    { label: "Tarif renseigné",          ok: hasPrice },
    { label: "Téléphone",                ok: hasPhone },
    { label: "Instagram ou site web",    ok: hasSocial },
    { label: "Au moins 1 avis client",   ok: hasReview },
  ]
  const isTopProvider = criteria.every(c => c.ok)
  const missingItems  = criteria.filter(c => !c.ok)

  const impressions = 1247
  const profileClicks = 89
  const contacts = 63
  const confirmed = 28

  const cvRate = ((profileClicks / impressions) * 100).toFixed(1)  // visit→contact approx
  const maxBar = Math.max(...PERF_DAILY_CLICKS, ...PERF_DAILY_IG, ...PERF_DAILY_FB, ...PERF_DAILY_WEB)

  return (
    <div className="space-y-6">

      {/* ── Bloc 1 — Visibilité ── */}
      <div className="rounded-2xl p-5" style={{ backgroundColor: C.dark, border: `1px solid ${C.anthracite}` }}>
        <p className="font-bold mb-4" style={{ color: C.white }}>Visibilité cette semaine</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Impressions",             value: "1 247", delta: "+12%", color: "#0EA5E9" },
            { label: "Clics sur profil",        value: "89",    delta: "+8%",  color: "#10B981" },
            { label: "Taux visite→contact",     value: `${cvRate}%`, delta: "+0.3%", color: "#F59E0B" },
            { label: "Position listing",        value: "#3",    delta: "sur 47 Photographes Rabat", color: C.terra },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-3" style={{ backgroundColor: C.ink }}>
              <p className="text-xs mb-1" style={{ color: C.mist }}>{s.label}</p>
              <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs mt-0.5" style={{ color: C.steel }}>{s.delta}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bloc 2 — Réactivité ── */}
      <div className="rounded-2xl p-5" style={{ backgroundColor: C.dark, border: `1px solid ${C.anthracite}` }}>
        <p className="font-bold mb-4" style={{ color: C.white }}>Réactivité</p>
        <div className="space-y-4">
          {/* Response rate */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm" style={{ color: C.silver }}>Taux de réponse</span>
              <span className="text-sm font-bold" style={{ color: "#10B981" }}>94%</span>
            </div>
            <div className="w-full h-2 rounded-full" style={{ backgroundColor: C.anthracite }}>
              <div className="h-2 rounded-full transition-all" style={{ width: "94%", backgroundColor: "#10B981" }} />
            </div>
          </div>
          {/* Response time */}
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: C.silver }}>Temps de réponse moyen</span>
            <span className="text-sm font-bold flex items-center gap-1" style={{ color: C.white }}>
              ⚡ 2h 14min
            </span>
          </div>
          {/* Pending requests badge */}
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: C.silver }}>Demandes en attente</span>
            <span className="text-sm font-bold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: `${C.terra}25`, color: C.terra }}>
              2 en attente
            </span>
          </div>
        </div>
      </div>

      {/* ── Bloc 3 — Badge Top Prestataire ── */}
      <div className="rounded-2xl p-5 overflow-hidden relative"
        style={{ backgroundColor: C.dark, border: `1.5px solid ${isTopProvider ? "#F59E0B" : C.anthracite}` }}>
        {isTopProvider && (
          <div className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(105deg, transparent 40%, rgba(245,158,11,0.07) 50%, transparent 60%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 2.5s infinite linear",
            }} />
        )}
        <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ backgroundColor: isTopProvider ? "#F59E0B20" : C.anthracite }}>
            {isTopProvider ? "⭐" : "🏅"}
          </div>
          <div>
            <p className="font-bold" style={{ color: isTopProvider ? "#F59E0B" : C.white }}>
              {isTopProvider ? "Top Prestataire Momento" : "Badge Top Prestataire"}
            </p>
            <p className="text-xs" style={{ color: C.mist }}>
              {isTopProvider ? "Votre profil est complet — vous bénéficiez du badge doré !" : `${missingItems.length} élément(s) manquant(s) pour obtenir le badge`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {criteria.map(c => (
            <div key={c.label} className="flex items-center gap-2 text-xs"
              style={{ color: c.ok ? "#10B981" : C.steel }}>
              <span className="flex-shrink-0">{c.ok ? "✅" : "⬜"}</span>
              {c.label}
            </div>
          ))}
        </div>

        {!isTopProvider && missingItems.length > 0 && (
          <button onClick={onGoToProfile}
            className="mt-4 w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-80"
            style={{ backgroundColor: C.terra, color: "#fff" }}>
            <Edit3 size={14} /> Compléter mon profil
          </button>
        )}
      </div>

      {/* ── Bloc 4 — Funnel parcours client ── */}
      <div className="rounded-2xl p-5" style={{ backgroundColor: C.dark, border: `1px solid ${C.anthracite}` }}>
        <p className="font-bold mb-5" style={{ color: C.white }}>Parcours client — entonnoir</p>
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
          {[
            { label: "Impressions", value: impressions,    color: "#0EA5E9" },
            { label: "Clics",       value: profileClicks,  color: "#7C3AED" },
            { label: "Contacts",    value: contacts,       color: "#F59E0B" },
            { label: "Confirmés",   value: confirmed,      color: "#10B981" },
          ].map((step, idx, arr) => {
            const prev = idx > 0 ? arr[idx - 1].value : null
            const rate = prev ? `${Math.round((step.value / prev) * 100)}%` : null
            return (
              <div key={step.label} className="flex items-center gap-2 flex-shrink-0">
                {idx > 0 && (
                  <div className="flex flex-col items-center gap-0.5">
                    <svg width="28" height="16" viewBox="0 0 28 16">
                      <path d="M2 8 H22 M16 2 L24 8 L16 14" stroke={C.anthracite} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {rate && <span className="text-xs font-semibold" style={{ color: C.steel }}>{rate}</span>}
                  </div>
                )}
                <div className="flex flex-col items-center gap-1">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: `${step.color}18`, border: `1.5px solid ${step.color}50` }}>
                    <span className="text-base font-bold" style={{ color: step.color }}>
                      {step.value >= 1000 ? `${(step.value / 1000).toFixed(1)}k` : step.value}
                    </span>
                  </div>
                  <span className="text-xs text-center" style={{ color: C.mist }}>{step.label}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Bloc 5 — Clics réseaux sociaux ── */}
      <div className="rounded-2xl p-5" style={{ backgroundColor: C.dark, border: `1px solid ${C.anthracite}` }}>
        <p className="font-bold mb-1" style={{ color: C.white }}>Clics réseaux sociaux — 7 derniers jours</p>
        <div className="flex gap-4 mb-4 flex-wrap">
          {[
            { label: "Instagram", total: PERF_DAILY_IG.reduce((a, b) => a + b, 0), color: "#E1306C" },
            { label: "Facebook",  total: PERF_DAILY_FB.reduce((a, b) => a + b, 0), color: "#1877F2" },
            { label: "Site web",  total: PERF_DAILY_WEB.reduce((a, b) => a + b, 0), color: "#10B981" },
          ].map(s => (
            <span key={s.label} className="flex items-center gap-1.5 text-xs font-semibold">
              <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: s.color }} />
              <span style={{ color: C.mist }}>{s.label}</span>
              <span style={{ color: s.color }}>{s.total} clics</span>
            </span>
          ))}
        </div>

        {/* Grouped bar chart SVG — 7 days */}
        <div className="flex items-end gap-3">
          {WEEK_DAYS.map((day, i) => (
            <div key={day} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end gap-0.5" style={{ height: 60 }}>
                {[
                  { val: PERF_DAILY_IG[i],   color: "#E1306C" },
                  { val: PERF_DAILY_FB[i],   color: "#1877F2" },
                  { val: PERF_DAILY_WEB[i],  color: "#10B981" },
                ].map((bar, bi) => (
                  <div key={bi} className="flex-1 rounded-t-sm transition-all"
                    style={{
                      height: `${Math.round((bar.val / maxBar) * 100)}%`,
                      backgroundColor: bar.color,
                      minHeight: bar.val > 0 ? 3 : 0,
                      opacity: 0.85,
                    }} />
                ))}
              </div>
              <span className="text-xs" style={{ color: C.steel }}>{day}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
