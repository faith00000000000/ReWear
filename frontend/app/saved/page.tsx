"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    AlertTriangle,
    Clock,
    Eye,
    Heart,
    Search,
    Shirt,
    ShoppingBag,
    SlidersHorizontal,
    Trash2,
    X,
} from "lucide-react";
import { useFavorites, FavoriteItem, FavoriteAvailability } from "@/lib/FavoritesContext";
import { fetchListingById } from "@/lib/api/listings";
import { ListingResponseDTO } from "@/lib/types/listing";
import { toast } from "react-toastify";

/* ─── Status tag styling — mirrors getContextTag() on the product page ── */
function statusTag(item: FavoriteItem) {
    if (item.status === "THRIFT + RENT") {
        return {
            label: "THRIFT + RENT",
            className: item.category === "thrift" ? "bg-[#9E2A1B] text-white" : "bg-[#5C5C5C] text-white",
        };
    }
    if (item.status === "THRIFT") {
        return { label: "THRIFT", className: "bg-[#1A130E] text-white" };
    }
    return { label: "RENT", className: "bg-[#3D5C30] text-white" };
}

/* ─── Availability badge styling ─────────────────────────── */
const AVAILABILITY_STYLES: Record<FavoriteAvailability, string> = {
    Available: "bg-[#E8F5EE] text-[#2E7D52]",
    "Limited Dates": "bg-[#FDF3D9] text-[#92740E]",
    Unavailable: "bg-[#FBEAEA] text-[#9E2A1B]",
    Sold: "bg-[#F0EBE3] text-[#8C7E74]",
};

const AVAILABILITY_DOTS: Record<FavoriteAvailability, string> = {
    Available: "bg-[#2E7D52]",
    "Limited Dates": "bg-[#92740E]",
    Unavailable: "bg-[#9E2A1B]",
    Sold: "bg-[#8C7E74]",
};

/* ─── Relative "Saved X ago" label ───────────────────────── */
function savedAgoLabel(timestamp: number) {
    const diffMs = Date.now() - timestamp;
    const days = Math.floor(diffMs / 86_400_000);
    if (days <= 0) return "Saved today";
    if (days === 1) return "Saved 1 day ago";
    if (days < 7) return `Saved ${days} days ago`;
    const weeks = Math.floor(days / 7);
    if (weeks === 1) return "Saved 1 week ago";
    return `Saved ${weeks} weeks ago`;
}

/* ─── Extract a sortable number out of a formatted price string ── */
function parsePrice(price: string) {
    const match = price.replace(/,/g, "").match(/\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : 0;
}

/* ─── Map backend availability -> FavoriteAvailability ──── */
function mapDtoAvailability(v: ListingResponseDTO["availability"]): FavoriteAvailability {
    if (v === "RESERVED") return "Limited Dates";
    if (v === "SOLD_OUT") return "Sold";
    return "Available";
}

/**
 * A listing counts as "gone" if:
 * - the fetch throws (404 / network error / any rejection), OR
 * - it resolves but the payload is empty/falsy, OR
 * - the DTO carries a soft-delete signal some backends use
 *   (deletedAt, isDeleted, or a status/availability of "DELETED").
 * Adjust this if your API uses a different shape.
 */
function looksDeleted(dto: unknown): boolean {
    if (!dto) return true;
    const d = dto as Record<string, unknown>;
    if (d.deletedAt) return true;
    if (d.isDeleted === true) return true;
    if (typeof d.status === "string" && d.status.toUpperCase() === "DELETED") return true;
    if (typeof d.availability === "string" && d.availability.toUpperCase() === "DELETED") return true;
    return false;
}

type CategoryFilter = "all" | "thrift" | "rent";
type StatusFilter = "all" | FavoriteAvailability;
type SortOption = "recent" | "price-asc" | "price-desc" | "name";
type LiveCheckStatus = "checking" | "confirmed" | "deleted";

export default function SavedItemsPage() {
    const { favorites, removeFavorite } = useFavorites();

    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [sortOption, setSortOption] = useState<SortOption>("recent");
    const [pendingRemoval, setPendingRemoval] = useState<FavoriteItem | null>(null);

    // ── Live validation against the backend ──
    const [liveChecks, setLiveChecks] = useState<Record<string, LiveCheckStatus>>({});
    const [liveAvailability, setLiveAvailability] = useState<Record<string, FavoriteAvailability>>({});
    const checkedIdsRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        let cancelled = false;

        favorites.forEach((item) => {
            const id = String(item.id);
            if (checkedIdsRef.current.has(id)) return;
            checkedIdsRef.current.add(id);

            setLiveChecks((prev) => ({ ...prev, [id]: "checking" }));

            fetchListingById(id)
                .then((dto) => {
                    if (cancelled) return;
                    if (looksDeleted(dto)) {
                        setLiveChecks((prev) => ({ ...prev, [id]: "deleted" }));
                        return;
                    }
                    setLiveAvailability((prev) => ({ ...prev, [id]: mapDtoAvailability(dto.availability) }));
                    setLiveChecks((prev) => ({ ...prev, [id]: "confirmed" }));
                })
                .catch((err) => {
                    // 404 / listing gone / any request failure -> treat as deleted.
                    if (cancelled) return;
                    setLiveChecks((prev) => ({ ...prev, [id]: "deleted" }));
                });
        });

        return () => {
            cancelled = true;
        };
    }, [favorites]);

    function getEffectiveAvailability(item: FavoriteItem): FavoriteAvailability {
        const id = String(item.id);
        if (liveChecks[id] === "deleted") return "Unavailable";
        return liveAvailability[id] ?? item.availability;
    }

    function isDeleted(item: FavoriteItem) {
        return liveChecks[String(item.id)] === "deleted";
    }

    function isChecking(item: FavoriteItem) {
        return liveChecks[String(item.id)] === "checking" || liveChecks[String(item.id)] === undefined;
    }

    const stats = useMemo(
        () => ({
            total: favorites.length,
            thrift: favorites.filter((f) => f.category === "thrift").length,
            rent: favorites.filter((f) => f.category === "rent").length,
            expiring: favorites.filter((f) => getEffectiveAvailability(f) === "Limited Dates").length,
        }),
        [favorites, liveChecks, liveAvailability],
    );

    const visibleItems = useMemo(() => {
        let items = favorites;

        if (categoryFilter !== "all") {
            items = items.filter((f) => f.category === categoryFilter);
        }
        if (statusFilter !== "all") {
            items = items.filter((f) => getEffectiveAvailability(f) === statusFilter);
        }
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            items = items.filter(
                (f) => f.name.toLowerCase().includes(q) || (f.brand ?? "").toLowerCase().includes(q),
            );
        }

        const sorted = [...items];
        switch (sortOption) {
            case "price-asc":
                sorted.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
                break;
            case "price-desc":
                sorted.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
                break;
            case "name":
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            default:
                sorted.sort((a, b) => b.savedAt - a.savedAt);
        }
        return sorted;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [favorites, categoryFilter, statusFilter, search, sortOption, liveChecks, liveAvailability]);

    function confirmRemoval() {
        if (!pendingRemoval) return;
        removeFavorite(pendingRemoval.id);
        toast.info("Removed from favourites", { autoClose: 2000 });
        setPendingRemoval(null);
    }

    return (
        <div className="min-h-screen bg-[#FAF6F0] text-[#1A130E] antialiased">
            <main className="mx-auto max-w-[1340px] px-4 pb-24 pt-6 sm:px-6 sm:pt-8 lg:px-8">

                {/* ── Header ── */}
                <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 font-serif text-[24px] font-normal tracking-tight text-[#1A130E] sm:text-[30px] lg:text-[34px]">
                            Saved Items
                            <Heart size={20} className="fill-[#9E2A1B] text-[#9E2A1B] sm:hidden" />
                            <Heart size={22} className="hidden fill-[#9E2A1B] text-[#9E2A1B] sm:block" />
                        </h1>
                        <p className="mt-1 text-[13px] text-[#6E6053]">
                            Your favourite thrift finds and rental pieces, all in one place.
                        </p>
                    </div>

                    <div className="relative w-full sm:max-w-[280px]">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A6998E]" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search saved items…"
                            className="w-full rounded-lg border border-[#EBE3D5] bg-white py-2.5 pl-9 pr-3 text-[13px] text-[#1A130E] focus:outline-none focus:border-[#9E2A1B] focus:ring-2 focus:ring-[#9E2A1B]/10"
                        />
                    </div>
                </div>

                {/* ── Stat cards ── */}
                <div className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-6 sm:gap-3 sm:grid-cols-4">
                    <StatCard icon={Heart} iconColor="text-[#9E2A1B]" label="Total Saved" value={stats.total} />
                    <StatCard icon={ShoppingBag} iconColor="text-[#9E2A1B]" label="Thrift Items" value={stats.thrift} />
                    <StatCard icon={Shirt} iconColor="text-[#6C5DAC]" label="Rental Items" value={stats.rent} />
                    <StatCard icon={Clock} iconColor="text-[#C9820A]" label="Expiring Soon" value={stats.expiring} labelColor="text-[#C9820A]" />
                </div>

                {/* ── Filters row ── */}
                <div className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                        {/* Category tabs */}
                        <div className="flex shrink-0 items-center gap-1.5 overflow-x-auto rounded-full border border-[#EBE3D5] bg-white p-1 sm:overflow-visible">
                            {([
                                { id: "all", label: "All Items" },
                                { id: "thrift", label: "Thrift" },
                                { id: "rent", label: "Rent" },
                            ] as { id: CategoryFilter; label: string }[]).map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setCategoryFilter(tab.id)}
                                    className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition ${
                                        categoryFilter === tab.id
                                            ? "bg-[#9E2A1B] text-white"
                                            : "text-[#6E6053] hover:bg-[#FAF6F0]"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Status chips */}
                        <div className="flex shrink-0 items-center gap-1.5 overflow-x-auto rounded-full border border-[#EBE3D5] bg-white p-1 sm:flex-wrap sm:overflow-visible">
                            {([
                                { id: "all", label: "All Status", dot: null },
                                { id: "Available", label: "Available", dot: "bg-[#2E7D52]" },
                                { id: "Limited Dates", label: "Limited Dates", dot: "bg-[#92740E]" },
                                { id: "Unavailable", label: "Unavailable", dot: "bg-[#9E2A1B]" },
                                { id: "Sold", label: "Sold", dot: "bg-[#8C7E74]" },
                            ] as { id: StatusFilter; label: string; dot: string | null }[]).map((chip) => (
                                <button
                                    key={chip.id}
                                    onClick={() => setStatusFilter(chip.id)}
                                    className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] font-semibold transition ${
                                        statusFilter === chip.id
                                            ? "bg-[#FAF0E6] text-[#9E2A1B]"
                                            : "text-[#6E6053] hover:bg-[#FAF6F0]"
                                    }`}
                                >
                                    {chip.dot && <span className={`h-1.5 w-1.5 rounded-full ${chip.dot}`} />}
                                    {chip.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value as SortOption)}
                            className="flex-1 rounded-lg border border-[#EBE3D5] bg-white px-3 py-2 text-[12px] font-semibold text-[#594E46] focus:outline-none sm:flex-none"
                        >
                            <option value="recent">Recently Saved</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                            <option value="name">Name: A–Z</option>
                        </select>
                        <button
                            title="More filters"
                            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#EBE3D5] bg-white px-3 py-2 text-[12px] font-semibold text-[#594E46] transition hover:bg-[#FAF6F0]"
                        >
                            <SlidersHorizontal size={13} />
                            <span className="hidden xs:inline">Filter</span>
                        </button>
                    </div>
                </div>

                {/* ── Grid — 4-up, borderless cards ── */}
                {visibleItems.length === 0 ? (
                    <div className="mt-12 flex flex-col items-center justify-center rounded-xl border border-dashed border-[#DDD5C8] bg-white px-4 py-14 text-center sm:mt-16 sm:py-16">
                        <Heart size={28} className="mb-3 text-[#DCD3C4]" />
                        <p className="text-[14px] font-semibold text-[#1A130E]">No saved items match these filters</p>
                        <p className="mt-1 max-w-[280px] text-[12px] text-[#8C7E74]">
                            Browse thrift finds and rentals, then tap the heart icon to save pieces here.
                        </p>
                    </div>
                ) : (
                    <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-7 sm:mt-6 sm:grid-cols-3 sm:gap-y-9 lg:grid-cols-4">
                        {visibleItems.map((item) => {
                            const tag = statusTag(item);
                            const effectiveAvailability = getEffectiveAvailability(item);
                            const deleted = isDeleted(item);
                            const checking = isChecking(item);
                            const displayNote = deleted ? "This item was removed by the seller" : item.availabilityNote;
                            const href = `/browse-finds/${item.id}${item.category === "rent" ? "?view=rent" : ""}`;

                            return (
                                <article key={item.id} className="group flex flex-col">
                                    {/* Image — no card border/background, matches ProductCard styling */}
                                    <div className="relative aspect-[0.8/1] w-full overflow-hidden rounded-[8px] bg-[#F4ECE3]">
                                        <Link
                                            href={deleted ? "#" : href}
                                            onClick={(e) => {
                                                if (deleted) e.preventDefault();
                                            }}
                                            aria-disabled={deleted}
                                            className="block h-full w-full"
                                        >
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                sizes="(min-width:1280px) 25vw, (min-width:1024px) 33vw, 50vw"
                                                className={`object-cover object-top transition-transform duration-300 ${
                                                    deleted ? "grayscale opacity-60" : "group-hover:scale-105"
                                                }`}
                                            />
                                        </Link>

                                        {deleted && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/35 px-3 text-center">
                                                <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#9E2A1B] sm:text-[11px]">
                                                    No Longer Available
                                                </span>
                                            </div>
                                        )}

                                        <span className={`absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${tag.className}`}>
                                            {tag.label}
                                        </span>

                                        <span className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-xs">
                                            <Heart size={16} className="fill-[#9E2A1B] text-[#9E2A1B]" />
                                        </span>

                                        <div className="absolute bottom-2.5 left-2.5">
                                            <span
                                                className={`block w-fit rounded-full px-2 py-0.5 text-[10px] font-bold ${AVAILABILITY_STYLES[effectiveAvailability]} ${
                                                    checking ? "animate-pulse" : ""
                                                }`}
                                            >
                                                <span className={`mr-1 inline-block h-1.5 w-1.5 rounded-full align-middle ${AVAILABILITY_DOTS[effectiveAvailability]}`} />
                                                {effectiveAvailability}
                                            </span>
                                            {displayNote && (
                                                <span className="mt-1 block text-[10px] font-semibold text-white drop-shadow">
                                                    {displayNote}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Info — plain text, no bounding box */}
                                    <div className="mt-3 flex flex-col gap-1">
                                        {item.brand && (
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">
                                                {item.brand}
                                            </p>
                                        )}
                                        <Link
                                            href={deleted ? "#" : href}
                                            onClick={(e) => {
                                                if (deleted) e.preventDefault();
                                            }}
                                            className="line-clamp-1 text-[14px] font-medium text-[#1A130E] hover:underline"
                                        >
                                            {item.name}
                                        </Link>
                                        <div className="flex items-center justify-between gap-2">
                                            <p className={`text-[13px] font-semibold ${deleted ? "text-[#A6998E] line-through" : "text-[#1A130E]"}`}>
                                                {item.price}
                                            </p>
                                            <p className="shrink-0 text-[10px] text-[#A6998E]">{savedAgoLabel(item.savedAt)}</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-2.5 flex items-center gap-2">
                                        {deleted ? (
                                            <button
                                                disabled
                                                className="flex flex-1 cursor-not-allowed items-center justify-center gap-1.5 rounded-lg border border-[#DDD5C8] bg-[#F4ECE3] py-2 text-[12px] font-bold text-[#A6998E]"
                                            >
                                                <Eye size={13} />
                                                Unavailable
                                            </button>
                                        ) : (
                                            <Link
                                                href={href}
                                                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#9E2A1B] bg-white py-2 text-[12px] font-bold text-[#9E2A1B] transition hover:bg-[#9E2A1B]/6"
                                            >
                                                <Eye size={13} />
                                                View Item
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => setPendingRemoval(item)}
                                            aria-label="Remove from saved items"
                                            className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg bg-[#9E2A1B] text-white transition hover:bg-[#832215]"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* ── Remove confirmation modal ── */}
            {pendingRemoval && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                    onClick={() => setPendingRemoval(null)}
                >
                    <div
                        className="relative w-full max-w-[380px] rounded-2xl border border-[#EBE3D5] bg-[#FCFAF7] p-5 text-center shadow-2xl sm:p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setPendingRemoval(null)}
                            className="absolute right-3 top-3 text-[#A6998E] hover:text-[#6E6053]"
                            aria-label="Close"
                        >
                            <X size={16} />
                        </button>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#9E2A1B] bg-[#9E2A1B]/8">
                            <AlertTriangle size={22} className="text-[#9E2A1B]" />
                        </div>
                        <h2 className="mt-4 font-serif text-[18px] font-normal text-[#1A130E] sm:text-[19px]">
                            Remove from Favourites?
                        </h2>
                        <p className="mt-2 text-[13px] leading-relaxed text-[#6E6053]">
                            Do you really want to remove{" "}
                            <span className="font-semibold text-[#1A130E]">{pendingRemoval.name}</span> from your
                            saved items?
                        </p>

                        <div className="mt-5 grid grid-cols-2 gap-2.5">
                            <button
                                onClick={() => setPendingRemoval(null)}
                                className="rounded-lg border border-[#DDD5C8] bg-white py-2.5 text-[13px] font-semibold text-[#594E46] transition hover:bg-[#FAF6F0]"
                            >
                                No, Keep it
                            </button>
                            <button
                                onClick={confirmRemoval}
                                className="rounded-lg bg-[#9E2A1B] py-2.5 text-[13px] font-bold text-white transition hover:bg-[#832215]"
                            >
                                Yes, Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── Small stat card ─────────────────────────────────────── */
function StatCard({
                      icon: Icon,
                      iconColor,
                      label,
                      value,
                      labelColor = "text-[#1A130E]",
                  }: {
    icon: typeof Heart;
    iconColor: string;
    label: string;
    value: number;
    labelColor?: string;
}) {
    return (
        <div className="flex items-center gap-2.5 rounded-xl border border-[#EBE3D5] bg-white p-3 sm:gap-3 sm:p-4">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#EBE3D5] bg-[#FAF6F0] sm:h-9 sm:w-9 ${iconColor}`}>
                <Icon size={15} className="sm:hidden" />
                <Icon size={16} className="hidden sm:block" />
            </div>
            <div className="min-w-0">
                <p className={`text-[16px] font-bold leading-none sm:text-[18px] ${labelColor}`}>{value}</p>
                <p className="mt-1 truncate text-[10px] text-[#8C7E74] sm:text-[11px]">{label}</p>
            </div>
        </div>
    );
}