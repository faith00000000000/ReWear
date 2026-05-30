"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut } from "lucide-react";
import { getUser, clearTokens, isAuthenticated } from "@/app/lib/auth";
import type { AuthUser } from "@/app/lib/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    // Load user from localStorage
    const userData = getUser();
    setUser(userData);
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    clearTokens();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF2E6]">
        <p className="text-[16px] font-medium text-[#5f5048]">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FAF2E6] text-[#211714]">
      <div className="border-x-[6px] border-t-[6px] border-[#AC1B18]">
        {/* Header */}
        <header className="border-b border-[#d7cbbb] bg-white">
          <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-6 lg:px-10">
            <div>
              <h1 className="text-[24px] font-black tracking-[-0.02em] text-[#1b1110] [font-family:Georgia,serif]">
                ReWear Dashboard
              </h1>
              <p className="mt-1 text-[12px] font-medium text-[#8a8177]">
                Welcome back!
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-none border-2 border-[#AC1B18] bg-white px-6 py-3 text-[12px] font-black uppercase tracking-[0.24em] text-[#AC1B18] transition hover:bg-[#AC1B18] hover:text-white"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-[1180px] px-6 py-12 lg:px-10">
          {/* Profile Card */}
          <div className="mx-auto max-w-[500px] space-y-8">
            {/* User Info */}
            <div className="space-y-4">
              <p className="text-[12px] font-black uppercase tracking-[0.42em] text-[#81776c]">
                Your Profile
              </p>
              <div className="space-y-6 rounded-none border-2 border-[#d7cbbb] bg-white p-8">
                {/* Profile Picture */}
                <div className="flex justify-center">
                  {user.profilePictureUrl ? (
                    <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-[#d7cbbb]">
                      <Image
                        src={user.profilePictureUrl}
                        alt={user.fullName}
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#d7cbbb] bg-[#fffaf2]">
                      <span className="text-[32px] font-black text-[#AC1B18]">
                        {user.fullName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* User Details */}
                <div className="space-y-4 text-center">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-[0.36em] text-[#8a8177]">
                      Full Name
                    </label>
                    <p className="mt-2 text-[16px] font-semibold text-[#1b1110]">
                      {user.fullName}
                    </p>
                  </div>

                  <div className="border-t border-[#e5ddd2] pt-4">
                    <label className="block text-[11px] font-black uppercase tracking-[0.36em] text-[#8a8177]">
                      Email
                    </label>
                    <p className="mt-2 break-all text-[14px] font-medium text-[#5f5048]">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <p className="text-[12px] font-black uppercase tracking-[0.42em] text-[#81776c]">
                Quick Actions
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => router.push("/browse-finds")}
                  className="w-full rounded-none border-2 border-[#AC1B18] bg-[#AC1B18] px-6 py-3 text-[12px] font-black uppercase tracking-[0.24em] text-white transition hover:bg-white hover:text-[#AC1B18]"
                >
                  Browse Finds
                </button>
                <button
                  onClick={() => router.push("/rent")}
                  className="w-full rounded-none border-2 border-[#d7cbbb] bg-white px-6 py-3 text-[12px] font-black uppercase tracking-[0.24em] text-[#211714] transition hover:border-[#AC1B18] hover:text-[#AC1B18]"
                >
                  Rent an Item
                </button>
                <button
                  onClick={() => router.push("/donate")}
                  className="w-full rounded-none border-2 border-[#d7cbbb] bg-white px-6 py-3 text-[12px] font-black uppercase tracking-[0.24em] text-[#211714] transition hover:border-[#AC1B18] hover:text-[#AC1B18]"
                >
                  Donate Items
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
