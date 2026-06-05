import Image from "next/image";
import Link from "next/link";
import { ArrowRight, RefreshCcw } from "lucide-react";

interface HeroSectionProps {
  isAuthenticated?: boolean;
  userName?: string;
}

export default function HeroSection({
  isAuthenticated = false,
  userName,
}: HeroSectionProps) {
  // Extract first name from full name
  const firstName = userName ? userName.split(" ")[0] : "";

  return (
    <section className="bg-[#FAF2E6]">
      <div className="mx-auto grid min-h-[calc(100vh-74px)] max-w-[1380px] items-center gap-10 px-7 py-14 sm:px-12 lg:grid-cols-[0.95fr_1.05fr] lg:px-24 lg:py-18">
        {/* ── LEFT COLUMN ── */}
        <div className="max-w-[560px]">
          {/* Eyebrow */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#8B4513]/14 bg-white/50 px-4 py-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
            <span className="font-mono text-[9px] tracking-[0.18em] text-[#8B4513]/55 uppercase">
              Now live in Nepal
            </span>
          </div>

          {/* Headline - Personalized for Authenticated Users */}
          <h1 className="text-[62px] font-normal leading-[1.05] tracking-tight text-[#4a423e] sm:text-[80px] [font-family:Georgia,serif]">
            {isAuthenticated && firstName ? (
              <>
                Elevate
                <br />
                Your Style,{" "}
                <span className="text-[#962D18] italic">{firstName}!</span>
              </>
            ) : (
              <>
                Elevate
                <br />
                Your Style!
              </>
            )}
          </h1>

          {/* Subheading */}
          <p className="mt-4  text-[17px] font-serif italic font-normal text-[#962D18] tracking-wide">
            Feel the Fashion
          </p>

          {/* Description */}
          <p className="mt-4 max-w-[480px] text-[17px] leading-[1.65] text-[#5c5c5c]">
            {isAuthenticated ? (
              <>
                Welcome back! Discover new pieces and continue your style
                journey with us.
              </>
            ) : (
              <>
                A curated marketplace for pre-loved and vintage pieces. Every
                item tells a story. Every purchase extends a life.
              </>
            )}
          </p>

          {/* Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href={isAuthenticated ? "/browse-finds" : "/shops"}
              className="flex items-center gap-2 rounded-full bg-[#a73322] px-7 py-3 text-[15px] font-medium text-white transition-colors hover:bg-[#8a2a1c]"
            >
              {isAuthenticated ? "Continue Shopping" : "Explore the Edit"}
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </Link>

            <Link
              href="/rent"
              className="flex items-center gap-2 rounded-full border border-[#d1d1d1] bg-transparent px-7 py-3 text-[15px] font-medium text-[#1b1110] transition-colors hover:bg-black/5"
            >
              <RefreshCcw className="h-4 w-4" strokeWidth={2.5} />
              Rent a Piece
            </Link>
          </div>

          {/* Divider */}
          <hr className="my-10 border-t border-[#e6e6e6]" />

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-8 sm:gap-10">
            <div className="flex flex-col">
              <span className="text-[28px] text-[#1b1110] [font-family:Georgia,serif]">
                12k+
              </span>
              <span className="mt-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[#7a7a7a]">
                Curated Pieces
              </span>
            </div>

            <div className="hidden h-10 w-px bg-[#e6e6e6] sm:block" />

            <div className="flex flex-col">
              <span className="text-[28px] text-[#1b1110] [font-family:Georgia,serif]">
                4.8k
              </span>
              <span className="mt-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[#7a7a7a]">
                Happy Members
              </span>
            </div>

            <div className="hidden h-10 w-px bg-[#e6e6e6] sm:block" />

            <div className="flex flex-col">
              <span className="text-[28px] text-[#1b1110] [font-family:Georgia,serif]">
                98%
              </span>
              <span className="mt-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[#7a7a7a]">
                Satisfaction
              </span>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="flex justify-center lg:justify-end">
          <div className="relative flex h-[520px] w-full max-w-[540px] items-end justify-center lg:h-[640px]">
            {/* Warm ambient glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[72%] w-[65%] rounded-full bg-[#f5d9a7]/55 blur-3xl -z-10 pointer-events-none" />

            {/* Half-circle base platform */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[160px] w-[420px] rounded-t-full border-t border-x border-[#8B4513]/10 bg-[#FAF2E6]/50 -z-10 pointer-events-none" />

            {/* Ghost WEAR text */}
            <div className="absolute bottom-16 left-2 z-0 select-none pointer-events-none">
              <p className="font-serif text-[72px] font-bold tracking-tighter text-[#8B4513] opacity-[0.055] leading-none">
                WEAR
              </p>
            </div>

            {/* THE MODEL */}
            <div className="relative z-10 h-full w-full transition-transform duration-700 hover:scale-[1.015]">
              <Image
                src="/images/modal.png"
                alt="RE:WEAR fashion model"
                fill
                priority
                sizes="(min-width: 1024px) 540px, 90vw"
                className="object-contain object-bottom drop-shadow-[0_24px_48px_rgba(139,69,19,0.16)]"
              />
            </div>

            {/* Rotating stamp badge — top right */}
            <div className="absolute top-8 right-5 z-20 flex h-[78px] w-[78px] items-center justify-center">
              <svg
                className="absolute inset-0 animate-[spin_22s_linear_infinite]"
                viewBox="0 0 78 78"
                fill="none"
              >
                <circle
                  cx="39"
                  cy="39"
                  r="35"
                  stroke="#8B4513"
                  strokeOpacity="0.26"
                  strokeWidth="1"
                  strokeDasharray="4.5 3"
                />
              </svg>
              <div className="flex flex-col items-center justify-center text-center leading-tight gap-px">
                <span className="font-mono text-[7px] font-bold tracking-[0.18em] text-[#8B4513]/50 uppercase">
                  Est.
                </span>
                <span className="font-serif text-[15px] font-bold text-[#8B4513]/68 leading-none">
                  2026
                </span>
                <span className="font-mono text-[6.5px] tracking-[0.1em] text-[#8B4513]/36 uppercase">
                  Re:Wear
                </span>
              </div>
            </div>

            {/* Availability pill — top center */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-full border border-[#8B4513]/14 bg-[#FDF7EE]/85 backdrop-blur-sm px-4 py-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
              <span className="font-mono text-[8.5px] tracking-[0.16em] text-[#8B4513]/55 uppercase">
                Available now
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
