"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, Construction } from "lucide-react";
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
    // Distinguishes "no rentals" from "the endpoint doesn't exist yet" so
    // the empty state is honest instead of implying the user simply has none.
    const [backendUnavailable, setBackendUnavailable] = useState(false);

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push("/login");
        }
    }, [router]);

    useEffect(() => {
        if (!user?.id) return;
        const userId = user.id; // narrowed once, safe to use below
        let cancelled = false;

        async function load() {
            setLoading(true);
            setBackendUnavailable(false);
            try {
                const data = await fetchRentals(userId);
                if (!cancelled) setRentals(data);
            } catch (err) {
                if (!cancelled) setBackendUnavailable(true);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [user?.id]);

    // No return/extend endpoints exist yet either.
    function handleAction(label: string) {
        toast.info(`${label} isn't available yet — coming soon.`);
    }

    return (
        <div className="min-h-screen bg-[#FAF6F0] text-[#1A130E]">
            <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

                {/* Header */}
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
                            {loading ? "Loading…" : backendUnavailable ? "" : `${rentals.length} ongoing`}
                        </p>
                    </div>
                </div>

                {/* Content states */}
                {loading && (
                    <div className="mt-10 text-center text-[13px] text-[#8C7E74]">Loading your rentals…</div>
                )}

                {!loading && backendUnavailable && (
                    <div className="mt-10 flex flex-col items-center gap-3 rounded-xl border border-[#EBE3D5] bg-white py-16 text-center">
                        <Construction size={28} className="text-[#B5A89E]" />
                        <p className="text-[14px] font-semibold text-[#1A130E]">Rentals tracking is coming soon</p>
                        <p className="max-w-xs text-[12px] text-[#8C7E74]">
                            This page will show your active rentals here once that feature is wired up on our end.
                        </p>
                    </div>
                )}

                {!loading && !backendUnavailable && rentals.length === 0 && (
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

                {!loading && !backendUnavailable && rentals.length > 0 && (
                    <div className="mt-6 flex flex-col gap-3">
                        {rentals.map((r) => (
                            <div
                                key={r.id}
                                className="flex items-center gap-4 rounded-xl border border-[#EBE3D5] bg-white p-4"
                            >
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