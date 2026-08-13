"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  Bell,
  ChevronDown,
  Menu,
  LogOut,
  Settings,
  X,
  UserCheck,
  Shield,
  CheckCheck,
} from "lucide-react";

interface AdminNavbarProps {
  title?: string;
  onMenuClick?: () => void;
  adminName?: string;
  adminEmail?: string;
  adminInitials?: string;
  notificationCount?: number;
}

export default function AdminNavbar({
  title = "Dashboard",
  onMenuClick,
  adminName = "Admin User",
  adminEmail = "admin@rewear.com",
  adminInitials = "AD",
  notificationCount = 3,
}: AdminNavbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(notificationCount);

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setProfileOpen(false);
        setNotificationsOpen(false);
        setMobileSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Dummy notifications
  const sampleNotifications = [
    {
      id: "1",
      title: "Account Flagged",
      desc: "User USR-902 flagged for counterfeit listings.",
      time: "10m ago",
      unread: true,
    },
    {
      id: "2",
      title: "New Seller Application",
      desc: "ThriftNepal applied for a seller badge.",
      time: "1h ago",
      unread: true,
    },
    {
      id: "3",
      title: "Payout Request",
      desc: "Pending payout request of $420.00.",
      time: "3h ago",
      unread: true,
    },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#FDF6EC] border-b-2 border-[#1C1C1C]/15 px-4 sm:px-6 py-3 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Toggle & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden flex items-center justify-center h-10 w-10 border-2 border-[#1C1C1C] text-[#1C1C1C] hover:bg-[#A33214] hover:border-[#A33214] hover:text-[#FDF6EC] transition-colors rounded-xs focus:outline-none"
            aria-label="Open sidebar navigation"
          >
            <Menu size={18} />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1
                className="text-lg sm:text-2xl font-bold text-[#1C1C1C] truncate tracking-tight"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {title}
              </h1>
            </div>
            <p className="text-[10px] uppercase font-bold tracking-[0.15em] text-[#1C1C1C]/60">
              ReWear Governance Console
            </p>
          </div>
        </div>

        {/* Center: Desktop Global Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <div className="flex items-center w-full gap-2 border-2 border-[#1C1C1C]/20 bg-white/70 px-3.5 py-1.5 focus-within:border-[#A33214] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#A33214] transition-all rounded-xs">
              <Search size={16} className="text-[#1C1C1C]/50 shrink-0" />
              <input
                type="text"
                placeholder="Search listings, flagged users, transactions..."
                className="w-full bg-transparent text-xs font-semibold text-[#1C1C1C] placeholder:text-[#1C1C1C]/40 outline-none"
              />
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[9px] font-mono text-[#1C1C1C]/50 bg-[#1C1C1C]/5 border border-[#1C1C1C]/15 rounded-xs">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right: Search Toggle (Mobile) + Notifications + Admin Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobile Search Button */}
          <button
            onClick={() => setMobileSearchOpen((v) => !v)}
            className="md:hidden flex items-center justify-center h-10 w-10 border-2 border-[#1C1C1C]/15 text-[#1C1C1C] hover:border-[#A33214] hover:text-[#A33214] transition-colors rounded-xs"
            aria-label="Toggle search"
          >
            {mobileSearchOpen ? <X size={18} /> : <Search size={18} />}
          </button>

          {/* Notifications Dropdown Container */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => {
                setNotificationsOpen((v) => !v);
                setProfileOpen(false);
              }}
              className={`relative flex items-center justify-center h-10 w-10 border-2 transition-colors rounded-xs ${
                notificationsOpen
                  ? "border-[#A33214] bg-[#A33214]/10 text-[#A33214]"
                  : "border-[#1C1C1C]/15 text-[#1C1C1C] hover:border-[#A33214] hover:text-[#A33214]"
              }`}
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[20px] h-[20px] px-1 bg-[#A33214] text-[#FDF6EC] text-[10px] font-black border-2 border-[#FDF6EC] rounded-xs animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#FDF6EC] border-2 border-[#1C1C1C] shadow-xl z-40 rounded-xs overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between p-3.5 border-b-2 border-[#1C1C1C]/10 bg-white/50">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase text-[#1C1C1C]">
                      System Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="bg-[#A33214] text-[#FDF6EC] text-[9px] font-black px-1.5 py-0.5">
                        {unreadCount} NEW
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => setUnreadCount(0)}
                      className="text-[10px] font-extrabold text-[#A33214] hover:underline flex items-center gap-1 uppercase"
                    >
                      <CheckCheck size={12} /> Mark Read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-[#1C1C1C]/10">
                  {sampleNotifications.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 text-xs transition-colors hover:bg-white/80 cursor-pointer ${
                        item.unread && unreadCount > 0 ? "bg-[#A33214]/5" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-[#1C1C1C]">
                        <span>{item.title}</span>
                        <span className="text-[10px] font-normal text-[#1C1C1C]/50">
                          {item.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#1C1C1C]/70 mt-1">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="p-2 border-t-2 border-[#1C1C1C]/10 bg-stone-100 text-center">
                  <button className="text-[11px] uppercase font-bold text-[#1C1C1C] hover:text-[#A33214] transition-colors">
                    View All Activity Logs →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu Dropdown Container */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                setProfileOpen((v) => !v);
                setNotificationsOpen(false);
              }}
              className={`flex items-center gap-2.5 border-2 pl-1.5 pr-3 py-1 transition-colors rounded-xs ${
                profileOpen
                  ? "border-[#A33214] bg-[#A33214]/5"
                  : "border-[#1C1C1C]/15 hover:border-[#A33214]"
              }`}
            >
              <span className="flex h-7 w-7 items-center justify-center bg-[#A33214] text-[#FDF6EC] text-xs font-black shrink-0 border border-[#1C1C1C]/20">
                {adminInitials}
              </span>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-extrabold text-[#1C1C1C] leading-tight">
                  {adminName}
                </span>
                <span className="text-[9px] uppercase font-bold text-[#A33214] tracking-wider">
                  Superadmin
                </span>
              </div>
              <ChevronDown
                size={14}
                className={`text-[#1C1C1C]/60 transition-transform duration-200 ${
                  profileOpen ? "rotate-180 text-[#A33214]" : ""
                }`}
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#FDF6EC] border-2 border-[#1C1C1C] shadow-xl z-40 rounded-xs overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Admin Dossier Info */}
                <div className="p-3 border-b-2 border-[#1C1C1C]/10 bg-white/60">
                  <p className="font-bold text-xs text-[#1C1C1C]">
                    {adminName}
                  </p>
                  <p className="text-[10px] text-[#1C1C1C]/60 truncate">
                    {adminEmail}
                  </p>
                </div>

                {/* Actions */}
                <div className="py-1">
                  <button className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-[#1C1C1C] hover:bg-[#A33214]/10 transition-colors text-left">
                    <Shield size={14} className="text-[#1C1C1C]/70" />
                    Security & Permissions
                  </button>
                  <button className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-[#1C1C1C] hover:bg-[#A33214]/10 transition-colors text-left">
                    <Settings size={14} className="text-[#1C1C1C]/70" />
                    Admin Settings
                  </button>
                </div>

                <div className="border-t-2 border-[#1C1C1C]/10 py-1 bg-red-500/5">
                  <button className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-[#A33214] hover:bg-[#A33214] hover:text-[#FDF6EC] transition-colors text-left">
                    <LogOut size={14} />
                    Sign Out Console
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Search Bar (Mobile Viewport) */}
      {mobileSearchOpen && (
        <div className="mt-3 pt-3 border-t border-[#1C1C1C]/15 md:hidden animate-in fade-in duration-150">
          <div className="flex items-center w-full gap-2 border-2 border-[#1C1C1C] bg-white px-3 py-2 rounded-xs">
            <Search size={16} className="text-[#1C1C1C]/60" />
            <input
              type="text"
              autoFocus
              placeholder="Search listings, users, orders..."
              className="w-full bg-transparent text-xs font-semibold text-[#1C1C1C] outline-none"
            />
          </div>
        </div>
      )}
    </header>
  );
}
