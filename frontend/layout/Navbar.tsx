"use client";

import { Search, LogIn, UserPlus, Sparkles } from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Browse Finds", href: "/browse-finds" },
  { label: "Rent", href: "/rent" },
  { label: "Collections", href: "/collections" },
  { label: "Donate", href: "/donate" },
  { label: "AI Try-On", href: "/ai-try-on", icon: true },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="w-full sticky top-0 z-50 border-b border-[#e4d8c8] bg-[#FAF2E6]/95 backdrop-blur-xs">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-black tracking-tight text-[#211714] hover:text-[#AC1B18] transition"
        >
          RE:WEAR
        </Link>

        {/* Center Nav Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map(({ label, href, icon }) => {
            const isActive = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                className={`relative text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
                  isActive
                    ? "text-[#AC1B18] font-semibold"
                    : "text-[#211714] hover:text-[#5E6B52] hover:scale-105 font-medium"
                }`}
              >
                {icon && <Sparkles size={14} />}
                {label}

                {isActive && (
                  <span className="absolute -bottom-2 left-0 w-full h-[2px] bg-[#AC1B18] rounded-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 px-4 py-2 bg-[#fffaf2] rounded-full border border-[#e0d4c4] min-w-[220px]">
            <Search size={15} className="text-[#5E6B52]" />

            <input
              type="text"
              placeholder="Search finds, rentals..."
              className="bg-transparent text-sm text-[#211714] placeholder-[#8a8177] focus:outline-none w-full"
            />
          </div>

          {/* Login */}
          <Link
            href="/login"
            className="bg-[#5E6B52] rounded-2xl flex items-center gap-2 px-4 py-2 text-sm font-bold text-white hover:bg-[#AC1B18] transition"
          >
            <LogIn size={16} />
            Login
          </Link>

          {/* Signup */}
          <Link
            href="/signup"
            className="bg-[#AC1B18] rounded-2xl flex items-center gap-2 px-4 py-2 text-sm font-bold text-white hover:bg-[#5E6B52] transition"
          >
            <UserPlus size={16} />
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}
