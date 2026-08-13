"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
// import { useAuth } from "@/lib/AuthContext";
import { fetchProfile } from "@/lib/api/profileApi";
import {
    AlertTriangle,
    BadgeCheck,
    Ban,
    CalendarDays,
    Camera,
    Check,
    ChevronLeft,
    ChevronRight,
    Download,
    Droplet,
    FlameKindling,
    Heart,
    Leaf,
    Lock,
    MapPin,
    Maximize2,
    Play,
    Recycle,
    RefreshCw,
    RotateCcw,
    Ruler,
    Share2,
    ShieldCheck,
    ShoppingBag,
    Sparkle,
    Sparkles,
    Tag,
    Info,
    ThumbsDown,
    ThumbsUp,
    Trees,
    Truck,
    UploadCloud,
    Users,
    Wind,
    X,
} from "lucide-react";
import { Product, Status } from "@/lib/types/product";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/lib/CartContext";
import {
    DeliverableProduct,
    calculateFlexDeliveryFee,
    deliveryChannelsFor,
    distanceKm,
    formatPickupDays,
    getDeliveryMode,
    normalizeFulfillment,
    resolveDistanceBucket,
    toNumber,
} from "@/lib/delivery";
import { toast } from "react-toastify";
import { useFavorites } from "@/lib/FavoritesContext";
import api from "@/lib/axios";

// Leaflet touches `window` at import time — client-only load
const PickupLocationMap = dynamic(() => import("@/components/PickupLocationMap"), {
    ssr: false,
    loading: () => (
        <div className="h-[200px] w-full rounded-xl bg-[#FDFAF6] border border-[#EBE3D5] flex items-center justify-center">
            <p className="text-[12px] text-[#8C7E74]">Loading map…</p>
        </div>
    ),
});

/* ─── Types ──────────────────────────────────────────────── */
type MediaItem = { type: "image" | "video"; src: string; label: string };
type TryOnStep = "upload" | "processing" | "result";
type DetailTab = "description" | "details" | "care";

type StatusConfig = {
    pill: string;
    label: string;
};

const STATUS_CONFIG: Record<string, StatusConfig> = {
    THRIFT: {
        pill: "bg-[#1A130E] text-[#FAF6F0]",
        label: "THRIFT",
    },
    RENT: {
        pill: "bg-[#3D5C30] text-white",
        label: "RENT",
    },
    "THRIFT + RENT": {
        pill: "bg-[#9E2A1B] text-white",
        label: "THRIFT + RENT",
    },
};

/* ─── Care icon resolver ──────────────────────────────────── */
function resolveCareIcon(text: string) {
    const t = text.toLowerCase();
    if (t.includes("wash") || t.includes("cold")) return Droplet;
    if (t.includes("dry") || t.includes("flat") || t.includes("air")) return Wind;
    if (t.includes("steam") || t.includes("iron")) return FlameKindling;
    if (t.includes("bleach") || t.includes("not")) return Ban;
    if (t.includes("hang") || t.includes("store") || t.includes("hanger")) return RefreshCw;
    return Leaf;
}

/* ─── Seller initials helper ──────────────────────────────── */
function getInitials(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

/* ─── Date helpers (vanilla JS — no date-fns dependency) ───── */
function startOfDay(date: Date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

function isSameDay(a: Date, b: Date) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

function isPastDate(date: Date) {
    return startOfDay(date) < startOfDay(new Date());
}

function diffInDays(a: Date, b: Date) {
    const ms = startOfDay(a).getTime() - startOfDay(b).getTime();
    return Math.round(ms / 86400000);
}

function formatShortDate(date: Date) {
    return date.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
}

/* ─── Rent-duration range parser ─────────────────────────────
   Backend only exposes a single `product.rentDuration` string in
   the shape "20 June 2026 to 27 June 2026". This parses that into
   real Date objects so both the "Currently on Rent" card and the
   date-picker calendar can block/display the same real range.
   Returns null when the field is missing or unparsable. ─────── */
function parseRentDurationRange(raw?: string): { start: Date; end: Date } | null {
    if (!raw) return null;
    const [startRaw, endRaw] = raw.split(/\s+to\s+/i);
    if (!startRaw || !endRaw) return null;
    const start = new Date(startRaw.trim());
    const end = new Date(endRaw.trim());
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
    return { start: startOfDay(start), end: startOfDay(end) };
}

/* ─── Calendar grid builder — returns real Date objects so past
   dates, month rollovers, and range math all just work. ────── */
function buildCalendarMatrix(year: number, month: number): Date[] {
    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: Date[] = [];
    for (let i = startWeekday; i > 0; i--) {
        cells.push(new Date(year, month, 1 - i));
    }
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push(new Date(year, month, d));
    }
    while (cells.length % 7 !== 0) {
        const last = cells[cells.length - 1];
        cells.push(new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1));
    }
    return cells;
}

/* ─── Day state resolver. Past dates are ALWAYS blocked, and any
   date falling inside the listing's real active rental range
   (bookedRange, derived from product.rentDuration) is blocked too. */
type DayState = "past" | "out-of-month" | "unavailable" | "few-left" | "available" | "range-start" | "range-end" | "in-range";

function getDayState(
    date: Date,
    month: number,
    start: Date | null,
    end: Date | null,
    bookedRange: { start: Date; end: Date } | null = null,
): DayState {
    const inMonth = date.getMonth() === month;
    if (!inMonth) return "out-of-month";
    if (isPastDate(date)) return "past";
    if (start && isSameDay(date, start)) return "range-start";
    if (end && isSameDay(date, end)) return "range-end";
    if (start && end && date > start && date < end) return "in-range";
    if (bookedRange && date >= bookedRange.start && date <= bookedRange.end) return "unavailable";
    return "available";
}

/* ─── Hybrid-aware status tag resolver ──────────────────────
   - THRIFT + RENT items ALWAYS show a "THRIFT + RENT" tag,
     colored red on thrift-context surfaces and grey on
     rent-context surfaces.
   - THRIFT-only items show a plain "THRIFT" tag.
   - RENT-only items show a plain "RENT" tag.
*/
function getContextTag(status: Status, context: "thrift" | "rent") {
    if (status === "THRIFT + RENT") {
        return {
            label: "THRIFT + RENT",
            className:
                context === "thrift"
                    ? "bg-[#9E2A1B] text-white"
                    : "bg-[#5C5C5C] text-white",
        };
    }
    if (status === "THRIFT") {
        return { label: "THRIFT", className: "bg-[#1A130E] text-white" };
    }
    return { label: "RENT", className: "bg-[#3D5C30] text-white" };
}

/* ─── Delivery option tag row — Shipping / Pickup / Free ─────
   All branching now lives in one place: getDeliveryMode().
   - SHIPPING_FREE     → "Shipping · Free"
   - SHIPPING_FIXED    → "Shipping"
   - SHIPPING_DYNAMIC  → "Shipping"
   - PICKUP            → "Pickup"
   - FLEX              → both tags together
   "Free" is NEVER shown unless the resolved mode is explicitly
   SHIPPING_FREE — no defaulting when data is missing. */
function DeliveryOptionTags({ product }: { product: DeliverableProduct }) {
    const mode = getDeliveryMode(product);

    const pill =
        "inline-flex items-center gap-1 rounded-full bg-[#9E2A1B] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white";

    switch (mode) {
        case "SHIPPING_FREE":
            return (
                <div className="flex flex-wrap items-center justify-end gap-1.5">
                    <span className={pill}>
                        <Truck size={11} />
                        Shipping · Free
                    </span>
                </div>
            );
        case "SHIPPING_FIXED":
        case "SHIPPING_DYNAMIC":
            return (
                <div className="flex flex-wrap items-center justify-end gap-1.5">
                    <span className={pill}>
                        <Truck size={11} />
                        Shipping
                    </span>
                </div>
            );
        case "PICKUP":
            return (
                <div className="flex flex-wrap items-center justify-end gap-1.5">
                    <span className={pill}>
                        <MapPin size={11} />
                        Pickup
                    </span>
                </div>
            );
        case "FLEX":
            return (
                <div className="flex flex-wrap items-center justify-end gap-1.5">
                    <span className={pill}>
                        <Truck size={11} />
                        Shipping
                    </span>
                    <span className={pill}>
                        <MapPin size={11} />
                        Pickup
                    </span>
                </div>
            );
    }
}

/* ══════════════════════════════════════════════════════════
   ROOT COMPONENT
══════════════════════════════════════════════════════════ */
export default function ProductDetailClient({
                                                product,
                                                recommendations,
                                            }: {
    product: Product;
    recommendations: Product[];
}) {

    console.log("Delivery product:", product);
    const router = useRouter();
    const searchParams = useSearchParams();

    const { authed, user } = useAuth();
    const { isFavorite, toggleFavorite } = useFavorites();
    const { cartItems } = useCart();
    const isFav = isFavorite(String(product.id));

    function mapAvailability(value?: string): "Available" | "Limited Dates" | "Unavailable" | "Sold" {
        if (value === "Available") return "Available";
        if (value === "Reserved") return "Limited Dates";
        return "Unavailable";
    }

    function handleToggleFavorite() {
        const nowFavorited = toggleFavorite({
            id: String(product.id),
            name: product.name,
            brand: product.brand,
            image: product.image,
            price: isRent ? `${dailyRate} / day` : product.price,
            status: product.status,
            category: isRent ? "rent" : "thrift",
            size: product.size,
            availability: mapAvailability(product.availability),
        });

        toast[nowFavorited ? "success" : "info"](
            nowFavorited ? "Added to favourites" : "Removed from favourites",
            { autoClose: 2000 }
        );
    }

    const media = useMemo<MediaItem[]>(
        () => [
            ...product.gallery.slice(0, 4).map((src, i) => ({
                type: "image" as const,
                src,
                label: `View ${i + 1}`,
            })),
            ...(product.videoUrl
                ? [{ type: "video" as const, src: product.videoUrl, label: "Video" }]
                : []),
        ],
        [product.gallery, product.videoUrl],
    );

    const [selectedMedia, setSelectedMedia] = useState(media[0]);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [tryOnOpen, setTryOnOpen] = useState(false);
    const [thriftModalOpen, setThriftModalOpen] = useState(false);
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<DetailTab>("description");

    /* ── Rent date-range calendar state ── */
    const today = useMemo(() => new Date(), []);
    const [calYear, setCalYear] = useState(today.getFullYear());
    const [calMonth, setCalMonth] = useState(today.getMonth());
    const [selectedStart, setSelectedStart] = useState<Date | null>(null);
    const [selectedEnd, setSelectedEnd] = useState<Date | null>(null);
    const [dateError, setDateError] = useState<string | null>(null);

    /* ── Rent date-picker modal + Rent Now modal ── */
    const [dateModalOpen, setDateModalOpen] = useState(false);
    const [rentModalOpen, setRentModalOpen] = useState(false);

    const view = searchParams.get("view"); // "thrift" | "rent" | null
    const isHybridListing = product.status === "THRIFT + RENT";

    const isThrift = product.status === "THRIFT" || (isHybridListing && view !== "rent");
    const isRent = product.status === "RENT" || (isHybridListing && view === "rent");
    const isHybrid = isHybridListing;

    // Real seller data — always present now, no fallback hack needed.
    const sellerName = product.seller.name;
    const sellerAvatarUrl = product.seller.avatarUrl;
    const sellerId = product.seller.id;   // ← add this line

    /* ── Cart / ownership derived state ──────────────────────
       Drives the Buy Now / Rent Now → Go to Cart / View Listing
       button swap (see sections 2 & 3). */
    const isInCart = cartItems.some((i) => i.id === product.id);
    const isOwner = authed && String(user?.id ?? "") === String(sellerId);
    // Adjust this path if your seller-facing listing management page lives elsewhere.
    const listingManagePath = `/profile/listings/${product.id}`;

    /* ── Real "currently on rent" range, derived from
       product.rentDuration ("20 June 2026 to 27 June 2026").
       Drives both the status card and the calendar's blocked dates. */
    const activeRentRange = useMemo(
        () => parseRentDurationRange(product.rentDuration),
        [product.rentDuration],
    );

    const isRentedNow = Boolean(
        activeRentRange &&
        startOfDay(new Date()) >= activeRentRange.start &&
        startOfDay(new Date()) <= activeRentRange.end,
    );

    function switchView(target: "thrift" | "rent") {
        const params = new URLSearchParams(searchParams.toString());
        params.set("view", target);
        router.push(`?${params.toString()}`, { scroll: false });
    }

    function requireAuth(action: () => void) {
        if (!authed) {
            const queryString = searchParams.toString();
            const currentPath = `/browse-finds/${product.id}${queryString ? `?${queryString}` : ""}`;
            router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
            return;
        }
        action();
    }

    function goToMonth(delta: number) {
        let m = calMonth + delta;
        let y = calYear;
        if (m < 0) { m = 11; y -= 1; }
        if (m > 11) { m = 0; y += 1; }
        setCalMonth(m);
        setCalYear(y);
    }

    /* Range-aware day click: 1st click sets start, 2nd click (later
       date) sets end, clicking before start restarts the range. */
    function handleDayClick(date: Date, state: DayState) {
        if (state === "past" || state === "out-of-month" || state === "unavailable") return;
        setDateError(null);

        if (!selectedStart || (selectedStart && selectedEnd)) {
            setSelectedStart(date);
            setSelectedEnd(null);
            return;
        }
        if (date <= selectedStart) {
            setSelectedStart(date);
            setSelectedEnd(null);
            return;
        }
        setSelectedEnd(date);
    }

    /* Quick-duration picker (1/2/3/5/7 days) used inside the date
       picker modal. Anchors on the current start date, or today if
       nothing is picked yet. */
    function applyQuickDuration(days: number) {
        setDateError(null);
        const base = selectedStart ?? startOfDay(new Date());
        if (!selectedStart) setSelectedStart(base);
        const end = new Date(base);
        end.setDate(end.getDate() + days);
        setSelectedEnd(end);
    }

    const monthLabel = new Date(calYear, calMonth, 1).toLocaleString("en-US", {
        month: "long",
        year: "numeric",
    });
    const calendarCells = useMemo(
        () => buildCalendarMatrix(calYear, calMonth),
        [calYear, calMonth],
    );

    const rentalDays = selectedStart && selectedEnd ? Math.max(1, diffInDays(selectedEnd, selectedStart)) : null;
    const dailyRate = product.rentalPrice ?? "Rs. 200";

    const dailyRateNumber = Number(
        dailyRate
            .replace("Rs.", "")
            .replaceAll(",", "")
            .trim()
    );


    const securityDeposit = product.securityDeposit ?? "Rs. 0";
    const securityDepositNumber = product.securityDepositValue ?? 0;

    const detailPageTag = getContextTag(product.status, isRent ? "rent" : "thrift");

    const thriftRecs = useMemo(
        () =>
            recommendations
                .filter((p) => p.status === "THRIFT" || p.status === "THRIFT + RENT")
                .slice(0, 4),
        [recommendations],
    );
    const rentRecs = useMemo(
        () =>
            recommendations
                .filter((p) => p.status === "RENT" || p.status === "THRIFT + RENT")
                .slice(0, 4),
        [recommendations],
    );

    function handleRentNow() {
        if (!selectedStart || !selectedEnd) {
            setDateError("Pick a start and return date to continue.");
            setDateModalOpen(true);
            return;
        }
        requireAuth(() => setRentModalOpen(true));
    }

    return (
        <div className="min-h-screen bg-[#FAF6F0] text-[#1A130E] antialiased">
            <div>

                <main className="mx-auto max-w-[1340px] px-4 pb-28 pt-4 sm:px-6 lg:px-8">

                    {/* ── Breadcrumb ── */}
                    <nav className="mb-6 flex flex-wrap items-center gap-1 text-[13px] text-[#6E6053]">
                        <Link href="/" className="hover:text-[#9E2A1B] transition">Home</Link>
                        <ChevronRight size={13} className="text-[#B5A89E]" />
                        <Link href="/women" className="hover:text-[#9E2A1B] transition">Women</Link>
                        <ChevronRight size={13} className="text-[#B5A89E]" />
                        <Link href="/browse-finds" className="hover:text-[#9E2A1B] transition">Finds</Link>
                        <ChevronRight size={13} className="text-[#B5A89E]" />
                        <span className="font-semibold text-[#1A130E] truncate max-w-[200px]">{product.name}</span>
                    </nav>

                    {/* ══ HERO GRID ══ */}
                    <section className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-start">

                        {/* LEFT — Gallery */}
                        <div className="space-y-2.5">
                            <div className="relative aspect-[4/3.3] w-full overflow-hidden rounded-xl bg-[#F4ECE3]">
                                {selectedMedia.type === "video" ? (
                                    <video
                                        key={selectedMedia.src}
                                        src={selectedMedia.src}
                                        controls
                                        autoPlay
                                        className="absolute inset-0 h-full w-full object-cover"
                                    />
                                ) : (
                                    <Image
                                        src={selectedMedia.src}
                                        alt={`${product.name} – ${selectedMedia.label}`}
                                        fill
                                        priority
                                        className="object-cover object-top"
                                    />
                                )}

                                <button
                                    onClick={() => setLightboxOpen(true)}
                                    className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full border border-[#EBE3D5] bg-white text-[#1A130E] shadow-sm transition hover:scale-105"
                                >
                                    <Maximize2 size={13} />
                                </button>

                                <button
                                    onClick={handleToggleFavorite}
                                    aria-label={isFav ? "Remove from favourites" : "Add to favourites"}
                                    className="absolute right-2.5 top-11 flex h-7 w-7 items-center justify-center rounded-full border border-[#EBE3D5] bg-white shadow-sm transition hover:scale-105"
                                >
                                    <Heart
                                        size={13}
                                        className={isFav ? "fill-[#9E2A1B] text-[#9E2A1B]" : "text-[#6E6053] transition hover:text-[#9E2A1B]"}
                                    />
                                </button>
                            </div>

                            <div className="mt-2 grid grid-cols-5 gap-1.5">
                                {media.map((item, idx) => (
                                    <button
                                        key={`${item.type}-${idx}`}
                                        onClick={() => setSelectedMedia(item)}
                                        className={`relative aspect-square overflow-hidden rounded-xl border-2 transition ${
                                            selectedMedia.label === item.label
                                                ? "border-[#9E2A1B] ring-1 ring-[#9E2A1B]/30"
                                                : "border-transparent hover:border-[#B5A89E]"
                                        }`}
                                    >
                                        {item.type === "video" ? (
                                            <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-[#1A130E]">
                                                <Play size={16} fill="currentColor" className="text-white" />
                                                <span className="text-[9px] font-semibold uppercase tracking-wide text-white/80">
                                                    Video
                                                  </span>
                                            </div>
                                        ) : (
                                            <Image
                                                src={item.src}
                                                alt={item.label}
                                                fill
                                                className="object-cover object-top"
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* ══ DETAIL TABS — Description / Details / Care Guide ══ */}
                            <div className="pt-3">
                                <div className="flex items-center gap-6 border-b border-[#EBE3D5]">
                                    {([
                                        { id: "description", label: "Description" },
                                        { id: "details", label: "Details" },
                                        { id: "care", label: "Care Guide" },
                                    ] as { id: DetailTab; label: string }[]).map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`relative pb-2.5 text-[13px] font-semibold transition ${
                                                activeTab === tab.id
                                                    ? "text-[#9E2A1B]"
                                                    : "text-[#8C7E74] hover:text-[#594E46]"
                                            }`}
                                        >
                                            {tab.label}
                                            {activeTab === tab.id && (
                                                <span className="absolute -bottom-px left-0 h-[2px] w-full rounded-full bg-[#9E2A1B]" />
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* ── Description Tab — wired to real listing fields ── */}
                                {activeTab === "description" && (
                                    <div className="mt-4 rounded-xl border border-[#EBE3D5] bg-[#FDFAF6] p-5">
                                        <h4 className="text-[14px] font-bold text-[#1A130E]">About this item</h4>
                                        <p className="mt-1.5 text-[13px] leading-relaxed text-[#6E6053]">
                                            {product.description ?? "No description provided for this item."}
                                        </p>
                                        <div className="mt-4 space-y-3 border-t border-[#EBE3D5] pt-4">
                                            {[
                                                { icon: Tag, label: "Style / Occasion", value: product.styleOccasion ?? "—" },
                                                { icon: BadgeCheck, label: "Brand", value: product.brand ?? "—" },
                                                { icon: Users, label: "Category", value: product.category ?? "—" },
                                                { icon: Tag, label: "Gender", value: product.gender ?? "—" },
                                            ].map(({ icon: Icon, label, value }) => (
                                                <div key={label} className="flex items-center gap-3 text-[12px]">
                                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#E6DED1] bg-white">
                                                        <Icon size={13} className="text-[#9E2A1B]" />
                                                    </div>
                                                    <span className="w-[110px] shrink-0 text-[#8C7E74]">{label}</span>
                                                    <span className="font-semibold text-[#1A130E]">{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ── Details Tab ── */}
                                {activeTab === "details" && (
                                    <div className="mt-4 rounded-xl border border-[#EBE3D5] bg-[#FDFAF6] p-5 space-y-3">
                                        {[
                                            { icon: Ruler, label: "Size", value: product.size },
                                            { icon: ShieldCheck, label: "Condition", value: product.condition },
                                            { icon: Sparkles, label: "Color", value: product.color },
                                            { icon: Leaf, label: "Material", value: product.material },
                                            { icon: Tag, label: "Original Price", value: product.oldPrice ?? product.price },
                                        ].map(({ icon: Icon, label, value }) => (
                                            <div
                                                key={label}
                                                className="flex items-center justify-between border-b border-[#EBE3D5] pb-3 last:border-0 last:pb-0"
                                            >
                                                <div className="flex items-center gap-2.5 text-[12px] text-[#6E6053]">
                                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#E6DED1] bg-white">
                                                        <Icon size={13} className="text-[#9E2A1B]" />
                                                    </div>
                                                    {label}
                                                </div>
                                                <span className="text-[12px] font-semibold text-[#1A130E]">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeTab === "care" && (
                                    <div className="mt-4 rounded-xl border border-[#EBE3D5] bg-[#FDFAF6] p-5">
                                        <h4 className="text-[14px] font-bold text-[#1A130E]">Care Instructions</h4>
                                        <div className="mt-3 space-y-3">
                                            {product.care.map((item) => {
                                                const Icon = resolveCareIcon(item);
                                                return (
                                                    <div key={item} className="flex items-center gap-3">
                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#E6DED1] bg-white">
                                                            <Icon size={14} strokeWidth={1.8} className="text-[#9E2A1B]" />
                                                        </div>
                                                        <span className="text-[12px] font-medium text-[#4F4338]">{item}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT — Info */}
                        <div className="space-y-3.5">

                            {/* Status badge (hybrid-aware) + seller pill */}
                            <div className="flex items-center justify-between gap-3">
                                <span
                                    className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${detailPageTag.className}`}
                                >
                                  {detailPageTag.label}
                                </span>

                                <Link
                                    href={`/profile/${sellerId}`}
                                    className="flex items-center gap-2 rounded-full bg-[#F5EFE5] border border-[#9E2A1B]/4 py-1 pl-1 pr-3.5 transition hover:bg-[#F5EFE5]/70"
                                >
                                    <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-[#9E2A1B] text-white">
                                        {sellerAvatarUrl ? (
                                            <Image src={sellerAvatarUrl} alt={sellerName} fill className="object-cover" />
                                        ) : (
                                            <span className="flex h-full w-full items-center justify-center text-[11px] font-bold">
                                                {getInitials(sellerName)}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[12px] font-semibold text-[#1A130E] whitespace-nowrap">{sellerName}</span>
                                </Link>
                            </div>

                            {/* Title */}
                            <div>
                                <h1 className="font-serif text-[32px] font-normal leading-[1.12] tracking-tight text-[#1A130E] sm:text-[36px]">
                                    {product.name}
                                </h1>
                                <span className="mt-1.5 inline-block rounded-full border border-[#9E2A1B] bg-[#9E2A1B]/4 px-2.5 py-0.5 text-[11px] font-semibold text-[#9E2A1B]">
                                      {product.styleOccasion ?? "Party Wear"}
                                    </span>
                                <p className="mt-2 text-[13px] leading-relaxed text-[#6E6053]">
                                    {product.description ?? "No description provided for this item."}
                                </p>
                            </div>

                            {/* Cross-mode switch — only for hybrid (Thrift + Rent) listings */}
                            {isHybrid && (
                                <button
                                    onClick={() => switchView(isRent ? "thrift" : "rent")}
                                    className="flex w-full items-center justify-between rounded-lg border border-[#DDD5C8] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#9E2A1B] transition hover:bg-[#FAF6F0]"
                                >
                                    {isRent ? "Also available to buy →" : "This item is available for rent as well →"}
                                    <ChevronRight size={15} />
                                </button>
                            )}

                            {/* ══════════════ THRIFT-ADAPTED RIGHT COLUMN ══════════════ */}
                            {isThrift && (
                                <>
                                    <div className="rounded-xl border border-[#EBE3D5] bg-white p-4 space-y-3">
                                        <div className="flex flex-wrap items-baseline gap-2.5">
                                            <p className="text-[26px] font-bold leading-none text-[#9E2A1B]">{product.price}</p>
                                            {product.oldPrice && (
                                                <p className="text-[13px] font-normal text-[#A89E94] line-through">{product.oldPrice}</p>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-[#EBE3D5] pt-3 text-[11px] text-[#6E6053]">
                                            <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-[#9E2A1B]" /> Quality Checked</span>
                                            <span className="flex items-center gap-1.5"><Lock size={13} className="text-[#9E2A1B]" /> Secure Payment</span>
                                            <span className="flex items-center gap-1.5"><RefreshCw size={13} className="text-[#9E2A1B]" /> Easy Returns</span>
                                        </div>
                                    </div>

                                    {/* Details card — now uses real availability/shipping/defectFlaws */}
                                    <div className="rounded-xl border border-[#EBE3D5] bg-white p-4 space-y-2.5">
                                        {[
                                            { label: "Size on Label", value: product.size },
                                            { label: "Condition", value: product.condition },
                                            { label: "Color", value: product.color },
                                            { label: "Material", value: product.material },
                                            { label: "Original Price", value: product.oldPrice ?? product.price },
                                            { label: "Availability", value: product.availability, pill: true },
                                            { label: "Visible Flaws / Notes", value: product.defectFlaws ?? "None noted" },
                                        ].map(({ label, value, pill }) => (
                                            <div key={label} className="flex items-center justify-between text-[12px]">
                                                <span className="text-[#6E6053]">{label}</span>
                                                {pill ? (
                                                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                                        value === "Available"
                                                            ? "bg-[#E8F5EE] text-[#2E7D52]"
                                                            : value === "Reserved"
                                                                ? "bg-[#FDF3D9] text-[#92740E]"
                                                                : "bg-[#F0EBE3] text-[#8C7E74]"
                                                    }`}>{value}</span>
                                                ) : (
                                                    <span className="text-right font-semibold text-[#1A130E]">{value}</span>
                                                )}
                                            </div>
                                        ))}

                                        {/* Delivery Options — hybrid-aware tag row (Shipping / Pickup / Free) */}
                                        <div className="flex items-center justify-between text-[12px]">
                                            <span className="text-[#6E6053]">Delivery Options</span>
                                            <DeliveryOptionTags product={product} />
                                        </div>
                                    </div>

                                    {/* Buy Now → Go to Cart (already added) → View Listing (owner) */}
                                    {isOwner ? (
                                        <Link
                                            href={listingManagePath}
                                            className="block w-full rounded-lg bg-[#1A130E] py-3.5 text-center text-[13px] font-bold text-white transition hover:bg-[#332620]"
                                        >
                                            View Listing
                                        </Link>
                                    ) : isInCart ? (
                                        <Link
                                            href="/cart"
                                            className="block w-full rounded-lg bg-[#9E2A1B] py-3.5 text-center text-[13px] font-bold text-white transition hover:bg-[#832215]"
                                        >
                                            Go to Cart
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={() => requireAuth(() => setThriftModalOpen(true))}
                                            className="w-full rounded-lg bg-[#9E2A1B] py-3.5 text-[13px] font-bold text-white transition hover:bg-[#832215]"
                                        >
                                            Buy Now
                                        </button>
                                    )}

                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            onClick={() => setTryOnOpen(true)}
                                            className="flex items-center justify-center gap-1.5 rounded-lg border border-[#DDD5C8] bg-white py-2.5 text-[11px] font-semibold text-[#594E46] transition hover:bg-[#FAF6F0]"
                                        >
                                            <Sparkles size={13} className="text-[#9E2A1B]" /> Virtual Try-On
                                        </button>
                                        <button
                                            onClick={handleToggleFavorite}
                                            className="flex items-center justify-center gap-1.5 rounded-lg border border-[#DDD5C8] bg-white py-2.5 text-[11px] font-semibold text-[#594E46] transition hover:bg-[#FAF6F0]"
                                        >
                                            <Heart size={13} className={isFav ? "fill-[#9E2A1B] text-[#9E2A1B]" : ""} />
                                            {isFav ? "Saved" : "Save Item"}
                                        </button>
                                        <button
                                            onClick={() => requireAuth(() => setReportModalOpen(true))}
                                            className="flex items-center justify-center gap-1.5 rounded-lg border border-[#DDD5C8] bg-white py-2.5 text-[11px] font-semibold text-[#594E46] transition hover:bg-[#FAF6F0]"
                                        >
                                            <Info size={13} /> Report
                                        </button>
                                    </div>

                                    {/* Condition Notes card — now uses real defectFlaws */}
                                    <div className="rounded-xl border border-[#EBE3D5] bg-[#FDFAF6] p-4">
                                        <p className="text-[13px] font-bold text-[#1A130E]">Condition Notes</p>
                                        <div className="mt-2.5 flex items-start gap-2.5">
                                            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#E6DED1] bg-white">
                                                <AlertTriangle size={13} className="text-[#9E2A1B]" />
                                            </div>
                                            <div>
                                                <p className="text-[12px] font-medium text-[#4F4338]">{product.defectFlaws ?? "No major flaws."}</p>
                                                <p className="mt-0.5 text-[11px] text-[#8C7E74]">No major flaws. Overall in great condition.</p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* ══════════════ RENT-ADAPTED RIGHT COLUMN ══════════════ */}
                            {isRent && (
                                <>
                                    {/* Real "Currently on Rent" status, derived from product.rentDuration */}
                                    {isRentedNow && (
                                        <div className="rounded-xl border border-[#EBE3D5] bg-[#FDFAF6] p-4 space-y-2.5">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5 shrink-0 text-[#9E2A1B]">
                                                    <RotateCcw size={17} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E74]">Rent Status</p>
                                                    <h4 className="mt-0.5 text-[14px] font-bold text-[#1A130E]">Currently on Rent</h4>
                                                    <p className="mt-1 text-[11px] text-[#8C7E74]">Available Again</p>
                                                    <p className="text-[16px] font-bold text-[#1A130E]">
                                                        {activeRentRange ? formatShortDate(activeRentRange.end) : "—"}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-center text-[11px] text-[#8C7E74]">
                                                This item is currently rented out and can't be booked for these dates.
                                            </p>
                                        </div>
                                    )}

                                    {/* Price card — daily rate + security deposit + trust row (matches reference) */}
                                    <div className="rounded-xl border border-[#EBE3D5] bg-white p-4 space-y-3">
                                        <div className="flex items-baseline gap-1.5">
                                            <p className="text-[26px] font-bold leading-none text-[#9E2A1B]">{dailyRate}</p>
                                            <span className="text-[12px] text-[#8C7E74]">/ day</span>
                                        </div>
                                        <p className="flex items-center gap-1.5 text-[12px] text-[#6E6053]">
                                            Security Deposit:{" "}
                                            <span className="font-semibold text-[#1A130E]">{securityDeposit} (Refundable)</span>
                                            <Info size={12} className="shrink-0 text-[#A6998E]" />
                                        </p>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-[#EBE3D5] pt-3 text-[11px] text-[#6E6053]">
                                            <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-[#9E2A1B]" /> Quality Checked</span>
                                            <span className="flex items-center gap-1.5"><Lock size={13} className="text-[#9E2A1B]" /> Secure Payment</span>
                                            <span className="flex items-center gap-1.5"><RefreshCw size={13} className="text-[#9E2A1B]" /> Easy Returns</span>
                                        </div>
                                    </div>

                                    {/* Rental dates summary card — opens the date picker modal */}
                                    <div className="rounded-xl border border-[#EBE3D5] bg-white p-4 space-y-3">
                                        <div className="flex items-center gap-1.5">
                                            <CalendarDays size={14} className="text-[#9E2A1B]" />
                                            <p className="text-[13px] font-bold text-[#1A130E]">Select Rental Dates</p>
                                        </div>
                                        <p className="text-[11px] text-[#8C7E74]">
                                            Choose your start and return date for this rental.
                                        </p>

                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="rounded-lg border border-[#EBE3D5] bg-[#FDFAF6] px-2.5 py-2.5">
                                                <p className="text-[9px] font-bold uppercase tracking-wide text-[#8C7E74]">Start Date</p>
                                                <p className="mt-0.5 text-[11px] font-semibold text-[#1A130E]">
                                                    {selectedStart ? formatShortDate(selectedStart) : "Not selected"}
                                                </p>
                                            </div>
                                            <div className="rounded-lg border border-[#EBE3D5] bg-[#FDFAF6] px-2.5 py-2.5">
                                                <p className="text-[9px] font-bold uppercase tracking-wide text-[#8C7E74]">End Date</p>
                                                <p className="mt-0.5 text-[11px] font-semibold text-[#1A130E]">
                                                    {selectedEnd ? formatShortDate(selectedEnd) : "Not selected"}
                                                </p>
                                            </div>
                                            <div className="rounded-lg border border-[#EBE3D5] bg-[#FDFAF6] px-2.5 py-2.5">
                                                <p className="text-[9px] font-bold uppercase tracking-wide text-[#8C7E74]">Return Date</p>
                                                <p className="mt-0.5 text-[11px] font-semibold text-[#1A130E]">
                                                    {selectedEnd ? formatShortDate(selectedEnd) : "Not selected"}
                                                </p>
                                            </div>
                                        </div>

                                        {rentalDays && (
                                            <div className="flex items-center justify-between rounded-lg bg-[#FAF0E6] px-3 py-2 text-[12px]">
                                                <span className="text-[#6E6053]">Total Rental Days</span>
                                                <span className="font-bold text-[#9E2A1B]">{rentalDays} day{rentalDays > 1 ? "s" : ""}</span>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => { setDateError(null); setDateModalOpen(true); }}
                                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#9E2A1B] bg-[#9E2A1B]/6 py-2.5 text-[12px] font-bold text-[#9E2A1B] transition hover:bg-[#9E2A1B]/10"
                                        >
                                            <CalendarDays size={13} />
                                            {selectedStart && selectedEnd ? "Change Dates" : "Select Dates"}
                                        </button>

                                        {dateError && (
                                            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-[#9E2A1B]">
                                                <AlertTriangle size={12} /> {dateError}
                                            </p>
                                        )}
                                    </div>

                                    {/* Details card — Thrift-style, adapted for Rent */}
                                    <div className="rounded-xl border border-[#EBE3D5] bg-white p-4 space-y-2.5">
                                        {[
                                            { label: "Size", value: product.size },
                                            { label: "Condition", value: product.condition },
                                            { label: "Color", value: product.color },
                                            { label: "Material", value: product.material },
                                        ].map(({ label, value }) => (
                                            <div key={label} className="flex items-center justify-between text-[12px]">
                                                <span className="text-[#6E6053]">{label}</span>
                                                <span className="text-right font-semibold text-[#1A130E]">{value}</span>
                                            </div>
                                        ))}

                                        <div className="flex items-center justify-between text-[12px]">
                                            <span className="text-[#6E6053]">Delivery Options</span>
                                            <DeliveryOptionTags product={product} />
                                        </div>

                                        <div className="flex items-center justify-between text-[12px]">
                                            <span className="text-[#6E6053]">Visible Flaws / Notes</span>
                                            <span className="text-right font-semibold text-[#1A130E]">{product.defectFlaws ?? "None noted"}</span>
                                        </div>
                                    </div>

                                    {/* Rent Now → Go to Cart (already added) → View Listing (owner) */}
                                    {isOwner ? (
                                        <Link
                                            href={listingManagePath}
                                            className="block w-full rounded-lg bg-[#1A130E] py-3.5 text-center text-[13px] font-bold text-white transition hover:bg-[#332620]"
                                        >
                                            View Listing
                                        </Link>
                                    ) : isInCart ? (
                                        <Link
                                            href="/cart"
                                            className="block w-full rounded-lg bg-[#1A130E] py-3.5 text-center text-[13px] font-bold text-white transition hover:bg-[#332620]"
                                        >
                                            Go to Cart
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={handleRentNow}
                                            className="w-full rounded-lg bg-[#1A130E] py-3.5 text-[13px] font-bold text-white transition hover:bg-[#332620]">
                                            Rent Now
                                        </button>
                                    )}

                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            onClick={() => setTryOnOpen(true)}
                                            className="flex items-center justify-center gap-1.5 rounded-lg border border-[#DDD5C8] bg-white py-2.5 text-[11px] font-semibold text-[#594E46] transition hover:bg-[#FAF6F0]"
                                        >
                                            <Sparkles size={13} className="text-[#9E2A1B]" /> Virtual Try-On
                                        </button>
                                        <button
                                            onClick={handleToggleFavorite}
                                            className="flex items-center justify-center gap-1.5 rounded-lg border border-[#DDD5C8] bg-white py-2.5 text-[11px] font-semibold text-[#594E46] transition hover:bg-[#FAF6F0]"
                                        >
                                            <Heart size={13} className={isFav ? "fill-[#9E2A1B] text-[#9E2A1B]" : ""} />
                                            {isFav ? "Saved" : "Save Item"}
                                        </button>
                                        <button
                                            onClick={() => requireAuth(() => setReportModalOpen(true))}
                                            className="flex items-center justify-center gap-1.5 rounded-lg border border-[#DDD5C8] bg-white py-2.5 text-[11px] font-semibold text-[#594E46] transition hover:bg-[#FAF6F0]"
                                        >
                                            <Info size={13} /> Report
                                        </button>
                                    </div>

                                    {/* Return Process card — makes the return workflow explicit */}
                                    <div className="rounded-xl border border-[#EBE3D5] bg-[#FDFAF6] p-4 space-y-2.5">
                                        <p className="text-[13px] font-bold text-[#1A130E]">Return Process</p>
                                        <div className="flex items-start gap-2.5">
                                            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#E6DED1] bg-white">
                                                <RotateCcw size={13} className="text-[#9E2A1B]" />
                                            </div>
                                            <div>
                                                <p className="text-[12px] font-semibold text-[#1A130E]">
                                                    {selectedEnd ? `Return by ${formatShortDate(selectedEnd)}` : "Select dates to see your return date"}
                                                </p>
                                                <p className="mt-0.5 text-[11px] text-[#8C7E74]">
                                                    Return method follows whatever you choose at checkout — courier
                                                    pickup for shipping, or drop-off with {sellerName} for pickup orders.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2.5">
                                            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#E6DED1] bg-white">
                                                <ShieldCheck size={13} className="text-[#9E2A1B]" />
                                            </div>
                                            <div>
                                                <p className="text-[12px] font-semibold text-[#1A130E]">Deposit refund</p>
                                                <p className="mt-0.5 text-[11px] text-[#8C7E74]">
                                                    {securityDeposit} refunded within 3 business days after condition inspection.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2.5">
                                            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#E6DED1] bg-white">
                                                <AlertTriangle size={13} className="text-[#9E2A1B]" />
                                            </div>
                                            <div>
                                                <p className="text-[12px] font-semibold text-[#1A130E]">Late or damaged returns</p>
                                                <p className="mt-0.5 text-[11px] text-[#8C7E74]">
                                                    Late fees apply per extra day; damage may be deducted from the deposit.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                        </div>
                    </section>

                    {/* ══ TRUST STRIP ══ */}
                    <section className="mt-8 grid grid-cols-5 divide-x divide-[#EBE3D5] rounded-xl border border-[#EBE3D5] bg-[#FAF8F5]">
                        {[
                            { icon: ShieldCheck, label: "Verified Seller", sub: "Trusted & reviewed" },
                            { icon: Lock, label: "Secure Payment", sub: "100% protected" },
                            { icon: Recycle, label: "Sustainable Choice", sub: "Reduce. Rewear. Repeat." },
                            { icon: Users, label: "Community Driven", sub: "By buyers, for buyers." },
                            { icon: Sparkles, label: "Virtual Try-On", sub: "See it on you" },
                        ].map(({ icon: Icon, label, sub }) => (
                            <div key={label} className="flex flex-col items-center gap-1.5 px-2 py-5 text-center">
                                <Icon size={18} className="text-[#9E2A1B]" />
                                <span className="text-[11px] font-bold leading-tight text-[#1A130E]">{label}</span>
                                <span className="text-[10px] leading-tight text-[#8C7E74]">{sub}</span>
                            </div>
                        ))}
                    </section>

                    {/* ══ TRY BEFORE YOU BUY BANNER ══ */}
                    <section className="mt-8 overflow-hidden rounded-xl border border-[#EBE3D5] bg-white shadow-sm">
                        <div className="grid md:grid-cols-[1fr_1.1fr]">
                            <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
                                <h3 className="font-serif text-[24px] font-normal tracking-wide text-[#1A130E] sm:text-[28px]">
                                    Try Before You Buy
                                </h3>
                                <p className="mt-2 max-w-[340px] text-[13px] leading-relaxed text-[#6E6053]">
                                    Upload a photo and see how this {product.name.toLowerCase()} looks on you.
                                </p>
                                <button
                                    onClick={() => setTryOnOpen(true)}
                                    className="mt-6 inline-flex w-fit items-center gap-2 rounded-md bg-[#9E2A1B] px-7 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#832215]"
                                >
                                    Launch AI Try-On
                                </button>
                                <div className="mt-4 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-widest text-[#A6998E]">
                                    <span>Fast</span>
                                    <span className="h-1 w-1 rounded-full bg-[#DCD3C4]" />
                                    <span>Private</span>
                                    <span className="h-1 w-1 rounded-full bg-[#DCD3C4]" />
                                    <span>Secure</span>
                                </div>
                            </div>
                            <div className="relative min-h-[220px]">
                                <Image
                                    src="/images/tryon3.png"
                                    alt="AI Try-On preview"
                                    fill
                                    priority
                                    className="object-contain"
                                />
                            </div>
                        </div>
                    </section>

                    {/* ══ RECOMMENDATIONS ══ */}
                    <div className="mt-12 space-y-12">

                        {(isRent || isHybrid) && (
                            <RecommendationRow
                                title="Rent the Look"
                                linkLabel="View All Rentals →"
                                items={rentRecs.length > 0 ? rentRecs : recommendations.slice(0, 4)}
                                mode="rent"
                                compact
                            />
                        )}

                        {(isThrift || isHybrid) && (
                            <RecommendationRow
                                title="You May Also Love"
                                linkLabel="Explore More →"
                                items={thriftRecs.length > 0 ? thriftRecs : recommendations.slice(0, 4)}
                                mode="thrift"
                                compact
                            />
                        )}
                    </div>
                </main>

                {/* Lightbox */}
                {lightboxOpen && (
                    <div
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
                        onClick={() => setLightboxOpen(false)}
                    >
                        <button
                            onClick={() => setLightboxOpen(false)}
                            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                        >
                            <X size={20} />
                        </button>
                        <div
                            className="relative aspect-[3/4] w-full max-w-[600px] max-h-[85vh] overflow-hidden rounded-xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Image
                                src={selectedMedia.src}
                                alt="Full view"
                                fill
                                className="object-contain"
                                quality={100}
                            />
                        </div>
                    </div>
                )}

                {/* Try-On Modal */}
                {tryOnOpen && (
                    <TryOnModal product={product} onClose={() => setTryOnOpen(false)} />
                )}
                {/* Buy Now — Thrift */}
                {thriftModalOpen && (
                    <BuyNowModal
                        product={product}
                        onClose={() => setThriftModalOpen(false)}
                    />
                )}
                {/* Report this listing */}
                {reportModalOpen && (
                    <ReportModal
                        product={product}
                        onClose={() => setReportModalOpen(false)}
                    />
                )}
                {/* Rent date-picker modal */}
                {dateModalOpen && (
                    <RentDatePickerModal
                        initialStart={selectedStart}
                        initialEnd={selectedEnd}
                        dailyRateNumber={dailyRateNumber}
                        securityDepositNumber={securityDepositNumber}
                        bookedRange={activeRentRange}
                        onConfirm={(start, end) => {
                            setSelectedStart(start);
                            setSelectedEnd(end);
                            setDateModalOpen(false);
                        }}
                        onClose={() => setDateModalOpen(false)}
                    />
                )}

                {/* Rent Now — delivery/pickup/flex modal (mirrors BuyNowModal) */}
                {rentModalOpen && selectedStart && selectedEnd && (
                    <RentNowModal
                        product={product}
                        rentInfo={{
                            days: rentalDays ?? 1,
                            startDate: selectedStart,
                            endDate: selectedEnd,
                            dailyRateNumber,
                            securityDepositNumber,
                        }}
                        onClose={() => setRentModalOpen(false)}
                    />
                )}
            </div>
        </div>
    );
}

/* ─── Recommendation Row ──────────────────────────────────── */
function RecommendationRow({
                               title,
                               linkLabel,
                               items,
                               mode,
                               compact = false,
                           }: {
    title: string;
    linkLabel: string;
    items: Product[];
    mode: "rent" | "thrift";
    compact?: boolean;
}) {
    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="font-serif text-[22px] font-normal tracking-wide text-[#1A130E]">
                    {title}
                </h2>
                <Link
                    href="/browse-finds"
                    className="text-[13px] font-bold text-[#9E2A1B] underline-offset-4 transition hover:underline"
                >
                    {linkLabel}
                </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4">
                {items.map((item) => {
                    const tag = getContextTag(item.status, mode);
                    return (
                        <article key={item.id} className="group">
                            <div className={`relative overflow-hidden rounded-lg bg-[#F5F0E8] ${compact ? "aspect-[3/4]" : "aspect-[0.8/1]"}`}>
                                <Link href={`/browse-finds/${item.id}`} className="block h-full w-full">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        sizes="(min-width:1280px) 25vw,(min-width:640px) 50vw,100vw"
                                        className="object-cover transition duration-500 group-hover:scale-[1.03]"
                                    />
                                </Link>
                                <span
                                    className={`absolute left-2 top-2 rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${tag.className}`}
                                >
                  {tag.label}
                </span>
                                <button
                                    type="button"
                                    aria-label={`Save ${item.name}`}
                                    className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm transition hover:text-[#9E2A1B]"
                                >
                                    <Heart size={12} strokeWidth={2} className="text-[#707070]" />
                                </button>
                            </div>
                            <Link href={`/browse-finds/${item.id}`} className="mt-2 block">
                                <h3 className="line-clamp-2 text-[13px] font-medium leading-[1.35] text-[#1A1A1A]">
                                    {item.name}
                                </h3>
                                <p className="mt-0.5 text-[13px] font-semibold text-[#9E2A1B]">
                                    {mode === "rent" && item.rentalPrice ? item.rentalPrice : item.price}
                                </p>
                            </Link>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}

/* ══════════════════════════════════════════════════════════
   VIRTUAL TRY-ON MODAL — unchanged from original
══════════════════════════════════════════════════════════ */
function TryOnModal({
                        product,
                        onClose,
                    }: {
    product: Product;
    onClose: () => void;
}) {
    const [step, setStep] = useState<TryOnStep>("upload");
    const [fileSelected, setFileSelected] = useState(false);
    const [fileName, setFileName] = useState("");
    const [previewOpen, setPreviewOpen] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    async function handleGenerate() {
        if (!uploadedFile) return;
        setStep("processing");
        setErrorMessage(null);

        try {
            const formData = new FormData();
            formData.append("personImage", uploadedFile);
            formData.append("garmentImageUrl", product.image);
            formData.append("garmentDescription", product.name);

            const token = localStorage.getItem("accessToken") || localStorage.getItem("token");

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vton/image`,
                {
                    method: "POST",
                    body: formData,
                    credentials: "include",
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                }
            );

            if (!response.ok) throw new Error(`Server error: ${response.status}`);

            const data = await response.json();
            setResultImageUrl(data.imageUrl);
            setStep("result");
        } catch (err) {
            console.error("Try-on failed:", err);
            setErrorMessage("Couldn't generate your try-on. Please try again.");
            setStep("upload");
        }
    }

    function handleReset() {
        setStep("upload");
        setFileSelected(false);
        setFileName("");
        setUploadedFile(null);
        setResultImageUrl(null);
        setErrorMessage(null);
    }

    async function handleDownload() {
        if (!resultImageUrl) return;
        try {
            const response = await fetch(resultImageUrl);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = `tryon-${product.name.replace(/\s+/g, "-").toLowerCase()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
            console.error("Download failed:", err);
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm">
            <div className="relative w-full max-w-[960px] rounded-2xl border border-[#EBE3D5] bg-[#FCFAF7] shadow-2xl">

                <button
                    onClick={onClose}
                    className="absolute right-3.5 top-3.5 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[#EBE3D5] bg-[#FAF6F0] text-[#594E46] transition hover:bg-[#F4ECE3]"
                >
                    <X size={16} />
                </button>

                <div className="px-6 pt-5 pb-4 text-center">
                    <h2 className="font-serif text-[22px] font-normal tracking-wide text-[#1A130E]">
                        Virtual Try-On
                    </h2>
                    <p className="mt-1 text-[13px] text-[#6E6053]">
                        See how this piece looks on you before you decide.
                    </p>
                    <div className="mt-1 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#4A6B3A]">
                        <Lock size={10} />
                        Your data is private and secure.
                    </div>
                </div>

                <div className="grid gap-3 px-5 sm:grid-cols-3">

                    {/* Column 1 — Selected Item */}
                    <div className="rounded-xl border border-[#EBE3D5] bg-white p-4">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[#8C7E74]">
              1. Selected Item
            </span>
                        <div className="relative aspect-[3/3.2] w-full overflow-hidden rounded-lg border border-[#FAF6F0] bg-[#F5F0E8]">
                            <Image src={product.image} alt={product.name} fill className="object-cover" />
                            <span
                                className={`absolute left-2 top-2 rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                    STATUS_CONFIG[product.status]?.pill ?? "bg-[#1A130E] text-white"
                                }`}
                            >
                {product.status}
              </span>
                        </div>
                        <h4 className="mt-2.5 font-serif text-[14px] font-medium leading-tight text-[#1A130E]">
                            {product.name}
                        </h4>
                        <p className="mt-0.5 text-[13px] font-bold text-[#9E2A1B]">
                            {product.rentalPrice ? product.rentalPrice : product.price}
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-1 text-[11px] text-[#6E6053]">
                            <span>{product.brand}</span>
                            <span className="text-[#B5A89E]">•</span>
                            <span>{product.material}</span>
                            <span className="text-[#B5A89E]">•</span>
                            <span>{product.color}</span>
                        </div>
                    </div>

                    {/* Column 2 — Upload */}
                    <div className="rounded-xl border border-[#EBE3D5] bg-white p-4 flex flex-col gap-3">
                        <div>
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[#8C7E74]">
                2. Upload Your Photo
              </span>
                            <p className="text-[11px] text-[#6E6053]">
                                Use a clear front-facing photo in good lighting.
                            </p>
                        </div>

                        <label
                            className={`flex min-h-[130px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 text-center transition ${
                                fileSelected
                                    ? "border-[#4A6B3A] bg-[#F4F8F3]"
                                    : "border-[#DCD3C4] bg-[#FCFAF7] hover:border-[#9E2A1B]"
                            }`}
                        >
                            {fileSelected ? (
                                <>
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E4ECE0] text-[#4A6B3A]">
                                        <Check size={17} />
                                    </div>
                                    <p className="text-[12px] font-bold text-[#1A130E]">{fileName}</p>
                                    <p className="text-[10px] text-[#4A6B3A]">Ready to generate</p>
                                </>
                            ) : (
                                <>
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#EBE3D5] bg-[#FAF6F0] text-[#8C7E74]">
                                        <UploadCloud size={18} />
                                    </div>
                                    <p className="text-[12px] font-medium text-[#1A130E]">Upload Your Photo</p>
                                    <p className="text-[10px] text-[#8C7E74]">JPG or PNG (max 20MB)</p>
                                </>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setFileSelected(true);
                                        setFileName(file.name);
                                        setUploadedFile(file);
                                        setErrorMessage(null);
                                    }
                                }}
                            />
                        </label>

                        <div className="relative text-center">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[#EBE3D5]" />
                            </div>
                            <span className="relative bg-white px-3 text-[10px] font-medium uppercase tracking-wider text-[#8C7E74]">or</span>
                        </div>

                        <button
                            onClick={() => { setFileSelected(true); setFileName("webcam_capture.jpg"); }}
                            className="flex w-full items-center justify-center gap-2 rounded-md border border-[#DCD3C4] bg-white py-2 text-[12px] font-semibold text-[#1A130E] transition hover:bg-[#FAF6F0]"
                        >
                            <Camera size={13} />
                            Use Webcam
                        </button>

                        <div className="rounded-lg border border-[#EBE3D5] bg-[#FCFAF7] p-3 space-y-1.5">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A130E]">
                                Tips for best results
                            </p>
                            {[
                                "Face the camera directly",
                                "Good, natural lighting",
                                "Wear form-fitting clothing",
                                "Stand straight for full view",
                            ].map((tip) => (
                                <div key={tip} className="flex items-center gap-1.5 text-[11px] text-[#594E46]">
                                    <Check size={11} className="shrink-0 text-[#4A6B3A]" />
                                    {tip}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Column 3 — Result */}
                    <div className="rounded-xl border border-[#EBE3D5] bg-white p-4 flex flex-col gap-2.5">
            <span className="block text-[10px] font-bold uppercase tracking-widest text-[#8C7E74]">
              3. See It On You
            </span>
                        <p className="text-[11px] text-[#6E6053]">
                            Our AI will generate a realistic preview in seconds.
                        </p>

                        {step === "upload" && (
                            <div className="flex flex-1 min-h-[200px] flex-col items-center justify-center rounded-xl border border-[#FAF6F0] bg-[#FCFAF7] p-5 text-center">
                                {errorMessage ? (
                                    <>
                                        <AlertTriangle size={24} className="mb-2 text-[#9E2A1B]" strokeWidth={1.4} />
                                        <p className="max-w-[160px] text-[12px] font-medium text-[#9E2A1B]">
                                            {errorMessage}
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <Sparkle size={24} className="mb-2 animate-pulse text-[#B5A89E]" strokeWidth={1.4} />
                                        <p className="max-w-[160px] text-[12px] font-medium text-[#6E6053]">
                                            Upload your photo to see the AI preview.
                                        </p>
                                    </>
                                )}
                            </div>
                        )}

                        {step === "processing" && (
                            <div className="flex flex-1 min-h-[200px] flex-col items-center justify-center rounded-xl border border-[#EBE3D5] bg-white p-5 text-center">
                                <div className="relative mb-3 flex h-12 w-12 items-center justify-center">
                                    <div className="absolute inset-0 animate-spin rounded-full border-2 border-[#9E2A1B]/20 border-t-[#9E2A1B]" />
                                    <Sparkle size={14} className="text-[#9E2A1B]" />
                                </div>
                                <p className="text-[13px] font-bold text-[#1A130E]">Generating Look…</p>
                                <p className="mt-0.5 max-w-[140px] text-[10px] text-[#8C7E74]">
                                    This may take 30–60 seconds
                                </p>
                            </div>
                        )}

                        {step === "result" && resultImageUrl && (
                            <div className="flex flex-col gap-2">
                                <div
                                    className="relative aspect-[3/3.2] w-full cursor-zoom-in overflow-hidden rounded-xl border border-[#EBE3D5]"
                                    onClick={() => setPreviewOpen(true)}
                                >
                                    <Image
                                        src={resultImageUrl}
                                        alt="AI Try-On result"
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                    <span className="absolute right-2 top-2 flex items-center gap-1 rounded-sm bg-[#1A1A1A]/70 px-2 py-0.5 text-[9px] font-bold uppercase text-white backdrop-blur-sm">
                    <Sparkles size={8} className="text-yellow-400" />
                    AI Generated
                  </span>
                                    <div className="absolute bottom-2 left-2 flex gap-1.5">
                                        <button className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:bg-white">
                                            <ThumbsUp size={11} className="text-[#1A130E]" />
                                        </button>
                                        <button className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:bg-white">
                                            <ThumbsDown size={11} className="text-[#1A130E]" />
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-1.5">
                                    <button
                                        onClick={handleDownload}
                                        className="flex items-center justify-center gap-1.5 rounded-md border border-[#DCD3C4] bg-white py-1.5 text-[11px] font-bold text-[#594E46] transition hover:bg-[#FAF6F0]"
                                    >
                                        <Download size={12} /> Download
                                    </button>
                                    <button className="flex items-center justify-center gap-1.5 rounded-md border border-[#DCD3C4] bg-white py-1.5 text-[11px] font-bold text-[#594E46] transition hover:bg-[#FAF6F0]">
                                        <Share2 size={12} /> Share
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mx-5 mt-3 rounded-xl border border-[#EBE3D5] bg-white px-4 py-3">
                    <div className="grid gap-3 sm:grid-cols-3">
                        {[
                            { icon: Lock,      title: "Private & Secure",  desc: "Your images are private and deleted after 24 hours." },
                            { icon: Sparkles,  title: "AI-Powered Fit",    desc: "Advanced AI ensures realistic fit and drape." },
                            { icon: RefreshCw, title: "Not satisfied?",    desc: "Try again with a different photo or angle." },
                        ].map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="flex items-start gap-2.5">
                                <div className="mt-0.5 shrink-0 rounded-lg border border-[#EBE3D5] p-1.5 text-[#8C7E74]">
                                    <Icon size={13} />
                                </div>
                                <div>
                                    <p className="text-[12px] font-bold text-[#1A130E]">{title}</p>
                                    <p className="mt-0.5 text-[11px] leading-snug text-[#6E6053]">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col items-center gap-2 px-5 py-4">
                    {step === "result" && (
                        <button
                            onClick={handleReset}
                            className="text-[12px] font-bold text-[#9E2A1B] underline-offset-4 hover:underline"
                        >
                            Try Another Style
                        </button>
                    )}
                    <button
                        onClick={handleGenerate}
                        disabled={!uploadedFile || step === "processing"}
                        className={`w-full max-w-md rounded-md py-3 text-[13px] font-bold transition ${
                            uploadedFile && step !== "processing"
                                ? "bg-[#9E2A1B] text-white hover:bg-[#832215]"
                                : "cursor-not-allowed bg-[#DCD3C4] text-[#8C7E74]"
                        }`}
                    >
                        {step === "result"
                            ? "Regenerate Try-On"
                            : step === "processing"
                                ? "Processing…"
                                : "Generate My Try-On"}
                    </button>
                    <p className="text-center text-[10px] text-[#8C7E74]">
                        By using this feature, you agree to our{" "}
                        <span className="font-bold underline underline-offset-2 cursor-pointer">Privacy Policy</span>.
                        {" "}* AI results are for reference only and may vary.
                    </p>
                </div>
            </div>

            {previewOpen && resultImageUrl && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
                    onClick={() => setPreviewOpen(false)}
                >
                    <button
                        onClick={() => setPreviewOpen(false)}
                        className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#1A130E] shadow-lg transition hover:scale-105"
                    >
                        <X size={18} />
                    </button>
                    <div
                        className="relative h-[88vh] w-full max-w-[600px] overflow-hidden rounded-2xl bg-[#FCFAF7]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Image
                            src={resultImageUrl}
                            alt="High resolution preview"
                            fill
                            priority
                            className="object-contain"
                            unoptimized
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════
   REPORT LISTING MODAL — lets a buyer flag a listing to the team.
   POSTs to /api/reports with { listingId, reason, details }.
   Adjust the endpoint/field names below if your backend contract
   differs.
══════════════════════════════════════════════════════════ */
const REPORT_REASONS = [
    "Misleading photos or description",
    "Item not as described / counterfeit",
    "Inappropriate or offensive content",
    "Suspected scam or fraud",
    "Prohibited or unsafe item",
    "Other",
] as const;

function ReportModal({
                         product,
                         onClose,
                     }: {
    product: Product;
    onClose: () => void;
}) {
    const [reason, setReason] = useState<string>(REPORT_REASONS[0]);
    const [details, setDetails] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    async function handleSubmit() {
        setSubmitting(true);
        try {
            await api.post("/api/reports", {
                listingId: product.id,
                reason,
                details: details.trim() || null,
            });
            setSubmitted(true);
        } catch (err) {
            console.error("Report submission failed:", err);
            toast.error("Couldn't submit your report. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div
            className="fixed inset-0 z-[170] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-[480px] rounded-2xl border border-[#EBE3D5] bg-[#FCFAF7] shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-[#EBE3D5] bg-white text-[#6E6053] transition hover:bg-[#F4ECE3]"
                >
                    <X size={16} />
                </button>

                {submitted ? (
                    <div className="flex flex-col items-center px-8 py-10 text-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#4A6B3A] bg-[#F0F6ED]">
                            <Check size={26} className="text-[#4A6B3A]" />
                        </div>
                        <h2 className="font-serif text-[20px] font-normal text-[#1A130E]">
                            Report Submitted
                        </h2>
                        <p className="mt-2 max-w-[320px] text-[13px] text-[#6E6053]">
                            Thanks for flagging this. Our team will review "{product.name}" shortly.
                        </p>
                        <button
                            onClick={onClose}
                            className="mt-6 rounded-xl bg-[#9E2A1B] px-6 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#832215]"
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <div className="px-6 pt-6 pb-5">
                        <h2 className="font-serif text-[20px] font-normal text-[#1A130E]">
                            Report this Listing
                        </h2>
                        <p className="mt-1 text-[12px] text-[#6E6053]">
                            Reporting "{product.name}". Let us know what's wrong.
                        </p>

                        <div className="mt-4 flex flex-col gap-1.5">
                            <label className="text-[12px] font-semibold text-[#3D2B1F]">Reason</label>
                            <select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full rounded-lg border border-[#DDD5C8] bg-white px-3.5 py-2.5 text-[13px] text-[#1A130E] focus:outline-none focus:border-[#9E2A1B] focus:ring-2 focus:ring-[#9E2A1B]/10"
                            >
                                {REPORT_REASONS.map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mt-4 flex flex-col gap-1.5">
                            <label className="text-[12px] font-semibold text-[#3D2B1F]">
                                Additional details (optional)
                            </label>
                            <textarea
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                placeholder="Tell us more about the issue…"
                                maxLength={500}
                                rows={4}
                                className="w-full resize-none rounded-lg border border-[#DDD5C8] bg-white px-3.5 py-2.5 text-[13px] text-[#1A130E] focus:outline-none focus:border-[#9E2A1B] focus:ring-2 focus:ring-[#9E2A1B]/10"
                            />
                            <span className="self-end text-[10px] text-[#A6998E]">{details.length} / 500</span>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="mt-5 w-full rounded-xl bg-[#9E2A1B] py-3 text-[13px] font-bold text-white transition hover:bg-[#832215] disabled:opacity-60"
                        >
                            {submitting ? "Submitting…" : "Submit Report"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}


function RentDatePickerModal({
                                 initialStart,
                                 initialEnd,
                                 dailyRateNumber,
                                 securityDepositNumber,
                                 bookedRange = null,
                                 onConfirm,
                                 onClose,
                             }: {
    initialStart: Date | null;
    initialEnd: Date | null;
    dailyRateNumber: number;
    securityDepositNumber: number;
    bookedRange?: { start: Date; end: Date } | null;
    onConfirm: (start: Date, end: Date) => void;
    onClose: () => void;
}) {
    const today = useMemo(() => startOfDay(new Date()), []);
    const anchor = initialStart ?? today;

    const [calYear, setCalYear] = useState(anchor.getFullYear());
    const [calMonth, setCalMonth] = useState(anchor.getMonth());
    const [draftStart, setDraftStart] = useState<Date | null>(initialStart);
    const [draftEnd, setDraftEnd] = useState<Date | null>(initialEnd);

    function goToMonth(delta: number) {
        let m = calMonth + delta;
        let y = calYear;
        if (m < 0) { m = 11; y -= 1; }
        if (m > 11) { m = 0; y += 1; }
        setCalMonth(m);
        setCalYear(y);
    }

    const calendarCells = useMemo(
        () => buildCalendarMatrix(calYear, calMonth),
        [calYear, calMonth],
    );

    function inclusiveDays(start: Date, end: Date) {
        return diffInDays(end, start) + 1;
    }

    const draftDays = draftStart && draftEnd ? inclusiveDays(draftStart, draftEnd) : null;

    function handleDayClick(date: Date, state: DayState) {
        if (state === "past" || state === "out-of-month" || state === "unavailable") return;

        if (!draftStart || (draftStart && draftEnd)) {
            setDraftStart(date);
            setDraftEnd(null);
            return;
        }
        if (date < draftStart) {
            setDraftStart(date);
            setDraftEnd(null);
            return;
        }
        setDraftEnd(date);
    }

    const durationOptions = [1, 2, 3, 4, 5, 6, 7];

    function applyQuickDuration(days: number) {
        const base = draftStart ?? today;
        if (!draftStart) setDraftStart(base);
        const end = new Date(base);
        end.setDate(end.getDate() + (days - 1));
        setDraftEnd(end);
    }

    const fmt = (n: number) => `Rs. ${n.toLocaleString("en-IN")}`;
    const rentalPriceTotal = draftDays ? dailyRateNumber * draftDays : 0;
    const payable = rentalPriceTotal + securityDepositNumber;
    const canConfirm = Boolean(draftStart && draftEnd);

    function handleConfirm() {
        if (!draftStart || !draftEnd) return;
        onConfirm(draftStart, draftEnd);
    }

    const monthLabel = new Date(calYear, calMonth, 1).toLocaleString("en-US", {
        month: "long",
        year: "numeric",
    });

    return (
        <div
            className="fixed inset-0 z-[160] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-[640px] max-h-[90vh] overflow-y-auto rounded-2xl border border-[#EBE3D5] bg-[#FCFAF7] shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-[#EBE3D5] px-6 py-4">
                    <h2 className="font-serif text-[18px] font-normal tracking-wide text-[#1A130E]">
                        Select Rental Dates
                    </h2>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-[#EBE3D5] bg-white text-[#6E6053] transition hover:bg-[#F4ECE3]"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="grid gap-5 p-6 pb-0 sm:grid-cols-[1fr_220px]">
                    {/* Calendar column */}
                    <div>
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#8C7E74]">Select Dates</p>
                        <div className="rounded-xl border border-[#EBE3D5] bg-white p-3.5">
                            <div className="flex items-center justify-between">
                                <button onClick={() => goToMonth(-1)} className="flex h-6 w-6 items-center justify-center rounded-full border border-[#EBE3D5] text-[#6E6053] hover:bg-[#FAF6F0] transition">
                                    <ChevronLeft size={13} />
                                </button>
                                <span className="text-[13px] font-bold text-[#1A130E]">{monthLabel}</span>
                                <button onClick={() => goToMonth(1)} className="flex h-6 w-6 items-center justify-center rounded-full border border-[#EBE3D5] text-[#6E6053] hover:bg-[#FAF6F0] transition">
                                    <ChevronRight size={13} />
                                </button>
                            </div>

                            <div className="mt-3 grid grid-cols-7 gap-1 text-center">
                                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                                    <span key={d} className="text-[10px] font-semibold text-[#A6998E]">{d}</span>
                                ))}
                                {calendarCells.map((date, idx) => {
                                    const state = getDayState(date, calMonth, draftStart, draftEnd, bookedRange);
                                    const baseClasses = "flex h-7 w-7 items-center justify-center rounded-full text-[11px] mx-auto transition";
                                    const stateClasses =
                                        state === "range-start" || state === "range-end"
                                            ? "bg-[#9E2A1B] text-white font-bold"
                                            : state === "in-range"
                                                ? "bg-[#9E2A1B]/12 text-[#9E2A1B] font-semibold"
                                                : state === "past"
                                                    ? "text-[#DCD3C4] cursor-not-allowed"
                                                    : state === "unavailable"
                                                        ? "bg-[#F0EBE3] text-[#C4B8AE] cursor-not-allowed"
                                                        : state === "few-left"
                                                            ? "bg-[#FDF3D9] text-[#92740E] font-semibold cursor-pointer hover:bg-[#FBEAB8]"
                                                            : state === "out-of-month"
                                                                ? "text-[#DCD3C4]"
                                                                : "bg-[#E8F5EE] text-[#2E7D52] font-semibold cursor-pointer hover:bg-[#D7EEE0]";
                                    return (
                                        <button
                                            key={idx}
                                            disabled={state === "past" || state === "unavailable" || state === "out-of-month"}
                                            onClick={() => handleDayClick(date, state)}
                                            className={`${baseClasses} ${stateClasses}`}
                                        >
                                            {date.getDate()}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[#6E6053]">
                                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#E8F5EE] border border-[#BFD0B3]" /> Available</span>
                                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#F0EBE3] border border-[#DDD5C8]" /> Unavailable</span>
                                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#FDF3D9] border border-[#E9D896]" /> Few left</span>
                            </div>
                        </div>
                    </div>

                    {/* Right column — quick duration only now */}
                    <div>
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#8C7E74]">Rental Duration</p>
                        <div className="grid grid-cols-2 gap-1.5">
                            {durationOptions.map((d) => {
                                const active = draftDays === d;
                                return (
                                    <button
                                        key={d}
                                        onClick={() => applyQuickDuration(d)}
                                        className={`rounded-lg border py-2 text-[11px] font-semibold transition ${
                                            active
                                                ? "border-[#9E2A1B] bg-[#9E2A1B]/8 text-[#9E2A1B]"
                                                : "border-[#DDD5C8] bg-white text-[#594E46] hover:bg-[#FAF6F0]"
                                        }`}
                                    >
                                        {d} Day{d > 1 ? "s" : ""}
                                    </button>
                                );
                            })}
                            <button
                                className={`col-span-2 rounded-lg border py-2 text-[11px] font-semibold transition ${
                                    draftDays && !durationOptions.includes(draftDays)
                                        ? "border-[#9E2A1B] bg-[#9E2A1B]/8 text-[#9E2A1B]"
                                        : "border-[#DDD5C8] bg-white text-[#594E46] hover:bg-[#FAF6F0]"
                                }`}
                            >
                                Custom (tap calendar)
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Start Date / End Date / Total Days — full-width,
                    sitting below BOTH the calendar and duration columns ── */}
                <div className="grid grid-cols-3 gap-3 px-6 pt-4">
                    <div>
                        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-[#8C7E74]">Start Date</p>
                        <div className="rounded-lg border border-[#DDD5C8] bg-white px-3 py-2.5 text-center text-[12px] font-semibold text-[#1A130E]">
                            {draftStart ? formatShortDate(draftStart) : "—"}
                        </div>
                    </div>

                    <div>
                        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-[#8C7E74]">End Date</p>
                        <div className="rounded-lg border border-[#DDD5C8] bg-white px-3 py-2.5 text-center text-[12px] font-semibold text-[#1A130E]">
                            {draftEnd ? formatShortDate(draftEnd) : "—"}
                        </div>
                    </div>

                    <div>
                        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-[#8C7E74]">Total Days</p>
                        <div className="rounded-lg bg-[#FAF0E6] px-3 py-2.5 text-center">
                            <span className="text-[14px] font-bold text-[#9E2A1B]">
                                {draftDays ? `${draftDays} Day${draftDays > 1 ? "s" : ""}` : "—"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mx-6 mt-5 rounded-xl border border-[#EBE3D5] bg-white p-4">
                    <p className="mb-2 text-[12px] font-bold text-[#1A130E]">Price Summary</p>
                    <div className="flex items-center justify-between text-[12px] text-[#6E6053]">
                        <span>Rental Price ({fmt(dailyRateNumber)} × {draftDays ?? 0} days)</span>
                        <span className="font-semibold text-[#1A130E]">{fmt(rentalPriceTotal)}</span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[12px] text-[#6E6053]">
                        <span>Security Deposit (Refundable)</span>
                        <span className="font-semibold text-[#1A130E]">{fmt(securityDepositNumber)}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between border-t border-[#EBE3D5] pt-2">
                        <span className="text-[13px] font-bold text-[#1A130E]">Total Payable (Excl. delivery/pickup)</span>
                        <span className="text-[15px] font-bold text-[#9E2A1B]">{fmt(payable)}</span>
                    </div>
                </div>

                <div className="p-6 pt-4">
                    <button
                        onClick={handleConfirm}
                        disabled={!canConfirm}
                        className={`w-full rounded-xl py-3.5 text-[14px] font-bold transition ${
                            canConfirm
                                ? "bg-[#9E2A1B] text-white hover:bg-[#832215]"
                                : "cursor-not-allowed bg-[#DCD3C4] text-[#8C7E74]"
                        }`}
                    >
                        Confirm Dates
                    </button>
                </div>
            </div>
        </div>
    );
}
/* ══════════════════════════════════════════════════════════
   BUY NOW MODAL — delivery method selection + add to cart
   (Thrift flow, unchanged)
══════════════════════════════════════════════════════════ */
type BuyNowStep = "delivery" | "added";

function BuyNowModal({
                         product,
                         onClose,
                     }: {
    product: DeliverableProduct;
    onClose: () => void;
}) {
    const { addToCart, subtotal: cartSubtotal } = useCart();

    const { hasShipping, hasPickup } = deliveryChannelsFor(product);

    const [step, setStep] = useState<BuyNowStep>("delivery");
    const [channel, setChannel] = useState<"shipping" | "pickup">(hasShipping ? "shipping" : "pickup");

    const [fullName, setFullName] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [notes, setNotes] = useState("");

    const [addressLat, setAddressLat] = useState<number | null>(null);
    const [addressLng, setAddressLng] = useState<number | null>(null);
    const [resolvedAddress, setResolvedAddress] = useState("");

    const reverseGeocode = async (lat: number, lng: number) => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
                { headers: { Accept: "application/json" } }
            );
            if (!res.ok) return;
            const data = await res.json();
            if (data?.display_name) setResolvedAddress(data.display_name as string);
        } catch {
            // Silent — nice-to-have only.
        }
    };

    const handleAddressPin = (lat: number, lng: number) => {
        setAddressLat(lat);
        setAddressLng(lng);
        reverseGeocode(lat, lng);
    };

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition((pos) => {
            handleAddressPin(pos.coords.latitude, pos.coords.longitude);
        });
    };

    // TODO: wire these to the real logged-in user's profile data
    // const handleUseProfileName = () => setFullName("");
    // const handleUseProfileNumber = () => setContactNumber("");
    const { user } = useAuth();
    const [fetchingProfileName, setFetchingProfileName] = useState(false);
    const [fetchingProfileNumber, setFetchingProfileNumber] = useState(false);

    const handleUseProfileName = async () => {
        if (!user?.id) {
            toast.error("You need to be logged in to do this.");
            return;
        }
        setFetchingProfileName(true);
        try {
            const profile = await fetchProfile(user.id);
            if (!profile?.name) {
                toast.info("You haven't added a name to your profile yet.");
                return;
            }
            setFullName(profile.name);
        } catch (err) {
            toast.error("Couldn't fetch your profile name. Please try again.");
        } finally {
            setFetchingProfileName(false);
        }
    };

    const handleUseProfileNumber = async () => {
        if (!user?.id) {
            toast.error("You need to be logged in to do this.");
            return;
        }
        setFetchingProfileNumber(true);
        try {
            const profile = await fetchProfile(user.id);
            if (!profile?.phone) {
                toast.info("You haven't added a phone number to your profile yet.");
                return;
            }
            setContactNumber(profile.phone);
        } catch (err) {
            toast.error("Couldn't fetch your profile number. Please try again.");
        } finally {
            setFetchingProfileNumber(false);
        }
    };

    const basePrice = product.priceValue;

    const sellerPickupLat = product.pickupLat ? toNumber(product.pickupLat) : null;
    const sellerPickupLng = product.pickupLng ? toNumber(product.pickupLng) : null;
    const hasSellerOrigin = sellerPickupLat !== null && sellerPickupLng !== null;

    const isDynamic =
        normalizeFulfillment(product.deliveryOption) !== "pickup" &&
        (product.shippingFeeType ?? "").toUpperCase().replace(/[\s_]/g, "").includes("DYNAMIC");

    const deliveryFee = useMemo(() => {
        if (channel === "pickup") return 0;
        if (!isDynamic) return calculateFlexDeliveryFee(product, "shipping", null);
        if (!addressLat || !addressLng || !hasSellerOrigin) return null;
        const km = distanceKm(sellerPickupLat as number, sellerPickupLng as number, addressLat, addressLng);
        const bucket = resolveDistanceBucket(km);
        return calculateFlexDeliveryFee(product, "shipping", bucket);
    }, [channel, isDynamic, addressLat, addressLng, hasSellerOrigin, sellerPickupLat, sellerPickupLng, product]);

    const dynamicFeePending = channel === "shipping" && isDynamic && deliveryFee === null;
    const resolvedFee = deliveryFee ?? 0;
    const total = basePrice + (channel === "shipping" ? resolvedFee : 0);

    const fmt = (n: number) => `Rs. ${n.toLocaleString("en-IN")}`;

    const pickupMapUrl =
        sellerPickupLat && sellerPickupLng
            ? `https://www.google.com/maps?q=${sellerPickupLat},${sellerPickupLng}`
            : null;

    const canSubmit =
        fullName.trim() &&
        contactNumber.trim() &&
        (channel === "pickup" || (addressLat && addressLng)) &&
        !(channel === "shipping" && dynamicFeePending);

    const handleSaveAndAddToCart = () => {
        if (!canSubmit) return;
        // Inside BuyNowModal.handleSaveAndAddToCart():
        addToCart({
            id: product.id,
            brand: product.brand ?? "",
            name: product.name,
            price: product.price,
            size: product.size ?? "",
            condition: product.condition ?? "",
            color: product.color ?? "",
            category: "Thrift",
            image: product.image,
            status: "THRIFT",
            fulfillment: channel,
            deliveryFee: resolvedFee,
            pickupArea: channel === "pickup" ? (product.pickupResolvedAddress ?? product.pickupArea ?? undefined) : undefined,
            pickupHours: channel === "pickup"
                ? `${product.pickupTimeFrom ?? "10:00 AM"} – ${product.pickupTimeTo ?? "6:00 PM"}${
                    product.pickupDays ? ` (${formatPickupDays(product.pickupDays)})` : ""
                }`
                : undefined,
            note:
                channel === "shipping"
                    ? `Ship to: ${resolvedAddress || "Pinned address"} · ${fullName} · ${contactNumber}`
                    : `Pickup by: ${fullName} · ${contactNumber}`,
        });
        setStep("added");
    };

    const subtitle = hasShipping && hasPickup
        ? "This item is available with both shipping and pickup."
        : hasShipping
            ? "This item is available with shipping."
            : "This item is available with pickup.";

    return (
        <div
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-[620px] max-h-[90vh] overflow-y-auto rounded-2xl border border-[#EBE3D5] bg-[#FCFAF7] shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[#EBE3D5] bg-white text-[#6E6053] transition hover:bg-[#F4ECE3]"
                >
                    <X size={16} />
                </button>

                {step === "added" ? (
                    <div className="flex flex-col items-center px-8 py-8 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#4A6B3A] bg-[#F0F6ED]">
                            <Check size={30} strokeWidth={2.2} className="text-[#4A6B3A]" />
                        </div>
                        <h2 className="font-serif text-[22px] font-normal tracking-wide text-[#1A130E]">
                            Added to Cart!
                        </h2>
                        <p className="mt-2 max-w-[360px] text-[13px] leading-relaxed text-[#6E6053]">
                            <span className="font-semibold text-[#1A130E]">{product.name}</span> has been
                            added to your cart with {channel === "shipping" ? "shipping" : "pickup"} selected.
                        </p>

                        <div className="mt-5 w-full rounded-xl border border-[#EBE3D5] bg-white px-5 py-4 text-left">
                            <div className="flex items-center gap-4">
                                <div className="relative h-[64px] w-[52px] shrink-0 overflow-hidden rounded-lg border border-[#EBE3D5] bg-[#F5F0E8]">
                                    <Image src={product.image} alt={product.name} fill className="object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="truncate text-[13px] font-semibold text-[#1A130E]">{product.name}</p>
                                    <p className="text-[11px] text-[#6E6053]">
                                        {product.brand} {product.size ? `· Size ${product.size}` : ""}
                                    </p>
                                    <p className="mt-0.5 text-[11px] text-[#8C7E74]">
                                        {channel === "shipping" ? "Ships to your address" : "Pickup from seller"}
                                    </p>
                                </div>
                                <p className="shrink-0 text-[15px] font-bold text-[#9E2A1B]">{fmt(basePrice)}</p>
                            </div>
                        </div>

                        <div className="mt-3 w-full rounded-xl border border-[#EBE3D5] bg-[#FAF0E6] px-5 py-4 text-left overflow-hidden">
                            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[#8C7E74]">
                                {channel === "shipping" ? <Truck size={12} /> : <MapPin size={12} />}
                                {channel === "shipping" ? "Shipping Details" : "Pickup Details"}
                            </p>

                            {channel === "shipping" ? (
                                <div className="mt-2 space-y-1.5">
                                    <div className="flex items-start gap-1.5">
                                        <MapPin size={13} className="mt-0.5 shrink-0 text-[#9E2A1B]" />
                                        <p className="text-[12px] text-[#4F4338]">
                                            {resolvedAddress || "Pinned address"}
                                        </p>
                                    </div>
                                    <p className="text-[12px] text-[#4F4338]">
                                        <span className="font-semibold">{fullName}</span> · {contactNumber}
                                    </p>
                                    {notes && (
                                        <p className="text-[11px] italic text-[#8C7E74]">"{notes}"</p>
                                    )}
                                </div>
                            ) : (
                                <div className="mt-2 space-y-1.5">
                                    <div className="flex items-start gap-1.5">
                                        <MapPin size={13} className="mt-0.5 shrink-0 text-[#9E2A1B]" />
                                        <p className="text-[12px] text-[#4F4338]">
                                            {product.pickupResolvedAddress ?? product.pickupArea ?? "Shared after booking"}
                                        </p>
                                    </div>
                                    <p className="text-[12px] text-[#4F4338]">
                                        <span className="font-semibold">{fullName}</span> · {contactNumber}
                                    </p>
                                    <p className="text-[11px] text-[#8C7E74]">
                                        Pickup hours: {product.pickupTimeFrom && product.pickupTimeTo
                                        ? `${product.pickupTimeFrom} – ${product.pickupTimeTo}`
                                        : "10:00 AM – 6:00 PM"}
                                        {product.pickupContactNumber ? ` · Seller: ${product.pickupContactNumber}` : ""}
                                    </p>
                                    {notes && (
                                        <p className="text-[11px] italic text-[#8C7E74]">"{notes}"</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="mt-3 w-full rounded-xl border border-[#EBE3D5] bg-white px-5 py-4 text-left">
                            <div className="flex items-center justify-between text-[12px] text-[#6E6053]">
                                <span>Item Price</span>
                                <span className="font-semibold text-[#1A130E]">{fmt(basePrice)}</span>
                            </div>
                            <div className="mt-1.5 flex items-center justify-between text-[12px] text-[#6E6053]">
                                <span>{channel === "shipping" ? "Delivery Fee" : "Pickup Fee"}</span>
                                <span className={`font-semibold ${resolvedFee === 0 ? "text-[#4A6B3A]" : "text-[#1A130E]"}`}>
                                    {resolvedFee === 0 ? "Free" : fmt(resolvedFee)}
                                </span>
                            </div>
                            <div className="mt-2 flex items-center justify-between border-t border-[#EBE3D5] pt-2">
                                <span className="text-[13px] font-bold text-[#1A130E]">Total Paid</span>
                                <span className="text-[16px] font-bold text-[#9E2A1B]">{fmt(total)}</span>
                            </div>
                        </div>

                        <div className="mt-5 w-full grid grid-cols-2 gap-2.5">
                            <Link
                                href="/cart"
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#9E2A1B] py-3.5 text-[14px] font-bold text-white transition hover:bg-[#832215]"
                            >
                                <ShoppingBag size={15} />
                                Go to Cart
                            </Link>
                            <button
                                onClick={onClose}
                                className="w-full rounded-xl border border-[#DDD5C8] bg-white py-3.5 text-[14px] font-semibold text-[#9E2A1B] transition hover:bg-[#FAF6F0]"
                            >
                                Continue Shopping
                            </button>
                        </div>

                        <p className="mt-4 flex items-center gap-1.5 text-[11px] text-[#8C7E74]">
                            <ShieldCheck size={12} strokeWidth={1.6} className="text-[#A89E94]" />
                            Secure checkout. Your payment information is safe with us.
                        </p>
                    </div>
                ) : (
                    <div className="px-6 pt-7 pb-6">
                        <div className="text-center">
                            <h2 className="font-serif text-[22px] font-normal tracking-wide text-[#1A130E]">
                                Choose Delivery Method
                            </h2>
                            <p className="mt-1 text-[13px] text-[#6E6053]">{subtitle}</p>
                        </div>

                        {hasShipping && hasPickup && (
                            <div className="mt-5 grid grid-cols-2 gap-2.5">
                                <button
                                    onClick={() => setChannel("shipping")}
                                    className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-[13px] font-bold transition ${
                                        channel === "shipping"
                                            ? "border-[#9E2A1B] bg-[#9E2A1B]/6 text-[#9E2A1B]"
                                            : "border-[#DDD5C8] bg-white text-[#594E46] hover:bg-[#FAF6F0]"
                                    }`}
                                >
                                    <Truck size={15} /> Shipping
                                </button>
                                <button
                                    onClick={() => setChannel("pickup")}
                                    className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-[13px] font-bold transition ${
                                        channel === "pickup"
                                            ? "border-[#9E2A1B] bg-[#9E2A1B]/6 text-[#9E2A1B]"
                                            : "border-[#DDD5C8] bg-white text-[#594E46] hover:bg-[#FAF6F0]"
                                    }`}
                                >
                                    <MapPin size={15} /> Pickup
                                </button>
                            </div>
                        )}

                        {channel === "shipping" && (
                            <div className="mt-5 space-y-4">
                                <div className="flex items-center rounded-xl border border-[#EBE3D5] bg-[#FAF0E6] divide-x divide-[#EBE3D5]">
                                    <div className="flex flex-1 items-center gap-3 px-4 py-3.5">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E6DED1] bg-white text-[#9E2A1B]">
                                            <Truck size={15} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wide text-[#8C7E74]">Shipping Availability</p>
                                            <p className="text-[13px] font-bold text-[#1A130E]">
                                                {product.shippingAvailability ?? "Nationwide"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex-1 px-4 py-3.5 text-right">
                                        <p className="text-[10px] font-bold uppercase tracking-wide text-[#8C7E74]">Delivery Fee</p>
                                        <p className="text-[15px] font-bold text-[#9E2A1B]">
                                            {dynamicFeePending
                                                ? "Pin address"
                                                : resolvedFee === 0
                                                    ? "Free"
                                                    : fmt(resolvedFee)}
                                        </p>
                                    </div>
                                </div>

                                {isDynamic && (
                                    <div className="flex items-start gap-2 rounded-xl border border-[#D9E2F1] bg-[#F0F4FC] px-3.5 py-2.5 text-[11px] text-[#3A537D]">
                                        <Info size={13} className="mt-0.5 shrink-0" />
                                        Dynamic shipping uses the distance between your location and the
                                        seller's delivery location to calculate the delivery fee.
                                    </div>
                                )}

                                <div>
                                    <p className="text-[13px] font-bold text-[#1A130E] mb-2">Delivery Address</p>
                                    <div className="relative rounded-xl overflow-hidden border border-[#EBE3D5]">
                                        <PickupLocationMap
                                            lat={addressLat}
                                            lng={addressLng}
                                            onLocationSelect={handleAddressPin}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleUseCurrentLocation}
                                            className="absolute top-3 right-3 z-[1000] flex items-center gap-1.5 rounded-lg bg-white/95 border border-[#DDD5C8] px-3 py-2 text-[12px] font-semibold text-[#9E2A1B] shadow-sm hover:bg-white transition"
                                        >
                                            <MapPin size={13} /> Use current location
                                        </button>
                                    </div>
                                    {addressLat && addressLng && (
                                        <div className="mt-2 flex items-start gap-2 rounded-xl border border-[#BFD0B3] bg-[#F0F6ED] px-3 py-2.5">
                                            <Check size={13} className="mt-0.5 shrink-0 text-[#4A6B3A]" />
                                            <div>
                                                <p className="text-[11px] font-bold text-[#2E7D52]">Location pinned successfully</p>
                                                {resolvedAddress && (
                                                    <p className="mt-0.5 text-[11px] leading-relaxed text-[#4F4338]">{resolvedAddress}</p>
                                                )}
                                                <p className="mt-0.5 text-[10px] text-[#8C7E74]">(Tap on map to change location)</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[12px] font-semibold text-[#3D2B1F]">Full Name *</label>
                                            <button
                                                onClick={handleUseProfileName}
                                                disabled={fetchingProfileName}
                                                className="text-[11px] font-semibold text-[#9E2A1B] hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
                                            >
                                                {fetchingProfileName ? "Fetching..." : "Use profile name"}
                                            </button>
                                        </div>
                                        <input
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="Your full name"
                                            className="w-full rounded-lg border border-[#DDD5C8] bg-white px-3.5 py-2.5 text-[13px] text-[#1A130E] focus:outline-none focus:border-[#9E2A1B] focus:ring-2 focus:ring-[#9E2A1B]/10"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[12px] font-semibold text-[#3D2B1F]">Contact Number *</label>
                                            <button
                                                onClick={handleUseProfileNumber}
                                                disabled={fetchingProfileNumber}
                                                className="text-[11px] font-semibold text-[#9E2A1B] hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
                                            >
                                                {fetchingProfileNumber ? "Fetching..." : "Use profile number"}
                                            </button>
                                        </div>
                                        <input
                                            value={contactNumber}
                                            onChange={(e) => setContactNumber(e.target.value)}
                                            placeholder="+977 98XXXXXXXX"
                                            className="w-full rounded-lg border border-[#DDD5C8] bg-white px-3.5 py-2.5 text-[13px] text-[#1A130E] focus:outline-none focus:border-[#9E2A1B] focus:ring-2 focus:ring-[#9E2A1B]/10"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-semibold text-[#3D2B1F]">Delivery Notes (Optional)</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="E.g. Please ring the bell. Gate code 1234."
                                        maxLength={200}
                                        rows={2}
                                        className="w-full resize-none rounded-lg border border-[#DDD5C8] bg-white px-3.5 py-2.5 text-[13px] text-[#1A130E] focus:outline-none focus:border-[#9E2A1B] focus:ring-2 focus:ring-[#9E2A1B]/10"
                                    />
                                    <span className="self-end text-[10px] text-[#A6998E]">{notes.length} / 200</span>
                                </div>
                            </div>
                        )}

                        {channel === "pickup" && (
                            <div className="mt-5 space-y-4">
                                <div className="rounded-xl border border-[#EBE3D5] bg-[#FAF0E6] p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-2.5">
                                            <MapPin size={15} className="mt-0.5 shrink-0 text-[#9E2A1B]" />
                                            <div>
                                                <p className="text-[11px] font-bold text-[#1A130E]">
                                                    Pickup Details <span className="font-normal text-[#8C7E74]">(Provided by Seller)</span>
                                                </p>
                                                <p className="mt-0.5 text-[13px] font-semibold text-[#1A130E]">
                                                    {product.pickupResolvedAddress ?? product.pickupArea ?? "Shared after booking"}
                                                </p>
                                            </div>
                                        </div>
                                        {pickupMapUrl && (
                                            <a
                                                href={pickupMapUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="shrink-0 text-[12px] font-bold text-[#9E2A1B] hover:underline"
                                            >
                                                View on Map
                                            </a>
                                        )}
                                    </div>

                                    <div className="mt-3.5 grid grid-cols-3 gap-3 border-t border-[#EBE3D5] pt-3.5">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wide text-[#8C7E74]">Pickup Hours</p>
                                            <p className="mt-0.5 text-[12px] font-semibold text-[#1A130E]">
                                                {product.pickupTimeFrom && product.pickupTimeTo
                                                    ? `${product.pickupTimeFrom} – ${product.pickupTimeTo}`
                                                    : "10:00 AM – 6:00 PM"}
                                            </p>
                                            <p className="text-[10px] text-[#8C7E74]">
                                                ({formatPickupDays(product.pickupDays)}
                                                {product.sameDayPickup ? " · Same-day OK" : ""})
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wide text-[#8C7E74]">Instructions</p>
                                            <p className="mt-0.5 text-[12px] font-semibold text-[#1A130E] line-clamp-2">
                                                {product.pickupInstructions ?? "Call before arriving."}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wide text-[#8C7E74]">Contact Number</p>
                                            <p className="mt-0.5 text-[12px] font-semibold text-[#1A130E]">
                                                {product.pickupContactNumber ?? "Shared after booking"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[13px] font-bold text-[#1A130E]">Your Pickup Information</p>
                                    <p className="text-[11px] text-[#8C7E74]">This information will be shared with the seller to coordinate pickup.</p>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[12px] font-semibold text-[#3D2B1F]">Full Name *</label>
                                        <button onClick={handleUseProfileName} className="text-[11px] font-semibold text-[#9E2A1B] hover:underline">
                                            Use profile name
                                        </button>
                                    </div>
                                    <input
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Your full name"
                                        className="w-full rounded-lg border border-[#DDD5C8] bg-white px-3.5 py-2.5 text-[13px] text-[#1A130E] focus:outline-none focus:border-[#9E2A1B] focus:ring-2 focus:ring-[#9E2A1B]/10"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[12px] font-semibold text-[#3D2B1F]">Contact Number *</label>
                                        <button onClick={handleUseProfileNumber} className="text-[11px] font-semibold text-[#9E2A1B] hover:underline">
                                            Use profile number
                                        </button>
                                    </div>
                                    <input
                                        value={contactNumber}
                                        onChange={(e) => setContactNumber(e.target.value)}
                                        placeholder="+977 98XXXXXXXX"
                                        className="w-full rounded-lg border border-[#DDD5C8] bg-white px-3.5 py-2.5 text-[13px] text-[#1A130E] focus:outline-none focus:border-[#9E2A1B] focus:ring-2 focus:ring-[#9E2A1B]/10"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-semibold text-[#3D2B1F]">Pickup Notes (Optional)</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="E.g. I will come with a friend."
                                        maxLength={200}
                                        rows={2}
                                        className="w-full resize-none rounded-lg border border-[#DDD5C8] bg-white px-3.5 py-2.5 text-[13px] text-[#1A130E] focus:outline-none focus:border-[#9E2A1B] focus:ring-2 focus:ring-[#9E2A1B]/10"
                                    />
                                    <span className="self-end text-[10px] text-[#A6998E]">{notes.length} / 200</span>
                                </div>
                            </div>
                        )}

                        <div className="mt-5 flex items-center justify-between rounded-xl bg-white border border-[#EBE3D5] px-4 py-3.5">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wide text-[#8C7E74]">Item Price</p>
                                <p className="text-[14px] font-bold text-[#1A130E]">{fmt(basePrice)}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wide text-[#8C7E74]">
                                    {channel === "shipping" ? "Delivery Fee" : "Pickup Fee"}
                                </p>
                                <p className={`text-[14px] font-bold ${
                                    channel === "shipping" && dynamicFeePending
                                        ? "text-[#8C7E74]"
                                        : resolvedFee === 0
                                            ? "text-[#4A6B3A]"
                                            : "text-[#1A130E]"
                                }`}>
                                    {channel === "shipping" && dynamicFeePending
                                        ? "—"
                                        : resolvedFee === 0
                                            ? "Free"
                                            : fmt(resolvedFee)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold uppercase tracking-wide text-[#8C7E74]">Total Amount</p>
                                <p className="text-[16px] font-bold text-[#9E2A1B]">
                                    {channel === "shipping" && dynamicFeePending ? "—" : fmt(total)}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleSaveAndAddToCart}
                            disabled={!canSubmit}
                            className={`mt-4 w-full rounded-xl py-3.5 text-[14px] font-bold transition ${
                                canSubmit
                                    ? "bg-[#9E2A1B] text-white hover:bg-[#832215]"
                                    : "cursor-not-allowed bg-[#DCD3C4] text-[#8C7E74]"
                            }`}
                        >
                            Save & Add to Cart
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════
   RENT NOW MODAL — mirrors BuyNowModal's Shipping / Pickup /
   Flex flow, but priced for a rental: Rental Price (rate × days)
   + Security Deposit + Delivery/Pickup Fee. Success screen shows
   "Rented for X days" info instead of a plain add-to-cart line.
══════════════════════════════════════════════════════════ */
type RentNowStep = "delivery" | "added";

function RentNowModal({
                          product,
                          rentInfo,
                          onClose,
                      }: {
    product: DeliverableProduct;
    rentInfo: {
        days: number;
        startDate: Date;
        endDate: Date;
        dailyRateNumber: number;
        securityDepositNumber: number;
    };
    onClose: () => void;
}) {
    const { addToCart } = useCart();
    const { hasShipping, hasPickup } = deliveryChannelsFor(product);

    const { user } = useAuth();
    const [fetchingProfileName, setFetchingProfileName] = useState(false);
    const [fetchingProfileNumber, setFetchingProfileNumber] = useState(false);

    const [step, setStep] = useState<RentNowStep>("delivery");
    const [channel, setChannel] = useState<"shipping" | "pickup">(hasShipping ? "shipping" : "pickup");

    const [fullName, setFullName] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [notes, setNotes] = useState("");

    const [addressLat, setAddressLat] = useState<number | null>(null);
    const [addressLng, setAddressLng] = useState<number | null>(null);
    const [resolvedAddress, setResolvedAddress] = useState("");

    const reverseGeocode = async (lat: number, lng: number) => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
                { headers: { Accept: "application/json" } }
            );
            if (!res.ok) return;
            const data = await res.json();
            if (data?.display_name) setResolvedAddress(data.display_name as string);
        } catch {
            // Silent — nice-to-have only.
        }
    };

    const handleAddressPin = (lat: number, lng: number) => {
        setAddressLat(lat);
        setAddressLng(lng);
        reverseGeocode(lat, lng);
    };

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition((pos) => {
            handleAddressPin(pos.coords.latitude, pos.coords.longitude);
        });
    };

    const handleUseProfileName = async () => {
        if (!user?.id) {
            toast.error("You need to be logged in to do this.");
            return;
        }
        setFetchingProfileName(true);
        try {
            const profile = await fetchProfile(user.id);
            if (!profile?.name) {
                toast.info("You haven't added a name to your profile yet.");
                return;
            }
            setFullName(profile.name);
        } catch (err) {
            toast.error("Couldn't fetch your profile name. Please try again.");
        } finally {
            setFetchingProfileName(false);
        }
    };

    const handleUseProfileNumber = async () => {
        if (!user?.id) {
            toast.error("You need to be logged in to do this.");
            return;
        }
        setFetchingProfileNumber(true);
        try {
            const profile = await fetchProfile(user.id);
            if (!profile?.phone) {
                toast.info("You haven't added a phone number to your profile yet.");
                return;
            }
            setContactNumber(profile.phone);
        } catch (err) {
            toast.error("Couldn't fetch your profile number. Please try again.");
        } finally {
            setFetchingProfileNumber(false);
        }
    };

    const rentalPrice = rentInfo.dailyRateNumber * rentInfo.days;
    const securityDeposit = rentInfo.securityDepositNumber;

    const sellerPickupLat = product.pickupLat ? toNumber(product.pickupLat) : null;
    const sellerPickupLng = product.pickupLng ? toNumber(product.pickupLng) : null;
    const hasSellerOrigin = sellerPickupLat !== null && sellerPickupLng !== null;

    const isDynamic =
        normalizeFulfillment(product.deliveryOption) !== "pickup" &&
        (product.shippingFeeType ?? "").toUpperCase().replace(/[\s_]/g, "").includes("DYNAMIC");

    const deliveryFee = useMemo(() => {
        if (channel === "pickup") return 0;
        if (!isDynamic) return calculateFlexDeliveryFee(product, "shipping", null);
        if (!addressLat || !addressLng || !hasSellerOrigin) return null;
        const km = distanceKm(sellerPickupLat as number, sellerPickupLng as number, addressLat, addressLng);
        const bucket = resolveDistanceBucket(km);
        return calculateFlexDeliveryFee(product, "shipping", bucket);
    }, [channel, isDynamic, addressLat, addressLng, hasSellerOrigin, sellerPickupLat, sellerPickupLng, product]);

    const dynamicFeePending = channel === "shipping" && isDynamic && deliveryFee === null;
    const resolvedFee = deliveryFee ?? 0;
    const total = rentalPrice + securityDeposit + (channel === "shipping" ? resolvedFee : 0);

    const fmt = (n: number) => `Rs. ${n.toLocaleString("en-IN")}`;

    const pickupMapUrl =
        sellerPickupLat && sellerPickupLng
            ? `https://www.google.com/maps?q=${sellerPickupLat},${sellerPickupLng}`
            : null;

    const canSubmit =
        fullName.trim() &&
        contactNumber.trim() &&
        (channel === "pickup" || (addressLat && addressLng)) &&
        !(channel === "shipping" && dynamicFeePending);

    const handleSaveAndAddToCart = () => {
        if (!canSubmit) return;

        // Inside RentNowModal.handleSaveAndAddToCart():
        addToCart({
            id: product.id,
            brand: product.brand ?? "",
            name: product.name,
            price: `${fmt(rentInfo.dailyRateNumber)} / day`,
            size: product.size ?? "",
            condition: product.condition ?? "",
            color: product.color ?? "",
            category: "Rent",
            image: product.image,
            status: "RENT",
            fulfillment: channel,
            deliveryFee: resolvedFee,
            // Carries the refundable deposit through to the cart item so
            // the cart page's Order Summary can sum real per-item deposits
            // instead of charging a flat placeholder amount.
            securityDeposit: securityDeposit,
            pickupArea: channel === "pickup" ? (product.pickupResolvedAddress ?? product.pickupArea ?? undefined) : undefined,
            pickupHours: channel === "pickup"
                ? `${product.pickupTimeFrom ?? "10:00 AM"} – ${product.pickupTimeTo ?? "6:00 PM"}${
                    product.pickupDays ? ` (${formatPickupDays(product.pickupDays)})` : ""
                }`
                : undefined,
            rentalDays: rentInfo.days,
            rentalStart: formatShortDate(rentInfo.startDate),
            rentalEnd: formatShortDate(rentInfo.endDate),
            returnDeadline: `${rentInfo.endDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} (by 6:00 PM)`,
            note:
                channel === "shipping"
                    ? `Ship to: ${resolvedAddress || "Pinned address"} · ${fullName} · ${contactNumber}`
                    : `Pickup by: ${fullName} · ${contactNumber}`,
        });
        setStep("added");
    };

    const subtitle = hasShipping && hasPickup
        ? "This item is available with both shipping and pickup."
        : hasShipping
            ? "This item is available with shipping."
            : "This item is available with pickup.";

    return (
        <div
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-[620px] max-h-[90vh] overflow-y-auto rounded-2xl border border-[#EBE3D5] bg-[#FCFAF7] shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[#EBE3D5] bg-white text-[#6E6053] transition hover:bg-[#F4ECE3]"
                >
                    <X size={16} />
                </button>

                {step === "added" ? (
                    <div className="flex flex-col items-center px-8 py-8 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#4A6B3A] bg-[#F0F6ED]">
                            <Check size={30} strokeWidth={2.2} className="text-[#4A6B3A]" />
                        </div>
                        <h2 className="font-serif text-[22px] font-normal tracking-wide text-[#1A130E]">
                            Added to Cart!
                        </h2>
                        <p className="mt-2 max-w-[380px] text-[13px] leading-relaxed text-[#6E6053]">
                            <span className="font-semibold text-[#1A130E]">{product.name}</span> has been added to
                            your cart — rented for{" "}
                            <span className="font-semibold text-[#1A130E]">
                                {rentInfo.days} day{rentInfo.days > 1 ? "s" : ""}
                            </span>{" "}
                            ({formatShortDate(rentInfo.startDate)} → {formatShortDate(rentInfo.endDate)}) with{" "}
                            {channel === "shipping" ? "shipping" : "pickup"} selected.
                        </p>

                        <div className="mt-5 w-full rounded-xl border border-[#EBE3D5] bg-white px-5 py-4 text-left">
                            <div className="flex items-center gap-4">
                                <div className="relative h-[64px] w-[52px] shrink-0 overflow-hidden rounded-lg border border-[#EBE3D5] bg-[#F5F0E8]">
                                    <Image src={product.image} alt={product.name} fill className="object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="truncate text-[13px] font-semibold text-[#1A130E]">{product.name}</p>
                                    <p className="text-[11px] text-[#6E6053]">
                                        {product.brand} {product.size ? `· Size ${product.size}` : ""}
                                    </p>
                                    <p className="mt-0.5 text-[11px] text-[#8C7E74]">
                                        {formatShortDate(rentInfo.startDate)} → {formatShortDate(rentInfo.endDate)}
                                    </p>
                                </div>
                                <p className="shrink-0 text-[15px] font-bold text-[#9E2A1B]">
                                    {fmt(rentInfo.dailyRateNumber)}/day
                                </p>
                            </div>
                        </div>

                        <div className="mt-3 w-full rounded-xl border border-[#EBE3D5] bg-[#FAF0E6] px-5 py-4 text-left overflow-hidden">
                            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[#8C7E74]">
                                {channel === "shipping" ? <Truck size={12} /> : <MapPin size={12} />}
                                {channel === "shipping" ? "Shipping Details" : "Pickup Details"}
                            </p>

                            {channel === "shipping" ? (
                                <div className="mt-2 space-y-1.5">
                                    <div className="flex items-start gap-1.5">
                                        <MapPin size={13} className="mt-0.5 shrink-0 text-[#9E2A1B]" />
                                        <p className="text-[12px] text-[#4F4338]">{resolvedAddress || "Pinned address"}</p>
                                    </div>
                                    <p className="text-[12px] text-[#4F4338]">
                                        <span className="font-semibold">{fullName}</span> · {contactNumber}
                                    </p>
                                    {notes && <p className="text-[11px] italic text-[#8C7E74]">"{notes}"</p>}
                                </div>
                            ) : (
                                <div className="mt-2 space-y-1.5">
                                    <div className="flex items-start gap-1.5">
                                        <MapPin size={13} className="mt-0.5 shrink-0 text-[#9E2A1B]" />
                                        <p className="text-[12px] text-[#4F4338]">
                                            {product.pickupResolvedAddress ?? product.pickupArea ?? "Shared after booking"}
                                        </p>
                                    </div>
                                    <p className="text-[12px] text-[#4F4338]">
                                        <span className="font-semibold">{fullName}</span> · {contactNumber}
                                    </p>
                                    <p className="text-[11px] text-[#8C7E74]">
                                        Pickup hours: {product.pickupTimeFrom && product.pickupTimeTo
                                        ? `${product.pickupTimeFrom} – ${product.pickupTimeTo}`
                                        : "10:00 AM – 6:00 PM"}
                                        {product.pickupContactNumber ? ` · Seller: ${product.pickupContactNumber}` : ""}
                                    </p>
                                    {notes && <p className="text-[11px] italic text-[#8C7E74]">"{notes}"</p>}
                                </div>
                            )}
                        </div>

                        <div className="mt-3 w-full rounded-xl border border-[#EBE3D5] bg-white px-5 py-4 text-left">
                            <div className="flex items-center justify-between text-[12px] text-[#6E6053]">
                                <span>Rental Price ({fmt(rentInfo.dailyRateNumber)} × {rentInfo.days} days)</span>
                                <span className="font-semibold text-[#1A130E]">{fmt(rentalPrice)}</span>
                            </div>
                            <div className="mt-1.5 flex items-center justify-between text-[12px] text-[#6E6053]">
                                <span>Security Deposit (Refundable)</span>
                                <span className="font-semibold text-[#1A130E]">{fmt(securityDeposit)}</span>
                            </div>
                            <div className="mt-1.5 flex items-center justify-between text-[12px] text-[#6E6053]">
                                <span>{channel === "shipping" ? "Delivery Fee" : "Pickup Fee"}</span>
                                <span className={`font-semibold ${resolvedFee === 0 ? "text-[#4A6B3A]" : "text-[#1A130E]"}`}>
                                    {resolvedFee === 0 ? "Free" : fmt(resolvedFee)}
                                </span>
                            </div>
                            <div className="mt-2 flex items-center justify-between border-t border-[#EBE3D5] pt-2">
                                <span className="text-[13px] font-bold text-[#1A130E]">Total Payable</span>
                                <span className="text-[16px] font-bold text-[#9E2A1B]">{fmt(total)}</span>
                            </div>
                        </div>

                        <div className="mt-5 w-full grid grid-cols-2 gap-2.5">
                            <Link
                                href="/cart"
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#9E2A1B] py-3.5 text-[14px] font-bold text-white transition hover:bg-[#832215]"
                            >
                                <ShoppingBag size={15} />
                                Go to Cart
                            </Link>
                            <button
                                onClick={onClose}
                                className="w-full rounded-xl border border-[#DDD5C8] bg-white py-3.5 text-[14px] font-semibold text-[#9E2A1B] transition hover:bg-[#FAF6F0]"
                            >
                                Continue Browsing
                            </button>
                        </div>

                        <p className="mt-4 flex items-center gap-1.5 text-[11px] text-[#8C7E74]">
                            <ShieldCheck size={12} strokeWidth={1.6} className="text-[#A89E94]" />
                            Secure checkout. Your payment information is safe with us.
                        </p>
                    </div>
                ) : (
                    <div className="px-6 pt-7 pb-6">
                        <div className="text-center">
                            <h2 className="font-serif text-[22px] font-normal tracking-wide text-[#1A130E]">
                                Choose Delivery Method
                            </h2>
                            <p className="mt-1 text-[13px] text-[#6E6053]">{subtitle}</p>
                            <p className="mt-1 text-[11px] font-semibold text-[#9E2A1B]">
                                Renting for {rentInfo.days} day{rentInfo.days > 1 ? "s" : ""} ·{" "}
                                {formatShortDate(rentInfo.startDate)} → {formatShortDate(rentInfo.endDate)}
                            </p>
                        </div>

                        {hasShipping && hasPickup && (
                            <div className="mt-5 grid grid-cols-2 gap-2.5">
                                <button
                                    onClick={() => setChannel("shipping")}
                                    className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-[13px] font-bold transition ${
                                        channel === "shipping"
                                            ? "border-[#9E2A1B] bg-[#9E2A1B]/6 text-[#9E2A1B]"
                                            : "border-[#DDD5C8] bg-white text-[#594E46] hover:bg-[#FAF6F0]"
                                    }`}
                                >
                                    <Truck size={15} /> Shipping
                                </button>
                                <button
                                    onClick={() => setChannel("pickup")}
                                    className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-[13px] font-bold transition ${
                                        channel === "pickup"
                                            ? "border-[#9E2A1B] bg-[#9E2A1B]/6 text-[#9E2A1B]"
                                            : "border-[#DDD5C8] bg-white text-[#594E46] hover:bg-[#FAF6F0]"
                                    }`}
                                >
                                    <MapPin size={15} /> Pickup
                                </button>
                            </div>
                        )}

                        {channel === "shipping" && (
                            <div className="mt-5 space-y-4">
                                <div className="flex items-center rounded-xl border border-[#EBE3D5] bg-[#FAF0E6] divide-x divide-[#EBE3D5]">
                                    <div className="flex flex-1 items-center gap-3 px-4 py-3.5">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E6DED1] bg-white text-[#9E2A1B]">
                                            <Truck size={15} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wide text-[#8C7E74]">Shipping Availability</p>
                                            <p className="text-[13px] font-bold text-[#1A130E]">
                                                {product.shippingAvailability ?? "Nationwide"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex-1 px-4 py-3.5 text-right">
                                        <p className="text-[10px] font-bold uppercase tracking-wide text-[#8C7E74]">Delivery Fee</p>
                                        <p className="text-[15px] font-bold text-[#9E2A1B]">
                                            {dynamicFeePending ? "Pin address" : resolvedFee === 0 ? "Free" : fmt(resolvedFee)}
                                        </p>
                                    </div>
                                </div>

                                {isDynamic && (
                                    <div className="flex items-start gap-2 rounded-xl border border-[#D9E2F1] bg-[#F0F4FC] px-3.5 py-2.5 text-[11px] text-[#3A537D]">
                                        <Info size={13} className="mt-0.5 shrink-0" />
                                        Dynamic shipping uses the distance between your location and the
                                        seller's delivery location to calculate the delivery fee.
                                    </div>
                                )}

                                <div>
                                    <p className="text-[13px] font-bold text-[#1A130E] mb-2">Delivery Address</p>
                                    <div className="relative rounded-xl overflow-hidden border border-[#EBE3D5]">
                                        <PickupLocationMap
                                            lat={addressLat}
                                            lng={addressLng}
                                            onLocationSelect={handleAddressPin}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleUseCurrentLocation}
                                            className="absolute top-3 right-3 z-[1000] flex items-center gap-1.5 rounded-lg bg-white/95 border border-[#DDD5C8] px-3 py-2 text-[12px] font-semibold text-[#9E2A1B] shadow-sm hover:bg-white transition"
                                        >
                                            <MapPin size={13} /> Use current location
                                        </button>
                                    </div>
                                    {addressLat && addressLng && (
                                        <div className="mt-2 flex items-start gap-2 rounded-xl border border-[#BFD0B3] bg-[#F0F6ED] px-3 py-2.5">
                                            <Check size={13} className="mt-0.5 shrink-0 text-[#4A6B3A]" />
                                            <div>
                                                <p className="text-[11px] font-bold text-[#2E7D52]">Location pinned successfully</p>
                                                {resolvedAddress && (
                                                    <p className="mt-0.5 text-[11px] leading-relaxed text-[#4F4338]">{resolvedAddress}</p>
                                                )}
                                                <p className="mt-0.5 text-[10px] text-[#8C7E74]">(Tap on map to change location)</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[12px] font-semibold text-[#3D2B1F]">Full Name *</label>
                                            <button
                                                onClick={handleUseProfileName}
                                                disabled={fetchingProfileName}
                                                className="text-[11px] font-semibold text-[#9E2A1B] hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
                                            >
                                                {fetchingProfileName ? "Fetching..." : "Use profile name"}
                                            </button>
                                        </div>
                                        <input
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="Your full name"
                                            className="w-full rounded-lg border border-[#DDD5C8] bg-white px-3.5 py-2.5 text-[13px] text-[#1A130E] focus:outline-none focus:border-[#9E2A1B] focus:ring-2 focus:ring-[#9E2A1B]/10"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[12px] font-semibold text-[#3D2B1F]">Contact Number *</label>
                                            <button
                                                onClick={handleUseProfileNumber}
                                                disabled={fetchingProfileNumber}
                                                className="text-[11px] font-semibold text-[#9E2A1B] hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
                                            >
                                                {fetchingProfileNumber ? "Fetching..." : "Use profile number"}
                                            </button>
                                        </div>
                                        <input
                                            value={contactNumber}
                                            onChange={(e) => setContactNumber(e.target.value)}
                                            placeholder="+977 98XXXXXXXX"
                                            className="w-full rounded-lg border border-[#DDD5C8] bg-white px-3.5 py-2.5 text-[13px] text-[#1A130E] focus:outline-none focus:border-[#9E2A1B] focus:ring-2 focus:ring-[#9E2A1B]/10"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-semibold text-[#3D2B1F]">Delivery Notes (Optional)</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="E.g. Please ring the bell. Gate code 1234."
                                        maxLength={200}
                                        rows={2}
                                        className="w-full resize-none rounded-lg border border-[#DDD5C8] bg-white px-3.5 py-2.5 text-[13px] text-[#1A130E] focus:outline-none focus:border-[#9E2A1B] focus:ring-2 focus:ring-[#9E2A1B]/10"
                                    />
                                    <span className="self-end text-[10px] text-[#A6998E]">{notes.length} / 200</span>
                                </div>
                            </div>
                        )}

                        {channel === "pickup" && (
                            <div className="mt-5 space-y-4">
                                <div className="rounded-xl border border-[#EBE3D5] bg-[#FAF0E6] p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-2.5">
                                            <MapPin size={15} className="mt-0.5 shrink-0 text-[#9E2A1B]" />
                                            <div>
                                                <p className="text-[11px] font-bold text-[#1A130E]">
                                                    Pickup Details <span className="font-normal text-[#8C7E74]">(Provided by Seller)</span>
                                                </p>
                                                <p className="mt-0.5 text-[13px] font-semibold text-[#1A130E]">
                                                    {product.pickupResolvedAddress ?? product.pickupArea ?? "Shared after booking"}
                                                </p>
                                            </div>
                                        </div>
                                        {pickupMapUrl && (
                                            <a
                                                href={pickupMapUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="shrink-0 text-[12px] font-bold text-[#9E2A1B] hover:underline"
                                            >
                                                View on Map
                                            </a>
                                        )}
                                    </div>

                                    <div className="mt-3.5 grid grid-cols-3 gap-3 border-t border-[#EBE3D5] pt-3.5">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wide text-[#8C7E74]">Pickup Hours</p>
                                            <p className="mt-0.5 text-[12px] font-semibold text-[#1A130E]">
                                                {product.pickupTimeFrom && product.pickupTimeTo
                                                    ? `${product.pickupTimeFrom} – ${product.pickupTimeTo}`
                                                    : "10:00 AM – 6:00 PM"}
                                            </p>
                                            <p className="text-[10px] text-[#8C7E74]">
                                                ({formatPickupDays(product.pickupDays)}
                                                {product.sameDayPickup ? " · Same-day OK" : ""})
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wide text-[#8C7E74]">Instructions</p>
                                            <p className="mt-0.5 text-[12px] font-semibold text-[#1A130E] line-clamp-2">
                                                {product.pickupInstructions ?? "Call before arriving."}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wide text-[#8C7E74]">Contact Number</p>
                                            <p className="mt-0.5 text-[12px] font-semibold text-[#1A130E]">
                                                {product.pickupContactNumber ?? "Shared after booking"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[13px] font-bold text-[#1A130E]">Your Pickup Information</p>
                                    <p className="text-[11px] text-[#8C7E74]">This information will be shared with the seller to coordinate pickup.</p>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[12px] font-semibold text-[#3D2B1F]">Full Name *</label>
                                        <button onClick={handleUseProfileName} className="text-[11px] font-semibold text-[#9E2A1B] hover:underline">
                                            Use profile name
                                        </button>
                                    </div>
                                    <input
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Your full name"
                                        className="w-full rounded-lg border border-[#DDD5C8] bg-white px-3.5 py-2.5 text-[13px] text-[#1A130E] focus:outline-none focus:border-[#9E2A1B] focus:ring-2 focus:ring-[#9E2A1B]/10"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[12px] font-semibold text-[#3D2B1F]">Contact Number *</label>
                                        <button onClick={handleUseProfileNumber} className="text-[11px] font-semibold text-[#9E2A1B] hover:underline">
                                            Use profile number
                                        </button>
                                    </div>
                                    <input
                                        value={contactNumber}
                                        onChange={(e) => setContactNumber(e.target.value)}
                                        placeholder="+977 98XXXXXXXX"
                                        className="w-full rounded-lg border border-[#DDD5C8] bg-white px-3.5 py-2.5 text-[13px] text-[#1A130E] focus:outline-none focus:border-[#9E2A1B] focus:ring-2 focus:ring-[#9E2A1B]/10"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-semibold text-[#3D2B1F]">Pickup Notes (Optional)</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="E.g. I will come with a friend."
                                        maxLength={200}
                                        rows={2}
                                        className="w-full resize-none rounded-lg border border-[#DDD5C8] bg-white px-3.5 py-2.5 text-[13px] text-[#1A130E] focus:outline-none focus:border-[#9E2A1B] focus:ring-2 focus:ring-[#9E2A1B]/10"
                                    />
                                    <span className="self-end text-[10px] text-[#A6998E]">{notes.length} / 200</span>
                                </div>
                            </div>
                        )}

                        <div className="mt-5 rounded-xl bg-white border border-[#EBE3D5] px-4 py-3.5 space-y-1.5">
                            <div className="flex items-center justify-between text-[12px]">
                                <span className="text-[#6E6053]">Rental Price ({fmt(rentInfo.dailyRateNumber)} × {rentInfo.days} days)</span>
                                <span className="font-bold text-[#1A130E]">{fmt(rentalPrice)}</span>
                            </div>
                            <div className="flex items-center justify-between text-[12px]">
                                <span className="text-[#6E6053]">Security Deposit (Refundable)</span>
                                <span className="font-bold text-[#1A130E]">{fmt(securityDeposit)}</span>
                            </div>
                            <div className="flex items-center justify-between text-[12px]">
                                <span className="text-[#6E6053]">{channel === "shipping" ? "Delivery Fee" : "Pickup Fee"}</span>
                                <span className={`font-bold ${channel === "shipping" && dynamicFeePending ? "text-[#8C7E74]" : resolvedFee === 0 ? "text-[#4A6B3A]" : "text-[#1A130E]"}`}>
                                    {channel === "shipping" && dynamicFeePending ? "—" : resolvedFee === 0 ? "Free" : fmt(resolvedFee)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between border-t border-[#EBE3D5] pt-1.5">
                                <span className="text-[13px] font-bold text-[#1A130E]">Total Payable</span>
                                <span className="text-[16px] font-bold text-[#9E2A1B]">
                                    {channel === "shipping" && dynamicFeePending ? "—" : fmt(total)}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleSaveAndAddToCart}
                            disabled={!canSubmit}
                            className={`mt-4 w-full rounded-xl py-3.5 text-[14px] font-bold transition ${
                                canSubmit
                                    ? "bg-[#9E2A1B] text-white hover:bg-[#832215]"
                                    : "cursor-not-allowed bg-[#DCD3C4] text-[#8C7E74]"
                            }`}
                        >
                            Save & Add to Cart
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}