"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/layout/Footer";
import { ArrowUpRight } from "lucide-react";

const COLLECTIONS = [
  {
    id: 1,
    name: "Dark Academia",
    tag: "52 pieces",
    desc: "Structured, scholarly silhouettes in earthy tones. Tweed, corduroy, and the smell of old libraries.",
    image:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=700&h=900&fit=crop&auto=format",
    color: "#2C2416",
  },
  {
    id: 2,
    name: "Vintage Y2K",
    tag: "38 pieces",
    desc: "Butterfly clips, metallics, and low-rise nostalgia from the early 2000s that refuses to stay in the past.",
    image:
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=700&h=900&fit=crop&auto=format",
    color: "#6B2737",
  },
  {
    id: 3,
    name: "Winter Burgundy",
    tag: "29 pieces",
    desc: "Velvet, cashmere and deep wine tones for the months when warmth is everything.",
    image:
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=700&h=900&fit=crop&auto=format",
    color: "#7D1A2E",
  },
  {
    id: 4,
    name: "Retro Denim",
    tag: "44 pieces",
    desc: "Washed, patched, and loved. Denim that has lived a thousand lives — and is ready for a thousand more.",
    image:
      "https://images.unsplash.com/photo-1565084888279-aca607bb6c29?w=700&h=900&fit=crop&auto=format",
    color: "#1A3A5C",
  },
  {
    id: 5,
    name: "Cottagecore",
    tag: "31 pieces",
    desc: "Floral prints, linen blouses and pastoral romanticism. Dressing like you live in a field of wildflowers.",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=700&h=900&fit=crop&auto=format",
    color: "#4A6741",
  },
  {
    id: 6,
    name: "Minimal Earth",
    tag: "26 pieces",
    desc: "Sand, clay, and stone. Understated luxury built on restraint, quality and the beauty of doing less.",
    image:
      "https://images.unsplash.com/photo-1583496661160-fb5218b5f99e?w=700&h=900&fit=crop&auto=format",
    color: "#6B5B45",
  },
];

const LOOKBOOK = [
  {
    n: "The Quiet Dresser",
    sub: "Minimal earth tones, layered with intention",
    img: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&h=800&fit=crop&auto=format",
    label: "01",
  },
  {
    n: "Velvet Hour",
    sub: "Burgundy after dark — statement without noise",
    img: "https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=600&h=800&fit=crop&auto=format",
    label: "02",
  },
  {
    n: "Archive Edit",
    sub: "Pulled from the archives, worn right now",
    img: "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=600&h=800&fit=crop&auto=format",
    label: "03",
  },
];

export default function CollectionsPage() {
  return (
    <div
      className="min-h-screen bg-[#F7F3EE]"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <Navbar />

      {/* ── Cinematic Hero ───────────────────────────────────────────────────── */}
      <section className="relative h-[92vh] min-h-[600px] overflow-hidden bg-[#111]">
        <img
          src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1600&fit=crop&auto=format"
          alt="hero"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        {/* Gradient overlay — stronger bottom fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />

        {/* Content — bottom-left editorial layout */}
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-6 pb-16">
          <div className="flex items-end justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-px bg-amber-300" />
                <span className="text-xs font-bold uppercase tracking-widest text-amber-300">
                  Editorial Season
                </span>
              </div>
              <h1 className="text-6xl md:text-[88px] font-bold text-white leading-none tracking-tight mb-4">
                Collections
                <br />
                <em className="font-light text-white/60 not-italic">
                  With Character.
                </em>
              </h1>
              <p className="text-white/60 text-lg max-w-md leading-relaxed">
                Not categories. Worlds. Each collection is a mood curated with a
                sustainability lens.
              </p>
            </div>
            <div className="hidden md:flex flex-col items-end gap-2 pb-2">
              <span className="text-white/40 text-xs uppercase tracking-widest">
                6 Collections
              </span>
              <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-gray-900 font-semibold text-sm hover:bg-amber-100 transition">
                Explore All <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Season Label ─────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-px bg-green-700" />
            <span className="text-xs font-bold uppercase tracking-widest text-green-700">
              Curated Edit
            </span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900">
            This Season&apos;s Archive
          </h2>
        </div>
        <p className="hidden md:block text-sm text-gray-400 max-w-xs text-right leading-relaxed">
          Handpicked by our editorial team with an eye on circular fashion.
        </p>
      </div>

      {/* ── Collections Grid ─────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pb-24 pt-10">
        {/* Large featured — first two */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          {COLLECTIONS.slice(0, 2).map((col) => (
            <div
              key={col.id}
              className="group relative cursor-pointer rounded-3xl overflow-hidden"
            >
              <img
                src={col.image}
                alt={col.name}
                className="w-full h-[560px] object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div
                className="absolute inset-0 transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                style={{ backgroundColor: col.color + "44" }}
              />
              <div className="absolute top-5 right-5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/70 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  {col.tag}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h3 className="text-3xl font-bold text-white mb-2">
                  {col.name}
                </h3>
                <p className="text-white/65 text-sm leading-relaxed mb-5 max-w-sm">
                  {col.desc}
                </p>
                <span className="inline-flex items-center gap-2 text-xs font-bold text-white border border-white/30 px-5 py-2.5 rounded-full group-hover:bg-white group-hover:text-gray-900 transition duration-300">
                  Explore <ArrowUpRight size={12} />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 4-column grid — remaining */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {COLLECTIONS.slice(2).map((col) => (
            <div
              key={col.id}
              className="group relative cursor-pointer rounded-3xl overflow-hidden"
            >
              <img
                src={col.image}
                alt={col.name}
                className="w-full h-[360px] object-cover transition-transform duration-700 group-hover:scale-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ backgroundColor: col.color + "55" }}
              />
              <div className="absolute top-4 right-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/70 bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  {col.tag}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="text-lg font-bold text-white mb-1">
                  {col.name}
                </h3>
                <p className="text-white/60 text-xs leading-relaxed line-clamp-2">
                  {col.desc}
                </p>
                <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-[11px] font-bold text-white flex items-center gap-1">
                    Explore <ArrowUpRight size={10} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Lookbook ─────────────────────────────────────────────────────────── */}
      <section className="bg-[#EFE7DD] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-14">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-px bg-green-700" />
                <span className="text-xs font-bold uppercase tracking-widest text-green-700">
                  Styled Edits
                </span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900">
                Featured Lookbook
              </h2>
              <p className="text-gray-500 mt-2 text-sm">
                Magazine-quality fits built entirely from pre-loved pieces.
              </p>
            </div>
            <button className="hidden md:flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition font-medium">
              View all looks <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {LOOKBOOK.map((look, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-3xl">
                  <img
                    src={look.img}
                    alt={look.n}
                    className="w-full h-[520px] object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Label tag top-left */}
                  <div className="absolute top-5 left-5 flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      Lookbook {look.label}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent rounded-b-3xl p-7">
                    <p className="text-white font-bold text-xl leading-tight">
                      {look.n}
                    </p>
                    <p className="text-white/65 text-xs mt-1">{look.sub}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Curator Notes ─────────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="w-6 h-px bg-green-700" />
                <span className="text-xs font-bold uppercase tracking-widest text-green-700">
                  Curator Notes
                </span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 leading-tight mb-6">
                Why These
                <br />
                Pieces Matter.
              </h2>
              <p className="text-gray-500 leading-relaxed mb-8 text-[15px]">
                Every collection starts with a question: what does it mean to
                dress well when the planet is asking us to slow down? We believe
                style and sustainability aren&apos;t at odds — the most
                interesting wardrobes are built slowly, with intention, and
                almost always, with history attached.
              </p>
              <div className="space-y-4">
                {[
                  {
                    title: "Provenance",
                    body: "Every item has a past. We celebrate it.",
                    icon: "🏺",
                  },
                  {
                    title: "Longevity",
                    body: "Built to last another decade, not another season.",
                    icon: "♾️",
                  },
                  {
                    title: "Community",
                    body: "Sourced from sellers who believe in circular fashion.",
                    icon: "🤝",
                  },
                ].map((n, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-4 rounded-2xl hover:bg-[#EFE7DD] transition group cursor-pointer"
                  >
                    <span className="text-2xl flex-shrink-0 mt-0.5">
                      {n.icon}
                    </span>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">
                        {n.title}
                      </p>
                      <p className="text-gray-500 text-sm mt-0.5">{n.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Pull quote */}
            <div className="bg-[#1B1B1B] rounded-3xl p-12 text-white">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-8">
                Editorial POV
              </p>
              <blockquote className="text-2xl font-light leading-relaxed text-white/80 mb-10">
                &ldquo;The best wardrobes aren&apos;t bought — they&apos;re
                built, piece by piece, story by story.&rdquo;
              </blockquote>
              <div className="border-t border-white/10 pt-6">
                <p className="text-sm font-semibold text-white">
                  RE:WEAR Editorial Team
                </p>
                <p className="text-xs text-white/40 mt-1">
                  Spring 2026 Curatorial Note
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
