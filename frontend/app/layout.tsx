import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Poppins,
  Playfair_Display,
  Space_Mono,
} from "next/font/google";
import "./globals.css";

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
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-playfair",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  title: "RE:WEAR - Fashion That Lasts",
  description:
    "Curated vintage, thrift and rental fashion for sustainable style.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
      <body
        suppressHydrationWarning
        className="min-h-screen font-sans text-[#1A1A1A] bg-[#FBF7EE]"
      >
        {children}
      </body>
    </html>
  );
}
