"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";

export type RecentlyViewedItem = {
    id: string;
    name: string;
    image: string;
    viewedAt: number;
};

type RecentlyViewedContextValue = {
    items: RecentlyViewedItem[];
    addRecentlyViewed: (item: Omit<RecentlyViewedItem, "viewedAt">) => void;
};

const RecentlyViewedContext = createContext<RecentlyViewedContextValue | null>(null);
const STORAGE_KEY = "rewear:recently-viewed";
const MAX_ITEMS = 8;

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<RecentlyViewedItem[]>([]);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            if (raw) setItems(JSON.parse(raw));
        } catch {
            // corrupted/blocked storage — start empty
        }
        setHydrated(true);
    }, []);

    useEffect(() => {
        if (!hydrated) return;
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch {
            // storage full/unavailable — in-memory state still works
        }
    }, [items, hydrated]);

    function addRecentlyViewed(item: Omit<RecentlyViewedItem, "viewedAt">) {
        setItems((prev) => {
            // move-to-front, de-duped, capped
            const rest = prev.filter((i) => i.id !== item.id);
            return [{ ...item, viewedAt: Date.now() }, ...rest].slice(0, MAX_ITEMS);
        });
    }

    return (
        <RecentlyViewedContext.Provider value={{ items, addRecentlyViewed }}>
            {children}
        </RecentlyViewedContext.Provider>
    );
}

export function useRecentlyViewed() {
    const ctx = useContext(RecentlyViewedContext);
    if (!ctx) throw new Error("useRecentlyViewed must be used within RecentlyViewedProvider");
    return ctx;
}