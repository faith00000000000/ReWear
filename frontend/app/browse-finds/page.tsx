"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, ChevronDown, Heart, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState, useCallback } from "react";
import { fetchListings, filterByMode } from "@/lib/api/listings";
import { mapListingsToProducts } from "@/lib/mappers/listingMapper";
import { Product } from "@/lib/types/product";
import { useAuth } from "@/lib/AuthContext";
import { useFavorites, mapAvailability } from "@/lib/FavoritesContext";
import { toast } from "react-toastify";
import {
    buildFilterSections,
    matchesSelectedFilters,
    FilterSectionConfig,
} from "@/lib/filters/productFilters";

const BROWSE_FILTER_SECTION_IDS = [
    "category",
    "gender",
    "brand",
    "size",
    "condition",
    "color",
    "material",
    "occasion",
    "listingMode",
    "availability",
    "delivery",
];

const DEFAULT_OPEN_SECTIONS = ["category", "listingMode"];

const THRIFT_BADGE_CLASS: Record<string, string> = {
    THRIFT: "bg-[#A62612] text-[#FBF7EE]",
    "THRIFT + RENT": "bg-[#A62612] text-[#FBF7EE]",
};

type SortOption = "newest" | "price-low" | "price-high";

export default function BrowseFindsPage() {
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get("q") || "";

    const [thriftProducts, setThriftProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
    const [minPrice, setMinPrice] = useState<string>("");
    const [maxPrice, setMaxPrice] = useState<string>("");
    const [sortBy, setSortBy] = useState<SortOption>("newest");
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    const { authed } = useAuth();

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);
            try {
                const page = await fetchListings({ page: 0, size: 48 });
                const thriftOnly = filterByMode(page.content, "THRIFT");
                if (!cancelled) {
                    setThriftProducts(mapListingsToProducts(thriftOnly));
                }
            } catch {
                if (!cancelled) {
                    setError("Failed to load finds. Please try again.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const filterSections = useMemo(
        () => buildFilterSections(thriftProducts, BROWSE_FILTER_SECTION_IDS),
        [thriftProducts]
    );

    const toggleFilterOption = useCallback((sectionId: string, option: string) => {
        setSelectedFilters((prev) => {
            const current = prev[sectionId] || [];
            const exists = current.includes(option);
            const next = exists
                ? current.filter((item) => item !== option)
                : [...current, option];

            if (next.length === 0) {
                const { [sectionId]: _, ...rest } = prev;
                return rest;
            }

            return { ...prev, [sectionId]: next };
        });
    }, []);

    const clearFilters = useCallback(() => {
        setSelectedFilters({});
        setMinPrice("");
        setMaxPrice("");
    }, []);

    const activeFilterCount = useMemo(() => {
        let count = Object.values(selectedFilters).reduce((acc, arr) => acc + arr.length, 0);
        if (minPrice) count++;
        if (maxPrice) count++;
        return count;
    }, [selectedFilters, minPrice, maxPrice]);

    const parsePriceNumber = (priceStr: string): number => {
        const numeric = priceStr.replace(/[^0-9.]/g, "");
        return parseFloat(numeric) || 0;
    };

    const filteredProducts = useMemo(() => {
        return thriftProducts
            .filter((product) => {
                if (searchQuery) {
                    const q = searchQuery.toLowerCase();
                    const nameMatch = product.name?.toLowerCase().includes(q);
                    const brandMatch = product.brand?.toLowerCase().includes(q);
                    const statusMatch = product.status?.toLowerCase().includes(q);
                    if (!nameMatch && !brandMatch && !statusMatch) return false;
                }

                if (!matchesSelectedFilters(product, selectedFilters)) return false;

                const productPrice = parsePriceNumber(product.price);
                if (minPrice && !isNaN(parseFloat(minPrice))) {
                    if (productPrice < parseFloat(minPrice)) return false;
                }
                if (maxPrice && !isNaN(parseFloat(maxPrice))) {
                    if (productPrice > parseFloat(maxPrice)) return false;
                }

                return true;
            })
            .sort((a, b) => {
                if (sortBy === "price-low") {
                    return parsePriceNumber(a.price) - parsePriceNumber(b.price);
                }
                if (sortBy === "price-high") {
                    return parsePriceNumber(b.price) - parsePriceNumber(a.price);
                }
                return 0;
            });
    }, [thriftProducts, searchQuery, selectedFilters, minPrice, maxPrice, sortBy]);

    return (
        <div className="min-h-screen bg-[#FBF7EE] text-[#1A1A1A]">
            <main>
                {/* Hero Section */}
                <section className="relative overflow-hidden px-4 sm:px-8 pb-12 pt-8 sm:pt-12 lg:px-24">
                    <div className="mx-auto max-w-[1380px]">
                        <div className="grid items-center gap-8 lg:gap-16 lg:grid-cols-[1fr_520px]">
                            <div className="relative z-10 max-w-[620px]">
                                <p className="mb-4 sm:mb-8 text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.35em] text-[#A62612]">
                                    Hand-picked second-hand
                                </p>
                                <h1 className="font-serif leading-[0.88] tracking-[-0.05em] text-[#111111]">
                                    <span className="block text-[52px] sm:text-[90px] lg:text-[108px] font-medium">
                                        The Thrift
                                    </span>
                                    <span className="block text-[48px] sm:text-[82px] lg:text-[96px] font-normal italic text-[#A62612]">
                                        closet
                                    </span>
                                </h1>
                                <p className="mt-6 sm:mt-10 max-w-[520px] text-[15px] sm:text-[18px] leading-[1.8] sm:leading-[1.9] text-[#4D4D4D]">
                                    Eight new arrivals every Friday. Each piece is photographed,
                                    measured, steamed, and marked for thrift, rent, or both before
                                    it goes live.
                                </p>

                                {authed && (
                                    <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-4">
                                        <Link
                                            href="/list-items"
                                            className="flex items-center gap-2 rounded-full bg-[#a73322] px-6 sm:px-7 py-2.5 sm:py-3 text-[14px] sm:text-[15px] font-medium text-white transition-colors hover:bg-[#8a2a1c]"
                                        >
                                            List an Item
                                            <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                                        </Link>
                                    </div>
                                )}
                            </div>

                            <div className="relative hidden lg:block">
                                <div className="relative ml-auto h-[520px] w-full overflow-hidden rounded-2xl">
                                    <Image
                                        src="/images/thrift.png"
                                        alt="Thrift collection"
                                        fill
                                        priority
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Content & Products Section */}
                <section className="px-4 sm:px-8 pb-20 lg:px-24">
                    <div className="mx-auto max-w-[1380px] overflow-hidden rounded-[16px] border border-[#E4DDD3] bg-[#FDFBF7]">

                        {/* Mobile Header Toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E4DDD3] px-4 py-3.5 sm:px-6 lg:hidden">
                            <button
                                onClick={() => setIsMobileFilterOpen(true)}
                                className="inline-flex items-center gap-2 rounded-full border border-[#D7D1CA] bg-white px-4 py-2 text-[12px] font-bold uppercase tracking-wider text-[#1A1A1A]"
                            >
                                <SlidersHorizontal size={14} />
                                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                            </button>

                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#707070]">
                                    Sort:
                                </span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                                    className="bg-transparent text-[13px] font-medium text-[#1A1A1A] outline-none"
                                >
                                    <option value="newest">Newest</option>
                                    <option value="price-low">Price low</option>
                                    <option value="price-high">Price high</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-[250px_1fr]">
                            <div className="hidden lg:block border-r border-[#E4DDD3]">
                                <FilterRail
                                    sections={filterSections}
                                    selectedFilters={selectedFilters}
                                    onToggleOption={toggleFilterOption}
                                    minPrice={minPrice}
                                    maxPrice={maxPrice}
                                    onMinPriceChange={setMinPrice}
                                    onMaxPriceChange={setMaxPrice}
                                    onClear={clearFilters}
                                    activeFilterCount={activeFilterCount}
                                />
                            </div>

                            <div className="min-w-0">
                                <div className="hidden lg:flex items-center justify-between border-b border-[#E4DDD3] px-6 py-4">
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#1A1A1A]">
                                            {loading
                                                ? "Loading…"
                                                : `${filteredProducts.length} ${
                                                    filteredProducts.length === 1 ? "Arrival" : "Arrivals"
                                                } Found`}
                                        </p>
                                        {searchQuery && (
                                            <p className="mt-0.5 text-[12px] text-[#A62612] font-medium">
                                                Results for &ldquo;{searchQuery}&rdquo;
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 rounded-full border border-[#D7D1CA] bg-[#FBF7EE]/95 px-4 py-1.5 shadow-sm">
                                        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#555]">
                                            Sort
                                        </span>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                                            className="appearance-none bg-transparent pr-4 text-[13px] font-medium text-[#1A1A1A] outline-none cursor-pointer"
                                        >
                                            <option value="newest">Newest</option>
                                            <option value="price-low">Price low</option>
                                            <option value="price-high">Price high</option>
                                        </select>
                                        <ChevronDown className="h-3.5 w-3.5 text-[#707070] pointer-events-none -ml-3" />
                                    </div>
                                </div>

                                {searchQuery && (
                                    <div className="px-4 pt-3 lg:hidden">
                                        <span className="inline-block text-[12px] text-[#A62612] font-medium">
                                            Search: &ldquo;{searchQuery}&rdquo;
                                        </span>
                                    </div>
                                )}

                                {loading && (
                                    <div className="p-12 text-center text-[13px] text-[#707070]">
                                        Loading finds…
                                    </div>
                                )}

                                {!loading && error && (
                                    <div className="p-12 text-center text-[13px] text-red-600">{error}</div>
                                )}

                                {!loading && !error && filteredProducts.length === 0 && (
                                    <div className="p-12 text-center text-[13px] text-[#707070]">
                                        No finds matching your search or filters right now.
                                        {activeFilterCount > 0 && (
                                            <button
                                                onClick={clearFilters}
                                                className="block mx-auto mt-3 text-[12px] font-semibold text-[#A62612] underline"
                                            >
                                                Clear all filters
                                            </button>
                                        )}
                                    </div>
                                )}

                                {!loading && !error && filteredProducts.length > 0 && (
                                    <div className="grid gap-x-4 gap-y-6 sm:gap-x-5 sm:gap-y-8 p-4 sm:p-6 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                        {filteredProducts.map((product) => (
                                            <ProductCard
                                                key={product.id}
                                                product={product}
                                                badgeClass={THRIFT_BADGE_CLASS[product.status]}
                                            />
                                        ))}
                                    </div>
                                )}

                                <Pagination />
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Mobile Filter Slide-over Drawer */}
            {isMobileFilterOpen && (
                <div className="fixed inset-0 z-50 flex lg:hidden">
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
                        onClick={() => setIsMobileFilterOpen(false)}
                    />
                    <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-[#FDFBF7] p-5 shadow-2xl">
                        <div className="flex items-center justify-between pb-4 border-b border-[#E4DDD3]">
                            <h2 className="text-[14px] font-bold uppercase tracking-[0.12em] text-[#1A1A1A]">
                                Filters
                            </h2>
                            <button
                                onClick={() => setIsMobileFilterOpen(false)}
                                className="rounded-full p-1 text-[#707070] hover:bg-[#E4DDD3]/50"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            <FilterRail
                                sections={filterSections}
                                selectedFilters={selectedFilters}
                                onToggleOption={toggleFilterOption}
                                minPrice={minPrice}
                                maxPrice={maxPrice}
                                onMinPriceChange={setMinPrice}
                                onMaxPriceChange={setMaxPrice}
                                onClear={clearFilters}
                                activeFilterCount={activeFilterCount}
                            />
                        </div>

                        <div className="pt-4 border-t border-[#E4DDD3]">
                            <button
                                onClick={() => setIsMobileFilterOpen(false)}
                                className="w-full rounded-full bg-[#A62612] py-3 text-[13px] font-bold uppercase tracking-wider text-white"
                            >
                                View Results ({filteredProducts.length})
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

interface FilterRailProps {
    sections: FilterSectionConfig[];
    selectedFilters: Record<string, string[]>;
    onToggleOption: (sectionId: string, option: string) => void;
    minPrice: string;
    maxPrice: string;
    onMinPriceChange: (val: string) => void;
    onMaxPriceChange: (val: string) => void;
    onClear: () => void;
    activeFilterCount: number;
}

function FilterRail({
                        sections,
                        selectedFilters,
                        onToggleOption,
                        minPrice,
                        maxPrice,
                        onMinPriceChange,
                        onMaxPriceChange,
                        onClear,
                        activeFilterCount,
                    }: FilterRailProps) {
    const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = { price: true };
        DEFAULT_OPEN_SECTIONS.forEach((id) => (initial[id] = true));
        return initial;
    });

    const toggleSection = (id: string) => {
        setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <aside className="bg-[#FDFBF7] p-5">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#1A1A1A]">
                    Filters
                </h2>
                {activeFilterCount > 0 && (
                    <button
                        onClick={onClear}
                        className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#A62612] hover:opacity-80 transition"
                    >
                        Clear ({activeFilterCount})
                    </button>
                )}
            </div>

            {sections.map((section) => {
                const isOpen = !!openSections[section.id];
                const activeInGroup = selectedFilters[section.id] || [];

                return (
                    <section key={section.id} className="border-b border-[#E4DDD3] py-4">
                        <button
                            onClick={() => toggleSection(section.id)}
                            className="flex w-full items-center justify-between text-left"
                        >
                            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#1A1A1A]">
                                {section.title}
                                {activeInGroup.length > 0 && (
                                    <span className="ml-1 text-[#A62612]">({activeInGroup.length})</span>
                                )}
                            </span>
                            <ChevronDown
                                className={`h-4 w-4 text-[#707070] transition-transform duration-200 ${
                                    isOpen ? "rotate-180" : ""
                                }`}
                            />
                        </button>
                        {isOpen && (
                            <div className="mt-3 space-y-2.5">
                                {section.options.map((option) => {
                                    const isChecked = activeInGroup.includes(option);
                                    return (
                                        <label
                                            key={option}
                                            className="flex cursor-pointer items-center gap-3 text-[13px] text-[#4D4D4D] hover:text-[#1A1A1A]"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => onToggleOption(section.id, option)}
                                                className="h-4 w-4 accent-[#A62612] rounded border-[#D7D1CA]"
                                            />
                                            {option}
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                );
            })}

            <section className="pt-4">
                <button
                    onClick={() => toggleSection("price")}
                    className="flex w-full items-center justify-between text-left"
                >
                    <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#1A1A1A]">
                        Price Range
                    </span>
                    <ChevronDown
                        className={`h-4 w-4 text-[#707070] transition-transform duration-200 ${
                            openSections.price ? "rotate-180" : ""
                        }`}
                    />
                </button>

                {openSections.price && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                        <label>
                            <span className="mb-1 block text-[9px] font-bold uppercase tracking-[0.12em] text-[#707070]">
                                Min (Rs)
                            </span>
                            <input
                                type="number"
                                value={minPrice}
                                onChange={(e) => onMinPriceChange(e.target.value)}
                                placeholder="0"
                                className="h-8 w-full rounded border border-[#E4DDD3] bg-white px-2 text-[12px] font-medium outline-none focus:border-[#A62612]"
                            />
                        </label>
                        <label>
                            <span className="mb-1 block text-[9px] font-bold uppercase tracking-[0.12em] text-[#707070]">
                                Max (Rs)
                            </span>
                            <input
                                type="number"
                                value={maxPrice}
                                onChange={(e) => onMaxPriceChange(e.target.value)}
                                placeholder="9999+"
                                className="h-8 w-full rounded border border-[#E4DDD3] bg-white px-2 text-[12px] font-medium outline-none focus:border-[#A62612]"
                            />
                        </label>
                    </div>
                )}
            </section>
        </aside>
    );
}

export function ProductCard({
                                product,
                                badgeClass,
                            }: {
    product: Product;
    badgeClass?: string;
}) {
    const { authed } = useAuth();
    const { isFavorite, toggleFavorite } = useFavorites();
    const isFav = authed && isFavorite(String(product.id));

    function handleToggleFavorite(e: React.MouseEvent) {
        e.preventDefault();
        const nowFavorited = toggleFavorite({
            id: String(product.id),
            name: product.name,
            brand: product.brand,
            image: product.image,
            price: product.price,
            status: product.status,
            category: "thrift",
            size: product.size,
            availability: mapAvailability(product.availability),
        });

        toast[nowFavorited ? "success" : "info"](
            nowFavorited ? "Added to favourites" : "Removed from favourites",
            { autoClose: 2000 }
        );
    }

    return (
        <article className="group relative flex flex-col">
            <div className="relative aspect-[0.8/1] w-full overflow-hidden rounded-[8px] bg-[#F5F0E8]">
                <Link href={`/browse-finds/${product.id}?view=thrift`} className="block h-full w-full">
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(min-width:1280px) 25vw, (min-width:1024px) 33vw, 50vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </Link>

                {badgeClass && (
                    <span
                        className={`absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}
                    >
                        {product.status}
                    </span>
                )}

                <button
                    onClick={handleToggleFavorite}
                    aria-label="Toggle favourite"
                    className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-xs text-[#1A1A1A] transition hover:bg-white"
                >
                    <Heart
                        className={`h-4 w-4 ${isFav ? "fill-[#A62612] text-[#A62612]" : ""}`}
                    />
                </button>
            </div>

            <div className="mt-3 flex flex-col gap-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">
                    {product.brand}
                </p>
                <Link
                    href={`/browse-finds/${product.id}?view=thrift`}
                    className="line-clamp-1 text-[14px] font-medium text-[#1A1A1A] hover:underline"
                >
                    {product.name}
                </Link>
                <p className="text-[13px] font-semibold text-[#1A1A1A]">{product.price}</p>
            </div>
        </article>
    );
}

function Pagination() {
    return (
        <div className="flex items-center justify-center gap-2 border-t border-[#E4DDD3] py-6">
            <span className="text-[12px] font-medium text-[#707070]">
                Showing loaded page finds
            </span>
        </div>
    );
}