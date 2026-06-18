"use client";

import Link from "next/link";
import {
  Bell,
  ShoppingBag,
  Plus,
  ChevronRight,
  Pencil,
  Gift,
  Heart,
  CalendarClock,
  Package,
  LogOut,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import type { AuthUser } from "@/lib/auth";
import UserAvatar from "@/components/user/UserAvatar";

const DROPDOWN_LINKS = [
  { label: "Dashboard", href: "/dashboard", icon: Package },
  { label: "My Listings", href: "/dashboard/listings", icon: Package },
  { label: "Active Rentals", href: "/dashboard/rentals", icon: CalendarClock },
  { label: "Wishlist", href: "/wishlist", icon: Heart },
  { label: "My Donations", href: "/dashboard/donations", icon: Gift },
];

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Browse Finds", href: "/browse-finds" },
  { label: "Collections", href: "/collections" },
  { label: "Rent", href: "/rent" },
  { label: "Donate", href: "/donate" },
  { label: "AI Try-On", href: "/ai-try-on" },
];

interface Props {
  user: AuthUser;
  onSignOut: () => void;
  notificationCount?: number;
  cartCount?: number;
}

export default function DashboardHeader({
  user,
  onSignOut,
  notificationCount = 2,
  cartCount = 1,
}: Props) {
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="border-b border-[#d7cbbb] bg-white">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-6 px-6 py-4 lg:px-10">
        {/* Logo */}
        <Link
          href="/"
          className="text-[22px] font-black tracking-[-0.02em] text-[#1b1110] hover:text-[#AC1B18] transition [font-family:Georgia,serif] shrink-0"
        >
          RE:WEAR
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-gray-700 transition-colors hover:text-green-600 whitespace-nowrap"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Notifications */}
          <Link
            href="/dashboard/notifications"
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center bg-white text-[#5f5048] transition hover:border-[#AC1B18] hover:text-[#AC1B18]"
          >
            <Bell size={16} />
            {notificationCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#AC1B18] text-[9px] font-black text-white animate-pulse">
                {notificationCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative flex h-9 w-9 items-center justify-center bg-white text-[#5f5048] transition hover:border-[#AC1B18] hover:text-[#AC1B18]"
          >
            <ShoppingBag size={16} />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#5E6B52] text-[9px] font-black text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* List item CTA */}
          <Link
            href="/sell"
            className="inline-flex rounded-2xl items-center gap-1.5 border-2 border-[#AC1B18] bg-[#AC1B18] px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-[#AC1B18]"
          >
            <Plus size={13} />
            List item
          </Link>

          {/* Avatar dropdown */}
          <div className="relative" ref={dropRef}>
            <button
              onClick={() => setDropOpen((p) => !p)}
              aria-label="User menu"
              className="flex items-center gap-1.5 bg-white px-2 py-1.5 transition hover:border-[#AC1B18]"
            >
              <UserAvatar user={user} size="sm" />
              <ChevronRight
                size={13}
                className={`text-[#8a8177] transition-transform duration-200 ${
                  dropOpen ? "rotate-90" : ""
                }`}
              />
            </button>

            {dropOpen && (
              <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-52 border-2 border-[#d7cbbb] bg-white shadow-lg">
                {/* User info */}
                <div className="border-b border-[#e5ddd2] px-4 py-3">
                  <p className="text-[13px] font-black text-[#1b1110]">
                    {user.fullName}
                  </p>
                  <p className="mt-0.5 text-[10px] font-medium text-[#8a8177] truncate">
                    {user.email}
                  </p>
                  <div className="mt-1.5 inline-flex items-center gap-1 border border-[#d7cbbb] px-2 py-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#5f5048]">
                      Verified seller
                    </span>
                  </div>
                </div>

                {/* Nav links */}
                <div className="py-1">
                  {DROPDOWN_LINKS.map(({ label, href, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setDropOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-[12px] font-semibold text-[#5f5048] transition hover:bg-[#faf7f2] hover:text-[#AC1B18]"
                    >
                      <Icon size={14} className="shrink-0" />
                      {label}
                    </Link>
                  ))}
                </div>

                {/* Settings + sign out */}
                <div className="border-t border-[#e5ddd2] py-1">
                  <Link
                    href="/settings/profile"
                    onClick={() => setDropOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-[12px] font-semibold text-[#5f5048] transition hover:bg-[#faf7f2] hover:text-[#AC1B18]"
                  >
                    <Pencil size={14} />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setDropOpen(false);
                      onSignOut();
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-[12px] font-semibold text-[#AC1B18] transition hover:bg-[#fff5f5]"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
