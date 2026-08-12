"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo, useCallback } from "react";
import {
  ArrowRight,
  ChevronDown,
  Heart,
  Truck,
  ShoppingBag,
  Calendar,
  Sparkles,
  SlidersHorizontal,
  X,
} from "lucide-react";
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

const RENT_BADGE_CLASS: Record<string, string> = {
  RENT: "bg-[#3D5C30] text-white",
  "THRIFT + RENT": "bg-[#5C5C5C] text-white",
};

const RENT_FILTER_SECTION_IDS = [
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

const DEFAULT_OPEN_SECTIONS = ["category", "brand", "size"];

type SortOption = "recommended" | "newest" | "price-low" | "price-high";

export default function RentPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  const [rentProducts, setRentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("recommended");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const { authed } = useAuth();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const page = await fetchListings({ page: 0, size: 48 });
        const rentOnly = filterByMode(page.content, "RENT");
        if (!cancelled) {
          setRentProducts(mapListingsToProducts(rentOnly));
        }
      } catch {
        if (!cancelled) {
          setError("Failed to load rentals. Please try again.");
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
      () => buildFilterSections(rentProducts, RENT_FILTER_SECTION_IDS),
      [rentProducts]
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
    return rentProducts
        .filter((product) => {
          if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const nameMatch = product.name?.toLowerCase().includes(q);
            const brandMatch = product.brand?.toLowerCase().includes(q);
            const statusMatch = product.status?.toLowerCase().includes(q);
            if (!nameMatch && !brandMatch && !statusMatch) return false;
          }

          if (!matchesSelectedFilters(product, selectedFilters)) return false;

          const effectivePrice = parsePriceNumber(product.rentalPrice || product.price);
          if (minPrice && !isNaN(parseFloat(minPrice))) {
            if (effectivePrice < parseFloat(minPrice)) return false;
          }
          if (maxPrice && !isNaN(parseFloat(maxPrice))) {
            if (effectivePrice > parseFloat(maxPrice)) return false;
          }

          return true;
        })
        .sort((a, b) => {
          const priceA = parsePriceNumber(a.rentalPrice || a.price);
          const priceB = parsePriceNumber(b.rentalPrice || b.price);

          if (sortBy === "price-low") return priceA - priceB;
          if (sortBy === "price-high") return priceB - priceA;
          return 0;
        });
  }, [rentProducts, searchQuery, selectedFilters, minPrice, maxPrice, sortBy]);

  return (
      <div className="min-h-screen bg-[#FAF6F0] text-[#1A130E]">
        <main>
          {/* HERO SECTION */}
          <section className="relative overflow-hidden px-4 sm:px-8 pb-12 pt-8 sm:pt-12 lg:px-24">
            <div className="mx-auto max-w-[1380px]">
              <div className="grid items-center gap-8 lg:gap-16 lg:grid-cols-[1fr_520px]">
                <div className="relative z-10 max-w-[620px]">
                  <p className="mb-4 sm:mb-6 text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.35em] text-[#9E2A1B]">
                    RENT. WEAR. RETURN.
                  </p>
                  <h1 className="font-serif leading-[0.95] tracking-[-0.04em] text-[#1A130E]">
                  <span className="block text-[48px] sm:text-[80px] lg:text-[96px] font-medium">
                    Rent the look,
                  </span>
                    <span className="block text-[44px] sm:text-[76px] lg:text-[88px] font-normal italic text-[#9E2A1B] mt-1 sm:mt-2">
                    own the moment.
                  </span>
                  </h1>
                  <p className="mt-6 sm:mt-8 max-w-[480px] text-[15px] sm:text-[16px] leading-[1.8] text-[#6E6053]">
                    Designer pieces, occasion-ready picks, and everyday elevated
                    styles—rent for less, love more.
                  </p>

                  {authed && (
                      <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-4">
                        <Link
                            href="/list-items"
                            className="flex items-center gap-2 rounded-full bg-[#9E2A1B] px-6 sm:px-7 py-2.5 sm:py-3 text-[14px] sm:text-[15px] font-medium text-white transition-colors hover:bg-[#832215]"
                        >
                          List an Item
                          <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                        </Link>
                      </div>
                  )}
                </div>

                <div className="relative hidden lg:block">
                  <div className="relative ml-auto h-[480px] w-full overflow-hidden rounded-[4px]">
                    <Image
                        src="/images/rent.png"
                        alt="Rent collection banner"
                        fill
                        priority
                        className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* MAIN PRODUCT EXPLORER SECTION */}
          <section className="px-4 sm:px-8 pb-20 lg:px-24">
            <div className="mx-auto max-w-[1380px] overflow-hidden rounded-[16px] border border-[#EBE3D5] bg-[#FDFAF7]">
              {/* Mobile Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EBE3D5] px-4 py-3.5 sm:px-6 lg:hidden">
                <button
                    onClick={() => setIsMobileFilterOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-[#EBE3D5] bg-white px-4 py-2 text-[12px] font-bold uppercase tracking-wider text-[#1A130E]"
                >
                  <SlidersHorizontal size={14} />
                  Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                </button>

                <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8C7E74]">
                  Sort:
                </span>
                  <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="bg-transparent text-[13px] font-medium text-[#1A130E] outline-none"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="newest">Newest</option>
                    <option value="price-low">Price low</option>
                    <option value="price-high">Price high</option>
                  </select>
                </div>
              </div>

              <div className="grid lg:grid-cols-[250px_1fr]">
                {/* Desktop Filter Sidebar */}
                <div className="hidden lg:block border-r border-[#EBE3D5]">
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

                {/* Product Listing Section */}
                <div className="min-w-0">
                  <div className="hidden lg:flex items-center justify-between border-b border-[#EBE3D5] px-6 py-5">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#1A130E]">
                        {loading
                            ? "Loading…"
                            : `${filteredProducts.length} ${
                                filteredProducts.length === 1 ? "RENTAL PIECE" : "RENTAL PIECES"
                            }`}
                      </p>
                      {searchQuery && (
                          <p className="mt-0.5 text-[12px] text-[#9E2A1B] font-medium">
                            Results for &ldquo;{searchQuery}&rdquo;
                          </p>
                      )}
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-[11px] font-medium tracking-wide text-[#8C7E74]">
                        <Truck size={14} strokeWidth={2} className="text-[#8C7E74]" />
                        <span>Free delivery &amp; return on all rentals</span>
                      </div>

                      <div className="flex items-center gap-2 rounded-full border border-[#EBE3D5] bg-[#FAF6F0]/95 px-4 py-1.5 shadow-sm">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6E6053]">
                        SORT
                      </span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="appearance-none bg-transparent pr-4 text-[13px] font-medium text-[#1A130E] outline-none cursor-pointer"
                        >
                          <option value="recommended">Recommended</option>
                          <option value="newest">Newest</option>
                          <option value="price-low">Price low</option>
                          <option value="price-high">Price high</option>
                        </select>
                        <ChevronDown className="h-4 w-4 text-[#8C7E74] pointer-events-none -ml-3" />
                      </div>
                    </div>
                  </div>

                  {searchQuery && (
                      <div className="px-4 pt-3 lg:hidden">
                    <span className="inline-block text-[12px] text-[#9E2A1B] font-medium">
                      Search: &ldquo;{searchQuery}&rdquo;
                    </span>
                      </div>
                  )}

                  {loading && (
                      <div className="p-12 text-center text-[13px] text-[#8C7E74]">
                        Loading rentals…
                      </div>
                  )}

                  {!loading && error && (
                      <div className="p-12 text-center text-[13px] text-[#9E2A1B]">{error}</div>
                  )}

                  {!loading && !error && filteredProducts.length === 0 && (
                      <div className="p-12 text-center text-[13px] text-[#8C7E74]">
                        No rentals matching your search or filters right now.
                        {activeFilterCount > 0 && (
                            <button
                                onClick={clearFilters}
                                className="block mx-auto mt-3 text-[12px] font-semibold text-[#9E2A1B] underline"
                            >
                              Clear all filters
                            </button>
                        )}
                      </div>
                  )}

                  {!loading && !error && filteredProducts.length > 0 && (
                      <div className="grid gap-x-4 gap-y-6 sm:gap-x-5 sm:gap-y-8 p-4 sm:p-6 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredProducts.map((product) => (
                            <RentalCard
                                key={product.id}
                                product={product}
                                badgeClass={RENT_BADGE_CLASS[product.status] || "bg-[#3D5C30] text-white"}
                            />
                        ))}
                      </div>
                  )}

                  <Pagination />

                  {/* Selling Points Grid */}
                  <section className="px-4 sm:px-6 pb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-[#EBE3D5] pt-8">
                      {[
                        { title: "Premium Pieces", desc: "Curated designer & contemporary styles", icon: ShoppingBag },
                        { title: "Flexible Rentals", desc: "4, 8, 14 or 30-day rental periods", icon: Calendar },
                        { title: "Free Delivery & Returns", desc: "Contactless delivery & easy returns", icon: Truck },
                        { title: "Cleaned & Checked", desc: "Professionally cleaned & quality-checked", icon: Sparkles },
                      ].map((prop, index) => {
                        const IconComponent = prop.icon;
                        return (
                            <div
                                key={index}
                                className="flex items-start gap-4 p-4 rounded-xl bg-[#FDFAF7] border border-[#EBE3D5]/60 shadow-sm/5"
                            >
                              <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-[#F5EFE5] text-[#1A130E]">
                                <IconComponent size={18} strokeWidth={1.75} className="text-[#9E2A1B]" />
                              </div>
                              <div>
                                <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#1A130E]">
                                  {prop.title}
                                </h4>
                                <p className="text-[12px] text-[#8C7E74] mt-1 leading-normal">
                                  {prop.desc}
                                </p>
                              </div>
                            </div>
                        );
                      })}
                    </div>
                  </section>
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
              <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-[#FDFAF7] p-5 shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-[#EBE3D5]">
                  <h2 className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#1A130E]">
                    Rent Filters
                  </h2>
                  <button
                      onClick={() => setIsMobileFilterOpen(false)}
                      className="rounded-full p-1 text-[#8C7E74] hover:bg-[#EBE3D5]/50"
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

                <div className="pt-4 border-t border-[#EBE3D5]">
                  <button
                      onClick={() => setIsMobileFilterOpen(false)}
                      className="w-full rounded-full bg-[#9E2A1B] py-3 text-[13px] font-bold uppercase tracking-wider text-white"
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
      <aside className="bg-[#FDFAF7] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#1A130E]">
            Rent Filters
          </h2>
          {activeFilterCount > 0 && (
              <button
                  onClick={onClear}
                  className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9E2A1B] hover:opacity-80 transition"
              >
                Clear ({activeFilterCount})
              </button>
          )}
        </div>

        {sections.map((section) => {
          const isOpen = !!openSections[section.id];
          const activeInGroup = selectedFilters[section.id] || [];

          return (
              <section key={section.id} className="border-b border-[#EBE3D5] py-4">
                <button
                    onClick={() => toggleSection(section.id)}
                    className="flex w-full items-center justify-between text-left"
                >
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#1A130E]">
                {section.title}
                {activeInGroup.length > 0 && (
                    <span className="ml-1 text-[#9E2A1B]">({activeInGroup.length})</span>
                )}
              </span>
                  <ChevronDown
                      className={`h-4 w-4 text-[#8C7E74] transition-transform duration-200 ${
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
                                className="flex cursor-pointer items-center gap-3 text-[13px] text-[#4F4338] hover:text-[#1A130E]"
                            >
                              <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => onToggleOption(section.id, option)}
                                  className="h-4 w-4 accent-[#9E2A1B] rounded border-[#EBE3D5]"
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

        {/* Price Range Section */}
        <section className="pt-4">
          <button
              onClick={() => toggleSection("price")}
              className="flex w-full items-center justify-between text-left"
          >
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#1A130E]">
            Price Range
          </span>
            <ChevronDown
                className={`h-4 w-4 text-[#8C7E74] transition-transform duration-200 ${
                    openSections.price ? "rotate-180" : ""
                }`}
            />
          </button>

          {openSections.price && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <label>
              <span className="mb-1 block text-[9px] font-bold uppercase tracking-[0.12em] text-[#8C7E74]">
                Min (Rs)
              </span>
                  <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => onMinPriceChange(e.target.value)}
                      placeholder="0"
                      className="h-8 w-full rounded border border-[#EBE3D5] bg-white px-2 text-[12px] font-medium outline-none focus:border-[#9E2A1B]"
                  />
                </label>
                <label>
              <span className="mb-1 block text-[9px] font-bold uppercase tracking-[0.12em] text-[#8C7E74]">
                Max (Rs)
              </span>
                  <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => onMaxPriceChange(e.target.value)}
                      placeholder="9999+"
                      className="h-8 w-full rounded border border-[#EBE3D5] bg-white px-2 text-[12px] font-medium outline-none focus:border-[#9E2A1B]"
                  />
                </label>
              </div>
          )}
        </section>
      </aside>
  );
}

function RentalCard({
                      product,
                      badgeClass,
                    }: {
  product: Product;
  badgeClass: string;
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
      price: `${product.rentalPrice ?? product.price} / day`,
      status: product.status,
      category: "rent",
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
        <div className="relative aspect-[0.78/1] w-full overflow-hidden rounded-[8px] bg-[#F5EFE5]">
          <Link href={`/browse-finds/${product.id}?view=rent`} className="block h-full w-full">
            <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(min-width:1280px) 25vw, (min-width:640px) 50vw, 100vw"
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          </Link>

          <span
              className={`absolute left-2 top-2 rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${badgeClass}`}
          >
          {product.status}
        </span>

          {authed && (
              <button
                  type="button"
                  onClick={handleToggleFavorite}
                  aria-label={isFav ? `Remove ${product.name} from favourites` : `Save ${product.name}`}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm transition hover:bg-white/90"
              >
                <Heart
                    size={13}
                    strokeWidth={2}
                    className={
                      isFav
                          ? "fill-[#9E2A1B] text-[#9E2A1B]"
                          : "text-[#8C7E74] transition hover:text-[#9E2A1B]"
                    }
                />
              </button>
          )}
        </div>

        <div className="mt-3 flex flex-col gap-0.5">
          <h2 className="line-clamp-1 text-[14px] font-medium leading-5 text-[#1A130E]">
            {product.name}
          </h2>
          <p className="text-[12px] text-[#8C7E74] font-normal leading-4">
            {product.brand}
          </p>
          <p className="mt-1 text-[14px] font-bold text-[#1A130E]">
            {product.rentalPrice ?? product.price}
          </p>
        </div>
      </article>
  );
}

function Pagination() {
  return (
      <div className="flex items-center justify-center gap-1.5 border-t border-[#EBE3D5] py-6">
      <span className="text-[12px] font-medium text-[#8C7E74]">
        Showing loaded page rentals
      </span>
      </div>
  );
}