import Image from "next/image";
import Link from "next/link";
import { Heart, PackageCheck, RotateCcw } from "lucide-react";
import Navbar from "@/layout/Navbar";
import Footer from "@/layout/Footer";
import HeroSection from "@/components/HeroSection";
import FAQSection from "@/components/FAQSection";

const readyToWear = [
  {
    name: "Red Cable Knit Cropped Cardigan",
    tag: "Soft wool blend",
    price: "$78",
    image:
      "https://images.unsplash.com/photo-1618333452884-5c8c7d1fb6c4?auto=format&fit=crop&w=520&q=90",
  },
  {
    name: "Cognac Suede Weekend Jacket",
    tag: "1970s western",
    price: "$112",
    image:
      "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=520&q=90",
  },
  {
    name: "Crochet Lace Buttoned Blouse",
    tag: "Romantic cotton",
    price: "$64",
    image:
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=520&q=90",
  },
  {
    name: "High Waist Wide-Leg Denim",
    tag: "Easy blue wash",
    price: "$92",
    image:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=520&q=90",
  },
];

const rentLooks = [
  {
    name: "Silk Bias Mini Dress",
    tag: "Black tie-ish",
    price: "$29/day",
    image:
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=520&q=90",
  },
  {
    name: "Belted Trench Coat",
    tag: "Weekend neutral",
    price: "$18/day",
    image:
      "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?auto=format&fit=crop&w=520&q=90",
  },
  {
    name: "Printed Wrap Dress",
    tag: "Garden party",
    price: "$24/day",
    image:
      "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=520&q=90",
  },
  {
    name: "Cream Evening Blazer",
    tag: "Sharp layer",
    price: "$22/day",
    image:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=520&q=90",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAF2E6] text-[#211714]">
      <div className="border-x-[6px] border-t-[6px] border-[#AC1B18]">
        <Navbar />
        <HeroSection />

        <ProductRail
          eyebrow="Shop the edit"
          title="Ready-To-Wear"
          href="/browse-finds"
          items={readyToWear}
        />

        <ProductRail
          eyebrow="Wear, return, repeat"
          title="Rent The Look"
          href="/rent"
          items={rentLooks}
          rental
        />

        <DonateFeature />

        <FAQSection />
      </div>

      <Footer />
    </div>
  );
}

function ProductRail({
  eyebrow,
  title,
  href,
  items,
  rental = false,
}: {
  eyebrow: string;
  title: string;
  href: string;
  items: typeof readyToWear;
  rental?: boolean;
}) {
  return (
    <section className="bg-[#FAF2E6] px-7 py-12 sm:px-12 lg:px-24">
      <div className="mx-auto max-w-[1380px]">
        <div className="mb-5 flex items-end justify-between gap-6">
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.32em] text-[#b49d89]">
              {eyebrow}
            </p>
            <h2 className="text-[32px] font-black leading-none tracking-[-0.025em] text-[#1b1110] [font-family:Georgia,serif]">
              {title}
            </h2>
          </div>
          <Link
            href={href}
            className="hidden text-[10px] font-black uppercase tracking-[0.24em] text-[#5E6B52] transition hover:text-[#AC1B18] sm:block"
          >
            See all +
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <article key={item.name} className="group">
              <div className="relative aspect-[0.86/1] overflow-hidden bg-[#f5d6a5]">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <button
                  type="button"
                  aria-label={`Save ${item.name}`}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#FAF2E6]/90 text-[#AC1B18] shadow-sm transition hover:bg-white"
                >
                  <Heart size={15} />
                </button>
                {rental && (
                  <span className="absolute left-3 top-3 rounded-full bg-[#5E6B52] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">
                    Rental
                  </span>
                )}
              </div>
              <div className="pt-3">
                <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#b49d89]">
                  {item.tag}
                </p>
                <h3 className="mt-1 min-h-[38px] text-[13px] font-black leading-5 text-[#2a1d18]">
                  {item.name}
                </h3>
                <p className="mt-1 text-[13px] font-black text-[#AC1B18]">
                  {item.price}
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
    <section className="bg-[#FAF2E6] px-7 py-10 sm:px-12 lg:px-24">
      <div className="mx-auto grid max-w-[1380px] gap-8 lg:grid-cols-[0.72fr_1fr] lg:items-center">
        <div className="relative min-h-[290px] overflow-hidden bg-[#f2c18b]">
          <Image
            src="https://images.unsplash.com/photo-1584697964358-3e14ca57658b?auto=format&fit=crop&w=900&q=90"
            alt="Folded clothing in a donation box"
            fill
            sizes="(min-width: 1024px) 520px, 100vw"
            className="object-cover"
          />
        </div>

        <div className="max-w-[560px]">
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.32em] text-[#b49d89]">
            Send it forward
          </p>
          <h2 className="text-[36px] font-black leading-[0.98] tracking-[-0.035em] text-[#1b1110] sm:text-[48px] [font-family:Georgia,serif]">
            Donate the pieces
            <br />
            you no longer{" "}
            <span className="italic text-[#AC1B18] [font-family:cursive]">
              wear
            </span>
          </h2>
          <p className="mt-5 max-w-[480px] text-[14px] font-medium leading-7 text-[#6f665c]">
            They can spark somebody else&apos;s best outfit. We resell what we
            can, donate the rest to local shelters, and responsibly recycle
            anything past its life.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/donate/shipping-label"
              className="inline-flex items-center gap-2 rounded-full bg-[#1b1110] px-6 py-3 text-[12px] font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#AC1B18]"
            >
              <PackageCheck size={15} />
              Get a shipping label
            </Link>
            <Link
              href="/donate"
              className="inline-flex items-center gap-2 rounded-full border border-[#5E6B52] px-6 py-3 text-[12px] font-black uppercase tracking-[0.12em] text-[#5E6B52] transition hover:border-[#AC1B18] hover:text-[#AC1B18]"
            >
              <RotateCcw size={15} />
              Learn more
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
