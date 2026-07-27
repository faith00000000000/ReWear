"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";

/* ─── Types ──────────────────────────────────────────────── */
export type FavoriteAvailability = "Available" | "Limited Dates" | "Unavailable" | "Sold";

export type FavoriteItem = {
    id: string;
    name: string;
    brand?: string;
    image: string;
    /** Fully formatted display price, e.g. "Rs. 6,000" or "Rs. 1,500 / day" */
    price: string;
    status: "THRIFT" | "RENT" | "THRIFT + RENT";
    /** Which context this was saved under — drives tab filtering + tag color on the saved page */
    category: "thrift" | "rent";
    size?: string;
    availability: FavoriteAvailability;
    /** Optional sub-label e.g. "Available in 4 days" / "Booked until May 25" */
    availabilityNote?: string;
    savedAt: number;
};

type FavoritesContextValue = {
    favorites: FavoriteItem[];
    isFavorite: (id: string) => boolean;
    /** Adds or removes the item. Returns true if it is now favorited, false if it was removed. */
    toggleFavorite: (item: Omit<FavoriteItem, "savedAt">) => boolean;
    removeFavorite: (id: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);
const STORAGE_KEY = "rewear:favorites";

export function FavoritesProvider({ children }: { children: ReactNode }) {
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
    const [hydrated, setHydrated] = useState(false);

    // Load once on mount (client-only — localStorage isn't available during SSR)
    useEffect(() => {
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            if (raw) setFavorites(JSON.parse(raw));
        } catch {
            // corrupted/blocked storage — start empty rather than crash
        }
        setHydrated(true);
    }, []);

    // Persist on every change, but only after the initial load above has run
    useEffect(() => {
        if (!hydrated) return;
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
        } catch {
            // storage full/unavailable — fail silently, in-memory state still works
        }
    }, [favorites, hydrated]);

    function isFavorite(id: string) {
        return favorites.some((f) => f.id === id);
    }

    function toggleFavorite(item: Omit<FavoriteItem, "savedAt">) {
        const alreadySaved = favorites.some((f) => f.id === item.id);

        if (alreadySaved) {
            setFavorites((prev) => prev.filter((f) => f.id !== item.id));
        } else {
            setFavorites((prev) => [{ ...item, savedAt: Date.now() }, ...prev]);
        }

        // We already know the outcome from current state, so we can return it
        // synchronously instead of waiting on the (batched) state update.
        return !alreadySaved;
    }

    function removeFavorite(id: string) {
        setFavorites((prev) => prev.filter((f) => f.id !== id));
    }

    return (
        <FavoritesContext.Provider
            value={{ favorites, isFavorite, toggleFavorite, removeFavorite }}
        >
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const ctx = useContext(FavoritesContext);
    if (!ctx) {
        throw new Error("useFavorites must be used within a <FavoritesProvider>");
    }
    return ctx;
}

/* ─── Shared helper — used by ProductDetailClient, ProductCard,
   and RentalCard so "Reserved"/etc. map to the same saved-page
   availability labels everywhere. ──────────────────────────── */
export function mapAvailability(value?: string): FavoriteAvailability {
    if (value === "Available") return "Available";
    if (value === "Reserved") return "Limited Dates";
    return "Unavailable";
}