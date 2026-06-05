"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  Heart,
  Truck,
  ShoppingBag,
  Calendar,
  Sparkles,
} from "lucide-react";
import Navbar from "@/layout/Navbar";
import Footer from "@/layout/Footer";

const filters = [
  {
    title: "Occasion",
    options: [
      "Weddings",
      "Parties",
      "Work & Events",
      "Date Night",
      "Casual Elevated",
    ],
    open: true,
  },
  {
    title: "Category",
    options: ["Dresses", "Tops", "Bottoms", "Outerwear", "Sets & Jumpsuits"],
    open: true,
  },
  {
    title: "Designer",
    options: ["Reformation", "Shona Joy", "Acler", "Camilla and Marc", "SIR."],
    open: true,
    hasSearch: true,
  },
];

const sizes = ["XXS", "XS", "S", "M", "L", "XL", "XXL"];
const durations = ["4 Days", "8 Days", "14 Days", "30 Days"];

const RENTALS = [
  {
    id: 1,
    name: "Satin One-Shoulder Dress",
    brand: "Shona Joy",
    price: "from $79",
    image:
      "https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: 2,
    name: "Halter Neck Midi Dress",
    brand: "Acler",
    price: "from $89",
    image:
      "https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=500&h=620&fit=crop&auto=format",
  },
  {
    id: 3,
    name: "Strapless Structured Gown",
    brand: "Bec + Bridge",
    price: "from $99",
    image:
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=500&h=620&fit=crop&auto=format",
  },
  {
    id: 4,
    name: "Floral Ruffle Maxi Dress",
    brand: "Zimmermann",
    price: "from $95",
    image:
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500&h=620&fit=crop&auto=format",
  },
  {
    id: 5,
    name: "Oversized Linen Blazer",
    brand: "Reformation",
    price: "from $69",
    image:
      "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=500&h=620&fit=crop&auto=format",
  },
  {
    id: 6,
    name: "Bias Cut Satin Dress",
    brand: "SIR.",
    price: "from $75",
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: 7,
    name: "Pleated Halter Dress",
    brand: "Aje",
    price: "from $85",
    image:
      "https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=500&h=620&fit=crop&auto=format",
  },
  {
    id: 8,
    name: "Sequin Mini Dress",
    brand: "Rotate Birger Christensen",
    price: "from $89",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80",
  },
];

export default function RentPage() {
  return (
    <div className="min-h-screen bg-[#FBF7EE] text-[#1A1A1A]">
      {/* Thick red accent borders matching the template schema */}
      <div className="border-x-[6px] border-t-[6px] border-[#A62612]">
        <Navbar />

        <main>
          {/* HERO SECTION */}
          <section className="relative overflow-hidden px-7 pb-16 pt-12 sm:px-12 lg:px-24">
            <div className="mx-auto max-w-[1380px]">
              <div className="grid items-center gap-16 lg:grid-cols-[1fr_520px]">
                {/* LEFT CONTENT */}
                <div className="relative z-10 max-w-[620px]">
                  <p className="mb-6 text-[13px] font-semibold uppercase tracking-[0.35em] text-[#A62612]">
                    RENT. WEAR. RETURN.
                  </p>

                  <h1 className="font-serif leading-[0.95] tracking-[-0.04em] text-[#111111]">
                    <span className="block text-[64px] sm:text-[80px] lg:text-[96px] font-medium">
                      Rent the look,
                    </span>
                    <span className="block text-[60px] sm:text-[76px] lg:text-[88px] font-normal italic text-[#A62612] mt-2">
                      own the moment.
                    </span>
                  </h1>

                  <p className="mt-8 max-w-[480px] text-[16px] leading-[1.8] text-[#4D4D4D]">
                    Designer pieces, occasion-ready picks, and everyday elevated
                    styles—rent for less, love more.
                  </p>
                </div>

                {/* RIGHT VISUAL */}
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

                  {/* Sort Button */}
                  <div className="absolute -bottom-10 right-0">
                    <label className="flex items-center gap-2 rounded-full border border-[#E4DDD3] bg-[#FBF7EE]/95 px-5 py-2.5 backdrop-blur-sm shadow-sm">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#555]">
                        SORT
                      </span>
                      <select className="appearance-none bg-transparent pr-4 text-[14px] font-medium text-[#1A1A1A] outline-none cursor-pointer">
                        <option>Recommended</option>
                        <option>Newest</option>
                        <option>Price low</option>
                        <option>Price high</option>
                      </select>
                      <ChevronDown className="h-4 w-4 text-[#707070]" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* MAIN PRODUCT EXPLORER SECTION */}
          <section className="px-7 pb-20 sm:px-12 lg:px-24">
            <div className="mx-auto max-w-[1380px] overflow-hidden rounded-[16px] border border-[#E4DDD3] bg-[#FDFBF7]">
              <div className="grid lg:grid-cols-[250px_1fr]">
                {/* Filter Rail Component */}
                <FilterRail />

                {/* Main Product Canvas */}
                <div className="min-w-0">
                  <div className="flex items-center justify-between border-b border-[#E4DDD3] px-6 py-5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#1A1A1A]">
                      128 RENTAL PIECES
                    </p>
                    <div className="flex items-center gap-2 text-[11px] font-medium tracking-wide text-[#707070]">
                      <Truck
                        size={14}
                        strokeWidth={2}
                        className="text-[#707070]"
                      />
                      <p>Free delivery & return on all rentals</p>
                    </div>
                  </div>

                  {/* Rental Products Grid */}
                  <div className="grid gap-x-5 gap-y-8 p-6 sm:grid-cols-2 xl:grid-cols-4">
                    {RENTALS.map((rental) => (
                      <RentalCard key={rental.id} rental={rental} />
                    ))}
                  </div>

                  <Pagination />
                  {/*<section className="px-7 pb-8 sm:px-12 lg:px-12">*/}
                  {/*  <div className="mx-auto max-w-[1500px] grid grid-cols-1 md:grid-cols-4 gap-4 border-[#E4DDD3] pt-10">*/}
                  {/*    {[*/}
                  {/*      { title: "Premium Pieces", desc: "Curated designer & contemporary styles", icon: "👜" },*/}
                  {/*      { title: "Flexible Rentals", desc: "4, 8, 14 or 30-day rental periods", icon: "📅" },*/}
                  {/*      { title: "Free Delivery & Returns", desc: "Contactless delivery & easy returns", icon: "🚚" },*/}
                  {/*      { title: "Cleaned & Checked", desc: "Professionally cleaned & quality-checked", icon: "✨" }*/}
                  {/*    ].map((prop, index) => (*/}
                  {/*        <div key={index} className="flex gap-4 p-4 rounded-xl bg-[#FDFBF7] border border-[#E4DDD3]/60">*/}
                  {/*          <span className="text-2xl">{prop.icon}</span>*/}
                  {/*          <div>*/}
                  {/*            <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#1A1A1A]">{prop.title}</h4>*/}
                  {/*            <p className="text-[12px] text-[#707070] mt-1">{prop.desc}</p>*/}
                  {/*          </div>*/}
                  {/*        </div>*/}
                  {/*    ))}*/}
                  {/*  </div>*/}
                  {/*</section>*/}
                  <section className="px-7 pb-8 sm:px-12 lg:px-12">
                    <div className="mx-auto max-w-[1500px] grid grid-cols-1 md:grid-cols-4 gap-4 border-[#E4DDD3] pt-10">
                      {[
                        {
                          title: "Premium Pieces",
                          desc: "Curated designer & contemporary styles",
                          icon: ShoppingBag,
                        },
                        {
                          title: "Flexible Rentals",
                          desc: "4, 8, 14 or 30-day rental periods",
                          icon: Calendar,
                        },
                        {
                          title: "Free Delivery & Returns",
                          desc: "Contactless delivery & easy returns",
                          icon: Truck,
                        },
                        {
                          title: "Cleaned & Checked",
                          desc: "Professionally cleaned & quality-checked",
                          icon: Sparkles,
                        },
                      ].map((prop, index) => {
                        const IconComponent = prop.icon;
                        return (
                          <div
                            key={index}
                            className="flex items-start gap-4 p-4 rounded-xl bg-[#FDFBF7] border border-[#E4DDD3]/60 shadow-sm/5"
                          >
                            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-[#F5F0E8] text-[#1A1A1A]">
                              <IconComponent
                                size={18}
                                strokeWidth={1.75}
                                className="text-[#A62612]"
                              />
                            </div>
                            <div>
                              <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#1A1A1A]">
                                {prop.title}
                              </h4>
                              <p className="text-[12px] text-[#707070] mt-1 leading-normal">
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

          {/* VALUE PROPS STRIP (Bottom Features) */}
        </main>
      </div>

      <Footer />
    </div>
  );
}

function FilterRail() {
  return (
    <aside className="border-r border-[#E4DDD3] bg-[#FDFBF7] px-5 py-5">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#1A1A1A]">
          RENT FILTERS
        </h2>
        <button className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#A62612] hover:opacity-80">
          CLEAR
        </button>
      </div>

      {filters.map((filter) => (
        <section key={filter.title} className="border-b border-[#E4DDD3] py-5">
          <button className="flex w-full items-center justify-between text-left">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#1A1A1A]">
              {filter.title}
            </span>
            <ChevronDown className="h-4 w-4 text-[#707070]" />
          </button>

          {filter.open && (
            <div className="mt-4 space-y-3">
              {filter.hasSearch && (
                <input
                  type="text"
                  placeholder="Search designer"
                  className="w-full h-8 px-3 text-[12px] rounded border border-[#E4DDD3] bg-white outline-none focus:border-[#A62612]"
                />
              )}
              {filter.options.map((option) => (
                <label
                  key={option}
                  className="flex cursor-pointer items-center gap-3 text-[13px] text-[#4D4D4D]"
                >
                  <input type="checkbox" className="h-4 w-4 accent-[#A62612]" />
                  {option}
                </label>
              ))}
            </div>
          )}
        </section>
      ))}

      {/* SIZE FILTER GRID */}
      <section className="border-b border-[#E4DDD3] py-5">
        <button className="flex w-full items-center justify-between text-left mb-4">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#1A1A1A]">
            SIZE
          </span>
          <ChevronDown className="h-4 w-4 text-[#707070]" />
        </button>
        <div className="grid grid-cols-4 gap-1.5">
          {sizes.map((size) => (
            <button
              key={size}
              className="h-8 border border-[#E4DDD3] text-[11px] font-semibold text-[#1A1A1A] hover:border-[#1A1A1A] rounded bg-white transition"
            >
              {size}
            </button>
          ))}
        </div>
      </section>

      {/* RENTAL DURATION */}
      <section className="border-b border-[#E4DDD3] py-5">
        <button className="flex w-full items-center justify-between text-left mb-4">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#1A1A1A]">
            RENTAL DURATION
          </span>
          <ChevronDown className="h-4 w-4 text-[#707070]" />
        </button>
        <div className="grid grid-cols-2 gap-3">
          {durations.map((duration) => (
            <label
              key={duration}
              className="flex items-center gap-2 text-[12px] text-[#4D4D4D] cursor-pointer"
            >
              <input
                type="radio"
                name="duration"
                className="accent-[#A62612] h-3.5 w-3.5"
              />
              {duration}
            </label>
          ))}
        </div>
      </section>

      {/* PRICE RANGE */}
      <section className="pt-5">
        <button className="flex w-full items-center justify-between text-left">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#1A1A1A]">
            PRICE RANGE
          </span>
          <ChevronDown className="h-4 w-4 text-[#707070]" />
        </button>
        <div className="mt-4">
          <input
            type="range"
            min="0"
            max="300"
            className="w-full accent-[#A62612]"
          />
          <div className="flex justify-between text-[11px] font-medium text-[#707070] mt-1">
            <span>$0</span>
            <span>$300+</span>
          </div>
        </div>
      </section>
    </aside>
  );
}

function RentalCard({ rental }: { rental: (typeof RENTALS)[0] }) {
  return (
    <article className="group">
      <div className="relative aspect-[0.78/1] overflow-hidden rounded-[8px] bg-[#F5F0E8]">
        <Link href={`/rent/${rental.id}`} className="block h-full w-full">
          <Image
            src={rental.image}
            alt={rental.name}
            fill
            sizes="(min-width:1280px) 25vw, (min-width:640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </Link>

        <span className="absolute left-2 top-2 rounded bg-[#A62612] text-[#FBF7EE] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
          RENT
        </span>

        <button
          type="button"
          aria-label={`Save ${rental.name}`}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm"
        >
          <Heart
            size={13}
            strokeWidth={2}
            className="text-[#707070] transition hover:text-[#A62612]"
          />
        </button>
      </div>

      <div className="mt-3">
        <h2 className="line-clamp-1 text-[14px] font-medium leading-5 text-[#1A1A1A]">
          {rental.name}
        </h2>
        <p className="text-[12px] text-[#707070] font-normal leading-4 mt-0.5">
          {rental.brand}
        </p>
        <p className="mt-1 text-[14px] font-bold text-[#1A1A1A]">
          {rental.price}
        </p>
      </div>
    </article>
  );
}

function Pagination() {
  return (
    <nav className="flex items-center justify-center gap-1.5 border-t border-[#E4DDD3] py-6">
      <button className="rounded border border-[#E4DDD3] px-3 py-1.5 text-[11px] text-[#707070] transition hover:border-[#A62612] hover:text-[#A62612]">
        Previous
      </button>
      <button className="flex h-7 w-7 items-center justify-center rounded bg-[#A62612] text-[11px] font-semibold text-white">
        1
      </button>
      <button className="flex h-7 w-7 items-center justify-center rounded border border-[#E4DDD3] text-[11px] text-[#1A1A1A] hover:border-[#A62612]">
        2
      </button>
      <button className="flex h-7 w-7 items-center justify-center rounded border border-[#E4DDD3] text-[11px] text-[#1A1A1A] hover:border-[#A62612]">
        3
      </button>
      <span className="text-[11px] text-[#707070] px-1">...</span>
      <button className="flex h-7 w-7 items-center justify-center rounded border border-[#E4DDD3] text-[11px] text-[#1A1A1A] hover:border-[#A62612]">
        9
      </button>
      <button className="rounded border border-[#E4DDD3] px-3 py-1.5 text-[11px] text-[#707070] transition hover:border-[#A62612] hover:text-[#A62612]">
        Next
      </button>
    </nav>
  );
}
