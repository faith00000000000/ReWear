"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight } from "lucide-react";
import api from "@/lib/axios";

const inputClass =
    "h-12 w-full rounded-lg border border-[#E2D4C5] bg-[#FFFFFF] px-4 text-[14px] font-medium text-[#211714] outline-none transition placeholder:text-[#A49B90] focus:border-[#A23A16] focus:ring-1 focus:ring-[#A23A16]";

function Label({ children }: { children: React.ReactNode }) {
    return (
        <label className="mb-1.5 block text-[14px] font-semibold text-[#211714]">
            {children}
        </label>
    );
}

export default function ForgotPasswordPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Replace with your actual forgot-password endpoint details if needed
            await api.post("/api/auth/forgot-password", {
                email: email.trim().toLowerCase(),
            });

            setIsSuccess(true);

            // Optionally route to your OTP verification page after a short window
            setTimeout(() => {
                router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
            }, 2000);
        } catch (err: any) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError("Something went wrong. Please check your connection.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-[#FAF6F0] text-[#211714]">

            <main className="relative flex flex-1 items-center justify-center px-4 py-16 overflow-hidden">

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
                <div className="relative z-10 w-full max-w-[500px] rounded-[28px] bg-white px-8 py-10 shadow-[0_12px_60px_rgba(33,23,20,0.03)] border border-[#F2ECE4] sm:px-10 sm:py-10">

                    {/* Back Action Button */}
                    <button
                        onClick={() => router.push("/login")}
                        className="group mb-5 flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.2em] text-[#8A8177] transition hover:text-[#A23A16]"
                    >
                        <span className="text-[14px] transition-transform group-hover:-translate-x-1">←</span> BACK TO SIGN IN
                    </button>

                    <div className="text-center">
                        <p className="text-[11px] font-black uppercase tracking-[0.35em] text-[#8A8177]">
                            Security Check
                        </p>
                        <h1 className="mt-1.5 text-[38px] tracking-tight text-[#211714] [font-family:Georgia,serif] font-normal">
                            Reset password
                        </h1>
                        <p className="mx-auto mt-2 max-w-[350px] text-[13.5px] font-medium leading-relaxed text-[#5F5048]">
                            Enter your email address below, and we will send you a 6-digit OTP code to verify your account.
                        </p>
                    </div>

                    {error && (
                        <div className="mt-4 rounded-lg bg-[#FDF3F2] p-2.5 text-center text-[13px] font-medium text-[#EA4335] border border-[#FADCD9]">
                            {error}
                        </div>
                    )}

                    {isSuccess && (
                        <div className="mt-4 rounded-lg bg-[#EBF7EE] p-2.5 text-center text-[13px] font-medium text-[#34A853] border border-[#D1EED8]">
                            OTP code sent! Redirecting to verification page...
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <div>
                            <Label>Email address</Label>
                            <div className="relative">
                                <input
                                    type="email"
                                    required
                                    placeholder="Enter email address"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    className={inputClass}
                                    disabled={isSuccess}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A49B90]">
                  <Mail size={18} strokeWidth={1.8} />
                </span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || isSuccess}
                            className="group flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#A23A16] text-[15px] font-bold text-white transition hover:bg-[#211714] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isLoading ? "Sending Code..." : "Send OTP Code"}
                            {!isLoading && (
                                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-[13.5px] font-medium text-[#5F5048]">
                        Remembered your credentials?{" "}
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