"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, PackageCheck, RotateCcw, ArrowRight } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/lib/CartContext";
import { useFavorites, mapAvailability } from "@/lib/FavoritesContext";
import { useRecentlyViewed } from "@/lib/RecentlyViewedContext";
import HeroSection from "@/components/HeroSection";
import FAQSection from "@/components/FAQSection";
import { fetchListings, filterByMode } from "@/lib/api/listings";
import { ListingResponseDTO } from "@/lib/types/listing";

/* ─── Shared product item shape used by ProductRail ──────────────────── */
interface ProductItem {
  id: number;
  name: string;
  image: string;
  price: string;
  tag: "Thrift" | "Thrift + Rent" | "Rent";
  brand?: string;
  size?: string;
  availability?: string;
}

/* Maps a backend listing to the card shape, keeping THRIFT/RENT price logic
   consistent with how browse-finds/rent already display it. Also carries
   brand/size/availability so the favorite-toggle on the Home rail matches
   the same shape browse-finds already uses. */
function toReadyToWearItem(l: ListingResponseDTO): ProductItem {
  const tag: ProductItem["tag"] =
      l.listingMode === "THRIFT_AND_RENT" ? "Thrift + Rent" : "Thrift";
  return {
    id: l.id,
    name: l.productTitle,
    image: l.photoFrontUrl || "/images/placeholder-item.png",
    price: l.thriftPrice != null ? Number(l.thriftPrice).toLocaleString() : "—",
    tag,
    brand: l.brand ?? "",
    size: l.size ?? "",
    availability: l.availability ?? "AVAILABLE",
  };
}

function toRentItem(l: ListingResponseDTO): ProductItem {
  const tag: ProductItem["tag"] =
      l.listingMode === "THRIFT_AND_RENT" ? "Thrift + Rent" : "Rent";
  return {
    id: l.id,
    name: l.productTitle,
    image: l.photoFrontUrl || "/images/placeholder-item.png",
    price:
        l.rentPerDay != null
            ? `${Number(l.rentPerDay).toLocaleString()} / day`
            : "—",
    tag,
    brand: l.brand ?? "",
    size: l.size ?? "",
    availability: l.availability ?? "AVAILABLE",
  };
}

export default function Home() {
  const { authed, user, isMounted } = useAuth();

  const [readyToWear, setReadyToWear] = useState<ProductItem[]>([]);
  const [rentLooks, setRentLooks] = useState<ProductItem[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadListings() {
      try {
        // Pull a page and split client-side by mode. If your catalog grows
        // large, swap this for two dedicated endpoint calls with a
        // `listingMode` query param instead.
        const { content } = await fetchListings({ page: 0, size: 24 });
        if (cancelled) return;

        const thriftItems = filterByMode(content, "THRIFT").slice(0, 4);
        const rentItems = filterByMode(content, "RENT").slice(0, 4);

        setReadyToWear(thriftItems.map(toReadyToWearItem));
        setRentLooks(rentItems.map(toRentItem));
      } catch {
        // Fail quiet on the landing page — sections simply won't render
        setReadyToWear([]);
        setRentLooks([]);
      } finally {
        if (!cancelled) setLoadingListings(false);
      }
    }

    loadListings();
    return () => {
      cancelled = true;
    };
  }, []);

  // Hash navigation can arrive before this client-rendered homepage is ready.
  useEffect(() => {
    if (!isMounted || loadingListings) return;
    const id = window.location.hash.slice(1);
    if (!["ready-to-wear", "rent-the-look", "donate-the-pieces", "faqs"].includes(id)) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isMounted, loadingListings]);

  if (!isMounted) return null;

  return (
      <div className="min-h-screen bg-[#F7F4EB] font-sans antialiased text-[#1A1A1A]">
        <HeroSection isAuthenticated={authed} userName={user?.fullName} />

        {authed ? <StatsCardsAuthenticated /> : <StatsCardsGuest />}

        {authed && <ContinueWhereYouLeftOffSection />}
        {/* Guest promotional banners (New Arrivals / Handbag / Watch / Backpack)
          intentionally removed per current requirements. */}

        {(
            <ProductRail
                id="ready-to-wear"
                loading={loadingListings}
                eyebrow="CURATED FINDS"
                title="Ready-To-Wear"
                href="/browse-finds"
                items={readyToWear}
                viewMode="thrift"
            />
        )}

        {(
            <ProductRail
                id="rent-the-look"
                loading={loadingListings}
                eyebrow="RENT, DON'T OWN"
                title="Rent The Look"
                href="/rent"
                items={rentLooks}
                viewMode="rent"
            />
        )}

        <DonateFeature />
        <FAQSection />
      </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   PRODUCT RAIL — mobile: 2-up grid, scales to 4-up on desktop.
   Cards now click through to the product detail page (same route/query
   shape as browse-finds/rent: `/browse-finds/:id?view=thrift`), and the
   heart button wires into FavoritesContext exactly like ProductCard does
   on the Browse Finds page.
   ────────────────────────────────────────────────────────────────────── */

export function ProductRail({
                                id,
                                loading = false,
                                eyebrow,
                                title = "Ready-To-Wear",
                                href,
                                items,
                                viewMode,
                            }: {
    id?: string;
    loading?: boolean;
    eyebrow: string;
    title?: string;
    href: string;
    items: ProductItem[];
    viewMode: "thrift" | "rent";
}) {
    return (
        <section id={id} className="scroll-mt-24 bg-[#F7F4EB] px-4 py-10 sm:px-6 sm:py-12 lg:px-20">
            <div className="mx-auto max-w-[1380px]">
                <div className="mb-6 flex items-end justify-between gap-3 border-b border-gray-200/50 pb-4 sm:mb-8">
                    <div className="flex flex-col gap-1">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#962D18] sm:text-[11px] sm:tracking-[0.25em]">
                            {eyebrow}
                        </p>

                        <h2 className="text-xl font-serif tracking-tight text-[#1A1A1A] sm:text-3xl">
                            {title}
                        </h2>
                    </div>

                    <Link
                        href={href}
                        className="flex shrink-0 items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#1A1A1A] transition hover:text-[#962D18] sm:text-[11px] sm:tracking-[0.15em]"
                    >
                        <span className="hidden sm:inline">VIEW ALL PRODUCTS</span>
                        <span className="sm:hidden">VIEW ALL</span>
                        <ArrowRight size={14} strokeWidth={2.5} />
                    </Link>
                </div>

                {items.length === 0 && <p role="status" className="py-6 text-[13px] text-[#756b61]">{loading ? "Loading pieces…" : "No pieces available here yet. Explore the full collection using View all."}</p>}
                <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-4">
                    {items.map((item) => (
                        <ProductRailCard
                            key={item.id}
                            item={item}
                            detailHref={`/browse-finds/${item.id}?view=${viewMode}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

type FavoriteStatus = "THRIFT" | "RENT" | "THRIFT + RENT";

const FAVORITE_STATUS_MAP: Record<ProductItem["tag"], FavoriteStatus> = {
  Thrift: "THRIFT",
  Rent: "RENT",
  "Thrift + Rent": "THRIFT + RENT",
};

const TAG_STYLES: Record<ProductItem["tag"], string> = {
  Thrift: "bg-[#A32219]",
  Rent: "bg-[#525E4B]",
  "Thrift + Rent": "bg-[#1F1916]",
};

interface ProductRailCardProps {
    item: ProductItem;
    detailHref: string;
}

function ProductRailCard({ item, detailHref }: ProductRailCardProps) {
    const { authed } = useAuth();
    const { isFavorite, toggleFavorite } = useFavorites();

    const isFav = authed && isFavorite(String(item.id));

    function handleToggleFavorite(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        e.stopPropagation();

        const nowFavorited = toggleFavorite({
            id: String(item.id),
            name: item.name,
            brand: item.brand ?? "",
            image: item.image,
            price: item.price,
            status: FAVORITE_STATUS_MAP[item.tag],
            category: "thrift",
            size: item.size ?? "",
            availability: mapAvailability(item.availability ?? "AVAILABLE"),
        });

        toast[nowFavorited ? "success" : "info"](
            nowFavorited
                ? "Added to favourites"
                : "Removed from favourites",
            { autoClose: 2000 }
        );
    }

    return (
        <article className="group flex flex-col rounded-xl bg-white p-2 shadow-[0_4px_20px_rgba(0,0,0,0.01)] transition hover:shadow-[0_4px_24px_rgba(0,0,0,0.05)] sm:rounded-2xl sm:p-3">
            <div className="relative aspect-[1/1.05] w-full overflow-hidden rounded-lg bg-[#EFECE8] sm:rounded-xl">
                <Link
                    href={detailHref}
                    className="block h-full w-full"
                    aria-label={`View ${item.name}`}
                >
                    <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(min-width: 1024px) 25vw, 50vw"
                        className="object-cover transition duration-500 group-hover:scale-103"
                    />
                </Link>

                {/* Tag / Mode Badge */}
                <span
                    className={`absolute left-2 top-2 z-10 rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white shadow-sm sm:left-3 sm:top-3 sm:px-3 sm:py-1 sm:text-[9px] ${TAG_STYLES[item.tag]}`}
                >
          {item.tag}
        </span>

                {/* Reserved Badge */}
                {(item.availability === "RESERVED" || item.availability === "Reserved") && (
                    <span className="absolute left-2 bottom-2 z-10 rounded-full bg-[#92740E] px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white shadow-sm sm:left-3 sm:bottom-3 sm:px-2.5 sm:py-1 sm:text-[9px]">
            Reserved
          </span>
                )}

                {/* Favorite Button */}
                <button
                    type="button"
                    onClick={handleToggleFavorite}
                    aria-label={
                        isFav
                            ? `Remove ${item.name} from favourites`
                            : `Save ${item.name}`
                    }
                    aria-pressed={isFav}
                    className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#1A1A1A] shadow-sm transition hover:bg-white hover:text-[#962D18] sm:right-3 sm:top-3 sm:h-8 sm:w-8"
                >
                    <Heart
                        size={14}
                        strokeWidth={2}
                        className={isFav ? "fill-[#962D18] text-[#962D18]" : ""}
                    />
                </button>
            </div>

            <Link
                href={detailHref}
                className="mt-3 flex flex-col gap-1 px-1 pb-1 sm:mt-4"
            >
                <h3 className="line-clamp-1 text-[12px] font-bold tracking-tight text-[#1A1A1A] sm:text-[14px]">
                    {item.name}
                </h3>

                <p className="text-xs font-semibold text-gray-600 sm:text-sm">
                    Rs. {item.price}
                </p>
            </Link>
        </article>
    );
}

/* ──────────────────────────────────────────────────────────────────────
   GUEST / AUTH STAT CARDS — unchanged logic, mobile-tightened spacing
   ────────────────────────────────────────────────────────────────────── */

import type { LucideIcon } from "lucide-react";
import {
  ShoppingBag,
  CalendarClock,
  Sparkles,
  HeartHandshake,
} from "lucide-react";

type StatKey = "saved" | "activeRentals" | "donations" | "tryOns";
type Stats = Record<StatKey, number>;

const CARD_CONFIG = [
  {
    href: "/browse-finds",
    icon: ShoppingBag,
    iconWrap: "bg-[#FEF0EE]",
    iconColor: "text-[#AC1B18]",
    title: "Buy",
    desc: "Curated vintage & pre-loved pieces at honest prices.",
    statLabel: "Saved",
    statKey: "saved" as const,
  },
  {
    href: "/rent",
    icon: CalendarClock,
    iconWrap: "bg-[#EFF2EC]",
    iconColor: "text-[#5E6B52]",
    title: "Rent",
    desc: "Wear once, return, repeat style without commitment.",
    statLabel: "Active rentals",
    statKey: "activeRentals" as const,
  },
  {
    href: "/donate",
    icon: HeartHandshake,
    iconWrap: "bg-[#FEF0EE]",
    iconColor: "text-[#AC1B18]",
    title: "Donate",
    desc: "Give your wardrobe a second life with someone who needs it.",
    statLabel: "Donated",
    statKey: "donations" as const,
  },
  {
    href: "/ai-try-on",
    icon: Sparkles,
    iconWrap: "bg-[#F5F0E8]",
    iconColor: "text-[#8B6F47]",
    title: "Try On",
    desc: "Virtual styling see it on you before you buy.",
    statLabel: "Try-outs done",
    statKey: "tryOns" as const,
  },
] as const;

const CARD_BASE =
    "group flex flex-col rounded-xl border border-gray-100 bg-[#fdf8f2] p-3.5 transition-all duration-300 hover:-translate-y-1 hover:border-[#c8bfb4] hover:shadow-[0_14px_32px_-10px_rgba(80,60,40,0.13)] sm:rounded-2xl sm:p-5";

interface StatsCardProps {
  href: string;
  icon: LucideIcon;
  iconWrap: string;
  iconColor: string;
  title: string;
  desc: string;
  footer: React.ReactNode | null;
}

function StatsCard({
                     href,
                     icon: Icon,
                     iconWrap,
                     iconColor,
                     title,
                     desc,
                     footer,
                   }: StatsCardProps) {
  return (
      <Link href={href} className={CARD_BASE}>
        <div className="flex items-start gap-3 sm:gap-4">
          <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconWrap} sm:h-10 sm:w-10 sm:rounded-xl`}
          >
            <Icon size={18} strokeWidth={1.75} className={iconColor} />
          </div>
          <div>
            <h3 className="mb-0.5 text-xs font-bold tracking-tight text-[#1e1812] sm:mb-1 sm:text-sm">
              {title}
            </h3>
            <p className="hidden text-xs font-normal leading-relaxed text-gray-500 sm:block">
              {desc}
            </p>
          </div>
        </div>

        {footer && (
            <div className="mt-3 border-t border-[#ece5db] pt-3">{footer}</div>
        )}
      </Link>
  );
}

export function StatsCardsGuest() {
  return (
      <section className="border-y border-[#e8e0d5] bg-white px-4 py-8 sm:px-8 sm:py-12 lg:px-20">
        <div className="mx-auto grid max-w-[1380px] grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {CARD_CONFIG.map((card) => (
              <StatsCard key={card.href} {...card} footer={null} />
          ))}
        </div>
      </section>
  );
}

const MOCK_STATS: Stats = {
  saved: 24,
  activeRentals: 2,
  donations: 3,
  tryOns: 5,
};

export function StatsCardsAuthenticated({
                                          stats = MOCK_STATS,
                                        }: {
  stats?: Stats;
}) {
  return (
      <section className="border-y border-[#e8e0d5] bg-white px-4 py-8 sm:px-8 sm:py-12 lg:px-20">
        <div className="mx-auto grid max-w-[1380px] grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {CARD_CONFIG.map((card) => (
              <StatsCard
                  key={card.href}
                  {...card}
                  footer={
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                      <p className="text-[11px] font-semibold tracking-wide text-[#4a3d30] sm:text-xs">
                        {card.statLabel}&nbsp;
                        <span className="text-sm font-bold text-[#1e1812]">
                    {stats[card.statKey]}
                  </span>
                      </p>
                    </div>
                  }
              />
          ))}
        </div>
      </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   CONTINUE WHERE YOU LEFT OFF — now wired to real context data.
   Each column hides if empty; whole section hides if everything is empty.
   ────────────────────────────────────────────────────────────────────── */

function ActivityColumn({
                          title,
                          count,
                          bgClass,
                          items,
                          viewAllHref,
                          viewAllLabel,
                        }: {
  title: string;
  count: number;
  bgClass: string;
  items: { id: string | number; name: string; image: string; href: string }[];
  viewAllHref: string;
  viewAllLabel: string;
}) {
  return (
      <div className="flex flex-col">
        <h3 className="text-base font-bold text-[#1A1A1A] mb-1 px-2 sm:text-lg sm:px-3">
          {title}
        </h3>
        <p className="text-[11px] font-semibold text-gray-500 mb-3 px-2 sm:text-xs sm:mb-4 sm:px-3">
          {count} item{count !== 1 ? "s" : ""}
        </p>
        <div
            className={`flex flex-wrap gap-2.5 p-3 rounded-xl border border-gray-200 sm:gap-3 sm:p-4 ${bgClass}`}
        >
          {items.map((item) => (
              <Link key={item.id} href={item.href} className="relative group">
                <div className="w-16 h-16 bg-[#EFECE8] rounded-lg overflow-hidden sm:w-20 sm:h-20">
                  <Image
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                </div>
              </Link>
          ))}
        </div>
        <Link
            href={viewAllHref}
            className="text-xs font-bold text-[#962D18] mt-3 px-2 hover:underline sm:px-3"
        >
          {viewAllLabel} →
        </Link>
      </div>
  );
}

function ContinueWhereYouLeftOffSection() {
  const { items: recentlyViewed } = useRecentlyViewed();
  const { cartItems } = useCart();
  const { favorites } = useFavorites();

  const hasRecentlyViewed = recentlyViewed.length > 0;
  const hasCart = cartItems.length > 0;
  const hasSaved = favorites.length > 0;

  // Hide the whole section if there's genuinely nothing to show — a brand
  // new guest-turned-user shouldn't see three empty boxes.
  if (!hasRecentlyViewed && !hasCart && !hasSaved) return null;

  return (
      <section className="bg-[#F7F4EB] px-4 py-10 sm:px-12 sm:py-12 lg:px-20 border-b border-gray-200/40">
        <div className="mx-auto max-w-[1380px]">
          <div className="mb-6 border-b border-gray-200/50 pb-4 sm:mb-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#962D18] mb-2 sm:text-[11px] sm:tracking-[0.25em]">
              Your Activity
            </p>
            <h2 className="text-xl font-serif tracking-tight text-[#1A1A1A] sm:text-3xl">
              Continue Where You Left Off
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3">
            {hasRecentlyViewed && (
                <ActivityColumn
                    title="Recently Viewed"
                    count={recentlyViewed.length}
                    bgClass="bg-white/50"
                    viewAllHref="/browse-finds"
                    viewAllLabel="View all"
                    items={recentlyViewed.map((i) => ({
                      id: i.id,
                      name: i.name,
                      image: i.image,
                      href: `/browse-finds/${i.id}`,
                    }))}
                />
            )}

            {hasCart && (
                <ActivityColumn
                    title="In Your Cart"
                    count={cartItems.length}
                    bgClass="bg-[#FFF5F0]/50"
                    viewAllHref="/cart"
                    viewAllLabel="View cart"
                    items={cartItems.map((i) => ({
                      id: i.id,
                      name: i.name,
                      image: i.image,
                      href: "/cart",
                    }))}
                />
            )}

            {hasSaved && (
                <ActivityColumn
                    title="Saved for Later"
                    count={favorites.length}
                    bgClass="bg-gray-100/30"
                    viewAllHref="/saved"
                    viewAllLabel="View saved"
                    items={favorites.map((i) => ({
                      id: i.id,
                      name: i.name,
                      image: i.image,
                      href: `/browse-finds/${i.id}`,
                    }))}
                />
            )}
          </div>
        </div>
      </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   DONATE FEATURE — mobile spacing/type tightened, unchanged otherwise
   ────────────────────────────────────────────────────────────────────── */

function DonateFeature() {
  return (
      <section id="donate-the-pieces" className="scroll-mt-24 bg-[#F7F4EB] px-4 py-10 sm:px-12 sm:py-16 lg:px-20 border-t border-gray-200/40">
        <div className="mx-auto grid max-w-[1380px] grid-cols-1 gap-6 lg:grid-cols-2 lg:items-center lg:gap-10">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-[#EFECE8] shadow-sm">
            <Image
                src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1000&q=80"
                alt="Donation and cozy lifestyle space"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
                priority
            />
          </div>

          <div className="flex flex-col justify-center w-full">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#962D18] sm:text-[11px] sm:tracking-[0.25em]">
              Send it forward
            </p>

            <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1A1A1A] leading-[1.15]">
              Donate the pieces you no longer wear
            </h2>

            <p className="mt-3 text-sm sm:mt-5 sm:text-base font-normal leading-relaxed text-gray-600">
              They can spark somebody else&apos;s best outfit. We resell what we
              can, donate the rest to local shelters, and responsibly recycle
              anything past its life.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2.5 sm:mt-8 sm:gap-3.5">
              <Link
                  href="/donate/shipping-label"
                  className="inline-flex items-center gap-2 rounded-full bg-[#1A1A1A] px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white transition hover:bg-[#962D18] shadow-sm sm:px-6 sm:py-3.5 sm:text-[11px]"
              >
                <PackageCheck size={14} strokeWidth={2.5} />
                <span>Get a shipping label</span>
              </Link>

              <Link
                  href="/donate"
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A] transition hover:border-[#1A1A1A] hover:bg-gray-50 shadow-sm sm:px-6 sm:py-3.5 sm:text-[11px]"
              >
                <RotateCcw size={14} strokeWidth={2.5} />
                <span>Learn more</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
  );
}