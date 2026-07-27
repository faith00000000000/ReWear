"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
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

type CategoryFilter = "all" | "thrift" | "rent";
type StatusFilter = "all" | FavoriteAvailability;
type SortOption = "recent" | "price-asc" | "price-desc" | "name";

export default function SavedItemsPage() {
    const { favorites, removeFavorite } = useFavorites();

    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [sortOption, setSortOption] = useState<SortOption>("recent");
    const [pendingRemoval, setPendingRemoval] = useState<FavoriteItem | null>(null);

    const stats = useMemo(
        () => ({
            total: favorites.length,
            thrift: favorites.filter((f) => f.category === "thrift").length,
            rent: favorites.filter((f) => f.category === "rent").length,
            expiring: favorites.filter((f) => f.availability === "Limited Dates").length,
        }),
        [favorites],
    );

    const visibleItems = useMemo(() => {
        let items = favorites;

        if (categoryFilter !== "all") {
            items = items.filter((f) => f.category === categoryFilter);
        }
        if (statusFilter !== "all") {
            items = items.filter((f) => f.availability === statusFilter);
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
    }, [favorites, categoryFilter, statusFilter, search, sortOption]);

    function confirmRemoval() {
        if (!pendingRemoval) return;
        removeFavorite(pendingRemoval.id);
        toast.info("Removed from favourites", { autoClose: 2000 });
        setPendingRemoval(null);
    }

    return (
        <div className="min-h-screen bg-[#FAF6F0] text-[#1A130E] antialiased">
            <main className="mx-auto max-w-[1340px] px-4 pb-24 pt-8 sm:px-6 lg:px-8">

                {/* ── Header ── */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="flex items-center gap-2 font-serif text-[30px] font-normal tracking-tight text-[#1A130E] sm:text-[34px]">
                            Saved Items
                            <Heart size={22} className="fill-[#9E2A1B] text-[#9E2A1B]" />
                        </h1>
                        <p className="mt-1 text-[13px] text-[#6E6053]">
                            Your favourite thrift finds and rental pieces, all in one place.
                        </p>
                    </div>

                    <div className="relative w-full max-w-[280px]">
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
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <StatCard icon={Heart} iconColor="text-[#9E2A1B]" label="Total Saved" value={stats.total} />
                    <StatCard icon={ShoppingBag} iconColor="text-[#9E2A1B]" label="Thrift Items" value={stats.thrift} />
                    <StatCard icon={Shirt} iconColor="text-[#6C5DAC]" label="Rental Items" value={stats.rent} />
                    <StatCard icon={Clock} iconColor="text-[#C9820A]" label="Expiring Soon" value={stats.expiring} labelColor="text-[#C9820A]" />
                </div>

                {/* ── Filters row ── */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Category tabs */}
                        <div className="flex items-center gap-1.5 rounded-full border border-[#EBE3D5] bg-white p-1">
                            {([
                                { id: "all", label: "All Items" },
                                { id: "thrift", label: "Thrift" },
                                { id: "rent", label: "Rent" },
                            ] as { id: CategoryFilter; label: string }[]).map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setCategoryFilter(tab.id)}
                                    className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition ${
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
                        <div className="flex flex-wrap items-center gap-1.5 rounded-full border border-[#EBE3D5] bg-white p-1">
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
                                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition ${
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
                            className="rounded-lg border border-[#EBE3D5] bg-white px-3 py-2 text-[12px] font-semibold text-[#594E46] focus:outline-none"
                        >
                            <option value="recent">Recently Saved</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                            <option value="name">Name: A–Z</option>
                        </select>
                        <button
                            title="More filters"
                            className="flex items-center gap-1.5 rounded-lg border border-[#EBE3D5] bg-white px-3 py-2 text-[12px] font-semibold text-[#594E46] transition hover:bg-[#FAF6F0]"
                        >
                            <SlidersHorizontal size={13} />
                            Filter
                        </button>
                    </div>
                </div>

                {/* ── Grid ── */}
                {visibleItems.length === 0 ? (
                    <div className="mt-16 flex flex-col items-center justify-center rounded-xl border border-dashed border-[#DDD5C8] bg-white py-16 text-center">
                        <Heart size={28} className="mb-3 text-[#DCD3C4]" />
                        <p className="text-[14px] font-semibold text-[#1A130E]">No saved items match these filters</p>
                        <p className="mt-1 max-w-[280px] text-[12px] text-[#8C7E74]">
                            Browse thrift finds and rentals, then tap the heart icon to save pieces here.
                        </p>
                    </div>
                ) : (
                    <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                        {visibleItems.map((item) => {
                            const tag = statusTag(item);
                            return (
                                <article key={item.id} className="rounded-xl border border-[#EBE3D5] bg-white p-2.5">
                                    {/* Image — same aspect ratio as the product detail hero image */}
                                    <div className="relative aspect-[4/3.3] w-full overflow-hidden rounded-lg bg-[#F4ECE3]">
                                        <Link href={`/browse-finds/${item.id}${item.category === "rent" ? "?view=rent" : ""}`}>
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                                                className="object-cover object-top"
                                            />
                                        </Link>

                                        <span className={`absolute left-2 top-2 rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${tag.className}`}>
                                            {tag.label}
                                        </span>

                                        {/* Static filled indicator — this page's items are, by definition, saved */}
                                        <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border border-[#EBE3D5] bg-white shadow-sm">
                                            <Heart size={13} className="fill-[#9E2A1B] text-[#9E2A1B]" />
                                        </span>

                                        <div className="absolute bottom-2 left-2 rounded-md px-2 py-1">
                                            <span className={`block w-fit rounded-full px-2 py-0.5 text-[10px] font-bold ${AVAILABILITY_STYLES[item.availability]}`}>
                                                {/*<span className="mr-1 inline-block h-1.5 w-1.5 rounded-full align-middle ${AVAILABILITY_DOTS[item.availability]}" />*/}
                                                <span className={`mr-1 inline-block h-1.5 w-1.5 rounded-full align-middle ${AVAILABILITY_DOTS[item.availability]}`} />
                                                {item.availability}
                                            </span>
                                            {item.availabilityNote && (
                                                <span className="mt-1 block text-[10px] font-semibold text-white drop-shadow">
                                                    {item.availabilityNote}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="mt-2.5 px-0.5">
                                        {item.brand && <p className="text-[11px] text-[#8C7E74]">{item.brand}</p>}
                                        <Link href={`/browse-finds/${item.id}${item.category === "rent" ? "?view=rent" : ""}`}>
                                            <h3 className="line-clamp-1 text-[14px] font-semibold text-[#1A130E]">{item.name}</h3>
                                        </Link>
                                        <div className="mt-0.5 flex items-center justify-between">
                                            <p className="text-[14px] font-bold text-[#9E2A1B]">{item.price}</p>
                                            <p className="text-[10px] text-[#A6998E]">{savedAgoLabel(item.savedAt)}</p>
                                        </div>
                                    </div>

                                    {/* Actions — View Item + Remove (icon) */}
                                    <div className="mt-2.5 flex items-center gap-2 px-0.5">
                                        <Link
                                            href={`/browse-finds/${item.id}${item.category === "rent" ? "?view=rent" : ""}`}
                                            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#9E2A1B] bg-white py-2 text-[12px] font-bold text-[#9E2A1B] transition hover:bg-[#9E2A1B]/6"
                                        >
                                            <Eye size={13} />
                                            View Item
                                        </Link>
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
                        className="w-full max-w-[380px] rounded-2xl border border-[#EBE3D5] bg-[#FCFAF7] p-6 text-center shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setPendingRemoval(null)}
                            className="absolute right-0 top-0 hidden"
                            aria-hidden
                        />
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#9E2A1B] bg-[#9E2A1B]/8">
                            <AlertTriangle size={22} className="text-[#9E2A1B]" />
                        </div>
                        <h2 className="mt-4 font-serif text-[19px] font-normal text-[#1A130E]">
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
        <div className="flex items-center gap-3 rounded-xl border border-[#EBE3D5] bg-white p-4">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#EBE3D5] bg-[#FAF6F0] ${iconColor}`}>
                <Icon size={16} />
            </div>
            <div>
                <p className={`text-[18px] font-bold leading-none ${labelColor}`}>{value}</p>
                <p className="mt-1 text-[11px] text-[#8C7E74]">{label}</p>
            </div>
        </div>
    );
}