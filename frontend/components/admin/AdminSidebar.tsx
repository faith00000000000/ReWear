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
} from "lucide-react";
import Image from "next/image";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Listing Management",
    href: "/admin/listings",
    icon: ClipboardList,
  },
  // {
  //   label: "Order Management",
  //   href: "/admin/orders",
  //   icon: ShoppingBag,
  // },
  {
    label: "User Management",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Report Management",
    href: "/admin/reports",
    icon: Flag,
  },
  {
    label: "Donation Management",
    href: "/admin/donations",
    icon: HeartHandshake,
  },
  {
    label: "Earnings",
    href: "/admin/earnings",
    icon: Wallet,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-[280px] shrink-0 h-screen sticky top-0 bg-[#FDF6EC] border-r-[2px] border-[#1C1C1C]/15">
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-6 py-6 border-b-[2px] border-[#1C1C1C]/15">
        <div className="flex items-center justify-center">
          <Image
            src="/images/official_logo_rewear.png"
            alt="Rewear Logo"
            className="w-10 h-10 object-contain"
            width={40}
            height={40}
          />
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
                  className={`group flex items-center gap-3 px-3 py-2.5 border-2 rounded-sm transition-colors ${
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
                    {/* <span
                      className={`block text-[11px] mt-0.5 ${
                        isActive ? "text-[#FDF6EC]/70" : "text-[#1C1C1C]/50"
                      }`}
                    >
                      {item.description}
                    </span> */}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

    </aside>
  );
}
