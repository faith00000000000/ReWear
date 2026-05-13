import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="bg-[#FAF2E6]">
      <div className="mx-auto grid min-h-[calc(100vh-74px)] max-w-[1380px] items-center gap-10 px-7 py-14 sm:px-12 lg:grid-cols-[0.95fr_1.05fr] lg:px-24 lg:py-18">
        <div className="max-w-[560px]">
          <h1 className="text-[72px] font-black leading-[0.86] tracking-[-0.055em] text-[#1b1110] sm:text-[104px] lg:text-[126px] [font-family:Georgia,serif]">
            Fashion
            <br />
            That
            <br />
            Lasts<span className="text-[#AC1B18]">.</span>
          </h1>

          <p className="mt-14 max-w-[460px] text-[26px] font-bold italic leading-[1.55] tracking-[0.02em] text-[#AC1B18] [font-family:cursive]">
            one-of-a-kind pieces
            <br />
            with stories to pass on.
          </p>

          <div className="mt-9 h-px w-24 bg-[#8e8175]" />

          <p className="mt-9 max-w-[520px] text-[17px] font-medium leading-7 text-[#665d54]">
            Curated vintage and thrift, just for you - sourced, steamed and
            styled by a small team that believes the best pieces deserve
            another chapter.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/browse-finds"
              className="rounded-full bg-[#AC1B18] px-7 py-3 text-[13px] font-black uppercase tracking-[0.14em] text-[#FAF2E6] transition hover:bg-[#1b1110]"
            >
              Shop Finds
            </Link>
            <Link
              href="/rent"
              className="rounded-full border border-[#5E6B52] px-7 py-3 text-[13px] font-black uppercase tracking-[0.14em] text-[#5E6B52] transition hover:border-[#AC1B18] hover:text-[#AC1B18]"
            >
              Rent Looks
            </Link>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <div className="relative aspect-[0.9/1] w-full max-w-[620px] overflow-hidden bg-[#f5d9a7]">
            <Image
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=90"
              alt="Model wearing a red sweater and denim"
              fill
              priority
              sizes="(min-width: 1024px) 620px, 90vw"
              className="object-cover object-top"
            />
            <div className="absolute inset-0 bg-[#FAF2E6]/5" />
          </div>
        </div>
      </div>
    </section>
  );
}
