"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CircleDollarSign,
  PackageCheck,
  Truck,
  RefreshCw,
  HeartHandshake,
  Recycle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  Gift,
  Leaf,
} from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Pack Your Box",
    body: "Any clean clothing items you no longer wear. All conditions welcome — no pre-sorting or tags required.",
    icon: PackageCheck,
  },
  {
    step: "02",
    title: "Ship For Free",
    body: "Download your pre-paid USPS label, attach it to your parcel, and drop it off at any mailbox or post office.",
    icon: Truck,
  },
  {
    step: "03",
    title: "Earn & Impact",
    body: "Receive $5 store credit for each resold item plus an automated tax deduction receipt for donated pieces.",
    icon: CircleDollarSign,
  },
];

const impactStats = [
  {
    metric: "14,200+",
    label: "Garments Resold",
    description: "Given a second life with new owners",
    icon: RefreshCw,
  },
  {
    metric: "9,800",
    label: "Direct Donations",
    description: "Sent to partner shelters in NYC, LA, & Austin",
    icon: HeartHandshake,
  },
  {
    metric: "4,400 lbs",
    label: "Fabrics Recycled",
    description: "Repurposed into eco-friendly housing insulation",
    icon: Recycle,
  },
];

const faqs = [
  {
    question: "What condition should my clothing be in?",
    answer:
      "Clothing should be clean and dry. We accept items in all conditions — gently used pieces are resold or donated, while heavily worn items are responsibly recycled.",
  },
  {
    question: "How do I get my $5 store credit?",
    answer:
      "Once our team receives and scans your package, store credit is automatically deposited into your ReWear account for every resold item.",
  },
  {
    question: "Are shipping costs really 100% free?",
    answer:
      "Yes! We generate a pre-paid USPS shipping label for you. Simply print it out, attach it to any shipping box or bag, and drop it off.",
  },
];

export default function DonatePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-[#FAF2E6] text-[#211714] antialiased">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden border-b border-[#E3D7C7] bg-[#F5ECDF] pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#D1C2AF] bg-[#FAF2E6] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#5E6B52]">
              <Sparkles size={14} className="text-[#AC1B18]" />
              Circular Fashion Initiative
            </span>

            <h1 className="mt-6 font-serif text-5xl font-black leading-[1.05] tracking-tight text-[#130D0B] sm:text-6xl lg:text-7xl">
              Send your wardrobe <br />
              <span className="italic font-normal text-[#AC1B18]">
                forward.
              </span>
            </h1>

            <p className="mt-6 text-base leading-relaxed text-[#61554A] sm:text-lg">
              Clear out your closet without creating waste. We provide free
              pre-paid shipping labels, rewards for resold garments, and
              zero-landfill processing for everything else.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/donate/shipping-label"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-full bg-[#1B1110] px-8 py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#AC1B18] hover:shadow-xl focus:outline-none"
              >
                <span>Get Free Shipping Label</span>
                <ArrowRight size={16} />
              </Link>

              <button
                onClick={() => scrollToSection("how-it-works")}
                className="w-full sm:w-auto rounded-full border border-[#8C7A6B] px-8 py-4 text-sm font-bold text-[#211714] transition-colors hover:border-[#AC1B18] hover:text-[#AC1B18]"
              >
                How It Works
              </button>
            </div>
          </div>

          {/* Hero Banner Grid Showcase */}
          <div className="mt-14 grid gap-6 lg:grid-cols-12 lg:items-center">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-[#D8CFC2] shadow-xl lg:col-span-8 lg:aspect-[16/8]">
              <Image
                src="https://images.unsplash.com/photo-1584697964358-3e14ca57658b?auto=format&fit=crop&w=1200&q=90"
                alt="Stack of neatly packed clothing donations"
                fill
                sizes="(min-width: 1024px) 70vw, 100vw"
                priority
                className="object-cover"
              />
            </div>

            {/* Quick Value Card Overlay */}
            <div className="flex flex-col justify-between rounded-2xl border border-[#D8CFC2] bg-[#FFFAF2] p-8 shadow-md lg:col-span-4 lg:h-full">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#AC1B18]">
                  Your Guarantee
                </span>
                <h3 className="mt-2 font-serif text-2xl font-bold text-[#130D0B]">
                  100% Zero Landfill Commitment
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#6E6359]">
                  Every thread you send is resold, donated to local families in
                  need, or recycled into high-grade insulation.
                </p>
              </div>

              <div className="mt-8 border-t border-[#EADFD1] pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5E6B52]/10 text-[#5E6B52]">
                    <ShieldCheck size={20} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#4A4036]">
                    Tax Deductible Receipts Included
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THREE-STEP PROCESS TIMELINE */}
      <section id="how-it-works" className="scroll-mt-12 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-[#8C7A6B]">
              Simple & Hassle-Free
            </span>
            <h2 className="mt-2 font-serif text-3xl font-black text-[#130D0B] sm:text-4xl lg:text-5xl">
              Three steps to give back
            </h2>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.step}
                  className="relative flex flex-col justify-between rounded-2xl border border-[#D8CFC2] bg-[#FFFAF2] p-8 transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#AC1B18] text-white">
                        <Icon size={22} />
                      </div>
                      <span className="font-serif text-3xl font-bold text-[#D1C2AF]">
                        {step.step}
                      </span>
                    </div>

                    <h3 className="mt-6 font-serif text-2xl font-bold text-[#130D0B]">
                      {step.title}
                    </h3>

                    <p className="mt-3 text-sm leading-relaxed text-[#6E6359]">
                      {step.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. VALUE PROPOSITION BENTO */}
      <section className="border-y border-[#E3D7C7] bg-[#F5ECDF] py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-black text-[#130D0B] sm:text-4xl">
              Why donate through ReWear?
            </h2>
            <p className="mt-3 text-sm text-[#61554A] sm:text-base">
              We make decluttering rewarding for you and sustainable for the
              planet.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-[#D8CFC2] bg-[#FAF2E6] p-8">
              <div className="mb-4 text-[#AC1B18]">
                <Gift size={28} />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#130D0B]">
                Earn Store Rewards
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6E6359]">
                Get $5 in ReWear shopping credit for every resold item to
                upgrade your wardrobe ethically.
              </p>
            </div>

            <div className="rounded-2xl border border-[#D8CFC2] bg-[#FAF2E6] p-8">
              <div className="mb-4 text-[#5E6B52]">
                <Leaf size={28} />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#130D0B]">
                100% Waste Diversion
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6E6359]">
                Damaged or worn items are shredded and repurposed into
                eco-insulation and industrial materials.
              </p>
            </div>

            <div className="rounded-2xl border border-[#D8CFC2] bg-[#FAF2E6] p-8">
              <div className="mb-4 text-[#AC1B18]">
                <Truck size={28} />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#130D0B]">
                Pre-Paid Mailers
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6E6359]">
                No postage fees. Print our digital USPS shipping label and hand
                it to your standard mail carrier.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. IMPACT NUMBERS DATA GRID */}
      <section className="bg-[#AC1B18] text-white py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-[#F9DDD8]">
              Community Milestones
            </span>
            <h2 className="mt-2 font-serif text-4xl font-black leading-tight sm:text-5xl">
              Our collective impact last year
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {impactStats.map((stat, idx) => {
              const StatIcon = stat.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-white/10 p-8 backdrop-blur-sm border border-white/10"
                >
                  <div className="mb-4 inline-block rounded-xl bg-white/15 p-3 text-[#F9DDD8]">
                    <StatIcon size={24} />
                  </div>
                  <div className="font-serif text-4xl font-black text-white">
                    {stat.metric}
                  </div>
                  <div className="mt-1 text-lg font-bold text-[#F9DDD8]">
                    {stat.label}
                  </div>
                  <p className="mt-2 text-xs text-[#F9DDD8]/80">
                    {stat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. FAQ ACCORDION */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-6 sm:px-8 lg:px-12">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-[#8C7A6B]">
              Got Questions?
            </span>
            <h2 className="mt-2 font-serif text-3xl font-black text-[#130D0B] sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mt-12 space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-[#D8CFC2] bg-[#FFFAF2] overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between p-6 text-left font-serif text-lg font-bold text-[#130D0B]"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-200 text-[#8C7A6B] ${
                        isOpen ? "rotate-180 text-[#AC1B18]" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-sm leading-relaxed text-[#6E6359] border-t border-[#EADFD1]/60 pt-4">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* CTA Banner */}
          <div className="mt-16 text-center">
            <Link
              href="/donate/shipping-label"
              className="inline-flex items-center gap-3 rounded-full bg-[#1B1110] px-9 py-4 text-sm font-bold text-white shadow-md transition-all hover:bg-[#AC1B18]"
            >
              <span>Get Your Free Shipping Label</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
