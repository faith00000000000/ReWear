"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
    AuthUser,
    isAuthenticated as checkAuth,
    getUser,
    clearTokens,
    updateStoredUser,
} from "@/lib/auth";

interface AuthContextType {
    authed: boolean;
    user: AuthUser | null;
    isMounted: boolean;
    refreshAuth: () => void;
    signOut: () => void;
    updateUser: (updates: Partial<AuthUser>) => void; // NEW
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
        setIsMounted(true);
        refreshAuth();

        // Picks up updateStoredUser()/saveSession()/clearTokens() calls —
        // including ones fired from other components (e.g. ProfileClient
        // after an avatar upload) — so the Navbar's UserAvatar re-renders
        // without needing a full page reload.
        function handleAuthChanged() {
            refreshAuth();
        }
        window.addEventListener("auth-changed", handleAuthChanged);
        return () => window.removeEventListener("auth-changed", handleAuthChanged);
    }, []);

    const signOut = () => {
        clearTokens();
        setAuthed(false);
        setUser(null);
    };

    // Merges into localStorage via updateStoredUser (which dispatches
    // "auth-changed"), then also updates local state immediately so this
    // component's own consumers (including the Navbar if it's the one
    // calling this) re-render without waiting on the event round-trip.
    const updateUser = (updates: Partial<AuthUser>) => {
        const updated = updateStoredUser(updates);
        if (updated) setUser(updated);
    };

    return (
        <AuthContext.Provider value={{ authed, user, isMounted, refreshAuth, signOut, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}