import Link from "next/link";
import {
    Plus,
    Package,
    CalendarClock,
    Heart,
    ShoppingBag,
    Gift,
} from "lucide-react";

const QUICK_ACTIONS = [
    { label: "List item",   icon: Plus,         href: "/sell",               primary: true  },
    { label: "My listings", icon: Package,       href: "/dashboard/listings", primary: false },
    { label: "Rentals",     icon: CalendarClock, href: "/dashboard/rentals",  primary: false },
    { label: "Wishlist",    icon: Heart,         href: "/wishlist",           primary: false },
    { label: "Orders",      icon: ShoppingBag,   href: "/dashboard/orders",   primary: false },
    { label: "Donate",      icon: Gift,          href: "/donate",             primary: false },
];

export default function DashboardQuickActions() {
    return (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {QUICK_ACTIONS.map(({ label, icon: Icon, href, primary }) => (
                <Link
                    key={href}
                    href={href}
                    className={`flex flex-col items-center gap-2 border-2 px-3 py-3 text-center text-[10px] font-black uppercase tracking-[0.18em] transition ${
                        primary
                            ? "border-[#AC1B18] bg-[#AC1B18] text-white hover:bg-white hover:text-[#AC1B18]"
                            : "border-[#d7cbbb] bg-white text-[#5f5048] hover:border-[#AC1B18] hover:text-[#AC1B18]"
                    }`}
                >
                    <Icon size={16} />
                    {label}
                </Link>
            ))}
        </div>
    );
}