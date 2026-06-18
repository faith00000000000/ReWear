// "use client";
//
// import { useState } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { useRouter, useSearchParams } from "next/navigation";
// import { Eye, EyeOff, Lock } from "lucide-react";
// import api from "@/lib/axios";
//
// const inputClass =
//     "h-12 w-full rounded-lg border border-[#E2D4C5] bg-[#FFFFFF] px-4 text-[14px] font-medium text-[#211714] outline-none transition placeholder:text-[#A49B90] focus:border-[#A23A16] focus:ring-1 focus:ring-[#A23A16]";
//
// function Label({ children }: { children: React.ReactNode }) {
//     return (
//         <label className="mb-1.5 block text-[14px] font-semibold text-[#211714]">
//             {children}
//         </label>
//     );
// }
//
// export default function ResetPasswordPage() {
//     const router = useRouter();
//     const searchParams = useSearchParams();
//
//     // Extract contextual parameters passed over from OTP validation page
//     const email = searchParams?.get("email") || "";
//     const code = searchParams?.get("code") || "";
//
//     const [password, setPassword] = useState("");
//     const [confirmPassword, setConfirmPassword] = useState("");
//     const [showPassword, setShowPassword] = useState(false);
//     const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState<string | null>(null);
//     const [isSuccess, setIsSuccess] = useState(false);
//
//     const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
//         event.preventDefault();
//         setError(null);
//
//         if (password.length < 8) {
//             setError("Password must be at least 8 characters long.");
//             return;
//         }
//
//         if (password !== confirmPassword) {
//             setError("Passwords do not match. Please try re-entering.");
//             return;
//         }
//
//         setIsLoading(true);
//
//         try {
//             await api.post("/api/auth/reset-password", {
//                 email: email.trim().toLowerCase(),
//                 token: code, // Validation confirmation signature code
//                 password,
//             });
//
//             setIsSuccess(true);
//
//             // Send them straight back to sign-in card context after success loop
//             setTimeout(() => {
//                 router.push("/login");
//             }, 2500);
//         } catch (err: any) {
//             if (err.response?.data?.message) {
//                 setError(err.response.data.message);
//             } else {
//                 setError("Failed to update credentials. Session may have expired.");
//             }
//         } finally {
//             setIsLoading(false);
//         }
//     };
//
//     return (
//         <div className="flex min-h-screen flex-col bg-[#FAF6F0] text-[#211714]">
//
//             <main className="relative flex flex-1 items-center justify-center px-4 py-16 overflow-hidden">
//
//                 {/* Unified Single-Row Decorative Asset Layer */}
//                 <div className="absolute inset-0 pointer-events-none hidden xl:grid grid-cols-[340px_1fr_340px] items-center px-6">
//                     {/* Left Panel */}
//                     <div className="relative h-[680px] w-full">
//                         <Image
//                             src="/images/left.png"
//                             alt=""
//                             fill
//                             className="object-contain object-left"
//                             priority
//                         />
//                     </div>
//
//                     {/* Middle Spacer */}
//                     <div />
//
//                     {/* Right Panel */}
//                     <div className="relative h-[680px] w-full">
//                         <Image
//                             src="/images/right.png"
//                             alt=""
//                             fill
//                             className="object-contain object-right"
//                             priority
//                         />
//                     </div>
//                 </div>
//
//                 {/* Central Compact White Card Container */}
//                 <div className="relative z-10 w-full max-w-[500px] rounded-[28px] bg-white px-8 py-10 shadow-[0_12px_60px_rgba(33,23,20,0.03)] border border-[#F2ECE4] sm:px-10 sm:py-10">
//
//                     <div className="text-center">
//                         <p className="text-[11px] font-black uppercase tracking-[0.35em] text-[#8A8177]">
//                             Final Step
//                         </p>
//                         <h1 className="mt-1.5 text-[38px] tracking-tight text-[#211714] [font-family:Georgia,serif] font-normal">
//                             New password
//                         </h1>
//                         <p className="mx-auto mt-2 max-w-[360px] text-[13.5px] font-medium leading-relaxed text-[#5F5048]">
//                             Create a secure, strong password to safeguard access to your closet account dashboard.
//                         </p>
//                     </div>
//
//                     {error && (
//                         <div className="mt-4 rounded-lg bg-[#FDF3F2] p-2.5 text-center text-[13px] font-medium text-[#EA4335] border border-[#FADCD9]">
//                             {error}
//                         </div>
//                     )}
//
//                     {isSuccess && (
//                         <div className="mt-4 rounded-lg bg-[#EBF7EE] p-2.5 text-center text-[13px] font-medium text-[#34A853] border border-[#D1EED8]">
//                             Password updated successfully! Transporting to login screen...
//                         </div>
//                     )}
//
//                     <form onSubmit={handleSubmit} className="mt-6 space-y-4">
//                         <div>
//                             <Label>New Password</Label>
//                             <div className="relative">
//                                 <input
//                                     type={showPassword ? "text" : "password"}
//                                     required
//                                     minLength={8}
//                                     placeholder="At least 8 characters"
//                                     value={password}
//                                     onChange={(event) => setPassword(event.target.value)}
//                                     className={inputClass}
//                                     disabled={isSuccess}
//                                 />
//                                 <button
//                                     type="button"
//                                     onClick={() => setShowPassword((prev) => !prev)}
//                                     className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A49B90] transition hover:text-[#A23A16]"
//                                     aria-label={showPassword ? "Hide password" : "Show password"}
//                                 >
//                                     {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                                 </button>
//                             </div>
//                         </div>
//
//                         <div>
//                             <Label>Confirm New Password</Label>
//                             <div className="relative">
//                                 <input
//                                     type={showConfirmPassword ? "text" : "password"}
//                                     required
//                                     placeholder="Re-enter password string"
//                                     value={confirmPassword}
//                                     onChange={(event) => setConfirmPassword(event.target.value)}
//                                     className={inputClass}
//                                     disabled={isSuccess}
//                                 />
//                                 <button
//                                     type="button"
//                                     onClick={() => setShowConfirmPassword((prev) => !prev)}
//                                     className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A49B90] transition hover:text-[#A23A16]"
//                                     aria-label={showConfirmPassword ? "Hide password" : "Show password"}
//                                 >
//                                     {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                                 </button>
//                             </div>
//                         </div>
//
//                         <button
//                             type="submit"
//                             disabled={isLoading || isSuccess}
//                             className="mt-2 h-12 w-full rounded-lg bg-[#A23A16] text-[15px] font-bold text-white transition hover:bg-[#211714] disabled:cursor-not-allowed disabled:opacity-60"
//                         >
//                             {isLoading ? "Saving changes..." : "Update Password"}
//                         </button>
//                     </form>
//
//                     <p className="mt-6 text-center text-[13.5px] font-medium text-[#5F5048]">
//                         Aborting process?{" "}
//                         <Link
//                             href="/login"
//                             className="font-bold text-[#A23A16] transition hover:text-[#211714]"
//                         >
//                             Back to Sign In
//                         </Link>
//                     </p>
//                 </div>
//             </main>
//         </div>
//     );
// }

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import api from "@/lib/axios";
import { clearTokens } from "@/lib/auth";

interface ResetPasswordPayload {
    resetToken: string;
    newPassword: string;
}

const inputClass =
    "h-12 w-full rounded-xl border border-[#E2D4C5] bg-white px-4 pr-12 text-[14px] font-medium text-[#211714] outline-none transition placeholder:text-[#A49B90] focus:border-[#A23A16] focus:ring-2 focus:ring-[#A23A16]/20";

function Label({ children }: { children: React.ReactNode }) {
    return (
        <label className="mb-1.5 block text-[13px] font-semibold text-[#211714]">
            {children}
        </label>
    );
}

function PasswordStrengthBar({ password }: { password: string }) {
    const checks = [
        password.length >= 6,
        /[A-Z]/.test(password),
        /[0-9]/.test(password),
        /[^A-Za-z0-9]/.test(password),
    ];
    const strength = checks.filter(Boolean).length;
    const colors = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-emerald-500"];
    const labels = ["", "Weak", "Fair", "Good", "Strong"];

    if (!password) return null;

    return (
        <div className="mt-2 space-y-1.5">
            <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i <= strength ? colors[strength] : "bg-[#F2ECE4]"
                        }`}
                    />
                ))}
            </div>
            {strength > 0 && (
                <p className={`text-[11px] font-semibold ${
                    strength <= 1 ? "text-red-400" :
                        strength === 2 ? "text-orange-400" :
                            strength === 3 ? "text-yellow-500" :
                                "text-emerald-500"
                }`}>
                    {labels[strength]}
                </p>
            )}
        </div>
    );
}

export default function ResetPasswordPage() {
    const router = useRouter();

    const [resetToken, setResetToken] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    // Read the reset token stored by verify-otp page
    // If it's missing the user navigated here directly — bounce them back
    useEffect(() => {
        const token = sessionStorage.getItem("pw_reset_token");
        if (!token) {
            router.replace("/forgot-password");
            return;
        }
        setResetToken(token);
    }, [router]);

    function validate(): string | null {
        if (newPassword.length < 6)  return "Password must be at least 6 characters.";
        if (newPassword.length > 72) return "Password must be under 72 characters.";
        if (newPassword !== confirmPassword) return "Passwords do not match.";
        return null;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        const validationError = validate();
        if (validationError) { setError(validationError); return; }
        if (!resetToken)     { setError("Session expired. Please start over."); return; }

        setIsLoading(true);

        const payload: ResetPasswordPayload = {
            resetToken,   // ← ResetPasswordRequestDto.resetToken
            newPassword,  // ← ResetPasswordRequestDto.newPassword
        };

        try {
            await api.post("/api/auth/reset-password", payload);

            // Wipe stale session so /login doesn't auto-redirect with old token
            clearTokens();

            sessionStorage.removeItem("pw_reset_token");
            sessionStorage.removeItem("pw_reset_email");

            setIsSuccess(true);
            setTimeout(() => router.push("/login"), 2500);
        } catch (err: any) {
            const msg =
                err.response?.data?.message ??
                err.response?.data?.error ??
                "Failed to reset password. Your session may have expired.";
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    }

    const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;
    const isDisabled = isLoading || isSuccess;

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

                    {/* Header */}
                    <div className="text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FEF0EE]">
                            <ShieldCheck size={22} className="text-[#A23A16]" />
                        </div>
                        <p className="text-[11px] font-black uppercase tracking-[0.35em] text-[#8A8177]">
                            Final Step
                        </p>
                        <h1 className="mt-1.5 text-[38px] tracking-tight text-[#211714] [font-family:Georgia,serif] font-normal">
                            New password
                        </h1>
                        <p className="mx-auto mt-2 max-w-[360px] text-[13.5px] font-medium leading-relaxed text-[#5F5048]">
                            Create a strong password to secure your RE:WEAR account.
                        </p>
                    </div>

                    {/* Feedback banners */}
                    {error && (
                        <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-[#FDF3F2] border border-[#FADCD9] px-4 py-3">
                            <AlertCircle size={16} className="text-[#EA4335] mt-0.5 shrink-0" />
                            <p className="text-[13px] font-medium text-[#EA4335]">{error}</p>
                        </div>
                    )}

                    {isSuccess && (
                        <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-[#EBF7EE] border border-[#D1EED8] px-4 py-3">
                            <CheckCircle2 size={16} className="text-[#34A853] mt-0.5 shrink-0" />
                            <p className="text-[13px] font-medium text-[#34A853]">
                                Password updated! Redirecting to sign in…
                            </p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>

                        {/* New Password */}
                        <div>
                            <Label>New Password</Label>
                            <div className="relative">
                                <input
                                    type={showNew ? "text" : "password"}
                                    required
                                    placeholder="At least 6 characters"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className={inputClass}
                                    disabled={isDisabled}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew((p) => !p)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A49B90] transition hover:text-[#A23A16]"
                                >
                                    {showNew ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>
                            <PasswordStrengthBar password={newPassword} />
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <Label>Confirm New Password</Label>
                            <div className="relative">
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    required
                                    placeholder="Re-enter your new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`${inputClass} ${
                                        confirmPassword.length > 0
                                            ? passwordsMatch
                                                ? "border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/20"
                                                : "border-red-300 focus:border-red-400 focus:ring-red-400/20"
                                            : ""
                                    }`}
                                    disabled={isDisabled}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm((p) => !p)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A49B90] transition hover:text-[#A23A16]"
                                >
                                    {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>

                            {confirmPassword.length > 0 && (
                                <p className={`mt-1.5 text-[11px] font-semibold ${
                                    passwordsMatch ? "text-emerald-500" : "text-red-400"
                                }`}>
                                    {passwordsMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
                                </p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isDisabled || !newPassword || !confirmPassword}
                            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#A23A16] text-[15px] font-bold text-white transition hover:bg-[#211714] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isLoading ? (
                                <><Loader2 size={16} className="animate-spin" /> Saving…</>
                            ) : isSuccess ? (
                                <><CheckCircle2 size={16} /> Updated!</>
                            ) : (
                                "Update Password"
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-[13.5px] font-medium text-[#5F5048]">
                        Want to abort?{" "}
                        <Link href="/login" className="font-bold text-[#A23A16] transition hover:text-[#211714]">
                            Back to Sign In
                        </Link>
                    </p>
                </div>
            </main>
        </div>
    );
}