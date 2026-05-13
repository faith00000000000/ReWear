"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

const inputClass =
  "w-full rounded-[10px] border-0 bg-[#122e1e] px-4 py-[13px] [font-family:'Inter',sans-serif] text-[13.5px] text-white caret-[#22c55e] outline-none placeholder:text-[#6b9e80] focus:bg-[#0d2417]";

function ChristmasScene() {
  return (
    <svg viewBox="0 0 360 340" xmlns="http://www.w3.org/2000/svg" className="w-full">
      <ellipse cx="180" cy="310" rx="130" ry="24" fill="#c8dfd8" opacity="0.5" />
      <rect x="174" y="268" width="12" height="30" rx="3" fill="#7a5230" />
      <polygon points="180,50 90,268 270,268" fill="#2d6e4e" />
      <polygon points="180,80 102,248 258,248" fill="#3a8a62" />
      <polygon points="180,110 115,220 245,220" fill="#2d6e4e" />
      <polygon points="180,140 128,198 232,198" fill="#3a8a62" />
      <polygon points="180,168 142,184 218,184" fill="#2d6e4e" />
      <circle cx="138" cy="236" r="7" fill="#e84040" />
      <circle cx="224" cy="228" r="7" fill="#f5a623" />
      <circle cx="162" cy="208" r="6" fill="#f5a623" />
      <circle cx="204" cy="214" r="6" fill="#e84040" />
      <circle cx="180" cy="196" r="5" fill="#e84040" />
      <circle cx="228" cy="255" r="8" fill="#e84040" />
      <circle cx="136" cy="260" r="7" fill="#f5a623" />
      <circle cx="126" cy="222" r="3.5" fill="#ffe066" />
      <circle cx="237" cy="242" r="3.5" fill="#ffe066" />
      <circle cx="192" cy="160" r="3" fill="#ffe066" />
      <circle cx="170" cy="162" r="3" fill="#ffe066" />
      <polygon points="180,38 184,52 198,52 187,61 191,75 180,66 169,75 173,61 162,52 176,52" fill="#ffe066" />
      <g transform="translate(262,30) rotate(-12)">
        <rect x="0" y="10" width="36" height="28" rx="3" fill="#c0392b" />
        <rect x="15" y="0" width="6" height="20" fill="#f39c12" />
        <rect x="0" y="8" width="36" height="6" fill="#f39c12" />
        <rect x="-3" y="0" width="42" height="7" rx="2" fill="#e74c3c" transform="rotate(-18,-3,0)" />
      </g>
      <g transform="translate(156,272)">
        <ellipse cx="0" cy="-7" rx="6" ry="9" fill="#4a90d9" />
        <circle cx="0" cy="-20" r="5.5" fill="#f4c88a" />
        <rect x="-5.5" y="-27" width="11" height="4" rx="1" fill="#2c3e50" />
        <rect x="-3.5" y="-38" width="7" height="12" rx="2" fill="#2c3e50" />
        <circle cx="0" cy="-39" r="2" fill="white" />
        <line x1="-6" y1="-9" x2="-16" y2="-16" stroke="#4a90d9" strokeWidth="3" strokeLinecap="round" />
        <line x1="6" y1="-9" x2="14" y2="-18" stroke="#4a90d9" strokeWidth="3" strokeLinecap="round" />
        <line x1="-3" y1="2" x2="-4" y2="13" stroke="#2c3e50" strokeWidth="3" strokeLinecap="round" />
        <line x1="3" y1="2" x2="4" y2="13" stroke="#2c3e50" strokeWidth="3" strokeLinecap="round" />
      </g>
      <g transform="translate(214,272)">
        <circle cx="0" cy="10" r="14" fill="white" opacity="0.92" />
        <circle cx="0" cy="-5" r="10" fill="white" opacity="0.92" />
        <circle cx="0" cy="-17" r="7" fill="white" opacity="0.92" />
        <circle cx="-2.5" cy="-19" r="1.2" fill="#2c3e50" />
        <circle cx="2.5" cy="-19" r="1.2" fill="#2c3e50" />
        <polygon points="0,-17 3,-16 0,-14" fill="#e67e22" />
        <ellipse cx="0" cy="-12" rx="10" ry="3" fill="#e84040" />
        <rect x="-7" y="-29" width="14" height="4" rx="1" fill="#2c3e50" />
        <rect x="-4.5" y="-41" width="9" height="14" rx="2" fill="#2c3e50" />
      </g>
      <g transform="translate(76,300)">
        <ellipse cx="12" cy="0" rx="13" ry="7" fill="#8d6e4a" />
        <circle cx="23" cy="-5" r="6.5" fill="#8d6e4a" />
        <ellipse cx="27" cy="-10" rx="3.5" ry="5.5" fill="#7a5c38" transform="rotate(18,27,-10)" />
        <path d="M0,0 Q-10,-8 -7,-16" stroke="#8d6e4a" strokeWidth="4" fill="none" strokeLinecap="round" />
        <line x1="5" y1="6" x2="4" y2="16" stroke="#7a5c38" strokeWidth="3" strokeLinecap="round" />
        <line x1="15" y1="6" x2="14" y2="16" stroke="#7a5c38" strokeWidth="3" strokeLinecap="round" />
        <circle cx="28" cy="-4" r="2" fill="#3d2b1f" />
      </g>
      <g transform="translate(52,282)">
        <ellipse cx="12" cy="0" rx="14" ry="10" fill="#3a7d55" />
        <ellipse cx="20" cy="-5" rx="10" ry="8" fill="#2d6e4a" />
      </g>
      <circle cx="72" cy="180" r="5" fill="white" opacity="0.3" />
      <circle cx="292" cy="155" r="7" fill="white" opacity="0.22" />
      <circle cx="52" cy="285" r="4" fill="white" opacity="0.32" />
      <circle cx="314" cy="285" r="5" fill="white" opacity="0.28" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

function BrandLogo({ mobile = false }: { mobile?: boolean }) {
  return (
    <div className={`z-10 flex items-center gap-2.5 ${mobile ? "mb-8 lg:hidden" : "px-[18px] pt-[18px]"}`}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#1a5c38] text-base text-white">
        ♻
      </div>
      <div>
        <p className={`[font-family:'Inter',sans-serif] text-xs font-extrabold leading-[1.2] tracking-[0.14em] ${mobile ? "text-white" : "text-[#1a3d26]"}`}>
          REWEAR
        </p>
        <p className={`[font-family:'Inter',sans-serif] text-[8.5px] font-semibold leading-[1.2] tracking-[0.12em] ${mobile ? "text-[#5aaa7a]" : "text-[#2e7d52]"}`}>
          SUSTAINABLE FASHION
        </p>
      </div>
    </div>
  );
}

function LeftPanel() {
  return (
    <div className="relative hidden min-h-[580px] w-[360px] shrink-0 flex-col justify-between overflow-hidden bg-[#d6ede1] lg:flex">
      <div className="absolute right-7 top-[13%] h-[11px] w-[11px] rounded-full bg-white opacity-[0.85]" />
      <div className="absolute right-4 top-[18%] h-[7px] w-[7px] rounded-full bg-white opacity-[0.55]" />
      <div className="absolute bottom-[19%] left-3.5 h-[18px] w-[18px] rounded-full bg-white opacity-[0.65]" />
      <BrandLogo />
      <div className="-mt-2.5 flex flex-1 items-center justify-center px-5">
        <div className="relative aspect-square w-full max-w-[290px]">
          <div className="absolute inset-0 rounded-full bg-[#b8d9c8] opacity-[0.45]" />
          <div className="absolute inset-[9%] rounded-full bg-[#e4f4ec] opacity-[0.96]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[88%]">
              <ChristmasScene />
            </div>
          </div>
        </div>
      </div>
      <div className="z-10 px-[18px] pb-4 text-[10px] leading-[1.6] text-[#4e8a67]">
        <p>© 2026 ReWear</p>
        <p>Fashion Reimagined</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      console.log("Login:", { email, password });
    }, 1200);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#1a4230]">
      <div className="pointer-events-none absolute -right-[60px] -top-10 h-80 w-[420px] rounded-[56px] bg-[#22573d]" />
      <div className="pointer-events-none absolute -right-[110px] top-1/2 h-[260px] w-[260px] -translate-y-1/2 rounded-full bg-[#1e4f37]" />
      <div className="pointer-events-none absolute -bottom-[30px] -left-[50px] h-[180px] w-[180px] rounded-full bg-[#1e4f37] opacity-[0.55]" />

      <div className="relative z-10 flex w-[860px] max-w-[calc(100vw-48px)] items-stretch overflow-hidden rounded-[20px] shadow-[0_12px_60px_rgba(0,0,0,0.35)]">
        <LeftPanel />

        <div className="flex flex-1 flex-col justify-center bg-[#1e4a33] px-14 py-10">
          <BrandLogo mobile />
          <h1 className="mb-7 [font-family:'Inter',sans-serif] text-[42px] font-bold leading-[1.1] tracking-[-0.5px] text-white">
            Login
          </h1>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="mb-[7px] block [font-family:'Inter',sans-serif] text-[13px] font-semibold text-white">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-[7px] block [font-family:'Inter',sans-serif] text-[13px] font-semibold text-white">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 flex -translate-y-1/2 cursor-pointer items-center border-0 bg-transparent p-0 text-[#4e8a67]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="-mt-1 text-right">
              <Link href="/forgot-password" className="[font-family:'Inter',sans-serif] text-[12.5px] text-[#6aaa82] no-underline">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full cursor-pointer rounded-[10px] border-0 bg-[#22c55e] p-3.5 [font-family:'Inter',sans-serif] text-[15px] font-bold tracking-[0.02em] text-white transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-[0.65] disabled:hover:brightness-100"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#2a5e3f]" />
            <span className="whitespace-nowrap [font-family:'Inter',sans-serif] text-xs text-[#5a8a6a]">
              or continue with
            </span>
            <div className="h-px flex-1 bg-[#2a5e3f]" />
          </div>

          <button
            type="button"
            className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-[10px] border-0 bg-white p-[13px] [font-family:'Inter',sans-serif] text-sm font-semibold text-[#202124] shadow-[0_1px_4px_rgba(0,0,0,0.12)] transition-colors hover:bg-[#f5f5f5]"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <p className="mt-[22px] text-center [font-family:'Inter',sans-serif] text-[13px] text-[#8ac4a4]">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-bold text-[#22c55e] no-underline">
              Register Now
            </Link>
          </p>

          <div className="mt-3 text-center">
            <Link href="/terms" className="text-[11px] text-[#3d6e50] no-underline">
              Terms and Services
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
