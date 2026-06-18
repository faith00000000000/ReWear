"use client";

import React, { useState } from "react";
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
    Banknote,
    CreditCard,
    Package,
    CalendarDays,
    Scissors,
    Info,
} from "lucide-react";
import { useCart, CartItem } from "@/lib/CartContext";

const STATUS_PILL: Record<string, string> = {
    THRIFT: "bg-[#1A1A1A] text-[#FAF6F0]",
    RENT: "bg-[#3D5C30] text-white",
    "THRIFT + RENT": "bg-[#9E2A1B] text-white",
};

export default function CartPage() {
    const { cartItems: items, removeFromCart: removeItem } = useCart();
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);

    const subtotal = items.reduce((acc, item) => {
        const n = parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0;
        return acc + n;
    }, 0);

    const shipping = subtotal > 0 ? 595 : 0;
    const rentalDeposit =
        items.filter((i) => i.status === "RENT" || i.status === "THRIFT + RENT").length > 0
            ? 2500
            : 0;
    const total = subtotal + shipping + rentalDeposit;

    const fmt = (n: number) => `Rs. ${n.toLocaleString("en-IN")}`;

    return (
        <div className="min-h-screen bg-[#FAF6F0] text-[#1A130E] antialiased">
            <div>
                <main className="mx-auto max-w-[1240px] px-6 pb-24 pt-8 lg:px-8">

                    {/* ── Page Header ── */}
                    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h1 className="font-serif text-[42px] font-normal leading-[1.1] tracking-tight text-[#1A130E]">
                                Your Cart
                            </h1>
                            <p className="mt-1 text-[13px] text-[#6E6053]">
                                Review your selected finds before checkout.
                            </p>
                        </div>

                        {items.length > 0 && (
                            <div className="flex items-center gap-2 rounded-full border border-[#EBE3D5] bg-white px-4 py-2 text-[13px] text-[#4F4338] shadow-sm">
                                <ShoppingBag size={14} className="text-[#9E2A1B]" />
                                <span>Your items are reserved for 30 minutes</span>
                                <span className="font-bold text-[#9E2A1B]">29:45</span>
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
                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.8fr_1fr] lg:items-start">

                            {/* ── LEFT: Cart Items ── */}
                            <div className="space-y-3">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="relative flex gap-0 overflow-hidden rounded-xl border border-[#E8E0D5] bg-white shadow-sm"
                                    >
                                        <div className="relative h-auto w-[176px] shrink-0 self-stretch overflow-hidden bg-[#F0EAE0]">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
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
                                                <div className="flex items-start justify-between gap-3">
                                                    <h3 className="font-serif text-[15px] font-bold leading-snug text-[#9E2A1B]">
                                                        {item.name}
                                                    </h3>
                                                    <p className="shrink-0 text-[17px] font-bold text-[#9E2A1B]">
                                                        {item.price}
                                                    </p>
                                                </div>

                                                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px] text-[#6E6053]">
                                                    <span>Size: <strong className="font-semibold text-[#1A130E]">{item.size}</strong></span>
                                                    <span>Color: <strong className="font-semibold text-[#1A130E]">{item.color}</strong></span>
                                                    <span>Condition: <strong className="font-semibold text-[#1A130E]">{item.condition}</strong></span>
                                                </div>

                                                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 text-[12px] text-[#6E6053]">
                                                    <span>Category: <strong className="font-semibold text-[#1A130E]">{item.category}</strong></span>
                                                    <span>Brand: <strong className="font-semibold text-[#1A130E]">{item.brand}</strong></span>
                                                </div>
                                            </div>

                                            <div className="mt-3 flex items-end justify-between gap-2">
                                                {item.note && (
                                                    <div className="flex w-fit items-center gap-1.5 rounded-lg border border-[#EBE3D5] bg-[#FAF8F5] px-3 py-1.5 text-[11px] text-[#6E6053]">
                                                        {item.status === "RENT" ? (
                                                            <CalendarDays size={12} className="shrink-0 text-[#4A6B3A]" />
                                                        ) : item.status === "THRIFT + RENT" ? (
                                                            <Scissors size={12} className="shrink-0 text-[#9E2A1B]" />
                                                        ) : (
                                                            <Leaf size={12} className="shrink-0 text-[#9E2A1B]" />
                                                        )}
                                                        {item.note}
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#EBE3D5] bg-[#FAF6F0] text-[#A89E94] transition hover:border-[#9E2A1B] hover:text-[#9E2A1B]"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* ── RIGHT: Order Summary ── */}
                            <div className="w-full max-w-[620px] bg-[#FCFAF7] p-6 rounded-2xl">
                                <h2 className="font-serif text-[32px] font-normal tracking-tight text-[#1A130E] mb-6">
                                    Order Summary
                                </h2>

                                <div className="space-y-4 text-[14px]">
                                    <div className="flex justify-between text-[#4F4338]">
                                        <span className="text-[#5C5249]">
                                            Subtotal ({items.length} {items.length === 1 ? "item" : "items"})
                                        </span>
                                        <span className="font-medium text-[#1A130E]">{fmt(subtotal)}</span>
                                    </div>

                                    <div className="flex items-center justify-between text-[#4F4338]">
                                        <div className="flex items-center gap-1.5 text-[#5C5249]">
                                            <span>Shipping</span>
                                            <button className="text-[#A89E94] hover:text-[#6E6053] transition">
                                                <Info size={14} strokeWidth={2} />
                                            </button>
                                        </div>
                                        <span className="font-medium text-[#1A130E]">{fmt(shipping)}</span>
                                    </div>

                                    {rentalDeposit > 0 && (
                                        <div className="flex items-center justify-between text-[#4F4338]">
                                            <div className="flex items-center gap-1.5 text-[#5C5249]">
                                                <span>Rental Deposit</span>
                                                <button className="text-[#A89E94] hover:text-[#6E6053] transition">
                                                    <Info size={14} strokeWidth={2} />
                                                </button>
                                            </div>
                                            <span className="font-medium text-[#1A130E]">{fmt(rentalDeposit)}</span>
                                        </div>
                                    )}

                                    <div className="flex items-baseline justify-between border-t border-[#EBE3D5] pt-5 mt-2">
                                        <span className="text-[16px] font-bold text-[#1A130E]">Total</span>
                                        <span className="text-[26px] font-bold text-[#9E2A1B]">{fmt(total)}</span>
                                    </div>
                                </div>

                                <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#DCE4DA] bg-[#F3F6F2] px-4 py-3.5">
                                    <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#4A6B3A]" />
                                    <p className="text-[12px] leading-relaxed text-[#405A35]">
                                        Great choice! You're saving pieces from landfill and supporting sustainable fashion.
                                    </p>
                                </div>

                                <div className="mt-5 space-y-3">
                                    <button
                                        onClick={() => setPaymentModalOpen(true)}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#9E2A1B] py-3.5 text-[14px] font-bold text-white shadow-sm transition hover:bg-[#832215]"
                                    >
                                        <ShoppingBag size={15} />
                                        Checkout Securely
                                    </button>

                                    <Link
                                        href="/browse-finds"
                                        className="flex w-full items-center justify-center rounded-xl border border-[#9E2A1B] bg-transparent py-4 text-[14px] font-bold text-[#9E2A1B] transition hover:bg-[#FAF6F0]"
                                    >
                                        Continue Shopping
                                    </Link>
                                </div>

                                <div className="mt-6 pt-2 space-y-4">
                                    <div className="flex items-start gap-3.5">
                                        <ShoppingBag size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-[#6E6053]" />
                                        <div>
                                            <p className="text-[12px] font-bold text-[#1A130E]">Secure checkout</p>
                                            <p className="text-[11px] text-[#6E6053] mt-0.5">Your information is protected</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3.5">
                                        <ShieldCheck size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-[#6E6053]" />
                                        <div>
                                            <p className="text-[12px] font-bold text-[#1A130E]">Authenticated items</p>
                                            <p className="text-[11px] text-[#6E6053] mt-0.5">Quality-checked by our experts</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3.5">
                                        <RefreshCw size={17} strokeWidth={1.5} className="mt-0.5 shrink-0 text-[#6E6053]" />
                                        <div>
                                            <p className="text-[12px] font-bold text-[#1A130E]">Easy returns</p>
                                            <p className="text-[11px] text-[#6E6053] mt-0.5">14-day returns & exchanges</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Bottom Feature Strip ── */}
                    {items.length > 0 && (
                        <div className="mt-16 rounded-2xl border border-[#EBE3D5]/60 bg-[#F7F3EE]/50 p-6 shadow-sm backdrop-blur-[2px]">
                            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
                                {[
                                    { icon: Leaf,        title: "Sustainable by Design", desc: "Every purchase helps reduce waste and support slow fashion." },
                                    { icon: Shirt,       title: "Curated with Care",     desc: "Handpicked pieces with quality and authenticity." },
                                    { icon: ShieldCheck, title: "Quality You Can Trust", desc: "Inspected items. Fair pricing. Honest condition." },
                                    { icon: RefreshCw,   title: "Better for the Planet", desc: "Extending the life of fashion, one find at a time." },
                                ].map(({ icon: Icon, title, desc }, index) => (
                                    <div
                                        key={title}
                                        className={`flex items-center gap-4 px-4 sm:py-2 text-left relative
                                            ${index !== 3 ? "lg:border-r lg:border-[#E1D8CC]" : ""}
                                        `}
                                    >
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#DCD3C7] bg-transparent text-[#65574C]">
                                            <Icon size={20} strokeWidth={1.2} />
                                        </div>
                                        <div className="space-y-0.5">
                                            <h4 className="font-serif text-[14px] font-normal tracking-wide text-[#1A130E]">
                                                {title}
                                            </h4>
                                            <p className="text-[11px] leading-relaxed text-[#7A6C5F] max-w-[190px]">
                                                {desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {paymentModalOpen && (
                        <PaymentModal
                            total={fmt(total)}
                            onClose={() => setPaymentModalOpen(false)}
                        />
                    )}
                </main>
            </div>
        </div>
    );
}

function PaymentModal({
                          total,
                          onClose,
                      }: {
    total: string;
    onClose: () => void;
}) {
    const [selectedPayment, setSelectedPayment] = useState<"esewa" | "khalti">("esewa");

    const paymentOptions = [
        {
            id: "esewa" as const,
            name: "eSewa",
            desc: "Pay easily with eSewa",
            recommended: true,
            color: "bg-[#60BB46]",
            initial: "e",
            initialColor: "text-white",
        },
        {
            id: "khalti" as const,
            name: "Khalti",
            desc: "Pay easily with Khalti",
            recommended: false,
            color: "bg-[#5C2D91]",
            initial: "K",
            initialColor: "text-white",
        },
    ];

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-[840px] rounded-2xl border border-[#EBE3D5] bg-[#FCFAF7] shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-[#EBE3D5] bg-white text-[#6E6053] transition hover:bg-[#F4ECE3]"
                >
                    <X size={15} />
                </button>

                <div className="px-8 pt-8 pb-6 text-center">
                    <h2 className="font-serif text-[26px] font-normal tracking-wide text-[#1A130E]">
                        Choose Your Payment Method
                    </h2>
                    <p className="mt-1.5 text-[13px] text-[#6E6053]">
                        Complete your order securely and safely.
                    </p>
                </div>

                <div className="relative grid grid-cols-2 gap-0 px-6 pb-5">
                    <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#DDD5C8] bg-[#FCFAF7] text-[11px] font-bold text-[#8C7E74]">
                            OR
                        </div>
                    </div>

                    {/* ── LEFT: Cash on Delivery ── */}
                    <div className="rounded-xl border border-[#EBE3D5] bg-[#FAF8F5] p-6 mr-3">
                        <div className="mb-4 flex justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#EBE3D5] bg-white">
                                <Banknote size={28} strokeWidth={1.4} className="text-[#9E2A1B]" />
                            </div>
                        </div>
                        <h3 className="mb-2 text-center font-serif text-[22px] font-normal text-[#1A130E]">
                            Cash on Delivery
                        </h3>
                        <div className="mb-4 flex justify-center">
                            <span className="rounded-full bg-[#F5ECD5] px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#8C6A2A]">
                                COD
                            </span>
                        </div>
                        <p className="mb-5 text-center text-[13px] leading-relaxed text-[#6E6053]">
                            Pay in cash when your order is delivered to your doorstep.
                        </p>
                        <div className="mb-5 space-y-2.5 rounded-xl border border-[#EBE3D5] bg-white px-4 py-3.5">
                            {[
                                { icon: ShieldCheck, text: "Pay only when you receive the item" },
                                { icon: Package,     text: "Open and inspect before payment" },
                                { icon: RefreshCw,   text: "Easy returns & exchanges" },
                            ].map(({ icon: Icon, text }) => (
                                <div key={text} className="flex items-center gap-2.5 text-[12px] text-[#4F4338]">
                                    <Icon size={14} strokeWidth={1.8} className="shrink-0 text-[#9E2A1B]" />
                                    {text}
                                </div>
                            ))}
                        </div>
                        <p className="mb-4 flex items-center justify-center gap-1.5 text-[12px] font-medium text-[#4F4338]">
                            <Banknote size={13} className="text-[#8C7E74]" />
                            Pay when the item is delivered.
                        </p>
                        <button className="w-full rounded-xl bg-[#9E2A1B] py-3.5 text-[14px] font-bold text-white transition hover:bg-[#832215]">
                            Confirm Cash on Delivery
                        </button>
                        <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-[#8C7E74]">
                            <ShieldCheck size={12} strokeWidth={1.6} className="text-[#A89E94]" />
                            100% Secure. Your order is protected.
                        </p>
                    </div>

                    {/* ── RIGHT: Pay Online ── */}
                    <div className="rounded-xl border border-[#EBE3D5] bg-[#FAF8F5] p-6 ml-3">
                        <div className="mb-4 flex justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#EBE3D5] bg-white">
                                <CreditCard size={26} strokeWidth={1.4} className="text-[#9E2A1B]" />
                            </div>
                        </div>
                        <h3 className="mb-2 text-center font-serif text-[22px] font-normal text-[#1A130E]">
                            Pay Online
                        </h3>
                        <div className="mb-4 flex justify-center">
                            <span className="rounded-full bg-[#F5ECD5] px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#8C6A2A]">
                                Secure & Instant
                            </span>
                        </div>
                        <p className="mb-4 text-center text-[13px] leading-relaxed text-[#6E6053]">
                            Pay securely using your preferred digital wallet.
                        </p>
                        <p className="mb-2.5 text-center text-[12px] font-semibold text-[#4F4338]">
                            Select your payment option
                        </p>
                        <div className="mb-5 space-y-2">
                            {paymentOptions.map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => setSelectedPayment(option.id)}
                                    className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                                        selectedPayment === option.id
                                            ? "border-[#9E2A1B] bg-white ring-1 ring-[#9E2A1B]/20"
                                            : "border-[#DDD5C8] bg-white hover:border-[#C4B8AE]"
                                    }`}
                                >
                                    <div className="shrink-0">
                                        {selectedPayment === option.id ? (
                                            <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#9E2A1B] bg-[#9E2A1B]">
                                                <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                            </div>
                                        ) : (
                                            <div className="h-4 w-4 rounded-full border-2 border-[#C4B8AE]" />
                                        )}
                                    </div>
                                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${option.color}`}>
                                        <span className={`text-[13px] font-bold ${option.initialColor}`}>
                                            {option.initial}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[13px] font-semibold text-[#1A130E]">{option.name}</p>
                                        <p className="text-[11px] text-[#6E6053]">{option.desc}</p>
                                    </div>
                                    {option.recommended && (
                                        <span className="rounded-full border border-[#C8A96A] bg-[#FBF3E2] px-2.5 py-0.5 text-[10px] font-bold text-[#8C6A2A]">
                                            Recommended
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                        <button className="w-full rounded-xl bg-[#9E2A1B] py-3.5 text-[14px] font-bold text-white transition hover:bg-[#832215]">
                            Continue to {selectedPayment === "esewa" ? "eSewa" : "Khalti"}
                        </button>
                        <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-[#8C7E74]">
                            <ShieldCheck size={12} strokeWidth={1.6} className="text-[#A89E94]" />
                            Secure payment. Encrypted & trusted.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-3 divide-x divide-[#EBE3D5] border-t border-[#EBE3D5] px-6 py-4">
                    {[
                        { icon: ShieldCheck, title: "Secure Checkout", desc: "Your information is safe and encrypted." },
                        { icon: Package,     title: "Verified Items",  desc: "Every item is authenticated." },
                        { icon: RefreshCw,   title: "Easy Returns",    desc: "14-day returns & exchanges." },
                    ].map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="flex items-start gap-3 px-5 first:pl-0 last:pr-0">
                            <Icon size={18} strokeWidth={1.6} className="mt-0.5 shrink-0 text-[#9E2A1B]" />
                            <div>
                                <p className="text-[12px] font-bold text-[#1A130E]">{title}</p>
                                <p className="text-[11px] leading-snug text-[#6E6053]">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}