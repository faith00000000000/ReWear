import Link from "next/link";
import { Pencil } from "lucide-react";
import type { AuthUser } from "@/lib/auth";
import UserAvatar from "@/components/user/UserAvatar";

export default function DashboardProfileCard({ user }: { user: AuthUser }) {
    return (
        <div className="border-2 border-[#d7cbbb] bg-white p-6 space-y-5">
            <p className="text-[10px] font-black uppercase tracking-[0.42em] text-[#81776c]">
                Your profile
            </p>

            {/* Avatar + name */}
            <div className="flex flex-col items-center gap-4 text-center">
                <UserAvatar user={user} size="lg" />
                <div>
                    <p className="text-[18px] font-black text-[#1b1110] [font-family:Georgia,serif]">
                        {user.fullName}
                    </p>
                    <p className="mt-1 text-[12px] text-[#8a8177] break-all">
                        {user.email}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 border border-[#d7cbbb] px-3 py-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5f5048]">
              Verified seller · Buyer
            </span>
                    </div>
                </div>
            </div>

            {/* Photo source notice */}
            {!user.profilePictureUrl ? (
                <div className="border border-dashed border-[#d7cbbb] bg-[#faf7f2] p-3 text-center">
                    <p className="text-[11px] text-[#8a8177] leading-5">
                        No profile photo yet.{" "}
                        <Link
                            href="/settings/profile"
                            className="font-bold text-[#AC1B18] underline underline-offset-2"
                        >
                            Upload one in settings
                        </Link>{" "}
                        or sign in with Google to sync your photo automatically.
                    </p>
                </div>
            ) : (
                <div className="border border-dashed border-[#5E6B52] bg-[#f5faf2] p-3 text-center">
                    <p className="text-[11px] text-[#5E6B52] font-semibold">
                        Profile photo synced from your Google account.
                    </p>
                </div>
            )}

            {/* Edit profile */}
            <Link
                href="/settings/profile"
                className="flex w-full items-center justify-center gap-2 border-2 border-[#d7cbbb] bg-white px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-[#5f5048] transition hover:border-[#AC1B18] hover:text-[#AC1B18]"
            >
                <Pencil size={13} />
                Edit profile
            </Link>
        </div>
    );
}