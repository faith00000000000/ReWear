"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Package,
  UserRound,
  ChevronDown,
  Gift,
  Heart,
  Truck,
  ShieldCheck,
  Sparkles,
  Info,
} from "lucide-react";

const categories = [
  "Tops",
  "Bottoms",
  "Dresses",
  "Outerwear",
  "Shoes",
  "Bags",
  "Accessories",
];

export default function ShippingLabelPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [creditPreference, setCreditPreference] = useState<"store" | "donate">(
    "store",
  );
  const [boxCount, setBoxCount] = useState<string>("1 Box / Bag");

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  return (
    <main className="min-h-screen bg-[#FAF2E6] text-[#211714] antialiased">
      {/* Top Header Navigation */}
      <header className="border-b border-[#E3D7C7] bg-[#F5ECDF] py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 sm:px-8 lg:px-12">
          <Link
            href="/donate"
            className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#5E6B52] transition-colors hover:text-[#AC1B18]"
          >
            <ArrowLeft
              size={16}
              strokeWidth={2.5}
              className="transition-transform group-hover:-translate-x-1"
            />
            <span>Back to overview</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7E7469]">
            <ShieldCheck size={16} className="text-[#5E6B52]" />
            <span>Free USPS Drop-off</span>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-12 lg:py-14">
        {/* Progress Stepper Bar */}
        <div className="mb-10 mx-auto max-w-3xl">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#7E7469]">
            <span className="flex items-center gap-2 text-[#AC1B18]">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#AC1B18] text-white text-[10px]">
                1
              </span>
              Contact Info
            </span>
            <span className="h-px flex-1 bg-[#D8CFC2] mx-4" />
            <span className="flex items-center gap-2 text-[#AC1B18]">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#AC1B18] text-white text-[10px]">
                2
              </span>
              Package Details
            </span>
            <span className="h-px flex-1 bg-[#D8CFC2] mx-4" />
            <span className="flex items-center gap-2 text-[#AC1B18]">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#AC1B18] text-white text-[10px]">
                3
              </span>
              Rewards
            </span>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12 items-start">
          {/* Main Form Area */}
          <div className="lg:col-span-7">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
              {/* SECTION 1: Personal Info */}
              <div className="rounded-2xl border border-[#D8CFC2] bg-[#FFFAF2] p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-3 border-b border-[#EADFD1] pb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#AC1B18]/10 text-[#AC1B18]">
                    <UserRound size={18} />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-bold text-[#130D0B]">
                      1. Contact & Pickup
                    </h2>
                    <p className="text-xs text-[#6F665C]">
                      Where should we send your prepaid shipping label?
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <Field label="Full Name" placeholder="June Carter" required />
                  <Field
                    label="Email Address"
                    placeholder="you@rewear.studio"
                    type="email"
                    required
                  />
                  <Field
                    label="Phone Number"
                    placeholder="+1 (555) 019-2831"
                    type="tel"
                  />
                  <Field
                    label="Pickup Street Address"
                    placeholder="123 Atlantic Ave, Brooklyn, NY"
                    required
                  />
                </div>
              </div>

              {/* SECTION 2: Package Info */}
              <div className="rounded-2xl border border-[#D8CFC2] bg-[#FFFAF2] p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-3 border-b border-[#EADFD1] pb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#AC1B18]/10 text-[#AC1B18]">
                    <Package size={18} />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-bold text-[#130D0B]">
                      2. Package Contents
                    </h2>
                    <p className="text-xs text-[#6F665C]">
                      Help us prepare sorting capacity at our facilities
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-[#7E7469]">
                    Select Included Categories
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => {
                      const isSelected = selectedCategories.includes(category);
                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() => toggleCategory(category)}
                          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold tracking-wider transition-all ${
                            isSelected
                              ? "bg-[#1B1110] text-white shadow-sm"
                              : "border border-[#D8CFC2] bg-[#FAF2E6] text-[#5F554C] hover:border-[#AC1B18]"
                          }`}
                        >
                          {isSelected && <Check size={12} strokeWidth={3} />}
                          {category}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#7E7469]">
                      Package Count
                    </label>
                    <div className="relative">
                      <select
                        value={boxCount}
                        onChange={(e) => setBoxCount(e.target.value)}
                        className="h-12 w-full appearance-none rounded-xl border border-[#D8CFC2] bg-[#FAF2E6] px-4 text-sm font-semibold text-[#211714] focus:border-[#AC1B18] focus:outline-none"
                      >
                        <option>1 Box / Bag</option>
                        <option>2 Boxes / Bags</option>
                        <option>3 Boxes / Bags</option>
                        <option>4+ Boxes / Bags</option>
                      </select>
                      <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#7E7469]"
                      />
                    </div>
                  </div>

                  <Field
                    label="Est. Total Weight (lbs)"
                    placeholder="e.g. 8"
                    type="number"
                  />
                </div>

                <div className="mt-5">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#7E7469]">
                    Special Notes or Brands (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="E.g., Vintage jackets included, or specific care instructions..."
                    className="w-full rounded-xl border border-[#D8CFC2] bg-[#FAF2E6] p-3 text-sm font-medium text-[#211714] placeholder:text-[#A89E94] focus:border-[#AC1B18] focus:outline-none"
                  />
                </div>
              </div>

              {/* SECTION 3: Reward Choice */}
              <div className="rounded-2xl border border-[#D8CFC2] bg-[#FFFAF2] p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-3 border-b border-[#EADFD1] pb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#AC1B18]/10 text-[#AC1B18]">
                    <Gift size={18} />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-bold text-[#130D0B]">
                      3. Credit Preference
                    </h2>
                    <p className="text-xs text-[#6F665C]">
                      Choose where your earnings go when items sell
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div
                    onClick={() => setCreditPreference("store")}
                    className={`relative cursor-pointer rounded-xl border p-5 transition-all ${
                      creditPreference === "store"
                        ? "border-[#AC1B18] bg-[#AC1B18]/5 ring-1 ring-[#AC1B18]"
                        : "border-[#D8CFC2] bg-[#FAF2E6] hover:border-[#A89E94]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#211714]">
                        Store Credit
                      </span>
                      <span className="rounded-full bg-[#5E6B52] px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                        +10% Bonus
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-[#6F665C]">
                      Earn $5 per resold item directly credited to your ReWear
                      account.
                    </p>
                  </div>

                  <div
                    onClick={() => setCreditPreference("donate")}
                    className={`relative cursor-pointer rounded-xl border p-5 transition-all ${
                      creditPreference === "donate"
                        ? "border-[#AC1B18] bg-[#AC1B18]/5 ring-1 ring-[#AC1B18]"
                        : "border-[#D8CFC2] bg-[#FAF2E6] hover:border-[#A89E94]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#211714]">
                        Shelter Donation
                      </span>
                      <Heart size={16} className="text-[#AC1B18]" />
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-[#6F665C]">
                      Direct proceeds to partner women and family shelters
                      nationwide.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-[#1B1110] px-8 py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#AC1B18]"
                >
                  <Truck size={18} />
                  <span>Generate Free Shipping Label</span>
                </button>
              </div>
            </form>
          </div>

          {/* Sticky Summary Sidebar */}
          <aside className="lg:sticky lg:top-8 lg:col-span-5">
            <div className="rounded-2xl border border-[#D8CFC2] bg-[#F5ECDF] p-6 sm:p-8 shadow-sm">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#AC1B18]">
                <Sparkles size={14} />
                Shipment Summary
              </span>

              <h3 className="mt-2 font-serif text-2xl font-black text-[#130D0B]">
                Zero-Cost Guarantee
              </h3>

              <div className="mt-6 space-y-4 border-t border-[#E3D7C7] pt-6 text-sm">
                <div className="flex justify-between text-[#52483E]">
                  <span>USPS Postage</span>
                  <span className="font-bold text-[#5E6B52]">100% Free</span>
                </div>
                <div className="flex justify-between text-[#52483E]">
                  <span>Estimated Box Count</span>
                  <span className="font-bold text-[#211714]">{boxCount}</span>
                </div>
                <div className="flex justify-between text-[#52483E]">
                  <span>Selected Categories</span>
                  <span className="font-bold text-[#211714]">
                    {selectedCategories.length > 0
                      ? `${selectedCategories.length} selected`
                      : "None"}
                  </span>
                </div>
                <div className="flex justify-between text-[#52483E]">
                  <span>Tax Deduction Receipt</span>
                  <span className="font-bold text-[#211714]">Included</span>
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-[#FAF2E6] p-4 border border-[#E3D7C7]">
                <div className="flex gap-3">
                  <Info size={18} className="text-[#AC1B18] shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed text-[#6F665C]">
                    Once submitted, your digital label will be sent instantly to
                    your email inbox along with drop-off instructions.
                  </p>
                </div>
              </div>

              <ul className="mt-6 space-y-3 text-xs font-semibold text-[#52483E]">
                <li className="flex items-center gap-2.5">
                  <Check size={14} className="text-[#5E6B52]" strokeWidth={3} />
                  <span>No printer? Drop off code scanned at post office</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={14} className="text-[#5E6B52]" strokeWidth={3} />
                  <span>$5 credit awarded per eligible resold piece</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={14} className="text-[#5E6B52]" strokeWidth={3} />
                  <span>Zero textiles sent to landfills guarantee</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#7E7469]">
        {label} {required && <span className="text-[#AC1B18]">*</span>}
      </span>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        className="h-12 w-full rounded-xl border border-[#D8CFC2] bg-[#FAF2E6] px-4 text-sm font-medium text-[#211714] placeholder:text-[#A89E94] focus:border-[#AC1B18] focus:outline-none"
      />
    </label>
  );
}
