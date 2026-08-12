"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import api from "@/lib/axios";
import { useCart } from "@/lib/CartContext";

type VerifyState = "verifying" | "success" | "failed";

const RESERVATION_STORAGE_KEY = "cartReservationStartedAt";

export default function CheckoutSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { clearCart } = useCart();
    const [state, setState] = useState<VerifyState>("verifying");
    const hasRun = useRef(false); // guard against React StrictMode double-invoke

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        async function verify() {
            try {
                const esewaData = searchParams.get("data");
                const khaltiPidx = searchParams.get("pidx");
                const khaltiStatus = searchParams.get("status");
                const khaltiTransactionId = searchParams.get("transaction_id");
                const khaltiPurchaseOrderId = searchParams.get("purchase_order_id");

                let payload: {
                    referenceId: string;
                    gatewayResponseData: string | null;
                    gatewayTransactionId: string | null;
                };

                if (esewaData) {
                    const decoded = JSON.parse(atob(esewaData));
                    payload = {
                        referenceId: decoded.transaction_uuid,
                        gatewayResponseData: esewaData,
                        gatewayTransactionId: null,
                    };
                } else if (khaltiPidx) {
                    if (khaltiStatus !== "Completed") {
                        setState("failed");
                        toast.error("Payment was not completed.");
                        setTimeout(() => router.push("/cart/checkout/failure"), 1500);
                        return;
                    }
                    payload = {
                        referenceId: khaltiPurchaseOrderId ?? "",
                        gatewayResponseData: null,
                        gatewayTransactionId: khaltiTransactionId,
                    };
                } else {
                    throw new Error("Missing payment callback parameters");
                }

                const { data } = await api.post("/api/payments/verify", payload);

                if (data.status === "SUCCESS") {
                    setState("success");
                    // Cart's job is done — order is confirmed server-side and
                    // will now show up via /api/orders → order-history.
                    clearCart();
                    localStorage.removeItem(RESERVATION_STORAGE_KEY);
                    toast.success("Payment successful! Your order is confirmed.");
                    setTimeout(() => router.push("/profile/order-history"), 1500);
                } else {
                    setState("failed");
                    toast.error("Payment could not be verified. Please contact support.");
                    setTimeout(() => router.push("/cart/checkout/failure"), 1800);
                }
            } catch (err) {
                console.error(err);
                setState("failed");
                toast.error("Something went wrong verifying your payment.");
                setTimeout(() => router.push("/cart/checkout/failure"), 1800);
            }
        }

        verify();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#FAF6F0] px-4">
            <div className="flex flex-col items-center gap-4 text-center">
                {state === "verifying" && (
                    <>
                        <Loader2 size={40} className="animate-spin text-[#9E2A1B]" />
                        <p className="text-[15px] font-semibold text-[#1A130E]">Verifying your payment…</p>
                        <p className="text-[13px] text-[#8C7E74]">Please don't close this page.</p>
                    </>
                )}
                {state === "success" && (
                    <>
                        <CheckCircle2 size={40} className="text-[#4A6B3A]" />
                        <p className="text-[15px] font-semibold text-[#1A130E]">Payment confirmed!</p>
                        <p className="text-[13px] text-[#8C7E74]">Redirecting to your order history…</p>
                    </>
                )}
                {state === "failed" && (
                    <>
                        <XCircle size={40} className="text-[#9E2A1B]" />
                        <p className="text-[15px] font-semibold text-[#1A130E]">Payment verification failed</p>
                        <p className="text-[13px] text-[#8C7E74]">Redirecting you back…</p>
                    </>
                )}
            </div>
        </div>
    );
}