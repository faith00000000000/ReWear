"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  ShoppingBag,
  Users,
  Flag,
  HeartHandshake,
  Wallet,
  Leaf,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  description: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    description: "Overview",
  },
  {
    label: "Listing Management",
    href: "/admin/listings",
    icon: ClipboardList,
    description: "All listed items",
  },
  {
    label: "Order Management",
    href: "/admin/orders",
    icon: ShoppingBag,
    description: "Sales & rentals",
  },
  {
    label: "User Management",
    href: "/admin/users",
    icon: Users,
    description: "Flagged accounts",
  },
  {
    label: "Report Management",
    href: "/admin/reports",
    icon: Flag,
    description: "Reported listings",
  },
  {
    label: "Donation Management",
    href: "/admin/donations",
    icon: HeartHandshake,
    description: "Pickup & drop-off",
  },
  {
    label: "Earnings",
    href: "/admin/earnings",
    icon: Wallet,
    description: "Commission & income",
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-[280px] shrink-0 h-screen sticky top-0 bg-[#FDF6EC] border-r-[4px] border-[#A33214]">
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-6 py-6 border-b-[4px] border-[#A33214]">
        <div className="flex h-10 w-10 items-center justify-center bg-[#A33214] text-[#FDF6EC]">
          <Leaf size={20} strokeWidth={2} />
        </div>
        <div>
          <p
            className="text-[#1C1C1C] text-lg leading-none"
            style={{ fontFamily: "Georgia, serif" }}
          >
            ReWear
          </p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#A33214] mt-1">
            Admin Console
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <p className="px-2 mb-3 text-[10px] uppercase tracking-[0.18em] text-[#1C1C1C]/50">
          Management
        </p>
        <ul className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname?.startsWith(item.href);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`group flex items-center gap-3 px-3 py-2.5 border-2 transition-colors ${
                    isActive
                      ? "bg-[#A33214] border-[#A33214] text-[#FDF6EC]"
                      : "bg-transparent border-transparent text-[#1C1C1C] hover:border-[#A33214]/40"
                  }`}
                >
                  <Icon
                    size={18}
                    strokeWidth={2}
                    className={isActive ? "text-[#FDF6EC]" : "text-[#A33214]"}
                  />
                  <span className="flex-1">
                    <span
                      className={`block text-sm uppercase tracking-[0.06em] ${
                        isActive ? "text-[#FDF6EC]" : "text-[#1C1C1C]"
                      }`}
                    >
                      {item.label}
                    </span>
                    <span
                      className={`block text-[11px] mt-0.5 ${
                        isActive ? "text-[#FDF6EC]/70" : "text-[#1C1C1C]/50"
                      }`}
                    >
                      {item.description}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      {/* <div className="px-6 py-5 border-t-[4px] border-[#A33214]">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#1C1C1C]/40">
          ReWear Admin v1.0
        </p>
      </div> */}
    </aside>
  );
}
