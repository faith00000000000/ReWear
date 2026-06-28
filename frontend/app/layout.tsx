import type { Metadata } from "next";
import {
    Geist,
    Geist_Mono,
    Poppins,
    Playfair_Display,
    Space_Mono,
} from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import Navbar from "@/layout/Navbar";
import Footer from "@/layout/Footer";
import { CartProvider } from "@/lib/CartContext";
import { Suspense } from "react";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const poppins = Poppins({ weight: ["400", "500", "600", "700"], subsets: ["latin"], variable: "--font-poppins" });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"], variable: "--font-playfair" });
const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-space-mono" });

export const metadata: Metadata = {
    title: "RE:WEAR - Fashion That Lasts",
    description: "Curated vintage, thrift and rental fashion for sustainable style.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className={`
        ${geistSans.variable}
        ${geistMono.variable}
        ${poppins.variable}
        ${playfair.variable}
        ${spaceMono.variable}
        antialiased
      `}
        >
        <body suppressHydrationWarning className="min-h-screen font-sans text-[#1A1A1A] bg-[#FBF7EE]">
        <AuthProvider>
            <CartProvider>

            {/* ── Fixed red top border line ── */}
            <div className="fixed top-0 left-0 right-0 z-[100] h-[6px] bg-[#962D18]" />

            {/* ── Fixed left border ── */}
            <div className="fixed top-0 left-0 bottom-0 z-[100] w-[6px] bg-[#962D18]" />

            {/* ── Fixed right border ── */}
            <div className="fixed top-0 right-0 bottom-0 z-[100] w-[6px] bg-[#962D18]" />

            {/* ── Page shell: offset from fixed borders ── */}
            {/*    pl-[6px] pr-[6px] pt-[6px] = room for the 3 fixed border bars */}
            <div className="pl-[4px] pr-[4px] pt-[4px] min-h-screen flex flex-col">

                {/* Sticky Navbar sits just below the fixed red top bar */}
                {/* top-[6px] aligns it flush under the red line */}
                <div className="sticky top-[4px] z-50">
                    {/*<Navbar />*/}
                    <Suspense fallback={null}>
                        <Navbar />
                    </Suspense>
                </div>

                {/* Page content */}
                <main className="flex-1">
                    {children}
                </main>

                <Footer />
            </div>

            </CartProvider>
        </AuthProvider>
        </body>
        </html>
    );
}