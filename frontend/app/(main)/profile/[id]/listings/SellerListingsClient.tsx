"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Heart } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/lib/AuthContext";
import { useFavorites } from "@/lib/FavoritesContext";
import { Profile } from "@/lib/types/profile";
import { Product } from "@/lib/types/product";

function availabilityBadge(availability?: string) {
    if (availability === "Sold Out") {
        return { label: "Sold Out", className: "bg-[#3D332C] text-white" };
    }
    if (availability === "Reserved") {
        return { label: "Reserved", className: "bg-[#92740E] text-white" };
    }
    return null;
}

function listingTag(status: Product["status"]) {
    if (status === "THRIFT + RENT") return { label: "THRIFT + RENT", className: "bg-[#5C5C5C] text-white" };
    if (status === "THRIFT") return { label: "THRIFT", className: "bg-[#1A130E] text-white" };
    return { label: "RENT", className: "bg-[#3D5C30] text-white" };
}

type FilterTab = "all" | "thrift" | "rent" | "both";

export default function SellerListingsClient({
                                                 profile,
                                                 listings,
                                             }: {
    profile: Profile;
    listings: Product[];
}) {
    const { authed } = useAuth();
    const { isFavorite, toggleFavorite } = useFavorites();

    const [filter, setFilter] = useState<FilterTab>("all");

    const filtered = useMemo(() => {
        if (filter === "all") return listings;
        if (filter === "thrift") return listings.filter((p) => p.status === "THRIFT");
        if (filter === "rent") return listings.filter((p) => p.status === "RENT");
        return listings.filter((p) => p.status === "THRIFT + RENT");
    }, [listings, filter]);

    function handleSave(item: Product) {
        const nowFavorited = toggleFavorite({
            id: String(item.id),
            name: item.name,
            brand: item.brand,
            image: item.image,
            price: item.status === "RENT" ? `${item.rentalPrice ?? item.price} / day` : item.price,
            status: item.status,
            category: item.status === "RENT" ? "rent" : "thrift",
            size: item.size,
            availability: "Available",
        });
        toast[nowFavorited ? "success" : "info"](
            nowFavorited ? "Added to favourites" : "Removed from favourites",
            { autoClose: 2000 }
        );
    }

    return (
        <div className="min-h-screen bg-[#FAF6F0] text-[#1A130E]">
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link
                        href={`/profile/${profile.id}`}
                        aria-label="Back to profile"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#EBE3D5] bg-white text-[#594E46] transition hover:bg-[#FAF6F0]"
                    >
                        <ArrowLeft size={16} />
                    </Link>
                    <div>
                        <h1 className="font-serif text-[26px] font-normal text-[#1A130E]">
                            Listings by {profile.name.split(" ")[0]}
                        </h1>
                        <p className="text-[12px] text-[#8C7E74]">{listings.length} items</p>
                    </div>
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
                {filtered.length === 0 && (
                    <div className="mt-10 rounded-xl border border-[#EBE3D5] bg-white py-16 text-center">
                        <p className="text-[14px] font-semibold text-[#1A130E]">
                            {listings.length === 0 ? "No listings yet" : "Nothing matches this filter"}
                        </p>
                        <p className="mt-1 text-[12px] text-[#8C7E74]">
                            {listings.length === 0
                                ? `${profile.name.split(" ")[0]} hasn't listed anything yet.`
                                : "Try a different tab above."}
                        </p>
                    </div>
                )}

                {filtered.length > 0 && (
                    <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4">
                        {filtered.map((item) => {
                            const tag = listingTag(item.status);
                            const isFav = authed && isFavorite(String(item.id));
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
                                        {(() => {
                                            const avail = availabilityBadge(item.availability);
                                            return avail ? (
                                                <span className={`absolute right-2 top-2 rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${avail.className}`}>
                                                    {avail.label}
                                                </span>
                                            ) : null;
                                        })()}
                                        {authed && (
                                            <button
                                                onClick={() => handleSave(item)}
                                                aria-label={isFav ? `Remove ${item.name} from favourites` : `Save ${item.name}`}
                                                className="absolute right-2 bottom-2 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm"
                                            >
                                                <Heart size={13} className={isFav ? "fill-[#9E2A1B] text-[#9E2A1B]" : "text-[#707070]"} />
                                            </button>
                                        )}
                                    </div>
                                    <Link href={`/browse-finds/${item.id}`} className="mt-2 block">
                                        <p className="line-clamp-1 text-[13px] font-medium">{item.name}</p>
                                        <p className="text-[11px] text-[#8C7E74]">{item.brand}</p>
                                        <p className="text-[13px] font-semibold text-[#9E2A1B]">
                                            {item.status === "RENT" && item.rentalPrice ? `${item.rentalPrice} / day` : item.price}
                                        </p>
                                    </Link>
                                </article>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}