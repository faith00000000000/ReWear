"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Ban,
  CalendarDays,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Droplet,
  FlameKindling,
  Heart, Info,
  Leaf,
  Lock,
  Maximize2,
  Play,
  Recycle,
  RefreshCw,
  RotateCcw,
  Ruler,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkle,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Trees,
  Truck,
  UploadCloud,
  Wind,
  X,
} from "lucide-react";
import { Product } from "../products";

/* ─── Types ──────────────────────────────────────────────── */
type MediaItem = { type: "image" | "video"; src: string; label: string };
type TryOnStep = "upload" | "processing" | "result";

/* ─── Status badge config ─────────────────────────────────── */
const STATUS_CONFIG: Record<
    string,
    { pill: string; label: string }
> = {
  THRIFT: {
    pill: "bg-[#1A130E] text-[#FAF6F0]",
    label: "THRIFT ONLY",
  },
  RENT: {
    pill: "bg-[#3D5C30] text-white",
    label: "RENT ONLY",
  },
  "THRIFT + RENT": {
    pill: "bg-[#9E2A1B] text-white",
    label: "THRIFT + RENT",
  },
};

/* ─── Care icon resolver ──────────────────────────────────── */
function resolveCareIcon(text: string) {
  const t = text.toLowerCase();
  if (t.includes("wash") || t.includes("cold")) return Droplet;
  if (t.includes("dry") || t.includes("flat") || t.includes("air")) return Wind;
  if (t.includes("steam") || t.includes("iron")) return FlameKindling;
  if (t.includes("bleach") || t.includes("not")) return Ban;
  if (t.includes("hang") || t.includes("store") || t.includes("hanger")) return RefreshCw;
  return Leaf;
}

/* ══════════════════════════════════════════════════════════
   ROOT COMPONENT
══════════════════════════════════════════════════════════ */
export default function ProductDetailClient({
                                              product,
                                              recommendations,
                                            }: {
  product: Product;
  recommendations: Product[];
}) {
  const media = useMemo<MediaItem[]>(
      () => [
        ...product.gallery.slice(0, 4).map((src, i) => ({
          type: "image" as const,
          src,
          label: `View ${i + 1}`,
        })),
        { type: "video" as const, src: product.image, label: "Video" },
      ],
      [product.gallery, product.image],
  );

  const [selectedMedia, setSelectedMedia] = useState(media[0]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [tryOnOpen, setTryOnOpen] = useState(false);
  const [thriftModalOpen, setThriftModalOpen] = useState(false);

  const isThrift = product.status === "THRIFT";
  const isRent = product.status === "RENT";
  const isHybrid = product.status === "THRIFT + RENT";
  const isRentedNow = Boolean(product.rentDuration);

  const statusConf = STATUS_CONFIG[product.status] ?? STATUS_CONFIG["THRIFT"];

  /* Filtered recommendations */
  const thriftRecs = useMemo(
      () =>
          recommendations
              .filter((p) => p.status === "THRIFT" || p.status === "THRIFT + RENT")
              .slice(0, 4),
      [recommendations],
  );
  const rentRecs = useMemo(
      () =>
          recommendations
              .filter((p) => p.status === "RENT" || p.status === "THRIFT + RENT")
              .slice(0, 4),
      [recommendations],
  );

  return (
      <div className="min-h-screen bg-[#FAF6F0] text-[#1A130E] antialiased">
        <div>

          <main className="mx-auto max-w-[1340px] px-4 pb-28 pt-4 sm:px-6 lg:px-8">

            {/* ── Breadcrumb ── */}
            <nav className="mb-6 flex flex-wrap items-center gap-1 text-[13px] text-[#6E6053]">
              <Link href="/" className="hover:text-[#9E2A1B] transition">Home</Link>
              <ChevronRight size={13} className="text-[#B5A89E]" />
              <Link href="/women" className="hover:text-[#9E2A1B] transition">Women</Link>
              <ChevronRight size={13} className="text-[#B5A89E]" />
              <Link href="/browse-finds" className="hover:text-[#9E2A1B] transition">Finds</Link>
              <ChevronRight size={13} className="text-[#B5A89E]" />
              <span className="font-semibold text-[#1A130E] truncate max-w-[200px]">{product.name}</span>
            </nav>

            {/* ══ HERO GRID ══ */}
            <section className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-start">

              {/* LEFT — Gallery */}
              <div className="space-y-2.5">
                {/* Main viewer — reduced size */}
                <div className="relative aspect-[4/5] w-full max-h-[420px] overflow-hidden rounded-2xl bg-[#F4ECE3]">
                  <Image
                      src={selectedMedia.src}
                      alt={`${product.name} – ${selectedMedia.label}`}
                      fill
                      priority
                      className="object-cover object-top"
                  />
                  {selectedMedia.type === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-[#9E2A1B] shadow-sm">
                          <Play size={18} fill="currentColor" className="ml-0.5" />
                        </div>
                      </div>
                  )}
                  <button
                      onClick={() => setLightboxOpen(true)}
                      className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full border border-[#EBE3D5] bg-white text-[#1A130E] shadow-sm transition hover:scale-105"
                  >
                    <Maximize2 size={13} />
                  </button>
                </div>

                {/* Thumbnails */}
                <div className="flex items-center gap-1.5">
                  <button className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#EBE3D5] bg-white text-[#6E6053] hover:bg-[#F4ECE3] transition">
                    <ChevronLeft size={13} />
                  </button>
                  <div className="flex flex-1 gap-2 overflow-x-auto scrollbar-none pb-0.5">
                    {media.map((item, idx) => (
                        <button
                            key={`${item.type}-${idx}`}
                            onClick={() => setSelectedMedia(item)}
                            className={`relative h-[64px] w-[64px] shrink-0 overflow-hidden rounded-xl border-2 transition ${
                                selectedMedia.label === item.label
                                    ? "border-[#9E2A1B] ring-1 ring-[#9E2A1B]/30"
                                    : "border-transparent hover:border-[#B5A89E]"
                            }`}
                        >
                          <Image src={item.src} alt={item.label} fill className="object-cover" />
                          {item.type === "video" && (
                              <span className="absolute inset-0 flex items-center justify-center bg-black/20 text-white">
                        <Play size={12} fill="currentColor" />
                      </span>
                          )}
                        </button>
                    ))}
                  </div>
                  <button className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#EBE3D5] bg-white text-[#6E6053] hover:bg-[#F4ECE3] transition">
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>

              {/* RIGHT — Info */}
              <div className="space-y-3.5">

                {/* Status badges + heart/share */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                <span className="rounded-full border border-[#D6CFC6] bg-[#F5F0E8] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#7A6A58]">
                  {product.brand}
                </span>
                    <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
                        isThrift ? "bg-[#F0EBE3] text-[#7A5C43]"
                            : isRent  ? "bg-[#E8F5EE] text-[#2E7D52]"
                                :            "bg-[#FAF0E6] text-[#9E2A1B]"
                    }`}>
                  {isThrift ? "THRIFT ONLY" : isRent ? "RENT ONLY" : "THRIFT + RENT"}
                </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex h-8 w-8 items-center justify-center rounded-full border border-[#EBE3D5] bg-white text-[#6E6053] transition hover:text-[#9E2A1B]">
                      <Heart size={15} />
                    </button>
                    <button className="flex h-8 w-8 items-center justify-center rounded-full border border-[#EBE3D5] bg-white text-[#6E6053] transition hover:text-[#9E2A1B]">
                      <Share2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h1 className="font-serif text-[32px] font-normal leading-[1.12] tracking-tight text-[#1A130E] sm:text-[36px]">
                    {product.name}
                  </h1>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-[#6E6053]">
                    <span>{product.brand}</span>
                    <span className="text-[#C4B8AE]">•</span>
                    <span>Authenticated</span>
                    <span className="text-[#C4B8AE]">•</span>
                    <span>Low Waste</span>
                  </div>
                </div>

                {/* Pricing */}
                <div className="flex flex-wrap items-baseline gap-2.5">
                  <p className="text-[24px] font-bold leading-none text-[#9E2A1B]">
                    {isRent ? `${product.rentalPrice ?? "Rs. 2,400"} / day` : product.price}
                  </p>
                  {!isRent && product.oldPrice && (
                      <>
                        <p className="text-[13px] font-normal text-[#A89E94] line-through">{product.oldPrice}</p>
                        <span className="rounded bg-[#FDECEB] px-2 py-0.5 text-[11px] font-bold text-[#9E2A1B]">60% OFF</span>
                      </>
                  )}
                </div>

                {/* ── THRIFT ONLY ── */}
                {isThrift && (
                    <div className="space-y-2.5">
                      <div className="rounded-xl border border-[#EBE3D5] bg-[#FDFAF6] p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 shrink-0 text-[#9E2A1B]">
                            <ShoppingBag size={17} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E74]">Availability</p>
                            <h4 className="mt-0.5 text-[14px] font-bold text-[#1A130E]">Only 1 left!</h4>
                            <p className="text-[12px] text-[#6E6053]">Grab it before it's gone.</p>
                          </div>
                        </div>
                        {/*<button className="w-full rounded-lg bg-[#9E2A1B] py-3 text-[13px] font-bold text-white transition hover:bg-[#832215]">*/}
                        {/*  Add to Bag*/}
                        {/*</button>*/}
                        <button
                            onClick={() => setThriftModalOpen(true)}
                            className="w-full rounded-lg bg-[#9E2A1B] py-3 text-[13px] font-bold text-white transition hover:bg-[#832215]"
                        >
                          Buy Now — {product.price}
                        </button>
                        <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#DDD5C8] bg-white py-2.5 text-[13px] font-semibold text-[#1A130E] transition hover:bg-[#FAF6F0]">
                          <Heart size={13} /> Save Item
                        </button>
                        <p className="text-center text-[11px] text-[#8C7E74]">This item is available to buy only.</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setTryOnOpen(true)}
                            className="flex items-center justify-center gap-2 rounded-lg border border-[#DDD5C8] bg-white py-2.5 text-[12px] font-semibold text-[#594E46] transition hover:bg-[#FAF6F0]"
                        >
                          <Sparkles size={13} className="text-[#9E2A1B]" /> Virtual Try-On
                        </button>
                        <button className="flex items-center justify-center gap-2 rounded-lg border border-[#DDD5C8] bg-white py-2.5 text-[12px] font-semibold text-[#594E46] transition hover:bg-[#FAF6F0]">
                          <Heart size={13} /> Save Item
                        </button>
                      </div>
                    </div>
                )}

                {/* ── RENT ONLY ── */}
                {isRent && (
                    <div className="space-y-2">
                      <div className="rounded-xl border border-[#EBE3D5] bg-[#FDFAF6] p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 shrink-0 text-[#9E2A1B]">
                            <RotateCcw size={17} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E74]">Rent Status</p>
                            <h4 className="mt-0.5 text-[14px] font-bold text-[#1A130E]">Currently on Rent</h4>
                            <p className="mt-1 text-[11px] text-[#8C7E74]">Available Again</p>
                            <p className="text-[16px] font-bold text-[#1A130E]">
                              {product.rentDuration?.split("to")[1]?.trim() ?? "12 June 2026"}
                            </p>
                          </div>
                        </div>
                        <button className="w-full rounded-lg bg-[#9E2A1B] py-3 text-[13px] font-bold text-white transition hover:bg-[#832215]">
                          Notify Me
                        </button>
                        <p className="text-center text-[11px] text-[#8C7E74]">Get notified when it's back.</p>
                      </div>

                      <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#DDD5C8] bg-white py-3 text-[13px] font-semibold text-[#9E2A1B] transition hover:bg-[#FAF6F0]">
                        <CalendarDays size={14} /> Rent This Look
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setTryOnOpen(true)}
                            className="flex items-center justify-center gap-2 rounded-lg border border-[#DDD5C8] bg-white py-2.5 text-[12px] font-semibold text-[#594E46] transition hover:bg-[#FAF6F0]"
                        >
                          <Sparkles size={13} className="text-[#9E2A1B]" /> Virtual Try-On
                        </button>
                        <button className="flex items-center justify-center gap-2 rounded-lg border border-[#DDD5C8] bg-white py-2.5 text-[12px] font-semibold text-[#594E46] transition hover:bg-[#FAF6F0]">
                          <Heart size={13} /> Save Item
                        </button>
                      </div>

                      <p className="text-center text-[11px] text-[#8C7E74]">This item is available to rent only.</p>
                    </div>
                )}

                {/* ── THRIFT + RENT ── */}
                {isHybrid && (
                    <div className="space-y-2">
                      {isRentedNow && (
                          <div className="rounded-xl border border-[#EBE3D5] bg-[#FDFAF6] p-4 space-y-2.5">
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 shrink-0 text-[#9E2A1B]">
                                <RotateCcw size={17} />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E74]">Rent Status</p>
                                <h4 className="mt-0.5 text-[14px] font-bold text-[#1A130E]">Currently on Rent</h4>
                                <p className="mt-1 text-[11px] text-[#8C7E74]">Available Again</p>
                                <p className="text-[16px] font-bold text-[#1A130E]">
                                  {product.rentDuration?.split("to")[1]?.trim() ?? "14 June 2026"}
                                </p>
                              </div>
                            </div>
                            <button className="w-full rounded-lg border border-[#DDD5C8] bg-white py-2.5 text-[12px] font-semibold text-[#9E2A1B] transition hover:bg-[#FAF6F0]">
                              Reserve This Item
                            </button>
                            <p className="text-center text-[11px] text-[#8C7E74]">Get notified when it's back.</p>
                          </div>
                      )}

                      {/*<button className="w-full rounded-lg bg-[#9E2A1B] py-3 text-[13px] font-bold text-white transition hover:bg-[#832215]">*/}
                      {/*  Buy Now — {product.price}*/}
                      {/*</button>*/}
                      <button
                          onClick={() => setThriftModalOpen(true)}
                          className="w-full rounded-lg bg-[#9E2A1B] py-3 text-[13px] font-bold text-white transition hover:bg-[#832215]"
                      >
                        Buy Now — {product.price}
                      </button>

                      <button className="w-full rounded-lg border border-[#DDD5C8] bg-white py-3 text-[13px] font-semibold text-[#9E2A1B] transition hover:bg-[#FAF6F0]">
                        Rent for {product.rentalPrice ?? "Rs 499"} / Week
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setTryOnOpen(true)}
                            className="flex items-center justify-center gap-2 rounded-lg border border-[#DDD5C8] bg-white py-2.5 text-[12px] font-semibold text-[#594E46] transition hover:bg-[#FAF6F0]"
                        >
                          <Sparkles size={13} className="text-[#9E2A1B]" /> Virtual Try-On
                        </button>
                        <button className="flex items-center justify-center gap-2 rounded-lg border border-[#DDD5C8] bg-white py-2.5 text-[12px] font-semibold text-[#594E46] transition hover:bg-[#FAF6F0]">
                          <Heart size={13} /> Save Item
                        </button>
                      </div>

                      <p className="text-center text-[11px] text-[#8C7E74]">This item is available to buy or rent.</p>
                    </div>
                )}

              </div>
            </section>

            {/* ══ TRUST STRIP — full-width under both columns ══ */}
            <div className="mt-5 grid grid-cols-5 divide-x divide-[#EBE3D5] rounded-xl border border-[#EBE3D5] bg-[#FAF8F5]">
              {[
                { icon: ShieldCheck, label: "Authenticated",    sub: "Quality checked" },
                { icon: RotateCcw,   label: "Pro Cleaned",      sub: "Hygienic & ready" },
                { icon: Leaf,        label: "Low Waste",         sub: "Better for planet" },
                { icon: Truck,       label: "Free Shipping",     sub: "Orders over Rs 2k" },
                { icon: RefreshCw,   label: "Easy Returns",      sub: "15-day returns" },
              ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex flex-col items-center gap-1 px-2 py-3 text-center">
                    <Icon size={15} className="text-[#9E2A1B]" />
                    <span className="text-[10px] font-bold leading-tight text-[#1A130E]">{label}</span>
                    <span className="text-[9px] leading-tight text-[#8C7E74]">{sub}</span>
                  </div>
              ))}
            </div>

            {/* ══ 3-COLUMN METADATA CARDS ══ */}
            <section className="mt-8 grid gap-4 md:grid-cols-3">

              {/* Details */}
              <div className="rounded-xl border border-[#EBE3D5] bg-white p-5 shadow-sm">
                <h3 className="mb-3.5 font-serif text-[18px] font-normal tracking-wide text-[#1A130E]">
                  Details
                </h3>
                <div className="space-y-2.5">
                  {[
                    { icon: Ruler,       label: "Size",      value: product.size },
                    { icon: ShieldCheck, label: "Condition", value: product.condition },
                    { icon: Sparkles,    label: "Color",     value: product.color },
                    { icon: Leaf,        label: "Material",  value: product.material },
                  ].map(({ icon: Icon, label, value }) => (
                      <div
                          key={label}
                          className="flex items-center justify-between border-b border-[#FAF6F0] pb-2.5 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center gap-2 text-[12px] text-[#6E6053]">
                          <Icon size={13} className="text-[#A67C52]" />
                          {label}
                        </div>
                        <span className="text-[12px] font-semibold text-[#1A130E]">{value}</span>
                      </div>
                  ))}
                </div>
              </div>

              {/* Care Instructions */}
              <div className="rounded-xl border border-[#EBE3D5] bg-white p-5 shadow-sm">
                <h3 className="mb-3.5 font-serif text-[18px] font-normal tracking-wide text-[#1A130E]">
                  Care Instructions
                </h3>
                <div className="space-y-3">
                  {product.care.map((item) => {
                    const Icon = resolveCareIcon(item);
                    return (
                        <div key={item} className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#E6DED1] bg-[#FCFAF7]">
                            <Icon size={14} strokeWidth={1.8} className="text-[#6E6053]" />
                          </div>
                          <span className="text-[12px] font-medium text-[#4F4338]">{item}</span>
                        </div>
                    );
                  })}
                </div>
              </div>

              {/* Sustainability */}
              <div className="rounded-xl border border-[#DCE4DA] bg-[#F3F6F2] p-5 shadow-sm">
                <h3 className="mb-3.5 flex items-center gap-2 font-serif text-[18px] font-normal tracking-wide text-[#2F4A24]">
                  <Leaf size={17} strokeWidth={1.8} className="text-[#4A6B3A]" />
                  Sustainability Impact
                </h3>
                <div className="space-y-3">
                  {[
                    { icon: Recycle,    text: "Saved 2.1 kg textile waste" },
                    { icon: Trees,      text: "Reduced 4.8 kg CO₂ emissions" },
                    { icon: BadgeCheck, text: "Extended garment life by 3+ years" },
                  ].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#BFD0B3] bg-[#F8FBF5]">
                          <Icon size={14} strokeWidth={1.8} className="text-[#5A764B]" />
                        </div>
                        <span className="text-[12px] font-medium text-[#405A35]">{text}</span>
                      </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ══ TRY BEFORE YOU BUY BANNER ══ */}
            <section className="mt-8 overflow-hidden rounded-xl border border-[#EBE3D5] bg-white shadow-sm">
              <div className="grid md:grid-cols-[1fr_1.1fr]">
                <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
                  <h3 className="font-serif text-[24px] font-normal tracking-wide text-[#1A130E] sm:text-[28px]">
                    Try Before You Buy
                  </h3>
                  <p className="mt-2 max-w-[340px] text-[13px] leading-relaxed text-[#6E6053]">
                    Upload a photo and see how this {product.name.toLowerCase()} looks on you.
                  </p>
                  <button
                      onClick={() => setTryOnOpen(true)}
                      className="mt-6 inline-flex w-fit items-center gap-2 rounded-md bg-[#9E2A1B] px-7 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#832215]"
                  >
                    Launch AI Try-On
                  </button>
                  <div className="mt-4 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-widest text-[#A6998E]">
                    <span>Fast</span>
                    <span className="h-1 w-1 rounded-full bg-[#DCD3C4]" />
                    <span>Private</span>
                    <span className="h-1 w-1 rounded-full bg-[#DCD3C4]" />
                    <span>Secure</span>
                  </div>
                </div>
                <div className="relative min-h-[220px]">
                  <Image
                      src="/images/tryon3.png"
                      alt="AI Try-On preview"
                      fill
                      priority
                      className="object-contain"
                  />
                </div>
              </div>
            </section>

            {/* ══ RECOMMENDATIONS ══ */}
            <div className="mt-12 space-y-12">

              {/* Rent the Look */}
              {(isRent || isHybrid) && (
                  <RecommendationRow
                      title="Rent the Look"
                      linkLabel="View All Rentals →"
                      items={rentRecs.length > 0 ? rentRecs : recommendations.slice(0, 4)}
                      mode="rent"
                      compact
                  />
              )}

              {/* You May Also Love */}
              {(isThrift || isHybrid) && (
                  <RecommendationRow
                      title="You May Also Love"
                      linkLabel="Explore More →"
                      items={thriftRecs.length > 0 ? thriftRecs : recommendations.slice(0, 4)}
                      mode="thrift"
                      compact
                  />
              )}
            </div>
          </main>

          {/* Lightbox */}
          {lightboxOpen && (
              <div
                  className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
                  onClick={() => setLightboxOpen(false)}
              >
                <button
                    onClick={() => setLightboxOpen(false)}
                    className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                >
                  <X size={20} />
                </button>
                <div
                    className="relative aspect-[3/4] w-full max-w-[600px] max-h-[85vh] overflow-hidden rounded-xl"
                    onClick={(e) => e.stopPropagation()}
                >
                  <Image
                      src={selectedMedia.src}
                      alt="Full view"
                      fill
                      className="object-contain"
                      quality={100}
                  />
                </div>
              </div>
          )}

          {/* Try-On Modal */}
          {tryOnOpen && (
              <TryOnModal product={product} onClose={() => setTryOnOpen(false)} />
          )}

          {thriftModalOpen && (
              <ThriftPurchaseModal product={product} onClose={() => setThriftModalOpen(false)} />
          )}
        </div>
      </div>
  );
}

/* ─── Recommendation Row ──────────────────────────────────── */
function RecommendationRow({
                             title,
                             linkLabel,
                             items,
                             mode,
                             compact = false,
                           }: {
  title: string;
  linkLabel: string;
  items: Product[];
  mode: "rent" | "thrift";
  compact?: boolean;
}) {
  const STATUS_PILL: Record<string, string> = {
    THRIFT: "bg-[#1A1A1A] text-[#FAF6F0]",
    RENT: "bg-[#3D5C30] text-white",
    "THRIFT + RENT": "bg-[#9E2A1B] text-white",
  };

  return (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-[22px] font-normal tracking-wide text-[#1A130E]">
            {title}
          </h2>
          <Link
              href="/browse-finds"
              className="text-[13px] font-bold text-[#9E2A1B] underline-offset-4 transition hover:underline"
          >
            {linkLabel}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4">
          {items.map((item) => (
              <article key={item.id} className="group">
                <div className={`relative overflow-hidden rounded-lg bg-[#F5F0E8] ${compact ? "aspect-[3/4]" : "aspect-[0.8/1]"}`}>
                  <Link href={`/browse-finds/${item.id}`} className="block h-full w-full">
                    <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(min-width:1280px) 25vw,(min-width:640px) 50vw,100vw"
                        className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  </Link>
                  <span
                      className={`absolute left-2 top-2 rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          STATUS_PILL[item.status] ?? "bg-[#1A1A1A] text-white"
                      }`}
                  >
                {item.status}
              </span>
                  <button
                      type="button"
                      aria-label={`Save ${item.name}`}
                      className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm transition hover:text-[#9E2A1B]"
                  >
                    <Heart size={12} strokeWidth={2} className="text-[#707070]" />
                  </button>
                </div>
                <Link href={`/browse-finds/${item.id}`} className="mt-2 block">
                  <h3 className="line-clamp-2 text-[13px] font-medium leading-[1.35] text-[#1A1A1A]">
                    {item.name}
                  </h3>
                  <p className="mt-0.5 text-[13px] font-semibold text-[#9E2A1B]">
                    {mode === "rent" && item.rentalPrice ? item.rentalPrice : item.price}
                  </p>
                </Link>
              </article>
          ))}
        </div>
      </section>
  );
}

/* ══════════════════════════════════════════════════════════
   VIRTUAL TRY-ON MODAL — compact, no-scroll layout
══════════════════════════════════════════════════════════ */
function TryOnModal({
                      product,
                      onClose,
                    }: {
  product: Product;
  onClose: () => void;
}) {
  const [step, setStep] = useState<TryOnStep>("upload");
  const [fileSelected, setFileSelected] = useState(false);
  const [fileName, setFileName] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  function handleGenerate() {
    if (!fileSelected) return;
    setStep("processing");
    setTimeout(() => setStep("result"), 2200);
  }

  function handleReset() {
    setStep("upload");
    setFileSelected(false);
    setFileName("");
  }

  return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm">
        <div className="relative w-full max-w-[960px] rounded-2xl border border-[#EBE3D5] bg-[#FCFAF7] shadow-2xl">

          {/* Close */}
          <button
              onClick={onClose}
              className="absolute right-3.5 top-3.5 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[#EBE3D5] bg-[#FAF6F0] text-[#594E46] transition hover:bg-[#F4ECE3]"
          >
            <X size={16} />
          </button>

          {/* Header */}
          <div className="px-6 pt-5 pb-4 text-center">
            <h2 className="font-serif text-[22px] font-normal tracking-wide text-[#1A130E]">
              Virtual Try-On
            </h2>
            <p className="mt-1 text-[13px] text-[#6E6053]">
              See how this piece looks on you before you decide.
            </p>
            <div className="mt-1 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#4A6B3A]">
              <Lock size={10} />
              Your data is private and secure.
            </div>
          </div>

          {/* ── 3-COLUMN STEP GRID ── */}
          <div className="grid gap-3 px-5 sm:grid-cols-3">

            {/* STEP 1 — Selected Item */}
            <div className="rounded-xl border border-[#EBE3D5] bg-white p-4">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[#8C7E74]">
              1. Selected Item
            </span>
              <div className="relative aspect-[3/3.2] w-full overflow-hidden rounded-lg border border-[#FAF6F0] bg-[#F5F0E8]">
                <Image src={product.image} alt={product.name} fill className="object-cover" />
                <span
                    className={`absolute left-2 top-2 rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        STATUS_CONFIG[product.status]?.pill ?? "bg-[#1A130E] text-white"
                    }`}
                >
                {product.status}
              </span>
              </div>
              <h4 className="mt-2.5 font-serif text-[14px] font-medium leading-tight text-[#1A130E]">
                {product.name}
              </h4>
              <p className="mt-0.5 text-[13px] font-bold text-[#9E2A1B]">
                {product.rentalPrice ? product.rentalPrice : product.price}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1 text-[11px] text-[#6E6053]">
                <span>{product.brand}</span>
                <span className="text-[#B5A89E]">•</span>
                <span>{product.material}</span>
                <span className="text-[#B5A89E]">•</span>
                <span>{product.color}</span>
              </div>
            </div>

            {/* STEP 2 — Upload */}
            <div className="rounded-xl border border-[#EBE3D5] bg-white p-4 flex flex-col gap-3">
              <div>
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[#8C7E74]">
                2. Upload Your Photo or Video
              </span>
                <p className="text-[11px] text-[#6E6053]">
                  Use a clear front-facing photo in good lighting.
                </p>
              </div>

              {/* Drop zone */}
              <label
                  className={`flex min-h-[130px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 text-center transition ${
                      fileSelected
                          ? "border-[#4A6B3A] bg-[#F4F8F3]"
                          : "border-[#DCD3C4] bg-[#FCFAF7] hover:border-[#9E2A1B]"
                  }`}
              >
                {fileSelected ? (
                    <>
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E4ECE0] text-[#4A6B3A]">
                        <Check size={17} />
                      </div>
                      <p className="text-[12px] font-bold text-[#1A130E]">{fileName || "photo_capture.jpg"}</p>
                      <p className="text-[10px] text-[#4A6B3A]">Uploaded successfully</p>
                    </>
                ) : (
                    <>
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#EBE3D5] bg-[#FAF6F0] text-[#8C7E74]">
                        <UploadCloud size={18} />
                      </div>
                      <p className="text-[12px] font-medium text-[#1A130E]">Upload Photo or Video</p>
                      <p className="text-[10px] text-[#8C7E74]">JPG, PNG or MP4 (max 20MB)</p>
                    </>
                )}
                <input
                    type="file"
                    accept="image/*,video/*"
                    className="sr-only"
                    onChange={(e) => {
                      const name = e.target.files?.[0]?.name;
                      if (name) { setFileSelected(true); setFileName(name); }
                    }}
                />
              </label>

              {/* Divider */}
              <div className="relative text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#EBE3D5]" />
                </div>
                <span className="relative bg-white px-3 text-[10px] font-medium uppercase tracking-wider text-[#8C7E74]">or</span>
              </div>

              <button
                  onClick={() => { setFileSelected(true); setFileName("webcam_capture.jpg"); }}
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-[#DCD3C4] bg-white py-2 text-[12px] font-semibold text-[#1A130E] transition hover:bg-[#FAF6F0]"
              >
                <Camera size={13} />
                Use Webcam
              </button>

              {/* Tips */}
              <div className="rounded-lg border border-[#EBE3D5] bg-[#FCFAF7] p-3 space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A130E]">
                  Tips for best results
                </p>
                {[
                  "Face the camera directly",
                  "Good, natural lighting",
                  "Wear form-fitting clothing",
                  "Stand straight for full view",
                ].map((tip) => (
                    <div key={tip} className="flex items-center gap-1.5 text-[11px] text-[#594E46]">
                      <Check size={11} className="shrink-0 text-[#4A6B3A]" />
                      {tip}
                    </div>
                ))}
              </div>
            </div>

            {/* STEP 3 — Result */}
            <div className="rounded-xl border border-[#EBE3D5] bg-white p-4 flex flex-col gap-2.5">
            <span className="block text-[10px] font-bold uppercase tracking-widest text-[#8C7E74]">
              3. See It On You
            </span>
              <p className="text-[11px] text-[#6E6053]">
                Our AI will generate a realistic preview in seconds.
              </p>

              {step === "upload" && (
                  <div className="flex flex-1 min-h-[200px] flex-col items-center justify-center rounded-xl border border-[#FAF6F0] bg-[#FCFAF7] p-5 text-center">
                    <Sparkle size={24} className="mb-2 animate-pulse text-[#B5A89E]" strokeWidth={1.4} />
                    <p className="max-w-[160px] text-[12px] font-medium text-[#6E6053]">
                      Upload your photo to see the AI preview.
                    </p>
                  </div>
              )}

              {step === "processing" && (
                  <div className="flex flex-1 min-h-[200px] flex-col items-center justify-center rounded-xl border border-[#EBE3D5] bg-white p-5 text-center">
                    <div className="relative mb-3 flex h-12 w-12 items-center justify-center">
                      <div className="absolute inset-0 animate-spin rounded-full border-2 border-[#9E2A1B]/20 border-t-[#9E2A1B]" />
                      <Sparkle size={14} className="text-[#9E2A1B]" />
                    </div>
                    <p className="text-[13px] font-bold text-[#1A130E]">Generating Look…</p>
                    <p className="mt-0.5 max-w-[140px] text-[10px] text-[#8C7E74]">
                      Mapping the garment to your proportions
                    </p>
                  </div>
              )}

              {step === "result" && (
                  <div className="flex flex-col gap-2">
                    <div
                        className="relative aspect-[3/3.2] w-full cursor-zoom-in overflow-hidden rounded-xl border border-[#EBE3D5]"
                        onClick={() => setPreviewOpen(true)}
                    >
                      <Image
                          src="/images/tryon3.png"
                          alt="AI Try-On result"
                          fill
                          className="object-cover"
                      />
                      <span className="absolute right-2 top-2 flex items-center gap-1 rounded-sm bg-[#1A1A1A]/70 px-2 py-0.5 text-[9px] font-bold uppercase text-white backdrop-blur-sm">
                    <Sparkles size={8} className="text-yellow-400" />
                    AI Generated
                  </span>
                      <div className="absolute bottom-2 left-2 flex gap-1.5">
                        <button className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:bg-white">
                          <ThumbsUp size={11} className="text-[#1A130E]" />
                        </button>
                        <button className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:bg-white">
                          <ThumbsDown size={11} className="text-[#1A130E]" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button className="flex items-center justify-center gap-1.5 rounded-md border border-[#DCD3C4] bg-white py-1.5 text-[11px] font-bold text-[#594E46] transition hover:bg-[#FAF6F0]">
                        <Download size={12} /> Download
                      </button>
                      <button className="flex items-center justify-center gap-1.5 rounded-md border border-[#DCD3C4] bg-white py-1.5 text-[11px] font-bold text-[#594E46] transition hover:bg-[#FAF6F0]">
                        <Share2 size={12} /> Share
                      </button>
                    </div>
                  </div>
              )}
            </div>
          </div>

          {/* ── FOOTER STRIP ── */}
          <div className="mx-5 mt-3 rounded-xl border border-[#EBE3D5] bg-white px-4 py-3">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: Lock,      title: "Private & Secure",  desc: "Your images are private and deleted after 24 hours." },
                { icon: Sparkles,  title: "AI-Powered Fit",    desc: "Advanced AI ensures realistic fit and drape." },
                { icon: RefreshCw, title: "Not satisfied?",    desc: "Try again with a different photo or angle." },
              ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-2.5">
                    <div className="mt-0.5 shrink-0 rounded-lg border border-[#EBE3D5] p-1.5 text-[#8C7E74]">
                      <Icon size={13} />
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-[#1A130E]">{title}</p>
                      <p className="mt-0.5 text-[11px] leading-snug text-[#6E6053]">{desc}</p>
                    </div>
                  </div>
              ))}
            </div>
          </div>

          {/* ── GENERATE BUTTON ── */}
          <div className="flex flex-col items-center gap-2 px-5 py-4">
            {step === "result" && (
                <button
                    onClick={handleReset}
                    className="text-[12px] font-bold text-[#9E2A1B] underline-offset-4 hover:underline"
                >
                  Try Another Style
                </button>
            )}
            <button
                onClick={handleGenerate}
                disabled={!fileSelected || step === "processing"}
                className={`w-full max-w-md rounded-md py-3 text-[13px] font-bold transition ${
                    fileSelected && step !== "processing"
                        ? "bg-[#9E2A1B] text-white hover:bg-[#832215]"
                        : "cursor-not-allowed bg-[#DCD3C4] text-[#8C7E74]"
                }`}
            >
              {step === "result"
                  ? "Regenerate Try-On"
                  : step === "processing"
                      ? "Processing…"
                      : "Generate My Try-On"}
            </button>
            <p className="text-center text-[10px] text-[#8C7E74]">
              By using this feature, you agree to our{" "}
              <span className="font-bold underline underline-offset-2 cursor-pointer">Privacy Policy</span>.
              {" "}* AI results are for reference only and may vary.
            </p>
          </div>
        </div>

        {/* Full-screen preview */}
        {previewOpen && (
            <div
                className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
                onClick={() => setPreviewOpen(false)}
            >
              <button
                  onClick={() => setPreviewOpen(false)}
                  className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#1A130E] shadow-lg transition hover:scale-105"
              >
                <X size={18} />
              </button>
              <div
                  className="relative h-[88vh] w-full max-w-[600px] overflow-hidden rounded-2xl bg-[#FCFAF7]"
                  onClick={(e) => e.stopPropagation()}
              >
                <Image
                    src="/images/tryon3.png"
                    alt="High resolution preview"
                    fill
                    priority
                    className="object-contain"
                />
              </div>
            </div>
        )}
      </div>
  );
}

function ThriftPurchaseModal({
                               product,
                               onClose,
                             }: {
  product: Product;
  onClose: () => void;
}) {
  const [added, setAdded] = useState(false);

  const rawPrice = product.price.replace(/[^0-9.]/g, "");
  const basePrice = parseFloat(rawPrice) || 0;
  const serviceFee = Math.round(basePrice * 0.059 * 100) / 100;
  const estimatedTax = Math.round(basePrice * 0.075 * 100) / 100;
  const total = basePrice + serviceFee + estimatedTax;

  const fmt = (n: number) =>
      `Rs. ${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
      <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={onClose}
      >
        <div
            className="relative w-full max-w-[420px] rounded-2xl border border-[#EBE3D5] bg-[#FCFAF7] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button
              onClick={onClose}
              className="absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-full border border-[#EBE3D5] bg-white text-[#6E6053] transition hover:bg-[#F4ECE3]"
          >
            <X size={15} />
          </button>

          {/* ── SUCCESS STATE ── */}
          {added ? (
              <div className="flex flex-col items-center px-6 py-10 text-center">
                {/* Animated checkmark circle */}
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#4A6B3A] bg-[#F0F6ED]">
                  <Check size={30} strokeWidth={2.2} className="text-[#4A6B3A]" />
                </div>
                <h2 className="font-serif text-[22px] font-normal tracking-wide text-[#1A130E]">
                  Added to Cart!
                </h2>
                <p className="mt-2 max-w-[280px] text-[13px] leading-relaxed text-[#6E6053]">
                  <span className="font-semibold text-[#1A130E]">{product.name}</span> has been
                  successfully added to your cart.
                </p>

                {/* Mini order summary */}
                <div className="mt-5 w-full rounded-xl border border-[#EBE3D5] bg-white px-4 py-3 text-left">
                  <div className="flex items-center gap-3">
                    <div className="relative h-[56px] w-[46px] shrink-0 overflow-hidden rounded-lg border border-[#EBE3D5] bg-[#F5F0E8]">
                      <Image src={product.image} alt={product.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-[13px] font-semibold text-[#1A130E]">{product.name}</p>
                      <p className="text-[11px] text-[#6E6053]">{product.brand} · Size {product.size}</p>
                    </div>
                    <p className="shrink-0 text-[14px] font-bold text-[#9E2A1B]">{fmt(total)}</p>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="mt-5 w-full space-y-2.5">
                  <Link
                      href="/cart"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#9E2A1B] py-3.5 text-[14px] font-bold text-white transition hover:bg-[#832215]"
                  >
                    <ShoppingBag size={15} />
                    Go to Cart
                  </Link>
                  <button
                      onClick={onClose}
                      className="w-full rounded-xl border border-[#DDD5C8] bg-white py-3.5 text-[14px] font-semibold text-[#9E2A1B] transition hover:bg-[#FAF6F0]"
                  >
                    Continue Shopping
                  </button>
                </div>

                <p className="mt-4 flex items-center gap-1.5 text-[11px] text-[#8C7E74]">
                  <ShieldCheck size={12} strokeWidth={1.6} className="text-[#A89E94]" />
                  Secure checkout. Your payment information is safe with us.
                </p>
              </div>
          ) : (
              /* ── DEFAULT STATE ── */
              <>
                {/* Header */}
                <div className="flex flex-col items-center px-6 pt-7 pb-5 text-center">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-[#EBE3D5] bg-white text-[#9E2A1B]">
                    <ShoppingBag size={20} strokeWidth={1.6} />
                  </div>
                  <h2 className="font-serif text-[22px] font-normal tracking-wide text-[#1A130E]">
                    Confirm Thrift Purchase
                  </h2>
                  <p className="mt-1 text-[13px] text-[#6E6053]">
                    Add this item to your cart to continue to checkout.
                  </p>
                </div>

                <div className="mx-5 border-t border-[#EBE3D5]" />

                {/* Product Row */}
                <div className="mx-5 mt-4 flex gap-3.5">
                  <div className="relative h-[90px] w-[72px] shrink-0 overflow-hidden rounded-xl border border-[#EBE3D5] bg-[#F5F0E8]">
                    <Image src={product.image} alt={product.name} fill className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col justify-center">
                    <h3 className="font-serif text-[15px] font-medium leading-snug text-[#1A130E]">
                      {product.name}
                    </h3>
                    <p className="mt-0.5 text-[12px] text-[#6E6053]">{product.brand}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px]">
                  <span className="text-[#6E6053]">
                    Condition:{" "}
                    <span className="font-semibold text-[#9E2A1B]">{product.condition}</span>
                  </span>
                      <span className="text-[#6E6053]">
                    Size:{" "}
                        <span className="font-semibold text-[#1A130E]">{product.size}</span>
                  </span>
                    </div>
                  </div>
                  <div className="shrink-0 self-center">
                    <p className="text-[16px] font-bold text-[#1A130E]">{product.price}</p>
                  </div>
                </div>

                <div className="mx-5 mt-4 border-t border-[#EBE3D5]" />

                {/* Price Breakdown */}
                <div className="mx-5 mt-3.5 space-y-2.5">
                  {[
                    { label: "Item Price",    value: fmt(basePrice),    info: false },
                    { label: "Service Fee",   value: fmt(serviceFee),   info: true  },
                    { label: "Estimated Tax", value: fmt(estimatedTax), info: true  },
                  ].map(({ label, value, info }) => (
                      <div key={label} className="flex items-center justify-between text-[13px]">
                        <div className="flex items-center gap-1 text-[#4F4338]">
                          {label}
                          {info && (
                              <button className="text-[#A89E94] transition hover:text-[#6E6053]">
                                <Info size={13} strokeWidth={1.8} />
                              </button>
                          )}
                        </div>
                        <span className="text-[#4F4338]">{value}</span>
                      </div>
                  ))}
                  <div className="flex items-center justify-between border-t border-[#EBE3D5] pt-2.5">
                    <span className="text-[14px] font-bold text-[#1A130E]">Total</span>
                    <span className="text-[17px] font-bold text-[#9E2A1B]">{fmt(total)}</span>
                  </div>
                </div>

                {/* Trust Badge */}
                <div className="mx-5 mt-4 flex items-start gap-3 rounded-xl border border-[#EBE3D5] bg-[#FAF8F5] px-4 py-3">
                  <ShieldCheck size={17} strokeWidth={1.8} className="mt-0.5 shrink-0 text-[#9E2A1B]" />
                  <div>
                    <p className="text-[12px] font-bold text-[#1A130E]">Authenticated & quality-checked</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-[#6E6053]">
                      Every item is carefully inspected for quality and authenticity.
                    </p>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="mx-5 mt-4 space-y-2.5 pb-5">
                  <button
                      onClick={() => setAdded(true)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#9E2A1B] py-3.5 text-[14px] font-bold text-white transition hover:bg-[#832215]"
                  >
                    <ShoppingBag size={15} />
                    Add to Cart
                  </button>
                  <button
                      onClick={onClose}
                      className="w-full rounded-xl border border-[#DDD5C8] bg-white py-3.5 text-[14px] font-semibold text-[#9E2A1B] transition hover:bg-[#FAF6F0]"
                  >
                    Keep Browsing
                  </button>
                </div>

                <div className="flex items-center justify-center gap-1.5 pb-4 text-[11px] text-[#8C7E74]">
                  <ShieldCheck size={12} strokeWidth={1.6} className="text-[#A89E94]" />
                  Secure checkout. Your payment information is safe with us.
                </div>
              </>
          )}
        </div>
      </div>
  );
}

