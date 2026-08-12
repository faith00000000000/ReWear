"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Package, ShoppingBag } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { isAuthenticated } from "@/lib/auth";
import { fetchOrderHistory, RawOrder } from "@/lib/api/profileApi";

const STATUS_PILL: Record<string, string> = {
    THRIFT: "bg-[#1A1A1A] text-[#FAF6F0]",
    RENT: "bg-[#3D5C30] text-white",
    "THRIFT + RENT": "bg-[#9E2A1B] text-white",
};

type FilterTab = "all" | "thrift" | "rent";

export default function OrderHistoryPage() {
    const router = useRouter();
    const { user } = useAuth();

    const [orders, setOrders] = useState<RawOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<FilterTab>("all");

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push("/login");
        }
    }, [router]);

    useEffect(() => {
        if (!user?.id) return;
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);
            try {
                // fetchOrderHistory() already filters to CONFIRMED orders
                const data = await fetchOrderHistory();
                if (!cancelled) setOrders(data);
            } catch (err) {
                console.error(err);
                if (!cancelled) setError("Couldn't load your order history. Please try again.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [user?.id]);

    const filtered = useMemo(() => {
        if (filter === "all") return orders;
        return orders
            .map((o) => ({
                ...o,
                items: o.items.filter((i) =>
                    filter === "thrift"
                        ? i.status === "THRIFT" || i.status === "THRIFT + RENT"
                        : i.status === "RENT" || i.status === "THRIFT + RENT"
                ),
            }))
            .filter((o) => o.items.length > 0);
    }, [orders, filter]);

    const fmt = (n: number) => `Rs. ${n.toLocaleString("en-IN")}`;
    const fmtDate = (iso: string) =>
        new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });

    return (
        <div className="min-h-screen bg-[#FAF6F0] text-[#1A130E]">
            <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

                <div className="flex items-center gap-3">
                    <Link
                        href="/profile"
                        aria-label="Back to profile"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#EBE3D5] bg-white text-[#594E46] transition hover:bg-[#FAF6F0]"
                    >
                        <ArrowLeft size={16} />
                    </Link>
                    <div>
                        <h1 className="font-serif text-[26px] font-normal text-[#1A130E]">Order History</h1>
                        <p className="text-[12px] text-[#8C7E74]">
                            {loading ? "Loading…" : `${orders.length} orders`}
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex items-center gap-1.5 rounded-full border border-[#EBE3D5] bg-white p-1 w-fit">
                    {([
                        { id: "all", label: "All" },
                        { id: "thrift", label: "Thrift" },
                        { id: "rent", label: "Rent" },
                    ] as const).map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition ${
                                filter === tab.id ? "bg-[#9E2A1B] text-white" : "text-[#6E6053] hover:bg-[#FAF6F0]"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {loading && (
                    <div className="mt-10 text-center text-[13px] text-[#8C7E74]">Loading your orders…</div>
                )}

                {!loading && error && (
                    <div className="mt-10 text-center text-[13px] text-[#9E2A1B]">{error}</div>
                )}

                {!loading && !error && filtered.length === 0 && (
                    <div className="mt-10 flex flex-col items-center gap-3 rounded-xl border border-[#EBE3D5] bg-white py-16 text-center">
                        <ShoppingBag size={28} className="text-[#B5A89E]" />
                        <p className="text-[14px] font-semibold text-[#1A130E]">No orders yet</p>
                        <p className="text-[12px] text-[#8C7E74]">Your completed orders will show up here.</p>
                        <Link
                            href="/browse-finds"
                            className="mt-2 rounded-lg border border-[#9E2A1B] bg-white px-4 py-2 text-[13px] font-bold text-[#9E2A1B] transition hover:bg-[#9E2A1B]/6"
                        >
                            Start Shopping
                        </Link>
                    </div>
                )}

                {!loading && !error && filtered.length > 0 && (
                    <div className="mt-6 flex flex-col gap-4">
                        {filtered.map((order) => (
                            <div key={order.id} className="rounded-xl border border-[#EBE3D5] bg-white p-4">
                                <div className="flex items-center justify-between border-b border-[#EBE3D5] pb-3">
                                    <div>
                                        <p className="text-[12px] font-semibold text-[#1A130E]">Order #{order.id}</p>
                                        <p className="text-[11px] text-[#8C7E74]">{fmtDate(order.createdAt)}</p>
                                    </div>
                                    <p className="text-[14px] font-bold text-[#9E2A1B]">{fmt(order.totalAmountNpr)}</p>
                                </div>

                                <div className="mt-3 flex flex-col gap-3">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-[#F5F0E8]">
                                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`rounded px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${STATUS_PILL[item.status]}`}>
                                                        {item.status}
                                                    </span>
                                                </div>
                                                <p className="mt-0.5 truncate text-[13px] font-medium text-[#1A130E]">{item.name}</p>
                                                {item.rentalStart && item.rentalEnd && (
                                                    <p className="text-[11px] text-[#4A6B3A]">
                                                        {item.rentalStart} – {item.rentalEnd}
                                                    </p>
                                                )}
                                            </div>
                                            <p className="shrink-0 text-[13px] font-semibold text-[#1A130E]">{item.price}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}