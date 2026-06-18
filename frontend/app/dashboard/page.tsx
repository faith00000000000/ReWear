"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { getUser, clearTokens, isAuthenticated } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth";

import Footer from "@/layout/Footer";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardProfileCard from "@/components/dashboard/DashboardProfileCard";
import DashboardStats from "@/components/dashboard/ DashboardStats";
import DashboardQuickActions from "@/components/dashboard/ DashboardQuickActions";
import DashboardActiveRentals from "@/components/dashboard/ DashboardActiveRentals";
import DashboardActivityFeed from "@/components/dashboard/ DashboardActivityFeed";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    const userData = getUser();
    setUser(userData);
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    clearTokens();
    router.push("/login");
  };

  const firstName = user?.fullName?.split(" ")[0] ?? "there";

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF2E6]">
        <p className="text-[16px] font-medium text-[#5f5048]">Loading…</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FAF2E6] text-[#211714]">
      <div className="border-x-[6px] border-t-[6px] border-[#AC1B18]">
        {/* Navbar */}
        <DashboardHeader
          user={user}
          onSignOut={handleLogout}
          notificationCount={2}
          cartCount={1}
        />

        <main className="mx-auto max-w-[1180px] px-6 py-10 lg:px-10 space-y-10">
          {/* Greeting */}
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.42em] text-[#81776c]">
              Dashboard
            </p>
            <h1 className="mt-1 text-[28px] font-black tracking-[-0.02em] text-[#1b1110] [font-family:Georgia,serif]">
              {getGreeting()}, {firstName}
            </h1>
          </div>

          {/* Pending alert */}
          <div className="flex items-center gap-3 border-2 border-[#f2c18b] bg-[#fffaf2] px-5 py-3">
            <AlertCircle size={15} className="text-[#AC1B18] shrink-0" />
            <p className="text-[12px] font-semibold text-[#5f5048]">
              You have{" "}
              <span className="font-black text-[#AC1B18]">
                2 pending rental requests
              </span>{" "}
              waiting for your approval.
            </p>
            <Link
              href="/dashboard/rentals"
              className="ml-auto whitespace-nowrap text-[11px] font-black uppercase tracking-[0.2em] text-[#AC1B18] underline underline-offset-2 hover:no-underline"
            >
              Review now →
            </Link>
          </div>

          {/* Profile + Stats side by side */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
            <DashboardProfileCard user={user} />
            <div className="space-y-6">
              <DashboardStats />
              <DashboardQuickActions />
            </div>
          </div>

          {/* Active rentals */}
          <DashboardActiveRentals />

          {/* Activity feed */}
          <DashboardActivityFeed />
        </main>

        <Footer />
      </div>
    </div>
  );
}
