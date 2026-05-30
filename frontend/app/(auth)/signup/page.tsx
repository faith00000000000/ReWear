"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/layout/Navbar";
import Footer from "@/layout/Footer";
import api from "@/app/lib/axios";
import { saveTokens, saveUser, redirectToGoogle } from "@/app/lib/auth";
import { useRouter } from "next/navigation";

interface FormData {
  fullName: string;
  email: string;
  password: string;
  weeklyDrops: boolean;
}

const inputClass =
  "h-14 w-full border border-[#d7cbbb] bg-[#fffaf2] px-5 text-[15px] font-medium text-[#211714] outline-none transition placeholder:text-[#8a8177] focus:border-[#AC1B18] focus:bg-white";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-3 block text-[12px] font-black uppercase tracking-[0.36em] text-[#4f4039]">
      {children}
    </label>
  );
}

export default function SignupPage() {
  const router = useRouter();

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

  // const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  //   event.preventDefault();
  //   setIsLoading(true);
  //   setTimeout(() => {
  //     setIsLoading(false);
  //     console.log("Signup:", formData);
  //   }, 1000);
  // };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await api.post("/api/auth/signup", {
        fullName: `${formData.fullName.trim()}`,
        email: formData.email,
        password: formData.password,
      });

      console.log("Signup success:", data);

      saveTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      console.log("Redirecting...");

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
    <div className="min-h-screen bg-[#FAF2E6] text-[#211714]">
      <div className="border-x-[6px] border-t-[6px] border-[#AC1B18]">
        <Navbar />

        <main className="mx-auto grid max-w-[1180px] gap-10 px-6 py-10 lg:grid-cols-[1fr_0.9fr] lg:px-10 lg:py-12">
          <section className="flex items-center justify-center py-4">
            <div className="w-full max-w-[500px]">
              <Link
                href="/browse-finds"
                className="mb-8 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.24em] text-[#81776c] transition hover:text-[#AC1B18]"
              >
                <ArrowLeft size={15} />
                Back
              </Link>

              <p className="text-[12px] font-black uppercase tracking-[0.42em] text-[#81776c]">
                Join the closet
              </p>
              <h1 className="mt-4 text-[44px] font-black leading-none tracking-[-0.04em] text-[#1b1110] sm:text-[54px] [font-family:Georgia,serif]">
                Create{" "}
                <span className="font-normal italic text-[#AC1B18] [font-family:cursive]">
                  account.
                </span>
              </h1>
              <p className="mt-5 max-w-[500px] text-[16px] font-medium leading-7 text-[#5f5048]">
                Get 10% off your first thrift, early access to Friday drops, and
                $5 credit for every donation.
              </p>

              <form onSubmit={handleSubmit} className="mt-9 space-y-6">
                <div>
                  <Label>Full name</Label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <Label>Password</Label>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={8}
                    placeholder="At least 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <label className="flex cursor-pointer items-start gap-3 text-[14px] font-medium leading-6 text-[#4f4039]">
                  <input
                    type="checkbox"
                    name="weeklyDrops"
                    checked={formData.weeklyDrops}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 shrink-0 accent-[#AC1B18]"
                  />
                  Send me weekly drops and rental restocks. No spam, ever.
                </label>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="h-14 w-full rounded-full bg-[#211714] text-[16px] font-black text-[#FAF2E6] transition hover:bg-[#AC1B18] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </button>
              </form>

              <p className="mt-8 text-center text-[15px] font-medium text-[#5f5048]">
                Already have one?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[#AC1B18] transition hover:text-[#211714]"
                >
                  Sign in
                </Link>
              </p>

              <div className="my-7 flex items-center gap-4">
                <hr className="flex-1 border-[#d7cbbb]" />
                <span className="text-[12px] font-bold uppercase tracking-widest text-[#9e9186]">
                  or
                </span>
                <hr className="flex-1 border-[#d7cbbb]" />
              </div>

              <button
                type="button"
                onClick={redirectToGoogle}
                className="mt-8 flex h-14 w-full items-center justify-center gap-3 rounded-full border border-[#d7cbbb] bg-white text-[15px] font-semibold text-[#211714] transition hover:border-[#AC1B18] hover:bg-[#fff5ee]"
              >
                <GoogleIcon />
                Continue with Google
              </button>
            </div>
          </section>

          <section className="relative hidden min-h-[500px] overflow-hidden border border-[#eadcca] bg-[#f4d7a7] lg:block">
            <Image
              src="https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=1100&q=90"
              alt="Folded denim and knit clothes"
              fill
              priority
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="object-cover"
            />
          </section>
        </main>
      </div>

      <div className="h-[6px] bg-[#AC1B18]" />
      <Footer />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path
        fill="#EA4335"
        d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.8 2.5 30.2 0 24 0 14.8 0 6.9 5.4 3 13.3l7.8 6C12.7 13 17.9 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 7.1-10 7.1-17z"
      />
      <path
        fill="#FBBC05"
        d="M10.8 28.7A14.6 14.6 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7L2.5 13.3A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.5 10.7l8.3-6z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.6 2.2-7.7 2.2-6.1 0-11.3-4.1-13.2-9.6l-7.8 6C6.9 42.6 14.8 48 24 48z"
      />
    </svg>
  );
}
