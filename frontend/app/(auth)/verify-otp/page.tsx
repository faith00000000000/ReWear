"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import api from "@/lib/axios";

// ── Types ──────────────────────────────────────────────────────────────────────

interface VerifyOtpPayload {
    email: string;
    otpCode: string; // matches backend VerifyOtpRequestDto field exactly
}

interface OtpVerifyResponseDto {
    resetToken: string;
    expiresIn: number;
    message: string;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30;

// ── Component ──────────────────────────────────────────────────────────────────

export default function VerifyOtpPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams?.get("email") ?? "";

    // Redirect if no email param — someone navigated here directly
    useEffect(() => {
        if (!email) router.replace("/forgot-password");
    }, [email, router]);

    const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(RESEND_COOLDOWN);

    const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(OTP_LENGTH).fill(null));

    // Focus first slot on mount
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    // Countdown timer for resend button
    useEffect(() => {
        if (countdown <= 0) return;
        const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown]);

    // Auto-submit when all 6 digits are filled
    useEffect(() => {
        const code = digits.join("");
        if (code.length === OTP_LENGTH && !digits.includes("")) {
            submitOtp(code);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [digits]);

    // ── Helpers ─────────────────────────────────────────────────────────────────

    function focusSlot(index: number) {
        inputRefs.current[Math.max(0, Math.min(OTP_LENGTH - 1, index))]?.focus();
    }

    function updateDigit(index: number, value: string) {
        setDigits((prev) => {
            const next = [...prev];
            next[index] = value;
            return next;
        });
    }

    // ── Input handlers ──────────────────────────────────────────────────────────

    function handleChange(e: React.ChangeEvent<HTMLInputElement>, index: number) {
        const raw = e.target.value.replace(/\D/g, ""); // strip non-digits
        if (!raw) return;

        const char = raw[raw.length - 1]; // take last digit only
        updateDigit(index, char);

        if (index < OTP_LENGTH - 1) focusSlot(index + 1);
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>, index: number) {
        if (e.key === "Backspace") {
            e.preventDefault();
            if (digits[index]) {
                // Clear current slot first
                updateDigit(index, "");
            } else if (index > 0) {
                // Slot already empty — go back and clear previous
                updateDigit(index - 1, "");
                focusSlot(index - 1);
            }
        } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            focusSlot(index - 1);
        } else if (e.key === "ArrowRight") {
            e.preventDefault();
            focusSlot(index + 1);
        }
    }

    function handlePaste(e: React.ClipboardEvent) {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
        if (!pasted) return;

        const next = [...digits];
        pasted.split("").forEach((ch, i) => { next[i] = ch; });
        setDigits(next);

        // Focus the slot after the last pasted digit
        focusSlot(Math.min(pasted.length, OTP_LENGTH - 1));
    }

    // ── API calls ────────────────────────────────────────────────────────────────

    const submitOtp = useCallback(async (code: string) => {
        if (isLoading) return;

        setIsLoading(true);
        setError(null);
        setSuccessMsg(null);

        const payload: VerifyOtpPayload = {
            email: email.trim().toLowerCase(),
            otpCode: code, // ← correct field name matching backend DTO
        };

        try {
            const { data } = await api.post<OtpVerifyResponseDto>(
                "/api/auth/verify-otp",
                payload
            );

            setSuccessMsg("Code verified! Redirecting to reset password...");

            // Store the reset token — needed for the next step (POST /reset-password)
            // sessionStorage is appropriate here: tab-scoped, cleared on close
            sessionStorage.setItem("pw_reset_token", data.resetToken);
            sessionStorage.setItem("pw_reset_email", email.trim().toLowerCase());

            setTimeout(() => {
                router.push("/change-password");
            }, 1500);
        } catch (err: any) {
            const msg =
                err.response?.data?.message ??
                err.response?.data?.error ??
                "Invalid or expired code. Please try again.";
            setError(msg);

            // Clear digits and refocus first slot on error
            setDigits(Array(OTP_LENGTH).fill(""));
            setTimeout(() => focusSlot(0), 50);
        } finally {
            setIsLoading(false);
        }
    }, [email, isLoading, router]);

    async function handleResend() {
        if (countdown > 0 || isResending) return;

        setIsResending(true);
        setError(null);

        try {
            await api.post("/api/auth/forgot-password", {
                email: email.trim().toLowerCase(),
            });
            setCountdown(RESEND_COOLDOWN);
            setDigits(Array(OTP_LENGTH).fill(""));
            focusSlot(0);
        } catch (err: any) {
            const msg =
                err.response?.data?.message ?? "Failed to resend code. Please try again.";
            setError(msg);
        } finally {
            setIsResending(false);
        }
    }

    // Manual submit (if user clicks button instead of auto-submit)
    function handleManualSubmit(e: React.FormEvent) {
        e.preventDefault();
        const code = digits.join("");
        if (code.length < OTP_LENGTH || digits.includes("")) {
            setError("Please enter all 6 digits.");
            return;
        }
        submitOtp(code);
    }

    // ── Derived state ────────────────────────────────────────────────────────────

    const isComplete = digits.every((d) => d !== "");
    const isDisabled = isLoading || !!successMsg;

    // ── Render ───────────────────────────────────────────────────────────────────

    return (
        <div className="flex min-h-screen flex-col bg-[#FAF6F0] text-[#211714]">
            <main className="relative flex flex-1 items-center justify-center px-4 py-16 overflow-hidden">

                {/* Decorative side panels */}
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
                <div className="relative z-10 w-full max-w-[500px] rounded-[28px] bg-white px-8 py-10 shadow-[0_12px_60px_rgba(33,23,20,0.06)] border border-[#F2ECE4] sm:px-10">

                    {/* Back button */}
                    <button
                        onClick={() => router.push("/forgot-password")}
                        className="group mb-6 flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.2em] text-[#8A8177] transition hover:text-[#A23A16]"
                    >
                        <span className="text-[14px] transition-transform group-hover:-translate-x-1">←</span>
                        BACK
                    </button>

                    {/* Header */}
                    <div className="text-center">
                        <p className="text-[11px] font-black uppercase tracking-[0.35em] text-[#8A8177]">
                            Verification Required
                        </p>
                        <h1 className="mt-1.5 text-[38px] tracking-tight text-[#211714] [font-family:Georgia,serif] font-normal">
                            Enter OTP
                        </h1>
                        <p className="mx-auto mt-2 max-w-[360px] text-[13.5px] font-medium leading-relaxed text-[#5F5048]">
                            We sent a 6-digit code to{" "}
                            <span className="font-semibold text-[#211714] break-all">{email}</span>.
                            It expires in 10 minutes.
                        </p>
                    </div>

                    {/* Feedback banners */}
                    {error && (
                        <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-[#FDF3F2] border border-[#FADCD9] px-4 py-3">
                            <AlertCircle size={16} className="text-[#EA4335] mt-0.5 shrink-0" />
                            <p className="text-[13px] font-medium text-[#EA4335]">{error}</p>
                        </div>
                    )}

                    {successMsg && (
                        <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-[#EBF7EE] border border-[#D1EED8] px-4 py-3">
                            <CheckCircle2 size={16} className="text-[#34A853] mt-0.5 shrink-0" />
                            <p className="text-[13px] font-medium text-[#34A853]">{successMsg}</p>
                        </div>
                    )}

                    {/* OTP form */}
                    <form onSubmit={handleManualSubmit} className="mt-8 space-y-6" noValidate>

                        {/* Digit slots */}
                        <div>
                            <label className="mb-3 block text-center text-[12px] font-bold uppercase tracking-wider text-[#8A8177]">
                                6-Digit Security Code
                            </label>

                            <div
                                className="flex justify-between gap-2 sm:gap-3"
                                onPaste={handlePaste}
                            >
                                {digits.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={(el) => { inputRefs.current[i] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        pattern="\d*"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleChange(e, i)}
                                        onKeyDown={(e) => handleKeyDown(e, i)}
                                        disabled={isDisabled}
                                        aria-label={`Digit ${i + 1}`}
                                        className={`
                      h-13 w-13 sm:h-14 sm:w-14 rounded-xl border text-center text-[22px] font-bold
                      text-[#211714] outline-none transition-all duration-150 select-none
                      ${digit
                                            ? "border-[#A23A16] bg-[#FDF6F3] ring-1 ring-[#A23A16]/30"
                                            : "border-[#E2D4C5] bg-white"
                                        }
                      focus:border-[#A23A16] focus:ring-2 focus:ring-[#A23A16]/20
                      disabled:bg-[#FAF6F0] disabled:opacity-60
                    `}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={isDisabled || !isComplete}
                            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#A23A16] text-[15px] font-bold text-white transition hover:bg-[#211714] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Verifying…
                                </>
                            ) : successMsg ? (
                                <>
                                    <CheckCircle2 size={16} />
                                    Verified!
                                </>
                            ) : (
                                "Verify & Continue"
                            )}
                        </button>
                    </form>

                    {/* Resend */}
                    <div className="mt-6 text-center text-[13.5px] font-medium text-[#5F5048]">
                        Didn&apos;t receive the email?{" "}
                        {countdown > 0 ? (
                            <span className="font-semibold text-[#8A8177]">
                Resend in {countdown}s
              </span>
                        ) : (
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={isResending}
                                className="font-bold text-[#A23A16] underline underline-offset-4 transition hover:text-[#211714] disabled:opacity-50"
                            >
                                {isResending ? "Sending…" : "Resend Code"}
                            </button>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}