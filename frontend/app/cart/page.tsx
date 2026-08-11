"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    Trash2,
    ShieldCheck,
    ShoppingBag,
    Leaf,
    Shirt,
    X,
    RefreshCw,
    CreditCard,
    Package,
    CalendarDays,
    MapPin,
    Truck,
    Clock,
    Info,
    Loader2,
} from "lucide-react";
import { useCart } from "@/lib/CartContext";
import api from "@/lib/axios";

const STATUS_PILL: Record<string, string> = {
    THRIFT: "bg-[#1A1A1A] text-[#FAF6F0]",
    RENT: "bg-[#3D5C30] text-white",
    "THRIFT + RENT": "bg-[#9E2A1B] text-white",
};

const RESERVATION_WINDOW_MS = 2 * 60 * 60 * 1000;
const RESERVATION_STORAGE_KEY = "cartReservationStartedAt";

function formatCountdown(ms: number) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export default function CartPage() {
    const { cartItems: items, removeFromCart: removeItem, subtotal } = useCart();
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [remainingMs, setRemainingMs] = useState<number | null>(null);
    const [orderId, setOrderId] = useState<number | null>(null);
    const [creatingOrder, setCreatingOrder] = useState(false);
    const hadItemsBefore = useRef(false);

    useEffect(() => {
        if (items.length > 0) {
            const existing = localStorage.getItem(RESERVATION_STORAGE_KEY);
            if (!existing) {
                localStorage.setItem(RESERVATION_STORAGE_KEY, Date.now().toString());
            }
            hadItemsBefore.current = true;
        } else if (hadItemsBefore.current) {
            localStorage.removeItem(RESERVATION_STORAGE_KEY);
            hadItemsBefore.current = false;
        }
    }, [items.length]);

    useEffect(() => {
        if (items.length === 0) {
            setRemainingMs(null);
            return;
        }

        const tick = () => {
            const startedAt = Number(localStorage.getItem(RESERVATION_STORAGE_KEY) ?? Date.now());
            const elapsed = Date.now() - startedAt;
            const remaining = RESERVATION_WINDOW_MS - elapsed;
            setRemainingMs(remaining);

            if (remaining <= 0) {
                items.forEach((item) => removeItem(item.id));
                localStorage.removeItem(RESERVATION_STORAGE_KEY);
            }
        };

        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items.length]);

    // ── FIX: real per-item shipping instead of a flat Rs. 595 ──
    // Pickup items never carry a shipping cost. Shipping items sum their
    // own deliveryFee, which BuyNowModal/RentNowModal already computed
    // from real Listing data (fixed or haversine-based dynamic rates).
    const shipping = items
        .filter((i) => i.fulfillment !== "pickup")
        .reduce((sum, i) => sum + (i.deliveryFee ?? 0), 0);

    // ── FIX: real per-item security deposit instead of a flat Rs. 2500 ──
    // Sums each rental item's own securityDeposit (sourced from
    // Listing.securityDeposit via RentNowModal). Thrift items simply
    // don't carry this field, so they contribute 0.
    const rentalDeposit = items.reduce(
        (sum, i) => sum + (i.securityDeposit ?? 0),
        0
    );

    const total = subtotal + shipping + rentalDeposit; // raw NPR number

    const fmt = (n?: number) =>
        `Rs. ${(n ?? 0).toLocaleString("en-IN", {
            minimumFractionDigits: 0,
        })}`;

    const isExpiringSoon = remainingMs !== null && remainingMs <= 5 * 60 * 1000;

    async function handleCheckoutClick() {
        setCreatingOrder(true);
        try {
            const { data } = await api.post("/api/orders", {
                items: items.map((i) => ({
                    listingId: i.id,
                    name: i.name,
                    image: i.image,
                    price: i.price,
                    status: i.status,
                    rentalStart: i.rentalStart ?? null,
                    rentalEnd: i.rentalEnd ?? null,
                    rentalDays: i.rentalDays ?? null,
                    returnDeadline: i.returnDeadline ?? null,
                })),
                totalAmountNpr: total,
            });
            setOrderId(data.id);
            setPaymentModalOpen(true);
        } catch (err) {
            console.error(err);
            alert("Could not start checkout. Please try again.");
        } finally {
            setCreatingOrder(false);
        }
    }


    return (
        <div className="min-h-screen bg-[#FAF6F0] text-[#1A130E] antialiased">
            <main className="mx-auto max-w-[1240px] px-6 pb-24 pt-8 lg:px-8">

                <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="font-serif text-[42px] font-normal leading-[1.1] tracking-tight text-[#1A130E]">
                            Your Cart
                        </h1>
                        <p className="mt-1 text-[13px] text-[#6E6053]">
                            Review your selected finds before checkout.
                        </p>
                    </div>
                    {items.length > 0 && remainingMs !== null && (
                        <div
                            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] shadow-sm transition ${
                                isExpiringSoon
                                    ? "border-[#9E2A1B]/40 bg-[#FFF5F5] text-[#9E2A1B]"
                                    : "border-[#EBE3D5] bg-white text-[#4F4338]"
                            }`}
                        >
                            <Clock size={14} className={isExpiringSoon ? "text-[#9E2A1B]" : "text-[#9E2A1B]"} />
                            <span>Your items are reserved for</span>
                            <span className="font-bold text-[#9E2A1B]">{formatCountdown(remainingMs)}</span>
                        </div>
                    )}
                </div>

                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#DDD5C8] bg-white py-24 text-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FAF6F0] text-[#8C7E74]">
                            <ShoppingBag size={24} />
                        </div>
                        <h2 className="font-serif text-[22px] font-normal text-[#1A130E]">
                            Your cart feels a bit light
                        </h2>
                        <p className="mt-2 max-w-xs text-[13px] text-[#6E6053]">
                            Explore our catalog to discover authentic, curated vintage garments.
                        </p>
                        <Link
                            href="/browse-finds"
                            className="mt-6 rounded-xl bg-[#9E2A1B] px-6 py-3 text-[13px] font-bold text-white transition hover:bg-[#832215]"
                        >
                            Explore Wardrobe
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.8fr_1fr] lg:items-start">

                        <div className="space-y-3">
                            {items.map((item) => {
                                const isPickup = item.fulfillment === "pickup";
                                const isRent = item.status === "RENT" || item.status === "THRIFT + RENT";
                                const feeLabel = isPickup ? "Pickup" : "Delivery Fee";
                                const feeValue =
                                    (item.deliveryFee ?? 0) === 0
                                        ? "Free"
                                        : fmt(item.deliveryFee);

                                return (
                                    <div
                                        key={item.id}
                                        className="relative flex overflow-hidden rounded-xl border border-[#E8E0D5] bg-white shadow-sm transition hover:shadow-md"
                                    >
                                        <div className="relative h-auto w-[150px] shrink-0 self-stretch overflow-hidden bg-[#F0EAE0]">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                sizes="150px"
                                                className="object-cover"
                                            />
                                            <span
                                                className={`absolute left-2 top-2 rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${STATUS_PILL[item.status]}`}
                                            >
                                                {item.status}
                                            </span>
                                        </div>

                                        <div className="flex flex-1 flex-col justify-between px-5 py-4">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${STATUS_PILL[item.status]}`}
                                                    >
                                                        {item.status}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 rounded-full border border-[#EBE3D5] bg-[#FAF8F5] px-2 py-0.5 text-[10px] font-semibold text-[#6E6053]">
                                                        {isPickup ? <MapPin size={10} /> : <Truck size={10} />}
                                                        {isPickup ? "Pickup" : "Shipping"}
                                                    </span>
                                                </div>

                                                <div className="mt-2 flex items-start justify-between gap-3">
                                                    <h3 className="font-serif text-[15px] font-bold leading-snug text-[#1A130E]">
                                                        {item.name}
                                                    </h3>
                                                    <div className="shrink-0 text-right">
                                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#8C7E74]">
                                                            {feeLabel}
                                                        </p>
                                                        <p className={`text-[13px] font-bold ${item.deliveryFee === 0 ? "text-[#4A6B3A]" : "text-[#1A130E]"}`}>
                                                            {feeValue}
                                                        </p>
                                                    </div>
                                                </div>

                                                {isRent && item.rentalStart && item.rentalEnd && (
                                                    <p className="mt-0.5 text-[12px] font-medium text-[#4A6B3A]">
                                                        {item.rentalStart} – {item.rentalEnd}
                                                        {item.rentalDays ? ` (${item.rentalDays} Day${item.rentalDays > 1 ? "s" : ""})` : ""}
                                                    </p>
                                                )}

                                                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px] text-[#6E6053]">
                                                    <span>Size: <strong className="font-semibold text-[#1A130E]">{item.size}</strong></span>
                                                    {!isRent && (
                                                        <span>Brand: <strong className="font-semibold text-[#1A130E]">{item.brand}</strong></span>
                                                    )}
                                                </div>

                                                {/* NEW: show each rental item's own refundable deposit inline,
                                                    so the per-item card matches what the summary now sums. */}
                                                {isRent && (item.securityDeposit ?? 0) > 0 && (
                                                    <p className="mt-0.5 text-[12px] text-[#6E6053]">
                                                        Deposit: <strong className="font-semibold text-[#1A130E]">{fmt(item.securityDeposit)}</strong> (Refundable)
                                                    </p>
                                                )}

                                                <div className="flex items-center justify-between w-full mt-1">
                                                    <p className="text-[17px] font-bold text-[#9E2A1B]">
                                                        {item.price}
                                                    </p>
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#EBE3D5] bg-[#FAF6F0] text-[#A89E94] transition hover:border-[#9E2A1B] hover:bg-[#FFF5F5] hover:text-[#9E2A1B]"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="mt-3 flex items-end justify-between gap-2">
                                                {isPickup && item.pickupArea && (
                                                    <div className="flex flex-1 flex-col gap-1 rounded-lg border border-[#DCE4DA] bg-[#F0F6ED] px-3 py-2 text-[11px] text-[#3E5A33]">
                                                        <span className="flex items-start gap-1.5">
                                                            <MapPin size={12} className="mt-0.5 shrink-0 text-[#4A6B3A]" />
                                                            Pickup Location: <strong className="font-semibold">{item.pickupArea}</strong>
                                                        </span>
                                                        {item.pickupHours && (
                                                            <span className="flex items-start gap-1.5">
                                                                <Clock size={12} className="mt-0.5 shrink-0 text-[#4A6B3A]" />
                                                                Pickup Hours: <strong className="font-semibold">{item.pickupHours}</strong>
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {isRent && (item.rentalDays || item.returnDeadline) && (
                                                    <div className="flex flex-1 flex-col gap-1 rounded-lg border border-[#DCD5F1] bg-[#F3F1FB] px-3 py-2 text-[11px] text-[#5B4FC0]">
                                                        {item.rentalDays && (
                                                            <span className="flex items-center gap-1.5">
                                                                <CalendarDays size={12} className="shrink-0" />
                                                                Rental Duration: <strong className="font-semibold">{item.rentalDays} Days</strong>
                                                            </span>
                                                        )}
                                                        {item.returnDeadline && (
                                                            <span className="flex items-center gap-1.5">
                                                                <Clock size={12} className="shrink-0" />
                                                                Return Deadline: <strong className="font-semibold">{item.returnDeadline}</strong>
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {!isPickup && !isRent && (
                                                    <div className="flex-1" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="sticky top-6 w-full rounded-2xl border border-[#EBE3D5] bg-[#FCFAF7] p-6 shadow-sm">
                            <h2 className="font-serif text-[26px] font-normal tracking-tight text-[#1A130E]">
                                Order Summary
                            </h2>
                            <p className="mt-0.5 text-[12px] text-[#8C7E74]">
                                {items.length} {items.length === 1 ? "item" : "items"} in your cart
                            </p>

                            <div className="mt-4 space-y-2 border-b border-[#EBE3D5] pb-4">
                                {items.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between gap-2 text-[12px]">
                                        <span className="truncate max-w-[170px] text-[#4F4338]">{item.name}</span>
                                        <span className="shrink-0 font-semibold text-[#1A130E]">{item.price}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 space-y-3 text-[14px]">
                                <div className="flex justify-between text-[#4F4338]">
                                    <span className="text-[#5C5249]">
                                        Subtotal ({items.length} {items.length === 1 ? "item" : "items"})
                                    </span>
                                    <span className="font-semibold text-[#1A130E]">{fmt(subtotal)}</span>
                                </div>

                                <div className="flex items-center justify-between text-[#4F4338]">
                                    <div className="flex items-center gap-1.5 text-[#5C5249]">
                                        <span>Shipping</span>
                                        <button className="text-[#A89E94] hover:text-[#6E6053] transition">
                                            <Info size={13} strokeWidth={2} />
                                        </button>
                                    </div>
                                    <span className="font-semibold text-[#1A130E]">
                                        {shipping === 0 ? "Free" : fmt(shipping)}
                                    </span>
                                </div>

                                {rentalDeposit > 0 && (
                                    <div className="flex items-center justify-between text-[#4F4338]">
                                        <div className="flex items-center gap-1.5 text-[#5C5249]">
                                            <span>Rental Deposit</span>
                                            <button className="text-[#A89E94] hover:text-[#6E6053] transition">
                                                <Info size={13} strokeWidth={2} />
                                            </button>
                                        </div>
                                        <span className="font-semibold text-[#1A130E]">{fmt(rentalDeposit)}</span>
                                    </div>
                                )}

                                <div className="flex items-baseline justify-between rounded-xl bg-[#FAF0E6] px-4 py-3 border border-[#EBE3D5]">
                                    <span className="text-[15px] font-bold text-[#1A130E]">Total</span>
                                    <span className="text-[24px] font-bold text-[#9E2A1B]">{fmt(total)}</span>
                                </div>
                            </div>

                            <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#DCE4DA] bg-[#F3F6F2] px-4 py-3">
                                <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#4A6B3A]" />
                                <p className="text-[11px] leading-relaxed text-[#405A35]">
                                    Great choice! You're saving pieces from landfill and supporting sustainable fashion.
                                </p>
                            </div>

                            <div className="mt-5 space-y-2.5">
                                <button
                                    onClick={handleCheckoutClick}
                                    disabled={creatingOrder}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#9E2A1B] py-3.5 text-[14px] font-bold text-white shadow-sm transition hover:bg-[#832215] disabled:opacity-60"
                                >
                                    {creatingOrder ? (
                                        <Loader2 size={15} className="animate-spin" />
                                    ) : (
                                        <ShoppingBag size={15} />
                                    )}
                                    {creatingOrder ? "Preparing checkout…" : "Checkout Securely"}
                                </button>
                                <Link
                                    href="/browse-finds"
                                    className="flex w-full items-center justify-center rounded-xl border border-[#9E2A1B] bg-transparent py-3.5 text-[14px] font-bold text-[#9E2A1B] transition hover:bg-[#FAF6F0]"
                                >
                                    Continue Shopping
                                </Link>
                            </div>

                            <div className="mt-5 space-y-3 border-t border-[#EBE3D5] pt-4">
                                {[
                                    { icon: ShoppingBag, title: "Secure checkout", desc: "Your information is protected" },
                                    { icon: ShieldCheck, title: "Authenticated items", desc: "Quality-checked by our experts" },
                                    { icon: RefreshCw,   title: "Easy returns", desc: "14-day returns & exchanges" },
                                ].map(({ icon: Icon, title, desc }) => (
                                    <div key={title} className="flex items-start gap-3">
                                        <Icon size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-[#6E6053]" />
                                        <div>
                                            <p className="text-[12px] font-bold text-[#1A130E]">{title}</p>
                                            <p className="text-[11px] text-[#6E6053]">{desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {items.length > 0 && (
                    <div className="mt-14 rounded-2xl border border-[#EBE3D5]/60 bg-[#F7F3EE]/50 p-6 shadow-sm">
                        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                { icon: Leaf,        title: "Sustainable by Design", desc: "Every purchase helps reduce waste and support slow fashion." },
                                { icon: Shirt,       title: "Curated with Care",     desc: "Handpicked pieces with quality and authenticity." },
                                { icon: ShieldCheck, title: "Quality You Can Trust", desc: "Inspected items. Fair pricing. Honest condition." },
                                { icon: RefreshCw,   title: "Better for the Planet", desc: "Extending the life of fashion, one find at a time." },
                            ].map(({ icon: Icon, title, desc }, index) => (
                                <div
                                    key={title}
                                    className={`flex items-center gap-4 px-4 sm:py-2 text-left ${
                                        index !== 3 ? "lg:border-r lg:border-[#E1D8CC]" : ""
                                    }`}
                                >
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#DCD3C7] bg-transparent text-[#65574C]">
                                        <Icon size={20} strokeWidth={1.2} />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h4 className="font-serif text-[14px] font-normal tracking-wide text-[#1A130E]">{title}</h4>
                                        <p className="max-w-[190px] text-[11px] leading-relaxed text-[#7A6C5F]">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {paymentModalOpen && orderId !== null && (
                    <PaymentModal
                        total={total}
                        orderId={orderId}
                        onClose={() => setPaymentModalOpen(false)}
                    />
                )}
            </main>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════
   PAYMENT MODAL — Online-only, wired to backend /api/payments
══════════════════════════════════════════════════════════ */
function PaymentModal({
                          total,
                          orderId,
                          onClose,
                      }: {
    total: number; // raw NPR
    orderId: number;
    onClose: () => void;
}) {
    const [selectedPayment, setSelectedPayment] = useState<"esewa" | "khalti">("esewa");
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fmt = (n: number) =>
        `Rs. ${n.toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;

    const paymentOptions = [
        {
            id: "esewa" as const,
            name: "eSewa",
            desc: "Pay easily with eSewa",
            recommended: true,
            logo: "/images/esewa.png",
        },
        {
            id: "khalti" as const,
            name: "Khalti",
            desc: "Pay easily with Khalti",
            recommended: false,
            logo: "/images/khalti.png",
        },
    ];

    async function handlePay() {
        setProcessing(true);
        setError(null);
        try {
            const { data } = await api.post("/api/payments/initiate", {
                orderId,
                amountNpr: total,
                paymentGateway: selectedPayment.toUpperCase(),
                successUrl: `${window.location.origin}/cart/checkout/success`,
                failureUrl: `${window.location.origin}/cart/checkout/failure`,
            });

            if (data.gateway === "ESEWA") {
                // eSewa needs a real browser form POST — axios can't do this,
                // so build a plain HTML form and submit it directly
                const form = document.createElement("form");
                form.method = "POST";
                form.action = data.gatewayRedirectUrl;
                Object.entries(data.gatewayFormFields as Record<string, string>).forEach(
                    ([key, value]) => {
                        const input = document.createElement("input");
                        input.type = "hidden";
                        input.name = key;
                        input.value = value;
                        form.appendChild(input);
                    }
                );
                document.body.appendChild(form);
                form.submit();
            } else if (data.gateway === "KHALTI") {
                window.location.href = data.gatewayRedirectUrl;
            }
        } catch (err) {
            console.error(err);
            setError("Something went wrong starting your payment. Please try again.");
            setProcessing(false);
        }
    }

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-[700px] rounded-2xl border border-[#EBE3D5] bg-[#FCFAF7] shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-[#EBE3D5] bg-white text-[#6E6053] transition hover:bg-[#F4ECE3] z-10"
                >
                    <X size={15} />
                </button>

                <div className="px-8 pt-5 pb-3 text-center">
                    <h2 className="font-serif text-[24px] font-normal tracking-wide text-[#1A130E]">
                        Complete Your Payment
                    </h2>
                    <p className="mt-0.5 text-[13px] text-[#6E6053]">
                        Pay <span className="font-bold text-[#9E2A1B]">{fmt(total)}</span> securely online.
                    </p>
                </div>

                <div className="px-8 pb-5">
                    <div className="rounded-xl border border-[#EBE3D5] bg-[#FAF8F5] p-4 sm:p-5">
                        <div className="mb-2 flex justify-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#EBE3D5] bg-white">
                                <CreditCard size={22} strokeWidth={1.4} className="text-[#9E2A1B]" />
                            </div>
                        </div>
                        <h3 className="mb-1 text-center font-serif text-[20px] font-normal text-[#1A130E]">
                            Pay Online
                        </h3>
                        <div className="mb-2 flex justify-center">
                            <span className="rounded-full bg-[#F5ECD5] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#8C6A2A]">
                                Secure & Instant
                            </span>
                        </div>
                        <p className="mb-3 text-center text-[12px] leading-relaxed text-[#6E6053]">
                            Pay securely using your preferred digital wallet.
                        </p>
                        <p className="mb-2 text-center text-[12px] font-semibold text-[#4F4338]">
                            Select your payment option
                        </p>

                        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {paymentOptions.map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => setSelectedPayment(option.id)}
                                    disabled={processing}
                                    className={`relative flex flex-col items-center justify-between rounded-xl border p-3.5 transition disabled:opacity-60 ${
                                        selectedPayment === option.id
                                            ? "border-[#9E2A1B] bg-white ring-1 ring-[#9E2A1B]/20"
                                            : "border-[#DDD5C8] bg-white hover:border-[#C4B8AE]"
                                    }`}
                                >
                                    {option.recommended && (
                                        <span className="absolute -top-2.5 right-4 rounded-full border border-[#C8A96A] bg-[#FBF3E2] px-2 py-0.5 text-[9px] font-bold text-[#8C6A2A]">
                                            Recommended
                                        </span>
                                    )}

                                    <div className="flex w-full items-center justify-between mb-1">
                                        <div className="shrink-0">
                                            {selectedPayment === option.id ? (
                                                <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#9E2A1B] bg-[#9E2A1B]">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                                </div>
                                            ) : (
                                                <div className="h-4 w-4 rounded-full border-2 border-[#C4B8AE]" />
                                            )}
                                        </div>
                                    </div>

                                    <div className="relative h-14 w-36 shrink-0 overflow-hidden my-1">
                                        <Image
                                            src={option.logo}
                                            alt={option.name}
                                            fill
                                            className="object-contain scale-110"
                                        />
                                    </div>

                                    <p className="mt-1 text-center text-[11px] text-[#6E6053]">
                                        {option.desc}
                                    </p>
                                </button>
                            ))}
                        </div>

                        {error && (
                            <p className="mb-3 text-center text-[12px] font-semibold text-[#9E2A1B]">
                                {error}
                            </p>
                        )}

                        <button
                            onClick={handlePay}
                            disabled={processing}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#9E2A1B] py-3 text-[14px] font-bold text-white transition hover:bg-[#832215] disabled:opacity-60"
                        >
                            {processing && <Loader2 size={15} className="animate-spin" />}
                            {processing
                                ? "Redirecting…"
                                : `Pay ${fmt(total)} via ${selectedPayment === "esewa" ? "eSewa" : "Khalti"}`}
                        </button>

                        <p className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-[#8C7E74]">
                            <ShieldCheck size={12} strokeWidth={1.6} className="text-[#A89E94]" />
                            Secure payment. Encrypted & trusted.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#EBE3D5] border-t border-[#EBE3D5] px-6 py-3">
                    {[
                        { icon: ShieldCheck, title: "Secure Checkout", desc: "Your information is safe and encrypted." },
                        { icon: Package,     title: "Verified Items",  desc: "Every item is authenticated." },
                        { icon: RefreshCw,   title: "Easy Returns",    desc: "14-day returns & exchanges." },
                    ].map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="flex items-start gap-2.5 p-2 sm:px-4 first:pl-0 last:pr-0">
                            <Icon size={17} strokeWidth={1.6} className="mt-0.5 shrink-0 text-[#9E2A1B]" />
                            <div>
                                <p className="text-[12px] font-bold text-[#1A130E]">{title}</p>
                                <p className="text-[10.5px] leading-snug text-[#6E6053]">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}