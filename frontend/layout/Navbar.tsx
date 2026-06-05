"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Search,
  LogIn,
  UserPlus,
  Sparkles,
  Bell,
  Heart,
  ChevronRight,
  Package,
  CalendarClock,
  Gift,
  Pencil,
  LogOut,
  LucideIcon,
} from "lucide-react";
import type { AuthUser } from "@/app/lib/auth";
import {
  isAuthenticated,
  getUser,
  clearTokens as clearAuth,
} from "@/app/lib/auth";
import UserAvatar from "@/components/UserAvatar";

/* ─── nav link type definition ───────────────────────────────── */
interface NavLink {
  label: string;
  href: string;
  icon?: boolean | LucideIcon; // Allows icon to be a boolean flag or a Lucide Component
}

/* ─── nav link definitions ───────────────────────────────────── */
const GUEST_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Browse Finds", href: "/browse-finds" },
  { label: "Rent", href: "/rent" },
  { label: "Donate", href: "/donate" },
];

const AUTH_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Browse Finds", href: "/browse-finds" },
  { label: "Rent", href: "/rent" },
  { label: "Donate", href: "/donate" },
  { label: "Collections", href: "/collections" },
  { label: "AI Try-On", href: "/ai-try-on", icon: true },
];

const DROPDOWN_LINKS: NavLink[] = [
  { label: "My Listings", href: "/dashboard/listings", icon: Package },
  { label: "Active Rentals", href: "/dashboard/rentals", icon: CalendarClock },
  { label: "Saved", href: "/wishlist", icon: Heart },
  { label: "My Donations", href: "/dashboard/donations", icon: Gift },
];

/* ─── shared search pill ─────────────────────────────────────── */
function SearchPill() {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-[#fffaf2] rounded-full border border-[#e0d4c4] min-w-50 max-w-60">
      <Search size={14} className="text-[#5E6B52] shrink-0" />
      <input
        type="text"
        placeholder="Search finds, rentals…"
        className="bg-transparent text-sm text-[#211714] placeholder-[#8a8177] focus:outline-none w-full"
      />
    </div>
  );
}

/* ─── main component ─────────────────────────────────────────── */
export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [dropOpen, setDropOpen] = useState(false);
  const [notificationCount] = useState(2);
  const [savedCount] = useState(5);
  const dropRef = useRef<HTMLDivElement>(null);

  /* read auth on mount (client-only) */
  useEffect(() => {
    const ok = isAuthenticated();
    setAuthed(ok);
    if (ok) setUser(getUser());
  }, [pathname]); // re-check on route change

  /* close dropdown on outside click */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleSignOut() {
    clearAuth();
    setAuthed(false);
    setUser(null);
    setDropOpen(false);
    router.push("/");
  }

  const links = authed ? AUTH_LINKS : GUEST_LINKS;

  return (
    <nav className="w-full sticky top-0 z-50 border-b border-[#e4d8c8] bg-[#FAF2E6]/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between gap-6">
        {/* ── Logo ── */}
        <Link
          href="/"
          className="text-[22px] font-black tracking-[-0.02em] text-[#1b1110] hover:text-[#AC1B18] transition shrink-0 font-[Georgia,serif]"
        >
          RE:WEAR
        </Link>

        {/* ── Nav links ── */}
        <div className="hidden lg:flex items-center gap-7">
          {links.map(({ label, href, icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`relative text-sm font-medium transition-all duration-200 flex items-center gap-1 whitespace-nowrap ${
                  isActive
                    ? "text-[#AC1B18] font-semibold"
                    : "text-[#211714] hover:text-[#AC1B18]"
                }`}
              >
                {icon && <Sparkles size={13} className="text-[#AC1B18]" />}
                {label}
                {isActive && (
                  <span className="absolute -bottom-4.5 left-0 w-full h-0.5 bg-[#AC1B18] rounded-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* ── Right side ── */}
        <div className="flex items-center gap-2.5 shrink-0">
          <SearchPill />

          {authed && user ? (
            /* ── AUTHENTICATED right side ── */
            <>
              {/* Notifications */}
              <Link
                href="/dashboard/notifications"
                aria-label="Notifications"
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#5f5048] transition hover:bg-[#f5ede0] hover:text-[#AC1B18]"
              >
                <Bell size={17} />
                {notificationCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#AC1B18] text-[9px] font-black text-white animate-pulse">
                    {notificationCount}
                  </span>
                )}
              </Link>

              {/* Saved / Heart */}
              <Link
                href="/wishlist"
                aria-label="Saved items"
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#5f5048] transition hover:bg-[#f5ede0] hover:text-[#AC1B18]"
              >
                <Heart size={17} />
                {savedCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#5E6B52] text-[9px] font-black text-white">
                    {savedCount}
                  </span>
                )}
              </Link>

              {/* Avatar dropdown */}
              <div className="relative" ref={dropRef}>
                <button
                  onClick={() => setDropOpen((p) => !p)}
                  aria-label="User menu"
                  className="flex items-center gap-1.5 rounded-full px-2 py-1.5 transition hover:bg-[#f5ede0]"
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
                  <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-52 rounded-2xl border border-[#d7cbbb] bg-white shadow-xl overflow-hidden">
                    {/* User info */}
                    <div className="border-b border-[#e5ddd2] px-4 py-3">
                      <p className="text-[13px] font-black text-[#1b1110]">
                        {user.fullName}
                      </p>
                      <p className="mt-0.5 text-[10px] font-medium text-[#8a8177] truncate">
                        {user.email}
                      </p>
                      <div className="mt-1.5 inline-flex items-center gap-1 border border-[#d7cbbb] px-2 py-0.5 rounded-full">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#5f5048]">
                          Verified seller
                        </span>
                      </div>
                    </div>

                    {/* Links */}
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
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-[12px] font-semibold text-[#AC1B18] transition hover:bg-[#fff5f5]"
                      >
                        <LogOut size={14} />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* ── GUEST right side ── */
            <>
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-full bg-white border border-[#d7cbbb] px-4 py-2 text-sm font-bold text-[#211714] transition hover:border-[#AC1B18] hover:text-[#AC1B18]"
              >
                <LogIn size={15} />
                Login
              </Link>
              <Link
                href="/signup"
                className="flex items-center gap-2 rounded-full bg-[#AC1B18] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#8B1614]"
              >
                <UserPlus size={15} />
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
