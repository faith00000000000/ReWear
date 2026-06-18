"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  PackageCheck,
  RotateCcw,
  ArrowRight,
  ShoppingBag,
  CalendarClock,
  Sparkles,
  HeartHandshake,
  ChevronRight,
  Truck,
  ShieldCheck,
  CircleDollarSign,
  Headphones, ArrowUpRight,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import Navbar from "@/layout/Navbar";
import Footer from "@/layout/Footer";
import HeroSection from "@/components/HeroSection";
import FAQSection from "@/components/FAQSection";

const readyToWear = [
  {
    name: "Red Cable Knit Cropped Cardigan",
    tag: "Thrift" as const,
    price: "6,400",
    image:
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Cognac Suede Weekend Jacket",
    tag: "Thrift + Rent" as const,
    price: "9,200",
    image:
        "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=520&q=90",
  },
  {
    name: "Crochet Lace Buttoned Blouse",
    tag: "Thrift" as const,
    price: "5,250",
    image:
        "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=520&q=90",
  },
  {
    name: "High Waist Wide-Leg Denim",
    tag: "Thrift" as const,
    price: "7,500",
    image:
        "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=520&q=90",
  },
];

const rentLooks = [
  {
    name: "Silk Bias Mini Dress",
    tag: "Rent" as const,
    price: "2,400 / day",
    image:
        "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=520&q=90",
  },
  {
    name: "Belted Trench Coat",
    tag: "Rent" as const,
    price: "1,500 / day",
    image:
        "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?auto=format&fit=crop&w=520&q=90",
  },
  {
    name: "Printed Wrap Dress",
    tag: "Thrift + Rent" as const,
    price: "1,950 / day",
    image:
        "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=520&q=90",
  },
  {
    name: "Cream Evening Blazer",
    tag: "Rent" as const,
    price: "1,800 / day",
    image:
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=520&q=90",
  },
];

export default function Home() {
  const { authed, user, isMounted } = useAuth();

  if (!isMounted) return null;

  return (
      <div className="min-h-screen bg-[#F7F4EB] font-sans antialiased text-[#1A1A1A]">
        {/* No <Navbar /> here — layout handles it */}
        {/* No border-x wrapper here — layout handles it */}

        <HeroSection isAuthenticated={authed} userName={user?.fullName} />

        <div className="bg-[#F7F4EB] pt-16 pb-4 text-center">{/* section header */}</div>

        {authed ? <StatsCardsAuthenticated /> : <StatsCardsGuest />}

        {!authed ? <PromotionalOffersSection /> : <ContinueWhereYouLeftOffSection userId={user?.id} />}

        <ProductRail eyebrow="CURATED FINDS" title="Ready-To-Wear" href="/browse-finds" items={readyToWear} />
        <ProductRail eyebrow="RENT, DON'T OWN" title="Rent The Look" href="/rent" items={rentLooks} />

        <DonateFeature />
        <FAQSection />

        {/* No <Footer /> here — layout handles it */}
      </div>
  );
}

interface ProductItem {
  name: string;
  image: string;
  price: string | number;
  tag: "Thrift" | "Thrift + Rent" | "Rent";
}

export function ProductRail({
                              eyebrow,
                              title = "Ready-To-Wear",
                              href,
                              items,
                            }: {
  eyebrow: string;
  title?: string;
  href: string;
  items: ProductItem[];
}) {
  return (
      <section className="bg-[#F7F4EB] px-6 py-12 sm:px-12 lg:px-20">
        <div className="mx-auto max-w-[1380px]">
          {/* Section Header */}
          <div className="mb-8 flex items-end justify-between border-b border-gray-200/50 pb-4">
            <div className="flex flex-col gap-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#962D18]">
                {eyebrow}
              </p>
              <h2 className="text-3xl font-serif tracking-tight text-[#1A1A1A]">
                {title}
              </h2>
            </div>

            <Link
                href={href}
                className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#1A1A1A] transition hover:text-[#962D18]"
            >
              <span>VIEW ALL PRODUCTS</span>
              <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
          </div>

          {/* Product Grid Layout */}
          <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
                <article
                    key={item.name}
                    className="group flex flex-col bg-white p-3 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.01)] transition hover:shadow-[0_4px_24px_rgba(0,0,0,0.05)]"
                >
                  {/* Card Image Container */}
                  <div className="relative aspect-[1/1.05] w-full overflow-hidden rounded-xl bg-[#EFECE8]">
                    <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition duration-500 group-hover:scale-103"
                    />

                    {/* Left Side Product Badge Tags */}
                    {item.tag === "Thrift" && (
                        <span className="absolute left-3 top-3 z-10 rounded-full bg-[#A32219] px-3 py-1 text-[9px] font-bold tracking-wider text-white shadow-sm uppercase">
                    Thrift
                  </span>
                    )}
                    {item.tag === "Thrift + Rent" && (
                        <span className="absolute left-3 top-3 z-10 rounded-full bg-[#1F1916] px-3 py-1 text-[9px] font-bold tracking-wider text-white shadow-sm uppercase">
                    Thrift + Rent
                  </span>
                    )}
                    {item.tag === "Rent" && (
                        <span className="absolute left-3 top-3 z-10 rounded-full bg-[#525E4B] px-3 py-1 text-[9px] font-bold tracking-wider text-white shadow-sm uppercase">
                    Rent
                  </span>
                    )}

                    {/* Right Side Add to Favourite Button */}
                    <button
                        type="button"
                        aria-label={`Save ${item.name}`}
                        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#1A1A1A] shadow-sm transition hover:bg-white hover:text-[#962D18]"
                    >
                      <Heart size={15} strokeWidth={2} />
                    </button>
                  </div>

                  {/* Content Box below Card Image */}
                  <div className="mt-4 flex flex-col gap-1 px-1 pb-1">
                    <h3 className="text-[14px] font-bold tracking-tight text-[#1A1A1A] line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-sm font-semibold text-gray-600">
                      Rs. {item.price}
                    </p>
                  </div>
                </article>
            ))}
          </div>
        </div>
      </section>
  );
}

// ==================== GUEST VIEW COMPONENTS ====================


// ─── Types ────────────────────────────────────────────────────────────────────

type StatKey = "saved" | "activeRentals" | "donations" | "tryOns";
type Stats = Record<StatKey, number>;

// ─── Config ───────────────────────────────────────────────────────────────────

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
    desc: "Wear once, return, repeat — style without commitment.",
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
    desc: "Virtual styling — see it on you before you buy.",
    statLabel: "Try-outs done",
    statKey: "tryOns" as const,
  },
] as const;

// ─── Shared card shell ────────────────────────────────────────────────────────

const CARD_BASE =
    "group flex flex-col rounded-2xl border border-gray-100 bg-[#fdf8f2] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#c8bfb4] hover:shadow-[0_14px_32px_-10px_rgba(80,60,40,0.13)]";

interface StatsCardProps {
  href: string;
  icon: React.ElementType;
  iconWrap: string;
  iconColor: string;
  title: string;
  desc: string;
  footer: React.ReactNode | null;
}

function StatsCard({ href, icon: Icon, iconWrap, iconColor, title, desc, footer }: StatsCardProps) {
  return (
      <Link href={href} className={CARD_BASE}>
        <div className="flex items-start gap-4">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconWrap}`}>
            <Icon size={20} strokeWidth={1.75} className={iconColor} />
          </div>
          <div>
            <h3 className="mb-1 text-sm font-bold tracking-tight text-[#1e1812]">{title}</h3>
            <p className="text-xs font-normal leading-relaxed text-gray-500">{desc}</p>
          </div>
        </div>

        {footer && (
            <div className="mt-3 border-t border-[#ece5db] pt-3">{footer}</div>
        )}
      </Link>
  );
}

// ─── Guest view ───────────────────────────────────────────────────────────────

export function StatsCardsGuest() {
  return (
      <section className="border-y border-[#e8e0d5] bg-white px-4 py-12 sm:px-8 lg:px-20">
        <div className="mx-auto grid max-w-[1380px] grid-cols-2 gap-4 md:grid-cols-4">
          {CARD_CONFIG.map((card) => (
              <StatsCard
                  key={card.href}
                  {...card}
                  footer={null}
              />
          ))}
        </div>
      </section>
  );
}

// ─── Authenticated view ───────────────────────────────────────────────────────

const MOCK_STATS: Stats = {
  saved: 24,
  activeRentals: 2,
  donations: 3,
  tryOns: 5,
};

export function StatsCardsAuthenticated({ stats = MOCK_STATS }: { stats?: Stats }) {
  return (
      <section className="border-y border-[#e8e0d5] bg-white px-4 py-12 sm:px-8 lg:px-20">
        <div className="mx-auto grid max-w-[1380px] grid-cols-2 gap-4 md:grid-cols-4">
          {CARD_CONFIG.map((card) => (
              <StatsCard
                  key={card.href}
                  {...card}
                  footer={
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                      <p className="text-xs font-semibold tracking-wide text-[#4a3d30]">
                        {card.statLabel}&nbsp;
                        <span className="text-sm font-bold text-[#1e1812]">{stats[card.statKey]}</span>
                      </p>
                    </div>
                  }
              />
          ))}
        </div>
      </section>
  );
}
/**
 * Promotional Offers Section - Guest View Only
 * Extracted from original code
 */
function PromotionalOffersSection() {
  return (
      <section className="bg-[#F7F4EB] px-6 py-12 sm:px-8 lg:px-20">
        <div className="mx-auto max-w-[1200px] grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Left Main Feature Banner: Women's Style */}
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#EAEFF4] sm:aspect-auto sm:min-h-[460px]">
            <Image
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"
                alt="Women's Style New Arrivals"
                fill
                priority
                className="object-cover object-center"
            />
            {/* Top-Right Stacked Text Elements */}
            <div className="absolute right-8 top-12 text-right z-10 max-w-[280px]">
            <span className="text-xs sm:text-sm font-bold tracking-wide text-[#2563EB]">
              New Arrivals
            </span>
              <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#1A1A1A] mt-1 leading-tight">
                Women&apos;s Style
              </h3>
              <p className="text-sm sm:text-base text-gray-700 font-medium mt-1">
                Up to 70% Off
              </p>
              <div className="mt-5 flex justify-end">
                <Link
                    href="/browse"
                    className="inline-flex items-center justify-center bg-transparent border-2 border-[#1A1A1A] text-[#1A1A1A] px-5 py-2 rounded-full text-xs font-bold tracking-wider transition hover:bg-[#1A1A1A] hover:text-white"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </div>

          {/* Right Dynamic Grouped Banner Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {/* Top-Left Grid: Handbag Promo */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#B09E8F]">
              <Image
                  src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80"
                  alt="Handbags Promotion"
                  fill
                  className="object-cover object-center mix-blend-multiply opacity-90"
              />
              {/* Top-Left Positioned Badge & Content */}
              <div className="absolute left-5 top-5 z-10 flex flex-col items-start gap-1">
              <span className="bg-[#0066CC] text-white font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm">
                25% OFF
              </span>
                <h4 className="text-2xl font-extrabold text-white tracking-wide mt-1">
                  Handbag
                </h4>
                <Link
                    href="/handbags"
                    className="text-xs font-bold text-white mt-2 inline-flex items-center gap-0.5 hover:underline"
                >
                  <span>Shop Now</span>
                  <ChevronRight size={14} strokeWidth={3} />
                </Link>
              </div>
            </div>

            {/* Top-Right Grid: Watch Promo */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#D1CDC6]">
              <Image
                  src="https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80"
                  alt="Watches Promotion"
                  fill
                  className="object-cover object-center mix-blend-multiply opacity-85"
              />
              <div className="absolute left-5 top-5 z-10 flex flex-col items-start gap-1">
              <span className="bg-[#0066CC] text-white font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm">
                45% OFF
              </span>
                <h4 className="text-2xl font-extrabold text-[#1A1A1A] tracking-wide mt-1">
                  Watch
                </h4>
                <Link
                    href="/watches"
                    className="text-xs font-bold text-[#1A1A1A] mt-2 inline-flex items-center gap-0.5 hover:underline"
                >
                  <span>Shop Now</span>
                  <ChevronRight size={14} strokeWidth={3} />
                </Link>
              </div>
            </div>

            {/* Bottom Full-Width Horizontal Grid: Backpack Promo */}
            <div className="relative aspect-[2.1/1] w-full overflow-hidden bg-[#9C8E81] sm:col-span-2 lg:col-span-1 xl:col-span-2">
              <Image
                  src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80"
                  alt="Backpacks Accessories Promotion"
                  fill
                  className="object-cover object-center mix-blend-multiply opacity-80"
              />
              <div className="absolute left-6 top-1/5 -translate-y-1/2 z-10 flex flex-col items-start">
              <span className="text-[11px] font-bold uppercase tracking-widest text-white/90">
                Accessories
              </span>
                <h4 className="text-3xl font-extrabold text-white tracking-tight mt-0.5">
                  Backpack
                </h4>
                <p className="text-xs font-semibold text-white/90 mt-1">
                  Min. 40–80% Off
                </p>
                <Link
                    href="/backpacks"
                    className="text-xs font-bold text-white mt-4 inline-flex items-center gap-0.5 border-b-2 border-white pb-0.5 hover:opacity-80"
                >
                  <span>Shop Now</span>
                  <ChevronRight size={14} strokeWidth={3} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
  );
}

/**
 * Continue Where You Left Off Section - Authenticated View Only
 * Shows recently viewed, cart items, and saved for later
 */
function ContinueWhereYouLeftOffSection({ userId }: { userId?: number }) {
  // Mock data - in real app, fetch from API based on userId
  const recentlyViewed = [
    {
      id: 1,
      name: "Vintage Coat",
      image:
          "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=60",
    },
    {
      id: 2,
      name: "Silk Dress",
      image:
          "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=150&q=60",
    },
    {
      id: 3,
      name: "Denim Jeans",
      image:
          "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=150&q=60",
    },
  ];

  const cartItems = [
    {
      id: 1,
      name: "Red Cardigan",
      image:
          "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=60",
    },
    {
      id: 2,
      name: "Weekend Jacket",
      image:
          "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=150&q=60",
    },
  ];

  const savedForLater = [
    {
      id: 1,
      name: "Lace Blouse",
      image:
          "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=150&q=60",
    },
    {
      id: 2,
      name: "Trench Coat",
      image:
          "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?auto=format&fit=crop&w=150&q=60",
    },
    {
      id: 3,
      name: "Evening Blazer",
      image:
          "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=150&q=60",
    },
  ];

  return (
      <section className="bg-[#F7F4EB] px-6 py-12 sm:px-12 lg:px-20 border-b border-gray-200/40">
        <div className="mx-auto max-w-[1380px]">
          {/* Section Title */}
          <div className="mb-10 border-b border-gray-200/50 pb-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#962D18] mb-2">
              Your Activity
            </p>
            <h2 className="text-3xl font-serif tracking-tight text-[#1A1A1A]">
              Continue Where You Left Off
            </h2>
          </div>

          {/* Three Column Grid */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Recently Viewed */}
            <div className="flex flex-col">
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-1 px-3">
                Recently Viewed
              </h3>
              <p className="text-xs font-semibold text-gray-500 mb-4 px-3">
                3 items
              </p>
              <div className="flex flex-wrap gap-3 bg-white/50 p-4 rounded-xl border border-gray-200">
                {recentlyViewed.map((item) => (
                    <Link
                        key={item.id}
                        href={`/browse-finds/${item.id}`}
                        className="relative group"
                    >
                      <div className="w-20 h-20 bg-[#EFECE8] rounded-lg overflow-hidden">
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
                  href="/browse-finds"
                  className="text-xs font-bold text-[#962D18] mt-3 px-3 hover:underline"
              >
                View all →
              </Link>
            </div>

            {/* In Your Cart */}
            <div className="flex flex-col">
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-1 px-3">
                In Your Cart
              </h3>
              <p className="text-xs font-semibold text-gray-500 mb-4 px-3">
                {cartItems.length} items
              </p>
              <div className="flex flex-wrap gap-3 bg-[#FFF5F0]/50 p-4 rounded-xl border border-gray-200">
                {cartItems.map((item) => (
                    <Link key={item.id} href="/cart" className="relative group">
                      <div className="w-20 h-20 bg-[#EFECE8] rounded-lg overflow-hidden">
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
                  href="/cart"
                  className="text-xs font-bold text-[#962D18] mt-3 px-3 hover:underline"
              >
                View cart →
              </Link>
            </div>

            {/* Saved for Later */}
            <div className="flex flex-col">
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-1 px-3">
                Saved for Later
              </h3>
              <p className="text-xs font-semibold text-gray-500 mb-4 px-3">
                {savedForLater.length} items
              </p>
              <div className="flex flex-wrap gap-3 bg-gray-100/30 p-4 rounded-xl border border-gray-200">
                {savedForLater.map((item) => (
                    <Link
                        key={item.id}
                        href={`/browse-finds/${item.id}`}
                        className="relative group"
                    >
                      <div className="w-20 h-20 bg-[#EFECE8] rounded-lg overflow-hidden">
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
                  href="/saved"
                  className="text-xs font-bold text-[#962D18] mt-3 px-3 hover:underline"
              >
                View saved →
              </Link>
            </div>
          </div>
        </div>
      </section>
  );
}

function DonateFeature() {
  return (
      <section className="bg-[#F7F4EB] px-6 py-16 sm:px-12 lg:px-20 border-t border-gray-200/40">
        <div className="mx-auto grid max-w-[1380px] grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          {/* Left Side: Image Container with Rounded Corners */}
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

          {/* Right Side: Fluid Content Area to Optimize Whitespace */}
          <div className="flex flex-col justify-center w-full">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.25em] text-[#962D18]">
              Send it forward
            </p>

            {/* Bold, Elegant Serif Header */}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1A1A1A] leading-[1.15]">
              Donate the pieces you no longer wear
            </h2>

            {/* Fluid Typography description covering horizontal whitespace */}
            <p className="mt-5 text-sm sm:text-base font-normal leading-relaxed text-gray-600">
              They can spark somebody else&apos;s best outfit. We resell what we
              can, donate the rest to local shelters, and responsibly recycle
              anything past its life.
            </p>

            {/* Action Call to Buttons with authentic pill shapes */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Link
                  href="/donate/shipping-label"
                  className="inline-flex items-center gap-2 rounded-full bg-[#1A1A1A] px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-white transition hover:bg-[#962D18] shadow-sm"
              >
                <PackageCheck size={14} strokeWidth={2.5} />
                <span>Get a shipping label</span>
              </Link>

              <Link
                  href="/donate"
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A] transition hover:border-[#1A1A1A] hover:bg-gray-50 shadow-sm"
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