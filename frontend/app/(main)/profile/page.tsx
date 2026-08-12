// app/profile/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

export default function MyProfileRedirect() {
    const { user, authed, isMounted } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isMounted) return; // wait until AuthProvider has checked localStorage
        if (authed && user) {
            router.replace(`/profile/${user.id}`);
        } else {
            router.replace("/login");
        }
    }, [user, authed, isMounted, router]);

    return null;
}