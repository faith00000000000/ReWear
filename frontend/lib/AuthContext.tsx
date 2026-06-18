"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AuthUser, isAuthenticated as checkAuth, getUser, clearTokens } from "@/lib/auth";

interface AuthContextType {
    authed: boolean;
    user: AuthUser | null;
    isMounted: boolean;
    refreshAuth: () => void;
    signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [authed, setAuthed] = useState(false);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    const refreshAuth = () => {
        const ok = checkAuth();
        setAuthed(ok);
        setUser(ok ? getUser() : null);
    };

    useEffect(() => {
        // ── Dev-only: auto-clear stale localStorage on each new dev session ──
        if (process.env.NODE_ENV === "development") {
            const buildId = process.env.NEXT_PUBLIC_BUILD_ID ?? "dev";
            const storedBuildId = sessionStorage.getItem("buildId");

            if (storedBuildId !== buildId) {
                localStorage.clear();
                sessionStorage.setItem("buildId", buildId);
            }
        }

        setIsMounted(true);
        refreshAuth();
    }, []);

    const signOut = () => {
        clearTokens();
        setAuthed(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ authed, user, isMounted, refreshAuth, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}