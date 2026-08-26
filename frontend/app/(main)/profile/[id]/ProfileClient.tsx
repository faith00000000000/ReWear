"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    BadgeCheck,
    Bell,
    Book, Building2,
    Calendar,
    Camera,
    ChevronRight,
    Clock,
    CreditCard,
    Gift,
    Heart,
    HelpCircle,
    Info,
    Lock,
    LogOut,
    Mail,
    MapPin,
    Package,
    Pencil,
    Phone,
    RefreshCw,
    ShieldCheck,
    ShoppingBag,
    Tag,
    Truck,
    User,
    XCircle,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useFavorites } from "@/lib/FavoritesContext";
import {
    fetchProfile,
    fetchRentals,
    fetchOrders,
    fetchUserStats,
    updateUserPhone,
    updateUserAvatar,
} from "@/lib/api/profileApi";
// import { Profile, RentalListing, Donation, Order, OrderStatus } from "@/lib/types/profile";
import { Profile, RentalListing, Order, OrderStatus } from "@/lib/types/profile";
import { Donation, DonationStatus, getMyDonations, DONATION_STATUS_STYLES } from "@/lib/api/donationApi";
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

    // useEffect(() => {
    //     let cancelled = false;
    //
    //     async function loadProfile() {
    //         try {
    //             const data = await fetchProfile(userId);
    //             if (!cancelled) setProfile(data);
    //         } finally {
    //             if (!cancelled) setLoading(false);
    //         }
    //     }
    //
    //     loadProfile();
    //     return () => {
    //         cancelled = true;
    //     };
    // }, [userId]);

    useEffect(() => {
        let cancelled = false;

        async function loadProfile() {
            try {
                const [profileData, statsData] = await Promise.allSettled([
                    fetchProfile(userId),
                    fetchUserStats(userId),
                ]);

                if (cancelled) return;

                const base = profileData.status === "fulfilled" ? profileData.value : null;
                if (!base) {
                    setProfile(null);
                    return;
                }

                const stats = statsData.status === "fulfilled" ? statsData.value : null;
                setProfile({
                    ...base,
                    stats: {
                        listingsPosted: stats?.listingsPosted ?? 0,
                        activeItems: stats?.activeItems ?? 0,
                        soldOrRented: stats?.soldOrRented ?? 0,
                        // savedByUsers has no backend source yet — see chat notes.
                        // Left at whatever mapUserResponseToProfile already set (0)
                        // rather than fabricating a number.
                        savedByUsers: base.stats.savedByUsers,
                    },
                });
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void loadProfile();
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
    const { signOut, updateUser } = useAuth(); // updateUser syncs AuthContext + Navbar after avatar/phone changes
    const router = useRouter();
    const { favorites } = useFavorites();

    const [rentals, setRentals] = useState<RentalListing[]>([]);
    const [donations, setDonations] = useState<Donation[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);

    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [savingPhone, setSavingPhone] = useState(false);

    // Avatar upload — own profile only. The <input type="file"> is hidden
    // and triggered via the camera-icon overlay button on the avatar.
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const [savingAvatar, setSavingAvatar] = useState(false);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            const results = await Promise.allSettled([
                fetchRentals(profile.id),
                // fetchDonations(profile.id),
                getMyDonations(),
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

    // Listings count comes from the `listings` prop (fetched server-side via
    // fetchListingsBySeller in page.tsx) rather than profile.stats, so this
    // number always reflects the actual listings the seller currently has —
    // not a stale/mocked stat.
    const listingsCount = listings.length;

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

    async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        e.target.value = ""; // reset so re-selecting the same file re-fires onChange
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be under 5MB");
            return;
        }

        setSavingAvatar(true);
        try {
            // Backend uploads `file` to Supabase Storage and persists the
            // returned public URL against the user record. Since public
            // profile visitors fetch this same URL fresh via fetchProfile(),
            // the new picture shows up there automatically too — no separate
            // sync needed for that side, only the local page + navbar here.
            const { avatarUrl } = await updateUserAvatar(profile.id, file);
            onProfileUpdate({ avatarUrl });
            updateUser({ profilePictureUrl: avatarUrl }); // syncs AuthContext + Navbar avatar
            toast.success("Profile picture updated");
        } catch (err) {
            toast.error("Couldn't update profile picture. Please try again.");
        } finally {
            setSavingAvatar(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#FAF6F0] text-[#1A130E] antialiased">
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* ── Header Banner ── */}
                <div className="flex flex-col gap-6 rounded-2xl border border-[#EBE3D5] bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between lg:p-8">
                    {/* Left Section: User Avatar & Name */}
                    <div className="flex items-center gap-5 sm:border-r sm:border-[#EBE3D5] sm:pr-8">
                        <div className="group relative shrink-0">
                            <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-white bg-[#9E2A1B] text-white shadow-md ring-2 ring-[#EBE3D5] transition duration-300">
                                {profile.avatarUrl ? (
                                    <Image
                                        src={profile.avatarUrl}
                                        alt={profile.name}
                                        fill
                                        className="object-cover transition duration-300 group-hover:scale-105"
                                    />
                                ) : (
                                    <span className="flex h-full w-full items-center justify-center text-xl font-bold tracking-wider">
                  {getInitials(profile.name)}
                </span>
                                )}

                                {/* Hover Overlay */}
                                <div
                                    onClick={() => avatarInputRef.current?.click()}
                                    className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100"
                                >
                                    <Camera size={18} className="text-white drop-shadow-md" />
                                </div>

                                {/* Loading Spinner */}
                                {savingAvatar && (
                                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                                        <RefreshCw size={20} className="animate-spin text-white" />
                                    </div>
                                )}
                            </div>

                            {/* Quick Action Button */}
                            <button
                                type="button"
                                onClick={() => avatarInputRef.current?.click()}
                                aria-label="Change profile picture"
                                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#9E2A1B] text-white shadow-md transition hover:scale-110 hover:bg-[#832111] active:scale-95"
                            >
                                <Camera size={12} />
                            </button>

                            <input
                                ref={avatarInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                        </div>

                        <div>
                            <h1 className="font-serif text-2xl font-normal text-[#1A130E] sm:text-3xl">
                                {profile.name}
                            </h1>
                            <p className="mt-0.5 text-xs text-[#8C7E74] sm:hidden">
                                {profile.email ?? "—"}
                            </p>
                        </div>
                    </div>

                    {/* Right Section: Core Info Quick View */}
                    <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:gap-4">
                        <InfoItem icon={User} label="Full Name" value={profile.name} />
                        <InfoItem icon={Mail} label="Email Address" value={profile.email ?? "—"} />
                        <InfoItem icon={Phone} label="Phone Number" value={profile.phone ?? "—"} />
                    </div>
                </div>

                {/* ── Stats Overview Banner ── */}
                <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-2xl border border-[#EBE3D5] bg-white shadow-sm sm:grid-cols-4">
                    <StatBlock
                        icon={ShoppingBag}
                        value={listingsCount}
                        label="Listings Posted"
                        description="Total items listed"
                    />
                    <StatBlock
                        icon={Calendar}
                        value={rentals.length}
                        label="Active Rentals"
                        description="Ongoing bookings"
                    />
                    <StatBlock
                        icon={Heart}
                        value={favorites.length}
                        label="Saved Items"
                        description="Wishlisted items"
                    />
                    <StatBlock
                        icon={Gift}
                        value={donations.length}
                        label="Donations Made"
                        description="Items donated"
                    />
                </div>

                {/* ── Grid Row 1: Listings / Rentals / Saved Items ── */}
                <div className="mt-6 grid gap-6 lg:grid-cols-3">
                    <SectionCard
                        icon={ShoppingBag}
                        title="My Listings"
                        sub={`${listingsCount} active items`}
                        href="/profile/listings"
                    >
                        <div className="grid grid-cols-3 gap-2.5">
                            {listings.slice(0, 3).map((item) => (
                                <ThumbWithStatus key={item.id} image={item.image} label="Active" />
                            ))}
                        </div>
                        <ActionButton href="/profile/listings">Manage Listings</ActionButton>
                    </SectionCard>

                    <SectionCard
                        icon={Calendar}
                        title="Active Rentals"
                        sub={`${rentals.length} ongoing rentals`}
                        href="/profile/rentals"
                    >
                        <div className="grid grid-cols-3 gap-2.5">
                            {rentals.slice(0, 3).map((r) => (
                                <div key={r.id} className="group cursor-pointer">
                                    <div className="relative aspect-square overflow-hidden rounded-xl bg-[#F5F0E8] ring-1 ring-black/5">
                                        <Image
                                            src={r.image}
                                            alt={r.name}
                                            fill
                                            className="object-cover transition duration-300 group-hover:scale-105"
                                        />
                                    </div>
                                    <p className="mt-1.5 truncate text-[11px] font-semibold text-[#1A130E]">
                                        {r.name}
                                    </p>
                                    <p className="text-[10px] font-bold text-[#9E2A1B]">Due {r.dueDate}</p>
                                </div>
                            ))}
                        </div>
                        <ActionButton href="/profile/rentals">Manage Rentals</ActionButton>
                    </SectionCard>

                    <SectionCard
                        icon={Heart}
                        title="Saved Items"
                        sub={`${favorites.length} items saved`}
                        href="/saved"
                    >
                        <div className="grid grid-cols-3 gap-2.5">
                            {favorites.slice(0, 3).map((f) => (
                                <div
                                    key={f.id}
                                    className="relative aspect-square overflow-hidden rounded-xl bg-[#F5F0E8] ring-1 ring-black/5 transition duration-300 hover:scale-[1.02]"
                                >
                                    <Image src={f.image} alt={f.name} fill className="object-cover" />
                                </div>
                            ))}
                        </div>
                        <ActionButton href="/saved">View Saved Items</ActionButton>
                    </SectionCard>
                </div>

                {/* ── Grid Row 2: Donations & Order History ── */}
                <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.6fr]">
                    <SectionCard
                        icon={Gift}
                        title="My Donations"
                        sub={`${donations.length} total donations`}
                        href="/profile/donations"
                    >
                        <div className="space-y-2">
                            {donations.length === 0 ? (
                                <p className="py-4 text-center text-[11px] text-[#8C7E74]">
                                    No donations yet.
                                </p>
                            ) : (
                                donations.slice(0, 3).map((d) => (
                                    <div
                                        key={d.id}
                                        className="flex items-center justify-between gap-2 rounded-xl border border-[#EBE3D5]/60 bg-stone-50/50 px-3 py-2 transition duration-200 hover:border-[#EBE3D5] hover:bg-white"
                                    >
                                        {/* Org icon instead of a clothing thumbnail — a donation
                                        has no photo, it's linked to an Organization */}
                                        <div className="flex min-w-0 items-center gap-2.5">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F5F0E8] text-[#9E2A1B] ring-1 ring-black/5">
                                                <Building2 size={14} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-[11px] font-semibold text-[#1A130E]">
                                                    {d.organization?.name ?? 'Organization'}
                                                </p>
                                                <p className="text-[10px] text-[#8C7E74]">
                                                    ~{d.estimatedWeightKg} kg
                                                </p>
                                            </div>
                                        </div>

                                        {/* Pulled from the shared DONATION_STATUS_STYLES map
                                            (declared once near ORDER_STATUS_STYLES) instead of an
                                            inline object literal — that inline version is what was
                                            throwing TS7053, since an untyped object literal can't
                                            be indexed with a DonationStatus key */}
                                        <span
                                            className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${DONATION_STATUS_STYLES[d.status]}`}
                                        >
                                            {d.status}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                        <ActionButton href="/profile/donations">View Donation History</ActionButton>
                    </SectionCard>

                    <SectionCard
                        icon={Package}
                        title="Order History"
                        sub={`${orders.length} orders placed`}
                        href="/profile/order-history"
                    >
                        <div className="space-y-2">
                            {orders.slice(0, 3).map((o) => (
                                <Link
                                    key={o.id}
                                    href="/order-history"
                                    className="group flex items-center gap-3.5 rounded-xl border border-[#EBE3D5]/60 bg-stone-50/50 p-2.5 transition duration-200 hover:border-[#EBE3D5] hover:bg-white hover:shadow-sm"
                                >
                                    <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-[#F5F0E8] ring-1 ring-black/5">
                                        <Image
                                            src={o.itemImage}
                                            alt={o.itemName}
                                            fill
                                            className="object-cover transition duration-300 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-semibold text-[#1A130E]">
                                            {o.itemName}
                                        </p>
                                        <p className="text-[10px] text-[#8C7E74]">Order #{o.orderNumber}</p>
                                    </div>
                                    <span
                                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${ORDER_STATUS_STYLES[o.status]}`}
                                    >
                                      {o.status}
                                    </span>
                                    <span className="shrink-0 text-[11px] text-[#8C7E74]">{o.date}</span>
                                    <ChevronRight
                                        size={15}
                                        className="shrink-0 text-[#B5A89E] transition-transform duration-200 group-hover:translate-x-0.5"
                                    />
                                </Link>
                            ))}
                        </div>
                        <ActionButton href="/profile/order-history">View All Orders</ActionButton>
                    </SectionCard>
                </div>

                {/* ── Grid Row 3: Account Details & Settings ── */}
                <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
                    {/* Account Information Section */}
                    <div className="flex flex-col justify-between rounded-2xl border border-[#EBE3D5] bg-white p-6 shadow-sm">
                        <div>
                            <div className="flex items-center gap-3 border-b border-[#EBE3D5]/60 pb-4">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#9E2A1B]/10 text-[#9E2A1B]">
                                    <Info size={18} />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-[#1A130E]">
                                        Account Details
                                    </h3>
                                    <p className="text-xs text-[#8C7E74]">
                                        Manage personal information and key details
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 space-y-2">
                                <DetailRow label="Full Name" value={profile.name} />
                                <DetailRow label="Email Address" value={profile.email ?? "—"} />
                                <DetailRow
                                    label="Phone Number"
                                    value={profile.phone ?? "—"}
                                    onEdit={() => setShowPhoneModal(true)}
                                />
                            </div>
                        </div>

                        <div className="mt-6 space-y-1 border-t border-[#EBE3D5]/60 pt-4">
                            <NavRow
                                icon={Bell}
                                title="Notification Preferences"
                                sub="Manage updates & alerts"
                                href="/profile/notifications"
                            />
                            <NavRow
                                icon={Book}
                                title="Address Book"
                                sub="Manage saved addresses"
                                href="/profile/addresses"
                            />
                            <NavRow
                                icon={Lock}
                                title="Password & Security"
                                sub="Security and authentication"
                                href="/profile/security"
                            />
                        </div>
                    </div>

                    {/* Account & Preferences Section */}
                    <div className="flex flex-col justify-between rounded-2xl border border-[#EBE3D5] bg-white p-6 shadow-sm">
                        <div>
                            <div className="border-b border-[#EBE3D5]/60 pb-4">
                                <h3 className="text-base font-bold text-[#1A130E]">
                                    Account &amp; Settings
                                </h3>
                                <p className="text-xs text-[#8C7E74]">
                                    App preferences and account control
                                </p>
                            </div>

                            <div className="mt-4 space-y-1">
                                <NavRow
                                    icon={Bell}
                                    title="Notification Settings"
                                    sub="Control push notifications"
                                    href="/profile/notifications"
                                />
                                <NavRow
                                    icon={ShieldCheck}
                                    title="Privacy Settings"
                                    sub="Data sharing and visibility"
                                    href="/profile/privacy"
                                />
                                <NavRow
                                    icon={CreditCard}
                                    title="Payment Methods"
                                    sub="Manage cards and payout channels"
                                    href="/profile/payment"
                                />
                                <NavRow
                                    icon={HelpCircle}
                                    title="Help & Support"
                                    sub="FAQs and direct assistance"
                                    href="/support"
                                />
                                <NavRow
                                    icon={Info}
                                    title="About RE:WEAR"
                                    sub="Mission and terms"
                                    href="/about"
                                />
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                signOut();
                                toast.info("Signed out");
                                router.push("/login");
                            }}
                            className="mt-6 flex w-full items-center gap-3 rounded-xl border border-red-200 bg-red-50/50 p-3 text-xs font-bold text-[#9E2A1B] transition duration-200 hover:bg-red-100/60 active:scale-[0.99]"
                        >
                            <LogOut size={16} />
                            <span className="text-left">
              Log Out
              <span className="block text-[10px] font-normal text-[#8C7E74]">
                Sign out of your session
              </span>
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
   (unchanged — public stats intentionally still come from profile.stats,
   since this is another seller's page, not the logged-in user's own data.
   Avatar here is display-only — no camera overlay, no upload input — since
   only the profile owner may change their own picture.)
══════════════════════════════════════════════════════════ */

function availabilityBadge(availability?: string) {
    if (availability === "Sold Out") {
        return { label: "Sold Out", className: "bg-[#3D332C] text-white" };
    }
    if (availability === "Reserved") {
        return { label: "Reserved", className: "bg-[#92740E] text-white" };
    }
    return null;
}

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

                {/* Header banner */}
                <div className="flex flex-col gap-5 rounded-xl border border-[#EBE3D5] bg-white p-6 sm:flex-row sm:items-center sm:gap-8">
                    <div className="flex items-center gap-4 sm:shrink-0 sm:border-r sm:border-[#EBE3D5] sm:pr-8">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-[#EBE3D5] bg-[#9E2A1B] text-white">
                            {profile.avatarUrl ? (
                                <Image src={profile.avatarUrl} alt={profile.name} fill className="object-cover" />
                            ) : (
                                <span className="flex h-full w-full items-center justify-center text-[18px] font-bold">
                                    {getInitials(profile.name)}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <h1 className="font-serif text-[24px] font-normal text-[#1A130E]">{profile.name}</h1>
                            {profile.isVerified && (
                                <span className="flex items-center gap-1 rounded-full bg-[#9E2A1B] px-2.5 py-0.5 text-[11px] font-bold text-white">
                                    <BadgeCheck size={12} /> Verified Seller
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-1 flex-wrap items-center gap-x-8 gap-y-3">
                        <InfoItem icon={User} label="Full Name" value={profile.name} />
                        <InfoItem icon={Calendar} label="Joined Since" value={profile.joinedDate} />
                    </div>
                </div>

                {/* Stats */}
                <div className="mt-4 flex flex-col divide-y divide-[#EBE3D5] rounded-xl border border-[#EBE3D5] bg-white sm:flex-row sm:divide-x sm:divide-y-0">
                    <StatBlock icon={ShoppingBag} value={profile.stats.listingsPosted} label="Items Listed" description="Total items listed by seller" />
                    <StatBlock icon={Tag} value={profile.stats.activeItems} label="Active Items" description="Currently available" />
                    <StatBlock icon={ShoppingBag} value={profile.stats.soldOrRented} label="Sold / Rented" description="Successfully completed" />
                    <StatBlock icon={Heart} value={profile.stats.savedByUsers} label="Saved by Users" description="Users who saved this profile" />
                </div>

                {/* Filter and Title */}
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

                {/* Items Grid */}
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
                                    {(() => {
                                        const avail = availabilityBadge(item.availability);
                                        return avail ? (
                                            <span className={`absolute right-2 top-2 rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${avail.className}`}>
                                                {avail.label}
                                            </span>
                                        ) : null;
                                    })()}
                                    <button
                                        onClick={() => handleSave(item)}
                                        aria-label={isFav ? `Remove ${item.name} from favourites` : `Save ${item.name}`}
                                        className="absolute right-2 bottom-2 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm"
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
                        className="inline-block rounded-lg border border-[#9E2A1B] bg-[#9E2A1B]/5 px-6 py-2.5 text-[13px] font-bold text-[#9E2A1B] transition hover:bg-[#9E2A1B]/10"
                    >
                        View All Listings
                    </Link>
                </div>

                {/* About & Policies */}
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

function InfoItem({ icon: Icon, label, value }: { icon: typeof Heart; label: string; value: string }) {
    return (
        <div className="flex items-center gap-2">
            <Icon size={14} className="shrink-0 text-[#9E2A1B]" />
            <div>
                <p className="text-[9px] font-semibold uppercase tracking-wide text-[#8C7E74]">{label}</p>
                <p className="text-[13px] font-semibold text-[#1A130E]">{value}</p>
            </div>
        </div>
    );
}

function StatBlock({
                       icon: Icon,
                       value,
                       suffix = "",
                       label,
                       description,
                   }: {
    icon: typeof Heart;
    value: number;
    suffix?: string;
    label: string;
    description: string;
}) {
    return (
        <div className="flex flex-1 items-center gap-3 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FAF0E6] text-[#9E2A1B]">
                <Icon size={18} />
            </div>
            <div className="min-w-0">
                <p className="text-[20px] font-bold leading-tight text-[#1A130E]">
                    {value}
                    <span className="text-[13px] font-semibold text-[#8C7E74]">{suffix}</span>
                </p>
                <p className="text-[12px] font-semibold text-[#1A130E]">{label}</p>
                <p className="truncate text-[11px] text-[#8C7E74]">{description}</p>
            </div>
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