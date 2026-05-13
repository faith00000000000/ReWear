"use client";

import { Search, Heart, ShoppingBag, LogIn } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Browse Finds", href: "/browse-finds" },
  { label: "Collections", href: "/collections" },
  { label: "Rent", href: "/rent" },
  { label: "Donate", href: "/donate" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-black hover:text-green-700 transition">
          RE:WEAR
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(({ label, href }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`text-sm font-medium transition-colors ${
                  isActive
                    ? "text-green-700 border-b-2 border-green-700 pb-0.5"
                    : "text-gray-700 hover:text-green-600"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
            <Search size={14} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-sm text-black placeholder-gray-500 focus:outline-none w-28"
            />
          </div>
          <Heart
            size={20}
            className="text-gray-600 cursor-pointer hover:text-rose-500 transition"
          />
          <ShoppingBag
            size={20}
            className="text-gray-600 cursor-pointer hover:text-green-600 transition"
          />
          <Link
            href="/login"
            className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-full hover:bg-green-800 transition font-medium text-sm"
          >
            <LogIn size={16} />
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
