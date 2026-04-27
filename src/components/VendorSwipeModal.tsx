"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X, XCircle, Star, MapPin, ChevronLeft, ChevronRight, ArrowUpRight, RotateCcw } from "lucide-react";
import { C } from "@/lib/colors";
import { LS_LIKED, LS_SKIPPED, lsGet, lsAdd, lsRemove } from "@/lib/swipeStorage";

export interface VendorCard {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string | null;
  address: string | null;
  city: string | null;
  priceMin: number | null;
  priceMax: number | null;
  priceRange: string | null;
  rating: number | null;
  reviewCount: number;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  phone: string | null;
  email: string | null;
  region: string | null;
  verified: boolean;
  media: { url: string; order: number }[];
}

interface Props {
  workspaceId: string;
  plannerId?: string | null;
  categories: string[];
  initialCategory?: string;
  initialVendorSlug?: string;
  onClose: () => void;
  onBooked: (vendorId: string, vendorName: string, category: string) => void;
}

const SWIPE_THRESHOLD = 80;

type ReviewItem = { id: string; rating: number; comment: string | null; eventType: string | null; createdAt: string; author: { name: string | null; image: string | null } }

// Gradient + emoji par catégorie pour les cards sans photo
function categoryTheme(cat: string): { bg: string; emoji: string } {
  const c = cat.toLowerCase();
  if (c.includes("photographe") || c.includes("vidéaste") || c.includes("video")) return { bg: "linear-gradient(135deg,#1a0533,#3d0b6e,#1a0533)", emoji: "📸" };
  if (c.includes("traiteur") || c.includes("pâtissier") || c.includes("cake")) return { bg: "linear-gradient(135deg,#1a0a00,#4d2a00,#1a0a00)", emoji: "🍽️" };
  if (c.includes("décorateur") || c.includes("fleuriste")) return { bg: "linear-gradient(135deg,#001a0a,#004d1a,#001a0a)", emoji: "💐" };
  if (c.includes("lieu") || c.includes("réception")) return { bg: "linear-gradient(135deg,#0a0a1a,#1a1a4d,#0a0a1a)", emoji: "🏛️" };
  if (c.includes("makeup") || c.includes("hairstylist") || c.includes("spa") || c.includes("neggafa")) return { bg: "linear-gradient(135deg,#1a0011,#4d003d,#1a0011)", emoji: "💄" };
  if (c.includes("dj") || c.includes("orchestre") || c.includes("animateur") || c.includes("chanteur") || c.includes("violon")) return { bg: "linear-gradient(135deg,#001a1a,#00454d,#001a1a)", emoji: "🎵" };
  if (c.includes("wedding planner") || c.includes("event planner")) return { bg: "linear-gradient(135deg,#1a0a0a,#4d1a00,#1a0a0a)", emoji: "💍" };
  if (c.includes("transport") || c.includes("vtc") || c.includes("voiture")) return { bg: "linear-gradient(135deg,#0a1a0a,#1a3d1a,#0a1a0a)", emoji: "🚗" };
  if (c.includes("robe") || c.includes("mariée")) return { bg: "linear-gradient(135deg,#1a1a0a,#3d3d00,#1a1a0a)", emoji: "👗" };
  // fallback
  const hash = cat.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const hue = hash % 360;
  return { bg: `linear-gradient(135deg, hsl(${hue},40%,8%), hsl(${hue},50%,15%), hsl(${hue},40%,8%))`, emoji: "✨" };
}

function fmtStarting(min: number | null, max: number | null): string | null {
  const base = min ?? max;
  if (!base) return null;
  return `$${base.toLocaleString("fr-MA")}`;
}
function formatPrice(min: number | null, max: number | null) {
  if (min && max) return `$${min.toLocaleString("fr-MA")} – $${max.toLocaleString("fr-MA")}`;
  if (min) return `À partir de $${min.toLocaleString("fr-MA")}`;
  if (max) return `Jusqu'à $${max.toLocaleString("fr-MA")}`;
  return null;
}
function tierLabel(t: string | null) {
  if (t === "budget") return "Entrée de gamme";
  if (t === "mid")    return "Milieu de gamme";
  if (t === "premium") return "Haut de gamme";
  return null;
}

function Stars({ rating, size = 11 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={size}
          fill={rating >= i - 0.3 ? "currentColor" : "none"}
          style={{ color: rating >= i - 0.3 ? "#f59e0b" : "rgba(255,255,255,0.2)" }}
        />
      ))}
    </div>
  );
}

export default function VendorSwipeModal({ workspaceId, plannerId, categories, initialCategory, initialVendorSlug, onClose, onBooked }: Props) {
  const [vendors, setVendors]         = useState<VendorCard[]>([]);
  const [index, setIndex]             = useState(0);
  const [loading, setLoading]         = useState(true);
  const [bookedIds, setBookedIds]     = useState<Set<string>>(new Set());
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());

  // Pré-charger les favoris existants pour l'état visuel du bouton ♥
  useEffect(() => {
    fetch("/api/favorites")
      .then(r => r.ok ? r.json() : [])
      .then((data: { id: string }[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setFavoritedIds(new Set(data.map(f => f.id)));
        }
      })
      .catch(() => {});
  }, []);
  const [photoIdx, setPhotoIdx]       = useState(0);
  const [showDetail, setShowDetail]   = useState(false);

  // Drag on current card
  const [drag, setDrag]     = useState({ x: 0, y: 0 });
  const dragActive          = useRef(false);
  const dragStart           = useRef({ x: 0, y: 0 });
  const hasMoved            = useRef(false);
  const cardRef             = useRef<HTMLDivElement>(null);

  // Exiting card rendered separately so current card NEVER gets the exit transform
  const [exitDir, setExitDir]             = useState<"left" | "right" | null>(null);
  const [exitingVendor, setExitingVendor] = useState<VendorCard | null>(null);
  const [exitLaunched, setExitLaunched]   = useState(false);
  // Ghost starts at the finger's release position → 0 latency, no snap
  const [exitStartPos, setExitStartPos]   = useState({ x: 0, y: 0, r: 0 });

  // P1 — Undo, match animation, pagination
  const [history, setHistory]         = useState<{ vendor: VendorCard; dir: "left" | "right" }[]>([]);
  const [matchVendor, setMatchVendor] = useState<VendorCard | null>(null);
  const [hasMore, setHasMore]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const pageRef                       = useRef(1);
  const chipsRef                      = useRef<HTMLDivElement>(null);

  // P2 — Filtre catégorie inline
  const [activeCategory, setActiveCategory] = useState(initialCategory || categories[0] || "")

  // Reviews lazy
  const [reviews, setReviews]           = useState<ReviewItem[]>([])
  const [reviewsSlug, setReviewsSlug]   = useState<string | null>(null)
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Pré-charger les slugs déjà ajoutés à l'événement → auto-skip
  useEffect(() => {
    if (!plannerId) return
    fetch(`/api/planners/${plannerId}/vendors`)
      .then(r => r.ok ? r.json() : [])
      .then((data: unknown[]) => {
        const slugs = new Set((data as { vendorSlug: string }[]).map(pv => pv.vendorSlug))
        if (slugs.size > 0) setBookedIds(prev => new Set([...prev, ...slugs]))
      })
      .catch(() => {})
  }, [plannerId])

  const fetchPage = useCallback((page: number, append = false) => {
    const url = `/api/vendors?limit=20&page=${page}${activeCategory ? `&category=${encodeURIComponent(activeCategory)}` : ""}`;
    if (page === 1) setLoading(true); else setLoadingMore(true);
    const ctrl = new AbortController();
    fetch(url, { signal: ctrl.signal })
      .then(r => r.ok ? r.json() : null)
      .then((d: unknown) => {
        if (!d) return;
        // API returns { vendors: [...] } (ranked) or direct array (legacy)
        const raw = (Array.isArray(d) ? d : Array.isArray((d as Record<string, unknown>).vendors) ? (d as Record<string, unknown>).vendors : []) as VendorCard[];
        // Filter out vendors already skipped or liked (shared localStorage with widget)
        const skipped = plannerId ? lsGet(LS_SKIPPED(plannerId)) : new Set<string>();
        const liked = plannerId ? lsGet(LS_LIKED(plannerId)) : new Set<string>();
        const batch = raw.filter(v => !skipped.has(v.slug) && !liked.has(v.slug));
        if (raw.length < 20) setHasMore(false);
        setVendors(prev => append ? [...prev, ...batch] : batch);
      })
      .catch(() => {})
      .finally(() => { setLoading(false); setLoadingMore(false); });
    return () => ctrl.abort();
  }, [activeCategory, plannerId]);

  useEffect(() => {
    pageRef.current = 1;
    setHasMore(true);
    setHistory([]);
    setIndex(0);
    return fetchPage(1, false);
  }, [fetchPage]);

  // T2 — Sync mini→agrandi : quand la liste charge et qu'on a un vendor slug initial, positionner l'index dessus
  const initialSlugUsed = useRef(false);
  useEffect(() => {
    if (!initialVendorSlug || initialSlugUsed.current || vendors.length === 0) return;
    const idx = vendors.findIndex(v => v.slug === initialVendorSlug);
    if (idx >= 0) { setIndex(idx); initialSlugUsed.current = true; }
    else { initialSlugUsed.current = true; } // vendor pas trouvé dans cette page, on reste à 0
  }, [vendors, initialVendorSlug]);

  useEffect(() => { setPhotoIdx(0); setShowDetail(false); setDrag({ x: 0, y: 0 }); setReviews([]); setReviewsSlug(null); }, [index]);

  // Fetch reviews when detail opens (once per vendor)
  // Prefetch next page when 5 cards remaining
  useEffect(() => {
    if (!hasMore || loadingMore || vendors.length === 0) return;
    if (index >= vendors.length - 5) {
      pageRef.current += 1;
      fetchPage(pageRef.current, true);
    }
  }, [index, vendors.length, hasMore, loadingMore, fetchPage]);

  const current = vendors[index];
  const photos  = current?.media?.filter(m => m.url).map(m => m.url) ?? [];

  // Auto-skip vendor already in bookedIds (déjà ajouté à l'événement)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (!current || !bookedIds.has(current.slug)) return
    setIndex(i => i + 1)
  }, [current, bookedIds])

  // Fetch reviews when detail opens (once per vendor)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!showDetail || !current || reviewsSlug === current.slug) return;
    setReviewsLoading(true);
    fetch(`/api/reviews?slug=${encodeURIComponent(current.slug)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.reviews) { setReviews(d.reviews); setReviewsSlug(current.slug); } })
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  }, [showDetail, current?.slug]);

  // dragX/dragY passed explicitly so triggerSwipe doesn't capture stale closure values
  const triggerSwipe = useCallback(async (dir: "left" | "right", dragX = 0, dragY = 0) => {
    if (!current || exitingVendor) return;
    setShowDetail(false);
    setDrag({ x: 0, y: 0 });

    // 1. Push to history for undo
    setHistory(h => [...h.slice(-9), { vendor: current, dir }]);

    // 2. Save exact finger release position for 0-latency ghost start
    setExitStartPos({ x: dragX, y: dragY * 0.25, r: Math.max(-20, Math.min(20, dragX * 0.10)) });
    setExitingVendor(current);
    setExitDir(dir);
    setExitLaunched(false);

    // 3. Advance index immediately
    setIndex(i => i + 1);

    // 3b. Persist skip to shared localStorage (sync with widget)
    if (dir === "left" && plannerId) {
      lsAdd(LS_SKIPPED(plannerId), current.slug);
    }

    // 4. Double rAF: first frame commits ghost at start pos, second frame triggers transition
    requestAnimationFrame(() => requestAnimationFrame(() => setExitLaunched(true)));

    // 5. Haptic + preload next image
    try { navigator.vibrate?.(dir === "right" ? [12, 40, 20] : 8); } catch {}
    const nextPhoto = vendors[index + 1]?.media?.[0]?.url;
    if (nextPhoto) { const img = new window.Image(); img.src = nextPhoto; }

    // 6. Booking + match animation
    if (dir === "right" && !bookedIds.has(current.slug)) {
      setBookedIds(prev => new Set(prev).add(current.slug));
      setMatchVendor(current);
      setTimeout(() => setMatchVendor(null), 1400);
      try {
        await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vendorId: current.id, workspaceId, plannerId: plannerId ?? undefined, status: "inquiry" }),
        });
        onBooked(current.id, current.name, current.category);
      } catch { /* optimistic */ }
    }

    // 7. Clean up ghost — 290ms = 280ms transition + 10ms marge minimale
    setTimeout(() => { setExitingVendor(null); setExitDir(null); setExitLaunched(false); }, 290);
  }, [current, exitingVendor, bookedIds, workspaceId, plannerId, onBooked]);

  const undo = useCallback(() => {
    if (exitingVendor || history.length === 0) return;
    const last = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setIndex(i => Math.max(0, i - 1));
    if (last.dir === "right") setBookedIds(prev => { const s = new Set(prev); s.delete(last.vendor.slug); return s; });
    if (last.dir === "left" && plannerId) lsRemove(LS_SKIPPED(plannerId), last.vendor.slug);
  }, [exitingVendor, history]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (showDetail) { if (e.key === "Escape") setShowDetail(false); return; }
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") triggerSwipe("right");
      if (e.key === "ArrowLeft")  triggerSwipe("left");
      if (e.key === "z" && e.metaKey) undo();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showDetail, onClose, triggerSwipe, undo]);

  function onPointerDown(e: React.PointerEvent) {
    if (exitingVendor) return;
    dragActive.current = true;
    hasMoved.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY };
    cardRef.current?.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragActive.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) hasMoved.current = true;
    // En mode détail : drag visible uniquement si déplacement horizontal significatif
    if (!showDetail || Math.abs(dx) > 20) setDrag({ x: dx, y: dy });
  }
  function onPointerUp() {
    if (!dragActive.current) return;
    dragActive.current = false;
    if (!hasMoved.current) {
      // Tap : en mode détail → ferme le détail, sinon → ouvre
      setShowDetail(v => !v);
      setDrag({ x: 0, y: 0 });
      return;
    }
    if (drag.x > SWIPE_THRESHOLD)       triggerSwipe("right", drag.x, drag.y);
    else if (drag.x < -SWIPE_THRESHOLD) triggerSwipe("left", drag.x, drag.y);
    else setDrag({ x: 0, y: 0 });
  }

  const rotation = Math.max(-20, Math.min(20, drag.x * 0.10));
  const yesOp    = Math.min(1, Math.max(0, drag.x / SWIPE_THRESHOLD));
  const noOp     = Math.min(1, Math.max(0, -drag.x / SWIPE_THRESHOLD));

  // Current card transform: drag only — NEVER exit transform
  const cardTransform = (): React.CSSProperties => {
    if (dragActive.current) return { transform: `translateX(${drag.x}px) translateY(${drag.y * 0.25}px) rotate(${rotation}deg)`, transition: "none" };
    return { transform: "translateX(0) rotate(0deg)", transition: "transform 0.28s cubic-bezier(0.34,1.3,0.64,1)" };
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" style={{ backdropFilter: "blur(16px)", backgroundColor: "rgba(0,0,0,0.72)" }} onClick={onClose} />

      {/* Match animation */}
      {matchVendor && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center pointer-events-none"
          style={{ animation: "matchPop 1.4s ease forwards" }}>
          <style>{`@keyframes matchPop { 0%{opacity:0;transform:scale(0.85)} 15%{opacity:1;transform:scale(1.04)} 25%{transform:scale(1)} 80%{opacity:1} 100%{opacity:0} }`}</style>
          <div className="px-8 py-6 rounded-3xl text-center"
            style={{ backgroundColor: "rgba(34,197,94,0.15)", border: "2px solid #22c55e", backdropFilter: "blur(12px)" }}>
            <p className="text-4xl mb-2">❤️</p>
            <p className="text-xl font-black text-white">Sélectionné !</p>
            <p className="text-sm font-semibold mt-1" style={{ color: "#22c55e" }}>{matchVendor.name}</p>
          </div>
        </div>
      )}

      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none select-none p-3">

        {/* Header */}
        <div className="pointer-events-auto w-full max-w-[648px] px-2 mb-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-white">
              {activeCategory ? `Trouver un·e ${activeCategory}` : "Découvrir des prestataires"}
            </p>
            <div className="flex items-center gap-2">
              {loadingMore && <div className="w-3 h-3 rounded-full border border-t-transparent animate-spin" style={{ borderColor: `${C.terra} transparent transparent transparent` }} />}
              <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                {vendors.length > 0 && index < vendors.length ? `${index + 1}/${vendors.length}${hasMore ? "+" : ""}` : ""}
              </span>
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-70" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                <X size={14} color="#fff" />
              </button>
            </div>
          </div>
          {/* Chips catégorie inline */}
          {categories.length > 1 && (
            <div className="relative flex items-center">
              <button onClick={() => chipsRef.current?.scrollBy({ left: -200, behavior: "smooth" })}
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}>
                <ChevronLeft size={13} color="rgba(255,255,255,0.7)" />
              </button>
              <div ref={chipsRef} className="flex gap-1.5 overflow-x-auto pb-1 mx-1.5" style={{ scrollbarWidth: "none" }}>
                <button onClick={() => setActiveCategory("")}
                  className="flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold transition-all"
                  style={{ backgroundColor: activeCategory === "" ? C.terra : "rgba(255,255,255,0.1)", color: "#fff", border: activeCategory === "" ? "none" : "1px solid rgba(255,255,255,0.15)" }}>
                  Tous
                </button>
                {categories.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    className="flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold transition-all capitalize"
                    style={{ backgroundColor: activeCategory === cat ? C.terra : "rgba(255,255,255,0.1)", color: "#fff", border: activeCategory === cat ? "none" : "1px solid rgba(255,255,255,0.15)" }}>
                    {cat}
                  </button>
                ))}
              </div>
              <button onClick={() => chipsRef.current?.scrollBy({ left: 200, behavior: "smooth" })}
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}>
                <ChevronRight size={13} color="rgba(255,255,255,0.7)" />
              </button>
            </div>
          )}
        </div>

        {/* Stack */}
        <div className="pointer-events-auto relative w-full max-w-[648px]" style={{ height: "calc(100dvh - 133px)", maxHeight: 972 }}>

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${C.terra} transparent transparent transparent` }} />
            </div>
          )}

          {!loading && !current && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl"
              style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <span className="text-5xl">🎉</span>
              <p className="font-bold text-white">Vous avez tout vu !</p>
              <p className="text-sm text-center px-8" style={{ color: "rgba(255,255,255,0.4)" }}>Tous les prestataires ont été parcourus.</p>
            </div>
          )}

          {/* Preview peek — toujours visible (carte N+1), scale 0.92 → 1 au swipe */}
          {(() => {
            const nv = exitingVendor ? vendors[index] : vendors[index + 1];
            if (!nv) return null;
            const np = nv.media?.filter((m: { url: string }) => m.url).map((m: { url: string }) => m.url) ?? [];
            const launched = exitingVendor ? exitLaunched : false;
            return (
              <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none"
                style={{
                  zIndex: 2,
                  transform: launched ? "scale(1)" : "scale(0.92)",
                  transformOrigin: "center center",
                  transition: exitingVendor ? "transform 0.44s cubic-bezier(0.34,1.1,0.64,1)" : "none",
                  boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
                }}>
                {np[0] ? (
                  <Image fill src={np[0]} alt="" sizes="800px"
                    style={{ objectFit: "cover", filter: launched ? "none" : "blur(4px) brightness(0.5) saturate(0.6)", transition: "filter 0.44s ease" }} />
                ) : (
                  <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#2a1a0e,#3d2510,#1a0e05)" }} />
                )}
                <div className="absolute inset-0"
                  style={{ backgroundColor: launched ? "rgba(0,0,0,0)" : "rgba(0,0,0,0.35)", transition: "background-color 0.44s ease" }} />
                <div className="absolute bottom-0 left-0 right-0 px-4 pt-16 pb-4"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.88), transparent)", opacity: launched ? 1 : 0.6, transition: "opacity 0.44s ease" }}>
                  <p className="text-base font-bold text-white truncate">{nv.name}</p>
                  {nv.city && <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{nv.city}</p>}
                </div>
              </div>
            );
          })()}

          {/* Ghost card — the card that's leaving, rendered on top, flies off */}
          {exitingVendor && (() => {
            const gp = exitingVendor.media?.filter((m: { url: string }) => m.url).map((m: { url: string }) => m.url) ?? [];
            const txFinal = exitDir === "right" ? "translateX(160%) rotate(28deg)" : "translateX(-160%) rotate(-28deg)";
            const txStart = `translateX(${exitStartPos.x}px) translateY(${exitStartPos.y}px) rotate(${exitStartPos.r}deg)`;
            return (
              <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none"
                style={{
                  zIndex: 20,
                  // Start at finger release position → no snap, 0 latency
                  transform: exitLaunched ? txFinal : txStart,
                  transition: exitLaunched ? "transform 0.28s cubic-bezier(0.4,0,1,1)" : "none",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                }}>
                {gp[0] ? (
                  <Image fill src={gp[0]} alt="" sizes="800px" style={{ objectFit: "cover" }} />
                ) : (
                  <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#2a1a0e,#3d2510,#1a0e05)" }} />
                )}
                <div className="absolute bottom-0 left-0 right-0 px-4 pt-16 pb-4"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.88), transparent)" }}>
                  <p className="text-lg font-bold text-white truncate">{exitingVendor.name}</p>
                  {exitingVendor.city && <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>{exitingVendor.city}</p>}
                  {fmtStarting(exitingVendor.priceMin ?? null, exitingVendor.priceMax ?? null) && (
                    <p className="text-sm font-bold mt-1" style={{ color: C.terra }}>{fmtStarting(exitingVendor.priceMin ?? null, exitingVendor.priceMax ?? null)}</p>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Main card — always clean, key=index ensures fresh mount every time */}
          {current && (
            <div key={index} ref={cardRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              className="absolute inset-0 rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing"
              style={{ ...cardTransform(), touchAction: "none", boxShadow: "0 8px 24px rgba(0,0,0,0.25)", zIndex: 10 }}
            >
              {/* ── Photo (full card) ── */}
              {photos.length > 0 ? (
                <Image
                  fill
                  src={photos[photoIdx]}
                  alt={current.name}
                  sizes="(max-width: 768px) 100vw, 800px"
                  style={{ objectFit: "cover", transition: "filter 0.3s ease", filter: showDetail ? "blur(12px) brightness(0.25) saturate(0.4)" : "none" }}
                  priority
                />
              ) : (
                <div className="absolute inset-0"
                  style={{ background: categoryTheme(current.category).bg, filter: showDetail ? "blur(12px) brightness(0.2)" : "none", transition: "filter 0.3s ease" }}>
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                    <span className="text-7xl opacity-30">{categoryTheme(current.category).emoji}</span>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)" }}>Photos bientôt disponibles</span>
                  </div>
                </div>
              )}

              {/* Photo dots + navigation (top) */}
              {photos.length > 1 && !showDetail && (
                <>
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                    {photos.map((_, i) => (
                      <div key={i} className="rounded-full transition-all"
                        style={{ height: 3, width: i === photoIdx ? 18 : 4, backgroundColor: i === photoIdx ? "#fff" : "rgba(255,255,255,0.4)" }} />
                    ))}
                  </div>
                  <button onPointerDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); setPhotoIdx(i => Math.max(0, i - 1)); }}
                    className="absolute left-0 top-0 bottom-[160px] w-1/3 z-10" style={{ opacity: 0 }} />
                  <button onPointerDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); setPhotoIdx(i => Math.min(photos.length - 1, i + 1)); }}
                    className="absolute right-0 top-0 bottom-[160px] w-1/3 z-10" style={{ opacity: 0 }} />
                </>
              )}

              {/* Category badge top-left */}
              {!showDetail && (
                <div className="absolute top-4 left-4 z-10 px-2.5 py-1 rounded-xl text-[10px] font-bold"
                  style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", color: "#fff" }}>
                  {current.category}
                </div>
              )}

              {/* ── Bottom info bar (no detail) ── */}
              {!showDetail && (
                <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pt-16 pb-4"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.7) 60%, transparent 100%)" }}>
                  <div className="flex items-end justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-bold leading-tight text-white truncate">{current.name}</p>
                      {(current.city || current.address) && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin size={10} style={{ color: "rgba(255,255,255,0.5)" }} />
                          <span className="text-[11px] truncate" style={{ color: "rgba(255,255,255,0.5)" }}>{current.city || current.address}</span>
                        </div>
                      )}
                      {fmtStarting(current?.priceMin ?? null, current?.priceMax ?? null) && (
                        <p className="text-sm font-bold mt-1" style={{ color: C.terra }}>{fmtStarting(current?.priceMin ?? null, current?.priceMax ?? null)}</p>
                      )}
                    </div>
                    {current.rating != null && (
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-bold" style={{ color: "#f59e0b" }}>{current.rating.toFixed(1)}</span>
                          <Star size={13} fill="#f59e0b" style={{ color: "#f59e0b" }} />
                        </div>
                        <Stars rating={current.rating} />
                        {current.reviewCount > 0 && <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>{current.reviewCount} avis</span>}
                      </div>
                    )}
                  </div>
                  {/* Chips de contact/social — uniquement si renseignées */}
                  {(current.phone || current.instagram || current.facebook || current.website) ? (
                    <div className="flex flex-wrap gap-1.5 mt-2.5" onPointerDown={e => e.stopPropagation()}>
                      {current.phone && (
                        <a href={`tel:${current.phone}`} onClick={e => e.stopPropagation()}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold hover:opacity-80 transition-opacity"
                          style={{ backgroundColor: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.3)", color: "#4ade80" }}>
                          📞 {current.phone}
                        </a>
                      )}
                      {current.instagram && (
                        <a href={`https://instagram.com/${current.instagram.replace("@","")}`} target="_blank" rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold hover:opacity-80 transition-opacity"
                          style={{ backgroundColor: "rgba(225,48,108,0.15)", border: "1px solid rgba(225,48,108,0.3)", color: "#f472b6" }}>
                          <span className="text-[9px] font-black px-0.5 rounded" style={{ background: "linear-gradient(135deg,#f09433,#dc2743,#bc1888)", color: "#fff" }}>IG</span>
                          @{current.instagram.replace("@","")}
                        </a>
                      )}
                      {current.facebook && (
                        <a href={current.facebook.startsWith("http") ? current.facebook : `https://facebook.com/${current.facebook}`}
                          target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold hover:opacity-80 transition-opacity"
                          style={{ backgroundColor: "rgba(24,119,242,0.15)", border: "1px solid rgba(24,119,242,0.35)", color: "#60a5fa" }}>
                          <span className="font-black" style={{ color: "#1877f2" }}>f</span> Facebook
                        </a>
                      )}
                      {current.website && (
                        <a href={current.website} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold hover:opacity-80 transition-opacity"
                          style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.65)" }}>
                          🌐 Site web
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2.5">
                      <span className="text-[10px] px-2 py-1 rounded-lg"
                        style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.25)" }}>
                        📋 Profil en cours de mise à jour
                      </span>
                    </div>
                  )}
                  <p className="text-[10px] mt-2 text-center" style={{ color: "rgba(255,255,255,0.25)" }}>Appuyer pour les détails · Glisser pour choisir</p>
                </div>
              )}

              {/* ── Detail overlay (full card, transparent on blurred photo) ── */}
              <div
                className="absolute inset-0 z-20 overflow-y-auto"
                style={{
                  transform: showDetail ? "translateY(0)" : "translateY(100%)",
                  transition: "transform 0.38s cubic-bezier(0.32,0.72,0,1)",
                  pointerEvents: showDetail ? "auto" : "none",
                  scrollbarWidth: "none",
                }}
                onPointerDown={e => e.stopPropagation()}
              >
                <div className="px-5 pt-5 pb-6 flex flex-col gap-4" style={{ minHeight: "100%" }}>

                  {/* Top row: name + close */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-black text-white text-xl leading-tight drop-shadow-lg">{current.name}</p>
                        {current.verified && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0"
                            style={{ backgroundColor: "rgba(74,222,128,0.2)", border: "1px solid rgba(74,222,128,0.4)", color: "#4ade80" }}>
                            ✓ Vérifié
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold mt-0.5 drop-shadow" style={{ color: C.terra }}>{current.category}</p>
                    </div>
                    <button onClick={() => setShowDetail(false)}
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 hover:opacity-70 mt-0.5"
                      style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.12)" }}>
                      <X size={13} color="rgba(255,255,255,0.8)" />
                    </button>
                  </div>

                  {/* Rating */}
                  {current.rating != null && (
                    <div className="flex items-center gap-2">
                      <Stars rating={current.rating} size={13} />
                      <span className="text-sm font-bold drop-shadow" style={{ color: "#f59e0b" }}>{current.rating.toFixed(1)}</span>
                      {current.reviewCount > 0 && (
                        <span className="text-[11px] drop-shadow" style={{ color: "rgba(255,255,255,0.5)" }}>{current.reviewCount} avis</span>
                      )}
                    </div>
                  )}

                  {/* Location → Google Maps */}
                  {(current.city || current.address || current.region) && (() => {
                    const loc = [current.address, current.city].filter(Boolean).join(", ");
                    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc || current.region || "")}`;
                    return (
                      <div className="flex flex-col gap-1">
                        <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                          onPointerDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)" }}>
                            <MapPin size={13} style={{ color: "#4ade80" }} />
                          </div>
                          <div>
                            {loc && <span className="text-xs font-medium drop-shadow underline underline-offset-2 decoration-dotted block"
                              style={{ color: "rgba(255,255,255,0.75)" }}>{loc}</span>}
                            {current.region && <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>{current.region}</span>}
                          </div>
                        </a>
                      </div>
                    );
                  })()}

                  {/* Budget */}
                  {(fmtStarting(current.priceMin, current.priceMax) || current.priceRange) && (
                    <div className="p-3 rounded-2xl"
                      style={{ backgroundColor: "rgba(0,0,0,0.38)", backdropFilter: "blur(8px)", border: "1px solid rgba(var(--momento-terra-rgb),0.3)" }}>
                      <p className="text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Budget</p>
                      {fmtStarting(current.priceMin, current.priceMax) && (
                        <p className="text-2xl font-black drop-shadow" style={{ color: C.terra }}>{fmtStarting(current.priceMin, current.priceMax)}</p>
                      )}
                      {tierLabel(current.priceRange) && (
                        <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{tierLabel(current.priceRange)}</p>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  {current.description && (
                    <div className="p-3 rounded-2xl"
                      style={{ backgroundColor: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)" }}>
                      <p className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>À propos</p>
                      <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>{current.description}</p>
                    </div>
                  )}

                  {/* Message si profil incomplet */}
                  {!current.description && !current.phone && !current.instagram && !current.facebook && !current.website && !current.email && !current.address && !current.city && (
                    <div className="flex flex-col items-center gap-2 py-4 rounded-2xl"
                      style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <span className="text-2xl opacity-50">{categoryTheme(current.category).emoji}</span>
                      <p className="text-sm font-semibold text-center" style={{ color: "rgba(255,255,255,0.5)" }}>Profil en cours de mise à jour</p>
                      <p className="text-[11px] text-center px-4" style={{ color: "rgba(255,255,255,0.3)" }}>
                        Ce prestataire n'a pas encore renseigné ses informations de contact.
                      </p>
                    </div>
                  )}

                  {/* Social links */}
                  <div className="flex flex-col gap-2">
                    {current.phone && (
                      <a href={`tel:${current.phone}`}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: "rgba(0,0,0,0.38)", backdropFilter: "blur(8px)", border: "1px solid rgba(74,222,128,0.2)" }}
                        onPointerDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: "rgba(74,222,128,0.15)" }}>
                          <span className="text-[10px] font-black" style={{ color: "#4ade80" }}>📞</span>
                        </div>
                        <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>{current.phone}</span>
                        <ArrowUpRight size={11} style={{ color: "rgba(255,255,255,0.35)", marginLeft: "auto" }} />
                      </a>
                    )}
                    {current.instagram && (
                      <a href={`https://instagram.com/${current.instagram.replace("@","")}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: "rgba(0,0,0,0.38)", backdropFilter: "blur(8px)", border: "1px solid rgba(225,48,108,0.25)" }}
                        onPointerDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: "linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)" }}>
                          <span className="text-[10px] font-black text-white">IG</span>
                        </div>
                        <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>@{current.instagram.replace("@","")}</span>
                        <ArrowUpRight size={11} style={{ color: "rgba(255,255,255,0.35)", marginLeft: "auto" }} />
                      </a>
                    )}
                    {current.facebook && (
                      <a href={current.facebook.startsWith("http") ? current.facebook : `https://facebook.com/${current.facebook}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: "rgba(0,0,0,0.38)", backdropFilter: "blur(8px)", border: "1px solid rgba(24,119,242,0.25)" }}
                        onPointerDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: "#1877f2" }}>
                          <span className="text-[11px] font-black text-white">f</span>
                        </div>
                        <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>Facebook</span>
                        <ArrowUpRight size={11} style={{ color: "rgba(255,255,255,0.35)", marginLeft: "auto" }} />
                      </a>
                    )}
                    {current.website && (
                      <a href={current.website} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: "rgba(0,0,0,0.38)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)" }}
                        onPointerDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                          <ArrowUpRight size={11} style={{ color: "rgba(255,255,255,0.6)" }} />
                        </div>
                        <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>Site web</span>
                        <ArrowUpRight size={11} style={{ color: "rgba(255,255,255,0.3)", marginLeft: "auto" }} />
                      </a>
                    )}
                  </div>

                  {/* Email */}
                  {current.email && (
                    <a href={`mailto:${current.email}`}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: "rgba(0,0,0,0.38)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)" }}
                      onPointerDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                        <span className="text-[10px]">✉️</span>
                      </div>
                      <span className="text-xs font-semibold truncate" style={{ color: "rgba(255,255,255,0.75)" }}>{current.email}</span>
                      <ArrowUpRight size={11} style={{ color: "rgba(255,255,255,0.35)", marginLeft: "auto", flexShrink: 0 }} />
                    </a>
                  )}

                  {/* Avis textuels */}
                  {(reviews.length > 0 || reviewsLoading) && (
                    <div className="flex flex-col gap-2">
                      <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: "rgba(255,255,255,0.35)" }}>
                        Avis clients
                      </p>
                      {reviewsLoading && (
                        <div className="h-8 rounded-xl animate-pulse" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
                      )}
                      {reviews.slice(0, 3).map(r => (
                        <div key={r.id} className="p-3 rounded-2xl flex flex-col gap-1.5"
                          style={{ backgroundColor: "rgba(0,0,0,0.32)", border: "1px solid rgba(255,255,255,0.07)" }}>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                                style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)" }}>
                                {r.author.name?.[0]?.toUpperCase() ?? "?"}
                              </div>
                              <span className="text-[11px] font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>
                                {r.author.name ?? "Anonyme"}
                              </span>
                              {r.eventType && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-md" style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}>
                                  {r.eventType}
                                </span>
                              )}
                            </div>
                            <Stars rating={r.rating} size={9} />
                          </div>
                          {r.comment && (
                            <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>{r.comment}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Lien profil complet */}
                  <a href={`/vendor/${current.slug}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 rounded-2xl hover:opacity-80 transition-opacity mt-1"
                    style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                    onPointerDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
                    <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>Voir le profil complet</span>
                    <ArrowUpRight size={12} style={{ color: "rgba(255,255,255,0.4)" }} />
                  </a>

                  <div className="flex-1" />
                </div>
              </div>

              {/* YES / PASS badges */}
              <div className="absolute top-5 left-4 z-30 px-4 py-2 rounded-xl border-2 pointer-events-none"
                style={{ opacity: yesOp, borderColor: "#22c55e", transform: "rotate(-12deg)", backgroundColor: "rgba(34,197,94,0.15)" }}>
                <span className="text-base font-black tracking-wide" style={{ color: "#22c55e" }}>OUI ❤️</span>
              </div>
              <div className="absolute top-5 right-4 z-30 px-4 py-2 rounded-xl border-2 pointer-events-none"
                style={{ opacity: noOp, borderColor: "#ef4444", transform: "rotate(12deg)", backgroundColor: "rgba(239,68,68,0.15)" }}>
                <span className="text-base font-black tracking-wide" style={{ color: "#ef4444" }}>PASS ✕</span>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        {current && !loading && (
          <div className="pointer-events-auto flex items-center gap-4 mt-5">
            {/* ✕ Skip */}
            <button
              onClick={() => triggerSwipe("left")}
              className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "2px solid rgba(239,68,68,0.3)" }}>
              <XCircle size={26} style={{ color: "#ef4444" }} />
            </button>
            {/* ↩ Rewind */}
            <button onClick={undo} disabled={history.length === 0}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: history.length > 0 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.07)", border: history.length > 0 ? "1.5px solid rgba(255,255,255,0.35)" : "1px solid rgba(255,255,255,0.15)" }}
              title="Annuler">
              <RotateCcw size={15} color={history.length > 0 ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)"} />
            </button>
            {/* ♥ Favori */}
            <button
              onClick={() => {
                if (!current) return
                const isFav = favoritedIds.has(current.slug)
                setFavoritedIds(prev => { const s = new Set(prev); isFav ? s.delete(current.slug) : s.add(current.slug); return s; })
                fetch(`/api/vendor/${current.slug}/favorite`, { method: "POST" }).catch(() => {})
              }}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              style={{ backgroundColor: current && favoritedIds.has(current.slug) ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.07)", border: current && favoritedIds.has(current.slug) ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(255,255,255,0.15)" }}
              title={current && favoritedIds.has(current.slug) ? "Retirer des favoris" : "Ajouter aux favoris"}>
              <span style={{ fontSize: "var(--text-md)", color: current && favoritedIds.has(current.slug) ? "#ef4444" : "rgba(255,255,255,0.7)" }}>♥</span>
            </button>
            {/* 🎉 Sélectionner */}
            <button
              onClick={() => triggerSwipe("right")}
              className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              style={{ backgroundColor: "rgba(34,197,94,0.1)", border: "2px solid rgba(34,197,94,0.3)" }}>
              <span style={{ fontSize: "var(--text-xl)" }}>🎉</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
