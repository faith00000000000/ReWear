// import type { Metadata } from "next";
// import { Geist, Geist_Mono, Poppins } from "next/font/google";
// import "./globals.css";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// const poppins = Poppins({
//   weight: ["400", "500", "600", "700"],
//   subsets: ["latin"],
//   variable: "--font-poppins",
// });

// export const metadata: Metadata = {
//   title: "RE:WEAR - Fashion That Lasts",
//   description: "Curated vintage and thrift fashion for sustainable style",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html
//       lang="en"
//       className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} h-full antialiased`}
//     >
//       <body className="min-h-full flex flex-col">{children}</body>
//     </html>
//   );
// }

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
  weight: ["700"],
  subsets: ["latin"],
  variable: "--font-serif",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "RE:WEAR - Fashion That Lasts",
  description: "Curated vintage and thrift fashion for sustainable style",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`
        ${geistSans.variable}
        ${geistMono.variable}
        ${poppins.variable}
        ${playfair.variable}
        ${spaceMono.variable}
        h-full antialiased
      `}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
