"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  Heart,
  Leaf,
  Play,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  Upload,
  X,
} from "lucide-react";
import Navbar from "@/layout/Navbar";
import Footer from "@/layout/Footer";
import { Product, Status } from "../products";

type MediaItem = {
  type: "image" | "video";
  src: string;
  label: string;
};

const statusClass: Record<Status, string> = {
  THRIFT: "bg-[#AC1B18] text-[#FAF2E6]",
  RENT: "bg-[#5E6B52] text-white",
  "THRIFT + RENT": "bg-[#211714] text-[#FAF2E6]",
};

export default function ProductDetailClient({
  product,
  recommendations,
}: {
  product: Product;
  recommendations: Product[];
}) {
  const media = useMemo<MediaItem[]>(
    () => [
      ...product.gallery.slice(0, 4).map((src, index) => ({
        type: "image" as const,
        src,
        label: `View ${index + 1}`,
      })),
      {
        type: "video",
        src: product.image,
        label: "Video",
      },
    ],
    [product.gallery, product.image],
  );

  const [selectedMedia, setSelectedMedia] = useState(media[0]);
  const [tryOnOpen, setTryOnOpen] = useState(false);

  const canThrift = product.status === "THRIFT" || product.status === "THRIFT + RENT";
  const canRent = product.status === "RENT" || product.status === "THRIFT + RENT";
  const isRentedNow = Boolean(product.rentDuration);

  return (
    <div className="min-h-screen bg-[#FAF2E6] text-[#211714]">
      <div className="border-x-[6px] border-t-[6px] border-[#AC1B18]">
        <Navbar />

        <main className="mx-auto max-w-[1280px] px-6 pb-20 pt-9 sm:px-10 lg:px-12">
          <Link
            href="/browse-finds"
            className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.28em] text-[#81776c] transition hover:text-[#AC1B18]"
          >
            <ChevronLeft size={15} />
            Back to thrift
          </Link>

          <section className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,0.98fr)_minmax(360px,0.72fr)] lg:items-start">
            <div>
              <div className="relative h-[440px] overflow-hidden border border-[#eadcca] bg-[#f4d7a7] sm:h-[520px] lg:h-[590px]">
                <Image
                  src={selectedMedia.src}
                  alt={`${product.name} ${selectedMedia.label}`}
                  fill
                  sizes="(min-width: 1024px) 720px, 100vw"
                  priority
                  className="object-cover"
                />
                {selectedMedia.type === "video" ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#211714]/18">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FAF2E6]/95 text-[#AC1B18] shadow-xl">
                      <Play size={32} fill="currentColor" />
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="mt-4 grid grid-cols-5 gap-3">
                {media.map((item) => (
                  <button
                    key={`${item.type}-${item.label}`}
                    type="button"
                    onClick={() => setSelectedMedia(item)}
                    className={`relative aspect-square overflow-hidden border bg-[#f4d7a7] transition ${
                      selectedMedia.label === item.label
                        ? "border-[#AC1B18] ring-2 ring-[#AC1B18]/20"
                        : "border-[#d8cab8] hover:border-[#5E6B52]"
                    }`}
                    aria-label={`Show ${item.label}`}
                  >
                    <Image
                      src={item.src}
                      alt={`${product.name} ${item.label}`}
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                    {item.type === "video" ? (
                      <span className="absolute inset-0 flex items-center justify-center bg-[#211714]/24 text-white">
                        <Play size={22} fill="currentColor" />
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            <aside className="lg:sticky lg:top-24">
              <p className="text-[12px] font-black uppercase tracking-[0.42em] text-[#9f9286]">
                {product.brand}
              </p>
              <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
                <h1 className="max-w-[520px] text-[42px] font-black leading-[0.95] tracking-[-0.035em] text-[#1b1110] sm:text-[54px] [font-family:Georgia,serif]">
                  {product.name}
                </h1>
                <span
                  className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] ${statusClass[product.status]}`}
                >
                  {product.status}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap items-end gap-3">
                <p className="text-[30px] font-black leading-none text-[#AC1B18]">
                  {product.price}
                </p>
                {product.oldPrice ? (
                  <p className="text-[14px] font-bold text-[#9f9286] line-through">
                    {product.oldPrice}
                  </p>
                ) : null}
                {canRent ? (
                  <p className="text-[13px] font-black uppercase tracking-[0.12em] text-[#5E6B52]">
                    Rent {product.rentalPrice}
                  </p>
                ) : null}
              </div>

              <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-5 text-[13px]">
                <InfoLabel label="Size" value={product.size} />
                <InfoLabel label="Condition" value={product.condition} />
                <InfoLabel label="Color" value={product.color} />
                <InfoLabel label="Material" value={product.material} />
              </dl>

              {isRentedNow ? (
                <div className="mt-7 border border-[#d7cbbb] bg-[#fffaf2] p-5">
                  <p className="flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.16em] text-[#AC1B18]">
                    <CalendarDays size={16} />
                    Currently rented
                  </p>
                  <p className="mt-3 text-[13px] font-medium leading-6 text-[#6f665c]">
                    This clothing item is under rent from {product.rentDuration}.
                    After this period, people can thrift or rent it again based on
                    its availability status.
                  </p>
                </div>
              ) : null}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {canThrift ? (
                  <button className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#211714] px-6 text-[13px] font-black text-[#FAF2E6] transition hover:bg-[#AC1B18]">
                    <ShoppingBag size={17} />
                    Add to Cart
                  </button>
                ) : null}
                {canRent ? (
                  <button className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#5E6B52] px-6 text-[13px] font-black text-white transition hover:bg-[#AC1B18]">
                    <CalendarDays size={17} />
                    {isRentedNow ? "Join Rent Waitlist" : "Rent This"}
                  </button>
                ) : null}
                <button
                  type="button"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-[#AC1B18] px-6 text-[13px] font-black text-[#AC1B18] transition hover:bg-[#AC1B18] hover:text-[#FAF2E6]"
                  onClick={() => setTryOnOpen(true)}
                >
                  <Sparkles size={17} />
                  Virtual Try-On
                </button>
              </div>

              <button className="mt-4 inline-flex items-center gap-2 text-[13px] font-black text-[#6f665c] transition hover:text-[#AC1B18]">
                <Heart size={17} />
                Save this find
              </button>

              <div className="mt-8 grid grid-cols-3 gap-2">
                <TrustBadge icon={Truck} label="Free Shipping" />
                <TrustBadge icon={ShieldCheck} label="Authenticated" />
                <TrustBadge icon={Leaf} label="Low Waste" />
              </div>

              <DetailSection title="The Story">{product.story}</DetailSection>

              <section className="mt-7 border-t border-[#d7cbbb] pt-6">
                <h2 className="flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.28em] text-[#81776c]">
                  <Ruler size={15} className="text-[#AC1B18]" />
                  Measurements
                </h2>
                <dl className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2 text-[13px] font-semibold text-[#5d544b]">
                  <InfoLabel label="Chest" value={product.measurements.chest} />
                  <InfoLabel label="Length" value={product.measurements.length} />
                  <InfoLabel label="Sleeve" value={product.measurements.sleeve} />
                  <InfoLabel label="Shoulder" value={product.measurements.shoulder} />
                </dl>
              </section>

              <section className="mt-7 border-t border-[#d7cbbb] pt-6">
                <h2 className="text-[12px] font-black uppercase tracking-[0.28em] text-[#81776c]">
                  Care
                </h2>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-[13px] font-semibold text-[#5d544b]">
                  {product.care.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            </aside>
          </section>

          <section className="mt-24">
            <h2 className="text-[36px] font-black tracking-[-0.03em] text-[#1b1110] [font-family:Georgia,serif]">
              You may also love
            </h2>
            <div className="mt-7 grid gap-6 md:grid-cols-3">
              {recommendations.map((item) => (
                <Link
                  key={item.id}
                  href={`/browse-finds/${item.id}`}
                  className="group block"
                >
                  <article>
                    <div className="relative aspect-[0.86/1] overflow-hidden bg-[#f4d7a7]">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                    <p className="mt-4 text-[12px] font-black uppercase tracking-[0.28em] text-[#9f9286]">
                      {item.brand}
                    </p>
                    <h3 className="mt-2 text-[18px] font-black leading-6 [font-family:Georgia,serif]">
                      {item.name}
                    </h3>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-[20px] font-black text-[#AC1B18]">
                        {item.price}
                      </p>
                      <span className="text-[11px] font-black uppercase tracking-[0.24em] text-[#5E6B52]">
                        View
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        </main>
      </div>

      <Footer />

      {tryOnOpen ? (
        <TryOnModal product={product} onClose={() => setTryOnOpen(false)} />
      ) : null}
    </div>
  );
}

function InfoLabel({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9f9286]">
        {label}
      </dt>
      <dd className="mt-1 font-bold text-[#211714]">{value}</dd>
    </div>
  );
}

function TrustBadge({
  icon: Icon,
  label,
}: {
  icon: typeof Truck;
  label: string;
}) {
  return (
    <div className="flex min-h-16 flex-col items-center justify-center gap-2 border border-[#d7cbbb] bg-[#fffaf2] px-2 text-center">
      <Icon size={16} className="text-[#AC1B18]" />
      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#81776c]">
        {label}
      </span>
    </div>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8 border-t border-[#d7cbbb] pt-6">
      <h2 className="text-[12px] font-black uppercase tracking-[0.28em] text-[#81776c]">
        {title}
      </h2>
      <p className="mt-4 text-[14px] font-medium leading-6 text-[#6f665c]">
        {children}
      </p>
    </section>
  );
}

function TryOnModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<"photo" | "video">("photo");
  const [fileName, setFileName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [generated, setGenerated] = useState(false);

  function handleGenerate() {
    setProcessing(true);
    setGenerated(false);
    window.setTimeout(() => {
      setProcessing(false);
      setGenerated(true);
    }, 1200);
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#211714]/55 px-4 py-6">
      <section className="relative max-h-[92vh] w-full max-w-[980px] overflow-y-auto bg-[#FAF2E6] shadow-2xl">
        <button
          type="button"
          aria-label="Close virtual try-on"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#211714] text-white transition hover:bg-[#AC1B18]"
        >
          <X size={19} />
        </button>

        <div className="grid gap-0 lg:grid-cols-[0.78fr_1fr]">
          <div className="relative min-h-[360px] bg-[#f4d7a7]">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="420px"
              className="object-cover"
            />
          </div>

          <div className="px-6 py-8 sm:px-8">
            <p className="text-[11px] font-black uppercase tracking-[0.34em] text-[#AC1B18]">
              Virtual Try-On
            </p>
            <h2 className="mt-3 text-[34px] font-black leading-none tracking-[-0.03em] [font-family:Georgia,serif]">
              See {product.name} on you
            </h2>

            <div className="mt-6 inline-grid grid-cols-2 overflow-hidden rounded-full border border-[#d7cbbb] bg-[#fffaf2] p-1">
              {(["photo", "video"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMode(item)}
                  className={`rounded-full px-5 py-2 text-[12px] font-black uppercase tracking-[0.14em] transition ${
                    mode === item
                      ? "bg-[#211714] text-[#FAF2E6]"
                      : "text-[#6f665c] hover:text-[#AC1B18]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <label className="mt-7 flex min-h-40 cursor-pointer flex-col items-center justify-center border-2 border-dashed border-[#d7cbbb] bg-[#fffaf2] px-5 text-center transition hover:border-[#AC1B18]">
              <Upload size={28} className="text-[#5E6B52]" />
              <span className="mt-3 text-[13px] font-black text-[#211714]">
                Upload your {mode}
              </span>
              <span className="mt-1 text-[12px] font-medium text-[#81776c]">
                {fileName || "Choose a clear full-body photo or short video"}
              </span>
              <input
                type="file"
                accept={mode === "photo" ? "image/*" : "video/*"}
                className="sr-only"
                onChange={(event) =>
                  setFileName(event.target.files?.[0]?.name ?? "")
                }
              />
            </label>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={!fileName || processing}
              className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#AC1B18] px-6 text-[13px] font-black text-[#FAF2E6] transition hover:bg-[#211714] disabled:cursor-not-allowed disabled:bg-[#cdbfaf] disabled:text-[#6f665c]"
            >
              <Sparkles size={17} />
              {processing ? "Processing..." : `Generate Try-On ${mode}`}
            </button>

            <div className="mt-6 min-h-24 border border-[#d7cbbb] bg-[#fffaf2] p-4">
              <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[#81776c]">
                Preview
              </p>
              <p className="mt-2 text-[13px] font-medium leading-6 text-[#6f665c]">
                {generated
                  ? `Your ${mode} try-on preview is ready for review.`
                  : "Upload your media and generate a preview to compare fit, length, and styling."}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
