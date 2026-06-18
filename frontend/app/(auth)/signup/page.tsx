"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, User } from "lucide-react";
import api from "@/lib/axios";
import { saveTokens, saveUser, redirectToGoogle } from "@/lib/auth";

interface FormData {
  fullName: string;
  email: string;
  password: string;
  weeklyDrops: boolean;
}

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

export default function SignupPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    weeklyDrops: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await api.post("/api/auth/signup", {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      saveTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      saveUser(data.user);
      router.push("/login");
    } catch (err: any) {
      const messages: string[] = [];

      if (err.response?.data?.validationErrors) {
        Object.values(err.response.data.validationErrors).forEach((val) => {
          if (Array.isArray(val)) {
            messages.push(...val);
          } else {
            messages.push(String(val));
          }
        });
      } else if (err.response?.data?.message) {
        messages.push(String(err.response.data.message));
      } else {
        messages.push("Signup failed. Please try again.");
      }

      setError(messages.join(" · "));
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="flex min-h-screen flex-col bg-[#FAF6F0] text-[#211714]">

        <main className="relative flex flex-1 items-center justify-center px-4 py-12 overflow-hidden">

          {/* Unified Single-Row Decorative Asset Layer */}
          <div className="absolute inset-0 pointer-events-none hidden xl:grid grid-cols-[340px_1fr_340px] items-center px-6">
            {/* Left Panel */}
            <div className="relative h-[680px] w-full">
              <Image
                  src="/images/left.png"
                  alt=""
                  fill
                  className="object-contain object-left"
                  priority
              />
            </div>

            {/* Middle Spacer */}
            <div />

            {/* Right Panel */}
            <div className="relative h-[680px] w-full">
              <Image
                  src="/images/right.png"
                  alt=""
                  fill
                  className="object-contain object-right"
                  priority
              />
            </div>
          </div>

          {/* Central Compact White Card Container */}
          <div className="relative z-10 w-full max-w-[500px] rounded-[28px] bg-white px-8 py-9 shadow-[0_12px_60px_rgba(33,23,20,0.03)] border border-[#F2ECE4] sm:px-10 sm:py-9">

            {/* Back Action Button */}
            <button
                onClick={() => router.push("/browse-finds")}
                className="group mb-4 flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.2em] text-[#8A8177] transition hover:text-[#A23A16]"
            >
              <span className="text-[14px] transition-transform group-hover:-translate-x-1">←</span> BACK
            </button>

            <div className="text-center">
              <p className="text-[11px] font-black uppercase tracking-[0.35em] text-[#8A8177]">
                Join the closet
              </p>
              <h1 className="mt-1.5 text-[38px] tracking-tight text-[#211714] [font-family:Georgia,serif] font-normal">
                Create account
              </h1>
              <p className="mx-auto mt-2 max-w-[360px] text-[13.5px] font-medium leading-relaxed text-[#5F5048]">
                Get 10% off your first thrift, early access to Friday drops, and $5 credit for every donation.
              </p>
            </div>

            {error && (
                <div className="mt-4 rounded-lg bg-[#FDF3F2] p-2.5 text-center text-[13px] font-medium text-[#EA4335] border border-[#FADCD9]">
                  {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
              <div>
                <Label>Full name</Label>
                <div className="relative">
                  <input
                      type="text"
                      name="fullName"
                      required
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={inputClass}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A49B90]">
                  <User size={18} strokeWidth={1.8} />
                </span>
                </div>
              </div>

              <div>
                <Label>Email address</Label>
                <div className="relative">
                  <input
                      type="email"
                      name="email"
                      required
                      placeholder="hotelstar1010@gmail.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={inputClass}
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
                      name="password"
                      required
                      minLength={8}
                      placeholder="At least 8 characters"
                      value={formData.password}
                      onChange={handleChange}
                      className={inputClass}
                  />
                  <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A49B90] transition hover:text-[#A23A16]"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="pt-0.5">
                <label className="flex cursor-pointer items-start gap-2.5 text-[13px] font-medium leading-relaxed text-[#5F5048]">
                  <input
                      type="checkbox"
                      name="weeklyDrops"
                      checked={formData.weeklyDrops}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 shrink-0 rounded border-[#E2D4C5] accent-[#A23A16] transition"
                  />
                  <span>Send me weekly drops and rental restocks. No spam, ever.</span>
                </label>
              </div>

              <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-1 h-12 w-full rounded-lg bg-[#A23A16] text-[15px] font-bold text-white transition hover:bg-[#211714] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <div className="my-4.5 flex items-center justify-center gap-3">
              <div className="h-[1px] flex-1 bg-[#E2D4C5] opacity-60" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A49B90]">
              or
            </span>
              <div className="h-[1px] flex-1 bg-[#E2D4C5] opacity-60" />
            </div>

            <button
                type="button"
                onClick={redirectToGoogle}
                className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-[#E2D4C5] bg-[#FFFFFF] text-[14px] font-bold text-[#211714] transition hover:bg-[#FAF6F0]"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <p className="mt-5 text-center text-[13.5px] font-medium text-[#5F5048]">
              Already have one?{" "}
              <Link
                  href="/login"
                  className="font-bold text-[#A23A16] transition hover:text-[#211714]"
              >
                Sign in
              </Link>
            </p>
          </div>
        </main>

      </div>
  );
}