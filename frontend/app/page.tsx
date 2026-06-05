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
  Headphones,
} from "lucide-react";
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
  return (
    <div className="min-h-screen bg-[#F7F4EB] font-sans antialiased text-[#1A1A1A]">
      <div className="border-x-[6px] border-t-[6px] border-[#962D18]">
        <Navbar />
        <HeroSection />

        {/* 1. Styled Typography Section Header */}
        <div className="bg-[#F7F4EB] pt-16 pb-4 text-center">
          {/* <h2 className="text-3xl sm:text-4xl font-serif italic font-normal text-[#962D18] tracking-wide px-4">
            Curated Pre-Loved Fashion
          </h2> */}
        </div>

        {/* 2. Value Propositions Grid Section */}
        <section className="bg-white py-10 px-6 sm:px-12 lg:px-20 border-b border-gray-100">
          <div className="mx-auto max-w-[1380px] grid grid-cols-2 gap-y-8 gap-x-6 md:grid-cols-4">
            <div className="flex items-start gap-3.5">
              <div className="text-[#962D18] p-1 mt-0.5">
                <ShoppingBag size={24} strokeWidth={1.75} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1A1A1A] tracking-wide uppercase">
                  Buy
                </h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed font-medium">
                  Curated vintage & pre-loved pieces
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3.5">
              <div className="text-[#962D18] p-1 mt-0.5">
                <CalendarClock size={24} strokeWidth={1.75} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1A1A1A] tracking-wide uppercase">
                  Rent
                </h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed font-medium">
                  Wear once, return, repeat
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3.5">
              <div className="text-[#962D18] p-1 mt-0.5">
                <HeartHandshake size={24} strokeWidth={1.75} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1A1A1A] tracking-wide uppercase">
                  Donate
                </h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed font-medium">
                  Give your wardrobe a second life
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3.5">
              <div className="text-[#962D18] p-1 mt-0.5">
                <Sparkles size={24} strokeWidth={1.75} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1A1A1A] tracking-wide uppercase">
                  Try On
                </h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed font-medium">
                  AI-powered virtual styling
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Promotional Offers Grid Section */}
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

        {/* 3. Product Rails with Category Specific Eyebrows */}
        <ProductRail
          eyebrow="CURATED FINDS"
          title="Ready-To-Wear"
          href="/browse-finds"
          items={readyToWear}
        />

        <ProductRail
          eyebrow="RENT, DON'T OWN"
          title="Rent The Look"
          href="/rent"
          items={rentLooks}
        />

        <DonateFeature />

        {/* 4. Reduced Boldness in FAQ Answers container style */}
        <FAQSection />
      </div>

      <Footer />
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

function DonateFeature() {
  return (
    <section className="bg-[#F7F4EB] px-6 py-16 sm:px-12 lg:px-20 border-t border-gray-200/40">
      <div className="mx-auto grid max-w-[1380px] grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
        {/* Left Side: Image Container with Rounded Corners from image_86d94d.png */}
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
