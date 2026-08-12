"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { XCircle, RefreshCw } from "lucide-react";

export default function CheckoutFailurePage() {
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;
        toast.error("Payment failed or was cancelled.");
    }, []);

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#FAF6F0] px-4">
            <div className="w-full max-w-[420px] rounded-2xl border border-[#EBE3D5] bg-white p-8 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF5F5] text-[#9E2A1B]">
                    <XCircle size={26} />
                </div>
                <h1 className="font-serif text-[22px] font-normal text-[#1A130E]">
                    Payment didn't go through
                </h1>
                <p className="mt-2 text-[13px] leading-relaxed text-[#6E6053]">
                    No charge was made. Your items are still in your cart, so you can pick up right where you left off.
                </p>

                <div className="mt-6 flex flex-col gap-2.5">
                    <Link
                        href="/cart"
                        className="flex items-center justify-center gap-2 rounded-xl bg-[#9E2A1B] py-3 text-[13px] font-bold text-white transition hover:bg-[#832215]"
                    >
                        <RefreshCw size={14} />
                        Return to Cart & Retry
                    </Link>
                    <Link
                        href="/browse-finds"
                        className="flex items-center justify-center rounded-xl border border-[#EBE3D5] py-3 text-[13px] font-bold text-[#594E46] transition hover:bg-[#FAF6F0]"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}