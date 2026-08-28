"use client";

import { useState } from "react";
import { X } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminNavbar from "@/components/admin/AdminNavbar";

export default function AdminLayout({
                                      children,
                                    }: {
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
      // Outer frame — 4px red border around the entire admin shell
      <div className="min-h-screen bg-[#FDF6EC] border-[4px] border-[#A33214]">
        <div className="flex">
          <AdminSidebar />

          {/* Mobile sidebar drawer */}
          {mobileNavOpen && (
              <div className="fixed inset-0 z-40 lg:hidden">
                <div
                    className="absolute inset-0 bg-[#1C1C1C]/50"
                    onClick={() => setMobileNavOpen(false)}
                />
                <div className="absolute left-0 top-0 h-full w-[280px] bg-[#FDF6EC] border-r-[1px] border-[#A33214]">
                  <button
                      onClick={() => setMobileNavOpen(false)}
                      className="absolute top-4 right-[-44px] flex items-center justify-center h-9 w-9 bg-[#A33214] text-[#FDF6EC]"
                      aria-label="Close menu"
                  >
                    <X size={18} />
                  </button>
                  <AdminSidebar />
                </div>
              </div>
          )}

          <div className="flex-1 min-w-0 flex flex-col">
            <AdminNavbar onMenuClick={() => setMobileNavOpen(true)} />
            <main className="flex-1 px-4 sm:px-6 py-6">{children}</main>
          </div>
        </div>
      </div>
  );
}