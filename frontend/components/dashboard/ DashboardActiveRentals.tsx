import Link from "next/link";
import { ChevronRight } from "lucide-react";

const ACTIVE_RENTALS = [
    {
        emoji: "🧥",
        name: "Vintage Wool Blazer",
        rentedTo: "Sarah M.",
        returnBy: "Dec 28, 2024",
        progress: 71,
    },
    {
        emoji: "👜",
        name: "Mini Crossbody Bag",
        rentedTo: "Rina T.",
        returnBy: "Jan 2, 2025",
        progress: 30,
    },
];

export default function DashboardActiveRentals() {
    return (
        <section>
            <div className="mb-4 flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.42em] text-[#81776c]">
                    Active rentals
                </p>
                <Link
                    href="/dashboard/rentals"
                    className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#AC1B18] hover:underline"
                >
                    View all <ChevronRight size={11} />
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {ACTIVE_RENTALS.map((r) => (
                    <div
                        key={r.name}
                        className="flex items-center gap-4 border-2 border-[#d7cbbb] bg-white p-4"
                    >
                        <div className="flex h-14 w-12 items-center justify-center bg-[#faf7f2] border-2 border-[#e5ddd2] text-2xl shrink-0">
                            {r.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-black text-[#1b1110] truncate">
                                {r.name}
                            </p>
                            <p className="mt-0.5 text-[11px] text-[#8a8177]">
                                Rented to {r.rentedTo}
                            </p>
                            <p className="text-[11px] font-semibold text-[#AC1B18]">
                                Return by {r.returnBy}
                            </p>
                            <div className="mt-2 h-1.5 w-full bg-[#e5ddd2]">
                                <div
                                    className="h-1.5 bg-[#AC1B18] transition-all"
                                    style={{ width: `${r.progress}%` }}
                                />
                            </div>
                            <p className="mt-1 text-[10px] text-[#8a8177]">
                                {r.progress}% of rental period elapsed
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}