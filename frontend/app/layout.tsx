import type { Metadata } from "next";
import { Suspense } from "react";
import {
    Geist,
    Geist_Mono,
    Poppins,
    Playfair_Display,
    Space_Mono,
} from "next/font/google";
import { ToastContainer } from "react-toastify";

import { AuthProvider } from "@/lib/AuthContext";
import { CartProvider } from "@/lib/CartContext";
import { FavoritesProvider } from "@/lib/FavoritesContext";
import { RecentlyViewedProvider } from "@/lib/RecentlyViewedContext";
import Navbar from "@/layout/Navbar";
import Footer from "@/layout/Footer";

import "./globals.css";
import "react-toastify/dist/ReactToastify.css";

// ── Font Definitions ─────────────────────────────────────────────────────────
const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const poppins = Poppins({
    weight: ["400", "500", "600", "700"],
    subsets: ["latin"],
    variable: "--font-poppins",
});

const playfair = Playfair_Display({
    weight: ["400", "500", "600", "700", "800", "900"],
    subsets: ["latin"],
    variable: "--font-playfair",
});

const spaceMono = Space_Mono({
    weight: ["400", "700"],
    subsets: ["latin"],
    variable: "--font-space-mono",
});

// ── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
    title: "RE:WEAR - Fashion That Lasts",
    description: "Curated vintage, thrift and rental fashion for sustainable style.",
};

// ── Fixed Decorative Border Overlay ──────────────────────────────────────────
const FixedBorderOverlay = () => (
    <>
        <div className="fixed top-0 left-0 right-0 z-[100] h-[6px] bg-[#962D18]" />
        <div className="fixed top-0 left-0 bottom-0 z-[100] w-[6px] bg-[#962D18]" />
        <div className="fixed top-0 right-0 bottom-0 z-[100] w-[6px] bg-[#962D18]" />
    </>
);

// ── Combined App Context Providers ───────────────────────────────────────────
const AppProviders = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>
        <CartProvider>
            <FavoritesProvider>
                <RecentlyViewedProvider>{children}</RecentlyViewedProvider>
            </FavoritesProvider>
        </CartProvider>
    </AuthProvider>
);

// ── Root Layout ──────────────────────────────────────────────────────────────
export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    const fontVariables = [
        geistSans.variable,
        geistMono.variable,
        poppins.variable,
        playfair.variable,
        spaceMono.variable,
    ].join(" ");

    return (
        <html
            lang="en"
            suppressHydrationWarning
            className={`${fontVariables} antialiased`}
        >
        <body
            suppressHydrationWarning
            className="min-h-screen bg-[#FBF7EE] font-sans text-[#1A1A1A]"
        >
        <AppProviders>
            {/* Decorative outer borders */}
            <FixedBorderOverlay />

            {/* Page Shell (Padding accounts for 6px fixed borders) */}
            <div className="flex min-h-screen flex-col pt-[6px] px-[6px]">
                {/* Sticky Header aligned flush under top bar */}
                <header className="sticky top-[6px] z-50">
                    <Suspense fallback={null}>
                        <Navbar />
                    </Suspense>
                </header>

                {/* Main Content Area */}
                <main className="flex-1">{children}</main>

                <Footer />
            </div>

            {/* Toast Notifications */}
            <ToastContainer
                aria-label="Notification messages"
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                pauseOnHover
                theme="light"
                toastClassName="!bg-white !text-[#2A1F1A] !rounded-xl !border !border-[#E8DDD0] !shadow-md !font-medium !text-[14px]"
                progressClassName="!bg-[#A33214]"
            />
        </AppProviders>
        </body>
        </html>
    );
}