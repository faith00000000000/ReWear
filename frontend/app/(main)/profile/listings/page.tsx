"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Package, AlertTriangle, X } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/lib/AuthContext";
import { isAuthenticated } from "@/lib/auth";
import { fetchListingsBySeller, deleteListing } from "@/lib/api/listings";
import { mapListingsToProducts } from "@/lib/mappers/listingMapper";
import { Product } from "@/lib/types/product";

function listingTag(status: Product["status"]) {
    if (status === "THRIFT + RENT") return { label: "THRIFT + RENT", className: "bg-[#5C5C5C] text-white" };
    if (status === "THRIFT") return { label: "THRIFT", className: "bg-[#1A130E] text-white" };
    return { label: "RENT", className: "bg-[#3D5C30] text-white" };
}

type FilterTab = "all" | "thrift" | "rent" | "both";

export default function MyListingsPage() {
    const router = useRouter();
    const { user } = useAuth();

    const [listings, setListings] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<FilterTab>("all");

    // Which item the delete-confirmation modal is currently open for, if any
    const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Guests can't have listings — same guard pattern as list-items page
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
            setError(null);
            try {
                const raw = await fetchListingsBySeller(userId);
                if (!cancelled) {
                    setListings(mapListingsToProducts(raw));
                }
            } catch (err) {
                if (!cancelled) {
                    setError("Couldn't load your listings. Please try again.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [user?.id]);

    const filtered = useMemo(() => {
        if (filter === "all") return listings;
        if (filter === "thrift") return listings.filter((p) => p.status === "THRIFT");
        if (filter === "rent") return listings.filter((p) => p.status === "RENT");
        return listings.filter((p) => p.status === "THRIFT + RENT");
    }, [listings, filter]);

    async function handleConfirmDelete() {
        if (!pendingDelete) return;
        setDeleting(true);
        try {
            await deleteListing(pendingDelete.id);
            setListings((prev) => prev.filter((l) => l.id !== pendingDelete.id));
            toast.success("Listing deleted");
            setPendingDelete(null);
        } catch (err) {
            toast.error("Couldn't delete this listing. Please try again.");
        } finally {
            setDeleting(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#FAF6F0] text-[#1A130E]">
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/profile"
                            aria-label="Back to profile"
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#EBE3D5] bg-white text-[#594E46] transition hover:bg-[#FAF6F0]"
                        >
                            <ArrowLeft size={16} />
                        </Link>
                        <div>
                            <h1 className="font-serif text-[26px] font-normal text-[#1A130E]">My Listings</h1>
                            <p className="text-[12px] text-[#8C7E74]">
                                {loading ? "Loading…" : `${listings.length} total`}
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/list-items"
                        className="rounded-lg bg-[#9E2A1B] px-4 py-2 text-[13px] font-bold text-white transition hover:bg-[#9E2A1B]/90"
                    >
                        + List New Item
                    </Link>
                </div>

                {/* Filter tabs */}
                <div className="mt-6 flex items-center gap-1.5 rounded-full border border-[#EBE3D5] bg-white p-1 w-fit">
                    {([
                        { id: "all", label: "All" },
                        { id: "thrift", label: "Thrift" },
                        { id: "rent", label: "Rent" },
                        { id: "both", label: "Both" },
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

                {/* Content states */}
                {loading && (
                    <div className="mt-10 text-center text-[13px] text-[#8C7E74]">Loading your listings…</div>
                )}

                {!loading && error && (
                    <div className="mt-10 text-center text-[13px] text-[#9E2A1B]">{error}</div>
                )}

                {!loading && !error && filtered.length === 0 && (
                    <div className="mt-10 flex flex-col items-center gap-3 rounded-xl border border-[#EBE3D5] bg-white py-16 text-center">
                        <Package size={28} className="text-[#B5A89E]" />
                        <p className="text-[14px] font-semibold text-[#1A130E]">
                            {listings.length === 0 ? "No listings yet" : "Nothing matches this filter"}
                        </p>
                        <p className="text-[12px] text-[#8C7E74]">
                            {listings.length === 0
                                ? "List your first item to see it here."
                                : "Try a different tab above."}
                        </p>
                    </div>
                )}

                {!loading && !error && filtered.length > 0 && (
                    <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4">
                        {filtered.map((item) => {
                            const tag = listingTag(item.status);
                            return (
                                <article key={item.id} className="group">
                                    <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-[#F5F0E8]">
                                        <Link href={`/browse-finds/${item.id}`}>
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                sizes="(min-width:1024px) 25vw, 50vw"
                                                className="object-cover transition duration-500 group-hover:scale-[1.03]"
                                            />
                                        </Link>
                                        <span className={`absolute left-2 top-2 rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${tag.className}`}>
                                            {tag.label}
                                        </span>
                                    </div>
                                    <div className="mt-2">
                                        <Link href={`/browse-finds/${item.id}`} className="block">
                                            <p className="line-clamp-1 text-[13px] font-medium text-[#1A130E]">{item.name}</p>
                                            <p className="text-[11px] text-[#8C7E74]">{item.brand}</p>
                                            <p className="text-[13px] font-semibold text-[#9E2A1B]">
                                                {item.status === "RENT" && item.rentalPrice ? `${item.rentalPrice} / day` : item.price}
                                            </p>
                                        </Link>
                                        <div className="mt-2 flex gap-2">
                                            <Link
                                                href={`/list-items/${item.id}`}
                                                className="flex-1 rounded-lg border border-[#9E2A1B] py-1.5 text-center text-[11px] font-bold text-[#9E2A1B] transition hover:bg-[#9E2A1B]/6"
                                            >
                                                Manage
                                            </Link>
                                            <button
                                                onClick={() => setPendingDelete(item)}
                                                className="flex-1 rounded-lg border border-[#EBE3D5] py-1.5 text-[11px] font-bold text-[#8C4A42] transition hover:bg-red-50 hover:border-red-200"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Delete confirmation modal */}
            {pendingDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
                        <div className="flex items-start justify-between">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-[#9E2A1B]">
                                <AlertTriangle size={18} />
                            </div>
                            <button
                                onClick={() => !deleting && setPendingDelete(null)}
                                aria-label="Close"
                                className="text-[#8C7E74] hover:text-[#1A130E]"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <h3 className="mt-4 text-[15px] font-bold text-[#1A130E]">
                            Are you sure you want to delete your clothing item?
                        </h3>
                        <p className="mt-1.5 text-[13px] text-[#8C7E74]">
                            "{pendingDelete.name}" will be permanently removed. This can't be undone.
                        </p>

                        <div className="mt-5 flex gap-2.5">
                            <button
                                onClick={() => setPendingDelete(null)}
                                disabled={deleting}
                                className="flex-1 rounded-lg border border-[#DDD5C8] py-2 text-[13px] font-bold text-[#594E46] transition hover:bg-[#FAF6F0] disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={deleting}
                                className="flex-1 rounded-lg bg-[#9E2A1B] py-2 text-[13px] font-bold text-white transition hover:bg-[#9E2A1B]/90 disabled:opacity-50"
                            >
                                {deleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}