"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/layout/Navbar";
import Footer from "@/layout/Footer";

const inputClass =
  "h-14 w-full border border-[#d7cbbb] bg-[#fffaf2] px-5 text-[15px] font-medium text-[#211714] outline-none transition placeholder:text-[#8a8177] focus:border-[#AC1B18] focus:bg-white";

function GoogleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-3 block text-[12px] font-black uppercase tracking-[0.36em] text-[#4f4039]">
      {children}
    </label>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      console.log("Login:", { email, password, remember });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#FAF2E6] text-[#211714]">
      <div className="border-x-[6px] border-t-[6px] border-[#AC1B18]">
        <Navbar />

        <main className="mx-auto grid max-w-[1180px] gap-10 px-6 py-10 lg:grid-cols-[0.9fr_1fr] lg:px-10 lg:py-12">
          <section className="relative hidden min-h-[500px] overflow-hidden border border-[#eadcca] bg-[#f4d7a7] lg:block">
            <Image
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1100&q=90"
              alt="Model wearing a bright knit sweater"
              fill
              priority
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="object-cover object-top"
            />
          </section>

          <section className="flex items-center justify-center py-4">
            <div className="w-full max-w-[500px]">
              <Link
                href="/browse-finds"
                className="mb-9 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.24em] text-[#81776c] transition hover:text-[#AC1B18]"
              >
                <ArrowLeft size={15} />
                Back
              </Link>

              <p className="text-[12px] font-black uppercase tracking-[0.42em] text-[#81776c]">
                Welcome back
              </p>
              <h1 className="mt-3 text-[46px] font-black leading-none tracking-[-0.04em] text-[#1b1110] sm:text-[56px] [font-family:Georgia,serif]">
                Sign in.
              </h1>
              <p className="mt-4 max-w-[480px] text-[16px] font-medium leading-7 text-[#5f5048]">
                Pick up where you left off - your wishlist, rentals and
                donation credits are saved here.
              </p>

              <form onSubmit={handleLogin} className="mt-9 space-y-6">
                <div>
                  <Label>Email</Label>
                  <input
                    type="email"
                    required
                    placeholder="you@rewear.studio"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <Label>Password</Label>
                  <input
                    type="password"
                    required
                    placeholder="Password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 text-[14px] font-medium text-[#4f4039]">
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(event) => setRemember(event.target.checked)}
                      className="h-4 w-4 accent-[#AC1B18]"
                    />
                    Remember me
                  </label>
                  <Link
                    href="/forgot-password"
                    className="transition hover:text-[#AC1B18]"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="h-14 w-full rounded-full bg-[#211714] text-[16px] font-black text-[#FAF2E6] transition hover:bg-[#AC1B18] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-[#d7cbbb]" />
                <span className="text-[11px] font-black uppercase tracking-[0.28em] text-[#6f665c]">
                  Or
                </span>
                <div className="h-px flex-1 bg-[#d7cbbb]" />
              </div>

              <button
                type="button"
                className="flex h-14 w-full items-center justify-center gap-3 rounded-full border border-[#211714] bg-transparent text-[16px] font-black text-[#211714] transition hover:bg-[#211714] hover:text-[#FAF2E6]"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <p className="mt-8 text-center text-[15px] font-medium text-[#5f5048]">
                New here?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-[#AC1B18] transition hover:text-[#211714]"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </section>
        </main>
      </div>

      <div className="h-[6px] bg-[#AC1B18]" />
      <Footer />
    </div>
  );
}
