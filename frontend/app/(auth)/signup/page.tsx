"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/layout/Navbar";
import Footer from "@/layout/Footer";

interface FormData {
  firstName: string;
  lastName: string;
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
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    weeklyDrops: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      console.log("Signup:", formData);
    }, 1000);
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
                Get 10% off your first thrift, early access to Friday drops,
                and $5 credit for every donation.
              </p>

              <form onSubmit={handleSubmit} className="mt-9 space-y-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label>First name</Label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      placeholder="June"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <Label>Last name</Label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      placeholder="Carter"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <Label>Email</Label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="you@rewear.studio"
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
