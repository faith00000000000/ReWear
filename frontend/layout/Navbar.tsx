"use client";
import { useNotifications } from "@/lib/NotificationContext";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, FormEvent } from "react";
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
  Menu,
  X,
  LucideIcon,
  ShoppingCart,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import UserAvatar from "@/components/user/UserAvatar";
import { useCart } from "@/lib/CartContext";

interface NavLink {
  label: string;
  href: string;
  icon?: LucideIcon;
  showSparkles?: boolean;
}

const GUEST_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Thrift", href: "/browse-finds" },
  { label: "Rent", href: "/rent" },
  { label: "Donate", href: "/donate" },
];

const AUTH_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Thrift", href: "/browse-finds" },
  { label: "Rent", href: "/rent" },
  { label: "Donate", href: "/donate" },
];

const DROPDOWN_LINKS: NavLink[] = [
  { label: "My Listings", href: "/profile/listings", icon: Package },
  { label: "Active Rentals", href: "/profile/rentals", icon: CalendarClock },
  { label: "Saved", href: "/saved", icon: Heart },
  { label: "My Donations", href: "/dashboard/donations", icon: Gift },
];

interface SearchPillProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  className?: string;
}

function SearchPill({ value, onChange, onSubmit, className = "" }: SearchPillProps) {
  return (
      <form
          onSubmit={onSubmit}
          className={`flex items-center gap-2 px-4 py-2 bg-[#fffaf2] rounded-full border border-[#e0d4c4] focus-within:border-[#AC1B18] transition ${className}`}
      >
        <button type="submit" aria-label="Search" className="shrink-0 text-[#5E6B52] hover:text-[#AC1B18] transition">
          <Search size={14} />
        </button>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search finds, rentals…"
            className="bg-transparent text-sm text-[#211714] placeholder-[#8a8177] focus:outline-none w-full"
        />
      </form>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentFullPath = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const loginHref = `/login?redirect=${encodeURIComponent(currentFullPath)}`;
  const signupHref = `/signup?redirect=${encodeURIComponent(currentFullPath)}`;

  const { authed, user, signOut } = useAuth();
  const { cartCount } = useCart();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [dropOpen, setDropOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { unreadCount: notificationCount } = useNotifications();
  const dropRef = useRef<HTMLDivElement>(null);

  // Synchronize state with URL search parameters on route change
  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
  }, [searchParams]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery) {
      router.push(`/browse-finds?q=${encodeURIComponent(trimmedQuery)}`);
      setMobileSearchOpen(false);
    } else {
      router.push("/browse-finds");
    }
  };

  const PUBLIC_PATHS = ["/", "/browse-finds", "/rent", "/donate"];

  function handleSignOut() {
    signOut();
    setDropOpen(false);
    setMobileOpen(false);

    const isCurrentPagePublic = PUBLIC_PATHS.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`)
    );

    router.push(isCurrentPagePublic ? currentFullPath : "/");
  }

  const links = authed ? AUTH_LINKS : GUEST_LINKS;

  return (
      <nav className="w-full border-b border-[#e4d8c8] bg-[#FAF2E6]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-6">
          {/* ── Logo ── */}
          <Link href="/" className="flex items-center shrink-0 hover:opacity-85 transition py-1">
            <Image
                src="/images/rewearlogo.png"
                alt="RE:WEAR Logo"
                width={140}
                height={40}
                priority
                className="h-9 w-auto object-contain sm:h-11"
            />
          </Link>

          {/* ── Desktop nav links ── */}
          <div className="hidden lg:flex items-center gap-7">
            {links.map(({ label, href, icon }) => {
              const isActive = pathname === href;
              return (
                  <Link
                      key={href}
                      href={href}
                      className={`relative text-sm font-medium transition-all duration-200 flex items-center gap-1 whitespace-nowrap ${
                          isActive ? "text-[#AC1B18] font-semibold" : "text-[#211714] hover:text-[#AC1B18]"
                      }`}
                  >
                    {icon && <Sparkles size={13} className="text-[#AC1B18]" />}
                    {label}
                    {isActive && <span className="absolute -bottom-4.5 left-0 w-full h-0.5 bg-[#AC1B18] rounded-full" />}
                  </Link>
              );
            })}
          </div>

          {/* ── Right side ── */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Desktop search stays inline */}
            <SearchPill
                value={searchQuery}
                onChange={setSearchQuery}
                onSubmit={handleSearchSubmit}
                className="hidden md:flex min-w-50 max-w-60"
            />

            {/* Mobile search toggle button */}
            <button
                type="button"
                aria-label="Search"
                onClick={() => setMobileSearchOpen((p) => !p)}
                className="flex md:hidden h-9 w-9 items-center justify-center rounded-full text-[#5f5048] transition hover:bg-[#f5ede0] hover:text-[#AC1B18]"
            >
              <Search size={17} />
            </button>

            {authed && user ? (
                <>
                  <Link
                      href="/notifications"
                      aria-label="Notifications"
                      className="relative hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-[#5f5048] transition hover:bg-[#f5ede0] hover:text-[#AC1B18]"
                  >
                    <Bell size={17} />
                    {notificationCount > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#AC1B18] text-[9px] font-black text-white animate-pulse">
                    {notificationCount}
                  </span>
                    )}
                  </Link>

                  <Link
                      href="/cart"
                      aria-label={`Shopping cart, ${cartCount} item${cartCount !== 1 ? "s" : ""}`}
                      className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#5f5048] transition hover:bg-[#f5ede0] hover:text-[#AC1B18]"
                  >
                    <ShoppingCart size={17} />
                    {cartCount > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#AC1B18] text-[9px] font-black text-white">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                    )}
                  </Link>

                  {/* Avatar dropdown */}
                  <div className="relative hidden sm:block" ref={dropRef}>
                    <button
                        onClick={() => setDropOpen((p) => !p)}
                        aria-label="User menu"
                        className="flex items-center gap-1.5 rounded-full px-2 py-1.5 transition hover:bg-[#f5ede0]"
                    >
                      <UserAvatar user={user} size="sm" />
                      <ChevronRight
                          size={13}
                          className={`text-[#8a8177] transition-transform duration-200 ${dropOpen ? "rotate-90" : ""}`}
                      />
                    </button>

                    {dropOpen && (
                        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-52 rounded-2xl border border-[#d7cbbb] bg-white shadow-xl overflow-hidden">
                          <div className="border-b border-[#e5ddd2] px-4 py-3">
                            <p className="text-[13px] font-black text-[#1b1110]">{user.fullName}</p>
                            <p className="mt-0.5 text-[10px] font-medium text-[#8a8177] truncate">{user.email}</p>
                            <div className="mt-1.5 inline-flex items-center gap-1 border border-[#d7cbbb] px-2 py-0.5 rounded-full">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#5f5048]">
                          Verified seller
                        </span>
                            </div>
                          </div>

                          <div className="py-1">
                            {DROPDOWN_LINKS.map(({ label, href, icon: Icon }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    onClick={() => setDropOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2.5 text-[12px] font-semibold text-[#5f5048] transition hover:bg-[#faf7f2] hover:text-[#AC1B18]"
                                >
                                  {Icon && <Icon size={14} className="shrink-0" />}
                                  {label}
                                </Link>
                            ))}
                          </div>

                          <div className="border-t border-[#e5ddd2] py-1">
                            <Link
                                href="/profile"
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
                <>
                  <Link
                      href={loginHref}
                      className="flex items-center gap-2 rounded-full bg-white border border-[#d7cbbb] px-3 py-2 text-sm font-bold text-[#211714] transition hover:border-[#AC1B18] hover:text-[#AC1B18] sm:px-4"
                  >
                    <LogIn size={15} />
                    <span className="hidden sm:inline">Login</span>
                  </Link>
                  <Link
                      href={signupHref}
                      className="flex items-center gap-2 rounded-full bg-[#AC1B18] px-3 py-2 text-sm font-bold text-white transition hover:bg-[#8B1614] sm:px-4"
                  >
                    <UserPlus size={15} />
                    <span className="hidden sm:inline">Sign Up</span>
                  </Link>
                </>
            )}

            {/* Hamburger menu button */}
            <button
                type="button"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                onClick={() => setMobileOpen((p) => !p)}
                className="flex lg:hidden h-9 w-9 items-center justify-center rounded-full text-[#211714] transition hover:bg-[#f5ede0]"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        {mobileSearchOpen && (
            <div className="md:hidden border-t border-[#e4d8c8] px-4 py-3">
              <SearchPill
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onSubmit={handleSearchSubmit}
                  className="w-full max-w-none"
              />
            </div>
        )}

        {/* Mobile nav drawer */}
        {mobileOpen && (
            <div className="lg:hidden border-t border-[#e4d8c8] bg-[#FAF2E6] px-4 py-4">
              <div className="flex flex-col gap-1">
                {links.map(({ label, href, icon }) => {
                  const isActive = pathname === href;
                  return (
                      <Link
                          key={href}
                          href={href}
                          className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                              isActive ? "bg-white text-[#AC1B18]" : "text-[#211714] hover:bg-white/60"
                          }`}
                      >
                        {icon && <Sparkles size={13} className="text-[#AC1B18]" />}
                        {label}
                      </Link>
                  );
                })}
              </div>

              {authed && user && (
                  <div className="mt-3 border-t border-[#e4d8c8] pt-3">
                    <div className="flex items-center gap-2 px-3 py-2">
                      <UserAvatar user={user} size="sm" />
                      <div>
                        <p className="text-[13px] font-black text-[#1b1110]">{user.fullName}</p>
                        <p className="text-[10px] font-medium text-[#8a8177] truncate">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 mt-1">
                      <Link
                          href="/notifications"
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-semibold text-[#5f5048] hover:bg-white/60"
                      >
                        <Bell size={15} />
                        Notifications
                        {notificationCount > 0 && (
                            <span className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-[#AC1B18] text-[9px] font-black text-white">
                      {notificationCount}
                    </span>
                        )}
                      </Link>
                      {DROPDOWN_LINKS.map(({ label, href, icon: Icon }) => (
                          <Link
                              key={href}
                              href={href}
                              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-semibold text-[#5f5048] hover:bg-white/60"
                          >
                            {Icon && <Icon size={15} className="shrink-0" />}
                            {label}
                          </Link>
                      ))}
                      <Link
                          href="/profile"
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-semibold text-[#5f5048] hover:bg-white/60"
                      >
                        <Pencil size={15} />
                        Settings
                      </Link>
                      <button
                          onClick={handleSignOut}
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-semibold text-[#AC1B18] hover:bg-white/60"
                      >
                        <LogOut size={15} />
                        Sign out
                      </button>
                    </div>
                  </div>
              )}
            </div>
        )}
      </nav>
  );
}