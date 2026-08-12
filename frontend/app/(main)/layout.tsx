import { Suspense } from "react";
import Navbar from "@/layout/Navbar";
import Footer from "@/layout/Footer";

// ── Fixed Decorative Border Overlay ──────────────────────────────────────────
const FixedBorderOverlay = () => (
  <>
    <div className="fixed top-0 left-0 right-0 z-[100] h-[6px] bg-[#962D18]" />
    <div className="fixed top-0 left-0 bottom-0 z-[100] w-[6px] bg-[#962D18]" />
    <div className="fixed top-0 right-0 bottom-0 z-[100] w-[6px] bg-[#962D18]" />
  </>
);

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Decorative outer borders for main store pages */}
      <FixedBorderOverlay />

      {/* Page Shell */}
      <div className="flex min-h-screen flex-col pt-[6px] px-[6px]">
        {/* Sticky Header */}
        <header className="sticky top-[6px] z-50">
          <Suspense fallback={null}>
            <Navbar />
          </Suspense>
        </header>

        {/* Main Content Area */}
        <main className="flex-1">{children}</main>

        <Footer />
      </div>
    </>
  );
}
