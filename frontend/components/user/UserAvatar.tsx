import Image from "next/image";
import type { AuthUser } from "@/lib/auth";

interface Props {
    user: AuthUser;
    size?: "sm" | "md" | "lg";
}

export default function UserAvatar({ user, size = "md" }: Props) {
    const cls =
        size === "sm"
            ? "h-9 w-9 text-sm"
            : size === "lg"
                ? "h-20 w-20 text-3xl"
                : "h-11 w-11 text-base";

    if (user.profilePictureUrl) {
        return (
            <div
                className={`relative ${cls} overflow-hidden rounded-full border-2 border-[#d7cbbb] shrink-0`}
            >
                <Image
                    src={user.profilePictureUrl}
                    alt={user.fullName}
                    fill
                    className="object-cover"
                    priority
                />
            </div>
        );
    }

    return (
        <div
            className={`${cls} flex items-center justify-center rounded-full border-2 border-[#d7cbbb] bg-[#fffaf2] font-black text-[#AC1B18] shrink-0`}
        >
            {user.fullName.charAt(0).toUpperCase()}
        </div>
    );
}