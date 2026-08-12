"use client";

import { useEffect, useRef, useState } from "react";
import {
    Bell,
    Settings,
    CheckCircle2,
    Filter,
    ShoppingBag,
    Truck,
    Package,
    RotateCcw,
    Calendar,
    Clock,
    ShieldCheck,
    Info,
    Tag,
    Star,
    Heart,
    Eye,
    Wallet,
    AlertCircle,
    ChevronDown,
    ChevronRight,
    Mail,
    Smartphone,
    Moon,
    Trash2,
    Check,
} from "lucide-react";

/* ----------------------------- Types ----------------------------- */

type TabKey = "all" | "orders" | "rentals" | "saved" | "listings";

interface NotificationItem {
    id: string;
    category: Exclude<TabKey, "all">;
    icon: React.ElementType;
    iconBg: string; // tailwind bg class
    iconColor: string; // tailwind text class
    title: string;
    description: string;
    actionLabel: string;
    time: string;
    read: boolean;
}

/* --------------------------- Mock Data ---------------------------- */

const NOTIFICATIONS: NotificationItem[] = [
    // Orders
    {
        id: "o1",
        category: "orders",
        icon: ShoppingBag,
        iconBg: "bg-green-100",
        iconColor: "text-green-600",
        title: "Order confirmed!",
        description:
            'Your order #RW12345 has been confirmed. We\'ll notify you when it\'s shipped.',
        actionLabel: "View Order",
        time: "2 min ago",
        read: false,
    },
    {
        id: "o2",
        category: "orders",
        icon: Truck,
        iconBg: "bg-orange-100",
        iconColor: "text-orange-500",
        title: "Your item has been shipped",
        description: '"White Floral Dress" is on its way to you.',
        actionLabel: "Track Shipment",
        time: "25 min ago",
        read: false,
    },
    {
        id: "o3",
        category: "orders",
        icon: Package,
        iconBg: "bg-indigo-100",
        iconColor: "text-indigo-500",
        title: "Out for delivery",
        description: "Your order #RW12345 is out for delivery and will arrive today.",
        actionLabel: "Track Now",
        time: "1 hr ago",
        read: false,
    },
    {
        id: "o4",
        category: "orders",
        icon: RotateCcw,
        iconBg: "bg-rose-100",
        iconColor: "text-rose-500",
        title: "Return received",
        description: "We've received your return. Your refund will be processed soon.",
        actionLabel: "View Return Details",
        time: "Yesterday, 6:15 PM",
        read: true,
    },

    // Rentals
    {
        id: "r1",
        category: "rentals",
        icon: Calendar,
        iconBg: "bg-purple-100",
        iconColor: "text-purple-500",
        title: "Rental ending soon",
        description: 'Your rental for "Black Vintage Dress" ends in 2 days on May 21.',
        actionLabel: "View Rental",
        time: "1 hr ago",
        read: false,
    },
    {
        id: "r2",
        category: "rentals",
        icon: Clock,
        iconBg: "bg-orange-100",
        iconColor: "text-orange-500",
        title: "Return due tomorrow",
        description: 'Please return "Hoodie" by May 19 to avoid late fees.',
        actionLabel: "View Return Details",
        time: "2 hrs ago",
        read: false,
    },
    {
        id: "r3",
        category: "rentals",
        icon: CheckCircle2,
        iconBg: "bg-green-100",
        iconColor: "text-green-600",
        title: "Rental extended",
        description: 'You\'ve successfully extended your rental for "One Piece" by 3 days.',
        actionLabel: "View Rental",
        time: "Yesterday, 11:30 AM",
        read: true,
    },
    {
        id: "r4",
        category: "rentals",
        icon: Info,
        iconBg: "bg-blue-100",
        iconColor: "text-blue-500",
        title: "Security deposit refunded",
        description: 'Your security deposit for "White Floral Dress" has been refunded.',
        actionLabel: "View Details",
        time: "May 17, 8:20 PM",
        read: true,
    },

    // Saved
    {
        id: "s1",
        category: "saved",
        icon: Tag,
        iconBg: "bg-orange-100",
        iconColor: "text-orange-500",
        title: "Price dropped on saved item",
        description: '"One Piece" is now Rs. 10,000 (was Rs. 12,000).',
        actionLabel: "View Item",
        time: "1 hr ago",
        read: false,
    },
    {
        id: "s2",
        category: "saved",
        icon: Bell,
        iconBg: "bg-purple-100",
        iconColor: "text-purple-500",
        title: "Item back in stock",
        description: '"White Floral Dress" is available again. Grab it before it\'s gone!',
        actionLabel: "View Item",
        time: "3 hrs ago",
        read: false,
    },
    {
        id: "s3",
        category: "saved",
        icon: Star,
        iconBg: "bg-green-100",
        iconColor: "text-green-600",
        title: "Saved item is almost gone",
        description: 'Only 1 left in stock: "Black Corset Top".',
        actionLabel: "View Item",
        time: "Yesterday, 4:20 PM",
        read: true,
    },
    {
        id: "s4",
        category: "saved",
        icon: Heart,
        iconBg: "bg-rose-100",
        iconColor: "text-rose-500",
        title: "New matching items for you",
        description: "We found new items similar to the ones you saved.",
        actionLabel: "Explore Now",
        time: "May 17, 10:30 AM",
        read: true,
    },

    // My Listings
    {
        id: "l1",
        category: "listings",
        icon: ShieldCheck,
        iconBg: "bg-green-100",
        iconColor: "text-green-600",
        title: "Listing approved!",
        description: '"Black Corset Top" is now live on RE:WEAR.',
        actionLabel: "View Listing",
        time: "30 min ago",
        read: false,
    },
    {
        id: "l2",
        category: "listings",
        icon: Eye,
        iconBg: "bg-orange-100",
        iconColor: "text-orange-500",
        title: "Your item is getting attention",
        description: '"Hoodie" has 15 new views and 3 likes today.',
        actionLabel: "View Insights",
        time: "2 hrs ago",
        read: false,
    },
    {
        id: "l3",
        category: "listings",
        icon: Wallet,
        iconBg: "bg-blue-100",
        iconColor: "text-blue-500",
        title: "Item sold!",
        description: '"White Floral Dress" has been sold. Please ship it within 2 days.',
        actionLabel: "View Order",
        time: "Today, 11:15 AM",
        read: false,
    },
    {
        id: "l4",
        category: "listings",
        icon: AlertCircle,
        iconBg: "bg-rose-100",
        iconColor: "text-rose-500",
        title: "Listing needs attention",
        description: '"Vintage Jacket" is missing some details. Update to get more visibility.',
        actionLabel: "Edit Listing",
        time: "Yesterday, 6:45 PM",
        read: true,
    },
];

const TABS: { key: TabKey; label: string }[] = [
    { key: "all", label: "All" },
    { key: "orders", label: "Orders" },
    { key: "rentals", label: "Rentals" },
    { key: "saved", label: "Saved" },
    { key: "listings", label: "My Listings" },
];

/* --------------------------- Component ----------------------------- */

export default function NotificationsPage() {
    const [activeTab, setActiveTab] = useState<TabKey>("all");
    const [notifications, setNotifications] = useState<NotificationItem[]>(NOTIFICATIONS);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [filterMode, setFilterMode] = useState<"all" | "unread" | "read">("all");
    const [emailNotif, setEmailNotif] = useState(true);
    const [pushNotif, setPushNotif] = useState(true);
    const [doNotDisturb, setDoNotDisturb] = useState(false);

    const settingsRef = useRef<HTMLDivElement>(null);
    const filterRef = useRef<HTMLDivElement>(null);

    // Close dropdowns on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
                setSettingsOpen(false);
            }
            if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
                setFilterOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getCount = (key: TabKey) => {
        if (key === "all") return notifications.length;
        return notifications.filter((n) => n.category === key).length;
    };

    const filteredNotifications = notifications
        .filter((n) => (activeTab === "all" ? true : n.category === activeTab))
        .filter((n) => {
            if (filterMode === "unread") return !n.read;
            if (filterMode === "read") return n.read;
            return true;
        });

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const markSingleAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const clearAll = () => {
        setNotifications([]);
        setSettingsOpen(false);
    };

    return (
        <div className="min-h-screen bg-[#FDF6EC] px-4 py-8 sm:px-8 lg:px-16">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="flex items-center gap-2 font-serif text-3xl font-bold text-gray-900 sm:text-4xl">
                            Notifications
                            <Bell className="h-7 w-7 text-[#A33214]" />
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Stay updated with everything happening on RE:WEAR.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Mark all as read */}
                        <button
                            onClick={markAllAsRead}
                            className="flex items-center gap-2 rounded-full border border-[#A33214]/40 bg-white px-4 py-2 text-sm font-medium text-[#A33214] transition-colors hover:bg-[#A33214]/5"
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            Mark all as read
                        </button>

                        {/* Settings dropdown */}
                        <div className="relative" ref={settingsRef}>
                            <button
                                onClick={() => setSettingsOpen((v) => !v)}
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50"
                                aria-label="Notification settings"
                            >
                                <Settings className="h-5 w-5" />
                            </button>

                            {settingsOpen && (
                                <div className="absolute right-0 z-20 mt-2 w-72 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
                                    <div className="border-b border-gray-100 px-4 py-3">
                                        <p className="font-serif text-sm font-semibold text-gray-900">
                                            Notification Settings
                                        </p>
                                    </div>

                                    <div className="px-4 py-3">
                                        <ToggleRow
                                            icon={Mail}
                                            label="Email Notifications"
                                            checked={emailNotif}
                                            onChange={() => setEmailNotif((v) => !v)}
                                        />
                                        <ToggleRow
                                            icon={Smartphone}
                                            label="Push Notifications"
                                            checked={pushNotif}
                                            onChange={() => setPushNotif((v) => !v)}
                                        />
                                        <ToggleRow
                                            icon={Moon}
                                            label="Do Not Disturb"
                                            checked={doNotDisturb}
                                            onChange={() => setDoNotDisturb((v) => !v)}
                                        />
                                    </div>

                                    <div className="border-t border-gray-100 px-2 py-2">
                                        <button
                                            onClick={clearAll}
                                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Clear all notifications
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs + Filter */}
                <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-gray-100 bg-white p-2 shadow-sm">
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                                    isActive
                                        ? "border border-[#A33214]/50 bg-[#A33214]/5 text-[#A33214]"
                                        : "text-gray-600 hover:bg-gray-50"
                                }`}
                            >
                                {tab.label}
                                <span
                                    className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-semibold ${
                                        isActive
                                            ? "bg-[#A33214] text-white"
                                            : "bg-gray-900 text-white"
                                    }`}
                                >
                  {getCount(tab.key)}
                </span>
                            </button>
                        );
                    })}

                    {/* Filter dropdown */}
                    <div className="relative ml-auto" ref={filterRef}>
                        <button
                            onClick={() => setFilterOpen((v) => !v)}
                            className="flex items-center gap-2 rounded-xl border-l border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                        >
                            <Filter className="h-4 w-4" />
                            Filter
                            <ChevronDown
                                className={`h-3.5 w-3.5 transition-transform ${
                                    filterOpen ? "rotate-180" : ""
                                }`}
                            />
                        </button>

                        {filterOpen && (
                            <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
                                {[
                                    { key: "all", label: "All notifications" },
                                    { key: "unread", label: "Unread only" },
                                    { key: "read", label: "Read only" },
                                ].map((opt) => (
                                    <button
                                        key={opt.key}
                                        onClick={() => {
                                            setFilterMode(opt.key as typeof filterMode);
                                            setFilterOpen(false);
                                        }}
                                        className="flex w-full items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                        {opt.label}
                                        {filterMode === opt.key && (
                                            <Check className="h-4 w-4 text-[#A33214]" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Notification list */}
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    {filteredNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-gray-400">
                            <Bell className="h-8 w-8" />
                            <p className="text-sm">No notifications here.</p>
                        </div>
                    ) : (
                        filteredNotifications.map((n, idx) => {
                            const Icon = n.icon;
                            return (
                                <div
                                    key={n.id}
                                    onClick={() => markSingleAsRead(n.id)}
                                    className={`flex cursor-pointer items-start gap-4 px-6 py-5 transition-colors hover:bg-gray-50 ${
                                        idx !== filteredNotifications.length - 1
                                            ? "border-b border-gray-100"
                                            : ""
                                    } ${!n.read ? "bg-[#FDF6EC]/40" : ""}`}
                                >
                                    {/* Icon */}
                                    <div
                                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${n.iconBg}`}
                                    >
                                        <Icon className={`h-5 w-5 ${n.iconColor}`} />
                                    </div>

                                    {/* Content */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-3">
                                            <p className="font-serif text-[15px] font-semibold text-gray-900">
                                                {n.title}
                                            </p>
                                            <span className="shrink-0 whitespace-nowrap text-xs text-gray-400">
                        {n.time}
                      </span>
                                        </div>
                                        <p className="mt-1 text-sm text-gray-500">{n.description}</p>
                                        <button className="mt-2 flex items-center gap-1 text-sm font-medium text-[#A33214] hover:underline">
                                            {n.actionLabel}
                                            <ChevronRight className="h-3.5 w-3.5" />
                                        </button>
                                    </div>

                                    {/* Unread dot */}
                                    <div className="pt-1">
                    <span
                        className={`block h-2 w-2 rounded-full ${
                            n.read ? "bg-gray-300" : "bg-red-500"
                        }`}
                    />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

/* ------------------------ Toggle Row Helper ------------------------ */

function ToggleRow({
                       icon: Icon,
                       label,
                       checked,
                       onChange,
                   }: {
    icon: React.ElementType;
    label: string;
    checked: boolean;
    onChange: () => void;
}) {
    return (
        <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2 text-sm text-gray-700">
                <Icon className="h-4 w-4 text-gray-500" />
                {label}
            </div>
            <button
                onClick={onChange}
                className={`relative h-5 w-9 rounded-full transition-colors ${
                    checked ? "bg-[#A33214]" : "bg-gray-300"
                }`}
            >
        <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                checked ? "translate-x-4" : "translate-x-0.5"
            }`}
        />
            </button>
        </div>
    );
}