"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
    BadgeCheck,
    Bell,
    Book,
    Calendar,
    ChevronRight,
    Clock,
    CreditCard,
    Gift,
    Heart,
    HelpCircle,
    Info,
    Lock,
    LogOut,
    MapPin,
    Package,
    Pencil,
    RefreshCw,
    Settings,
    ShieldCheck,
    ShoppingBag,
    Star,
    Tag,
    Truck,
    XCircle,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useFavorites } from "@/lib/FavoritesContext";
import { fetchProfile, fetchRentals, fetchDonations, fetchOrders, updateUserPhone } from "@/lib/api/profileApi";
import { Profile, RentalListing, Donation, Order, OrderStatus } from "@/lib/types/profile";
import { Product } from "@/lib/types/product";
import { toast } from "react-toastify";
import EditPhoneModal from "@/components/profile/EditPhoneModal";

function getInitials(name: string) {
    return name.split(" ").filter(Boolean).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
    Delivered: "bg-[#E8F5EE] text-[#2E7D52]",
    Completed: "bg-[#E8F5EE] text-[#2E7D52]",
    Shipped: "bg-[#FDF3D9] text-[#92740E]",
    Processing: "bg-[#F0EBE3] text-[#8C7E74]",
};

function listingTag(status: Product["status"]) {
    if (status === "THRIFT + RENT") return { label: "THRIFT + RENT", className: "bg-[#5C5C5C] text-white" };
    if (status === "THRIFT") return { label: "THRIFT", className: "bg-[#1A130E] text-white" };
    return { label: "RENT", className: "bg-[#3D5C30] text-white" };
}

/* ══════════════════════════════════════════════════════════
   ROOT — fetches the profile client-side, then decides which
   variant to render
══════════════════════════════════════════════════════════ */
export default function ProfileClient({
                                          userId,
                                          listings,
                                      }: {
    userId: string;
    listings: Product[];
}) {
    const { user } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function loadProfile() {
            try {
                const data = await fetchProfile(userId);
                if (!cancelled) setProfile(data);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadProfile();
        return () => {
            cancelled = true;
        };
    }, [userId]);

    if (loading) {
        return <div className="flex min-h-screen items-center justify-center">Loading profile...</div>;
    }

    if (!profile) {
        return <div className="flex min-h-screen items-center justify-center">Profile not found.</div>;
    }

    const isOwner = user?.id === profile.id;

    return isOwner ? (
        <OwnProfileView
            profile={profile}
            listings={listings}
            // Lets OwnProfileView push edits (e.g. a saved phone number) back
            // up without refetching the whole profile from the server.
            onProfileUpdate={(updates) =>
                setProfile((prev) => (prev ? { ...prev, ...updates } : prev))
            }
        />
    ) : (
        <PublicProfileView profile={profile} listings={listings} />
    );
}

/* ══════════════════════════════════════════════════════════
   OWNER VIEW — personal dashboard
══════════════════════════════════════════════════════════ */
function OwnProfileView({
                            profile,
                            listings,
                            onProfileUpdate,
                        }: {
    profile: Profile;
    listings: Product[];
    onProfileUpdate: (updates: Partial<Profile>) => void;
}) {
    const { signOut } = useAuth();
    const router = useRouter();
    const { favorites } = useFavorites();

    const [rentals, setRentals] = useState<RentalListing[]>([]);
    const [donations, setDonations] = useState<Donation[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);

    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [savingPhone, setSavingPhone] = useState(false);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            const results = await Promise.allSettled([
                fetchRentals(profile.id),
                fetchDonations(profile.id),
                fetchOrders(profile.id),
            ]);
            if (cancelled) return;

            setRentals(results[0].status === "fulfilled" ? results[0].value : []);
            setDonations(results[1].status === "fulfilled" ? results[1].value : []);
            setOrders(results[2].status === "fulfilled" ? results[2].value : []);

            results.forEach((r, i) => {
                if (r.status === "rejected") {
                    const label = ["rentals", "donations", "orders"][i];
                    console.warn(`Failed to load ${label}:`, r.reason);
                }
            });
        })();

        return () => {
            cancelled = true;
        };
    }, [profile.id]);

    async function handleSavePhone(newPhone: string) {
        setSavingPhone(true);
        try {
            await updateUserPhone(profile.id, newPhone);
            onProfileUpdate({ phone: newPhone });
            toast.success("Phone number updated");
            setShowPhoneModal(false);
        } catch (err) {
            toast.error("Couldn't update phone number. Please try again.");
        } finally {
            setSavingPhone(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#FAF6F0] text-[#1A130E]">
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                {/* ── Header ── */}
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#EBE3D5] bg-white p-6">
                    <div className="flex items-center gap-4">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-[#EBE3D5] bg-[#9E2A1B] text-white">
                            {profile.avatarUrl ? (
                                <Image src={profile.avatarUrl} alt={profile.name} fill className="object-cover" />
                            ) : (
                                <span className="flex h-full w-full items-center justify-center text-[18px] font-bold">
                                    {getInitials(profile.name)}
                                </span>
                            )}
                        </div>
                        <h1 className="font-serif text-[28px] font-normal text-[#1A130E]">{profile.name}</h1>
                    </div>
                    <div className="flex gap-2.5">
                        <Link
                            href="/profile/edit"
                            className="flex items-center gap-1.5 rounded-lg border border-[#9E2A1B] bg-white px-4 py-2 text-[13px] font-bold text-[#9E2A1B] transition hover:bg-[#9E2A1B]/6"
                        >
                            <Pencil size={13} /> Edit Profile
                        </Link>
                        <Link
                            href="/profile/settings"
                            className="flex h-[38px] w-[38px] items-center justify-center rounded-lg border border-[#DDD5C8] bg-white text-[#594E46] transition hover:bg-[#FAF6F0]"
                        >
                            <Settings size={16} />
                        </Link>
                    </div>
                </div>

                {/* ── Stats strip ── */}
                <div className="mt-4 grid grid-cols-2 gap-4 rounded-xl border border-[#EBE3D5] bg-white p-6 sm:grid-cols-3 md:grid-cols-5">
                    <StatBlock icon={ShoppingBag} value={profile.stats.listingsPosted} label="Listings Posted" />
                    <StatBlock icon={Calendar} value={rentals.length} label="Active Rentals" />
                    <StatBlock icon={Heart} value={favorites.length} label="Saved Items" />
                    <StatBlock icon={Gift} value={donations.length} label="Donations Made" />
                    <StatBlock icon={Star} value={4.8} suffix=" (56)" label="Reviews" />
                </div>

                {/* ── Row 1 — Listings / Rentals / Saved ── */}
                <div className="mt-5 grid gap-5 lg:grid-cols-3">
                    <SectionCard icon={ShoppingBag} title="My Listings" sub="18 active · 2 inactive" href="/profile/listings">
                        <div className="grid grid-cols-3 gap-2">
                            {listings.slice(0, 3).map((item) => (
                                <ThumbWithStatus key={item.id} image={item.image} label="Active" />
                            ))}
                        </div>
                        <ActionButton href="/profile/listings">Manage Listings</ActionButton>
                    </SectionCard>

                    <SectionCard icon={Calendar} title="Active Rentals" sub={`${rentals.length} ongoing rentals`} href="/profile/rentals">
                        <div className="grid grid-cols-3 gap-2">
                            {rentals.slice(0, 3).map((r) => (
                                <div key={r.id}>
                                    <div className="relative aspect-square overflow-hidden rounded-lg bg-[#F5F0E8]">
                                        <Image src={r.image} alt={r.name} fill className="object-cover" />
                                    </div>
                                    <p className="mt-1 line-clamp-1 text-[10px] font-semibold text-[#1A130E]">{r.name}</p>
                                    <p className="text-[10px] font-semibold text-[#9E2A1B]">{r.dueDate}</p>
                                </div>
                            ))}
                        </div>
                        <ActionButton href="/profile/rentals">Manage Rentals</ActionButton>
                    </SectionCard>

                    <SectionCard icon={Heart} title="Saved Items" sub={`${favorites.length} items saved`} href="/saved">
                        <div className="grid grid-cols-3 gap-2">
                            {favorites.slice(0, 3).map((f) => (
                                <div key={f.id} className="relative aspect-square overflow-hidden rounded-lg bg-[#F5F0E8]">
                                    <Image src={f.image} alt={f.name} fill className="object-cover" />
                                </div>
                            ))}
                        </div>
                        <ActionButton href="/saved">View Saved Items</ActionButton>
                    </SectionCard>
                </div>

                {/* ── Row 2 — Donations / Order History ── */}
                <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.7fr]">
                    <SectionCard icon={Gift} title="My Donations" sub={`${donations.length} donations made`} href="/profile/donations">
                        <div className="grid grid-cols-3 gap-2">
                            {donations.slice(0, 3).map((d) => (
                                <div key={d.id} className="relative aspect-square overflow-hidden rounded-lg bg-[#F5F0E8]">
                                    <Image src={d.image} alt={d.name} fill className="object-cover" />
                                </div>
                            ))}
                        </div>
                        <ActionButton href="/profile/donations">View Donation History</ActionButton>
                    </SectionCard>

                    <SectionCard icon={Package} title="Order History" sub={`${orders.length} orders placed`} href="/profile/orders">
                        <div className="space-y-2.5">
                            {orders.slice(0, 3).map((o) => (
                                <Link
                                    key={o.id}
                                    href={`/profile/orders/${o.id}`}
                                    className="flex items-center gap-3 rounded-lg border border-[#EBE3D5] p-2.5 transition hover:bg-[#FAF6F0]"
                                >
                                    <div className="relative h-11 w-9 shrink-0 overflow-hidden rounded-md bg-[#F5F0E8]">
                                        <Image src={o.itemImage} alt={o.itemName} fill className="object-cover" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-[12px] font-semibold text-[#1A130E]">{o.itemName}</p>
                                        <p className="text-[10px] text-[#8C7E74]">Order #{o.orderNumber}</p>
                                    </div>
                                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${ORDER_STATUS_STYLES[o.status]}`}>
                                        {o.status}
                                    </span>
                                    <span className="shrink-0 text-[11px] text-[#8C7E74]">{o.date}</span>
                                    <ChevronRight size={14} className="shrink-0 text-[#B5A89E]" />
                                </Link>
                            ))}
                        </div>
                        <ActionButton href="/profile/orders">View All Orders</ActionButton>
                    </SectionCard>
                </div>

                {/* ── Row 3 — Account Details / Account & Settings ── */}
                <div className="mt-5 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
                    <div className="rounded-xl border border-[#EBE3D5] bg-white p-6">
                        <div className="flex items-start gap-3">
                            <Info size={17} className="mt-0.5 text-[#594E46]" />
                            <div>
                                <h3 className="text-[15px] font-bold text-[#1A130E]">Account Details</h3>
                                <p className="text-[12px] text-[#8C7E74]">Manage your personal information and preferences</p>
                            </div>
                        </div>

                        <div className="mt-4 space-y-3">
                            <DetailRow label="Full Name" value={profile.name} />
                            {/* Email is read-only — comes from registration, not user-editable here */}
                            <DetailRow label="Email Address" value={profile.email ?? "—"} />
                            {/* Phone is the only editable row — opens the modal */}
                            <DetailRow
                                label="Phone Number"
                                value={profile.phone ?? "—"}
                                onEdit={() => setShowPhoneModal(true)}
                            />
                            {/*<div className="grid grid-cols-2 gap-3">*/}
                            {/*    <DetailRow label="Location" value={profile.location ?? "—"} />*/}
                            {/*    <DetailRow label="Preferred Sizes" value={profile.preferredSizes?.join(", ") ?? "—"} />*/}
                            {/*</div>*/}
                        </div>

                        <div className="mt-4 space-y-1 border-t border-[#EBE3D5] pt-4">
                            <NavRow icon={Bell} title="Notification Preferences" sub="Manage how you receive updates" href="/profile/notifications" />
                            <NavRow icon={Book} title="Address Book" sub="Manage your saved addresses" href="/profile/addresses" />
                            <NavRow icon={Lock} title="Password & Security" sub="Change password and security settings" href="/profile/security" />
                        </div>
                    </div>

                    <div className="rounded-xl border border-[#EBE3D5] bg-white p-6">
                        <h3 className="text-[15px] font-bold text-[#1A130E]">Account &amp; Settings</h3>
                        <p className="text-[12px] text-[#8C7E74]">Manage your account and preferences</p>

                        <div className="mt-4 space-y-1">
                            <NavRow icon={Bell} title="Notification Settings" sub="Control your notifications" href="/profile/notifications" />
                            <NavRow icon={ShieldCheck} title="Privacy Settings" sub="Manage your privacy preferences" href="/profile/privacy" />
                            <NavRow icon={CreditCard} title="Payment Methods" sub="Manage your saved payment methods" href="/profile/payment" />
                            <NavRow icon={HelpCircle} title="Help & Support" sub="Get help and support" href="/support" />
                            <NavRow icon={Info} title="About RE:WEAR" sub="Learn about us" href="/about" />
                        </div>

                        <button
                            onClick={() => {
                                signOut();
                                toast.info("Signed out");
                                router.push("/login");
                            }}
                            className="mt-4 flex w-full items-center gap-2 rounded-lg border border-[#EBE3D5] p-3 text-[13px] font-bold text-[#9E2A1B] transition hover:bg-[#FAF6F0]"
                        >
                            <LogOut size={15} />
                            <span className="text-left">
                                Log Out
                                <span className="block text-[11px] font-normal text-[#8C7E74]">Sign out from your account</span>
                            </span>
                        </button>
                    </div>
                </div>
            </main>

            {showPhoneModal && (
                <EditPhoneModal
                    currentPhone={profile.phone}
                    saving={savingPhone}
                    onClose={() => setShowPhoneModal(false)}
                    onSave={handleSavePhone}
                />
            )}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════
   PUBLIC VIEW — storefront, no Follow / Message / Reviews / Response Rate
══════════════════════════════════════════════════════════ */
function PublicProfileView({ profile, listings }: { profile: Profile; listings: Product[] }) {
    const { isFavorite, toggleFavorite } = useFavorites();
    const [filter, setFilter] = useState<"all" | "thrift" | "rent" | "both">("all");

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

                {/* ── Header — Follow/Message/rating/response-rate intentionally omitted ── */}
                <div className="flex flex-wrap items-center gap-4 rounded-xl border border-[#EBE3D5] bg-white p-6">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-[#EBE3D5] bg-[#9E2A1B] text-white">
                        {profile.avatarUrl ? (
                            <Image src={profile.avatarUrl} alt={profile.name} fill className="object-cover" />
                        ) : (
                            <span className="flex h-full w-full items-center justify-center text-[18px] font-bold">
                                {getInitials(profile.name)}
                            </span>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="font-serif text-[24px] font-normal text-[#1A130E]">{profile.name}</h1>
                            {profile.isVerified && (
                                <span className="flex items-center gap-1 rounded-full bg-[#9E2A1B] px-2.5 py-0.5 text-[11px] font-bold text-white">
                                    <BadgeCheck size={12} /> Verified Seller
                                </span>
                            )}
                        </div>
                        <p className="mt-1 flex items-center gap-1 text-[12px] text-[#8C7E74]">
                            <Calendar size={12} /> Joined {profile.joinedDate}
                        </p>
                    </div>
                </div>

                {/* ── Stats — Average Rating omitted along with reviews ── */}
                <div className="mt-4 grid grid-cols-2 gap-4 rounded-xl border border-[#EBE3D5] bg-white p-6 sm:grid-cols-4">
                    <StatBlock icon={ShoppingBag} value={profile.stats.listingsPosted} label="Items Listed" />
                    <StatBlock icon={Tag} value={profile.stats.activeItems} label="Active Items" />
                    <StatBlock icon={ShoppingBag} value={profile.stats.soldOrRented} label="Sold / Rented" />
                    <StatBlock icon={Heart} value={profile.stats.savedByUsers} label="Saved by Users" />
                </div>

                {/* ── Listings ── */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="font-serif text-[20px] font-normal text-[#1A130E]">Listings by {profile.name.split(" ")[0]}</h2>
                        <p className="text-[12px] text-[#8C7E74]">{listings.length} items</p>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full border border-[#EBE3D5] bg-white p-1">
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
                </div>

                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4">
                    {filtered.map((item) => {
                        const tag = listingTag(item.status);
                        const isFav = isFavorite(String(item.id));
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
                                    <button
                                        onClick={() => handleSave(item)}
                                        aria-label={isFav ? `Remove ${item.name} from favourites` : `Save ${item.name}`}
                                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm"
                                    >
                                        <Heart size={13} className={isFav ? "fill-[#9E2A1B] text-[#9E2A1B]" : "text-[#707070]"} />
                                    </button>
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

                <div className="mt-6 text-center">
                    <Link
                        href={`/profile/${profile.id}/listings`}
                        className="inline-block rounded-lg border border-[#9E2A1B] bg-white px-6 py-2.5 text-[13px] font-bold text-[#9E2A1B] transition hover:bg-[#9E2A1B]/6"
                    >
                        View All Listings
                    </Link>
                </div>

                {/* ── About the Seller / Policies — Response Time omitted; reviews panel dropped ── */}
                <div className="mt-8 grid gap-5 sm:grid-cols-2">
                    <div className="rounded-xl border border-[#EBE3D5] bg-white p-5">
                        <h3 className="text-[14px] font-bold text-[#1A130E]">About the Seller</h3>
                        <div className="mt-3 space-y-3">
                            <InfoRow icon={MapPin} label="Location" value={profile.location ?? "—"} />
                            <InfoRow icon={Truck} label="Ships From" value={profile.shipsFrom ?? "—"} />
                            <InfoRow icon={Package} label="Preferred Fulfillment" value={profile.fulfillment ?? "—"} />
                            <InfoRow icon={Calendar} label="Active Days" value={profile.activeDays ?? "—"} />
                        </div>
                    </div>
                    <div className="rounded-xl border border-[#EBE3D5] bg-white p-5">
                        <h3 className="text-[14px] font-bold text-[#1A130E]">Policies</h3>
                        <div className="mt-3 space-y-3">
                            <InfoRow icon={RefreshCw} label="Returns (Thrift)" value="7-day return available" />
                            <InfoRow icon={Clock} label="Rental Policy" value="Return by the due date to avoid late fees" />
                            <InfoRow icon={ShieldCheck} label="Condition Guarantee" value="All items are cleaned and quality-checked" />
                            <InfoRow icon={XCircle} label="Cancellation" value="Orders can be cancelled within 24 hours" />
                        </div>
                    </div>
                </div>

                {/* ── Trust strip ── */}
                <div className="mt-6 rounded-xl border border-[#EBE3D5] bg-white p-5 text-center">
                    <p className="flex items-center justify-center gap-1.5 text-[13px] font-bold text-[#1A130E]">
                        <ShieldCheck size={15} className="text-[#9E2A1B]" /> Shop with confidence from verified sellers.
                    </p>
                    <p className="mt-1 text-[11px] text-[#8C7E74]">
                        Every seller on RE:WEAR is reviewed and monitored for a safe experience.
                    </p>
                </div>
            </main>
        </div>
    );
}

/* ─── Shared small pieces ─────────────────────────────────── */
function StatBlock({ icon: Icon, value, suffix = "", label }: { icon: typeof Heart; value: number; suffix?: string; label: string }) {
    return (
        <div className="flex flex-col items-center gap-1.5 text-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FAF0E6] text-[#9E2A1B]">
                <Icon size={16} />
            </div>
            <p className="text-[18px] font-bold text-[#1A130E]">
                {value}
                <span className="text-[12px] font-semibold text-[#8C7E74]">{suffix}</span>
            </p>
            <p className="text-[11px] text-[#8C7E74]">{label}</p>
        </div>
    );
}

function SectionCard({
                         icon: Icon,
                         title,
                         sub,
                         href,
                         children,
                     }: {
    icon: typeof Heart;
    title: string;
    sub: string;
    href: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-[#EBE3D5] bg-white p-5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FAF0E6] text-[#9E2A1B]">
                        <Icon size={14} />
                    </div>
                    <div>
                        <p className="text-[13px] font-bold text-[#1A130E]">{title}</p>
                        <p className="text-[11px] text-[#8C7E74]">{sub}</p>
                    </div>
                </div>
                <Link href={href} className="text-[12px] font-bold text-[#9E2A1B] hover:underline">
                    View all →
                </Link>
            </div>
            <div className="mt-3">{children}</div>
        </div>
    );
}

function ThumbWithStatus({ image, label }: { image: string; label: string }) {
    return (
        <div>
            <div className="relative aspect-square overflow-hidden rounded-lg bg-[#F5F0E8]">
                <Image src={image} alt="" fill className="object-cover" />
            </div>
            <p className="mt-1 flex items-center gap-1 text-[10px] text-[#2E7D52]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2E7D52]" /> {label}
            </p>
        </div>
    );
}

function ActionButton({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="mt-3 block w-full rounded-lg border border-[#9E2A1B] bg-white py-2 text-center text-[12px] font-bold text-[#9E2A1B] transition hover:bg-[#9E2A1B]/6"
        >
            {children}
        </Link>
    );
}

// NEW — onEdit is optional. Rows that don't pass it (e.g. Email) render with
// no pencil button at all, making them effectively read-only.
function DetailRow({ label, value, onEdit }: { label: string; value: string; onEdit?: () => void }) {
    return (
        <div className="flex items-center justify-between rounded-lg border border-[#EBE3D5] px-3.5 py-2.5">
            <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#8C7E74]">{label}</p>
                <p className="text-[13px] font-medium text-[#1A130E]">{value}</p>
            </div>
            {onEdit && (
                <button onClick={onEdit} aria-label={`Edit ${label}`} className="text-[#8C7E74] transition hover:text-[#9E2A1B]">
                    <Pencil size={14} />
                </button>
            )}
        </div>
    );
}

function NavRow({ icon: Icon, title, sub, href }: { icon: typeof Heart; title: string; sub: string; href: string }) {
    return (
        <Link href={href} className="flex items-center justify-between rounded-lg px-1 py-2.5 transition hover:bg-[#FAF6F0]">
            <div className="flex items-center gap-3">
                <Icon size={16} className="text-[#594E46]" />
                <div>
                    <p className="text-[13px] font-semibold text-[#1A130E]">{title}</p>
                    <p className="text-[11px] text-[#8C7E74]">{sub}</p>
                </div>
            </div>
            <ChevronRight size={14} className="text-[#B5A89E]" />
        </Link>
    );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Heart; label: string; value: string }) {
    return (
        <div className="flex items-start gap-2.5 text-[12px]">
            <Icon size={13} className="mt-0.5 shrink-0 text-[#9E2A1B]" />
            <div>
                <p className="font-semibold text-[#1A130E]">{label}</p>
                <p className="text-[#8C7E74]">{value}</p>
            </div>
        </div>
    );
}