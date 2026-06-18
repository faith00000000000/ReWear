import { TrendingUp, Coins, Package, CalendarClock, Heart } from "lucide-react";

const STATS = [
    {
        label: "Total earnings",
        value: "$1,240",
        trend: "+14% this month",
        trendUp: true,
        icon: Coins,
    },
    {
        label: "Active listings",
        value: "8",
        trend: "2 new this week",
        trendUp: true,
        icon: Package,
    },
    {
        label: "Pending requests",
        value: "2",
        trend: "Needs your review",
        trendUp: false,
        icon: CalendarClock,
    },
    {
        label: "Wishlist items",
        value: "14",
        trend: "3 price drops",
        trendUp: true,
        icon: Heart,
    },
];

export default function DashboardStats() {
    return (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {STATS.map(({ label, value, trend, trendUp, icon: Icon }) => (
                <div
                    key={label}
                    className="border-2 border-[#d7cbbb] bg-white p-5 space-y-3"
                >
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#81776c]">
                            {label}
                        </p>
                        <Icon size={15} className="text-[#AC1B18]" />
                    </div>
                    <p className="text-[28px] font-black leading-none text-[#1b1110] [font-family:Georgia,serif]">
                        {value}
                    </p>
                    <div className="flex items-center gap-1.5">
                        <TrendingUp
                            size={11}
                            className={trendUp ? "text-[#5E6B52]" : "text-[#AC1B18]"}
                        />
                        <p
                            className={`text-[11px] font-semibold ${
                                trendUp ? "text-[#5E6B52]" : "text-[#AC1B18]"
                            }`}
                        >
                            {trend}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}