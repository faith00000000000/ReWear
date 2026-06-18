import Link from "next/link";
import { ChevronRight, ShoppingBag, AlertCircle, Heart, CheckCircle, Star, LucideIcon } from "lucide-react";

interface FeedItem {
    icon: LucideIcon;
    text: string;
    time: string;
    type: "success" | "warning" | "neutral";
}

const ACTIVITY: FeedItem[] = [
    { icon: ShoppingBag,  text: "John rented your Vintage Blazer for 7 days",           time: "2 hours ago", type: "success" },
    { icon: AlertCircle,  text: "Rental request for Silk co-ord set — awaiting approval", time: "5 hours ago", type: "warning" },
    { icon: Heart,        text: "Priya added your Suede jacket to wishlist",             time: "Yesterday",   type: "neutral" },
    { icon: CheckCircle,  text: "Payout of $48.40 sent to your wallet",                 time: "2 days ago",  type: "success" },
    { icon: Star,         text: "You received a 5-star review from Anita K.",            time: "3 days ago",  type: "warning" },
];

const iconColor: Record<string, string> = {
    success: "text-[#5E6B52]",
    warning: "text-[#AC1B18]",
    neutral: "text-[#8a8177]",
};

export default function DashboardActivityFeed() {
    return (
        <section>
            <div className="mb-4 flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.42em] text-[#81776c]">
                    Recent activity
                </p>
                <Link
                    href="/dashboard/activity"
                    className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#AC1B18] hover:underline"
                >
                    See all <ChevronRight size={11} />
                </Link>
            </div>

            <div className="border-2 border-[#d7cbbb] bg-white divide-y divide-[#e5ddd2]">
                {ACTIVITY.map(({ icon: Icon, text, time, type }) => (
                    <div key={text} className="flex items-start gap-4 px-5 py-4">
                        <div className="mt-0.5 shrink-0">
                            <Icon size={15} className={iconColor[type]} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-semibold text-[#2a1d18] leading-5">
                                {text}
                            </p>
                            <p className="mt-0.5 text-[11px] text-[#8a8177]">{time}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}