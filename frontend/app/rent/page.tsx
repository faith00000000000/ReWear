"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/layout/Footer";
import { Heart, ArrowUpRight, ChevronRight } from "lucide-react";

const CATEGORIES = [
  {
    name: "Weddings",
    icon: "💍",
    count: "84 pieces",
    image:
      "https://images.unsplash.com/photo-1595777712802-6b2ecef04908?w=600&h=400&fit=crop&auto=format",
  },
  {
    name: "Streetwear",
    icon: "🧢",
    count: "120 pieces",
    image:
      "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=600&h=400&fit=crop&auto=format",
  },
  {
    name: "Date Night",
    icon: "✨",
    count: "67 pieces",
    image:
      "https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=600&h=400&fit=crop&auto=format",
  },
  {
    name: "Festivals",
    icon: "🎪",
    count: "53 pieces",
    image:
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&h=400&fit=crop&auto=format",
  },
  {
    name: "Designer Fits",
    icon: "👔",
    count: "42 pieces",
    image:
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&h=400&fit=crop&auto=format",
  },
  {
    name: "Winter Layers",
    icon: "🧣",
    count: "78 pieces",
    image:
      "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=600&h=400&fit=crop&auto=format",
  },
];

const RENTALS = [
  {
    id: 1,
    name: "Silk Midi Slip Dress",
    price: "$18",
    deposit: "$60",
    size: "XS–L",
    avail: true,
    image:
      "https://images.unsplash.com/photo-1595777712802-6b2ecef04908?w=500&h=620&fit=crop&auto=format",
  },
  {
    id: 2,
    name: "Structured Wool Blazer",
    price: "$14",
    deposit: "$45",
    size: "S–XL",
    avail: true,
    image:
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=500&h=620&fit=crop&auto=format",
  },
  {
    id: 3,
    name: "Velvet Evening Gown",
    price: "$28",
    deposit: "$90",
    size: "XS–M",
    avail: false,
    image:
      "https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=500&h=620&fit=crop&auto=format",
  },
  {
    id: 4,
    name: "Camel Overcoat",
    price: "$16",
    deposit: "$55",
    size: "S–XXL",
    avail: true,
    image:
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500&h=620&fit=crop&auto=format",
  },
  {
    id: 5,
    name: "Retro Denim Co-ord",
    price: "$12",
    deposit: "$40",
    size: "XS–XL",
    avail: true,
    image:
      "https://images.unsplash.com/photo-1565084888279-aca607bb6c29?w=500&h=620&fit=crop&auto=format",
  },
  {
    id: 6,
    name: "Chunky Knit Cardigan",
    price: "$10",
    deposit: "$35",
    size: "One Size",
    avail: true,
    image:
      "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=500&h=620&fit=crop&auto=format",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Choose Your Fit",
    body: "Browse the catalogue, pick your piece, select your occasion.",
    icon: "👗",
  },
  {
    n: "02",
    title: "Book & Pay Deposit",
    body: "Reserve your dates and pay a small refundable deposit.",
    icon: "📅",
  },
  {
    n: "03",
    title: "Wear & Enjoy",
    body: "It arrives cleaned and pressed. Look incredible, zero guilt.",
    icon: "✨",
  },
  {
    n: "04",
    title: "Return It",
    body: "Drop it back via our prepaid label. We handle dry-cleaning.",
    icon: "📦",
  },
  {
    n: "05",
    title: "Repeat Sustainably",
    body: "Every rental keeps a garment from landfill. Keep going.",
    icon: "♻️",
  },
];

function RentalCard({ r }: { r: (typeof RENTALS)[0] }) {
  const [liked, setLiked] = useState(false);
  const [days, setDays] = useState(3);
  const total = (parseFloat(r.price.replace("$", "")) * days).toFixed(0);

  return (
    <div className="group cursor-pointer bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
      <div className="relative overflow-hidden">
        <img
          src={r.image}
          alt={r.name}
          className="w-full h-[320px] object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        {/* Overlays */}
        {!r.avail && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500 bg-white px-5 py-2.5 rounded-full shadow-sm">
              Waitlist
            </span>
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setLiked((l) => !l);
          }}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition"
        >
          <Heart
            size={14}
            className={liked ? "fill-rose-500 text-rose-500" : "text-gray-400"}
            strokeWidth={2}
          />
        </button>
        {r.avail && (
          <span className="absolute top-4 left-4 bg-green-700 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
            Available
          </span>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-bold text-gray-900 text-[15px] mb-1 leading-snug">
          {r.name}
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Size: {r.size} · Deposit: {r.deposit}
        </p>

        {/* Duration */}
        <div className="flex items-center justify-between mb-4 bg-gray-50 rounded-2xl px-4 py-3">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">
              Duration
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDays((d) => Math.max(1, d - 1))}
                className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold hover:bg-gray-300 transition"
              >
                −
              </button>
              <span className="text-sm font-bold text-gray-900 w-6 text-center">
                {days}
              </span>
              <button
                onClick={() => setDays((d) => Math.min(30, d + 1))}
                className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold hover:bg-gray-300 transition"
              >
                +
              </button>
              <span className="text-xs text-gray-400 ml-1">days</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">
              Total
            </p>
            <p className="text-xl font-bold text-gray-900">${total}</p>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mb-3">{r.price}/day</p>

        <button
          disabled={!r.avail}
          className="w-full py-3 rounded-2xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gray-900 text-white hover:bg-green-800 active:scale-[0.98]"
        >
          {r.avail ? "Rent Now" : "Join Waitlist"}
        </button>
      </div>
    </div>
  );
}

export default function RentPage() {
  return (
    <div
      className="min-h-screen bg-[#F7F3EE]"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[88vh] flex items-end bg-[#0f1a14]">
        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1595777712802-6b2ecef04908?w=1400&fit=crop&auto=format"
          alt="rent hero"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-20 w-full">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-8 h-px bg-amber-300" />
              <span className="text-xs font-bold uppercase tracking-widest text-amber-300">
                Premium Rental
              </span>
            </div>
            <h1 className="text-5xl md:text-[76px] font-bold text-white leading-[1.0] tracking-tight mb-6">
              Wear the
              <br />
              moment,
              <br />
              <em className="font-light text-white/50 not-italic">
                not the waste.
              </em>
            </h1>
            <p className="text-white/60 text-lg leading-relaxed mb-10">
              Rent designer and pre-loved pieces for any occasion. Returned,
              cleaned and ready for their next chapter.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="px-8 py-4 rounded-2xl bg-white text-gray-900 font-bold text-sm hover:bg-amber-50 transition flex items-center gap-2">
                Browse Rentals <ArrowUpRight size={15} />
              </button>
              <button className="px-8 py-4 rounded-2xl border border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition">
                How It Works
              </button>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="absolute bottom-0 right-0 hidden lg:flex gap-px">
          {[
            ["284+", "Active Listings"],
            ["48hr", "Avg Delivery"],
            ["100%", "Dry Cleaned"],
          ].map(([v, l], i) => (
            <div
              key={i}
              className="bg-white/10 backdrop-blur-md px-8 py-5 text-white"
            >
              <p className="text-2xl font-bold">{v}</p>
              <p className="text-[11px] text-white/60 mt-0.5">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-px bg-green-700" />
              <span className="text-xs font-bold uppercase tracking-widest text-green-700">
                By Occasion
              </span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900">
              What are you
              <br />
              dressing for?
            </h2>
          </div>
          <button className="hidden md:flex items-center gap-1 text-sm text-gray-400 hover:text-gray-900 transition">
            All occasions <ChevronRight size={14} />
          </button>
        </div>

        {/* 3-2-1 grid layout */}
        <div className="grid grid-cols-3 gap-4">
          {CATEGORIES.slice(0, 3).map((cat) => (
            <div
              key={cat.name}
              className="group relative cursor-pointer rounded-3xl overflow-hidden"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-52 object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl mb-1">{cat.icon}</div>
                    <h3 className="text-white font-bold text-lg">{cat.name}</h3>
                    <p className="text-white/55 text-xs">{cat.count}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <ArrowUpRight size={14} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          ))}
          {CATEGORIES.slice(3).map((cat) => (
            <div
              key={cat.name}
              className="group relative cursor-pointer rounded-3xl overflow-hidden"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-52 object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl mb-1">{cat.icon}</div>
                    <h3 className="text-white font-bold text-lg">{cat.name}</h3>
                    <p className="text-white/55 text-xs">{cat.count}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <ArrowUpRight size={14} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Rental Grid ──────────────────────────────────────────────────────── */}
      <section className="bg-[#EFE7DD] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-px bg-green-700" />
                <span className="text-xs font-bold uppercase tracking-widest text-green-700">
                  Available Now
                </span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900">Rent a Piece</h2>
            </div>
            <p className="hidden md:block text-sm text-gray-500">
              Prices are per day. Deposits fully refunded on return.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {RENTALS.map((r) => (
              <RentalCard key={r.id} r={r} />
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-6 h-px bg-green-700" />
              <span className="text-xs font-bold uppercase tracking-widest text-green-700">
                The Process
              </span>
              <span className="w-6 h-px bg-green-700" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900">
              How Renting Works
            </h2>
            <p className="text-gray-500 mt-3 max-w-md mx-auto text-sm">
              Five effortless steps between you and looking exactly how you want
              to look.
            </p>
          </div>

          {/* Horizontal step indicators */}
          <div className="hidden md:flex items-center justify-between mb-16 relative">
            <div className="absolute left-0 right-0 top-5 h-px bg-gray-200 z-0" />
            {STEPS.map((s, i) => (
              <div
                key={i}
                className="relative z-10 flex flex-col items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-lg shadow-sm">
                  {s.icon}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {s.n}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {STEPS.map((s, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 hover:shadow-md transition group border border-gray-100"
              >
                <div className="text-3xl mb-4">{s.icon}</div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-green-700 mb-2">
                  {s.n}
                </p>
                <h3 className="font-bold text-gray-900 text-sm mb-2 leading-snug">
                  {s.title}
                </h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
