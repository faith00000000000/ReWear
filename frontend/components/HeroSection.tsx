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
        <div className="mx-auto grid min-h-[calc(100vh-64px)] max-w-[1380px] items-center gap-8 px-5 py-10 sm:min-h-[calc(100vh-74px)] sm:gap-10 sm:px-12 sm:py-14 lg:grid-cols-[0.95fr_1.05fr] lg:px-24 lg:py-18">
          {/* ── LEFT COLUMN ── */}
          <div className="max-w-[560px]">
            {/* Eyebrow */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#8B4513]/14 bg-white/50 px-3.5 py-1.5 sm:mb-5 sm:px-4">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
              <span className="font-mono text-[8px] tracking-[0.16em] text-[#8B4513]/55 uppercase sm:text-[9px] sm:tracking-[0.18em]">
              Now live in Nepal
            </span>
            </div>

            {/* Headline — scaled down for mobile so it doesn't overflow or
              wrap awkwardly on small screens */}
            <h1 className="text-[42px] font-normal leading-[1.08] tracking-tight text-[#4a423e] sm:text-[62px] sm:leading-[1.05] lg:text-[80px] [font-family:Georgia,serif]">
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
            <p className="mt-3 text-[15px] font-serif italic font-normal text-[#962D18] tracking-wide sm:mt-4 sm:text-[17px]">
              Feel the Fashion
            </p>

            {/* Description */}
            <p className="mt-3 max-w-[480px] text-[15px] leading-[1.6] text-[#5c5c5c] sm:mt-4 sm:text-[17px] sm:leading-[1.65]">
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
            <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8 sm:gap-4">
              {/* Primary Action Button — guests now go to /signup, per request */}
              <Link
                  href={isAuthenticated ? "/browse-finds" : "/signup"}
                  className="flex items-center gap-2 rounded-full bg-[#a73322] px-6 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[#8a2a1c] sm:px-7 sm:py-3 sm:text-[15px]"
              >
                {isAuthenticated ? "Continue Shopping" : "Get Started"}
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </Link>

              {/* Secondary Action Button — Only renders if user is signed in */}
              {isAuthenticated && (
                  <Link
                      href="/rent"
                      className="flex items-center gap-2 rounded-full border border-[#d1d1d1] bg-transparent px-6 py-2.5 text-[14px] font-medium text-[#1b1110] transition-colors hover:bg-black/5 sm:px-7 sm:py-3 sm:text-[15px]"
                  >
                    <RefreshCcw className="h-4 w-4" strokeWidth={2.5} />
                    Rent a Piece
                  </Link>
              )}
            </div>

            {/* Divider */}
            <hr className="my-7 border-t border-[#e6e6e6] sm:my-10" />

            {/* Stats — wraps to 2 columns on very small screens instead of
              squeezing three items into one cramped row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-4 sm:gap-8 sm:gap-y-0 sm:gap-10">
              <div className="flex flex-col">
              <span className="text-[22px] text-[#1b1110] sm:text-[28px] [font-family:Georgia,serif]">
                12k+
              </span>
                <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.06em] text-[#7a7a7a] sm:text-[11px] sm:tracking-[0.08em]">
                Curated Pieces
              </span>
              </div>

              <div className="hidden h-10 w-px bg-[#e6e6e6] sm:block" />

              <div className="flex flex-col">
              <span className="text-[22px] text-[#1b1110] sm:text-[28px] [font-family:Georgia,serif]">
                4.8k
              </span>
                <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.06em] text-[#7a7a7a] sm:text-[11px] sm:tracking-[0.08em]">
                Happy Members
              </span>
              </div>

              <div className="hidden h-10 w-px bg-[#e6e6e6] sm:block" />

              <div className="flex flex-col">
              <span className="text-[22px] text-[#1b1110] sm:text-[28px] [font-family:Georgia,serif]">
                98%
              </span>
                <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.06em] text-[#7a7a7a] sm:text-[11px] sm:tracking-[0.08em]">
                Satisfaction
              </span>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN — hidden below sm to keep the fold focused on
            the message + CTA on phones; reappears at sm and up with a
            shorter height than desktop. ── */}
          <div className="hidden justify-center sm:flex lg:justify-end">
            <div className="relative flex h-[420px] w-full max-w-[540px] items-end justify-center lg:h-[640px]">
              {/* Warm ambient glow */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[72%] w-[65%] rounded-full bg-[#f5d9a7]/55 blur-3xl -z-10 pointer-events-none" />

              {/* Half-circle base platform */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[130px] w-[340px] rounded-t-full border-t border-x border-[#8B4513]/10 bg-[#FAF2E6]/50 -z-10 pointer-events-none lg:h-[160px] lg:w-[420px]" />

              {/* Ghost WEAR text */}
              <div className="absolute bottom-12 left-2 z-0 select-none pointer-events-none lg:bottom-16">
                <p className="font-serif text-[48px] font-bold tracking-tighter text-[#8B4513] opacity-[0.055] leading-none lg:text-[72px]">
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
              <div className="absolute top-6 right-4 z-20 flex h-[64px] w-[64px] items-center justify-center lg:top-8 lg:right-5 lg:h-[78px] lg:w-[78px]">
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
                <span className="font-mono text-[6px] font-bold tracking-[0.16em] text-[#8B4513]/50 uppercase lg:text-[7px] lg:tracking-[0.18em]">
                  Est.
                </span>
                  <span className="font-serif text-[13px] font-bold text-[#8B4513]/68 leading-none lg:text-[15px]">
                  2026
                </span>
                  <span className="font-mono text-[5.5px] tracking-[0.08em] text-[#8B4513]/36 uppercase lg:text-[6.5px] lg:tracking-[0.1em]">
                  Re:Wear
                </span>
                </div>
              </div>

              {/* Availability pill — top center */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-full border border-[#8B4513]/14 bg-[#FDF7EE]/85 backdrop-blur-sm px-3.5 py-1.5 lg:top-5 lg:px-4">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                <span className="font-mono text-[7.5px] tracking-[0.14em] text-[#8B4513]/55 uppercase lg:text-[8.5px] lg:tracking-[0.16em]">
                Available now
              </span>
              </div>
            </div>
          </div>
        </div>
      </section>
  );
}