import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CircleDot,
  Mail,
  Package,
  UserRound,
} from "lucide-react";
import Navbar from "@/layout/Navbar";
import Footer from "@/layout/Footer";

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
  return (
    <main className="min-h-screen bg-[#FAF2E6] text-[#211714]">
      <Navbar />

      <section className="mx-auto grid max-w-[1200px] gap-8 px-6 py-10 lg:grid-cols-[0.48fr_1fr] lg:px-8">
        <aside className="pt-1">
          <Link
            href="/donate"
            className="mb-7 inline-flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.3em] text-[#5E6B52] transition hover:text-[#AC1B18]"
          >
            <ArrowLeft size={15} strokeWidth={2.6} />
            Back
          </Link>

          <h1 className="text-[42px] font-black leading-[0.95] tracking-[-0.035em] text-[#130d0b] sm:text-[52px] [font-family:Georgia,serif]">
            Send it{" "}
            <span className="font-normal italic text-[#AC1B18] [font-family:cursive]">
              forward.
            </span>
          </h1>

          <p className="mt-7 max-w-[360px] text-[15px] font-medium leading-7 text-[#6f665c]">
            Free shipping label, $5 store credit per resold item, and a tax
            receipt for everything else. We&apos;ll never landfill what you
            send.
          </p>

          <ul className="mt-10 space-y-4 text-[14px] font-extrabold text-[#62594f]">
            <li className="flex items-center gap-3">
              <Check size={16} className="text-[#AC1B18]" />
              Pre-paid USPS label, sent to your inbox
            </li>
            <li className="flex items-center gap-3">
              <Check size={16} className="text-[#AC1B18]" />
              $5 credit per resold piece
            </li>
            <li className="flex items-center gap-3">
              <Check size={16} className="text-[#AC1B18]" />
              Tax receipt for donated items
            </li>
          </ul>
        </aside>

        <form className="border border-[#d8cfc2] bg-[#fffaf2] px-6 py-8 sm:px-10 lg:px-12">
          <div className="mb-9">
            <SectionTitle icon={UserRound} label="About you" />

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <Field label="Full name" placeholder="June Carter" />
              <Field label="Email" placeholder="you@rewear.studio" type="email" />
              <Field label="Contact no" placeholder="+1 555 0182" type="tel" />
              <Field
                label="Pickup address"
                placeholder="123 Atlantic Ave, Brooklyn, NY 11217"
              />
            </div>
          </div>

          <div className="mb-9">
            <SectionTitle icon={Package} label="What's in the box" />

            <div className="mt-6">
              <p className="mb-3 text-[12px] font-black uppercase tracking-[0.28em] text-[#7e7469]">
                Categories
              </p>
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className="rounded-full border border-[#d8cfc2] bg-[#fffaf2] px-5 py-2 text-[12px] font-black uppercase tracking-[0.22em] text-[#5f554c] transition hover:border-[#AC1B18] hover:text-[#AC1B18]"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-7 grid gap-6 md:grid-cols-2">
              <label className="block">
                <span className="mb-3 block text-[12px] font-black uppercase tracking-[0.28em] text-[#7e7469]">
                  Approx bags / boxes
                </span>
                <select className="h-[50px] w-full border border-[#d8cfc2] bg-[#FAF2E6] px-4 text-[14px] font-bold text-[#211714] outline-none transition focus:border-[#5E6B52]">
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4+</option>
                </select>
              </label>

              <Field label="Estimated weight (lbs)" placeholder="e.g. 8" />
            </div>

            <label className="mt-6 block">
              <span className="mb-3 block text-[12px] font-black uppercase tracking-[0.28em] text-[#7e7469]">
                Notes
              </span>
              <textarea
                placeholder="Anything we should know - special handling, sentimental items, etc."
                className="min-h-[86px] w-full resize-y border border-[#d8cfc2] bg-[#FAF2E6] px-4 py-4 text-[14px] font-medium text-[#211714] outline-none transition placeholder:text-[#a89e94] focus:border-[#5E6B52]"
              />
            </label>
          </div>

          <div>
            <SectionTitle icon={Mail} label="Where to send credit" />

            <div className="mt-5 grid gap-4 text-[14px] font-bold text-[#4d443c] md:grid-cols-2">
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="credit"
                  defaultChecked
                  className="h-4 w-4 accent-[#AC1B18]"
                />
                Re:Wear store credit (+10% bonus)
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="credit"
                  className="h-4 w-4 accent-[#AC1B18]"
                />
                Donate proceeds to partner shelter
              </label>
            </div>

            <button
              type="submit"
              className="mt-9 rounded-full bg-[#1b1110] px-10 py-4 text-[14px] font-black text-white shadow-sm transition hover:bg-[#AC1B18]"
            >
              Email Me a Shipping Label
            </button>
          </div>
        </form>
      </section>

      <Footer />
    </main>
  );
}

function SectionTitle({
  icon: Icon,
  label,
}: {
  icon: typeof CircleDot;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 text-[#AC1B18]">
      <Icon size={15} strokeWidth={2.4} />
      <h2 className="text-[12px] font-black uppercase tracking-[0.38em] text-[#6d6258]">
        {label}
      </h2>
    </div>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
}: {
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-3 block text-[12px] font-black uppercase tracking-[0.28em] text-[#7e7469]">
        {label}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        className="h-[50px] w-full border border-[#d8cfc2] bg-[#FAF2E6] px-4 text-[14px] font-medium text-[#211714] outline-none transition placeholder:text-[#a89e94] focus:border-[#5E6B52]"
      />
    </label>
  );
}
