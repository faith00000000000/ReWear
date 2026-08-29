import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface AdminStatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    direction: "up" | "down";
  };
  accent?: boolean;
}

export default function AdminStatCard({
  label,
  value,
  icon: Icon,
  trend,
  accent = false,
}: AdminStatCardProps) {
  return (
    <div
      className={`rounded-xl border p-5 flex flex-col gap-4 ${
        accent
          ? "bg-[#A33214] border-[#A33214] text-[#FDF6EC]"
          : "bg-white/60 border-[#1C1C1C]/15 text-[#1C1C1C]"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`flex h-10 w-10 rounded-xl items-center justify-center ${
            accent
              ? "bg-[#FDF6EC] text-[#A33214]"
              : "bg-[#A33214] text-[#FDF6EC]"
          }`}
        >
          <Icon size={18} />
        </span>
        {trend && (
          <span
            className={`flex items-center gap-1 text-xs ${
              accent
                ? "text-[#FDF6EC]/80"
                : trend.direction === "up"
                  ? "text-green-700"
                  : "text-[#A33214]"
            }`}
          >
            {trend.direction === "up" ? (
              <ArrowUpRight size={14} />
            ) : (
              <ArrowDownRight size={14} />
            )}
            {trend.value}
          </span>
        )}
      </div>

      <div>
        <p
          className={`text-2xl sm:text-3xl ${
            accent ? "text-[#FDF6EC]" : "text-[#1C1C1C]"
          }`}
          style={{ fontFamily: "Georgia, serif" }}
        >
          {value}
        </p>
        <p
          className={`text-[11px] uppercase tracking-[0.14em] mt-1 ${
            accent ? "text-[#FDF6EC]/75" : "text-[#1C1C1C]/50"
          }`}
        >
          {label}
        </p>
      </div>
    </div>
  );
}
