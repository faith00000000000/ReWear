"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, AlertCircle, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import {saveTokens, saveUser, isAuthenticated, saveSession} from "@/lib/auth";
import { useAuth } from "@/lib/AuthContext";

const inputClass =
    "h-12 w-full rounded-lg border border-[#E2D4C5] bg-[#FFFFFF] px-4 text-[14px] font-medium text-[#211714] outline-none transition placeholder:text-[#A49B90] focus:border-[#A23A16] focus:ring-1 focus:ring-[#A23A16]";

function GoogleIcon() {
  return (
      <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      </svg>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
      <label className="mb-1.5 block text-[14px] font-semibold text-[#211714]">
        {children}
      </label>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { refreshAuth } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Guard: only redirect if token is valid AND not expired ────────────────
  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/");
    }
  }, [router]);

  // ── OAuth error param ─────────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "oauth_failed") {
      setError("Google sign-in failed. Please try again.");
    }
  }, []);

  // ── Login handler ─────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await api.post("/api/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      const payload = data?.data ?? data;

      const accessToken  = payload.accessToken ?? payload.token;
      const refreshToken = payload.refreshToken ?? null;
      const expiresIn    = payload.expiresIn    ?? 3600;
      let   user         = payload.user         ?? null;

      if (!accessToken) {
        setError("Login failed — server returned no token. Please try again.");
        return;
      }

      // If backend didn't return user, fetch from /me
      if (!user) {
        const { data: meData } = await api.get("/api/auth/me");
        user = meData?.data ?? meData;
      }

      if (user) {
        saveSession({ accessToken, refreshToken, expiresIn }, user);
      } else {
        saveTokens({ accessToken, refreshToken, expiresIn });
      }

      refreshAuth();
      router.push("/");

    } catch (err: any) {
      console.error("Login error:", err.response?.status, err.response?.data);

      if (err.response?.status === 401) {
        setError("Incorrect email or password.");
      } else if (err.response?.status === 403) {
        setError("Account suspended or not yet verified.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="flex min-h-screen flex-col bg-[#FAF6F0] text-[#211714]">
        <main className="relative flex flex-1 items-center justify-center px-4 py-16 overflow-hidden">

          {/* Decorative panels */}
          <div className="absolute inset-0 pointer-events-none hidden xl:grid grid-cols-[340px_1fr_340px] items-center px-6">
            <div className="relative h-[680px] w-full">
              <Image src="/images/left.png" alt="" fill className="object-contain object-left" priority />
            </div>
            <div />
            <div className="relative h-[680px] w-full">
              <Image src="/images/right.png" alt="" fill className="object-contain object-right" priority />
            </div>
          </div>

          {/* Card */}
          <div className="relative z-10 w-full max-w-[500px] rounded-[28px] bg-white px-8 py-10 shadow-[0_12px_60px_rgba(33,23,20,0.03)] border border-[#F2ECE4] sm:px-10 sm:py-10">

            <button
                onClick={() => router.push("/browse-finds")}
                className="group mb-5 flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.2em] text-[#8A8177] transition hover:text-[#A23A16]"
            >
              <span className="text-[14px] transition-transform group-hover:-translate-x-1">←</span> BACK
            </button>

            <div className="text-center">
              <p className="text-[11px] font-black uppercase tracking-[0.35em] text-[#8A8177]">
                Welcome Back
              </p>
              <h1 className="mt-1.5 text-[38px] tracking-tight text-[#211714] [font-family:Georgia,serif] font-normal">
                Sign in
              </h1>
              <p className="mx-auto mt-2 max-w-[340px] text-[13.5px] font-medium leading-relaxed text-[#5F5048]">
                Pick up where you left off — your wishlist, rentals, and donation credits are saved here.
              </p>
            </div>

            {/* Error banner */}
            {error && (
                <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-[#FDF3F2] border border-[#FADCD9] px-4 py-3">
                  <AlertCircle size={15} className="text-[#EA4335] mt-0.5 shrink-0" />
                  <p className="text-[13px] font-medium text-[#EA4335]">{error}</p>
                </div>
            )}

            <form onSubmit={handleLogin} className="mt-6 space-y-4" noValidate>
              <div>
                <Label>Email address</Label>
                <div className="relative">
                  <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                      autoComplete="email"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A49B90]">
                  <Mail size={18} strokeWidth={1.8} />
                </span>
                </div>
              </div>

              <div>
                <Label>Password</Label>
                <div className="relative">
                  <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={inputClass}
                      autoComplete="current-password"
                  />
                  <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A49B90] transition hover:text-[#A23A16]"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[13px] font-medium pt-0.5">
                <label className="flex cursor-pointer items-center gap-2 text-[#5F5048]">
                  <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="h-4 w-4 rounded border-[#E2D4C5] accent-[#A23A16]"
                  />
                  Remember me
                </label>
                <Link
                    href="/forgot-password"
                    className="font-semibold text-[#A23A16] hover:text-[#211714] transition"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#A23A16] text-[15px] font-bold text-white transition hover:bg-[#211714] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                    <><Loader2 size={16} className="animate-spin" /> Signing in…</>
                ) : (
                    "Sign In"
                )}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#E2D4C5] opacity-60" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A49B90]">or</span>
              <div className="h-px flex-1 bg-[#E2D4C5] opacity-60" />
            </div>

            <button
                type="button"
                className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-[#E2D4C5] bg-white text-[14px] font-bold text-[#211714] transition hover:bg-[#FAF6F0]"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <p className="mt-6 text-center text-[13.5px] font-medium text-[#5F5048]">
              New here?{" "}
              <Link href="/signup" className="font-bold text-[#A23A16] transition hover:text-[#211714]">
                Create an account
              </Link>
            </p>
          </div>
        </main>
      </div>
  );
}