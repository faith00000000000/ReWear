"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
    Heart, Info,
    Leaf,
    Lock,
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
import {useCart} from "@/lib/CartContext";

/* ─── Feature gate ───────────────────────────────────────────
   No booking system exists yet, so "Currently on Rent" never
   renders. Flip this once real rental-status data is wired up. */
const BOOKING_SYSTEM_ENABLED = false;

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

/* ─── Rent calendar helpers (placeholder availability logic) ─
   Swap this out once real data exists, e.g. product.unavailableDates
   and product.fewLeftDates arrays of "YYYY-MM-DD" strings. */
type DayState = "available" | "few-left" | "unavailable" | "selected" | "out-of-month";

function getCalendarDays(year: number, month: number) {
    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: { day: number; inMonth: boolean }[] = [];
    for (let i = startWeekday - 1; i >= 0; i--) {
        cells.push({ day: daysInPrevMonth - i, inMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push({ day: d, inMonth: true });
    }
    while (cells.length % 7 !== 0) {
        cells.push({ day: cells.length - (startWeekday + daysInMonth) + 1, inMonth: false });
    }
    return cells;
}

function placeholderDayState(day: number, inMonth: boolean, selectedDay: number): DayState {
    if (!inMonth) return "out-of-month";
    if (day === selectedDay) return "selected";
    if (day % 7 === 0) return "unavailable";
    if (day % 5 === 0) return "few-left";
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
    const router = useRouter();
    const searchParams = useSearchParams();

    // ── Auth state now comes from AuthContext. `authed` is used for
    // the synchronous requireAuth() gate below — context value is kept
    // in sync the instant signOut()/login happens anywhere in the app. ──
    const { authed } = useAuth();

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
    const [activeTab, setActiveTab] = useState<DetailTab>("description");

    const today = useMemo(() => new Date(), []);
    const [calYear, setCalYear] = useState(today.getFullYear());
    const [calMonth, setCalMonth] = useState(today.getMonth());
    const [selectedDay, setSelectedDay] = useState(today.getDate());

    const view = searchParams.get("view"); // "thrift" | "rent" | null
    const isHybridListing = product.status === "THRIFT + RENT";

    const isThrift = product.status === "THRIFT" || (isHybridListing && view !== "rent");
    const isRent = product.status === "RENT" || (isHybridListing && view === "rent");
    const isHybrid = isHybridListing;

    // Gated off — no booking system yet, see BOOKING_SYSTEM_ENABLED above.
    const isRentedNow = BOOKING_SYSTEM_ENABLED && Boolean(product.rentDuration);

    // Real seller data — always present now, no fallback hack needed.
    const sellerName = product.seller.name;
    const sellerAvatarUrl = product.seller.avatarUrl;

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

    const monthLabel = new Date(calYear, calMonth, 1).toLocaleString("en-US", {
        month: "long",
        year: "numeric",
    });
    const calendarCells = useMemo(
        () => getCalendarDays(calYear, calMonth),
        [calYear, calMonth],
    );

    const rentalDays = 3; // placeholder — wire to actual date-range selection later
    const dailyRate = product.rentalPrice ?? "Rs. 200";
    const dailyRateNumber = parseFloat(dailyRate.replace(/[^0-9.]/g, "")) || 200;
    const securityDeposit = "Rs. 1,000";
    const rentalTotal = `Rs. ${(dailyRateNumber * rentalDays).toLocaleString("en-IN")}`;

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
                                <button className="absolute right-2.5 top-11 flex h-7 w-7 items-center justify-center rounded-full border border-[#EBE3D5] bg-white text-[#6E6053] shadow-sm transition hover:text-[#9E2A1B]">
                                    <Heart size={13} />
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

                                {/* ── Description Tab ── */}
                                {activeTab === "description" && (
                                    <div className="mt-4 rounded-xl border border-[#EBE3D5] bg-[#FDFAF6] p-5">
                                        <h4 className="text-[14px] font-bold text-[#1A130E]">About this item</h4>
                                        <p className="mt-1.5 text-[13px] leading-relaxed text-[#6E6053]">
                                            {product.description ?? "No description provided for this item."}
                                        </p>
                                        <div className="mt-4 space-y-3 border-t border-[#EBE3D5] pt-4">
                                            {[
                                                { icon: Tag, label: "Style / Occasion", value: "Party Wear" },
                                                { icon: BadgeCheck, label: "Brand", value: product.brand ?? "—" },
                                                { icon: Users, label: "Occasion", value: "Weddings, Parties" },
                                                { icon: Tag, label: "Tags", value: "Lehenga, Ethnic, Wedding, Golden" },
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

                                <div className="flex items-center gap-2 rounded-full bg-[#F5EFE5] border border-[#9E2A1B]/4 py-1 pl-1 pr-3.5">
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
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <h1 className="font-serif text-[32px] font-normal leading-[1.12] tracking-tight text-[#1A130E] sm:text-[36px]">
                                    {product.name}
                                </h1>
                                <span className="mt-1.5 inline-block rounded-full border border-[#9E2A1B] bg-[#9E2A1B]/4 px-2.5 py-0.5 text-[11px] font-semibold text-[#9E2A1B]">
                  Party Wear
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
                                            { label: "Shipping / Pickup", value: product.shippingOption },
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
                                    </div>

                                    <button
                                        onClick={() => requireAuth(() => setThriftModalOpen(true))}
                                        className="w-full rounded-lg bg-[#9E2A1B] py-3.5 text-[13px] font-bold text-white transition hover:bg-[#832215]"
                                    >
                                        Buy Now
                                    </button>

                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            onClick={() => setTryOnOpen(true)}
                                            className="flex items-center justify-center gap-1.5 rounded-lg border border-[#DDD5C8] bg-white py-2.5 text-[11px] font-semibold text-[#594E46] transition hover:bg-[#FAF6F0]"
                                        >
                                            <Sparkles size={13} className="text-[#9E2A1B]" /> Virtual Try-On
                                        </button>
                                        <button className="flex items-center justify-center gap-1.5 rounded-lg border border-[#DDD5C8] bg-white py-2.5 text-[11px] font-semibold text-[#594E46] transition hover:bg-[#FAF6F0]">
                                            <Heart size={13} /> Save Item
                                        </button>
                                        <button className="flex items-center justify-center gap-1.5 rounded-lg border border-[#DDD5C8] bg-white py-2.5 text-[11px] font-semibold text-[#594E46] transition hover:bg-[#FAF6F0]">
                                            <Share2 size={13} /> Share
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
                                    {/* Gated off until booking system exists — see BOOKING_SYSTEM_ENABLED */}
                                    {isHybrid && isRentedNow && (
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
                                                        {product.rentDuration?.split("to")[1]?.trim() ?? "14 June 2026"}
                                                    </p>
                                                </div>
                                            </div>
                                            <button className="w-full rounded-lg border border-[#DDD5C8] bg-white py-2.5 text-[12px] font-semibold text-[#9E2A1B] transition hover:bg-[#FAF6F0]">
                                                Reserve This Item
                                            </button>
                                            <p className="text-center text-[11px] text-[#8C7E74]">Get notified when it's back.</p>
                                        </div>
                                    )}

                                    {/* Availability calendar card */}
                                    <div className="rounded-xl border border-[#EBE3D5] bg-white p-4">
                                        <p className="text-[13px] font-bold text-[#1A130E]">Check Availability</p>
                                        <p className="text-[11px] text-[#8C7E74]">Select rental start date (delivery date)</p>

                                        <div className="mt-3 flex items-center justify-between">
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
                                            {calendarCells.map((cell, idx) => {
                                                const state = placeholderDayState(cell.day, cell.inMonth, selectedDay);
                                                const baseClasses = "flex h-7 w-7 items-center justify-center rounded-full text-[11px] mx-auto transition";
                                                const stateClasses =
                                                    state === "selected"
                                                        ? "bg-[#9E2A1B] text-white font-bold"
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
                                                        disabled={state === "unavailable" || state === "out-of-month"}
                                                        onClick={() => cell.inMonth && setSelectedDay(cell.day)}
                                                        className={`${baseClasses} ${stateClasses}`}
                                                    >
                                                        {cell.day}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] text-[#6E6053]">
                                            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#E8F5EE] border border-[#BFD0B3]" /> Available</span>
                                            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#FDF3D9] border border-[#E9D896]" /> Few left</span>
                                            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#F0EBE3] border border-[#DDD5C8]" /> Unavailable</span>
                                        </div>

                                        <p className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-[#9E2A1B]">
                                            <Truck size={13} /> Delivery as early as Tue, 20 May
                                        </p>
                                    </div>

                                    {/* Price / day card */}
                                    <div className="rounded-xl border border-[#EBE3D5] bg-white p-4 space-y-2.5">
                                        <div className="flex items-baseline gap-1.5">
                                            <p className="text-[22px] font-bold leading-none text-[#9E2A1B]">{dailyRate}</p>
                                            <span className="text-[12px] text-[#8C7E74]">/ day</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[12px]">
                                            <span className="text-[#6E6053]">Minimum Rental</span>
                                            <span className="font-semibold text-[#1A130E]">{rentalDays} days</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[12px]">
                                            <span className="text-[#6E6053]">Security Deposit (Refundable)</span>
                                            <span className="font-semibold text-[#1A130E]">
                        {product.seller ? securityDeposit : securityDeposit}
                      </span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg bg-[#FAF0E6] px-3 py-2 text-[13px]">
                                            <span className="font-semibold text-[#1A130E]">Total ({rentalDays} days)</span>
                                            <span className="font-bold text-[#9E2A1B]">{rentalTotal}</span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[#8C7E74]">
                                            <span>Free cleaning</span>
                                            <span className="text-[#DCD3C4]">•</span>
                                            <span>On-time return</span>
                                            <span className="text-[#DCD3C4]">•</span>
                                            <span>Late fees may apply</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => requireAuth(() => {
                                            // TODO: rent confirmation flow goes here
                                        })}
                                        className="w-full rounded-lg bg-[#1A130E] py-3.5 text-[13px] font-bold text-white transition hover:bg-[#332620]">
                                        Rent Now
                                    </button>

                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => setTryOnOpen(true)}
                                            className="flex items-center justify-center gap-2 rounded-lg border border-[#DDD5C8] bg-white py-2.5 text-[12px] font-semibold text-[#594E46] transition hover:bg-[#FAF6F0]"
                                        >
                                            <Sparkles size={13} className="text-[#9E2A1B]" /> Virtual Try-On
                                        </button>
                                        <button className="flex items-center justify-center gap-2 rounded-lg border border-[#DDD5C8] bg-white py-2.5 text-[12px] font-semibold text-[#594E46] transition hover:bg-[#FAF6F0]">
                                            <Heart size={13} /> Save Item
                                        </button>
                                    </div>

                                    {/* Rental Info card */}
                                    <div className="rounded-xl border border-[#EBE3D5] bg-[#FDFAF6] p-4 space-y-2.5">
                                        <p className="text-[13px] font-bold text-[#1A130E]">Rental Info</p>
                                        {[
                                            { icon: Sparkles, text: "Cleaned before every rental" },
                                            { icon: RotateCcw, text: "Return by end of rental period" },
                                            { icon: AlertTriangle, text: "Damage fees may apply" },
                                            { icon: Info, text: "Please read rental policy" },
                                        ].map(({ icon: Icon, text }) => (
                                            <div key={text} className="flex items-center gap-2.5">
                                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#E6DED1] bg-white">
                                                    <Icon size={13} className="text-[#9E2A1B]" />
                                                </div>
                                                <span className="text-[12px] font-medium text-[#4F4338]">{text}</span>
                                            </div>
                                        ))}
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

                {thriftModalOpen && (
                    <ThriftPurchaseModal product={product} onClose={() => setThriftModalOpen(false)} />
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

    // async function handleGenerate() {
    //     if (!uploadedFile) return;
    //     setStep("processing");
    //     setErrorMessage(null);
    //
    //     try {
    //         const formData = new FormData();
    //         formData.append("personImage", uploadedFile);
    //         formData.append("garmentImageUrl", product.image);
    //         formData.append("garmentDescription", product.name);
    //
    //         const response = await fetch(
    //             `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vton/image`,
    //             {
    //                 method: "POST",
    //                 body: formData,
    //                 credentials: "include",
    //             }
    //         );
    //
    //         if (!response.ok) throw new Error(`Server error: ${response.status}`);
    //
    //         const data = await response.json();
    //         setResultImageUrl(data.imageUrl);
    //         setStep("result");
    //     } catch (err) {
    //         console.error("Try-on failed:", err);
    //         setErrorMessage("Couldn't generate your try-on. Please try again.");
    //         setStep("upload");
    //     }
    // }

    async function handleGenerate() {
        if (!uploadedFile) return;
        setStep("processing");
        setErrorMessage(null);

        try {
            const formData = new FormData();
            formData.append("personImage", uploadedFile);
            formData.append("garmentImageUrl", product.image);
            formData.append("garmentDescription", product.name);

            // Token localStorage bata liyene — tapaiko auth pattern anusar
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
   THRIFT PURCHASE MODAL — unchanged from original
══════════════════════════════════════════════════════════ */
function ThriftPurchaseModal({
                                 product,
                                 onClose,
                             }: {
    product: Product;
    onClose: () => void;
}) {
    // const [added, setAdded] = useState(false);

    const { addToCart,subtotal, cartItems  } = useCart();
    const [added, setAdded] = useState(false);

    // const rawPrice = product.price.replace(/[^0-9.]/g, "");
    // const basePrice = parseFloat(rawPrice) || 0;
    const rawPrice = product.price.replace(/[^0-9]/g, "");
    const basePrice = parseFloat(rawPrice) || 0;
    const serviceFee = Math.round(basePrice * 0.059 * 100) / 100;
    const estimatedTax = Math.round(basePrice * 0.075 * 100) / 100;
    const total = basePrice + serviceFee + estimatedTax;

    console.log("RAW PRICE STRING:", product.price);
    console.log("PARSED:", parseFloat(product.price.replace(/[^0-9.,]/g, "").replace(/,/g, "")));

    const fmt = (n: number) =>
        `Rs. ${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return (
        <div
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-[560px] rounded-2xl border border-[#EBE3D5] bg-[#FCFAF7] shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-full border border-[#EBE3D5] bg-white text-[#6E6053] transition hover:bg-[#F4ECE3]"
                >
                    <X size={15} />
                </button>

                {added ? (
                    <div className="flex flex-col items-center px-8 py-10 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#4A6B3A] bg-[#F0F6ED]">
                            <Check size={30} strokeWidth={2.2} className="text-[#4A6B3A]" />
                        </div>
                        <h2 className="font-serif text-[22px] font-normal tracking-wide text-[#1A130E]">
                            Added to Cart!
                        </h2>
                        <p className="mt-2 max-w-[340px] text-[13px] leading-relaxed text-[#6E6053]">
                            <span className="font-semibold text-[#1A130E]">{product.name}</span> has been
                            successfully added to your cart.
                        </p>

                        <div className="mt-5 w-full rounded-xl border border-[#EBE3D5] bg-white px-5 py-4 text-left">
                            <div className="flex items-center gap-4">
                                <div className="relative h-[64px] w-[52px] shrink-0 overflow-hidden rounded-lg border border-[#EBE3D5] bg-[#F5F0E8]">
                                    <Image src={product.image} alt={product.name} fill className="object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="truncate text-[13px] font-semibold text-[#1A130E]">{product.name}</p>
                                    <p className="text-[11px] text-[#6E6053]">{product.brand} · Size {product.size}</p>
                                    <p className="mt-1 text-[11px] text-[#8C7E74]">Total incl. fees & tax</p>
                                </div>
                                {/*<p className="shrink-0 text-[15px] font-bold text-[#9E2A1B]">{fmt(total)}</p>*/}
                                <p className="shrink-0 text-[15px] font-bold text-[#9E2A1B]">
                                    {`Rs. ${subtotal.toLocaleString("en-IN")}`}
                                </p>
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
                    <>
                        <div className="flex flex-col items-center px-8 pt-7 pb-5 text-center">
                            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-[#EBE3D5] bg-white text-[#9E2A1B]">
                                <ShoppingBag size={20} strokeWidth={1.6} />
                            </div>
                            <h2 className="font-serif text-[22px] font-normal tracking-wide text-[#1A130E]">
                                Confirm Thrift Purchase
                            </h2>
                            <p className="mt-1 text-[13px] text-[#6E6053]">
                                Add this item to your cart to continue to checkout.
                            </p>
                        </div>

                        <div className="mx-6 border-t border-[#EBE3D5]" />

                        {/* Product row */}
                        <div className="mx-6 mt-5 flex gap-4">
                            <div className="relative h-[100px] w-[80px] shrink-0 overflow-hidden rounded-xl border border-[#EBE3D5] bg-[#F5F0E8]">
                                <Image src={product.image} alt={product.name} fill className="object-cover" />
                            </div>
                            <div className="flex flex-1 flex-col justify-center">
                                <h3 className="font-serif text-[15px] font-medium leading-snug text-[#1A130E]">
                                    {product.name}
                                </h3>
                                <p className="mt-0.5 text-[12px] text-[#6E6053]">{product.brand}</p>
                                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px]">
                  <span className="text-[#6E6053]">
                    Condition:{" "}
                      <span className="font-semibold text-[#9E2A1B]">{product.condition}</span>
                  </span>
                                    <span className="text-[#6E6053]">
                    Size:{" "}
                                        <span className="font-semibold text-[#1A130E]">{product.size}</span>
                  </span>
                                </div>
                            </div>
                            <div className="shrink-0 self-center text-right">
                                <p className="text-[11px] text-[#8C7E74]">Item price</p>
                                <p className="text-[17px] font-bold text-[#1A130E]">{product.price}</p>
                            </div>
                        </div>

                        <div className="mx-6 mt-5 border-t border-[#EBE3D5]" />

                        {/* Price breakdown */}
                        <div className="mx-6 mt-4 space-y-2.5">
                            {[
                                { label: "Item Price",    value: fmt(basePrice),    info: false },
                                { label: "Service Fee (5.9%)",   value: fmt(serviceFee),   info: true  },
                                { label: "Estimated Tax (7.5%)", value: fmt(estimatedTax), info: true  },
                            ].map(({ label, value, info }) => (
                                <div key={label} className="flex items-center justify-between text-[13px]">
                                    <div className="flex items-center gap-1 text-[#4F4338]">
                                        {label}
                                        {info && (
                                            <button className="text-[#A89E94] transition hover:text-[#6E6053]">
                                                <Info size={13} strokeWidth={1.8} />
                                            </button>
                                        )}
                                    </div>
                                    <span className="font-medium text-[#4F4338]">{value}</span>
                                </div>
                            ))}
                            <div className="flex items-center justify-between rounded-lg bg-[#FAF0E6] px-3 py-2.5 border-t border-[#EBE3D5]">
                                <span className="text-[14px] font-bold text-[#1A130E]">Total</span>
                                <span className="text-[18px] font-bold text-[#9E2A1B]">{fmt(total)}</span>
                            </div>
                        </div>

                        {/* Trust badge */}
                        <div className="mx-6 mt-4 flex items-start gap-3 rounded-xl border border-[#EBE3D5] bg-[#FAF8F5] px-4 py-3">
                            <ShieldCheck size={17} strokeWidth={1.8} className="mt-0.5 shrink-0 text-[#9E2A1B]" />
                            <div>
                                <p className="text-[12px] font-bold text-[#1A130E]">Authenticated & quality-checked</p>
                                <p className="mt-0.5 text-[11px] leading-snug text-[#6E6053]">
                                    Every item is carefully inspected for quality and authenticity.
                                </p>
                            </div>
                        </div>

                        {/* Buttons — side by side */}
                        <div className="mx-6 mt-4 grid grid-cols-2 gap-2.5 pb-5">
                            <button
                                onClick={() => {
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
                                        note: "Pre-loved item with history and character.",
                                    });
                                    setAdded(true);
                                }}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#9E2A1B] py-3.5 text-[14px] font-bold text-white transition hover:bg-[#832215]"
                            >
                                <ShoppingBag size={15} />
                                Add to Cart
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full rounded-xl border border-[#DDD5C8] bg-white py-3.5 text-[14px] font-semibold text-[#9E2A1B] transition hover:bg-[#FAF6F0]"
                            >
                                Keep Browsing
                            </button>
                        </div>

                        <div className="flex items-center justify-center gap-1.5 pb-4 text-[11px] text-[#8C7E74]">
                            <ShieldCheck size={12} strokeWidth={1.6} className="text-[#A89E94]" />
                            Secure checkout. Your payment information is safe with us.
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}