"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useNotifications } from "@/lib/NotificationContext";

import { useState, useRef, useEffect } from "react";
import {
  Bell,
  ChevronDown,
  Menu,
  LogOut,
  CheckCheck,
  ClipboardList,
  Users,
  Flag,
  HeartHandshake,
} from "lucide-react";

interface AdminNavbarProps {
  title?: string;
  onMenuClick?: () => void;
  adminName?: string;
  adminEmail?: string;
  adminInitials?: string;
}

export default function AdminNavbar({
  title = "Dashboard",
  onMenuClick,
  adminName = "Admin User",
  adminEmail = "admin@rewear.com",
  adminInitials = "AD",
}: AdminNavbarProps) {
  const router = useRouter();
  const { signOut } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { unreadCount, items: notifications, markRead, markAllRead, error } = useNotifications();

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const handleSignOut = () => {
    setProfileOpen(false);
    setNotificationsOpen(false);
    signOut();
    router.replace("/login");
    router.refresh();
  };

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
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-[#FDF6EC] border-b-2 border-[#1C1C1C]/15 px-4 sm:px-6 py-4 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Toggle & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden flex items-center justify-center h-10 w-10 border-2 border-[#1C1C1C] text-[#1C1C1C] hover:bg-[#A33214] hover:border-[#A33214] hover:text-[#FDF6EC] transition-colors rounded-xl focus:outline-none"
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
          </div>
        </div>

        <div className="flex-1" />

        {/* Right: Notifications + Admin Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Notifications Dropdown Container */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => {
                setNotificationsOpen((v) => !v);
                setProfileOpen(false);
              }}
              className={`relative flex items-center justify-center h-10 w-10 transition-colors rounded-xl ${
                notificationsOpen
                  ? "border-[#A33214] bg-[#A33214]/10 text-[#A33214]"
                  : "border-[#1C1C1C]/15 text-[#1C1C1C] hover:border-[#A33214] hover:text-[#A33214]"
              }`}
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[20px] h-[20px] px-1 bg-[#A33214] text-[#FDF6EC] text-[10px] font-black border-2 border-[#FDF6EC] rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#FDF6EC] border-2 border-[#1C1C1C] shadow-xl z-40 rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
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
                      onClick={() => void markAllRead()}
                      className="text-[10px] font-extrabold text-[#A33214] hover:underline flex items-center gap-1 uppercase"
                    >
                      <CheckCheck size={12} /> Mark Read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-[#1C1C1C]/10">
                  {error && <p role="alert" className="p-3 text-xs text-red-700">{error}</p>}
                  {notifications.length === 0 && <p className="p-3 text-xs">No notifications yet.</p>}
                  {notifications.slice(0, 5).map((item) => (
                    <Link
                      href={item.href}
                      onClick={() => { void markRead(item.id); setNotificationsOpen(false); }}
                      key={item.id}
                      className={`block p-3 text-xs transition-colors hover:bg-white/80 cursor-pointer ${
                        !item.readAt ? "bg-[#A33214]/5" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-[#1C1C1C]">
                        <span>{item.title}</span>
                        <span className="text-[10px] font-normal text-[#1C1C1C]/50">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#1C1C1C]/70 mt-1">
                        {item.message}
                      </p>
                    </Link>
                  ))}
                </div>

                <div className="p-2 border-t-2 border-[#1C1C1C]/10 bg-stone-100 text-center">
                  <Link href="/notifications" className="text-[11px] uppercase font-bold text-[#1C1C1C] hover:text-[#A33214] transition-colors">
                    View all notifications →
                  </Link>
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
              className={`flex items-center gap-2.5  pl-1.5 pr-3 py-1 transition-colors rounded-xl ${
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
              <div className="absolute right-0 mt-2 w-56 bg-[#FDF6EC] border-2 border-[#1C1C1C] shadow-xl z-40 rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
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
                  {[
                    ["Listings", "/admin/listings", ClipboardList],
                    ["Users", "/admin/users", Users],
                    ["Reports", "/admin/reports", Flag],
                    ["Donations", "/admin/donations", HeartHandshake],
                  ].map(([label, href, Icon]) => (
                    <Link key={String(href)} href={String(href)} onClick={() => setProfileOpen(false)} className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs font-bold text-[#1C1C1C] transition-colors hover:bg-[#A33214]/10">
                      <Icon size={14} className="text-[#A33214]" />{String(label)}
                    </Link>
                  ))}
                </div>

                <div className="border-t-2 border-[#1C1C1C]/10 py-1 bg-red-500/5">
                  <button type="button" onClick={handleSignOut} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-[#A33214] hover:bg-[#A33214] hover:text-[#FDF6EC] transition-colors text-left">
                    <LogOut size={14} />
                    Sign Out
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
