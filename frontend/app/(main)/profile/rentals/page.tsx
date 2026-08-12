"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/lib/AuthContext";
import { isAuthenticated } from "@/lib/auth";
import { fetchRentals } from "@/lib/api/profileApi";
import { RentalListing } from "@/lib/types/profile";

export default function ActiveRentalsPage() {
    const router = useRouter();
    const { user } = useAuth();

    const [rentals, setRentals] = useState<RentalListing[]>([]);
    const [loading, setLoading] = useState(true);
    // Now a real fetch error (network/auth/5xx) — /api/orders exists, so
    // this is no longer a "not built yet" placeholder state.
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push("/login");
        }
    }, [router]);

    useEffect(() => {
        if (!user?.id) return;
        const userId = user.id;
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(false);
            try {
                const data = await fetchRentals(userId);
                if (!cancelled) setRentals(data);
            } catch (err) {
                console.error(err);
                if (!cancelled) setError(true);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [user?.id]);

    // No return/extend endpoints exist yet.
    function handleAction(label: string) {
        toast.info(`${label} isn't available yet — coming soon.`);
    }

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
                        <h1 className="font-serif text-[26px] font-normal text-[#1A130E]">Active Rentals</h1>
                        <p className="text-[12px] text-[#8C7E74]">
                            {loading ? "Loading…" : error ? "" : `${rentals.length} ongoing`}
                        </p>
                    </div>
                </div>

                {loading && (
                    <div className="mt-10 text-center text-[13px] text-[#8C7E74]">Loading your rentals…</div>
                )}

                {!loading && error && (
                    <div className="mt-10 flex flex-col items-center gap-3 rounded-xl border border-[#EBE3D5] bg-white py-16 text-center">
                        <AlertCircle size={28} className="text-[#B5A89E]" />
                        <p className="text-[14px] font-semibold text-[#1A130E]">Couldn't load your rentals</p>
                        <p className="max-w-xs text-[12px] text-[#8C7E74]">
                            Something went wrong on our end. Please try again in a moment.
                        </p>
                    </div>
                )}

                {!loading && !error && rentals.length === 0 && (
                    <div className="mt-10 flex flex-col items-center gap-3 rounded-xl border border-[#EBE3D5] bg-white py-16 text-center">
                        <Calendar size={28} className="text-[#B5A89E]" />
                        <p className="text-[14px] font-semibold text-[#1A130E]">No active rentals</p>
                        <p className="text-[12px] text-[#8C7E74]">Items you rent will show up here while they're out.</p>
                        <Link
                            href="/rent"
                            className="mt-2 rounded-lg border border-[#9E2A1B] bg-white px-4 py-2 text-[13px] font-bold text-[#9E2A1B] transition hover:bg-[#9E2A1B]/6"
                        >
                            Browse Rentals
                        </Link>
                    </div>
                )}

                {!loading && !error && rentals.length > 0 && (
                    <div className="mt-6 flex flex-col gap-3">
                        {rentals.map((r) => (
                            <div key={r.id} className="flex items-center gap-4 rounded-xl border border-[#EBE3D5] bg-white p-4">
                                <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-[#F5F0E8]">
                                    <Image src={r.image} alt={r.name} fill className="object-cover" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[14px] font-semibold text-[#1A130E]">{r.name}</p>
                                    <p className="mt-1 flex items-center gap-1.5 text-[12px] font-semibold text-[#9E2A1B]">
                                        <Calendar size={13} /> Due {r.dueDate}
                                    </p>
                                </div>
                                <div className="flex shrink-0 gap-2">
                                    <button
                                        onClick={() => handleAction("Extending a rental")}
                                        className="rounded-lg border border-[#EBE3D5] px-3 py-1.5 text-[12px] font-bold text-[#594E46] transition hover:bg-[#FAF6F0]"
                                    >
                                        Extend
                                    </button>
                                    <button
                                        onClick={() => handleAction("Marking as returned")}
                                        className="rounded-lg border border-[#9E2A1B] px-3 py-1.5 text-[12px] font-bold text-[#9E2A1B] transition hover:bg-[#9E2A1B]/6"
                                    >
                                        Return
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}