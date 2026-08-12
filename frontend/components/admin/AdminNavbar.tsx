"use client";

import { useState } from "react";
import {
  Search,
  Bell,
  ChevronDown,
  Menu,
  LogOut,
  Settings,
} from "lucide-react";

interface AdminNavbarProps {
  title?: string;
  onMenuClick?: () => void;
  adminName?: string;
  adminInitials?: string;
  notificationCount?: number;
}

export default function AdminNavbar({
  title = "Dashboard",
  onMenuClick,
  adminName = "Admin",
  adminInitials = "AD",
  notificationCount = 3,
}: AdminNavbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 bg-[#FDF6EC] border-b border-grey-200 px-4 sm:px-6 py-4">
      {/* Left: menu (mobile) + title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden flex items-center justify-center h-9 w-9 border-2 border-[#A33214] text-[#A33214]"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        <div className="min-w-0">
          <h1
            className="text-xl sm:text-2xl text-[#1C1C1C] truncate"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {title}
          </h1>
          <p className="text-[11px] uppercase tracking-[0.14em] text-[#1C1C1C]/45">
            ReWear Admin
          </p>
        </div>
      </div>

      {/* Center: search */}
      <div className="hidden md:flex flex-1 max-w-md">
        <div className="flex items-center w-full gap-2 border-2 border-[#1C1C1C]/15 bg-white/60 px-3 py-2 focus-within:border-[#A33214] transition-colors">
          <Search size={16} className="text-[#1C1C1C]/50" />
          <input
            type="text"
            placeholder="Search listings, users, orders..."
            className="flex-1 bg-transparent text-sm text-[#1C1C1C] placeholder:text-[#1C1C1C]/40 outline-none"
          />
        </div>
      </div>

      {/* Right: notifications + profile */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          className="relative flex items-center justify-center h-10 w-10 border-2 border-[#1C1C1C]/15 text-[#1C1C1C] hover:border-[#A33214] transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
          {notificationCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center h-5 w-5 bg-[#A33214] text-[#FDF6EC] text-[10px] font-medium">
              {notificationCount}
            </span>
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 border-2 border-[#1C1C1C]/15 hover:border-[#A33214] pl-1.5 pr-3 py-1.5 transition-colors"
          >
            <span className="flex h-7 w-7 items-center justify-center bg-[#A33214] text-[#FDF6EC] text-xs font-medium">
              {adminInitials}
            </span>
            <span className="hidden sm:block text-sm text-[#1C1C1C]">
              {adminName}
            </span>
            <ChevronDown size={14} className="text-[#1C1C1C]/50" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#FDF6EC] border-2 border-[#A33214] shadow-lg z-30">
              <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#1C1C1C] hover:bg-[#A33214]/10 text-left">
                <Settings size={15} />
                Settings
              </button>
              <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#A33214] hover:bg-[#A33214]/10 text-left border-t border-[#1C1C1C]/10">
                <LogOut size={15} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
