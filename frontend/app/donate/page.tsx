import Image from "next/image";
import Link from "next/link";
import { CircleDollarSign, PackageCheck, Truck } from "lucide-react";

const steps = [
  {
    title: "Pack a box",
    body: "Anything you no longer wear - clean, no damage required.",
    icon: PackageCheck,
  },
  {
    title: "Ship free",
    body: "Print our pre-paid USPS label and drop it at any mailbox.",
    icon: Truck,
  },
  {
    title: "Earn credit",
    body: "Get $5 store credit per mailed item, plus a tax receipt.",
    icon: CircleDollarSign,
  },
];

export default function DonatePage() {
  return (
    <main className="min-h-screen bg-[#FAF2E6] text-[#231914]">

      <section className="mx-auto max-w-[1180px] px-6 pb-16 pt-10 sm:px-8 lg:px-9">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_0.96fr] lg:gap-16">
          <div className="pt-14 sm:pt-20 lg:pt-16">
            <p className="mb-7 text-[11px] font-semibold uppercase tracking-[0.42em] text-[#b8aa9a]">
              Give clothes a second life
            </p>

            <h1 className="max-w-[560px] text-[48px] font-black leading-[0.94] tracking-[-0.03em] text-[#140c09] sm:text-[64px] lg:text-[73px]">
              <span className="[font-family:Georgia,serif]">Send it </span>
              <span className="font-normal italic tracking-[-0.05em] text-[#AC1B18] [font-family:cursive]">
                forward.
              </span>
            </h1>

            <p className="mt-7 max-w-[470px] text-[14px] leading-6 text-[#776d63]">
              Free pre-paid shipping label. We resell what we can on ReWear,
              donate the rest to local shelters, and responsibly recycle
              anything past its life - no landfill, ever.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/donate/shipping-label"
                className="rounded-full bg-[#1b1110] px-7 py-3 text-[13px] font-extrabold text-white shadow-sm transition hover:bg-[#AC1B18]"
              >
                Get a Shipping Label
              </Link>
              <button className="rounded-full border-2 border-[#5E6B52] px-7 py-[10px] text-[13px] font-extrabold text-[#5E6B52] transition hover:border-[#AC1B18] hover:text-[#AC1B18]">
                How it works
              </button>
            </div>
          </div>

          <div className="relative min-h-[270px] overflow-hidden border border-[#eadfD1] bg-[#df9861] shadow-[0_1px_0_rgba(0,0,0,0.08)] sm:min-h-[390px] lg:min-h-[405px]">
            <Image
              src="https://images.unsplash.com/photo-1584697964358-3e14ca57658b?auto=format&fit=crop&w=1200&q=90"
              alt="Folded clothes stacked in a donation box"
              fill
              sizes="(min-width: 1024px) 540px, 100vw"
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[#d4824b]/10" />
          </div>
        </div>

        <div className="mt-20 grid gap-6 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <article
                key={step.title}
                className="border border-[#d6cabc] bg-[#fbf7ef] px-6 py-7 shadow-[0_0_0_1px_rgba(255,255,255,0.35)]"
              >
                <div className="mb-8 flex h-9 w-9 items-center justify-center rounded-full bg-[#AC1B18] text-white">
                  <Icon size={17} strokeWidth={2.5} />
                </div>
                <h2 className="text-[22px] font-black leading-none text-[#251711] [font-family:Georgia,serif]">
                  {step.title}
                </h2>
                <p className="mt-4 max-w-[310px] text-[12px] font-medium leading-5 text-[#7f746a]">
                  {step.body}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-[#AC1B18] text-white">
        <div className="mx-auto grid max-w-[1180px] gap-8 px-6 py-14 sm:px-8 lg:grid-cols-[1fr_0.95fr] lg:px-9 lg:py-16">
          <h2 className="max-w-[560px] text-[36px] font-black leading-[0.98] tracking-[-0.025em] sm:text-[48px] lg:text-[54px] [font-family:Georgia,serif]">
            Last year our community kept{" "}
            <span className="lg:ml-40">of clothing</span>
            <br />
            out of landfills.
          </h2>

          <ul className="self-center space-y-4 text-[14px] font-semibold leading-5 text-[#f9ddd8]">
            <li>- 14,200 garments resold to new owners</li>
            <li>- 9,800 donated to shelters in NYC, LA, Austin</li>
            <li>- 4,400 lbs responsibly recycled into insulation</li>
          </ul>
        </div>
      </section>

    </main>
  );
}
